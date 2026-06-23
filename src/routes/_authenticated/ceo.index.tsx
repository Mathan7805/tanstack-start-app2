import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { TrendingUp, Building2, IndianRupee } from "lucide-react";
import { AppShell, PageHeader, StatCard } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { approvedSpendByTeam, approvedInvoiceTotals } from "@/lib/approvals.functions";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart,
  PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis, Legend, Treemap,
} from "recharts";
import { ceoNav as nav } from "./ceo";

export const Route = createFileRoute("/_authenticated/ceo/")({
  head: () => ({ meta: [{ title: "CEO Dashboard — FInsightZ" }] }),
  component: CEODashboard,
});

const PALETTE = [
  "oklch(0.72 0.16 162)", "oklch(0.78 0.13 85)", "oklch(0.65 0.18 200)",
  "oklch(0.68 0.14 320)", "oklch(0.74 0.15 30)",
];

const ebitdaByPeriod: Record<"TTM" | "YTD", { p: string; rev: number; ebitda: number; net: number }[]> = {
  TTM: [
    { p: "Q1'24", rev: 1480, ebitda: 312, net: 248 },
    { p: "Q2'24", rev: 1562, ebitda: 348, net: 281 },
    { p: "Q3'24", rev: 1635, ebitda: 372, net: 298 },
    { p: "Q4'24", rev: 1714, ebitda: 401, net: 322 },
    { p: "Q1'25", rev: 1802, ebitda: 438, net: 351 },
    { p: "Q2'25", rev: 1884, ebitda: 471, net: 378 },
  ],
  YTD: [
    { p: "Apr", rev: 612, ebitda: 148, net: 118 },
    { p: "May", rev: 628, ebitda: 156, net: 124 },
    { p: "Jun", rev: 644, ebitda: 162, net: 131 },
    { p: "Jul", rev: 658, ebitda: 169, net: 136 },
    { p: "Aug", rev: 671, ebitda: 174, net: 141 },
    { p: "Sep", rev: 684, ebitda: 178, net: 145 },
  ],
};

const bu = [
  { n: "BPO", rev: 681, margin: 22, gm: 38 },
  { n: "Tech Svc", rev: 472, margin: 28, gm: 44 },
  { n: "Analytics", rev: 318, margin: 31, gm: 49 },
  { n: "Consulting", rev: 224, margin: 26, gm: 42 },
  { n: "Platform", rev: 189, margin: 34, gm: 52 },
];

const geo = [
  { name: "India", value: 42 },
  { name: "USA", value: 28 },
  { name: "EMEA", value: 18 },
  { name: "APAC", value: 12 },
];

const radar = [
  { k: "Revenue Growth", actual: 88, target: 80 },
  { k: "EBITDA Margin", actual: 82, target: 75 },
  { k: "Cash Conversion", actual: 76, target: 80 },
  { k: "Order Cover", actual: 92, target: 85 },
  { k: "DSO Health", actual: 71, target: 75 },
  { k: "Cost Efficiency", actual: 84, target: 80 },
];

const treemap = bu.map((b, i) => ({
  name: b.n, size: b.rev, fill: PALETTE[i],
}));

const TOOLTIP = { background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--foreground)" };

