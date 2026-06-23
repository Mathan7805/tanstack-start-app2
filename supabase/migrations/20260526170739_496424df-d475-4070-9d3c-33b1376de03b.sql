
CREATE TABLE public.pnl_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  persona TEXT NOT NULL DEFAULT 'cfo',
  period TEXT,
  sheet_kind TEXT NOT NULL DEFAULT 'master_pnl',
  raw_json JSONB,
  project_codes TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.pnl_lines (
  id BIGSERIAL PRIMARY KEY,
  upload_id UUID NOT NULL REFERENCES public.pnl_uploads(id) ON DELETE CASCADE,
  project_code TEXT NOT NULL,
  project_name TEXT,
  segment TEXT,
  line_key TEXT NOT NULL,
  line_label TEXT NOT NULL,
  line_group TEXT,
  amount NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX pnl_lines_upload_idx ON public.pnl_lines(upload_id);
CREATE INDEX pnl_lines_project_idx ON public.pnl_lines(project_code);

CREATE TABLE public.pnl_meta (
  id BIGSERIAL PRIMARY KEY,
  upload_id UUID NOT NULL REFERENCES public.pnl_uploads(id) ON DELETE CASCADE,
  project_code TEXT NOT NULL,
  fte_paid NUMERIC,
  fte_billed NUMERIC,
  total_count_billed NUMERIC,
  seat_utilized NUMERIC,
  fte_onsite NUMERIC,
  fte_total NUMERIC,
  mgmt_count NUMERIC,
  leave_gratuity_count NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX pnl_meta_upload_idx ON public.pnl_meta(upload_id);

CREATE TABLE public.pnl_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  upload_id UUID REFERENCES public.pnl_uploads(id) ON DELETE SET NULL,
  period TEXT,
  computed JSONB NOT NULL,
  published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.pnl_uploads TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pnl_lines TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pnl_meta TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pnl_runs TO anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.pnl_lines_id_seq TO anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.pnl_meta_id_seq TO anon, authenticated;
GRANT ALL ON public.pnl_uploads TO service_role;
GRANT ALL ON public.pnl_lines TO service_role;
GRANT ALL ON public.pnl_meta TO service_role;
GRANT ALL ON public.pnl_runs TO service_role;

ALTER TABLE public.pnl_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pnl_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pnl_meta ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pnl_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "open read uploads" ON public.pnl_uploads FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "open write uploads" ON public.pnl_uploads FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "open update uploads" ON public.pnl_uploads FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "open delete uploads" ON public.pnl_uploads FOR DELETE TO anon, authenticated USING (true);

CREATE POLICY "open read lines" ON public.pnl_lines FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "open write lines" ON public.pnl_lines FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "open update lines" ON public.pnl_lines FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "open delete lines" ON public.pnl_lines FOR DELETE TO anon, authenticated USING (true);

CREATE POLICY "open read meta" ON public.pnl_meta FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "open write meta" ON public.pnl_meta FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "open update meta" ON public.pnl_meta FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "open delete meta" ON public.pnl_meta FOR DELETE TO anon, authenticated USING (true);

CREATE POLICY "open read runs" ON public.pnl_runs FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "open write runs" ON public.pnl_runs FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "open update runs" ON public.pnl_runs FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "open delete runs" ON public.pnl_runs FOR DELETE TO anon, authenticated USING (true);
