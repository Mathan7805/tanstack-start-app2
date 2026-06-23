import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Receipt, Search, Eye, CheckCircle2, AlertTriangle, Upload, ListChecks, FileSpreadsheet } from "lucide-react";
import { AppShell, PageHeader, StatCard } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/_authenticated/finance/invoices")({
  head: () => ({ meta: [{ title: "Invoice Review — FInsightZ" }] }),
  component: InvoiceReview,
});

const nav = [
  { label: "Upload Center", href: "/finance", icon: Upload },
  { label: "Validation Queue", href: "/finance/validation", icon: AlertTriangle },
  { label: "Invoice Review", href: "/finance/invoices", icon: Receipt },
  { label: "Reconciliation", href: "/finance/reconciliation", icon: ListChecks },
  { label: "Master Sheets", href: "/finance/masters", icon: FileSpreadsheet },
];

const invoices = [
  { no: "INV-44822", kind: "Vendor", party: "Lumen Cloud", date: "2025-10-29", amount: "₹0.86M", gst: "₹0.15M", tds: "₹0.01M", process: "—", cost: "IT Costs", conf: 0.74 },
  { no: "INV-44824", kind: "Vendor", party: "Unknown vendor", date: "2025-10-30", amount: "₹0.42M", gst: "—", tds: "—", process: "—", cost: "Unclassified", conf: 0.41 },
  { no: "CLT-9911", kind: "Client", party: "Acme Telecom", date: "2025-11-01", amount: "₹4.10M", gst: "₹0.74M", tds: "—", process: "Voice Ops", cost: "—", conf: 0.92 },
  { no: "CLT-9912", kind: "Client", party: "Globant Services", date: "2025-11-02", amount: "₹3.10M", gst: "₹0.56M", tds: "—", process: "Back Office", cost: "—", conf: 0.99 },
  { no: "INV-44830", kind: "Vendor", party: "Apex Realty", date: "2025-11-02", amount: "₹1.20M", gst: "₹0.22M", tds: "₹0.12M", process: "—", cost: "Building Costs", conf: 0.88 },
];

const selected = invoices[0];

function InvoiceReview() {
  const [q, setQ] = useState("");
  const filtered = invoices.filter((i) => `${i.no} ${i.party} ${i.cost}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <AppShell nav={nav}>
      <div className="p-6 md:p-10 max-w-7xl mx-auto">
        <PageHeader
          eyebrow="Finance · Invoices"
          title="Invoice Review"
          subtitle="AI-extracted fields from client and vendor folders. Approve or correct before profitability posting."
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="In review" value="14" delta="6 low confidence" />
          <StatCard label="Auto-classified" value="128" delta="this month" accent="emerald" />
          <StatCard label="Pending mapping" value="9" delta="missing process" />
          <StatCard label="Avg AI confidence" value="0.91" delta="+0.04" accent="gold" />
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 glass rounded-2xl p-6 shadow-elevated">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-lg">Extraction queue</h3>
              <div className="relative w-72">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search invoice, vendor, category" className="pl-9" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-widest text-muted-foreground border-b border-border">
                    <th className="py-2">Invoice</th><th>Type</th><th>Party</th><th>Amount</th><th>AI</th><th></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filtered.map((i) => (
                    <tr key={i.no}>
                      <td className="py-3 font-mono text-xs">{i.no}</td>
                      <td><Badge variant="outline" className={i.kind === "Client" ? "border-primary/40 text-primary" : "border-gold/40 text-gold"}>{i.kind}</Badge></td>
                      <td>{i.party}</td>
                      <td className="font-semibold">{i.amount}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Progress value={i.conf * 100} className="h-1.5 w-16" />
                          <span className="text-xs text-muted-foreground">{Math.round(i.conf * 100)}%</span>
                        </div>
                      </td>
                      <td className="text-right"><Button size="icon" variant="ghost"><Eye className="w-4 h-4" /></Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="lg:col-span-2 glass rounded-2xl p-6 shadow-elevated">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">Selected invoice</div>
                <h3 className="font-display font-semibold text-lg">{selected.no}</h3>
              </div>
              <Badge variant="outline" className="border-warning/40 text-warning">Needs review</Badge>
            </div>
            <div className="space-y-3 text-sm">
              {[
                ["Vendor Name", selected.party, 0.97],
                ["Invoice Date", selected.date, 0.99],
                ["Invoice Amount", selected.amount, 0.95],
                ["GST", selected.gst, 0.62],
                ["TDS", selected.tds, 0.58],
                ["Expense Category", selected.cost, 0.71],
                ["Cost Center", "BLR-HQ-4F", 0.84],
                ["Due Date", "2025-11-28", 0.88],
                ["Payment Terms", "Net 30", 0.91],
              ].map(([k, v, c]) => (
                <div key={k as string} className="flex items-center justify-between border-b border-border/60 pb-2 last:border-0">
                  <div>
                    <div className="text-xs text-muted-foreground">{k}</div>
                    <div className="font-medium">{v as string}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={(c as number) * 100} className="h-1.5 w-16" />
                    <span className={`text-xs ${(c as number) < 0.7 ? "text-warning" : "text-muted-foreground"}`}>{Math.round((c as number) * 100)}%</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2 mt-6">
              <Button variant="outline">Send back</Button>
              <Button className="bg-[var(--gradient-emerald)] text-primary-foreground shadow-glow">
                <CheckCircle2 className="w-4 h-4 mr-2" /> Approve & post
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
