import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, useCallback } from "react";
import { Receipt, LayoutDashboard, FileSpreadsheet, CheckCircle2, History, FolderOpen, RefreshCw, Loader2, BarChart3, FileUp, FileCheck2, FileText, Check, AlertTriangle, Radio, Pause } from "lucide-react";
import { AppShell, PageHeader, StatCard } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useServerFn } from "@tanstack/react-start";
import { extractInvoice } from "@/lib/invoice-extract.functions";
import { supabase } from "@/integrations/supabase/client";
import { toINR, fmtMoney, normalizeCurrency } from "@/lib/fx";
import * as XLSX from "xlsx";


export const Route = createFileRoute("/_authenticated/cfo/invoices")({
  head: () => ({ meta: [{ title: "Invoices — FInsightZ" }] }),
  component: CFOInvoices,
});

const nav = [
  { label: "Overview", href: "/cfo", icon: LayoutDashboard },
  { label: "P&L Review", href: "/cfo/pnl", icon: FileSpreadsheet },
  { label: "Profitability", href: "/cfo/profitability", icon: BarChart3 },
  { label: "Invoices", href: "/cfo/invoices", icon: Receipt },
  { label: "Approvals", href: "/cfo/approvals", icon: CheckCircle2 },
  { label: "Audit Log", href: "/cfo/audit", icon: History },
];

type Kind = "client_issued" | "client_billing" | "vendor_received";

async function persistInvoice(kind: Kind, filename: string, fields: any) {
  const currency = normalizeCurrency(fields.currency);
  const amt = Number(fields.amount) || null;
  const { inr, rate } = toINR(amt, currency);
  // mutate fields so the row UI reflects the normalised currency + INR
  fields.currency = currency;
  fields.amount_inr = inr;
  fields.fx_rate = rate;

  const payload = {
    kind,
    source_filename: filename,
    invoice_number: fields.invoice_number ?? null,
    invoice_date:
      fields.invoice_date && /^\d{4}-\d{2}-\d{2}/.test(fields.invoice_date)
        ? String(fields.invoice_date).slice(0, 10)
        : null,
    party_name: fields.party_name ?? null,
    party_gstin: fields.party_gstin ?? null,
    currency,
    amount: amt,
    amount_inr: inr,
    fx_rate: rate,
    taxable_amount: Number(fields.taxable_amount) || null,
    gst_amount: Number(fields.gst_amount) || null,
    party_status: fields.status ?? null,
    cost_center: fields.cost_center ?? null,
    line_summary: fields.line_summary ?? null,
    raw_fields: fields,
  };
  const { data, error } = await supabase.from("invoices").insert(payload).select().single();
  if (error || !data) return null;
  const title =
    kind === "vendor_received"
      ? `Vendor invoice · ${fields.party_name ?? filename}`
      : `Client invoice · ${fields.party_name ?? filename}`;
  await supabase.from("approvals").insert({
    source_type: "invoice",
    source_id: data.id,
    title,
    submitter: kind === "vendor_received" ? "AP folder watcher" : "AR folder watcher",
    team: "Finance",
    amount: inr,            // INR-normalised — feeds dashboards
    amount_original: amt,   // original currency value
    currency,
    fx_rate: rate,
    summary: { ...fields, amount_inr: inr, fx_rate: rate, currency },
  });
  return data.id;
}

type Row = {
  id: string;
  filename: string;
  status: "scanning" | "extracted" | "saved" | "error";
  error?: string;
  fields: {
    invoice_number?: string;
    invoice_date?: string;
    party_name?: string;
    party_gstin?: string;
    currency?: string;
    amount?: number;
    amount_inr?: number | null;
    fx_rate?: number;
    taxable_amount?: number;
    gst_amount?: number;
    status?: string;
    cost_center?: string;
    line_summary?: string;
  };
};

