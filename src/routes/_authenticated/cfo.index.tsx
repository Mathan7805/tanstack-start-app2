import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { LayoutDashboard, FileSpreadsheet, Receipt, CheckCircle2, History, Upload, BarChart3 } from "lucide-react";
import { AppShell, PageHeader, StatCard } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { approvedInvoiceTotals } from "@/lib/approvals.functions";
import {
  Area, AreaChart, Bar, BarChart, ComposedChart, Line, CartesianGrid, Cell, Pie, PieChart,
  PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis, Legend,
} from "recharts";

export const Route = createFileRoute("/_authenticated/cfo/")({
  head: () => ({ meta: [{ title: "CFO Dashboard — FInsightZ" }] }),
  component: CFODashboard,
});

const nav = [
  { label: "Overview", href: "/cfo", icon: LayoutDashboard },
  { label: "P&L Review", href: "/cfo/pnl", icon: FileSpreadsheet },
  { label: "Profitability", href: "/cfo/profitability", icon: BarChart3 },
  { label: "Invoices", href: "/cfo/invoices", icon: Receipt },
  { label: "Approvals", href: "/cfo/approvals", icon: CheckCircle2 },
  { label: "Audit Log", href: "/cfo/audit", icon: History },
];

const PALETTE = ["oklch(0.72 0.16 162)", "oklch(0.78 0.13 85)", "oklch(0.65 0.18 200)", "oklch(0.68 0.14 320)", "oklch(0.74 0.15 30)"];
const TOOLTIP = { background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--foreground)" };

const monthly = [
  { m: "Jun", rev: 420, cost: 310, gm: 26 },
  { m: "Jul", rev: 465, cost: 322, gm: 31 },
  { m: "Aug", rev: 488, cost: 335, gm: 31 },
  { m: "Sep", rev: 512, cost: 351, gm: 31 },
  { m: "Oct", rev: 548, cost: 362, gm: 34 },
  { m: "Nov", rev: 581, cost: 378, gm: 35 },
];

const processMargin = [
  { p: "Voice Ops", margin: 28, rev: 142 },
  { p: "Back Office", margin: 34, rev: 98 },
  { p: "Collections", margin: 22, rev: 84 },
  { p: "Tech Support", margin: 41, rev: 168 },
  { p: "Chat", margin: 18, rev: 52 },
];

const costBreakdown = [
  { name: "Direct (COSR)", value: 62 },
  { name: "Fixed", value: 16 },
  { name: "Variable", value: 9 },
  { name: "Overheads", value: 8 },
  { name: "Finance & Depr.", value: 5 },
];

const cashflow = [
  { m: "Jun", inflow: 412, outflow: 308 },
  { m: "Jul", inflow: 458, outflow: 320 },
  { m: "Aug", inflow: 481, outflow: 332 },
  { m: "Sep", inflow: 504, outflow: 348 },
  { m: "Oct", inflow: 539, outflow: 358 },
  { m: "Nov", inflow: 572, outflow: 372 },
];

const radar = [
  { k: "Gross Margin", actual: 88, target: 80 },
  { k: "Op Margin", actual: 82, target: 78 },
  { k: "Net Margin", actual: 76, target: 75 },
  { k: "DSO", actual: 84, target: 80 },
  { k: "Cost Variance", actual: 90, target: 85 },
  { k: "Cash Conversion", actual: 78, target: 80 },
];

