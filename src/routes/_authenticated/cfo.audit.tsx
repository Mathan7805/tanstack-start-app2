import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { History, Search, Download, Upload, CheckCircle2, Edit3, Shield, LayoutDashboard, FileSpreadsheet, Receipt } from "lucide-react";
import { AppShell, PageHeader, StatCard } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_authenticated/cfo/audit")({
  head: () => ({ meta: [{ title: "Audit Log — FInsightZ" }] }),
  component: AuditLog,
});

const nav = [
  { label: "Overview", href: "/cfo", icon: LayoutDashboard },
  { label: "P&L Review", href: "/cfo/pnl", icon: FileSpreadsheet },
  { label: "Invoices", href: "/cfo/invoices", icon: Receipt },
  { label: "Approvals", href: "/cfo/approvals", icon: CheckCircle2 },
  { label: "Audit Log", href: "/cfo/audit", icon: History },
];

const events = [
  { ts: "2025-11-05 09:42", user: "Priya R.", role: "Finance", action: "Uploaded", target: "Nov_Revenue_Master.xlsx", kind: "upload" },
  { ts: "2025-11-05 09:44", user: "System", role: "Engine", action: "Validated", target: "Nov_Revenue_Master.xlsx · 0 errors", kind: "system" },
  { ts: "2025-11-05 10:13", user: "Arjun K.", role: "Finance", action: "Edited", target: "Process Master row 88 (OPS-441)", kind: "edit" },
  { ts: "2025-11-05 11:02", user: "System", role: "AI", action: "Extracted", target: "Vendor_Batch_Oct31.zip · 22 invoices", kind: "system" },
  { ts: "2025-11-05 14:30", user: "You", role: "CFO", action: "Approved", target: "AP-1041 · Vendor batch ₹3.10M", kind: "approve" },
  { ts: "2025-11-04 18:11", user: "You", role: "CFO", action: "Published", target: "October 2025 master P&L v3", kind: "publish" },
  { ts: "2025-11-04 17:50", user: "Karthik M.", role: "IT", action: "Uploaded", target: "Nov_Seat_Utilization.xlsx", kind: "upload" },
  { ts: "2025-11-03 12:09", user: "Meera S.", role: "Facilities", action: "Uploaded", target: "Nov_Utilities_BLR.xlsx", kind: "upload" },
];

const iconFor = (k: string) =>
  k === "upload" ? Upload : k === "edit" ? Edit3 : k === "approve" || k === "publish" ? CheckCircle2 : Shield;

function AuditLog() {
  const [q, setQ] = useState("");
  const filtered = events.filter((e) => `${e.user} ${e.action} ${e.target} ${e.role}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <AppShell nav={nav}>
      <div className="p-6 md:p-10 max-w-7xl mx-auto">
        <PageHeader
          eyebrow="CFO · Audit"
          title="Audit Trail"
          subtitle="Immutable record of uploads, edits, AI actions, approvals and publishes. Exportable for SOX / internal audit."
          actions={
            <>
              <Button variant="outline"><Download className="w-4 h-4 mr-2" /> Export CSV</Button>
              <Button variant="outline"><Download className="w-4 h-4 mr-2" /> Export PDF</Button>
            </>
          }
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Events (30d)" value="1,284" delta="+9%" accent="emerald" />
          <StatCard label="Publishes" value="3" />
          <StatCard label="Edits to masters" value="42" />
          <StatCard label="Failed sign-ins" value="0" accent="gold" />
        </div>

        <div className="glass rounded-2xl p-6 shadow-elevated">
          <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
            <h3 className="font-display font-semibold text-lg">Recent activity</h3>
            <div className="relative w-72">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search user, action, asset" className="pl-9" />
            </div>
          </div>
          <div className="relative pl-6">
            <div className="absolute left-2 top-2 bottom-2 w-px bg-border" />
            <div className="space-y-4">
              {filtered.map((e, idx) => {
                const Icon = iconFor(e.kind);
                return (
                  <div key={idx} className="relative">
                    <div className="absolute -left-[18px] top-1 w-4 h-4 rounded-full bg-card border-2 border-primary grid place-items-center">
                      <Icon className="w-2.5 h-2.5 text-primary" />
                    </div>
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div>
                        <div className="text-sm">
                          <span className="font-medium">{e.user}</span>
                          <Badge variant="outline" className="ml-2 border-primary/40 text-primary text-[10px] py-0">{e.role}</Badge>{" "}
                          <span className="text-muted-foreground">{e.action.toLowerCase()}</span>{" "}
                          <span className="text-foreground">{e.target}</span>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground font-mono">{e.ts}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
