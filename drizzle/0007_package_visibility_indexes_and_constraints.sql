do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'producenci_package_type_check'
      and conrelid = 'public.producenci'::regclass
  ) then
    alter table public.producenci
      add constraint producenci_package_type_check
      check ("packageType" in ('free', 'standard', 'premium'));
  end if;
end $$;

create index if not exists producenci_public_visibility_idx
  on public.producenci ("isActive", "packageType", featured);

create index if not exists producenci_package_valid_until_idx
  on public.producenci (package_valid_until)
  where package_valid_until is not null;

create index if not exists package_orders_status_provider_idx
  on public.package_orders (payment_status, provider, created_at desc);
