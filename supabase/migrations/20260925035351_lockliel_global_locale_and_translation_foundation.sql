
alter table public.profiles
  add column if not exists locale text not null default 'en-US',
  add column if not exists timezone text;

alter table public.groups
  add column if not exists language_code text not null default 'en';

alter table public.courses
  add column if not exists language_code text not null default 'en',
  add column if not exists translation_key text;

alter table public.share_assets
  add column if not exists language_code text not null default 'en',
  add column if not exists translation_key text;

alter table public.products
  add column if not exists language_code text not null default 'en',
  add column if not exists translation_key text;

update public.courses
set translation_key=coalesce(translation_key,slug);

update public.share_assets
set translation_key=coalesce(translation_key,slug);

update public.products
set translation_key=coalesce(translation_key,slug);

create index if not exists courses_translation_idx
  on public.courses(translation_key,language_code);

create index if not exists share_assets_translation_idx
  on public.share_assets(translation_key,language_code,status);

create index if not exists products_translation_idx
  on public.products(translation_key,language_code,status);

create index if not exists groups_language_idx
  on public.groups(language_code,status);

revoke update on public.profiles from authenticated;

grant update(
  first_name,
  last_name,
  phone,
  city,
  region,
  country,
  onboarding_status,
  locale,
  timezone,
  updated_at
) on public.profiles to authenticated;

create or replace function app_private.default_translation_key_from_slug()
returns trigger
language plpgsql
set search_path=''
as $$
begin
  if new.translation_key is null or trim(new.translation_key)='' then
    new.translation_key:=new.slug;
  end if;
  return new;
end;
$$;

drop trigger if exists default_course_translation_key_trigger on public.courses;
create trigger default_course_translation_key_trigger
before insert or update of slug,translation_key on public.courses
for each row execute function app_private.default_translation_key_from_slug();

drop trigger if exists default_share_translation_key_trigger on public.share_assets;
create trigger default_share_translation_key_trigger
before insert or update of slug,translation_key on public.share_assets
for each row execute function app_private.default_translation_key_from_slug();

drop trigger if exists default_product_translation_key_trigger on public.products;
create trigger default_product_translation_key_trigger
before insert or update of slug,translation_key on public.products
for each row execute function app_private.default_translation_key_from_slug();
