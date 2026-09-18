-- RFQ etapy 1-3: nowy model formularza zapytań ofertowych.
-- Migracja jest addytywna i zachowuje dotychczasowe pola dla kompatybilności.

ALTER TABLE public.inquiries
  ADD COLUMN IF NOT EXISTS matching_mode varchar(32) NOT NULL DEFAULT 'auto_match',
  ADD COLUMN IF NOT EXISTS preferred_company_id integer REFERENCES public.producenci(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS service_slugs text[] NOT NULL DEFAULT ARRAY[]::text[],
  ADD COLUMN IF NOT EXISTS capability_slugs text[] NOT NULL DEFAULT ARRAY[]::text[],
  ADD COLUMN IF NOT EXISTS industry_slugs text[] NOT NULL DEFAULT ARRAY[]::text[],
  ADD COLUMN IF NOT EXISTS certification_codes text[] NOT NULL DEFAULT ARRAY[]::text[],
  ADD COLUMN IF NOT EXISTS production_scale_ids integer[] NOT NULL DEFAULT ARRAY[]::integer[],
  ADD COLUMN IF NOT EXISTS preferred_region_ids integer[] NOT NULL DEFAULT ARRAY[]::integer[];

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'inquiries_matching_mode_check'
      AND conrelid = 'public.inquiries'::regclass
  ) THEN
    ALTER TABLE public.inquiries
      ADD CONSTRAINT inquiries_matching_mode_check
      CHECK (matching_mode IN ('selected_company', 'auto_match'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS inquiries_matching_mode_idx
  ON public.inquiries (matching_mode);

CREATE INDEX IF NOT EXISTS inquiries_preferred_company_id_idx
  ON public.inquiries (preferred_company_id);
