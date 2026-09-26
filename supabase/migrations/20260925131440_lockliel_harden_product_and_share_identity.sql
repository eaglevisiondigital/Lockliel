revoke insert, update, delete on table public.products from authenticated;
grant select on table public.products to authenticated;
grant update (
  title,
  status,
  price_cents,
  currency,
  storage_path,
  cover_path,
  description,
  language_code
) on table public.products to authenticated;

alter table public.products
  drop constraint if exists products_title_length,
  add constraint products_title_length
    check (char_length(title) between 1 and 300);

alter table public.products
  drop constraint if exists products_currency_format,
  add constraint products_currency_format
    check (char_length(currency)=3 and currency=upper(currency));

alter table public.products
  drop constraint if exists products_language_code_length,
  add constraint products_language_code_length
    check (char_length(language_code) between 2 and 12);

create or replace function app_private.protect_product_identity()
returns trigger
language plpgsql
set search_path to ''
as $function$
begin
  if old.id is distinct from new.id
     or old.slug is distinct from new.slug
     or old.product_type is distinct from new.product_type
     or old.created_at is distinct from new.created_at
     or old.translation_key is distinct from new.translation_key then
    raise exception 'Product identity fields cannot be changed after creation.';
  end if;

  if old.status='active'
     and new.status='active'
     and old.storage_path is distinct from new.storage_path then
    raise exception 'Archive the product before changing its protected file.';
  end if;

  return new;
end;
$function$;

revoke execute on function app_private.protect_product_identity()
from public, anon, authenticated;

drop trigger if exists protect_product_identity_trigger
on public.products;

create trigger protect_product_identity_trigger
before update on public.products
for each row
execute function app_private.protect_product_identity();

revoke insert, update, delete on table public.share_assets from authenticated;
grant select on table public.share_assets to authenticated;

grant insert (
  slug,
  title,
  asset_type,
  description,
  destination_path,
  status,
  share_text,
  category,
  preview_image_path,
  sort_order,
  featured,
  language_code,
  translation_key
) on table public.share_assets to authenticated;

grant update (
  title,
  asset_type,
  description,
  destination_path,
  status,
  share_text,
  category,
  preview_image_path,
  sort_order,
  featured,
  language_code
) on table public.share_assets to authenticated;

alter table public.share_assets
  drop constraint if exists share_assets_slug_format,
  add constraint share_assets_slug_format
    check (
      slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
      and char_length(slug)<=160
    );

alter table public.share_assets
  drop constraint if exists share_assets_title_length,
  add constraint share_assets_title_length
    check (char_length(title) between 1 and 300);

alter table public.share_assets
  drop constraint if exists share_assets_description_length,
  add constraint share_assets_description_length
    check (description is null or char_length(description)<=1000);

alter table public.share_assets
  drop constraint if exists share_assets_destination_path_check,
  add constraint share_assets_destination_path_check
    check (
      char_length(destination_path) between 1 and 500
      and left(destination_path,1)='/'
    );

alter table public.share_assets
  drop constraint if exists share_assets_share_text_length,
  add constraint share_assets_share_text_length
    check (share_text is null or char_length(share_text)<=1200);

alter table public.share_assets
  drop constraint if exists share_assets_category_length,
  add constraint share_assets_category_length
    check (category is null or char_length(category)<=120);

alter table public.share_assets
  drop constraint if exists share_assets_preview_path_length,
  add constraint share_assets_preview_path_length
    check (preview_image_path is null or char_length(preview_image_path)<=500);

alter table public.share_assets
  drop constraint if exists share_assets_sort_order_nonnegative,
  add constraint share_assets_sort_order_nonnegative
    check (sort_order>=0);

alter table public.share_assets
  drop constraint if exists share_assets_language_code_length,
  add constraint share_assets_language_code_length
    check (char_length(language_code) between 2 and 12);

alter table public.share_assets
  drop constraint if exists share_assets_translation_key_length,
  add constraint share_assets_translation_key_length
    check (char_length(translation_key) between 1 and 200);

create or replace function app_private.normalize_share_asset()
returns trigger
language plpgsql
set search_path to ''
as $function$
begin
  if tg_op='UPDATE'
     and (
       old.id is distinct from new.id
       or old.slug is distinct from new.slug
       or old.created_at is distinct from new.created_at
       or old.translation_key is distinct from new.translation_key
     ) then
    raise exception 'Share resource identity fields cannot be changed after creation.';
  end if;

  new.updated_at:=now();
  return new;
end;
$function$;

revoke execute on function app_private.normalize_share_asset()
from public, anon, authenticated;

drop trigger if exists normalize_share_asset_trigger
on public.share_assets;

create trigger normalize_share_asset_trigger
before insert or update on public.share_assets
for each row
execute function app_private.normalize_share_asset();
