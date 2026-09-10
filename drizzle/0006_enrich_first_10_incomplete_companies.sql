-- Enrich first 10 companies with the largest taxonomy gaps.
-- Scope: factual profile data and taxonomy relations based on official company websites and ElektronikaB2B listings.
-- Notes: certifications are inserted only when the source explicitly states a named standard.

UPDATE producenci
SET
  opis = 'Polski producent aparatury elektronicznej sterującej i kontrolno-pomiarowej, działający od 1990 roku; oferuje autorskie urządzenia dla zastosowań medycznych, rolniczych, przemysłowych i edukacyjnych.',
  telefon = '+48 61 8156261 / 509993249',
  adres = 'ul. Słoneczna 6, 62-007 Tuczno'
WHERE nazwa = 'ASONIK';

UPDATE producenci
SET
  opis = 'Dostawca usług EMS z okolic Gdańska, oferujący montaż PCBA, montaż elektromechaniczny, wiązki kablowe, NPI, testy i inspekcje oraz zarządzanie łańcuchem dostaw dla branż przemysłowych i medycznych.',
  telefon = '+48 58 76 75 900',
  adres = 'ul. Batalionów Chłopskich 1, Pruszcz Gdański'
WHERE nazwa = 'Assel sp. z o. o.';

UPDATE producenci
SET
  opis = 'Dostawca usług EMS z Zielonej Góry, oferujący montaż SMD/SMT i THT, kompletację komponentów, dostawę PCB, szablony SMT, AOI, mycie PCB, testy, montaż końcowy i produkcję od prototypów po produkcję masową.',
  telefon = '+48 691 895 106',
  adres = 'ul. Kożuchowska 20C/1.8, 65-364 Zielona Góra'
WHERE nazwa = 'AssemTec Europe';

UPDATE producenci
SET
  opis = 'Polska firma oferująca projektowanie, montaż elektroniki, urządzeń elektromechanicznych i wiązek kablowych; posiada certyfikat ISO 9001:2015 wydany przez DNV i pracuje w strefie EPA/ESD.',
  telefon = '+48 796 002 236'
WHERE nazwa = 'ASZ Electronics Solutions';

UPDATE producenci
SET
  opis = 'Dystrybutor surowców chemicznych, materiałów przemysłowych oraz maszyn i materiałów do elektroniki; posiada ISO 9001:2015 dla dystrybucji surowców chemicznych.',
  telefon = '+48 22 899 19 44',
  adres = 'ul. Farbiarska 69, 02-862 Warszawa'
WHERE nazwa = 'C.H. Erbslöh Polska Sp. z o.o.';

UPDATE producenci
SET
  wojewodztwo_id = (SELECT id FROM wojewodztwa WHERE nazwa = 'Dolnośląskie' LIMIT 1)
WHERE nazwa = 'ARE Jakub Malewicz' AND wojewodztwo_id IS NULL;

UPDATE producenci
SET
  opis = 'Firma specjalizująca się od 2005 roku w kontraktowym montażu elektroniki SMD/SMT i THT, pracująca zgodnie z wymaganiami IPC-A-610F oraz w warunkach ESD.'
WHERE nazwa = 'B.G.-Tronik';

WITH service_map(company_name, service_slug, source) AS (
  VALUES
    ('ASONIK', 'design_support', 'web_verified'),
    ('ASONIK', 'repair_rework', 'web_verified'),
    ('ASONIK', 'stencil_templates', 'elektronikab2b'),

    ('Assel sp. z o. o.', 'pcb_assembly', 'web_verified'),
    ('Assel sp. z o. o.', 'smt_assembly', 'web_verified'),
    ('Assel sp. z o. o.', 'tht_assembly', 'web_verified'),
    ('Assel sp. z o. o.', 'mixed_technology', 'web_verified'),
    ('Assel sp. z o. o.', 'box_build', 'web_verified'),
    ('Assel sp. z o. o.', 'cable_assembly', 'web_verified'),
    ('Assel sp. z o. o.', 'electromechanical_assembly', 'web_verified'),
    ('Assel sp. z o. o.', 'testing', 'web_verified'),
    ('Assel sp. z o. o.', 'component_procurement', 'web_verified'),
    ('Assel sp. z o. o.', 'supply_chain_management', 'web_verified'),
    ('Assel sp. z o. o.', 'npi', 'web_verified'),

    ('AssemTec Europe', 'pcb_assembly', 'web_verified'),
    ('AssemTec Europe', 'smt_assembly', 'web_verified'),
    ('AssemTec Europe', 'tht_assembly', 'web_verified'),
    ('AssemTec Europe', 'mixed_technology', 'web_verified'),
    ('AssemTec Europe', 'prototype_assembly', 'web_verified'),
    ('AssemTec Europe', 'component_procurement', 'web_verified'),
    ('AssemTec Europe', 'pcb_sourcing', 'web_verified'),
    ('AssemTec Europe', 'stencil_templates', 'web_verified'),
    ('AssemTec Europe', 'box_build', 'web_verified'),
    ('AssemTec Europe', 'testing', 'web_verified'),

    ('ASZ Electronics Solutions', 'design_support', 'web_verified'),
    ('ASZ Electronics Solutions', 'pcb_assembly', 'web_verified'),
    ('ASZ Electronics Solutions', 'smt_assembly', 'web_verified'),
    ('ASZ Electronics Solutions', 'tht_assembly', 'web_verified'),
    ('ASZ Electronics Solutions', 'mixed_technology', 'web_verified'),
    ('ASZ Electronics Solutions', 'box_build', 'web_verified'),
    ('ASZ Electronics Solutions', 'cable_assembly', 'web_verified'),
    ('ASZ Electronics Solutions', 'electromechanical_assembly', 'web_verified'),
    ('ASZ Electronics Solutions', 'component_procurement', 'web_verified'),
    ('ASZ Electronics Solutions', 'pcb_sourcing', 'web_verified'),

    ('ARE Jakub Malewicz', 'pcb_sourcing', 'elektronikab2b'),
    ('B.G.-Tronik', 'mixed_technology', 'web_verified'),
    ('B.G.-Tronik', 'prototype_assembly', 'elektronikab2b')
)
INSERT INTO producer_services (company_id, service_id, source)
SELECT p.id, s.id, sm.source
FROM service_map sm
JOIN producenci p ON p.nazwa = sm.company_name
JOIN services s ON s.slug = sm.service_slug
ON CONFLICT (company_id, service_id) DO UPDATE SET source = EXCLUDED.source;

