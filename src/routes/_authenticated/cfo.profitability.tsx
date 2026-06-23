import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { LayoutDashboard, FileSpreadsheet, Receipt, CheckCircle2, History, BarChart3, Upload, Loader2 } from "lucide-react";
import { AppShell, PageHeader, StatCard } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { parseFile, computeTotals, fmtINR, type ParsedPnl, type ProjectTotals } from "@/lib/pnl-parser";
import { saveMasterPnl, loadLatestPnl } from "@/lib/pnl-store";

export const Route = createFileRoute("/_authenticated/cfo/profitability")({
  head: () => ({ meta: [{ title: "Project-wise Profitability — FInsightZ" }] }),
  component: ProfitabilityPage,
});

const nav = [
  { label: "Overview", href: "/cfo", icon: LayoutDashboard },
  { label: "P&L Review", href: "/cfo/pnl", icon: FileSpreadsheet },
  { label: "Profitability", href: "/cfo/profitability", icon: BarChart3 },
  { label: "Invoices", href: "/cfo/invoices", icon: Receipt },
  { label: "Approvals", href: "/cfo/approvals", icon: CheckCircle2 },
  { label: "Audit Log", href: "/cfo/audit", icon: History },
];

const ROW_TEMPLATE: { label: string; key?: keyof ProjectTotals; group?: string; bold?: boolean; indent?: boolean; sub?: keyof ProjectTotals }[] = [
  { label: "A. Total Revenue", key: "A_revenue", bold: true },
  { label: "B. Direct Cost (COSR)", key: "B_total", bold: true },
  { label: "  · Fixed cost", key: "B_fixed", indent: true },
  { label: "  · Variable cost", key: "B_variable", indent: true },
  { label: "  · Manpower cost", key: "B_manpower", indent: true },
  { label: "G. Gross Margin (A − B)", key: "gross_margin", bold: true },
  { label: "C. Overheads", key: "C_overheads", bold: true },
  { label: "D. Financial Cost", key: "D_financial" },
  { label: "H. Operating Profit (A−B−C−D)", key: "operating_profit", bold: true },
  { label: "E. Depreciation", key: "E_depreciation" },
  { label: "I. Net Profit (H − E)", key: "net_profit", bold: true },
  { label: "FTE Billed", key: "fte_billed" },
  { label: "Revenue / FTE", key: "revenue_per_fte" },
  { label: "Gross Margin / FTE", key: "gm_per_fte" },
  { label: "Cost / FTE", key: "cost_per_fte" },
];

