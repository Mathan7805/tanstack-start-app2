import { createFileRoute } from "@tanstack/react-router";
import { ListChecks, ArrowRight, CheckCircle2, AlertTriangle, Upload, Receipt, FileSpreadsheet } from "lucide-react";
import { AppShell, PageHeader, StatCard } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/_authenticated/finance/reconciliation")({
  head: () => ({ meta: [{ title: "Reconciliation — FInsightZ" }] }),
  component: Reconciliation,
});

const nav = [
  { label: "Upload Center", href: "/finance", icon: Upload },
  { label: "Validation Queue", href: "/finance/validation", icon: AlertTriangle },
  { label: "Invoice Review", href: "/finance/invoices", icon: Receipt },
  { label: "Reconciliation", href: "/finance/reconciliation", icon: ListChecks },
  { label: "Master Sheets", href: "/finance/masters", icon: FileSpreadsheet },
];

const breaks = [
  { proc: "Voice Ops", booked: "₹128.4M", invoiced: "₹127.1M", diff: "-₹1.3M", status: "Investigate" },
  { proc: "Back Office", booked: "₹96.2M", invoiced: "₹96.2M", diff: "₹0", status: "Matched" },
  { proc: "Collections", booked: "₹54.0M", invoiced: "₹55.6M", diff: "+₹1.6M", status: "Investigate" },
  { proc: "Tech Support", booked: "₹78.9M", invoiced: "₹78.9M", diff: "₹0", status: "Matched" },
  { proc: "Chat", booked: "₹32.1M", invoiced: "₹31.2M", diff: "-₹0.9M", status: "Investigate" },
];

function Reconciliation() {
  return (
    <AppShell nav={nav}>
      <div className="p-6 md:p-10 max-w-7xl mx-auto">
        <PageHeader
          eyebrow="Finance · Reconciliation"
          title="Revenue ↔ Invoice Reconciliation"
          subtitle="Three-way tie out between revenue book, AI-extracted client invoices, and operational volumes for November 2025."
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Reconciled" value="96.4%" delta="+1.8 pts" accent="emerald" />
          <StatCard label="Open breaks" value="3" delta="₹3.8M net" />
          <StatCard label="Auto-matched" value="412" delta="of 427 entries" />
          <StatCard label="Largest break" value="₹1.6M" delta="Collections" accent="gold" />
        </div>

        <div className="glass rounded-2xl p-6 shadow-elevated mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-lg">Process-wise tie out</h3>
            <Badge variant="outline" className="border-primary/40 text-primary">Period: Nov 2025</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-widest text-muted-foreground border-b border-border">
                  <th className="py-2">Process</th><th>Booked revenue</th><th>Invoiced</th><th>Variance</th><th>Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {breaks.map((b) => (
                  <tr key={b.proc}>
                    <td className="py-3 font-medium">{b.proc}</td>
                    <td>{b.booked}</td>
                    <td>{b.invoiced}</td>
                    <td className={b.diff === "₹0" ? "text-muted-foreground" : b.diff.startsWith("-") ? "text-destructive" : "text-warning"}>{b.diff}</td>
                    <td>
                      {b.status === "Matched" ? (
                        <Badge variant="outline" className="border-success/40 text-success"><CheckCircle2 className="w-3 h-3 mr-1" /> Matched</Badge>
                      ) : (
                        <Badge variant="outline" className="border-warning/40 text-warning"><AlertTriangle className="w-3 h-3 mr-1" /> {b.status}</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="glass rounded-2xl p-6 shadow-elevated">
            <h3 className="font-display font-semibold text-lg mb-4">Break suggestions</h3>
            <div className="space-y-4">
              {[
                { t: "Voice Ops · ₹1.3M short", s: "3 client invoices not yet received from Acme Telecom for late-Nov billing run.", a: "Raise follow-up" },
                { t: "Collections · ₹1.6M excess", s: "INV-44820 booked twice — once in WIP, once in revenue master.", a: "Auto-reverse WIP" },
                { t: "Chat · ₹0.9M short", s: "Transaction volume under-counted vs dialer extract.", a: "Re-extract" },
              ].map((b) => (
                <div key={b.t} className="rounded-xl border border-border bg-card/30 p-4">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-sm font-medium">{b.t}</div>
                    <Button size="sm" variant="outline">{b.a} <ArrowRight className="w-3 h-3 ml-1" /></Button>
                  </div>
                  <div className="text-xs text-muted-foreground">{b.s}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl p-6 shadow-elevated">
            <h3 className="font-display font-semibold text-lg mb-4">Match confidence</h3>
            <div className="space-y-3 text-sm">
              {[
                ["Invoice → Revenue line", 0.96],
                ["Revenue line → Process master", 0.99],
                ["Process → Client master", 0.94],
                ["Client → SOW pricing", 0.82],
              ].map(([k, v]) => (
                <div key={k as string}>
                  <div className="flex items-center justify-between mb-1">
                    <span>{k}</span>
                    <span className="text-xs text-muted-foreground">{Math.round((v as number) * 100)}%</span>
                  </div>
                  <Progress value={(v as number) * 100} className="h-1.5" />
                </div>
              ))}
            </div>
            <Button className="w-full mt-6 bg-[var(--gradient-emerald)] text-primary-foreground shadow-glow">
              Freeze reconciliation & post
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