WITH capability_map(company_name, capability_slug, source) AS (
  VALUES
    ('Assel sp. z o. o.', 'conformal_coating', 'web_verified'),
    ('Assel sp. z o. o.', 'potting', 'web_verified'),
    ('Assel sp. z o. o.', 'functional_testing', 'web_verified'),
    ('Assel sp. z o. o.', 'quality_control', 'web_verified'),
    ('Assel sp. z o. o.', 'fine_pitch', 'web_verified'),
    ('Assel sp. z o. o.', 'bga', 'web_verified'),

    ('AssemTec Europe', 'spi', 'web_verified'),
    ('AssemTec Europe', 'aoi', 'web_verified'),
    ('AssemTec Europe', 'wave_soldering', 'web_verified'),
    ('AssemTec Europe', 'pcb_cleaning', 'web_verified'),
    ('AssemTec Europe', 'functional_testing', 'web_verified'),
    ('AssemTec Europe', 'quality_control', 'web_verified'),

    ('ASZ Electronics Solutions', 'quality_control', 'web_verified'),
    ('B.G.-Tronik', 'quality_control', 'web_verified')
)
INSERT INTO producer_capabilities (company_id, capability_id, source)
SELECT p.id, c.id, cm.source
FROM capability_map cm
JOIN producenci p ON p.nazwa = cm.company_name
JOIN capabilities c ON c.slug = cm.capability_slug
ON CONFLICT (company_id, capability_id) DO UPDATE SET source = EXCLUDED.source;

WITH industry_map(company_name, industry_slug, source) AS (
  VALUES
    ('ASONIK', 'medical', 'web_verified'),
    ('ASONIK', 'industrial', 'web_verified'),
    ('Assel sp. z o. o.', 'industrial', 'web_verified'),
    ('Assel sp. z o. o.', 'medical', 'web_verified'),
    ('Assel sp. z o. o.', 'telecom', 'web_verified'),
    ('C.H. Erbslöh Polska Sp. z o.o.', 'industrial', 'web_verified'),
    ('Altway Electronics', 'industrial', 'web_verified'),
    ('ARE Jakub Malewicz', 'industrial', 'elektronikab2b'),
    ('ASZ Electronics Solutions', 'industrial', 'web_verified'),
    ('Lastenic Laser & Electronics', 'industrial', 'elektronikab2b')
)
INSERT INTO producer_industries (company_id, industry_id, source)
SELECT p.id, i.id, im.source
FROM industry_map im
JOIN producenci p ON p.nazwa = im.company_name
JOIN industries i ON i.slug = im.industry_slug
ON CONFLICT (company_id, industry_id) DO UPDATE SET source = EXCLUDED.source;

WITH certification_map(company_name, certification_code, status) AS (
  VALUES
    ('Assel sp. z o. o.', 'ISO-9001', 'verified'),
    ('Assel sp. z o. o.', 'ISO-14001', 'verified'),
    ('Assel sp. z o. o.', 'ISO-13485', 'verified'),
    ('Assel sp. z o. o.', 'IPC-A-610-CLASS-2', 'verified'),
    ('Assel sp. z o. o.', 'IPC-A-610-CLASS-3', 'verified'),
    ('ASZ Electronics Solutions', 'ISO-9001', 'verified'),
    ('C.H. Erbslöh Polska Sp. z o.o.', 'ISO-9001', 'verified')
)
INSERT INTO producer_certifications (company_id, certification_id, status)
SELECT p.id, cert.id, cm.status
FROM certification_map cm
JOIN producenci p ON p.nazwa = cm.company_name
JOIN certifications cert ON cert.code = cm.certification_code
ON CONFLICT (company_id, certification_id) DO UPDATE SET status = EXCLUDED.status;

WITH production_scale_map(company_name, production_label) AS (
  VALUES
    ('AssemTec Europe', 'Prototypy (1–10 szt.)'),
    ('AssemTec Europe', 'Małe serie (11–50 szt.)'),
    ('AssemTec Europe', 'Średnie serie (51–250 szt.)'),
    ('AssemTec Europe', 'Duże serie (251–1000 szt.)'),
    ('AssemTec Europe', 'Produkcja masowa (1000+ szt.)'),
    ('ARE Jakub Malewicz', 'Prototypy (1–10 szt.)'),
    ('B.G.-Tronik', 'Prototypy (1–10 szt.)')
), rows_to_insert AS (
  SELECT p.id AS company_id, pr.id AS produkcja_id
  FROM production_scale_map psm
  JOIN producenci p ON p.nazwa = psm.company_name
  JOIN produkcja pr ON pr.zakres = psm.production_label
)
INSERT INTO producenci_ems_produkcja (company_id, produkcja_id)
SELECT r.company_id, r.produkcja_id
FROM rows_to_insert r
WHERE NOT EXISTS (
  SELECT 1
  FROM producenci_ems_produkcja existing
  WHERE existing.company_id = r.company_id
    AND existing.produkcja_id = r.produkcja_id
);
