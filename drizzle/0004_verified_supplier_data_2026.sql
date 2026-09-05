-- PolskiEMS verified supplier data cleanup, 2026-09
-- Source verification used official company websites where available and current
-- electronics-industry directories only where the official site was unavailable.
-- This migration removes the PROLine test record and fills the 24 previously
-- unclassified real companies with verified primary type, basic profile data,
-- and supported taxonomy relationships.

BEGIN;

DELETE FROM public.company_events
WHERE company_id = (SELECT id FROM public.producenci WHERE nazwa = 'PROLine');
DELETE FROM public.producenci WHERE nazwa = 'PROLine';

UPDATE public.producenci SET "companyType"='component_distributor', opis='Dystrybutor komponentów elektronicznych oferujący także wsparcie projektowe, prototypowanie i usługi produkcji elektronicznej.', adres='ul. Objazdowa 5B, 83-010 Straszyn', telefon='+48 58 691 06 91' WHERE nazwa='MASTERS Sp. z o.o.';
UPDATE public.producenci SET "companyType"='materials_supplier', opis='Producent laserowo wycinanych szablonów SMT i precyzyjnych detali metalowych wykorzystywanych w produkcji elektroniki.', adres='ul. Husarska 5, 58-100 Świdnica', telefon='+48 74 851 48 77' WHERE nazwa='Lastenic Laser & Electronics';
UPDATE public.producenci SET "companyType"='ems', opis='Firma łącząca dystrybucję komponentów i automatyki z kontraktową produkcją elektroniki EMS oraz obsługą BOM.', adres='ul. Karolinki 58, 44-100 Gliwice', telefon='+48 32 339 69 00' WHERE nazwa='JM elektronik Sp. z o.o.';
UPDATE public.producenci SET "companyType"='component_distributor', opis='Autoryzowany dystrybutor podzespołów elektromechanicznych i rozwiązań elektronicznych dla przemysłu, zapewniający wsparcie techniczne i projektowe.', adres='ul. Duńska 2a, 05-152 Czosnów', telefon='+48 22 751 97 44' WHERE nazwa='Eltronika';
UPDATE public.producenci SET "companyType"='ems', opis='Firma EMS oferująca kontraktowy montaż SMT i THT, projektowanie PCB oraz obróbkę CNC.', adres='ul. Łazowska 12, 42-286 Koszęcin', telefon='+48 606 631 532' WHERE nazwa='CELJAR Elektronik';
UPDATE public.producenci SET "companyType"='ems', opis='Kontraktowy producent elektroniki specjalizujący się w montażu SMT/THT, uruchamianiu, testowaniu i realizacji trudnych serii prototypowych.', adres='ul. Młyńska 7, 83-010 Straszyn', telefon='+48 693 115 999' WHERE nazwa='DGTronik Sp. z o.o.';
UPDATE public.producenci SET "companyType"='ems', opis='Kontraktowy producent elektroniki z Sanoka realizujący SMT/THT, projektowanie, kompletację, testy, lakierowanie PCBA i badania EMC.', adres='ul. Przemyska 24d, 38-500 Sanok', telefon='+48 13 306 71 00' WHERE nazwa='EAE Elektronik Spółka z o.o.';
UPDATE public.producenci SET "companyType"='ems', opis='Polski dostawca EMS realizujący projektowanie, NPI, SMT/THT, testy, wiązki kablowe, montaż elektromechaniczny, OEM, logistykę i serwis.', adres='ul. Małęczyńska 25, 26-600 Radom', telefon='+48 48 365 58 22' WHERE nazwa='BORNICO Sp. z o.o.';
UPDATE public.producenci SET "companyType"='electronics_design', opis='Firma inżynierska specjalizująca się w embedded hardware/software, prototypowej i małoseryjnej produkcji elektroniki oraz integracji systemów przemysłowych.', adres='ul. Staniewicka 14, 03-310 Warszawa', telefon='+48 797 383 766' WHERE nazwa='ME Embedded Sp. z o.o.';
UPDATE public.producenci SET "companyType"='ems', opis='Partner EMS z Łodzi realizujący kontraktową produkcję elektroniki; posiada kompetencje w PCB/PCBA i produkcji dla wyrobów medycznych.', adres='ul. Szczecińska 59a, 91-222 Łódź', telefon='+48 42 652 79 44' WHERE nazwa='Printor Sp. z o.o.';
UPDATE public.producenci SET "companyType"='electronics_design', opis='Firma projektująca elektronikę i oprogramowanie, wspierająca prototypowanie, testowanie, przygotowanie do certyfikacji i optymalizację kosztową urządzeń.', adres='Gdański Park Naukowo-Technologiczny, ul. Trzy Lipy 3, 80-172 Gdańsk', telefon='+48 509 637 405' WHERE nazwa='Rachet Sp. z o.o.';
UPDATE public.producenci SET "companyType"='electronics_manufacturer', opis='Producent własnych systemów elektroniczno-informatycznych, oferujący także projektowanie oraz montaż elektroniki SMT i THT.', adres='ul. Boczkowska 7, 63-460 Skalmierzyce', telefon='+48 62 762 09 10' WHERE nazwa='Skalmex Sp. z o.o.';
UPDATE public.producenci SET "companyType"='ems', opis='Dostawca EMS z Gdańska specjalizujący się w zmontowanych modułach, PCB, SMT/THT, testach i operacjach dodatkowych.', adres='ul. Sąsiedzka 2A, 80-298 Gdańsk', telefon='+48 58 337 61 19' WHERE nazwa='SOFTCOM Sp. z o.o.';
UPDATE public.producenci SET "companyType"='ems', opis='Polska firma technologiczna świadcząca kontraktową produkcję elektroniki SMT/THT, projektowanie, logistykę komponentów i tworzenie oprogramowania.', adres='ul. Stefczyka 34, 20-151 Lublin', telefon='+48 81 718 78 24' WHERE nazwa='Spółka Inżynierów SIM Sp. z o.o.';
UPDATE public.producenci SET "companyType"='electronics_manufacturer', opis='Firma projektująca i rozwijająca własne urządzenia elektroniczne; realizuje pełny proces od koncepcji i prototypu przez testy do produkcji.', adres='ul. Raciborska 106A, 47-435 Raszczyce', telefon='+48 691 754 775' WHERE nazwa='7Tech Sp. z o.o.';
UPDATE public.producenci SET "companyType"='ems', opis='Producent elektroniki oferujący kontraktowy montaż SMT/THT, prototypy i serie, projektowanie urządzeń oraz montaż elektromechaniczny.', adres='ul. Warchałowskiego 29, 30-399 Kraków', telefon='+48 12 654 54 54' WHERE nazwa='ALTEL Wicha, Gołda Sp. J.';
UPDATE public.producenci SET "companyType"='component_distributor', opis='Sklep i dystrybutor elektroniki DIY, narzędzi, komponentów oraz wyposażenia dla elektroniki i druku 3D.', adres='Aleja Grunwaldzka 212, 80-266 Gdańsk', telefon='+48 58 881 00 78' WHERE nazwa='Altway Electronics';
UPDATE public.producenci SET nazwa='Inteligentna Mikroelektronika Sp. z o.o. (AMC-ESK)', "companyType"='electronics_manufacturer', opis='Producent i operator marki AMC-ESK, rozwijający elektroniczne systemy konstatowania oraz zapewniający serwis urządzeń.', adres='ul. Nowopogońska 13, 41-200 Sosnowiec', telefon='+48 32 763 72 09', email='biuro@amc-esk.pl', www='https://www.amc-esk.pl' WHERE nazwa='AMC-ESK Cezary Wójtowicz';
UPDATE public.producenci SET "companyType"='ems', opis='Dostawca usług montażu elektronicznego SMT/THT, projektowania, testowania oraz produkcji obwodów drukowanych.', adres='ul. Szczecińska 17E, 54-517 Wrocław', telefon='+48 71 889 01 30' WHERE nazwa='Andpol Elektronik Sp. z o.o.';
UPDATE public.producenci SET "companyType"='ems', opis='Firma produkcyjna z Trzebnicy oferująca montaż SMT/THT i prototypowanie; branżowe źródła wskazują również wykonywanie wiązek kablowych.', adres='ul. 1-go Maja 5A/3, 55-100 Trzebnica', telefon='+48 508 139 100' WHERE nazwa='ARE Jakub Malewicz';
UPDATE public.producenci SET "companyType"='ems', opis='Firma z Gdyni klasyfikowana w branżowym katalogu jako dostawca montażu SMT/THT, prototypowania i projektowania układów elektronicznych.', adres='ul. Parkowa 6, 81-549 Gdynia', telefon='+48 58 668 57 83', www='https://www.artronic.pl' WHERE nazwa='Artronic sp. j.';
UPDATE public.producenci SET "companyType"='ems', opis='Firma specjalizująca się od 2005 roku w kontraktowym montażu elektroniki SMD/SMT i THT w warunkach ESD.', adres='ul. Poprzeczna 6, 05-311 Dębe Wielkie', telefon='+48 609 807 059' WHERE nazwa='B.G.-Tronik';
UPDATE public.producenci SET "companyType"='ems', opis='Kontraktowy dostawca urządzeń i podzespołów elektronicznych i mechanicznych, oferujący SMT/THT, projektowanie, zaopatrzenie i testy.', adres='Nowa Wieś Mała 40, 11-040 Dobre Miasto', telefon='+48 89 616 15 78' WHERE nazwa='Bogart, Dobre Miasto';
UPDATE public.producenci SET "companyType"='ems', opis='Producent elektroniki z Łodzi realizujący PCB, montaż SMT/THT, kompletację komponentów, testy elektryczne i funkcjonalne oraz montaż mechaniczny.', adres='ul. Czechosłowacka 3A, 92-216 Łódź', telefon='+48 42 672 46 59' WHERE nazwa='BaZeKo Kociołek & Kociołek sp.j.';

