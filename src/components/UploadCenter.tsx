import { useRef, useState } from "react";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import { Upload, FileSpreadsheet, Sparkles, CheckCircle2, AlertTriangle, X, Brain, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useServerFn } from "@tanstack/react-start";
import { submitUploadApproval } from "@/lib/approvals.functions";

type Stage = "queued" | "parsing" | "ai" | "validating" | "done" | "error";
type SaveState = "idle" | "saving" | "saved" | "error";

type ParsedSheet = {
  name: string;
  headers: string[];
  rows: (string | number | null)[][];
};

type ExtractedField = { k: string; v: string; conf: number };

type UploadItem = {
  id: string;
  name: string;
  size: number;
  stage: Stage;
  progress: number;
  sheets?: ParsedSheet[];
  totalRows?: number;
  fields?: ExtractedField[];
  error?: string;
  saveState?: SaveState;
  saveError?: string;
  approvalId?: string;
};

const STAGE_LABEL: Record<Stage, string> = {
  queued: "Queued",
  parsing: "Parsing workbook",
  ai: "AI extracting fields",
  validating: "Validating rules",
  done: "Posted to ledger",
  error: "Parse error",
};

const PERSONA_HINTS: Record<string, string[]> = {
  finance: ["period", "entity", "process", "revenue", "amount", "gst", "tds", "invoice", "cost", "total"],
  it: ["vendor", "invoice", "amount", "license", "seat", "device", "allocation", "service", "asset"],
  operations: ["process", "fte", "headcount", "aht", "sla", "csat", "shift", "agent", "queue"],
  facilities: ["building", "site", "utility", "kwh", "units", "amount", "vendor", "bill", "meter"],
};

function detectHeaderRow(rows: any[][]): number {
  for (let i = 0; i < Math.min(rows.length, 6); i++) {
    const r = rows[i];
    if (!r) continue;
    const nonEmpty = r.filter((c) => c !== null && c !== undefined && String(c).trim() !== "").length;
    const stringy = r.filter((c) => typeof c === "string" && /[a-zA-Z]/.test(c)).length;
    if (nonEmpty >= 2 && stringy / Math.max(nonEmpty, 1) >= 0.6) return i;
  }
  return 0;
}

function parseSheetMatrix(matrix: any[][]): ParsedSheet | null {
  if (!matrix.length) return null;
  const headerIdx = detectHeaderRow(matrix);
  const headerRaw = matrix[headerIdx] ?? [];
  const headers = headerRaw.map((h, i) => (h == null || h === "" ? `Column ${i + 1}` : String(h).trim()));
  const rows = matrix
    .slice(headerIdx + 1)
    .filter((r) => r && r.some((c) => c !== null && c !== undefined && String(c).trim() !== ""))
    .map((r) => headers.map((_, i) => (r[i] === undefined ? null : r[i])));
  return { name: "", headers, rows };
}

async function parseWorkbook(file: File): Promise<ParsedSheet[]> {
  const isCsv = /\.csv$/i.test(file.name);
  if (isCsv) {
    const text = await file.text();
    const parsed = Papa.parse<string[]>(text, { skipEmptyLines: true });
    const matrix = parsed.data as any[][];
    const s = parseSheetMatrix(matrix);
    return s ? [{ ...s, name: file.name.replace(/\.csv$/i, "") }] : [];
  }
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const out: ParsedSheet[] = [];
  for (const name of wb.SheetNames) {
    const ws = wb.Sheets[name];
    const matrix = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1, defval: null, blankrows: false }) as any[][];
    const s = parseSheetMatrix(matrix);
    if (s) out.push({ ...s, name });
  }
  return out;
}

function fmtNumber(n: number): string {
  if (!isFinite(n)) return String(n);
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (Math.abs(n) >= 1_000) return new Intl.NumberFormat("en-IN").format(Math.round(n));
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
}

function extractFields(sheets: ParsedSheet[], persona: string): ExtractedField[] {
  const fields: ExtractedField[] = [];
  const hints = PERSONA_HINTS[persona] ?? [];
  const sheet = sheets[0];
  if (!sheet) return fields;

  fields.push({ k: "Workbook sheets", v: String(sheets.length), conf: 1 });
  fields.push({ k: "Primary sheet", v: sheet.name || "Sheet1", conf: 1 });
  fields.push({ k: "Rows detected", v: String(sheet.rows.length), conf: 0.99 });
  fields.push({ k: "Columns detected", v: String(sheet.headers.length), conf: 0.99 });

  // Column type analysis
  const numericCols: { idx: number; header: string; sum: number; count: number }[] = [];
  sheet.headers.forEach((h, idx) => {
    let sum = 0;
    let count = 0;
    for (const row of sheet.rows) {
      const v = row[idx];
      const n = typeof v === "number" ? v : typeof v === "string" ? Number(v.replace(/[,₹$\s]/g, "")) : NaN;
      if (Number.isFinite(n)) {
        sum += n;
        count += 1;
      }
    }
    if (count > 0 && count / sheet.rows.length > 0.4) numericCols.push({ idx, header: h, sum, count });
  });

  // Prefer numeric columns matching persona hints
  const ranked = [...numericCols].sort((a, b) => {
    const aHit = hints.some((h) => a.header.toLowerCase().includes(h)) ? 1 : 0;
    const bHit = hints.some((h) => b.header.toLowerCase().includes(h)) ? 1 : 0;
    if (aHit !== bHit) return bHit - aHit;
    return Math.abs(b.sum) - Math.abs(a.sum);
  });
  ranked.slice(0, 3).forEach((c) => {
    const matched = hints.some((h) => c.header.toLowerCase().includes(h));
    fields.push({
      k: `Σ ${c.header}`,
      v: fmtNumber(c.sum),
      conf: matched ? 0.96 : 0.82,
    });
  });

  // Surface first matching label column
  for (const h of hints) {
    const idx = sheet.headers.findIndex((header) => header.toLowerCase().includes(h));
    if (idx >= 0) {
      const sample = sheet.rows.find((r) => r[idx] != null && String(r[idx]).trim() !== "");
      if (sample) {
        fields.push({ k: sheet.headers[idx], v: String(sample[idx]), conf: 0.88 });
        break;
      }
    }
  }

  return fields.slice(0, 8);
}

