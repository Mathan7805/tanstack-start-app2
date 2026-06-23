import { createFileRoute } from "@tanstack/react-router";
import { Upload, FileSpreadsheet, AlertTriangle, CheckCircle2, Receipt, ListChecks } from "lucide-react";
import { AppShell, PageHeader, StatCard } from "@/components/AppShell";
import { UploadCenter } from "@/components/UploadCenter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/_authenticated/finance/")({
  head: () => ({ meta: [{ title: "Finance Dashboard — FInsightZ" }] }),
  component: FinanceDashboard,
});

const nav = [
  { label: "Upload Center", href: "/finance", icon: Upload },
  { label: "Validation Queue", href: "/finance/validation", icon: AlertTriangle },
  { label: "Invoice Review", href: "/finance/invoices", icon: Receipt },
  { label: "Reconciliation", href: "/finance/reconciliation", icon: ListChecks },
  { label: "Master Sheets", href: "/finance/masters", icon: FileSpreadsheet },
];

function FinanceDashboard() {
  return (
    <AppShell nav={nav}>
      <div className="p-6 md:p-10 max-w-7xl mx-auto">
        <PageHeader
          eyebrow="Finance Workspace"
          title="Upload, validate, post"
          subtitle="Push monthly finance masters, reconcile AI-extracted invoices, and clear the validation queue before CFO review."
          actions={
            <Button className="bg-[var(--gradient-emerald)] text-primary-foreground shadow-glow">
              <Upload className="w-4 h-4 mr-2" /> New upload
            </Button>
          }
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Uploads this month" value="38" delta="6 pending" accent="emerald" />
          <StatCard label="Invoices in queue" value="142" delta="14 low-confidence" />
          <StatCard label="Validation errors" value="9" delta="3 critical" />
          <StatCard label="Reconciled" value="96.4%" delta="+1.8 pts" accent="gold" />
        </div>

        <div className="mb-8">
          <UploadCenter persona="finance" title="Finance Upload & AI Reader"
            subtitle="Drop monthly revenue, WIP, provisions, vendor invoices — the AI engine extracts headers, totals and posts to validation." />
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 glass rounded-2xl p-6 shadow-elevated">
            <h3 className="font-display font-semibold text-lg mb-4">Active Uploads</h3>
            <div className="space-y-4">
              {[
                { name: "Nov_Revenue_Master.xlsx", status: "Validated", progress: 100, tone: "success" },
                { name: "Nov_WIP_Adjustments.csv", status: "Validating", progress: 72, tone: "default" },
                { name: "Nov_Provisions_v2.xlsx", status: "Error · 3 invalid process codes", progress: 100, tone: "error" },
                { name: "Vendor_Batch_Oct31.zip", status: "Extracting (OCR)", progress: 44, tone: "default" },
              ].map((u) => (
                <div key={u.name} className="rounded-xl border border-border bg-card/30 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">{u.name}</span>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        u.tone === "success"
                          ? "border-success/40 text-success"
                          : u.tone === "error"
                          ? "border-destructive/40 text-destructive"
                          : "border-primary/40 text-primary"
                      }
                    >
                      {u.status}
                    </Badge>
                  </div>
                  <Progress value={u.progress} className="h-1.5" />
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl p-6 shadow-elevated">
            <h3 className="font-display font-semibold text-lg mb-4">Validation Rules</h3>
            <div className="space-y-3 text-sm">
              {[
                ["Mandatory columns", true],
                ["Duplicate rows", true],
                ["Process code lookup", true],
                ["Negative values flagged", true],
                ["Date format", true],
                ["Revenue vs invoice match", false],
              ].map(([rule, ok]) => (
                <div key={String(rule)} className="flex items-center justify-between">
                  <span className="text-muted-foreground">{rule}</span>
                  {ok ? (
                    <CheckCircle2 className="w-4 h-4 text-success" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-warning" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-6 shadow-elevated">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-lg">AI Extraction Queue</h3>
            <Badge variant="outline" className="border-gold/40 text-gold">14 need review</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-widest text-muted-foreground border-b border-border">
                  <th className="py-2">Invoice #</th><th>Vendor / Client</th><th>Amount</th><th>Confidence</th><th>Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {[
                  ["INV-44821", "Acme Telecom", "₹1.24M", 0.97, "Auto-posted"],
                  ["INV-44822", "Lumen Cloud", "₹0.86M", 0.74, "Needs review"],
                  ["INV-44823", "Globant Services", "₹3.10M", 0.99, "Auto-posted"],
                  ["INV-44824", "Unknown vendor", "₹0.42M", 0.41, "Manual"],
                ].map((r) => (
                  <tr key={r[0] as string}>
                    <td className="py-3 font-mono text-xs">{r[0]}</td>
                    <td>{r[1]}</td>
                    <td className="font-semibold">{r[2]}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Progress value={(r[3] as number) * 100} className="h-1.5 w-20" />
                        <span className="text-xs text-muted-foreground">{Math.round((r[3] as number) * 100)}%</span>
                      </div>
                    </td>
                    <td>
                      <Badge
                        variant="outline"
                        className={
                          r[4] === "Auto-posted"
                            ? "border-success/40 text-success"
                            : r[4] === "Manual"
                            ? "border-destructive/40 text-destructive"
                            : "border-warning/40 text-warning"
                        }
                      >
                        {r[4]}
                      </Badge>
                    </td>
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
