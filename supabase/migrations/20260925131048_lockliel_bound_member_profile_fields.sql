alter table public.profiles
  drop constraint if exists profiles_first_name_length,
  add constraint profiles_first_name_length
    check (
      first_name is null
      or char_length(first_name) between 1 and 120
    );

alter table public.profiles
  drop constraint if exists profiles_last_name_length,
  add constraint profiles_last_name_length
    check (
      last_name is null
      or char_length(last_name) between 1 and 120
    );

alter table public.profiles
  drop constraint if exists profiles_phone_length,
  add constraint profiles_phone_length
    check (
      phone is null
      or char_length(phone)<=60
    );

alter table public.profiles
  drop constraint if exists profiles_city_length,
  add constraint profiles_city_length
    check (
      city is null
      or char_length(city) between 1 and 160
    );

alter table public.profiles
  drop constraint if exists profiles_region_length,
  add constraint profiles_region_length
    check (
      region is null
      or char_length(region) between 1 and 160
    );

alter table public.profiles
  drop constraint if exists profiles_country_length,
  add constraint profiles_country_length
    check (
      country is null
      or char_length(country) between 1 and 160
    );

alter table public.profiles
  drop constraint if exists profiles_locale_length,
  add constraint profiles_locale_length
    check (
      char_length(locale) between 2 and 35
    );

alter table public.profiles
  drop constraint if exists profiles_timezone_length,
  add constraint profiles_timezone_length
    check (
      timezone is null
      or char_length(timezone)<=100
    );

create or replace function app_private.normalize_member_profile_update()
returns trigger
language plpgsql
set search_path to ''
as $function$
begin
  new.first_name:=nullif(trim(coalesce(new.first_name,'')),'');
  new.last_name:=nullif(trim(coalesce(new.last_name,'')),'');
  new.phone:=nullif(trim(coalesce(new.phone,'')),'');
  new.city:=nullif(trim(coalesce(new.city,'')),'');
  new.region:=nullif(trim(coalesce(new.region,'')),'');
  new.country:=nullif(trim(coalesce(new.country,'')),'');
  new.locale:=trim(coalesce(new.locale,'en-US'));
  new.timezone:=nullif(trim(coalesce(new.timezone,'')),'');
  new.updated_at:=now();

  if old.onboarding_status='new'
     and new.first_name is not null
     and new.last_name is not null
     and new.city is not null
     and new.region is not null
     and new.country is not null then
    new.onboarding_status:='active';
  else
    new.onboarding_status:=old.onboarding_status;
  end if;

  return new;
end;
$function$;

revoke execute on function app_private.normalize_member_profile_update()
from public, anon, authenticated;