INSERT INTO public.producer_services (company_id, service_id, source)
SELECT p.id, s.id, 'web_verified'
FROM (VALUES
('MASTERS Sp. z o.o.','component_procurement'),('MASTERS Sp. z o.o.','design_support'),('MASTERS Sp. z o.o.','prototype_assembly'),
('JM elektronik Sp. z o.o.','pcb_assembly'),('JM elektronik Sp. z o.o.','smt_assembly'),('JM elektronik Sp. z o.o.','tht_assembly'),('JM elektronik Sp. z o.o.','component_procurement'),('JM elektronik Sp. z o.o.','design_support'),('JM elektronik Sp. z o.o.','testing'),('JM elektronik Sp. z o.o.','supply_chain_management'),
('Eltronika','component_procurement'),('Eltronika','design_support'),
('CELJAR Elektronik','pcb_assembly'),('CELJAR Elektronik','smt_assembly'),('CELJAR Elektronik','tht_assembly'),('CELJAR Elektronik','design_support'),
('DGTronik Sp. z o.o.','pcb_assembly'),('DGTronik Sp. z o.o.','smt_assembly'),('DGTronik Sp. z o.o.','tht_assembly'),('DGTronik Sp. z o.o.','testing'),('DGTronik Sp. z o.o.','prototype_assembly'),
('EAE Elektronik Spółka z o.o.','pcb_assembly'),('EAE Elektronik Spółka z o.o.','smt_assembly'),('EAE Elektronik Spółka z o.o.','tht_assembly'),('EAE Elektronik Spółka z o.o.','testing'),('EAE Elektronik Spółka z o.o.','component_procurement'),('EAE Elektronik Spółka z o.o.','pcb_sourcing'),('EAE Elektronik Spółka z o.o.','design_support'),('EAE Elektronik Spółka z o.o.','programming'),
('BORNICO Sp. z o.o.','pcb_assembly'),('BORNICO Sp. z o.o.','smt_assembly'),('BORNICO Sp. z o.o.','tht_assembly'),('BORNICO Sp. z o.o.','npi'),('BORNICO Sp. z o.o.','box_build'),('BORNICO Sp. z o.o.','cable_assembly'),('BORNICO Sp. z o.o.','electromechanical_assembly'),('BORNICO Sp. z o.o.','testing'),('BORNICO Sp. z o.o.','component_procurement'),('BORNICO Sp. z o.o.','design_support'),('BORNICO Sp. z o.o.','repair_rework'),('BORNICO Sp. z o.o.','supply_chain_management'),
('ME Embedded Sp. z o.o.','design_support'),('ME Embedded Sp. z o.o.','prototype_assembly'),('ME Embedded Sp. z o.o.','testing'),('ME Embedded Sp. z o.o.','programming'),('ME Embedded Sp. z o.o.','electromechanical_assembly'),
('Printor Sp. z o.o.','pcb_assembly'),('Printor Sp. z o.o.','smt_assembly'),('Printor Sp. z o.o.','tht_assembly'),('Printor Sp. z o.o.','testing'),
('Rachet Sp. z o.o.','design_support'),('Rachet Sp. z o.o.','testing'),('Rachet Sp. z o.o.','programming'),
('Skalmex Sp. z o.o.','pcb_assembly'),('Skalmex Sp. z o.o.','smt_assembly'),('Skalmex Sp. z o.o.','tht_assembly'),('Skalmex Sp. z o.o.','design_support'),('Skalmex Sp. z o.o.','prototype_assembly'),
('SOFTCOM Sp. z o.o.','pcb_assembly'),('SOFTCOM Sp. z o.o.','smt_assembly'),('SOFTCOM Sp. z o.o.','tht_assembly'),('SOFTCOM Sp. z o.o.','design_support'),('SOFTCOM Sp. z o.o.','cable_assembly'),('SOFTCOM Sp. z o.o.','testing'),('SOFTCOM Sp. z o.o.','repair_rework'),('SOFTCOM Sp. z o.o.','component_procurement'),('SOFTCOM Sp. z o.o.','pcb_sourcing'),('SOFTCOM Sp. z o.o.','box_build'),
('Spółka Inżynierów SIM Sp. z o.o.','pcb_assembly'),('Spółka Inżynierów SIM Sp. z o.o.','smt_assembly'),('Spółka Inżynierów SIM Sp. z o.o.','tht_assembly'),('Spółka Inżynierów SIM Sp. z o.o.','design_support'),('Spółka Inżynierów SIM Sp. z o.o.','component_procurement'),('Spółka Inżynierów SIM Sp. z o.o.','box_build'),('Spółka Inżynierów SIM Sp. z o.o.','programming'),('Spółka Inżynierów SIM Sp. z o.o.','supply_chain_management'),('Spółka Inżynierów SIM Sp. z o.o.','prototype_assembly'),
('7Tech Sp. z o.o.','design_support'),('7Tech Sp. z o.o.','prototype_assembly'),('7Tech Sp. z o.o.','testing'),
('ALTEL Wicha, Gołda Sp. J.','pcb_assembly'),('ALTEL Wicha, Gołda Sp. J.','smt_assembly'),('ALTEL Wicha, Gołda Sp. J.','tht_assembly'),('ALTEL Wicha, Gołda Sp. J.','prototype_assembly'),('ALTEL Wicha, Gołda Sp. J.','design_support'),('ALTEL Wicha, Gołda Sp. J.','electromechanical_assembly'),
('Altway Electronics','component_procurement'),('Inteligentna Mikroelektronika Sp. z o.o. (AMC-ESK)','repair_rework'),
('Andpol Elektronik Sp. z o.o.','pcb_assembly'),('Andpol Elektronik Sp. z o.o.','smt_assembly'),('Andpol Elektronik Sp. z o.o.','tht_assembly'),('Andpol Elektronik Sp. z o.o.','design_support'),('Andpol Elektronik Sp. z o.o.','testing'),('Andpol Elektronik Sp. z o.o.','prototype_assembly'),
('ARE Jakub Malewicz','pcb_assembly'),('ARE Jakub Malewicz','smt_assembly'),('ARE Jakub Malewicz','tht_assembly'),('ARE Jakub Malewicz','prototype_assembly'),('ARE Jakub Malewicz','cable_assembly'),
('Artronic sp. j.','pcb_assembly'),('Artronic sp. j.','smt_assembly'),('Artronic sp. j.','tht_assembly'),('Artronic sp. j.','prototype_assembly'),('Artronic sp. j.','design_support'),
('B.G.-Tronik','pcb_assembly'),('B.G.-Tronik','smt_assembly'),('B.G.-Tronik','tht_assembly'),
('Bogart, Dobre Miasto','pcb_assembly'),('Bogart, Dobre Miasto','smt_assembly'),('Bogart, Dobre Miasto','tht_assembly'),('Bogart, Dobre Miasto','design_support'),('Bogart, Dobre Miasto','pcb_sourcing'),('Bogart, Dobre Miasto','component_procurement'),('Bogart, Dobre Miasto','testing'),
('BaZeKo Kociołek & Kociołek sp.j.','pcb_assembly'),('BaZeKo Kociołek & Kociołek sp.j.','smt_assembly'),('BaZeKo Kociołek & Kociołek sp.j.','tht_assembly'),('BaZeKo Kociołek & Kociołek sp.j.','testing'),('BaZeKo Kociołek & Kociołek sp.j.','component_procurement'),('BaZeKo Kociołek & Kociołek sp.j.','design_support'),('BaZeKo Kociołek & Kociołek sp.j.','box_build')
) v(company_name, slug)
JOIN public.producenci p ON p.nazwa=v.company_name
JOIN public.services s ON s.slug=v.slug
ON CONFLICT (company_id, service_id) DO UPDATE SET source=EXCLUDED.source;