function CEODashboard() {
  const [period, setPeriod] = useState<"TTM" | "YTD">("TTM");
  const trend = ebitdaByPeriod[period];
  const totals = useMemo(() => {
    const rev = trend.reduce((s, x) => s + x.rev, 0);
    const eb = trend.reduce((s, x) => s + x.ebitda, 0);
    const net = trend.reduce((s, x) => s + x.net, 0);
    return { rev, eb, net, ebPct: ((eb / rev) * 100).toFixed(1), netPct: ((net / rev) * 100).toFixed(1) };
  }, [trend]);
  const { data: spend } = useQuery({ queryKey: ["approved-spend-team"], queryFn: () => approvedSpendByTeam() });
  const { data: inv } = useQuery({ queryKey: ["approved-invoice-totals"], queryFn: () => approvedInvoiceTotals() });
  const fmtCr = (n: number) => n >= 1e7 ? `₹ ${(n / 1e7).toFixed(2)}Cr` : n >= 1e5 ? `₹ ${(n / 1e5).toFixed(1)}L` : `₹ ${Math.round(n).toLocaleString("en-IN")}`;
  const arApproved = (inv?.ar_issued ?? 0) + (inv?.ar_billing ?? 0);

  return (
    <AppShell nav={nav}>
      <div className="p-6 md:p-10 max-w-7xl mx-auto">
        <PageHeader
          eyebrow="CEO Workspace"
          title="Financial Command Center"
          subtitle="Enterprise revenue, EBITDA, profitability & cash — synthesised from every finance upload."
          actions={
            <div className="flex items-center gap-2">
              {(["YTD", "TTM"] as const).map((p) => (
                <Button key={p} variant={period === p ? "default" : "outline"} size="sm" onClick={() => setPeriod(p)}>
                  {p}
                </Button>
              ))}
              <Badge variant="outline" className="border-gold/40 text-gold ml-2">Board-ready</Badge>
            </div>
          }
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label={`Revenue (${period})`} value={`₹ ${totals.rev.toLocaleString()} Cr`} delta="+18.4% YoY" accent="emerald" />
          <StatCard label="EBITDA Margin" value={`${totals.ebPct}%`} delta="+2.1 pts" accent="gold" />
          <StatCard label="Net Profit" value={`₹ ${totals.net.toLocaleString()} Cr`} delta={`${totals.netPct}% of rev`} />
          <StatCard label="Cash Position" value="₹ 2,840 Cr" delta="+₹ 312 Cr QoQ" />
          <StatCard label="DSO" value="42 days" delta="-3 days" accent="emerald" />
          <StatCard label="Order Book" value="₹ 9,420 Cr" delta="1.31x cover" />
          <StatCard label="Avg Contract Value" value="₹ 28.4 Cr" delta="+9.2%" accent="gold" />
          <StatCard label="ROCE" value="24.8%" delta="+1.6 pts" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="AR · Approved (live)" value={fmtCr(arApproved)} delta={`${inv?.count ?? 0} invoices`} accent="emerald" />
          <StatCard label="AP · Approved (live)" value={fmtCr(inv?.ap ?? 0)} delta="from CFO queue" />
          <StatCard label="Facilities · Approved" value={fmtCr(spend?.totals.facilities_cost.amount ?? 0)} delta={`${spend?.totals.facilities_cost.count ?? 0} uploads`} accent="gold" />
          <StatCard label="IT · Approved" value={fmtCr(spend?.totals.it_cost.amount ?? 0)} delta={`${spend?.totals.it_cost.count ?? 0} uploads`} />
        </div>


        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 glass rounded-2xl p-6 shadow-elevated">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display font-semibold text-lg">Revenue · EBITDA · Net Profit</h3>
                <p className="text-xs text-muted-foreground">{period} · ₹ Crore</p>
              </div>
              <Badge variant="outline" className="border-primary/40 text-primary">
                <TrendingUp className="w-3 h-3 mr-1" /> Trending up
              </Badge>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trend}>
                <defs>
                  {["a", "b", "c"].map((id, i) => (
                    <linearGradient key={id} id={`g${id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={PALETTE[i]} stopOpacity={0.55} />
                      <stop offset="100%" stopColor={PALETTE[i]} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                <XAxis dataKey="p" stroke="var(--chart-axis)" fontSize={12} />
                <YAxis stroke="var(--chart-axis)" fontSize={12} />
                <Tooltip contentStyle={TOOLTIP} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="rev" stroke={PALETTE[0]} fill="url(#ga)" strokeWidth={2} name="Revenue" />
                <Area type="monotone" dataKey="ebitda" stroke={PALETTE[1]} fill="url(#gb)" strokeWidth={2} name="EBITDA" />
                <Area type="monotone" dataKey="net" stroke={PALETTE[2]} fill="url(#gc)" strokeWidth={2} name="Net Profit" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="glass rounded-2xl p-6 shadow-elevated">
            <h3 className="font-display font-semibold text-lg mb-1">Geography · Revenue</h3>
            <p className="text-xs text-muted-foreground mb-4">Share %</p>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={geo} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                  {geo.map((_, i) => <Cell key={i} fill={PALETTE[i]} />)}
                </Pie>
                <Tooltip contentStyle={TOOLTIP} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {geo.map((g, i) => (
                <div key={g.name} className="flex items-center gap-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ background: PALETTE[i] }} />
                  <span className="text-muted-foreground">{g.name}</span>
                  <span className="ml-auto font-semibold">{g.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 glass rounded-2xl p-6 shadow-elevated">
            <h3 className="font-display font-semibold text-lg mb-1">Business Unit · Revenue & Margin</h3>
            <p className="text-xs text-muted-foreground mb-4">QTD · ₹ Crore · margin %</p>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={bu}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                <XAxis dataKey="n" stroke="var(--chart-axis)" fontSize={12} />
                <YAxis yAxisId="l" stroke="var(--chart-axis)" fontSize={12} />
                <YAxis yAxisId="r" orientation="right" stroke="oklch(0.78 0.13 85)" fontSize={12} />
                <Tooltip contentStyle={TOOLTIP} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar yAxisId="l" dataKey="rev" fill={PALETTE[0]} radius={[6, 6, 0, 0]} name="Revenue" />
                <Bar yAxisId="r" dataKey="margin" fill={PALETTE[1]} radius={[6, 6, 0, 0]} name="EBITDA %" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="glass rounded-2xl p-6 shadow-elevated">
            <h3 className="font-display font-semibold text-lg mb-1">Financial Scorecard</h3>
            <p className="text-xs text-muted-foreground mb-2">Actual vs target · index 100</p>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radar}>
                <PolarGrid stroke="var(--chart-grid)" />
                <PolarAngleAxis dataKey="k" stroke="var(--chart-axis)" fontSize={10} />
                <Radar name="Target" dataKey="target" stroke={PALETTE[1]} fill={PALETTE[1]} fillOpacity={0.15} />
                <Radar name="Actual" dataKey="actual" stroke={PALETTE[0]} fill={PALETTE[0]} fillOpacity={0.4} />
                <Tooltip contentStyle={TOOLTIP} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="glass rounded-2xl p-6 shadow-elevated lg:col-span-2">
            <h3 className="font-display font-semibold text-lg mb-1">Revenue Concentration</h3>
            <p className="text-xs text-muted-foreground mb-4">Business unit treemap · ₹ Crore</p>
            <ResponsiveContainer width="100%" height={260}>
              <Treemap data={treemap} dataKey="size" stroke="oklch(0.22 0.035 165)" />
            </ResponsiveContainer>
          </div>
          <div className="glass rounded-2xl p-6 shadow-elevated">
            <h3 className="font-display font-semibold text-lg mb-4">Financial Alerts</h3>
            <div className="space-y-3">
              {[
                { t: "Collections BU margin dropped 4 pts QoQ", s: "high" },
                { t: "DSO improved by 3 days vs target", s: "low" },
                { t: "Forex gain ₹ 12 Cr on USD receivables", s: "low" },
                { t: "Top-5 client share crossed 19.4%", s: "medium" },
              ].map((a) => (
                <div key={a.t} className="flex items-start gap-3 rounded-xl border border-border bg-card/30 px-4 py-3">
                  <span className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                    a.s === "high" ? "bg-destructive" : a.s === "medium" ? "bg-warning" : "bg-success"
                  }`} />
                  <span className="text-sm">{a.t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-6 shadow-elevated">
          <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" /> Top 5 Client Revenue Concentration
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-widest text-muted-foreground border-b border-border">
                  <th className="py-2">Client</th><th>BU</th><th>Revenue (TTM)</th><th>% Share</th><th>GM %</th><th>DSO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {[
                  ["Aurora Bank", "BPO", "₹ 412 Cr", "5.7%", "41%", "38d"],
                  ["Helix Insurance", "Analytics", "₹ 318 Cr", "4.4%", "48%", "41d"],
                  ["Northwind Telecom", "Tech Svc", "₹ 286 Cr", "3.9%", "36%", "52d"],
                  ["Pioneer Health", "Consulting", "₹ 211 Cr", "2.9%", "44%", "33d"],
                  ["Vega Retail", "Platform", "₹ 184 Cr", "2.5%", "51%", "44d"],
                ].map((r) => (
                  <tr key={r[0]} className="hover:bg-card/40 transition-colors">
                    <td className="py-3 font-medium flex items-center gap-2"><IndianRupee className="w-3 h-3 text-primary" />{r[0]}</td>
                    <td className="text-muted-foreground">{r[1]}</td>
                    <td className="font-semibold">{r[2]}</td>
                    <td>{r[3]}</td>
                    <td className="text-success">{r[4]}</td>
                    <td className="text-muted-foreground">{r[5]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
