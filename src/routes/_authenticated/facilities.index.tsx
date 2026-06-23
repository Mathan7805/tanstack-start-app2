import { createFileRoute } from "@tanstack/react-router";
import { Building2, Zap, Droplets, Wrench, Upload } from "lucide-react";
import { AppShell, PageHeader, StatCard } from "@/components/AppShell";
import { UploadCenter } from "@/components/UploadCenter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export const Route = createFileRoute("/_authenticated/facilities/")({
  head: () => ({ meta: [{ title: "Facilities Dashboard — FInsightZ" }] }),
  component: FacilitiesDashboard,
});

import { facNav as nav } from "./facilities";

const power = [
  { m: "Jun", cost: 4.92 },
  { m: "Jul", cost: 5.41 },
  { m: "Aug", cost: 5.62 },
  { m: "Sep", cost: 5.18 },
  { m: "Oct", cost: 5.04 },
  { m: "Nov", cost: 4.71 },
];

function FacilitiesDashboard() {
  return (
    <AppShell nav={nav}>
      <div className="p-6 md:p-10 max-w-7xl mx-auto">
        <PageHeader
          eyebrow="Facilities Workspace"
          title="Building & Utility Expenses"
          subtitle="Submit building rent, electricity, water and maintenance bills so they flow into the allocation engine cleanly."
          actions={
            <Button className="bg-[var(--gradient-emerald)] text-primary-foreground shadow-glow">
              <Upload className="w-4 h-4 mr-2" /> Upload utility bills
            </Button>
          }
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Monthly Facility Spend" value="₹21.4M" delta="-3.2% MoM" accent="emerald" />
          <StatCard label="Cost per Sqft / mo" value="₹107" delta="-₹4 MoM" accent="gold" />
          <StatCard label="Rent + Utilities" value="₹18.3M" delta="85% of facility spend" />
          <StatCard label="Active Buildings" value="6" delta="2 cities · 2.0L sqft" />
        </div>


        <div className="mb-8">
          <UploadCenter persona="facilities" title="Facilities Upload & AI Reader"
            subtitle="Drop utility bills, rent agreements, AMC invoices — AI reads building, units consumed and amount with confidence scoring." />
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 glass rounded-2xl p-6 shadow-elevated">
            <h3 className="font-display font-semibold text-lg mb-1">Electricity Spend Trend</h3>
            <p className="text-xs text-muted-foreground mb-4">Trailing 6 months · ₹ Million</p>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={power}>
                <defs>
                  <linearGradient id="pow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.78 0.13 85)" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="oklch(0.78 0.13 85)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                <XAxis dataKey="m" stroke="var(--chart-axis)" fontSize={12} />
                <YAxis stroke="var(--chart-axis)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--foreground)" }} />
                <Area type="monotone" dataKey="cost" stroke="oklch(0.78 0.13 85)" fill="url(#pow)" strokeWidth={2} name="₹ M" />
              </AreaChart>
            </ResponsiveContainer>
          </div>


          <div className="glass rounded-2xl p-6 shadow-elevated">
            <h3 className="font-display font-semibold text-lg mb-4">Buildings</h3>
            <div className="space-y-3">
              {[
                { n: "Bangalore HQ", sf: "82,400 sqft", st: "live" },
                { n: "Hyderabad Campus", sf: "61,200 sqft", st: "live" },
                { n: "Pune Tower B", sf: "44,800 sqft", st: "live" },
                { n: "Chennai DR Site", sf: "12,000 sqft", st: "review" },
              ].map((b) => (
                <div key={b.n} className="flex items-center justify-between rounded-xl border border-border bg-card/30 px-4 py-3">
                  <div>
                    <div className="text-sm font-medium">{b.n}</div>
                    <div className="text-xs text-muted-foreground">{b.sf}</div>
                  </div>
                  <Badge variant="outline" className={b.st === "live" ? "border-success/40 text-success" : "border-warning/40 text-warning"}>
                    {b.st}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="glass rounded-2xl p-6 shadow-elevated">
            <h3 className="font-display font-semibold text-lg mb-4">Pending Bill Uploads</h3>
            <div className="space-y-3">
              {[
                ["BESCOM · Nov electricity", "₹4.6M est."],
                ["Pune water board · Q3", "₹0.42M est."],
                ["AMC · HVAC · Nov", "₹0.81M est."],
              ].map(([t, v]) => (
                <div key={t} className="flex items-center justify-between border-b border-border/60 pb-2 last:border-0">
                  <span className="text-sm">{t}</span>
                  <span className="text-xs text-muted-foreground">{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl p-6 shadow-elevated">
            <h3 className="font-display font-semibold text-lg mb-4">Open Maintenance Tickets</h3>
            <div className="space-y-3">
              {[
                ["HVAC fault · Floor 4", "high"],
                ["UPS replacement · DR Site", "high"],
                ["Pantry refurb · BLR", "low"],
                ["Lift AMC renewal", "medium"],
              ].map(([t, p]) => (
                <div key={t} className="flex items-center justify-between rounded-xl border border-border bg-card/30 px-4 py-3">
                  <span className="text-sm">{t}</span>
                  <Badge
                    variant="outline"
                    className={
                      p === "high"
                        ? "border-destructive/40 text-destructive"
                        : p === "medium"
                        ? "border-warning/40 text-warning"
                        : "border-primary/40 text-primary"
                    }
                  >
                    {p}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
