-- PolskiEMS Supplier Data Model 2026
-- Keeps the legacy EMS taxonomy for backward compatibility while introducing
-- the structured supplier model used by the 2026 product concept.

ALTER TABLE public.producenci
  ADD COLUMN IF NOT EXISTS "companyType" varchar(64) NOT NULL DEFAULT 'unclassified';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'producenci_company_type_check'
  ) THEN
    ALTER TABLE public.producenci
      ADD CONSTRAINT producenci_company_type_check CHECK ("companyType" IN (
        'unclassified',
        'ems',
        'pcb_manufacturer',
        'electronics_manufacturer',
        'electronics_design',
        'cable_wire_harness',
        'box_build_system_integration',
        'testing_laboratory',
        'component_manufacturer',
        'component_distributor',
        'materials_supplier',
        'equipment_consulting'
      ));
  END IF;
END $$;

ALTER TABLE public.produkcja ADD COLUMN IF NOT EXISTS sort_order integer;

-- "Umowa kontraktowa" is a commercial model, not a production scale.
DELETE FROM public.producenci_ems_produkcja WHERE produkcja_id = 1;
DELETE FROM public.produkcja WHERE id = 1;

UPDATE public.produkcja SET zakres = 'Prototype (1-10)', sort_order = 10 WHERE id = 2;
UPDATE public.produkcja SET zakres = 'Low Volume (11-50)', sort_order = 20 WHERE id = 3;
UPDATE public.produkcja SET zakres = 'Medium Volume (51-250)', sort_order = 30 WHERE id = 4;
UPDATE public.produkcja SET zakres = 'High Volume (251-1000)', sort_order = 40 WHERE id = 5;
UPDATE public.produkcja SET zakres = 'Mass Production (1000+)', sort_order = 50 WHERE id = 6;

