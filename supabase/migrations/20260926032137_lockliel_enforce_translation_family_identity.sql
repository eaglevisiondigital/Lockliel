create or replace function app_private.validate_product_translation_family()
returns trigger
language plpgsql
set search_path to ''
as $function$
begin
  if new.translation_key is null then
    return new;
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      'lockliel:product-translation:'||new.translation_key,
      0
    )
  );

  if exists(
    select 1
    from public.products p
    where p.translation_key=new.translation_key
      and p.id<>new.id
      and p.product_type<>new.product_type
  ) then
    raise exception 'Translated product variants must use the same product type.';
  end if;

  return new;
end;
$function$;

revoke execute on function app_private.validate_product_translation_family()
from public,anon,authenticated;

drop trigger if exists validate_product_translation_family_trigger
on public.products;

create trigger validate_product_translation_family_trigger
before insert or update of translation_key,product_type
on public.products
for each row
execute function app_private.validate_product_translation_family();

create or replace function app_private.validate_share_asset_translation_family()
returns trigger
language plpgsql
set search_path to ''
as $function$
begin
  if new.translation_key is null then
    return new;
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      'lockliel:share-translation:'||new.translation_key,
      0
    )
  );

  if exists(
    select 1
    from public.share_assets a
    where a.translation_key=new.translation_key
      and a.id<>new.id
      and a.asset_type<>new.asset_type
  ) then
    raise exception 'Translated Share Center variants must use the same asset type.';
  end if;

  return new;
end;
$function$;

revoke execute on function app_private.validate_share_asset_translation_family()
from public,anon,authenticated;

drop trigger if exists validate_share_asset_translation_family_trigger
on public.share_assets;

create trigger validate_share_asset_translation_family_trigger
before insert or update of translation_key,asset_type
on public.share_assets
for each row
execute function app_private.validate_share_asset_translation_family();

create or replace function app_private.resolve_product_translation(
  source_product uuid,
  target_locale text
)
returns uuid
language sql
stable
set search_path to ''
as $function$
  with source as (
    select p.id,p.translation_key,p.product_type
    from public.products p
    where p.id=source_product
  ),
  requested as (
    select lower(replace(nullif(trim(target_locale),''),'_','-')) as locale
  ),
  candidates as (
    select
      p.id,
      case
        when p.language_code=r.locale then 1
        when p.language_code=split_part(r.locale,'-',1) then 2
        when p.language_code='en' then 3
        when p.id=s.id then 4
        else 5
      end as preference
    from source s
    cross join requested r
    join public.products p
      on p.translation_key=s.translation_key
     and p.product_type=s.product_type
    where p.status='active'
  )
  select coalesce(
    (select id from candidates order by preference,id limit 1),
    source_product
  );
$function$;

revoke all on function app_private.resolve_product_translation(uuid,text)
from public,anon,authenticated;

create or replace function app_private.resolve_share_asset_translation(
  source_asset uuid,
  target_locale text
)
returns uuid
language sql
stable
set search_path to ''
as $function$
  with source as (
    select a.id,a.translation_key,a.asset_type
    from public.share_assets a
    where a.id=source_asset
  ),
  requested as (
    select lower(replace(nullif(trim(target_locale),''),'_','-')) as locale
  ),
  candidates as (
    select
      a.id,
      case
        when a.language_code=r.locale then 1
        when a.language_code=split_part(r.locale,'-',1) then 2
        when a.language_code='en' then 3
        when a.id=s.id then 4
        else 5
      end as preference
    from source s
    cross join requested r
    join public.share_assets a
      on a.translation_key=s.translation_key
     and a.asset_type=s.asset_type
    where a.status='active'
  )
  select coalesce(
    (select id from candidates order by preference,id limit 1),
    source_asset
  );
$function$;

revoke all on function app_private.resolve_share_asset_translation(uuid,text)
from public,anon,authenticated;
