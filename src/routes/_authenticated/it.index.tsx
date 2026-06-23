import { createFileRoute } from "@tanstack/react-router";
import { Server, Monitor, Cloud, Upload, Cpu, HardDrive } from "lucide-react";
import { AppShell, PageHeader, StatCard } from "@/components/AppShell";
import { UploadCenter } from "@/components/UploadCenter";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export const Route = createFileRoute("/_authenticated/it/")({
  head: () => ({ meta: [{ title: "IT Head Dashboard — FInsightZ" }] }),
  component: ITDashboard,
});

import { itNav as nav } from "./it";

const itSpend = [
  { p: "Voice", cost: 8.4, rev: 142 },
  { p: "Back Off.", cost: 6.1, rev: 98 },
  { p: "Coll.", cost: 5.2, rev: 84 },
  { p: "Tech", cost: 9.8, rev: 168 },
  { p: "Chat", cost: 3.4, rev: 52 },
];

function ITDashboard() {
  return (
    <AppShell nav={nav}>
      <div className="p-6 md:p-10 max-w-7xl mx-auto">
        <PageHeader
          eyebrow="IT / Admin Workspace"
          title="Infrastructure & Utilization"
          subtitle="Maintain infra cost allocations, seat / system utilization, and software subscription posture across processes."
          actions={
            <Button className="bg-[var(--gradient-emerald)] text-primary-foreground shadow-glow">
              <Upload className="w-4 h-4 mr-2" /> Upload utilization sheet
            </Button>
          }
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Monthly IT Spend" value="₹38.2M" delta="-2.1% MoM" accent="emerald" />
          <StatCard label="Cost per Seat / mo" value="₹20,740" delta="-₹420 MoM" accent="gold" />
          <StatCard label="SaaS Annual Spend" value="₹25.5M" delta="3 renewals due" />
          <StatCard label="Seats Occupied" value="1,842 / 2,120" delta="87% utilized" />
        </div>

        <div className="mb-8">
          <UploadCenter persona="it" title="IT / Admin Upload & AI Reader"
            subtitle="Drop SaaS invoices, infra bills, seat utilization sheets — AI extracts vendor, amount and process allocation hints." />
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 glass rounded-2xl p-6 shadow-elevated">
            <h3 className="font-display font-semibold text-lg mb-1">IT Cost vs Revenue by Process</h3>
            <p className="text-xs text-muted-foreground mb-4">₹ Million · current month</p>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={itSpend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                <XAxis dataKey="p" stroke="var(--chart-axis)" fontSize={12} />
                <YAxis stroke="var(--chart-axis)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--foreground)" }} />
                <Bar dataKey="cost" fill="oklch(0.78 0.13 85)" radius={[6, 6, 0, 0]} name="IT Cost" />
                <Bar dataKey="rev" fill="oklch(0.72 0.16 162)" radius={[6, 6, 0, 0]} name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </div>


          <div className="glass rounded-2xl p-6 shadow-elevated">
            <h3 className="font-display font-semibold text-lg mb-4">Software Subscriptions</h3>
            <div className="space-y-4">
              {[
                { n: "Dialer Pro", v: "₹6.4M / yr", u: 92 },
                { n: "Salesforce CRM", v: "₹4.8M / yr", u: 78 },
                { n: "AWS Cloud", v: "₹12.1M / yr", u: 84 },
                { n: "MS 365", v: "₹2.2M / yr", u: 95 },
              ].map((s) => (
                <div key={s.n}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{s.n}</span>
                    <span className="text-muted-foreground">{s.v}</span>
                  </div>
                  <Progress value={s.u} className="h-1.5" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-6 shadow-elevated">
          <h3 className="font-display font-semibold text-lg mb-4">Infrastructure Allocations</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { l: "Building Rent", v: "₹14.8M", s: "allocated to 5 processes" },
              { l: "Server Rental", v: "₹6.2M", s: "12 server racks" },
              { l: "Internet Charges", v: "₹2.1M", s: "dual ISP" },
              { l: "Electricity", v: "₹4.6M", s: "metered allocation" },
            ].map((i) => (
              <div key={i.l} className="rounded-xl border border-border bg-card/30 p-4">
                <div className="text-xs uppercase tracking-widest text-muted-foreground">{i.l}</div>
                <div className="text-2xl font-display font-bold mt-1">{i.v}</div>
                <div className="text-xs text-muted-foreground mt-1">{i.s}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
