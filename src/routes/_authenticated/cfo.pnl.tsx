import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { LayoutDashboard, FileSpreadsheet, Receipt, CheckCircle2, History, BarChart3, Download, Loader2, Upload } from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { loadLatestPnl } from "@/lib/pnl-store";
import { computeTotals, fmtINR, type ParsedPnl, type ProjectTotals, type ParsedMeta } from "@/lib/pnl-parser";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/cfo/pnl")({
  head: () => ({ meta: [{ title: "P&L Review — FInsightZ" }] }),
  component: PnLReview,
});

const nav = [
  { label: "Overview", href: "/cfo", icon: LayoutDashboard },
  { label: "P&L Review", href: "/cfo/pnl", icon: FileSpreadsheet },
  { label: "Profitability", href: "/cfo/profitability", icon: BarChart3 },
  { label: "Invoices", href: "/cfo/invoices", icon: Receipt },
  { label: "Approvals", href: "/cfo/approvals", icon: CheckCircle2 },
  { label: "Audit Log", href: "/cfo/audit", icon: History },
];

type Row =
  | { kind: "banner"; label: string; tone?: "blue" | "grey" | "yellow" | "orange" | "green" | "rose" }
  | { kind: "line"; label: string; line_key: string; indent?: boolean }
  | { kind: "total"; label: string; from: keyof ProjectTotals; tone?: "green" }
  | { kind: "meta"; label: string; metaKey: keyof ParsedMeta; tone?: "rose" }
  | { kind: "ratio"; label: string; from: keyof ProjectTotals; pct?: boolean; suffix?: string }
  | { kind: "spacer" }
  | { kind: "derived"; label: string; compute: "cosr_to_total"; pct?: boolean };