const FOLDERS: { key: Kind; title: string; subtitle: string; hint: string; icon: any; tone: string }[] = [
  { key: "client_issued",   title: "Client invoices · raised by us",            subtitle: "Already-issued AR PDFs.",                       hint: "e.g. OneDrive/Finance/AR/Issued/2026", icon: FileCheck2, tone: "emerald" },
  { key: "client_billing",  title: "Client billing sheets · unbilled",          subtitle: "Billing Excels / CSV for unbilled work.",       hint: "e.g. SharePoint/Finance/AR/Unbilled",  icon: FileUp,     tone: "gold" },
  { key: "vendor_received", title: "Vendor invoices · raised on us",            subtitle: "AP inbox PDFs and scans from vendors.",         hint: "e.g. SharePoint/Finance/AP/Inbox/2026",icon: FileText,   tone: "primary" },
];

function fileToBase64(f: File): Promise<{ mime: string; b64: string }> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onerror = () => reject(r.error);
    r.onload = () => {
      const str = String(r.result || "");
      const comma = str.indexOf(",");
      resolve({ mime: f.type || "application/octet-stream", b64: comma >= 0 ? str.slice(comma + 1) : str });
    };
    r.readAsDataURL(f);
  });
}

async function parseExcelRows(f: File, baseId: string): Promise<Row[]> {
  const buf = await f.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, any>>(ws, { defval: null });
  const find = (r: Record<string, any>, keys: string[]) => {
    for (const k of Object.keys(r)) {
      const n = k.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (keys.some((q) => n.includes(q))) return r[k];
    }
    return undefined;
  };
  return rows.slice(0, 200).map((r, i) => ({
    id: `${baseId}#${i}`,
    filename: `${f.name} · row ${i + 1}`,
    status: "saved" as const,
    fields: {
      invoice_number: find(r, ["invoiceno", "billno", "invno"])?.toString(),
      invoice_date: find(r, ["date", "billdate"])?.toString(),
      party_name: find(r, ["client", "customer", "vendor", "party", "name"])?.toString(),
      party_gstin: find(r, ["gstin", "gstno"])?.toString(),
      currency: find(r, ["currency", "ccy"])?.toString(),
      amount: Number(find(r, ["amount", "total", "value", "grandtotal"]) ?? 0) || undefined,
      taxable_amount: Number(find(r, ["taxable", "basic", "subtotal"]) ?? 0) || undefined,
      gst_amount: Number(find(r, ["gst", "tax"]) ?? 0) || undefined,
      status: find(r, ["status"])?.toString(),
      cost_center: find(r, ["process", "costcenter", "project"])?.toString(),
      line_summary: find(r, ["description", "service", "particulars", "narration"])?.toString(),
    },
  }));
}

function fmtAmt(n?: number) {
  if (n == null || !Number.isFinite(n)) return "—";
  return `₹${new Intl.NumberFormat("en-IN").format(Math.round(n))}`;
}

function statusBadge(s?: string) {
  if (!s) return null;
  const n = s.toLowerCase();
  const cls = /paid|billed|posted/.test(n)
    ? "border-success/40 text-success"
    : /unbilled|unpaid|pending|overdue/.test(n)
    ? "border-warning/40 text-warning"
    : "border-border text-muted-foreground";
  return <Badge variant="outline" className={cls}>{s}</Badge>;
}

function SaveMark({ row }: { row: Row }) {
  if (row.status === "scanning")
    return <span title="Extracting…" className="inline-flex items-center gap-1 text-muted-foreground"><Loader2 className="w-3.5 h-3.5 animate-spin" /></span>;
  if (row.status === "error")
    return <span title={row.error ?? "Error"} className="inline-flex w-5 h-5 rounded-full bg-destructive/15 text-destructive items-center justify-center"><AlertTriangle className="w-3.5 h-3.5" /></span>;
  if (row.status === "saved" || row.status === "extracted")
    return <span title="Saved" className="inline-flex w-5 h-5 rounded-full bg-success/15 text-success items-center justify-center"><Check className="w-3.5 h-3.5" /></span>;
  return null;
}