function CFODashboard() {
  const [period, setPeriod] = useState<"6M" | "QTD" | "YTD">("6M");
  const [cashMonths, setCashMonths] = useState<string[]>(() => cashflow.slice(-3).map((c) => c.m));
  const data = useMemo(() => {
    if (period === "QTD") return monthly.slice(-3);
    if (period === "YTD") return monthly;
    return monthly;
  }, [period]);

  const { data: liveTotals } = useQuery({
    queryKey: ["approved-invoice-totals"],
    queryFn: () => approvedInvoiceTotals(),
  });

  const fmtCr = (n: number) => n >= 1e7 ? `₹ ${(n / 1e7).toFixed(2)}Cr` : n >= 1e5 ? `₹ ${(n / 1e5).toFixed(1)}L` : `₹ ${Math.round(n).toLocaleString("en-IN")}`;
  const arLive = (liveTotals?.ar_issued ?? 0) + (liveTotals?.ar_billing ?? 0);
  const apLive = liveTotals?.ap ?? 0;

  return (
    <AppShell nav={nav}>
      <div className="p-6 md:p-10 max-w-7xl mx-auto">
        <PageHeader
          eyebrow="CFO Workspace"
          title="Profitability Command Center"
          subtitle="Consolidated P&L, process margins, cost structure and cash — review and freeze the monthly book."
          actions={
            <div className="flex items-center gap-2">
              {(["QTD", "YTD", "6M"] as const).map((p) => (
                <Button key={p} variant={period === p ? "default" : "outline"} size="sm" onClick={() => setPeriod(p)}>
                  {p}
                </Button>
              ))}
              <Button className="bg-[var(--gradient-emerald)] text-primary-foreground shadow-glow ml-2">
                Publish November
              </Button>
            </div>
          }
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Revenue" value="₹ 581M" delta="+5.7% MoM" accent="emerald" />
          <StatCard label="Gross Margin" value="34.9%" delta="+1.2 pts" />
          <StatCard label="Operating Profit" value="₹ 128M" delta="+8.3%" accent="gold" />
          <StatCard label="Net Profit" value="₹ 94M" delta="+6.1%" />
          <StatCard label="EBITDA Margin" value="28.4%" delta="+1.6 pts" accent="emerald" />
          <StatCard label="DSO" value="42 days" delta="-3 days" />
          <StatCard label="AR · Approved (live)" value={fmtCr(arLive)} delta={`${liveTotals?.count ?? 0} invoices`} accent="gold" />
          <StatCard label="AP · Approved (live)" value={fmtCr(apLive)} delta="from approvals queue" />

        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 glass rounded-2xl p-6 shadow-elevated">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display font-semibold text-lg">Revenue · Cost · Gross Margin</h3>
                <p className="text-xs text-muted-foreground">{period} · ₹ Million · margin %</p>
              </div>
              <Badge variant="outline" className="border-primary/40 text-primary">Live</Badge>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={data}>
                <defs>
                  <linearGradient id="cfo-rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={PALETTE[0]} stopOpacity={0.55} />
                    <stop offset="100%" stopColor={PALETTE[0]} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                <XAxis dataKey="m" stroke="var(--chart-axis)" fontSize={12} />
                <YAxis yAxisId="l" stroke="var(--chart-axis)" fontSize={12} />
                <YAxis yAxisId="r" orientation="right" stroke={PALETTE[2]} fontSize={12} />
                <Tooltip contentStyle={TOOLTIP} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area yAxisId="l" type="monotone" dataKey="rev" stroke={PALETTE[0]} fill="url(#cfo-rev)" strokeWidth={2} name="Revenue" />
                <Bar yAxisId="l" dataKey="cost" fill={PALETTE[1]} radius={[6, 6, 0, 0]} name="Cost" />
                <Line yAxisId="r" type="monotone" dataKey="gm" stroke={PALETTE[2]} strokeWidth={2} name="GM %" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="glass rounded-2xl p-6 shadow-elevated">
            <h3 className="font-display font-semibold text-lg mb-1">Cost Structure</h3>
            <p className="text-xs text-muted-foreground mb-4">% of total cost</p>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={costBreakdown} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                  {costBreakdown.map((_, i) => <Cell key={i} fill={PALETTE[i]} />)}
                </Pie>
                <Tooltip contentStyle={TOOLTIP} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1 mt-2">
              {costBreakdown.map((c, i) => (
                <div key={c.name} className="flex items-center gap-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ background: PALETTE[i] }} />
                  <span className="text-muted-foreground">{c.name}</span>
                  <span className="ml-auto font-semibold">{c.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <div className="glass rounded-2xl p-6 shadow-elevated">
            <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
              <div>
                <h3 className="font-display font-semibold text-lg">Cash Inflow vs Outflow</h3>
                <p className="text-xs text-muted-foreground">₹ Million · {cashMonths.join(" → ") || "select months"}</p>
              </div>
              <div className="flex flex-wrap gap-1">
                {cashflow.map((c) => {
                  const on = cashMonths.includes(c.m);
                  return (
                    <button
                      key={c.m}
                      onClick={() =>
                        setCashMonths((prev) =>
                          prev.includes(c.m)
                            ? prev.filter((x) => x !== c.m)
                            : [...prev, c.m].sort(
                                (a, b) => cashflow.findIndex((x) => x.m === a) - cashflow.findIndex((x) => x.m === b),
                              ),
                        )
                      }
                      className={`px-2.5 py-1 rounded-md text-xs border transition-colors ${
                        on ? "bg-primary/15 border-primary/40 text-primary" : "border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {c.m}
                    </button>
                  );
                })}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={cashflow.filter((c) => cashMonths.includes(c.m))}>
                <defs>
                  <linearGradient id="in" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={PALETTE[0]} stopOpacity={0.6} />
                    <stop offset="100%" stopColor={PALETTE[0]} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="out" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={PALETTE[1]} stopOpacity={0.5} />
                    <stop offset="100%" stopColor={PALETTE[1]} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                <XAxis dataKey="m" stroke="var(--chart-axis)" fontSize={12} />
                <YAxis stroke="var(--chart-axis)" fontSize={12} />
                <Tooltip contentStyle={TOOLTIP} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="inflow" stroke={PALETTE[0]} fill="url(#in)" strokeWidth={2} />
                <Area type="monotone" dataKey="outflow" stroke={PALETTE[1]} fill="url(#out)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>


          <div className="glass rounded-2xl p-6 shadow-elevated">
            <h3 className="font-display font-semibold text-lg mb-1">Financial Health</h3>
            <p className="text-xs text-muted-foreground mb-2">Actual vs target</p>
            <ResponsiveContainer width="100%" height={260}>
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
          <div className="lg:col-span-2 glass rounded-2xl p-6 shadow-elevated">
            <h3 className="font-display font-semibold text-lg mb-1">Process Margin % · Revenue</h3>
            <p className="text-xs text-muted-foreground mb-4">November snapshot</p>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={processMargin}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                <XAxis dataKey="p" stroke="var(--chart-axis)" fontSize={12} />
                <YAxis yAxisId="l" stroke="var(--chart-axis)" fontSize={12} />
                <YAxis yAxisId="r" orientation="right" stroke={PALETTE[1]} fontSize={12} />
                <Tooltip contentStyle={TOOLTIP} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar yAxisId="l" dataKey="rev" fill={PALETTE[0]} radius={[6, 6, 0, 0]} name="Revenue (M)" />
                <Bar yAxisId="r" dataKey="margin" fill={PALETTE[1]} radius={[6, 6, 0, 0]} name="Margin %" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="glass rounded-2xl p-6 shadow-elevated">
            <h3 className="font-display font-semibold text-lg mb-4">Pending CFO Approvals</h3>
            <div className="space-y-3">
              {[
                { t: "November Master P&L", who: "Finance Team", tag: "Ready" },
                { t: "Vendor invoice batch #482", who: "AI Extracted · 14 docs", tag: "Review" },
                { t: "Q3 cost allocation rerun", who: "Operations Head", tag: "Pending" },
                { t: "Provision adjustments", who: "₹ 18M · 6 entries", tag: "Review" },
              ].map((i) => (
                <div key={i.t} className="flex items-center justify-between rounded-xl border border-border bg-card/30 px-4 py-3">
                  <div>
                    <div className="text-sm font-medium">{i.t}</div>
                    <div className="text-xs text-muted-foreground">{i.who}</div>
                  </div>
                  <Badge variant="outline" className="border-primary/40 text-primary">{i.tag}</Badge>
                </div>
              ))}
              <Button asChild variant="outline" className="w-full mt-2">
                <Link to="/cfo/profitability"><Upload className="w-4 h-4 mr-2" /> Upload finance master</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