const TEMPLATE: Row[] = [
  { kind: "banner", label: "Particular", tone: "grey" },
  { kind: "line", label: "Revenue From Operations", line_key: "revenue_ops" },
  { kind: "line", label: "PRI-Reimbursment", line_key: "pri_reimb" },
  { kind: "line", label: "Incentive", line_key: "incentive_rev" },
  { kind: "line", label: "Mar Revenue variation", line_key: "rev_variation" },
  { kind: "total", label: "Total - A - REVENUE", from: "A_revenue", tone: "green" },
  { kind: "spacer" },
  { kind: "banner", label: "GST", tone: "orange" },
  { kind: "line", label: "GST", line_key: "gst" },
  { kind: "banner", label: "Net of Service Tax with PRI", tone: "yellow" },
  { kind: "spacer" },
  { kind: "banner", label: "Direct cost ( COSR )", tone: "grey" },
  { kind: "banner", label: "Fixed cost", tone: "orange" },
  { kind: "line", label: "Building rent", line_key: "rent", indent: true },
  { kind: "line", label: "Electricity charges", line_key: "electricity", indent: true },
  { kind: "line", label: "Water charges", line_key: "water", indent: true },
  { kind: "line", label: "Diesel", line_key: "diesel", indent: true },
  { kind: "line", label: "AMC for equipments", line_key: "amc", indent: true },
  { kind: "line", label: "Server rental", line_key: "server_rental", indent: true },
  { kind: "line", label: "Internet charges", line_key: "internet", indent: true },
  { kind: "banner", label: "Variable cost - Equipment and software - Total", tone: "orange" },
  { kind: "line", label: "Computer rental", line_key: "computer_rental", indent: true },
  { kind: "line", label: "Dialer Software", line_key: "dialer_sw", indent: true },
  { kind: "line", label: "Telephone Charges (used for outbound call & reimbursed by Cust)", line_key: "telephone", indent: true },
  { kind: "banner", label: "Manpower related", tone: "orange" },
  { kind: "line", label: "CTC - FTE", line_key: "ctc_fte", indent: true },
  { kind: "line", label: "CTC - TL", line_key: "ctc_tl", indent: true },
  { kind: "line", label: "CTC - Support Staff", line_key: "ctc_support", indent: true },
  { kind: "line", label: "CTC - QA & Trainer", line_key: "ctc_qa", indent: true },
  { kind: "line", label: "Incentives", line_key: "incentives_mp", indent: true },
  { kind: "line", label: "Outsourcing charges ( Transaction basis )", line_key: "outsourcing", indent: true },
  { kind: "line", label: "Transportation Charges / Travel", line_key: "travel", indent: true },
  { kind: "line", label: "Staff welfare ( coffee, cakes, incentives etc )", line_key: "staff_welfare", indent: true },
  { kind: "line", label: "Leave and gratuity provision", line_key: "leave_gratuity", indent: true },
  { kind: "line", label: "Stipend", line_key: "stipend", indent: true },
  { kind: "total", label: "Total - B - COSR", from: "B_total", tone: "green" },
  { kind: "spacer" },
  { kind: "banner", label: "Business development", tone: "orange" },
  { kind: "line", label: "CTC of business dev team", line_key: "oh_bd_ctc", indent: true },
  { kind: "line", label: "Website maintenance", line_key: "oh_web", indent: true },
  { kind: "line", label: "Seminar and events", line_key: "oh_seminar", indent: true },
  { kind: "line", label: "Business development travel", line_key: "oh_bd_travel", indent: true },
  { kind: "banner", label: "Others", tone: "orange" },
  { kind: "line", label: "CTC of corporate, finance, HR and admn", line_key: "oh_corp_ctc", indent: true },
  { kind: "line", label: "Building rent apportioned to above", line_key: "oh_rent_apport", indent: true },
  { kind: "line", label: "Travel and conveyance", line_key: "oh_travel", indent: true },
  { kind: "line", label: "Communication expenses ( Exclude reimbursed by customer )", line_key: "oh_comm", indent: true },
  { kind: "line", label: "House keeping expenses", line_key: "oh_housekeeping", indent: true },
  { kind: "line", label: "Security expenses", line_key: "oh_security", indent: true },
  { kind: "line", label: "Professional and legal fees", line_key: "oh_professional", indent: true },
  { kind: "line", label: "Other Admin expenses", line_key: "oh_other_admin", indent: true },
  { kind: "line", label: "Interest on delayed payment on GST + TDS", line_key: "oh_int_gst", indent: true },
  { kind: "line", label: "Interest on delayed pmt on PF and ESI", line_key: "oh_int_pf", indent: true },
  { kind: "line", label: "Festival Gift Expenses", line_key: "oh_festival", indent: true },
  { kind: "total", label: "Total - C - OVERHEADS", from: "C_overheads", tone: "green" },
  { kind: "spacer" },
  { kind: "line", label: "Financial Cost", line_key: "financial_cost" },
  { kind: "line", label: "Depreciation Cost", line_key: "depreciation" },
  { kind: "total", label: "OTHER COSTS - D+E+F", from: "D_plus_E" as any, tone: "green" },
  { kind: "spacer" },
  { kind: "banner", label: "PROFITABILITY", tone: "grey" },
  { kind: "total", label: "Gross Margin - G (A-B)", from: "gross_margin", tone: "green" },
  { kind: "total", label: "Operating Profit - H (A-B-C-D)", from: "operating_profit", tone: "green" },
  { kind: "total", label: "Net Profit - I (H-E-F)", from: "net_profit", tone: "green" },
  { kind: "spacer" },
  { kind: "total", label: "Total Expenses", from: "total_expenses" as any },
  { kind: "spacer" },
  { kind: "meta", label: "Total FTE Paid", metaKey: "fte_paid", tone: "rose" },
  { kind: "meta", label: "FTE Count Billed", metaKey: "fte_billed", tone: "rose" },
  { kind: "meta", label: "Total Count Billed", metaKey: "total_count_billed", tone: "rose" },
  { kind: "meta", label: "Seat Utilized", metaKey: "seat_utilized", tone: "rose" },
  { kind: "spacer" },
  { kind: "banner", label: "RATIOS:", tone: "grey" },
  { kind: "ratio", label: "Revenue per FTE", from: "revenue_per_fte" },
  { kind: "ratio", label: "Gross Margin per FTE", from: "gm_per_fte" },
  { kind: "ratio", label: "Cost per FTE", from: "cost_per_fte" },
  { kind: "ratio", label: "COSR per FTE", from: "cosr_per_fte" as any },
  { kind: "derived", label: "COSR to Total Cost (B)/(B+C)", compute: "cosr_to_total", pct: true },
];

const TONE: Record<string, string> = {
  blue: "bg-sky-500/20 text-sky-200",
  grey: "bg-muted/40 text-foreground",
  yellow: "bg-yellow-500/20 text-yellow-200",
  orange: "bg-orange-500/20 text-orange-200",
  green: "bg-emerald-500/15 text-emerald-200",
  rose: "bg-rose-500/15 text-rose-200",
};

type CellValue = { value: number | null; isMoney: boolean; isPct?: boolean };

function buildLineLookup(pnl: ParsedPnl) {
  // project_code -> line_key -> sum
  const map = new Map<string, Map<string, number>>();
  for (const l of pnl.lines) {
    if (!map.has(l.project_code)) map.set(l.project_code, new Map());
    const m = map.get(l.project_code)!;
    m.set(l.line_key, (m.get(l.line_key) ?? 0) + (l.amount ?? 0));
  }
  return map;
}

