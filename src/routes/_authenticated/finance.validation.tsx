import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AlertTriangle, CheckCircle2, XCircle, Filter, Download, RefreshCw, Upload, FileSpreadsheet, ListChecks, Receipt } from "lucide-react";
import { AppShell, PageHeader, StatCard } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export const Route = createFileRoute("/_authenticated/finance/validation")({
  head: () => ({ meta: [{ title: "Validation Queue — FInsightZ" }] }),
  component: ValidationQueue,
});

const nav = [
  { label: "Upload Center", href: "/finance", icon: Upload },
  { label: "Validation Queue", href: "/finance/validation", icon: AlertTriangle },
  { label: "Invoice Review", href: "/finance/invoices", icon: Receipt },
  { label: "Reconciliation", href: "/finance/reconciliation", icon: ListChecks },
  { label: "Master Sheets", href: "/finance/masters", icon: FileSpreadsheet },
];

const issues = [
  { id: "ER-2041", file: "Nov_Provisions_v2.xlsx", row: 47, col: "Process Code", rule: "Invalid Process Code", detail: "‘OPS-998’ not found in master", severity: "critical" },
  { id: "ER-2042", file: "Nov_Provisions_v2.xlsx", row: 51, col: "Amount", rule: "Negative Value", detail: "-₹42,000 flagged for approval", severity: "warning" },
  { id: "ER-2043", file: "Nov_Provisions_v2.xlsx", row: 88, col: "Date", rule: "Incorrect Date Format", detail: "31/13/2025 is not a valid date", severity: "critical" },
  { id: "ER-2044", file: "Nov_WIP_Adjustments.csv", row: 12, col: "—", rule: "Duplicate Row", detail: "Matches row 9 of same upload", severity: "warning" },
  { id: "ER-2045", file: "Vendor_Batch_Oct31.zip", row: 4, col: "GST No.", rule: "Missing GST", detail: "Vendor ‘Globant Services’ has no GST", severity: "warning" },
  { id: "ER-2046", file: "Nov_Revenue_Master.xlsx", row: 130, col: "Revenue", rule: "Revenue vs Invoice mismatch", detail: "₹1.24M booked vs ₹1.18M invoiced", severity: "critical" },
];

function ValidationQueue() {
  const [tab, setTab] = useState("all");
  const filtered = issues.filter((i) => (tab === "all" ? true : tab === "critical" ? i.severity === "critical" : i.severity === "warning"));

  return (
    <AppShell nav={nav}>
      <div className="p-6 md:p-10 max-w-7xl mx-auto">
        <PageHeader
          eyebrow="Finance · Validation"
          title="Validation Queue"
          subtitle="Every uploaded file is run through 7 rule families before posting. Clear the criticals before requesting CFO review."
          actions={
            <>
              <Button variant="outline"><RefreshCw className="w-4 h-4 mr-2" /> Rerun rules</Button>
              <Button variant="outline"><Download className="w-4 h-4 mr-2" /> Export</Button>
            </>
          }
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Open issues" value="9" delta="3 critical" />
          <StatCard label="Auto-fixable" value="2" delta="Date format" accent="emerald" />
          <StatCard label="Awaiting reviewer" value="5" delta="Finance team" />
          <StatCard label="Pass rate (30d)" value="94.2%" delta="+1.4 pts" accent="gold" />
        </div>

        <Tabs value={tab} onValueChange={setTab} className="mb-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <TabsList>
              <TabsTrigger value="all">All ({issues.length})</TabsTrigger>
              <TabsTrigger value="critical">Critical (3)</TabsTrigger>
              <TabsTrigger value="warning">Warnings (3)</TabsTrigger>
            </TabsList>
            <Button variant="outline" size="sm"><Filter className="w-4 h-4 mr-2" /> Filter by rule</Button>
          </div>
          <TabsContent value={tab} className="mt-4">
            <div className="glass rounded-2xl overflow-hidden shadow-elevated">
              <table className="w-full text-sm">
                <thead className="bg-card/40">
                  <tr className="text-left text-xs uppercase tracking-widest text-muted-foreground">
                    <th className="px-4 py-3">Error #</th>
                    <th>File</th>
                    <th>Row · Col</th>
                    <th>Rule</th>
                    <th>Detail</th>
                    <th className="text-right pr-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filtered.map((i) => (
                    <tr key={i.id} className="hover:bg-card/40">
                      <td className="px-4 py-3 font-mono text-xs">{i.id}</td>
                      <td className="text-foreground">{i.file}</td>
                      <td className="text-muted-foreground">Row {i.row} · {i.col}</td>
                      <td>
                        <Badge variant="outline" className={i.severity === "critical" ? "border-destructive/40 text-destructive" : "border-warning/40 text-warning"}>
                          {i.severity === "critical" ? <XCircle className="w-3 h-3 mr-1" /> : <AlertTriangle className="w-3 h-3 mr-1" />}
                          {i.rule}
                        </Badge>
                      </td>
                      <td className="text-muted-foreground">{i.detail}</td>
                      <td className="text-right pr-4">
                        <Button size="sm" variant="outline">Resolve</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>

        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <div className="glass rounded-2xl p-6 shadow-elevated">
            <h3 className="font-display font-semibold text-lg mb-4">Rule families</h3>
            <div className="space-y-3 text-sm">
              {[
                ["Mandatory columns", 0],
                ["Duplicate rows", 1],
                ["Invalid process codes", 1],
                ["Negative values", 1],
                ["Date format", 1],
                ["Invoice format", 0],
                ["Revenue vs invoice match", 1],
              ].map(([r, c]) => (
                <div key={r as string} className="flex items-center justify-between">
                  <span>{r}</span>
                  {(c as number) === 0 ? (
                    <Badge variant="outline" className="border-success/40 text-success"><CheckCircle2 className="w-3 h-3 mr-1" /> Clean</Badge>
                  ) : (
                    <Badge variant="outline" className="border-warning/40 text-warning">{c} issue</Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="glass rounded-2xl p-6 shadow-elevated">
            <h3 className="font-display font-semibold text-lg mb-2">Auto-resolution</h3>
            <p className="text-sm text-muted-foreground mb-4">
              FInsightZ can auto-coerce ambiguous date formats (DD/MM vs MM/DD) and re-map deprecated process codes against the active master.
            </p>
            <Button className="bg-[var(--gradient-emerald)] text-primary-foreground shadow-glow w-full">
              <CheckCircle2 className="w-4 h-4 mr-2" /> Apply auto-fixes (2)
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