INSERT INTO public.producer_capabilities (company_id, capability_id, source)
SELECT p.id, c.id, 'web_verified'
FROM (VALUES
('EAE Elektronik Spółka z o.o.','bga'),('EAE Elektronik Spółka z o.o.','aoi'),('EAE Elektronik Spółka z o.o.','spi'),('EAE Elektronik Spółka z o.o.','x_ray'),('EAE Elektronik Spółka z o.o.','functional_testing'),('EAE Elektronik Spółka z o.o.','selective_soldering'),('EAE Elektronik Spółka z o.o.','wave_soldering'),('EAE Elektronik Spółka z o.o.','conformal_coating'),('EAE Elektronik Spółka z o.o.','pcb_cleaning'),('EAE Elektronik Spółka z o.o.','traceability'),
('BORNICO Sp. z o.o.','aoi'),('Printor Sp. z o.o.','aoi'),
('SOFTCOM Sp. z o.o.','bga'),('SOFTCOM Sp. z o.o.','fine_pitch'),('SOFTCOM Sp. z o.o.','aoi'),('SOFTCOM Sp. z o.o.','x_ray'),('SOFTCOM Sp. z o.o.','functional_testing'),('SOFTCOM Sp. z o.o.','conformal_coating'),('SOFTCOM Sp. z o.o.','potting'),('SOFTCOM Sp. z o.o.','traceability'),
('ALTEL Wicha, Gołda Sp. J.','bga'),('ALTEL Wicha, Gołda Sp. J.','fine_pitch'),('ALTEL Wicha, Gołda Sp. J.','aoi'),('ALTEL Wicha, Gołda Sp. J.','selective_soldering'),('ALTEL Wicha, Gołda Sp. J.','wave_soldering'),
('Andpol Elektronik Sp. z o.o.','wave_soldering'),('Andpol Elektronik Sp. z o.o.','conformal_coating'),('Bogart, Dobre Miasto','x_ray'),
('BaZeKo Kociołek & Kociołek sp.j.','aoi'),('BaZeKo Kociołek & Kociołek sp.j.','functional_testing')
) v(company_name, slug)
JOIN public.producenci p ON p.nazwa=v.company_name
JOIN public.capabilities c ON c.slug=v.slug
ON CONFLICT (company_id, capability_id) DO UPDATE SET source=EXCLUDED.source;