function sumLine(lookup: Map<string, Map<string, number>>, codes: string[], key: string): number {
  let s = 0;
  for (const c of codes) s += lookup.get(c)?.get(key) ?? 0;
  return s;
}

function metaSum(metas: ParsedMeta[], codes: Set<string>, key: keyof ParsedMeta): number {
  let s = 0;
  for (const m of metas) if (codes.has(m.project_code)) s += Number((m as any)[key] ?? 0);
  return s;
}

function PnLReview() {
  const [pnl, setPnl] = useState<ParsedPnl | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLatestPnl().then((p) => { setPnl(p); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const totals = useMemo(() => (pnl ? computeTotals(pnl) : null), [pnl]);
  const lookup = useMemo(() => (pnl ? buildLineLookup(pnl) : null), [pnl]);

  // Compute synthesized fields per ProjectTotals-like object
  function enhance(t: ProjectTotals, codes: string[], metas: ParsedMeta[]): any {
    const D_plus_E = t.D_financial + t.E_depreciation;
    const total_expenses = t.B_total + t.C_overheads + D_plus_E;
    const f = t.fte_billed || t.fte_paid || 0;
    const cosr_per_fte = f ? t.B_total / f : 0;
    return { ...t, D_plus_E, total_expenses, cosr_per_fte };
  }

  return (
    <AppShell nav={nav}>
      <div className="p-6 md:p-10 max-w-[1600px] mx-auto">
        <PageHeader
          eyebrow="CFO · P&L"
          title={`Project-wise Report${pnl?.period ? " · " + pnl.period : ""}`}
          subtitle="Master P&L mirroring the finance template — Revenue, COSR, Overheads, Profitability, FTE counts and Ratios per project and segment."
          actions={
            <>
              <Button variant="outline"><Download className="w-4 h-4 mr-2" /> Export Excel</Button>
              <Link to="/cfo/profitability">
                <Button className="bg-[var(--gradient-emerald)] text-primary-foreground shadow-glow">
                  <Upload className="w-4 h-4 mr-2" /> Upload / Replace master
                </Button>
              </Link>
            </>
          }
        />

        {loading ? (
          <div className="text-center py-20 text-muted-foreground"><Loader2 className="w-5 h-5 mx-auto animate-spin" /></div>
        ) : !pnl || !totals || !lookup ? (
          <div className="glass rounded-2xl p-12 text-center shadow-elevated">
            <FileSpreadsheet className="w-10 h-10 mx-auto mb-3 text-primary" />
            <h3 className="font-display font-semibold text-lg">No P&L uploaded yet</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mt-2">
              Upload your "Project-wise Report" Excel from the Profitability page to populate this review.
            </p>
            <Link to="/cfo/profitability"><Button className="mt-5"><Upload className="w-4 h-4 mr-2" /> Go to upload</Button></Link>
          </div>
        ) : (
          <div className="glass rounded-2xl shadow-elevated overflow-hidden">
            <div className="px-6 py-4 border-b border-border/60 flex items-center justify-between">
              <div>
                <h3 className="font-display font-semibold text-lg">Project-wise Report {pnl.period && `· ${pnl.period}`}</h3>
                <p className="text-xs text-muted-foreground">Scroll horizontally for all projects · sticky line items on the left</p>
              </div>
              <Badge variant="outline" className="border-primary/40 text-primary">Live from upload</Badge>
            </div>
            <div className="overflow-auto max-h-[78vh]">
              <table className="text-xs">
                <thead className="sticky top-0 z-20 bg-card">
                  <tr>
                    <th className="text-left px-4 py-3 sticky left-0 bg-card z-30 border-r border-border min-w-[320px]">Particular</th>
                    <th className="text-right px-3 py-3 border-r border-border bg-primary/10 font-semibold whitespace-nowrap min-w-[110px]">Grand Total</th>
                    {Object.values(totals.bySegment).map((s) => (
                      <th key={s.code} className="text-right px-3 py-3 border-r border-border bg-card/60 font-semibold whitespace-nowrap min-w-[110px]">
                        {s.name}
                        <div className="text-[10px] opacity-60 font-normal">Total</div>
                      </th>
                    ))}
                    {totals.byProject.map((p) => (
                      <th key={p.code} className="text-right px-3 py-3 whitespace-nowrap font-medium min-w-[110px]">
                        <div className="text-foreground">{p.name}</div>
                        <div className="text-[10px] opacity-60 font-normal">{p.code} · {p.segment}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TEMPLATE.map((row, ri) => {
                    if (row.kind === "spacer") {
                      return (
                        <tr key={ri}>
                          <td colSpan={2 + Object.keys(totals.bySegment).length + totals.byProject.length} className="h-2 bg-background/40" />
                        </tr>
                      );
                    }
                    if (row.kind === "banner") {
                      const cls = TONE[row.tone ?? "grey"];
                      return (
                        <tr key={ri}>
                          <td colSpan={2 + Object.keys(totals.bySegment).length + totals.byProject.length}
                              className={`px-4 py-2 font-semibold uppercase tracking-wide text-[11px] ${cls}`}>
                            {row.label}
                          </td>
                        </tr>
                      );
                    }

                    const allCodes = totals.byProject.map((p) => p.code);
                    const grandObj = enhance(totals.grand, allCodes, pnl.meta);
                    const segObjs = Object.values(totals.bySegment).map((s) => {
                      const codes = totals.byProject.filter((p) => (p.segment || "Other") === s.name).map((p) => p.code);
                      return { seg: s, obj: enhance(s, codes, pnl.meta), codes };
                    });

                    const cellFor = (kind: "grand" | "seg" | "proj", segIdx?: number, projCode?: string) => {
                      if (row.kind === "line") {
                        if (kind === "grand") return sumLine(lookup, allCodes, row.line_key);
                        if (kind === "seg") return sumLine(lookup, segObjs[segIdx!].codes, row.line_key);
                        return lookup.get(projCode!)?.get(row.line_key) ?? 0;
                      }
                      if (row.kind === "total") {
                        const obj = kind === "grand" ? grandObj : kind === "seg" ? segObjs[segIdx!].obj : enhance(totals.byProject.find((p) => p.code === projCode)!, [projCode!], pnl.meta);
                        return Number(obj[row.from as any] ?? 0);
                      }
                      if (row.kind === "ratio") {
                        const obj = kind === "grand" ? grandObj : kind === "seg" ? segObjs[segIdx!].obj : enhance(totals.byProject.find((p) => p.code === projCode)!, [projCode!], pnl.meta);
                        return Number(obj[row.from as any] ?? 0);
                      }
                      if (row.kind === "meta") {
                        if (kind === "grand") return metaSum(pnl.meta, new Set(allCodes), row.metaKey);
                        if (kind === "seg") return metaSum(pnl.meta, new Set(segObjs[segIdx!].codes), row.metaKey);
                        const m = pnl.meta.find((x) => x.project_code === projCode);
                        return Number((m as any)?.[row.metaKey] ?? 0);
                      }
                      if (row.kind === "derived") {
                        const obj = kind === "grand" ? grandObj : kind === "seg" ? segObjs[segIdx!].obj : enhance(totals.byProject.find((p) => p.code === projCode)!, [projCode!], pnl.meta);
                        const b = Number(obj.B_total ?? 0), c = Number(obj.C_overheads ?? 0);
                        return b + c > 0 ? b / (b + c) : 0;
                      }
                      return 0;
                    };

                    const fmtCell = (v: number) => {
                      if (row.kind === "meta") return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(v);
                      if (row.kind === "derived" || (row.kind === "ratio" && (row as any).pct)) return `${(v * 100).toFixed(1)}%`;
                      return fmtINR(v);
                    };

                    const isBold = row.kind === "total";
                    const rowTone = (row as any).tone as string | undefined;
                    const rowBg = rowTone ? TONE[rowTone] : isBold ? "bg-primary/5 font-semibold" : "";
                    const labelIndent = row.kind === "line" && row.indent ? "pl-8 text-muted-foreground" : "";

                    return (
                      <tr key={ri} className={`${rowBg} border-b border-border/40`}>
                        <td className={`px-4 py-1.5 sticky left-0 border-r border-border/60 ${rowBg || "bg-card"} ${isBold ? "font-semibold" : ""} ${labelIndent}`}>
                          {row.label}
                        </td>
                        <td className="text-right px-3 py-1.5 border-r border-border bg-primary/5 tabular-nums">
                          {fmtCell(cellFor("grand") as number)}
                        </td>
                        {segObjs.map((s, idx) => (
                          <td key={s.seg.code} className="text-right px-3 py-1.5 border-r border-border bg-card/40 tabular-nums">
                            {fmtCell(cellFor("seg", idx) as number)}
                          </td>
                        ))}
                        {totals.byProject.map((p) => (
                          <td key={p.code} className="text-right px-3 py-1.5 tabular-nums">
                            {fmtCell(cellFor("proj", undefined, p.code) as number)}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
