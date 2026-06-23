import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Upload } from "lucide-react";
import { AppShell, PageHeader, StatCard } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { approvedSpendByTeam } from "@/lib/approvals.functions";
import {
  Line, LineChart, ComposedChart, Bar, CartesianGrid, ResponsiveContainer,
  Tooltip, XAxis, YAxis, Legend, Cell, Pie, PieChart,
  PolarAngleAxis, PolarGrid, Radar, RadarChart,
} from "recharts";
import { opsNav as nav } from "./operations";

export const Route = createFileRoute("/_authenticated/operations/")({
  head: () => ({ meta: [{ title: "Operations P&L — FInsightZ" }] }),
  component: OpsDashboard,
});

const PALETTE = ["oklch(0.72 0.16 162)", "oklch(0.78 0.13 85)", "oklch(0.65 0.18 200)", "oklch(0.68 0.14 320)", "oklch(0.74 0.15 30)"];
const TOOLTIP = { background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--foreground)" };

const trend30 = Array.from({ length: 30 }, (_, i) => ({
  d: `D${i + 1}`,
  revPerFte: 4200 + Math.round(Math.sin(i / 3) * 220 + Math.random() * 80),
  costPerFte: 2680 + Math.round(Math.cos(i / 3) * 110 + Math.random() * 40),
}));

const processPnl = [
  { p: "Voice Ops", rev: 142, cost: 102, margin: 28 },
  { p: "Back Office", rev: 98, cost: 64, margin: 35 },
  { p: "Collections", rev: 84, cost: 66, margin: 21 },
  { p: "Tech Support", rev: 168, cost: 99, margin: 41 },
  { p: "Chat", rev: 52, cost: 42, margin: 19 },
];

const costMix = [
  { name: "Manpower", value: 58 },
  { name: "Infrastructure", value: 14 },
  { name: "Technology", value: 12 },
  { name: "Telecom", value: 9 },
  { name: "Overheads", value: 7 },
];

const radar = [
  { k: "Revenue / FTE", actual: 86, target: 80 },
  { k: "Cost / FTE", actual: 78, target: 80 },
  { k: "Gross Margin", actual: 84, target: 80 },
  { k: "Billable %", actual: 90, target: 88 },
  { k: "Seat Utilisation", actual: 87, target: 85 },
  { k: "Recovery Ratio", actual: 75, target: 80 },
];

