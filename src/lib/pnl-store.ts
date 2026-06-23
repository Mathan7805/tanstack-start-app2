import { supabase } from "@/integrations/supabase/client";
import type { ParsedPnl } from "./pnl-parser";

export async function saveMasterPnl(filename: string, pnl: ParsedPnl) {
  const { data: up, error: e1 } = await supabase
    .from("pnl_uploads")
    .insert({
      filename,
      persona: "cfo",
      period: pnl.period,
      sheet_kind: "master_pnl",
      raw_json: { unmappedLabels: pnl.unmappedLabels, projectCount: pnl.projects.length },
      project_codes: pnl.projects.map((p) => p.code),
    })
    .select("id")
    .single();
  if (e1 || !up) throw new Error(e1?.message ?? "upload insert failed");

  const lineRows = pnl.lines.map((l) => ({ ...l, upload_id: up.id }));
  // chunked insert
  for (let i = 0; i < lineRows.length; i += 500) {
    const { error } = await supabase.from("pnl_lines").insert(lineRows.slice(i, i + 500));
    if (error) throw new Error(error.message);
  }
  if (pnl.meta.length) {
    const metaRows = pnl.meta.map((m) => ({ ...m, upload_id: up.id }));
    const { error } = await supabase.from("pnl_meta").insert(metaRows);
    if (error) throw new Error(error.message);
  }
  return up.id as string;
}

export async function loadLatestPnl(): Promise<ParsedPnl | null> {
  const { data: up } = await supabase
    .from("pnl_uploads")
    .select("id, period, project_codes")
    .eq("sheet_kind", "master_pnl")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!up) return null;
  const [{ data: lines }, { data: meta }] = await Promise.all([
    supabase.from("pnl_lines").select("*").eq("upload_id", up.id),
    supabase.from("pnl_meta").select("*").eq("upload_id", up.id),
  ]);
  if (!lines) return null;

  // reconstruct projects
  const projMap = new Map<string, { code: string; name: string; segment: string }>();
  for (const l of lines as any[]) {
    if (!projMap.has(l.project_code))
      projMap.set(l.project_code, { code: l.project_code, name: l.project_name, segment: l.segment });
  }
  return {
    period: up.period ?? "",
    projects: Array.from(projMap.values()).map((p, idx) => ({ ...p, idx })),
    lines: lines as any,
    meta: (meta ?? []) as any,
    unmappedLabels: [],
  };
}
