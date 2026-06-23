
-- Unified invoices table (AR + AP) populated from CFO Invoices auto-extraction
CREATE TABLE public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN ('client_issued','client_billing','vendor_received')),
  source_filename text NOT NULL,
  invoice_number text,
  invoice_date date,
  party_name text,
  party_gstin text,
  currency text DEFAULT 'INR',
  amount numeric,
  taxable_amount numeric,
  gst_amount numeric,
  party_status text,
  cost_center text,
  line_summary text,
  raw_fields jsonb,
  approval_status text NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending','approved','rejected')),
  decided_at timestamptz,
  decided_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoices TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoices TO anon;
GRANT ALL ON public.invoices TO service_role;

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "open read invoices" ON public.invoices FOR SELECT USING (true);
CREATE POLICY "open write invoices" ON public.invoices FOR INSERT WITH CHECK (true);
CREATE POLICY "open update invoices" ON public.invoices FOR UPDATE USING (true);
CREATE POLICY "open delete invoices" ON public.invoices FOR DELETE USING (true);

CREATE INDEX idx_invoices_kind_status ON public.invoices(kind, approval_status);
CREATE INDEX idx_invoices_created ON public.invoices(created_at DESC);

-- Generic approvals queue: link to any source via source_type + source_id
CREATE TABLE public.approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type text NOT NULL CHECK (source_type IN ('invoice','pnl_upload','finance_master','facilities_cost','it_cost')),
  source_id text NOT NULL,
  title text NOT NULL,
  submitter text,
  team text,
  amount numeric,
  currency text DEFAULT 'INR',
  summary jsonb,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  decided_at timestamptz,
  decided_by uuid,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.approvals TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.approvals TO anon;
GRANT ALL ON public.approvals TO service_role;

ALTER TABLE public.approvals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "open read approvals" ON public.approvals FOR SELECT USING (true);
CREATE POLICY "open write approvals" ON public.approvals FOR INSERT WITH CHECK (true);
CREATE POLICY "open update approvals" ON public.approvals FOR UPDATE USING (true);
CREATE POLICY "open delete approvals" ON public.approvals FOR DELETE USING (true);

CREATE INDEX idx_approvals_status ON public.approvals(status, created_at DESC);
CREATE UNIQUE INDEX idx_approvals_source ON public.approvals(source_type, source_id);
