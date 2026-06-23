import * as XLSX from "xlsx";

export type ProjectCol = {
  idx: number;
  code: string;
  name: string;
  segment: string;
  isTotal?: boolean;
};

export type ParsedLine = {
  project_code: string;
  project_name: string;
  segment: string;
  line_key: string;
  line_label: string;
  line_group: string;
  amount: number | null;
};

export type ParsedMeta = {
  project_code: string;
  fte_paid?: number | null;
  fte_billed?: number | null;
  total_count_billed?: number | null;
  seat_utilized?: number | null;
  fte_onsite?: number | null;
  fte_total?: number | null;
  mgmt_count?: number | null;
  leave_gratuity_count?: number | null;
};

export type ParsedPnl = {
  period: string;
  projects: ProjectCol[];
  lines: ParsedLine[];
  meta: ParsedMeta[];
  unmappedLabels: string[];
};

const TEMPLATE: { key: string; label: string; group: string; aliases?: string[] }[] = [
  { key: "revenue_ops", label: "Revenue From Operations", group: "A_revenue" },
  { key: "pri_reimb", label: "PRI-Reimbursment", group: "A_revenue", aliases: ["pri reimbursement"] },
  { key: "incentive_rev", label: "Incentive", group: "A_revenue" },
  { key: "rev_variation", label: "Mar Revenue variation", group: "A_revenue", aliases: ["revenue variation"] },
  { key: "gst", label: "GST", group: "tax" },
  { key: "rent", label: "Building rent", group: "B_fixed" },
  { key: "electricity", label: "Electricity charges", group: "B_fixed" },
  { key: "water", label: "Water charges", group: "B_fixed" },
  { key: "diesel", label: "Diesel", group: "B_fixed" },
  { key: "amc", label: "AMC for equipments", group: "B_fixed" },
  { key: "server_rental", label: "Server rental", group: "B_fixed" },
  { key: "internet", label: "Internet charges", group: "B_fixed" },
  { key: "computer_rental", label: "Computer rental", group: "B_variable" },
  { key: "dialer_sw", label: "Dialer Software", group: "B_variable" },
  { key: "telephone", label: "Telephone Charges", group: "B_variable", aliases: ["telephone charges (used for outbound call & reiumbursed by cust)"] },
  { key: "ctc_fte", label: "CTC -FTE", group: "B_manpower", aliases: ["ctc-fte", "ctc fte"] },
  { key: "ctc_tl", label: "CTC - TL", group: "B_manpower" },
  { key: "ctc_support", label: "CTC - Support Staff", group: "B_manpower" },
  { key: "ctc_qa", label: "CTC - QA & Trainer", group: "B_manpower" },
  { key: "incentives_mp", label: "Incentives", group: "B_manpower" },
  { key: "outsourcing", label: "Outsourcing charges ( Transaction basis )", group: "B_manpower" },
  { key: "travel", label: "Transportation Charges / Travel", group: "B_manpower" },
  { key: "staff_welfare", label: "Staff welfare ( coffee, cakes, incentives etc )", group: "B_manpower" },
  { key: "leave_gratuity", label: "Leave and gratuity provision", group: "B_manpower" },
  { key: "stipend", label: "Stipend", group: "B_manpower" },
  { key: "oh_bd_ctc", label: "CTC of business dev team", group: "C_overheads" },
  { key: "oh_web", label: "Website maintenance", group: "C_overheads" },
  { key: "oh_seminar", label: "Seminar and events", group: "C_overheads" },
  { key: "oh_bd_travel", label: "Business development travel", group: "C_overheads" },
  { key: "oh_corp_ctc", label: "CTC of corporate, finance, HR and admn", group: "C_overheads" },
  { key: "oh_rent_apport", label: "Building rent apportioned to above", group: "C_overheads" },
  { key: "oh_travel", label: "Travel and conveyance", group: "C_overheads" },
  { key: "oh_comm", label: "Communication expenses ( Exclude reimbursed by customer )", group: "C_overheads" },
  { key: "oh_housekeeping", label: "House keeping expenses", group: "C_overheads" },
  { key: "oh_security", label: "Security expenses", group: "C_overheads" },
  { key: "oh_professional", label: "Professional and legal fees", group: "C_overheads" },
  { key: "oh_other_admin", label: "Other Admin expenses", group: "C_overheads" },
  { key: "oh_int_gst", label: "Interest on delayed payment on GST + TDS", group: "C_overheads" },
  { key: "oh_int_pf", label: "Interest on delayed pmt on PF and ESI", group: "C_overheads" },
  { key: "oh_festival", label: "Festival Gift Expenses", group: "C_overheads" },
  { key: "financial_cost", label: "Financial Cost", group: "D_financial" },
  { key: "depreciation", label: "Depreciation Cost", group: "E_depreciation" },
  { key: "fte_paid", label: "Total FTE Paid", group: "meta" },
  { key: "fte_billed", label: "FTE Count Billed", group: "meta" },
  { key: "total_count_billed", label: "Total Count Billed", group: "meta" },
  { key: "seat_utilized", label: "Seat Utilized", group: "meta" },
  { key: "fte_total_count", label: "Total FTE Count", group: "meta" },
  { key: "fte_onsite", label: "Total FTE Onsite", group: "meta" },
  { key: "fte_excl_onsite", label: "Total FTE Excl Onsite", group: "meta" },
  { key: "fte_total", label: "Total FTE", group: "meta" },
  { key: "leave_count", label: "Leave Encashment & Gratuity Count", group: "meta" },
  { key: "mgmt_count", label: "Management FTE Count", group: "meta" },
];