CREATE TABLE IF NOT EXISTS public.services (
  id serial PRIMARY KEY,
  slug varchar(100) NOT NULL UNIQUE,
  name varchar(150) NOT NULL UNIQUE,
  is_active boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.capabilities (
  id serial PRIMARY KEY,
  slug varchar(100) NOT NULL UNIQUE,
  name varchar(150) NOT NULL UNIQUE,
  is_active boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.industries (
  id serial PRIMARY KEY,
  slug varchar(100) NOT NULL UNIQUE,
  name varchar(150) NOT NULL UNIQUE,
  is_active boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.certifications (
  id serial PRIMARY KEY,
  code varchar(80) NOT NULL UNIQUE,
  name varchar(180) NOT NULL,
  is_active boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.producer_services (
  company_id integer NOT NULL REFERENCES public.producenci(id) ON DELETE CASCADE,
  service_id integer NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  source varchar(32) NOT NULL DEFAULT 'listed',
  PRIMARY KEY (company_id, service_id)
);

CREATE TABLE IF NOT EXISTS public.producer_capabilities (
  company_id integer NOT NULL REFERENCES public.producenci(id) ON DELETE CASCADE,
  capability_id integer NOT NULL REFERENCES public.capabilities(id) ON DELETE CASCADE,
  source varchar(32) NOT NULL DEFAULT 'listed',
  PRIMARY KEY (company_id, capability_id)
);

CREATE TABLE IF NOT EXISTS public.producer_industries (
  company_id integer NOT NULL REFERENCES public.producenci(id) ON DELETE CASCADE,
  industry_id integer NOT NULL REFERENCES public.industries(id) ON DELETE CASCADE,
  source varchar(32) NOT NULL DEFAULT 'listed',
  PRIMARY KEY (company_id, industry_id)
);

CREATE TABLE IF NOT EXISTS public.producer_certifications (
  company_id integer NOT NULL REFERENCES public.producenci(id) ON DELETE CASCADE,
  certification_id integer NOT NULL REFERENCES public.certifications(id) ON DELETE CASCADE,
  status varchar(24) NOT NULL DEFAULT 'listed',
  PRIMARY KEY (company_id, certification_id),
  CONSTRAINT producer_certifications_status_check CHECK (status IN ('listed','company_confirmed','verified'))
);

CREATE INDEX IF NOT EXISTS producer_services_service_idx ON public.producer_services(service_id, company_id);
CREATE INDEX IF NOT EXISTS producer_capabilities_capability_idx ON public.producer_capabilities(capability_id, company_id);
CREATE INDEX IF NOT EXISTS producer_industries_industry_idx ON public.producer_industries(industry_id, company_id);
CREATE INDEX IF NOT EXISTS producer_certifications_certification_idx ON public.producer_certifications(certification_id, company_id);
CREATE INDEX IF NOT EXISTS producenci_company_type_idx ON public.producenci("companyType");

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.industries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.producer_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.producer_capabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.producer_industries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.producer_certifications ENABLE ROW LEVEL SECURITY;

INSERT INTO public.services (slug, name) VALUES
  ('pcb_assembly','PCB Assembly'),
  ('smt_assembly','SMT Assembly'),
  ('tht_assembly','THT Assembly'),
  ('mixed_technology','Mixed Technology Assembly'),
  ('prototype_assembly','Prototype Assembly'),
  ('npi','NPI / New Product Introduction'),
  ('box_build','Box Build / Final Assembly'),
  ('cable_assembly','Cable Assembly'),
  ('electromechanical_assembly','Electromechanical Assembly'),
  ('testing','Testing'),
  ('programming','Programming'),
  ('component_procurement','Component Procurement'),
  ('pcb_sourcing','PCB Sourcing'),
  ('design_support','Electronics Design Support'),
  ('repair_rework','Repair / Rework'),
  ('supply_chain_management','Supply Chain Management')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.capabilities (slug, name) VALUES
  ('bga','BGA'),
  ('fine_pitch','Fine Pitch'),
  ('aoi','AOI'),
  ('spi','SPI'),
  ('x_ray','X-Ray'),
  ('ict','ICT'),
  ('flying_probe','Flying Probe'),
  ('functional_testing','Functional Testing'),
  ('selective_soldering','Selective Soldering'),
  ('wave_soldering','Wave Soldering'),
  ('conformal_coating','Conformal Coating'),
  ('potting','Potting / Encapsulation'),
  ('pcb_cleaning','PCB Cleaning'),
  ('traceability','Production Traceability'),
  ('cleanroom','Cleanroom')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.industries (slug, name) VALUES
  ('industrial','Industrial'),
  ('automotive','Automotive'),
  ('medical','Medical'),
  ('consumer_electronics','Consumer Electronics'),
  ('telecom','Telecom'),
  ('energy','Energy'),
  ('iot','IoT'),
  ('rail','Rail'),
  ('aerospace','Aerospace'),
  ('defence','Defence'),
  ('robotics','Robotics')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.certifications (code, name) VALUES
  ('ISO-9001','ISO 9001'),
  ('ISO-14001','ISO 14001'),
  ('ISO-13485','ISO 13485'),
  ('IATF-16949','IATF 16949'),
  ('ISO-45001','ISO 45001'),
  ('AS9100','AS9100'),
  ('AS9120','AS9120'),
  ('AQAP-2110','AQAP 2110'),
  ('IPC-A-610-CLASS-3','IPC-A-610 Class 3'),
  ('J-STD-001','J-STD-001')
ON CONFLICT (code) DO NOTHING;

-- Placeholders are not real company data.
UPDATE public.producenci SET opis = NULL
WHERE btrim(coalesce(opis,'')) IN ('Twój krótki opis','Twoj krotki opis');

UPDATE public.producenci SET telefon = NULL
WHERE btrim(coalesce(telefon,'')) IN ('Twój numer telefonu','Twoj numer telefonu');

-- Correct known URL mismatch.
UPDATE public.producenci SET www = 'https://www.asonik.pl'
WHERE nazwa = 'ASONIK' AND (www IS NULL OR www ILIKE '%artronic%');

-- Conservative primary company type assignments. Uncertain records remain unclassified.
UPDATE public.producenci SET "companyType" = 'ems'
WHERE nazwa IN ('Techbit','Nordes Sp. z o.o.','3P EMS','Assel sp. z o. o.','AssemTec Europe','Semicon Sp. z o.o.','ASZ Electronics Solutions');
UPDATE public.producenci SET "companyType" = 'component_manufacturer' WHERE nazwa = 'AET Sp. z o.o.';
UPDATE public.producenci SET "companyType" = 'component_distributor' WHERE nazwa = 'Mouser Electronics';
UPDATE public.producenci SET "companyType" = 'equipment_consulting' WHERE nazwa = 'KONTECH SMT Consulting';
UPDATE public.producenci SET "companyType" = 'materials_supplier' WHERE nazwa = 'C.H. Erbslöh Polska Sp. z o.o.';
UPDATE public.producenci SET "companyType" = 'electronics_manufacturer' WHERE nazwa = 'ASONIK';
UPDATE public.producenci SET "companyType" = 'electronics_design' WHERE nazwa = 'Microbotic';

-- Migrate only unambiguous legacy relationships.
INSERT INTO public.producer_services (company_id, service_id, source)
SELECT DISTINCT ped.company_id, s.id, 'legacy_import'
FROM public.producenci_ems_dzialania ped
JOIN public.dzialania_ems d ON d.id = ped.dzialanie_id
JOIN public.services s ON s.slug = CASE d.nazwa
  WHEN 'Projekt' THEN 'design_support'
  WHEN 'Dostarcza PCB' THEN 'pcb_sourcing'
  WHEN 'Kupuje komponenty' THEN 'component_procurement'
  WHEN 'Montaż SMD' THEN 'smt_assembly'
  WHEN 'Montaż SMT' THEN 'smt_assembly'
  WHEN 'Montaż THT' THEN 'tht_assembly'
  WHEN 'Inspekcja' THEN 'testing'
  WHEN 'Test Flying Probe' THEN 'testing'
  WHEN 'Test funkcjonalny' THEN 'testing'
  WHEN 'Montaż obudowy' THEN 'box_build'
  WHEN 'Produkt finalny' THEN 'box_build'
  ELSE NULL
END
WHERE d.nazwa IN ('Projekt','Dostarcza PCB','Kupuje komponenty','Montaż SMD','Montaż SMT','Montaż THT','Inspekcja','Test Flying Probe','Test funkcjonalny','Montaż obudowy','Produkt finalny')
ON CONFLICT DO NOTHING;

INSERT INTO public.producer_capabilities (company_id, capability_id, source)
SELECT DISTINCT ped.company_id, c.id, 'legacy_import'
FROM public.producenci_ems_dzialania ped
JOIN public.dzialania_ems d ON d.id = ped.dzialanie_id
JOIN public.capabilities c ON c.slug = CASE d.nazwa
  WHEN 'Test Flying Probe' THEN 'flying_probe'
  WHEN 'Test funkcjonalny' THEN 'functional_testing'
  WHEN 'Conformal Coating' THEN 'conformal_coating'
  WHEN 'Mycie płytek' THEN 'pcb_cleaning'
  ELSE NULL
END
WHERE d.nazwa IN ('Test Flying Probe','Test funkcjonalny','Conformal Coating','Mycie płytek')
ON CONFLICT DO NOTHING;
