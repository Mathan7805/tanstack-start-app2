import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, XCircle, Clock, LayoutDashboard, FileSpreadsheet, Receipt, History, BarChart3, Loader2, ChevronDown, ChevronRight, Inbox } from "lucide-react";
import { AppShell, PageHeader, StatCard } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient, useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listApprovals, decideApproval, approvalStats } from "@/lib/approvals.functions";

export const Route = createFileRoute("/_authenticated/cfo/approvals")({
  head: () => ({ meta: [{ title: "Approvals — FInsightZ" }] }),
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(queryOptions({ queryKey: ["approval-stats"], queryFn: () => approvalStats() })),
  component: Approvals,
});

const nav = [
  { label: "Overview", href: "/cfo", icon: LayoutDashboard },
  { label: "P&L Review", href: "/cfo/pnl", icon: FileSpreadsheet },
  { label: "Profitability", href: "/cfo/profitability", icon: BarChart3 },
  { label: "Invoices", href: "/cfo/invoices", icon: Receipt },
  { label: "Approvals", href: "/cfo/approvals", icon: CheckCircle2 },
  { label: "Audit Log", href: "/cfo/audit", icon: History },
];

type Approval = {
  id: string;
  source_type: string;
  source_id: string;
  title: string;
  submitter: string | null;
  team: string | null;
  amount: number | null;
  amount_original: number | null;
  fx_rate: number | null;
  currency: string | null;
  summary: any;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  notes: string | null;
};

const sourceLabel: Record<string, string> = {
  invoice: "Invoice",
  pnl_upload: "P&L Upload",
  finance_master: "Finance Master",
  facilities_cost: "Facilities Cost",
  it_cost: "IT Cost",
};

function fmtINRLocal(n?: number | null) {
  if (n == null) return "—";
  return `₹${new Intl.NumberFormat("en-IN").format(Math.round(n))}`;
}

function fmtOrig(n?: number | null, code?: string | null) {
  if (n == null) return null;
  const c = code ?? "INR";
  if (c === "INR") return null;
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: c, maximumFractionDigits: 2 }).format(Number(n));
  } catch {
    return `${c} ${new Intl.NumberFormat("en-US").format(Math.round(Number(n)))}`;
  }
}

