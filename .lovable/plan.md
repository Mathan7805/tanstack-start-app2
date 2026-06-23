## Goal

Replace all dummy dashboard data with a real pipeline:
**Excel upload → parsed & stored → allocation engine → Project-wise Profitability report** that mirrors your `Profitability Apr-26` sheet (Revenue → COSR → Overheads → Gross Margin → Operating Profit → Net Profit + per-FTE ratios, broken down by project code).

## What I learned from your file

Your master profitability sheet has a fixed row template (~100 line items grouped A Revenue / B COSR / C Overheads / D+E+F Other / Gross Margin / Operating Profit / Net Profit / FTE counts / Ratios) and one column per project code (100024, 100027, …) plus segment totals (Non-Voice, Voice, Onsite, IT, Grand Total). Supporting sheets: `Revenue`, three `Timesheet-*` sheets, `Seat Utilization 25-26`, `System Utilization`.

This becomes our canonical schema.

## Plan

### 1. Enable Lovable Cloud + schema
Tables:
- `projects` (code, name, segment: voice/non_voice/onsite/it)
- `pnl_uploads` (id, persona, filename, period, uploaded_by, raw_json, status)
- `pnl_lines` (upload_id, project_code, line_key, line_label, group, amount)  — flattened from the master sheet
- `headcount` (upload_id, project_code, fte_paid, fte_billed, seat_utilized, onsite, mgmt)
- `seat_util`, `system_util`, `timesheets` (upload_id, project_code, person, hours, …)
- `pnl_runs` (period, computed_json, published_at) — snapshot for CFO publish

RLS + grants per Lovable rules.

### 2. Smart parser (`parseFinSheet`)
Detects the uploaded file's shape:
- **Master P&L template** (your sample) → maps rows by label, columns by project code → writes `pnl_lines` + `headcount` rows.
- **Revenue / Timesheet / Seat / System sheets** → writes to matching tables.
- **Generic persona uploads** (IT/Ops/Facilities single-table sheets) → keep current field extraction, store rows.

Label matching uses normalized keys (lowercase, strip punctuation) against a fixed map of the ~100 line items, with confidence + an "unmapped rows" review panel.

### 3. UploadCenter refactor
- After parsing, POST to a `saveUpload` server fn (createServerFn + supabaseAdmin) instead of holding in component state.
- Show mapping preview (matched rows / unmapped rows / project columns detected) before "Confirm & Save".
- Add UploadCenter to **CFO Overview** ("Upload finance master") — currently missing.

### 4. Allocation / calc engine (`computeProfitability` server fn)
For a given period:
1. Pull latest `pnl_lines` rows.
2. Compute group subtotals (A, B, C, D+E+F).
3. Compute Gross Margin (A−B), Operating Profit (A−B−C−D), Net Profit (H−E−F) per project + per segment + grand total.
4. Compute ratios: Revenue/FTE, GM/FTE, Cost/FTE, COSR/FTE, COSR÷(B+C).
5. Write `pnl_runs` snapshot.

### 5. New page: `/cfo/profitability` — Project-wise Profitability
Renders the exact template:
- Sticky left column = line items in your order/grouping.
- Horizontally scrollable project columns grouped by segment (Non-Voice | Voice | Onsite | IT | Grand Total) with segment subtotals.
- Bold totals rows; sub-rows indented; same Indian-rupee formatting.
- Export to Excel (xlsx) regenerating the same layout.
- "Publish period" button → snapshots to `pnl_runs`.

### 6. Rewire existing dashboards to live data
- CFO Overview, CFO P&L Review, Finance, IT, Ops, Facilities index pages: replace hardcoded numbers with `useQuery` against the latest `pnl_runs` (or fall back to "No data yet — upload your sheet" empty state).
- Keep current charts; just bind to computed numbers.

### 7. Out of scope for this pass
- Invoice folder watcher / AI OCR for vendor invoices (use case #2) — will be a follow-up once #1, #3–6 are working end-to-end. Today's UI placeholder stays but I'll mark it clearly as "coming next".

## Deliverable

After this pass: you upload your `Profitability Apr-26` sheet on the CFO Overview → see the exact same numbers rendered in `/cfo/profitability` with segment totals + per-FTE ratios → click Publish → CFO Overview KPIs and P&L Review reflect the published period. All personas' dashboards read the same store.

Shall I proceed?