const norm = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const LOOKUP = new Map<string, { key: string; group: string; label: string }>();
for (const t of TEMPLATE) {
  LOOKUP.set(norm(t.label), { key: t.key, group: t.group, label: t.label });
  (t.aliases ?? []).forEach((a) => LOOKUP.set(norm(a), { key: t.key, group: t.group, label: t.label }));
}

function toNum(v: unknown): number | null {
  if (v == null || v === "") return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  const n = Number(String(v).replace(/[,₹$\s]/g, ""));
  return Number.isFinite(n) ? n : null;
}

export function detectMasterPnlSheet(wb: XLSX.WorkBook): string | null {
  for (const name of wb.SheetNames) {
    const ws = wb.Sheets[name];
    const m = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1, defval: null, blankrows: false }) as any[][];
    const labels = m.slice(0, 80).map((r) => norm(String(r?.[0] ?? "")));
    let hits = 0;
    for (const l of labels) if (LOOKUP.has(l)) hits++;
    if (hits >= 8) return name;
  }
  return null;
}

export function parseMasterPnl(wb: XLSX.WorkBook, sheetName: string): ParsedPnl {
  const ws = wb.Sheets[sheetName];
  const m = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1, defval: null, blankrows: false }) as any[][];

  // Row 0 → segment headers; Row 1 → project codes; Row 2 → short names
  const seg0 = m[0] ?? [];
  const codes = m[1] ?? [];
  const names = m[2] ?? [];

  const period =
    String(m[0]?.[0] ?? "")
      .replace(/project[- ]?wise report/i, "")
      .trim() || "Period";

  // Compute segment label per column
  const segByCol: string[] = [];
  let cur = "";
  const maxCols = Math.max(seg0.length, codes.length, names.length);
  for (let c = 0; c < maxCols; c++) {
    if (seg0[c] != null && String(seg0[c]).trim() !== "") cur = String(seg0[c]).trim();
    segByCol[c] = cur;
  }

  const projects: ProjectCol[] = [];
  for (let c = 2; c < maxCols; c++) {
    const codeRaw = codes[c];
    const nameRaw = names[c];
    if ((codeRaw == null || String(codeRaw).trim() === "") && (nameRaw == null || String(nameRaw).trim() === ""))
      continue;
    const code = String(codeRaw ?? nameRaw ?? `col${c}`).trim();
    const name = String(nameRaw ?? code).trim();
    const lower = name.toLowerCase();
    const isTotal = /total/.test(lower);
    projects.push({
      idx: c,
      code: isTotal ? `__${lower.replace(/\s+/g, "_")}` : code,
      name,
      segment: segByCol[c] || "Other",
      isTotal,
    });
  }

  const lines: ParsedLine[] = [];
  const metaMap = new Map<string, ParsedMeta>();
  const unmapped = new Set<string>();

  for (let r = 3; r < m.length; r++) {
    const row = m[r];
    if (!row) continue;
    const labelRaw = row[0];
    if (labelRaw == null || String(labelRaw).trim() === "") continue;
    const key = norm(String(labelRaw));
    const hit = LOOKUP.get(key);
    if (!hit) {
      unmapped.add(String(labelRaw).trim());
      continue;
    }
    for (const p of projects) {
      if (p.isTotal) continue;
      const amt = toNum(row[p.idx]);
      if (hit.group === "meta") {
        const existing = metaMap.get(p.code) ?? { project_code: p.code };
        (existing as any)[hit.key] = amt;
        metaMap.set(p.code, existing);
      } else {
        lines.push({
          project_code: p.code,
          project_name: p.name,
          segment: p.segment,
          line_key: hit.key,
          line_label: hit.label,
          line_group: hit.group,
          amount: amt,
        });
      }
    }
  }

  return {
    period,
    projects: projects.filter((p) => !p.isTotal),
    lines,
    meta: Array.from(metaMap.values()),
    unmappedLabels: Array.from(unmapped),
  };
}