function Approvals() {
  const [tab, setTab] = useState<"pending" | "approved" | "rejected">("pending");
  const qc = useQueryClient();

  const list = useServerFn(listApprovals);
  const decide = useServerFn(decideApproval);

  const { data: stats } = useSuspenseQuery({ queryKey: ["approval-stats"], queryFn: () => approvalStats() });
  const { data: rows = [], isFetching } = useQuery({
    queryKey: ["approvals", tab],
    queryFn: () => list({ data: { status: tab } }),
  });

  const mut = useMutation({
    mutationFn: (v: { id: string; decision: "approved" | "rejected" }) => decide({ data: v }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["approvals"] });
      qc.invalidateQueries({ queryKey: ["approval-stats"] });
      qc.invalidateQueries({ queryKey: ["approved-invoice-totals"] });
    },
  });

  return (
    <AppShell nav={nav}>
      <div className="p-6 md:p-10 max-w-7xl mx-auto">
        <PageHeader
          eyebrow="CFO · Approvals"
          title="Review & Approve"
          subtitle="Every document team uploads — invoices, P&L books, finance & cost masters — lands here for CFO sign-off. Approved items flow to Overview, P&L and Profitability."
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Pending" value={String(stats.pending)} delta={fmtINRLocal(stats.pendingAmount)} />
          <StatCard label="Approved (all-time)" value={String(stats.approved)} accent="emerald" />
          <StatCard label="Rejected" value={String(stats.rejected)} />
          <StatCard label="Avg cycle" value="—" delta="set after approvals" accent="gold" />
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
          <TabsList>
            <TabsTrigger value="pending"><Clock className="w-3 h-3 mr-2" /> Pending</TabsTrigger>
            <TabsTrigger value="approved"><CheckCircle2 className="w-3 h-3 mr-2" /> Approved</TabsTrigger>
            <TabsTrigger value="rejected"><XCircle className="w-3 h-3 mr-2" /> Rejected</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="mt-4 space-y-3">
          {isFetching && rows.length === 0 ? (
            <div className="glass rounded-2xl p-10 grid place-items-center text-sm text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          ) : rows.length === 0 ? (
            <div className="glass rounded-2xl p-10 text-center text-sm text-muted-foreground">
              <Inbox className="w-6 h-6 mx-auto mb-2 opacity-60" />
              Nothing here. Inbox zero.
            </div>
          ) : (
            rows.map((r) => (
              <ApprovalCard key={r.id} item={r as Approval} onDecide={(d) => mut.mutate({ id: r.id, decision: d })} busy={mut.isPending && mut.variables?.id === r.id} />
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}

function ApprovalCard({ item, onDecide, busy }: { item: Approval; onDecide: (d: "approved" | "rejected") => void; busy: boolean }) {
  const [open, setOpen] = useState(false);
  const summary = item.summary ?? {};
  const entries = Object.entries(summary).filter(([, v]) => v != null && v !== "");

  return (
    <div className="glass rounded-2xl shadow-elevated overflow-hidden">
      <button onClick={() => setOpen((o) => !o)} className="w-full p-5 flex items-center justify-between gap-4 flex-wrap text-left hover:bg-accent/30 transition-colors">
        <div className="min-w-0 flex items-start gap-3">
          {open ? <ChevronDown className="w-4 h-4 mt-1 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 mt-1 text-muted-foreground" />}
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <Badge variant="outline" className="border-primary/40 text-primary">{sourceLabel[item.source_type] ?? item.source_type}</Badge>
              {item.team && <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{item.team}</span>}
            </div>
            <div className="font-display font-semibold text-base">{item.title}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {item.submitter ?? "—"} · {new Date(item.created_at).toLocaleString()}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm font-semibold tabular-nums">{fmtINRLocal(item.amount)}</div>
            {item.currency && item.currency !== "INR" && item.amount_original != null && (
              <div className="text-[10px] text-muted-foreground tabular-nums">
                {fmtOrig(item.amount_original, item.currency)}
                {item.fx_rate ? <> · @ ₹{Number(item.fx_rate).toFixed(2)}/{item.currency}</> : null}
              </div>
            )}
          </div>
          {item.status === "pending" ? (
            <Badge variant="outline" className="border-warning/40 text-warning gap-1"><Clock className="w-3 h-3" /> Pending</Badge>
          ) : item.status === "approved" ? (
            <Badge variant="outline" className="border-success/40 text-success gap-1"><CheckCircle2 className="w-3 h-3" /> Approved</Badge>
          ) : (
            <Badge variant="outline" className="border-destructive/40 text-destructive gap-1"><XCircle className="w-3 h-3" /> Rejected</Badge>
          )}
        </div>
      </button>

      {open && (
        <div className="border-t border-border p-5 bg-accent/15">
          {entries.length === 0 ? (
            <div className="text-xs text-muted-foreground">No extracted detail.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <tbody className="divide-y divide-border/40">
                  {entries.map(([k, v]) => (
                    <tr key={k}>
                      <td className="py-1.5 pr-4 text-muted-foreground uppercase tracking-widest text-[10px] align-top w-48">
                        {k.replace(/_/g, " ")}
                      </td>
                      <td className="py-1.5 font-medium break-words">{typeof v === "object" ? JSON.stringify(v) : String(v)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {item.status === "pending" && (
            <div className="flex items-center justify-end gap-2 mt-4">
              <Button variant="outline" disabled={busy} onClick={() => onDecide("rejected")}>
                <XCircle className="w-4 h-4 mr-2" /> Reject
              </Button>
              <Button disabled={busy} onClick={() => onDecide("approved")} className="bg-[var(--gradient-emerald)] text-primary-foreground shadow-glow">
                {busy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                Approve
              </Button>
            </div>
          )}
          {item.notes && <div className="mt-3 text-xs text-muted-foreground">Notes: {item.notes}</div>}
        </div>
      )}
    </div>
  );
}
