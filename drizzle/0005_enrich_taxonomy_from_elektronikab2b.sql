-- Źródło danych: ElektronikaB2B, kategoria publiczna „Produkcja elektroniki / Usługi CEM/EMS”.
-- Zakres: faktyczne dane kontaktowe oraz przypisania do polskiej taksonomii PolskiEMS.
-- Nie kopiujemy opisów marketingowych ani długich treści źródłowych.

begin;

insert into services (slug, name, is_active, sort_order)
values ('stencil_templates', 'Wykonywanie szablonów SMT', true, 17)
on conflict (slug) do update
set name = excluded.name,
    is_active = true,
    sort_order = excluded.sort_order;

update producenci
set adres = 'ul. B. Raczkowskiego 5, 85-862 Bydgoszcz',
    telefon = '+48 52 506 53 33'
where id = 33;

update producenci
set adres = coalesce(adres, 'ul. Wrocławska 9, 55-100 Trzebnica'),
    telefon = coalesce(telefon, '+48 607 087 780')
where id = 18;

update producenci
set adres = coalesce(adres, 'ul. Wyścigowa 56e, 53-012 Wrocław')
where id = 15;

update producenci
set adres = coalesce(adres, 'ul. Zwoleńska 43/43a, 04-761 Warszawa'),
    telefon = coalesce(telefon, '+48 22 615 64 31')
where id = 29;

update producenci
set telefon = '+48 34 357 61 12'
where id = 22 and (telefon is null or telefon not ilike '%34 357 61 12%');

update producenci
set telefon = '+48 74 851 48 77'
where id = 17 and telefon is null;

update producenci
set telefon = coalesce(telefon, '+48 81 718 78 50')
where id = 32;

with matched(company_id) as (
  values (13),(50),(25),(22),(23),(24),(19),(16),(15),(14),(27),(29),(30),(31),(32),(33),(34),(35)
), service_ids as (
  select id as service_id from services where slug in ('smt_assembly','tht_assembly','mixed_technology','prototype_assembly')
)
insert into producer_services (company_id, service_id, source)
select matched.company_id, service_ids.service_id, 'elektronikab2b'
from matched cross join service_ids
on conflict (company_id, service_id) do nothing;

with matched(company_id) as (
  values (23),(24),(16),(26),(15),(14),(27),(28),(29),(30),(31),(32),(34),(35),(37),(13)
), service_ids as (
  select id as service_id from services where slug = 'design_support'
)
insert into producer_services (company_id, service_id, source)
select matched.company_id, service_ids.service_id, 'elektronikab2b'
from matched cross join service_ids
on conflict (company_id, service_id) do nothing;

with matched(company_id) as (
  values (24),(21),(16),(31),(32),(38),(45),(46),(13)
), service_ids as (
  select id as service_id from services where slug in ('component_procurement','pcb_sourcing')
)
insert into producer_services (company_id, service_id, source)
select matched.company_id, service_ids.service_id, 'elektronikab2b'
from matched cross join service_ids
on conflict (company_id, service_id) do nothing;

with matched(company_id) as (
  values (50),(23),(24),(19),(17),(16),(15),(14),(27),(29),(31),(32),(35),(36),(37),(38)
), service_ids as (
  select id as service_id from services where slug = 'stencil_templates'
)
insert into producer_services (company_id, service_id, source)
select matched.company_id, service_ids.service_id, 'elektronikab2b'
from matched cross join service_ids
on conflict (company_id, service_id) do nothing;

with matched(company_id) as (
  values (40),(25),(22),(23),(24),(18),(16),(15),(14),(27),(29),(30),(32),(34),(38)
), service_ids as (
  select id as service_id from services where slug = 'testing'
)
insert into producer_services (company_id, service_id, source)
select matched.company_id, service_ids.service_id, 'elektronikab2b'
from matched cross join service_ids
on conflict (company_id, service_id) do nothing;

with matched(company_id) as (
  values (40),(25),(22),(23),(24),(18),(16),(15),(14),(27),(29),(30),(32),(34),(38)
), capability_ids as (
  select id as capability_id from capabilities where slug in ('functional_testing','quality_control')
)
insert into producer_capabilities (company_id, capability_id, source)
select matched.company_id, capability_ids.capability_id, 'elektronikab2b'
from matched cross join capability_ids
on conflict (company_id, capability_id) do nothing;

with matched(company_id) as (
  values (13),(50),(25),(22),(23),(24),(19),(16),(15),(14),(27),(29),(30),(31),(32),(33),(34),(35)
), scale_ids as (
  select id as produkcja_id from produkcja where id = 2
)
insert into producenci_ems_produkcja (company_id, produkcja_id)
select matched.company_id, scale_ids.produkcja_id
from matched cross join scale_ids
where not exists (
  select 1 from producenci_ems_produkcja existing
  where existing.company_id = matched.company_id and existing.produkcja_id = scale_ids.produkcja_id
);

insert into producer_capabilities (company_id, capability_id, source)
select 13, id, 'elektronikab2b'
from capabilities
where slug = 'potting'
on conflict (company_id, capability_id) do nothing;

commit;
