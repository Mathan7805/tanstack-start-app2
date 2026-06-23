import { createFileRoute } from "@tanstack/react-router";
import { FileSpreadsheet, Download, Upload, Plus, AlertTriangle, Receipt, ListChecks } from "lucide-react";
import { AppShell, PageHeader, StatCard } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/finance/masters")({
  head: () => ({ meta: [{ title: "Master Sheets — FInsightZ" }] }),
  component: MasterSheets,
});

const nav = [
  { label: "Upload Center", href: "/finance", icon: Upload },
  { label: "Validation Queue", href: "/finance/validation", icon: AlertTriangle },
  { label: "Invoice Review", href: "/finance/invoices", icon: Receipt },
  { label: "Reconciliation", href: "/finance/reconciliation", icon: ListChecks },
  { label: "Master Sheets", href: "/finance/masters", icon: FileSpreadsheet },
];

const masters = [
  { name: "Process Master", rows: 124, updated: "2025-11-02", owner: "Priya R.", version: "v18" },
  { name: "Client Master", rows: 87, updated: "2025-10-28", owner: "Arjun K.", version: "v12" },
  { name: "Cost Center Master", rows: 56, updated: "2025-10-21", owner: "Finance Ops", version: "v9" },
  { name: "GL Mapping", rows: 312, updated: "2025-11-01", owner: "Priya R.", version: "v23" },
  { name: "Expense Category", rows: 41, updated: "2025-09-30", owner: "Arjun K.", version: "v6" },
  { name: "Allocation Drivers", rows: 18, updated: "2025-11-04", owner: "CFO Office", version: "v4" },
];

function MasterSheets() {
  return (
    <AppShell nav={nav}>
      <div className="p-6 md:p-10 max-w-7xl mx-auto">
        <PageHeader
          eyebrow="Finance · Masters"
          title="Master Data Sheets"
          subtitle="Reference dimensions that drive validation, classification and cost allocation across the platform."
          actions={
            <>
              <Button variant="outline"><Download className="w-4 h-4 mr-2" /> Export pack</Button>
              <Button className="bg-[var(--gradient-emerald)] text-primary-foreground shadow-glow">
                <Plus className="w-4 h-4 mr-2" /> New master
              </Button>
            </>
          }
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Masters maintained" value="6" />
          <StatCard label="Total dimensions" value="658" delta="rows under control" accent="emerald" />
          <StatCard label="Pending updates" value="2" delta="GL mapping, drivers" />
          <StatCard label="Last freeze" value="Nov 02" accent="gold" />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {masters.map((m) => (
            <div key={m.name} className="glass rounded-2xl p-6 shadow-elevated">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">{m.version}</div>
                  <h3 className="font-display font-semibold text-lg">{m.name}</h3>
                </div>
                <Badge variant="outline" className="border-primary/40 text-primary">{m.rows} rows</Badge>
              </div>
              <div className="text-xs text-muted-foreground mb-4">
                Last updated by <span className="text-foreground">{m.owner}</span> on {m.updated}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1">View</Button>
                <Button size="sm" variant="outline" className="flex-1"><Download className="w-3 h-3 mr-1" /> Template</Button>
                <Button size="sm" className="flex-1 bg-[var(--gradient-emerald)] text-primary-foreground"><Upload className="w-3 h-3 mr-1" /> Upload</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
