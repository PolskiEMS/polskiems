ALTER TABLE public.producer_certifications
  DROP CONSTRAINT IF EXISTS producer_certifications_status_check;

ALTER TABLE public.producer_certifications
  ADD CONSTRAINT producer_certifications_status_check
  CHECK (status IN ('listed', 'company_confirmed', 'verified', 'admin'));
