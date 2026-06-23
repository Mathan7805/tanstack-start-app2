import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const listApprovals = createServerFn({ method: "GET" })
  .inputValidator((d: { status?: "pending" | "approved" | "rejected" }) => d ?? {})
  .handler(async ({ data }) => {
    const q = supabaseAdmin
      .from("approvals")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (data?.status) q.eq("status", data.status);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const decideApproval = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({
      id: z.string().uuid(),
      decision: z.enum(["approved", "rejected"]),
      notes: z.string().max(500).optional(),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    const { data: approval, error: aerr } = await supabaseAdmin
      .from("approvals")
      .update({ status: data.decision, decided_at: new Date().toISOString(), notes: data.notes ?? null })
      .eq("id", data.id)
      .select()
      .single();
    if (aerr) throw new Error(aerr.message);

    if (approval?.source_type === "invoice") {
      await supabaseAdmin
        .from("invoices")
        .update({ approval_status: data.decision, decided_at: new Date().toISOString() })
        .eq("id", approval.source_id);
    } else if (approval?.source_type === "pnl_upload") {
      await supabaseAdmin
        .from("pnl_runs")
        .update({ published: data.decision === "approved" })
        .eq("upload_id", approval.source_id);
    }
    return approval;
  });

export const approvalStats = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("approvals")
    .select("status, amount, source_type");
  if (error) throw new Error(error.message);
  const stat = { pending: 0, approved: 0, rejected: 0, pendingAmount: 0 };
  for (const r of data ?? []) {
    if (r.status === "pending") {
      stat.pending++;
      stat.pendingAmount += Number(r.amount ?? 0);
    } else if (r.status === "approved") stat.approved++;
    else if (r.status === "rejected") stat.rejected++;
  }
  return stat;
});

export const approvedInvoiceTotals = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("invoices")
    .select("kind, amount, approval_status")
    .eq("approval_status", "approved");
  if (error) throw new Error(error.message);
  const t = { ar_issued: 0, ar_billing: 0, ap: 0, count: 0 };
  for (const r of data ?? []) {
    const amt = Number(r.amount ?? 0);
    if (r.kind === "client_issued") t.ar_issued += amt;
    else if (r.kind === "client_billing") t.ar_billing += amt;
    else if (r.kind === "vendor_received") t.ap += amt;
    t.count++;
  }
  return t;
});

const SOURCE_BY_PERSONA: Record<string, string> = {
  finance: "finance_master",
  it: "it_cost",
  facilities: "facilities_cost",
  operations: "operations_metric",
  cfo: "pnl_upload",
};

export const submitUploadApproval = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({
      persona: z.enum(["finance", "it", "facilities", "operations", "cfo"]),
      title: z.string().min(1).max(255),
      submitter: z.string().max(255).optional(),
      team: z.string().max(64).optional(),
      amount: z.number().nullable().optional(),
      summary: z.record(z.string(), z.any()).optional(),
      source_id: z.string().min(1).max(128),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    const { data: row, error } = await supabaseAdmin
      .from("approvals")
      .insert({
        source_type: SOURCE_BY_PERSONA[data.persona] ?? "upload",
        source_id: data.source_id,
        title: data.title,
        submitter: data.submitter ?? null,
        team: data.team ?? data.persona,
        amount: data.amount ?? null,
        currency: "INR",
        summary: data.summary ?? {},
        status: "pending",
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const approvedSpendByTeam = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("approvals")
    .select("source_type, team, amount, status")
    .eq("status", "approved");
  if (error) throw new Error(error.message);
  const totals: Record<string, { count: number; amount: number }> = {
    facilities_cost: { count: 0, amount: 0 },
    it_cost: { count: 0, amount: 0 },
    finance_master: { count: 0, amount: 0 },
    operations_metric: { count: 0, amount: 0 },
    pnl_upload: { count: 0, amount: 0 },
    invoice: { count: 0, amount: 0 },
  };
  let grandAmount = 0;
  let grandCount = 0;
  for (const r of data ?? []) {
    const k = r.source_type as string;
    if (!totals[k]) totals[k] = { count: 0, amount: 0 };
    totals[k].count++;
    totals[k].amount += Number(r.amount ?? 0);
    grandAmount += Number(r.amount ?? 0);
    grandCount++;
  }
  return { totals, grandAmount, grandCount };
});