export async function parseFile(file: File): Promise<{ wb: XLSX.WorkBook; pnl: ParsedPnl | null; sheetName: string | null }> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const sheetName = detectMasterPnlSheet(wb);
  const pnl = sheetName ? parseMasterPnl(wb, sheetName) : null;
  return { wb, pnl, sheetName };
}

// ---- Compute totals ----
export type ProjectTotals = {
  code: string;
  name: string;
  segment: string;
  A_revenue: number;
  B_fixed: number;
  B_variable: number;
  B_manpower: number;
  B_total: number;
  C_overheads: number;
  D_financial: number;
  E_depreciation: number;
  gross_margin: number;
  operating_profit: number;
  net_profit: number;
  fte_billed: number;
  fte_paid: number;
  seat_utilized: number;
  revenue_per_fte: number;
  cost_per_fte: number;
  gm_per_fte: number;
};

export function computeTotals(pnl: ParsedPnl): { byProject: ProjectTotals[]; bySegment: Record<string, ProjectTotals>; grand: ProjectTotals } {
  const metaByCode = new Map(pnl.meta.map((m) => [m.project_code, m]));
  const groups = ["A_revenue", "B_fixed", "B_variable", "B_manpower", "C_overheads", "D_financial", "E_depreciation"] as const;

  const init = (code: string, name: string, segment: string): ProjectTotals => ({
    code, name, segment,
    A_revenue: 0, B_fixed: 0, B_variable: 0, B_manpower: 0, B_total: 0,
    C_overheads: 0, D_financial: 0, E_depreciation: 0,
    gross_margin: 0, operating_profit: 0, net_profit: 0,
    fte_billed: 0, fte_paid: 0, seat_utilized: 0,
    revenue_per_fte: 0, cost_per_fte: 0, gm_per_fte: 0,
  });

  const byProject: ProjectTotals[] = pnl.projects.map((p) => {
    const t = init(p.code, p.name, p.segment);
    for (const l of pnl.lines) {
      if (l.project_code !== p.code) continue;
      const g = l.line_group as typeof groups[number];
      if (groups.includes(g)) (t as any)[g] += l.amount ?? 0;
    }
    const m = metaByCode.get(p.code);
    t.fte_billed = m?.fte_billed ?? 0;
    t.fte_paid = m?.fte_paid ?? 0;
    t.seat_utilized = m?.seat_utilized ?? 0;
    finalize(t);
    return t;
  });

  function finalize(t: ProjectTotals) {
    t.B_total = t.B_fixed + t.B_variable + t.B_manpower;
    t.gross_margin = t.A_revenue - t.B_total;
    t.operating_profit = t.A_revenue - t.B_total - t.C_overheads - t.D_financial;
    t.net_profit = t.operating_profit - t.E_depreciation;
    const f = t.fte_billed || t.fte_paid;
    t.revenue_per_fte = f ? t.A_revenue / f : 0;
    t.cost_per_fte = f ? (t.B_total + t.C_overheads) / f : 0;
    t.gm_per_fte = f ? t.gross_margin / f : 0;
  }

  const bySegment: Record<string, ProjectTotals> = {};
  for (const p of byProject) {
    const seg = p.segment || "Other";
    if (!bySegment[seg]) bySegment[seg] = init("__seg_" + seg, seg, seg);
    const s = bySegment[seg];
    for (const k of groups) (s as any)[k] += (p as any)[k];
    s.fte_billed += p.fte_billed; s.fte_paid += p.fte_paid; s.seat_utilized += p.seat_utilized;
  }
  Object.values(bySegment).forEach(finalize);

  const grand = init("__grand", "Grand Total", "");
  for (const p of byProject) {
    for (const k of groups) (grand as any)[k] += (p as any)[k];
    grand.fte_billed += p.fte_billed; grand.fte_paid += p.fte_paid; grand.seat_utilized += p.seat_utilized;
  }
  finalize(grand);

  return { byProject, bySegment, grand };
}

export function fmtINR(n: number, opts: { compact?: boolean } = {}): string {
  if (!Number.isFinite(n)) return "—";
  const abs = Math.abs(n);
  if (opts.compact !== false) {
    if (abs >= 1e7) return `${n < 0 ? "-" : ""}₹${(abs / 1e7).toFixed(2)} Cr`;
    if (abs >= 1e5) return `${n < 0 ? "-" : ""}₹${(abs / 1e5).toFixed(2)} L`;
  }
  return `${n < 0 ? "-" : ""}₹${new Intl.NumberFormat("en-IN").format(Math.round(abs))}`;
}