INSERT INTO public.producer_industries (company_id, industry_id, source)
SELECT p.id, i.id, 'web_verified'
FROM (VALUES
('JM elektronik Sp. z o.o.','medical'),('JM elektronik Sp. z o.o.','consumer_electronics'),
('Eltronika','industrial'),('Eltronika','defence'),
('EAE Elektronik Spółka z o.o.','automotive'),('EAE Elektronik Spółka z o.o.','medical'),('EAE Elektronik Spółka z o.o.','aerospace'),('EAE Elektronik Spółka z o.o.','rail'),('EAE Elektronik Spółka z o.o.','industrial'),('EAE Elektronik Spółka z o.o.','iot'),
('ME Embedded Sp. z o.o.','industrial'),('ME Embedded Sp. z o.o.','iot'),('Printor Sp. z o.o.','medical'),('Skalmex Sp. z o.o.','industrial'),
('SOFTCOM Sp. z o.o.','defence'),('SOFTCOM Sp. z o.o.','medical'),('SOFTCOM Sp. z o.o.','telecom'),('SOFTCOM Sp. z o.o.','consumer_electronics'),('SOFTCOM Sp. z o.o.','automotive'),('SOFTCOM Sp. z o.o.','aerospace'),
('7Tech Sp. z o.o.','industrial'),('7Tech Sp. z o.o.','energy'),('Bogart, Dobre Miasto','automotive'),('Bogart, Dobre Miasto','consumer_electronics')
) v(company_name, slug)
JOIN public.producenci p ON p.nazwa=v.company_name
JOIN public.industries i ON i.slug=v.slug
ON CONFLICT (company_id, industry_id) DO UPDATE SET source=EXCLUDED.source;

INSERT INTO public.producer_certifications (company_id, certification_id, status)
SELECT p.id, cert.id, v.status
FROM (VALUES
('JM elektronik Sp. z o.o.','ISO-9001','verified'),('JM elektronik Sp. z o.o.','ISO-14001','verified'),
('EAE Elektronik Spółka z o.o.','ISO-9001','verified'),('EAE Elektronik Spółka z o.o.','ISO-14001','verified'),('EAE Elektronik Spółka z o.o.','IATF-16949','verified'),
('Printor Sp. z o.o.','ISO-9001','verified'),('Printor Sp. z o.o.','ISO-13485','verified'),
('Spółka Inżynierów SIM Sp. z o.o.','ISO-9001','verified'),('BaZeKo Kociołek & Kociołek sp.j.','ISO-9001','listed')
) v(company_name, cert_code, status)
JOIN public.producenci p ON p.nazwa=v.company_name
JOIN public.certifications cert ON cert.code=v.cert_code
ON CONFLICT (company_id, certification_id) DO UPDATE SET status=EXCLUDED.status;

COMMIT;