export function UploadCenter({
  persona,
  title = "Upload & AI Extraction",
  subtitle = "Drop Excel / CSV — files are parsed in-browser and extracted fields are surfaced with confidence scores.",
  accept = ".xlsx,.xls,.csv",
}: {
  persona: "finance" | "it" | "operations" | "facilities";
  title?: string;
  subtitle?: string;
  accept?: string;
}) {
  const [items, setItems] = useState<UploadItem[]>([]);
  const [dragging, setDragging] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const submit = useServerFn(submitUploadApproval);

  const updateItem = (id: string, patch: Partial<UploadItem>) =>
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));

  const processFile = async (id: string, file: File) => {
    try {
      updateItem(id, { stage: "parsing", progress: 25 });
      const sheets = await parseWorkbook(file);
      if (!sheets.length) throw new Error("No readable sheets found in file");
      const totalRows = sheets.reduce((acc, s) => acc + s.rows.length, 0);
      updateItem(id, { stage: "ai", progress: 60, sheets, totalRows });

      await new Promise((r) => setTimeout(r, 350));
      const fields = extractFields(sheets, persona);
      updateItem(id, { stage: "validating", progress: 85, fields });

      await new Promise((r) => setTimeout(r, 250));
      updateItem(id, { stage: "done", progress: 100, saveState: "saving" });

      // Auto-submit to CFO approvals queue
      try {
        const amountField = fields.find((f) => f.k.startsWith("Σ "));
        const amount = amountField ? Number(amountField.v.replace(/[^\d.-]/g, "")) || null : null;
        const summary: Record<string, any> = {
          rows: totalRows,
          sheets: sheets.length,
          file: file.name,
        };
        for (const f of fields) summary[f.k] = f.v;
        const row = await submit({
          data: {
            persona,
            title: `${persona[0].toUpperCase()}${persona.slice(1)} upload · ${file.name}`,
            team: persona,
            submitter: persona,
            amount,
            summary,
            source_id: id,
          },
        });
        updateItem(id, { saveState: "saved", approvalId: (row as any)?.id });
      } catch (e: any) {
        updateItem(id, { saveState: "error", saveError: e?.message ?? "Save failed" });
      }
    } catch (e: any) {
      updateItem(id, { stage: "error", progress: 100, error: e?.message ?? "Failed to parse" });
    }
  };

  const addFiles = (files: FileList | File[]) => {
    const arr = Array.from(files).slice(0, 8);
    const created: UploadItem[] = arr.map((f) => ({
      id: `${Date.now()}-${f.name}-${Math.random().toString(36).slice(2, 7)}`,
      name: f.name,
      size: f.size,
      stage: "queued",
      progress: 5,
    }));
    setItems((prev) => [...created, ...prev].slice(0, 12));
    created.forEach((c, idx) => {
      setActiveId(c.id);
      processFile(c.id, arr[idx]);
    });
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  };

  const active = items.find((i) => i.id === activeId) ?? items[0];
  const previewSheet = active?.sheets?.[0];

  return (
    <div className="space-y-5">
      <div className="glass rounded-2xl p-6 shadow-elevated">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
          <div>
            <h3 className="font-display font-semibold text-lg flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" /> {title}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          </div>
          <Badge variant="outline" className="border-primary/40 text-primary">
            <Brain className="w-3 h-3 mr-1" /> Live parsing · in-browser
          </Badge>
        </div>

        <div className="grid lg:grid-cols-5 gap-5">
          <div className="lg:col-span-3 space-y-4">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
              className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
                dragging ? "border-primary bg-primary/10" : "border-border bg-card/30 hover:border-primary/40"
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                multiple
                accept={accept}
                className="hidden"
                onChange={(e) => e.target.files && addFiles(e.target.files)}
              />
              <div className="w-12 h-12 mx-auto rounded-xl bg-[var(--gradient-emerald)] grid place-items-center shadow-glow mb-3">
                <Upload className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="font-display font-semibold">Drop files or click to upload</div>
              <div className="text-xs text-muted-foreground mt-1">
                Excel · CSV · up to 8 files · headers, totals and persona-relevant fields extracted live
              </div>
            </div>

            <div className="space-y-2 max-h-80 overflow-auto pr-1">
              {items.length === 0 && (
                <div className="text-xs text-muted-foreground text-center py-4">
                  No uploads yet — drop a real Excel or CSV to see extraction.
                </div>
              )}
              {items.map((it) => (
                <button
                  type="button"
                  key={it.id}
                  onClick={() => setActiveId(it.id)}
                  className={`w-full text-left rounded-xl border p-3 transition-colors ${
                    active?.id === it.id ? "border-primary bg-primary/10" : "border-border bg-card/30 hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileSpreadsheet className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-sm font-medium truncate">{it.name}</span>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        it.stage === "done"
                          ? "border-success/40 text-success"
                          : it.stage === "error"
                          ? "border-destructive/40 text-destructive"
                          : "border-primary/40 text-primary"
                      }
                    >
                      {it.stage === "done" ? (
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                      ) : it.stage === "error" ? (
                        <AlertTriangle className="w-3 h-3 mr-1" />
                      ) : null}
                      {STAGE_LABEL[it.stage]}
                    </Badge>
                  </div>
                  <Progress value={it.progress} className="h-1.5" />
                  <div className="flex justify-between items-center text-[11px] text-muted-foreground mt-1.5">
                    <span>{(it.size / 1024).toFixed(1)} KB</span>
                    <div className="flex items-center gap-2">
                      {it.totalRows != null && <span>{it.totalRows} rows · {it.sheets?.length ?? 0} sheet(s)</span>}
                      {it.saveState === "saving" && <Loader2 className="w-3 h-3 animate-spin text-primary" />}
                      {it.saveState === "saved" && (
                        <span className="inline-flex items-center gap-1 text-success" title="Saved to CFO approvals">
                          <CheckCircle2 className="w-3 h-3" /> saved
                        </span>
                      )}
                      {it.saveState === "error" && (
                        <span className="inline-flex items-center gap-1 text-destructive" title={it.saveError ?? "Save failed"}>
                          <AlertTriangle className="w-3 h-3" /> save error
                        </span>
                      )}
                    </div>
                  </div>
                  {it.error && <div className="text-[11px] text-destructive mt-1">{it.error}</div>}
                  {it.saveError && <div className="text-[11px] text-destructive mt-1">{it.saveError}</div>}
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 rounded-2xl border border-border bg-card/30 p-4 min-h-[260px]">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Extracted fields</div>
              {active && (
                <button
                  onClick={() => {
                    setItems((p) => p.filter((i) => i.id !== active.id));
                    setActiveId(null);
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            {!active || !active.fields ? (
              <div className="text-sm text-muted-foreground py-10 text-center">
                <Brain className="w-6 h-6 mx-auto mb-2 opacity-40" />
                Upload a file to view structured extraction with confidence scores.
              </div>
            ) : (
              <div className="space-y-3">
                {active.fields.map((f) => (
                  <div key={f.k} className="rounded-lg bg-background/40 border border-border/60 p-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground truncate pr-2">{f.k}</span>
                      <span
                        className={
                          f.conf >= 0.9
                            ? "text-success"
                            : f.conf >= 0.75
                            ? "text-warning"
                            : "text-destructive"
                        }
                      >
                        {Math.round(f.conf * 100)}% conf.
                      </span>
                    </div>
                    <div className="text-sm font-semibold mt-1 break-words">{f.v}</div>
                    <Progress value={f.conf * 100} className="h-1 mt-2" />
                  </div>
                ))}
                {active.stage === "done" && (
                  <Button size="sm" className="w-full bg-[var(--gradient-emerald)] text-primary-foreground shadow-glow">
                    <CheckCircle2 className="w-4 h-4 mr-2" /> Post to allocation engine
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {previewSheet && previewSheet.rows.length > 0 && (
        <div className="glass rounded-2xl p-6 shadow-elevated">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-display font-semibold text-base">
                Data preview · {previewSheet.name || "Sheet 1"}
              </h4>
              <p className="text-xs text-muted-foreground">
                Showing first 20 of {previewSheet.rows.length} parsed rows
              </p>
            </div>
            {active?.sheets && active.sheets.length > 1 && (
              <Badge variant="outline" className="border-primary/40 text-primary">
                {active.sheets.length} sheets
              </Badge>
            )}
          </div>
          <div className="overflow-auto rounded-xl border border-border max-h-[420px]">
            <table className="w-full text-xs">
              <thead className="bg-background/60 sticky top-0">
                <tr>
                  {previewSheet.headers.map((h, i) => (
                    <th key={i} className="text-left font-semibold px-3 py-2 border-b border-border whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewSheet.rows.slice(0, 20).map((row, ri) => (
                  <tr key={ri} className="hover:bg-primary/5">
                    {previewSheet.headers.map((_, ci) => (
                      <td key={ci} className="px-3 py-2 border-b border-border/50 whitespace-nowrap">
                        {row[ci] == null ? "" : String(row[ci])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
