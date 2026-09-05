-- Non-destructive cleanup for PolskiEMS supplier taxonomy.
-- Stable keys/slugs stay technical; public labels are normalized to Polish.

CREATE TABLE IF NOT EXISTS public.taxonomy_sections (
  key varchar(64) PRIMARY KEY,
  name varchar(120) NOT NULL UNIQUE,
  description text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp without time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.taxonomy_sections ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.services ADD COLUMN IF NOT EXISTS sort_order integer;
ALTER TABLE public.capabilities ADD COLUMN IF NOT EXISTS sort_order integer;
ALTER TABLE public.industries ADD COLUMN IF NOT EXISTS sort_order integer;
ALTER TABLE public.certifications ADD COLUMN IF NOT EXISTS sort_order integer;

INSERT INTO public.taxonomy_sections (key, name, description, sort_order, is_active) VALUES
  ('company_type', 'Typ firmy', 'Określa czym jest dostawca: EMS, producent PCB, biuro projektowe, dystrybutor komponentów itd.', 10, true),
  ('services', 'Usługi', 'Co firma wykonuje dla klienta: montaż SMT/SMD, THT, PCB, box build, testowanie, prototypowanie itd.', 20, true),
  ('capabilities', 'Możliwości technologiczne', 'Jakie procesy, technologie i zaplecze posiada firma: AOI, SPI, X-Ray, BGA, traceability, audyt itd.', 30, true),
  ('industries', 'Branże', 'Dla jakich sektorów firma pracuje: automotive, medical, defence, industrial, rail, telecom itd.', 40, true),
  ('certifications', 'Certyfikaty i standardy', 'Normy, certyfikaty i standardy jakości deklarowane lub potwierdzone dla firmy.', 50, true),
  ('production_scale', 'Skala produkcji', 'Zakres produkcji obsługiwany przez firmę: prototypy, małe serie, średnie serie, duże serie i produkcja masowa.', 60, true),
  ('location', 'Lokalizacja', 'Województwo i dane lokalizacyjne firmy.', 70, true)
ON CONFLICT (key) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active;

INSERT INTO public.services (slug, name, is_active, sort_order) VALUES
  ('smt_assembly', 'Montaż SMT / SMD', true, 10),
  ('tht_assembly', 'Montaż THT', true, 20),
  ('mixed_technology', 'Montaż mieszany SMT + THT', true, 30),
  ('pcb_assembly', 'Montaż PCB', true, 40),
  ('box_build', 'Box Build / montaż urządzeń', true, 50),
  ('cable_assembly', 'Montaż kabli i wiązek', true, 60),
  ('prototype_assembly', 'Prototypowanie elektroniki', true, 70),
  ('npi', 'NPI / uruchomienie nowego produktu', true, 80),
  ('design_support', 'Projektowanie elektroniki / wsparcie DFM', true, 90),
  ('component_procurement', 'Zakup / kompletacja komponentów', true, 100),
  ('pcb_sourcing', 'Dostawa PCB', true, 110),
  ('testing', 'Testowanie elektroniki', true, 120),
  ('programming', 'Programowanie układów', true, 130),
  ('repair_rework', 'Serwis / naprawa / rework', true, 140),
  ('electromechanical_assembly', 'Montaż elektromechaniczny', true, 150),
  ('supply_chain_management', 'Zarządzanie łańcuchem dostaw', true, 160)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order;

INSERT INTO public.capabilities (slug, name, is_active, sort_order) VALUES
  ('aoi', 'Inspekcja AOI', true, 10),
  ('spi', 'Inspekcja SPI', true, 20),
  ('x_ray', 'Inspekcja X-Ray', true, 30),
  ('bga', 'Montaż BGA', true, 40),
  ('fine_pitch', 'Montaż fine pitch', true, 50),
  ('flying_probe', 'Test Flying Probe', true, 60),
  ('ict', 'Test ICT', true, 70),
  ('functional_testing', 'Test funkcjonalny', true, 80),
  ('selective_soldering', 'Lutowanie selektywne', true, 90),
  ('wave_soldering', 'Lutowanie na fali', true, 100),
  ('conformal_coating', 'Conformal coating / lakierowanie PCB', true, 110),
  ('pcb_cleaning', 'Mycie PCB', true, 120),
  ('potting', 'Hermetyzacja / zalewanie', true, 130),
  ('traceability', 'Traceability / identyfikowalność produkcji', true, 140),
  ('cleanroom', 'Cleanroom / strefa czysta', true, 150),
  ('quality_control', 'Kontrola jakości', true, 160),
  ('process_audit', 'Możliwość audytu procesu', true, 170)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order;

INSERT INTO public.industries (slug, name, is_active, sort_order) VALUES
  ('automotive', 'Motoryzacja', true, 10),
  ('defence', 'Obronność / High-Reliability', true, 20),
  ('medical', 'Medycyna', true, 30),
  ('industrial', 'Przemysł', true, 40),
  ('aerospace', 'Lotnictwo / Aerospace', true, 50),
  ('rail', 'Kolej', true, 60),
  ('telecom', 'Telekomunikacja', true, 70),
  ('energy', 'Energetyka', true, 80),
  ('iot', 'IoT', true, 90),
  ('consumer_electronics', 'Elektronika użytkowa', true, 100),
  ('robotics', 'Robotyka', true, 110)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order;

INSERT INTO public.certifications (code, name, is_active, sort_order) VALUES
  ('ISO-9001', 'ISO 9001 – zarządzanie jakością', true, 10),
  ('ISO-13485', 'ISO 13485 – wyroby medyczne', true, 20),
  ('IATF-16949', 'IATF 16949 – motoryzacja', true, 30),
  ('ISO-14001', 'ISO 14001 – zarządzanie środowiskowe', true, 40),
  ('ISO-45001', 'ISO 45001 – BHP', true, 50),
  ('AQAP-2110', 'AQAP 2110 – obronność', true, 60),
  ('AS9100', 'AS9100 – lotnictwo i kosmos', true, 70),
  ('AS9120', 'AS9120 – dystrybucja lotnicza', true, 80),
  ('IPC-A-610-CLASS-1', 'IPC-A-610 Class 1', true, 90),
  ('IPC-A-610-CLASS-2', 'IPC-A-610 Class 2', true, 100),
  ('IPC-A-610-CLASS-3', 'IPC-A-610 Class 3 – wysoka niezawodność', true, 110),
  ('J-STD-001', 'J-STD-001 – wymagania lutowania', true, 120)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order;

UPDATE public.produkcja AS p
SET zakres = v.new_name,
    sort_order = v.sort_order
FROM (VALUES
  ('Prototype (1-10)', 'Prototypy (1–10 szt.)', 10),
  ('Low Volume (11-50)', 'Małe serie (11–50 szt.)', 20),
  ('Medium Volume (51-250)', 'Średnie serie (51–250 szt.)', 30),
  ('High Volume (251-1000)', 'Duże serie (251–1000 szt.)', 40),
  ('Mass Production (1000+)', 'Produkcja masowa (1000+ szt.)', 50)
) AS v(old_name, new_name, sort_order)
WHERE p.zakres = v.old_name OR p.sort_order = v.sort_order;

CREATE INDEX IF NOT EXISTS services_sort_order_idx ON public.services (sort_order, name);
CREATE INDEX IF NOT EXISTS capabilities_sort_order_idx ON public.capabilities (sort_order, name);
CREATE INDEX IF NOT EXISTS industries_sort_order_idx ON public.industries (sort_order, name);
CREATE INDEX IF NOT EXISTS certifications_sort_order_idx ON public.certifications (sort_order, name);
CREATE INDEX IF NOT EXISTS taxonomy_sections_sort_order_idx ON public.taxonomy_sections (sort_order, name);
