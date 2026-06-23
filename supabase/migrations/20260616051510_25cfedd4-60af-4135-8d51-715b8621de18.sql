ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS amount_inr numeric,
  ADD COLUMN IF NOT EXISTS fx_rate numeric;

ALTER TABLE public.approvals
  ADD COLUMN IF NOT EXISTS amount_original numeric,
  ADD COLUMN IF NOT EXISTS fx_rate numeric;

COMMENT ON COLUMN public.invoices.amount_inr IS 'Invoice total converted to INR using fx_rate at capture time';
COMMENT ON COLUMN public.invoices.fx_rate IS 'Multiplier applied to amount (in currency) to get amount_inr';
COMMENT ON COLUMN public.approvals.amount_original IS 'Original amount in source currency before INR normalization';