function OpsDashboard() {
  const [window, setWindow] = useState<14 | 30>(14);
  const data = trend30.slice(0, window);
  const { data: spend } = useQuery({ queryKey: ["approved-spend-team"], queryFn: () => approvedSpendByTeam() });
  const fmtCr = (n: number) => n >= 1e7 ? `₹ ${(n / 1e7).toFixed(2)}Cr` : n >= 1e5 ? `₹ ${(n / 1e5).toFixed(1)}L` : `₹ ${Math.round(n).toLocaleString("en-IN")}`;


  return (
    <AppShell nav={nav}>
      <div className="p-6 md:p-10 max-w-7xl mx-auto">
        <PageHeader
          eyebrow="Operations Workspace"
          title="Process Unit Economics"
          subtitle="Process-wise revenue, cost & margin — the financial lens on every operating unit."
          actions={
            <div className="flex items-center gap-2">
              {([14, 30] as const).map((w) => (
                <Button key={w} variant={window === w ? "default" : "outline"} size="sm" onClick={() => setWindow(w)}>
                  {w}d
                </Button>
              ))}
              <Button className="bg-[var(--gradient-emerald)] text-primary-foreground shadow-glow ml-2">
                <Upload className="w-4 h-4 mr-2" /> Upload metrics
              </Button>
            </div>
          }
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Revenue per FTE / mo" value="₹ 4,284" delta="+5.2% MoM" accent="emerald" />
          <StatCard label="Cost per FTE / mo" value="₹ 2,712" delta="-1.8% MoM" accent="gold" />
          <StatCard label="Ops Gross Margin" value="36.7%" delta="+2.1 pts" />
          <StatCard label="Cost Recovery Ratio" value="1.58x" delta="+0.06" accent="emerald" />
          <StatCard label="Billable FTE %" value="90.3%" delta="+1.2 pts" />
          <StatCard label="Cost per Billable Hr" value="₹ 312" delta="-₹ 8" />
          <StatCard label="Revenue Leakage" value="2.4%" delta="-0.6 pts" accent="gold" />
          <StatCard label="Process Contribution" value="₹ 544 Cr" delta="+8.4%" />
          <StatCard label="Ops Uploads · Approved" value={fmtCr(spend?.totals.operations_metric.amount ?? 0)} delta={`${spend?.totals.operations_metric.count ?? 0} approved`} accent="emerald" />
          <StatCard label="Facilities · Approved" value={fmtCr(spend?.totals.facilities_cost.amount ?? 0)} delta={`${spend?.totals.facilities_cost.count ?? 0} uploads`} />
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 glass rounded-2xl p-6 shadow-elevated">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display font-semibold text-lg">Unit Economics Trend</h3>
                <p className="text-xs text-muted-foreground">Revenue / FTE vs Cost / FTE · last {window} days · ₹/day</p>
              </div>
              <Badge variant="outline" className="border-primary/40 text-primary">Live</Badge>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                <XAxis dataKey="d" stroke="var(--chart-axis)" fontSize={11} />
                <YAxis stroke="var(--chart-axis)" fontSize={12} />
                <Tooltip contentStyle={TOOLTIP} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="revPerFte" stroke={PALETTE[0]} strokeWidth={2} dot={false} name="Revenue/FTE" />
                <Line type="monotone" dataKey="costPerFte" stroke={PALETTE[1]} strokeWidth={2} dot={false} name="Cost/FTE" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="glass rounded-2xl p-6 shadow-elevated">
            <h3 className="font-display font-semibold text-lg mb-1">Cost Mix</h3>
            <p className="text-xs text-muted-foreground mb-4">% of total operating cost</p>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={costMix} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                  {costMix.map((_, i) => <Cell key={i} fill={PALETTE[i]} />)}
                </Pie>
                <Tooltip contentStyle={TOOLTIP} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1 mt-2">
              {costMix.map((c, i) => (
                <div key={c.name} className="flex items-center gap-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ background: PALETTE[i] }} />
                  <span className="text-muted-foreground">{c.name}</span>
                  <span className="ml-auto font-semibold">{c.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 glass rounded-2xl p-6 shadow-elevated">
            <h3 className="font-display font-semibold text-lg mb-1">Process-wise P&L</h3>
            <p className="text-xs text-muted-foreground mb-4">Revenue vs cost · margin overlay · ₹ Million</p>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={processPnl}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                <XAxis dataKey="p" stroke="var(--chart-axis)" fontSize={12} />
                <YAxis yAxisId="l" stroke="var(--chart-axis)" fontSize={12} />
                <YAxis yAxisId="r" orientation="right" stroke={PALETTE[2]} fontSize={12} />
                <Tooltip contentStyle={TOOLTIP} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar yAxisId="l" dataKey="rev" fill={PALETTE[0]} radius={[6, 6, 0, 0]} name="Revenue" />
                <Bar yAxisId="l" dataKey="cost" fill={PALETTE[1]} radius={[6, 6, 0, 0]} name="Cost" />
                <Line yAxisId="r" type="monotone" dataKey="margin" stroke={PALETTE[2]} strokeWidth={2} name="Margin %" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="glass rounded-2xl p-6 shadow-elevated">
            <h3 className="font-display font-semibold text-lg mb-1">Efficiency Scorecard</h3>
            <p className="text-xs text-muted-foreground mb-2">Actual vs target</p>
            <ResponsiveContainer width="100%" height={300}>
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

        <div className="glass rounded-2xl p-6 shadow-elevated">
          <h3 className="font-display font-semibold text-lg mb-4">Process Profitability Table</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-widest text-muted-foreground border-b border-border">
                  <th className="py-2">Process</th><th>Revenue</th><th>Cost</th><th>Contribution</th><th>Margin %</th><th>Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {processPnl.map((r) => (
                  <tr key={r.p} className="hover:bg-card/40 transition-colors">
                    <td className="py-3 font-medium">{r.p}</td>
                    <td className="font-semibold">₹ {r.rev}M</td>
                    <td className="text-muted-foreground">₹ {r.cost}M</td>
                    <td className="text-success font-semibold">₹ {r.rev - r.cost}M</td>
                    <td>
                      <Badge variant="outline" className={
                        r.margin >= 30 ? "border-success/40 text-success" :
                        r.margin >= 22 ? "border-warning/40 text-warning" :
                        "border-destructive/40 text-destructive"
                      }>{r.margin}%</Badge>
                    </td>
                    <td className="text-muted-foreground text-xs">+{(r.margin / 10).toFixed(1)} pts MoM</td>
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
