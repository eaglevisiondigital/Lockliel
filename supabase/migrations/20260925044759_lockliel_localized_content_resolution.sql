create or replace function app_private.resolve_product_translation(
  source_product uuid,
  target_locale text
)
returns uuid
language sql
stable
set search_path = ''
as $$
  with source as (
    select p.id, p.translation_key
    from public.products p
    where p.id = source_product
  ),
  requested as (
    select lower(replace(nullif(trim(target_locale), ''), '_', '-')) as locale
  ),
  candidates as (
    select p.id,
           case
             when p.language_code = r.locale then 1
             when p.language_code = split_part(r.locale, '-', 1) then 2
             when p.language_code = 'en' then 3
             when p.id = s.id then 4
             else 5
           end as preference
    from source s
    cross join requested r
    join public.products p
      on p.translation_key = s.translation_key
    where p.status = 'active'
  )
  select coalesce(
    (select id from candidates order by preference, id limit 1),
    source_product
  );
$$;

create or replace function app_private.resolve_share_asset_translation(
  source_asset uuid,
  target_locale text
)
returns uuid
language sql
stable
set search_path = ''
as $$
  with source as (
    select a.id, a.translation_key
    from public.share_assets a
    where a.id = source_asset
  ),
  requested as (
    select lower(replace(nullif(trim(target_locale), ''), '_', '-')) as locale
  ),
  candidates as (
    select a.id,
           case
             when a.language_code = r.locale then 1
             when a.language_code = split_part(r.locale, '-', 1) then 2
             when a.language_code = 'en' then 3
             when a.id = s.id then 4
             else 5
           end as preference
    from source s
    cross join requested r
    join public.share_assets a
      on a.translation_key = s.translation_key
    where a.status = 'active'
  )
  select coalesce(
    (select id from candidates order by preference, id limit 1),
    source_asset
  );
$$;