function FolderZone({ cfg, rows, setRows }: { cfg: typeof FOLDERS[number]; rows: Row[]; setRows: React.Dispatch<React.SetStateAction<Row[]>> }) {
  const [dirHandle, setDirHandle] = useState<any>(null);
  const [folderName, setFolderName] = useState<string>("");
  const [watching, setWatching] = useState(false);
  const [busy, setBusy] = useState(false);
  const [lastScan, setLastScan] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const seenRef = useRef<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);
  const extract = useServerFn(extractInvoice);
  const Icon = cfg.icon;

  const inIframe = typeof window !== "undefined" && (() => { try { return window.self !== window.top; } catch { return true; } })();
  const fsAccessSupported = typeof window !== "undefined" && "showDirectoryPicker" in window && !inIframe;

  const processFile = useCallback(async (f: File, key: string, displayName: string) => {
    const id = `${cfg.key}-${key}`;
    const placeholder: Row = { id, filename: displayName, status: "scanning", fields: {} };
    setRows((prev) => [placeholder, ...prev]);

    if (/\.(xlsx|xls|csv)$/i.test(f.name)) {
      try {
        const extracted = await parseExcelRows(f, id);
        // persist each parsed row + queue an approval
        await Promise.all(extracted.map((r) => persistInvoice(cfg.key, r.filename, r.fields).catch(() => null)));
        setRows((prev) => [...extracted, ...prev.filter((r) => r.id !== id)]);
      } catch (e: any) {
        setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: "error", error: e?.message ?? "Parse failed" } : r)));
      }
      return;
    }
    try {
      const { mime, b64 } = await fileToBase64(f);
      const out = await extract({ data: { filename: f.name, mime, dataBase64: b64, kind: cfg.key } });
      let saved = out.ok;
      if (out.ok) {
        const dbId = await persistInvoice(cfg.key, f.name, out.fields ?? {});
        saved = !!dbId;
      }
      setRows((prev) => prev.map((r) => r.id === id
        ? { ...r, status: saved ? "saved" : "error", fields: out.fields ?? {}, error: saved ? undefined : "AI returned no fields" }
        : r));
    } catch (e: any) {
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: "error", error: e?.message ?? "Failed" } : r)));
    }
  }, [cfg.key, extract, setRows]);

  const processFiles = useCallback(async (files: File[]) => {
    setBusy(true); setError(null);
    const candidates = files.filter((f) => /\.(pdf|png|jpe?g|webp|xlsx|xls|csv)$/i.test(f.name));
    const tasks: Promise<void>[] = [];
    for (const f of candidates) {
      const rel = (f as any).webkitRelativePath || f.name;
      const key = `${rel}::${f.size}::${f.lastModified}`;
      if (seenRef.current.has(key)) continue;
      seenRef.current.add(key);
      tasks.push(processFile(f, key, rel));
    }
    await Promise.all(tasks);
    setLastScan(new Date());
    setBusy(false);
  }, [processFile]);

  const scanHandle = useCallback(async (handle: any) => {
    if (!handle) return;
    setBusy(true); setError(null);
    try {
      const files: File[] = [];
      for await (const [name, entry] of handle.entries()) {
        if (entry.kind !== "file") continue;
        const f: File = await entry.getFile();
        try { Object.defineProperty(f, "webkitRelativePath", { value: name, configurable: true }); } catch {}
        files.push(f);
      }
      await processFiles(files);
    } catch (e: any) {
      setError(e?.message ?? "Scan failed");
    } finally {
      setBusy(false);
    }
  }, [processFiles]);

  useEffect(() => {
    if (!watching || !dirHandle) return;
    scanHandle(dirHandle);
    const t = setInterval(() => scanHandle(dirHandle), 8000);
    return () => clearInterval(t);
  }, [watching, dirHandle, scanHandle]);

  const pickFolder = async () => {
    if (fsAccessSupported) {
      try {
        const h = await (window as any).showDirectoryPicker({ mode: "read" });
        seenRef.current = new Set();
        setDirHandle(h);
        setFolderName(h.name);
        setWatching(true);
        return;
      } catch (e: any) {
        if (e?.name === "AbortError") return;
        // fall through to webkitdirectory input
      }
    }
    inputRef.current?.click();
  };

  const onFolderInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length) return;
    const first = (files[0] as any).webkitRelativePath as string | undefined;
    const root = first?.split("/")[0] ?? "Selected folder";
    seenRef.current = new Set();
    setFolderName(root);
    setDirHandle(null);
    await processFiles(files);
  };

  const rescan = () => {
    if (dirHandle) scanHandle(dirHandle);
    else inputRef.current?.click();
  };

  return (
    <div className="glass rounded-2xl shadow-elevated">
      <div className="p-5 border-b border-border/60 flex flex-wrap items-start gap-4 justify-between">
        <div className="flex gap-3 min-w-0">
          <div className={`w-10 h-10 rounded-xl bg-${cfg.tone}/15 grid place-items-center shrink-0`}>
            <Icon className={`w-5 h-5 text-${cfg.tone}`} />
          </div>
          <div className="min-w-0">
            <h3 className="font-display font-semibold text-base">{cfg.title}</h3>
            <p className="text-xs text-muted-foreground max-w-xl">{cfg.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {watching && dirHandle ? (
            <Badge variant="outline" className="border-success/40 text-success gap-1"><Radio className="w-3 h-3 animate-pulse" /> Live</Badge>
          ) : folderName ? (
            <Badge variant="outline" className="border-warning/40 text-warning gap-1"><Pause className="w-3 h-3" /> Manual rescan</Badge>
          ) : (
            <Badge variant="outline" className="border-border text-muted-foreground gap-1"><Pause className="w-3 h-3" /> Idle</Badge>
          )}
          <Badge variant="outline" className="border-primary/40 text-primary">{rows.length} extracted</Badge>
        </div>
      </div>

      <div className="p-5 grid md:grid-cols-[1fr_auto_auto] gap-3 items-end border-b border-border/60">
        <div>
          <label className="text-[11px] uppercase tracking-widest text-muted-foreground">Monitored folder</label>
          <div className="mt-1 h-10 rounded-md border border-border/60 bg-background/40 px-3 flex items-center gap-2 text-sm">
            <FolderOpen className="w-4 h-4 text-muted-foreground" />
            {folderName ? (
              <>
                <span className="font-medium truncate">{folderName}</span>
                {lastScan && <span className="text-[11px] text-muted-foreground ml-auto">last scan {lastScan.toLocaleTimeString()}</span>}
              </>
            ) : (
              <span className="text-muted-foreground truncate">No folder linked — {cfg.hint}</span>
            )}
          </div>
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          // @ts-expect-error webkitdirectory is non-standard but widely supported
          webkitdirectory=""
          directory=""
          className="hidden"
          onChange={onFolderInput}
        />
        <Button variant="outline" onClick={pickFolder}>
          <FolderOpen className="w-4 h-4 mr-2" /> {folderName ? "Change folder" : "Link folder"}
        </Button>
        <Button onClick={rescan} disabled={!folderName}
          className="bg-[var(--gradient-emerald)] text-primary-foreground shadow-glow">
          {busy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Radio className="w-4 h-4 mr-2" />}
          {dirHandle ? "Re-scan now" : "Re-scan folder"}
        </Button>
      </div>

      {!fsAccessSupported && (
        <div className="mx-5 my-3 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-xs text-warning flex flex-wrap items-center gap-2">
          <span>Live folder watching is blocked inside the editor preview. Link a folder, then hit <b>Re-scan</b> — only new files get processed.</span>
          <a href={typeof window !== "undefined" ? window.location.href : "#"} target="_blank" rel="noreferrer" className="underline ml-auto">
            Open in new tab for continuous monitoring →
          </a>
        </div>
      )}
      {error && <div className="mx-5 my-3 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</div>}

      <div className="overflow-auto max-h-[420px]">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-card z-10">
            <tr className="text-left text-[10px] uppercase tracking-widest text-muted-foreground border-b border-border/60">
              <th className="px-4 py-2 w-8"></th>
              <th className="px-4 py-2">File / Source</th>
              <th className="px-3 py-2">Invoice #</th>
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2">{cfg.key === "vendor_received" ? "Vendor" : "Client"}</th>
              <th className="px-3 py-2">GSTIN</th>
              <th className="px-3 py-2 text-right">Taxable</th>
              <th className="px-3 py-2 text-right">GST</th>
              <th className="px-3 py-2 text-right">Total (orig)</th>
              <th className="px-3 py-2 text-right">Total in INR</th>
              <th className="px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {rows.length === 0 ? (
              <tr><td colSpan={11} className="px-4 py-10 text-center text-muted-foreground">
                {dirHandle ? "Watching folder — drop new files into it and they'll appear here." : "Link a folder above. FInsightZ will continuously watch it and auto-extract new invoices."}
              </td></tr>
            ) : rows.map((r) => {
              const ccy = r.fields.currency ?? "INR";
              const isForeign = ccy !== "INR";
              return (
              <tr key={r.id} className="hover:bg-card/30">
                <td className="px-4 py-2"><SaveMark row={r} /></td>
                <td className="px-4 py-2 max-w-[260px] truncate">
                  <div className="truncate">{r.filename}</div>
                  {r.status === "scanning" && <div className="text-[10px] text-muted-foreground">AI extracting…</div>}
                  {r.status === "error" && <div className="text-[10px] text-destructive">{r.error}</div>}
                </td>
                <td className="px-3 py-2 font-mono">{r.fields.invoice_number ?? "—"}</td>
                <td className="px-3 py-2">{r.fields.invoice_date ?? "—"}</td>
                <td className="px-3 py-2">{r.fields.party_name ?? "—"}</td>
                <td className="px-3 py-2 font-mono text-[10px]">{r.fields.party_gstin ?? "—"}</td>
                <td className="px-3 py-2 text-right tabular-nums">{fmtMoney(r.fields.taxable_amount, ccy)}</td>
                <td className="px-3 py-2 text-right tabular-nums">{fmtMoney(r.fields.gst_amount, ccy)}</td>
                <td className="px-3 py-2 text-right tabular-nums">
                  <div>{fmtMoney(r.fields.amount, ccy)}</div>
                  {isForeign && <div className="text-[10px] text-muted-foreground">{ccy}</div>}
                </td>
                <td className="px-3 py-2 text-right tabular-nums font-semibold">
                  <div>{fmtAmt(r.fields.amount_inr ?? (ccy === "INR" ? r.fields.amount : undefined))}</div>
                  {isForeign && r.fields.fx_rate && (
                    <div className="text-[10px] text-muted-foreground">@ ₹{r.fields.fx_rate.toFixed(2)}/{ccy}</div>
                  )}
                </td>
                <td className="px-3 py-2">{statusBadge(r.fields.status)}</td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CFOInvoices() {
  const [issued, setIssued] = useState<Row[]>([]);
  const [billing, setBilling] = useState<Row[]>([]);
  const [vendor, setVendor] = useState<Row[]>([]);

  const totals = (rs: Row[]) => rs.reduce((s, r) => s + (Number(r.fields.amount_inr ?? (r.fields.currency === "INR" || !r.fields.currency ? r.fields.amount : 0)) || 0), 0);

  return (
    <AppShell nav={nav}>
      <div className="p-6 md:p-10 max-w-7xl mx-auto">
        <PageHeader
          eyebrow="CFO · Invoices"
          title="Invoice Intelligence"
          subtitle="Link each folder once. FInsightZ continuously watches for new files and extracts them — a green tick means saved, a red ! means it needs attention."
          actions={
            <Button variant="outline" onClick={() => { setIssued([]); setBilling([]); setVendor([]); }}>
              <RefreshCw className="w-4 h-4 mr-2" /> Reset
            </Button>
          }
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="AR · Client invoices raised" value={fmtAmt(totals(issued))} accent="emerald" />
          <StatCard label="AR · Billing inputs (unbilled)" value={fmtAmt(totals(billing))} accent="gold" />
          <StatCard label="AP · Vendor invoices received" value={fmtAmt(totals(vendor))} />
          <StatCard label="Documents extracted" value={String(issued.length + billing.length + vendor.length)} />
        </div>

        <div className="grid gap-6">
          <FolderZone cfg={FOLDERS[0]} rows={issued} setRows={setIssued} />
          <FolderZone cfg={FOLDERS[1]} rows={billing} setRows={setBilling} />
          <FolderZone cfg={FOLDERS[2]} rows={vendor} setRows={setVendor} />
        </div>
      </div>
    </AppShell>
  );
}