function ProfitabilityPage() {
  const [pnl, setPnl] = useState<ParsedPnl | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadLatestPnl().then((p) => { setPnl(p); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const totals = useMemo(() => (pnl ? computeTotals(pnl) : null), [pnl]);

  const onFile = async (f: File) => {
    setUploading(true); setError(null);
    try {
      const { pnl: parsed, sheetName } = await parseFile(f);
      if (!parsed) throw new Error("Could not detect a Project-wise Profitability sheet in this file.");
      await saveMasterPnl(f.name, parsed);
      setPnl(parsed);
      console.log("Saved sheet:", sheetName, "projects:", parsed.projects.length);
    } catch (e: any) {
      setError(e?.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <AppShell nav={nav}>
      <div className="p-6 md:p-10 max-w-[1400px] mx-auto">
        <PageHeader
          eyebrow="CFO · Profitability"
          title="Project-wise Profitability"
          subtitle="Live numbers reconstructed from the master P&L upload — segments, project columns, totals and per-FTE ratios."
          actions={
            <>
              <input ref={inputRef} type="file" accept=".xlsx,.xls" className="hidden"
                onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
              <Button onClick={() => inputRef.current?.click()} disabled={uploading}
                className="bg-[var(--gradient-emerald)] text-primary-foreground shadow-glow">
                {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                {pnl ? "Replace upload" : "Upload master P&L"}
              </Button>
            </>
          }
        />

        {error && (
          <div className="mb-4 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
        )}

        {loading ? (
          <div className="text-muted-foreground py-20 text-center"><Loader2 className="w-5 h-5 mx-auto animate-spin" /></div>
        ) : !pnl || !totals ? (
          <div className="glass rounded-2xl p-12 text-center shadow-elevated">
            <Upload className="w-10 h-10 mx-auto mb-3 text-primary" />
            <h3 className="font-display font-semibold text-lg">No profitability data yet</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mt-2">
              Upload your "Project-wise Report" Excel (the same template as <span className="font-mono">Profitability Apr-26</span>). FInsightZ will parse every project column, compute group totals and render the report below.
            </p>
            <Button className="mt-5" onClick={() => inputRef.current?.click()}>
              <Upload className="w-4 h-4 mr-2" /> Upload Excel
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard label="Total Revenue" value={fmtINR(totals.grand.A_revenue)} accent="emerald" />
              <StatCard label="Gross Margin" value={fmtINR(totals.grand.gross_margin)} delta={`${((totals.grand.gross_margin / Math.max(totals.grand.A_revenue, 1)) * 100).toFixed(1)}%`} />
              <StatCard label="Operating Profit" value={fmtINR(totals.grand.operating_profit)} accent="gold" />
              <StatCard label="Net Profit" value={fmtINR(totals.grand.net_profit)} />
              <StatCard label="Projects" value={String(pnl.projects.length)} />
              <StatCard label="FTE Billed" value={new Intl.NumberFormat("en-IN").format(Math.round(totals.grand.fte_billed))} />
              <StatCard label="Revenue / FTE" value={fmtINR(totals.grand.revenue_per_fte)} />
              <StatCard label="Cost / FTE" value={fmtINR(totals.grand.cost_per_fte)} />
            </div>

            <div className="glass rounded-2xl shadow-elevated overflow-hidden">
              <div className="px-6 py-4 border-b border-border/60 flex items-center justify-between">
                <div>
                  <h3 className="font-display font-semibold text-lg">Project-wise Report · {pnl.period || "Latest"}</h3>
                  <p className="text-xs text-muted-foreground">Scroll horizontally to see every project column · grouped by segment</p>
                </div>
                <Badge variant="outline" className="border-primary/40 text-primary">Live from upload</Badge>
              </div>
              <div className="overflow-auto max-h-[70vh]">
                <table className="text-xs">
                  <thead className="sticky top-0 bg-card z-10">
                    <tr>
                      <th className="text-left px-4 py-2 sticky left-0 bg-card z-20 border-r border-border min-w-[260px]">Particular</th>
                      <th className="text-right px-3 py-2 border-r border-border bg-primary/10 font-semibold whitespace-nowrap">Grand Total</th>
                      {Object.values(totals.bySegment).map((s) => (
                        <th key={s.code} className="text-right px-3 py-2 border-r border-border bg-card/60 font-semibold whitespace-nowrap">
                          {s.name} (total)
                        </th>
                      ))}
                      {totals.byProject.map((p) => (
                        <th key={p.code} className="text-right px-3 py-2 whitespace-nowrap font-medium text-muted-foreground">
                          <div className="text-foreground">{p.name}</div>
                          <div className="text-[10px] opacity-60">{p.code} · {p.segment}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ROW_TEMPLATE.map((row) => (
                      <tr key={row.label} className={row.bold ? "bg-primary/5 font-semibold" : ""}>
                        <td className={`px-4 py-2 sticky left-0 border-r border-border/60 ${row.bold ? "bg-primary/10" : "bg-card"} ${row.indent ? "text-muted-foreground pl-8" : ""}`}>
                          {row.label.trim()}
                        </td>
                        <td className="text-right px-3 py-2 border-r border-border bg-primary/5 tabular-nums">
                          {row.key ? fmtINR((totals.grand as any)[row.key]) : ""}
                        </td>
                        {Object.values(totals.bySegment).map((s) => (
                          <td key={s.code} className="text-right px-3 py-2 border-r border-border bg-card/40 tabular-nums">
                            {row.key ? fmtINR((s as any)[row.key]) : ""}
                          </td>
                        ))}
                        {totals.byProject.map((p) => (
                          <td key={p.code} className="text-right px-3 py-2 tabular-nums">
                            {row.key ? fmtINR((p as any)[row.key]) : ""}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {pnl.unmappedLabels.length > 0 && (
              <div className="mt-4 glass rounded-2xl p-4 shadow-elevated">
                <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Unmapped rows ({pnl.unmappedLabels.length})</div>
                <div className="flex flex-wrap gap-1.5">
                  {pnl.unmappedLabels.map((l) => (
                    <Badge key={l} variant="outline" className="text-[10px]">{l}</Badge>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
