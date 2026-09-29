revoke update (
  onboarding_status,
  updated_at
) on table public.profiles from authenticated;

alter table public.profiles
  drop constraint if exists profiles_onboarding_status_check,
  add constraint profiles_onboarding_status_check
    check (onboarding_status in ('new','active'));

create or replace function app_private.normalize_member_profile_update()
returns trigger
language plpgsql
set search_path to ''
as $function$
begin
  new.updated_at:=now();

  if old.onboarding_status='new'
     and nullif(trim(coalesce(new.first_name,'')),'') is not null
     and nullif(trim(coalesce(new.last_name,'')),'') is not null
     and nullif(trim(coalesce(new.city,'')),'') is not null
     and nullif(trim(coalesce(new.region,'')),'') is not null
     and nullif(trim(coalesce(new.country,'')),'') is not null then
    new.onboarding_status:='active';
  else
    new.onboarding_status:=old.onboarding_status;
  end if;

  return new;
end;
$function$;

revoke execute on function app_private.normalize_member_profile_update()
from public, anon, authenticated;

drop trigger if exists normalize_member_profile_update_trigger
on public.profiles;

create trigger normalize_member_profile_update_trigger
before update of
  first_name,
  last_name,
  phone,
  city,
  region,
  country,
  locale,
  timezone
on public.profiles
for each row
execute function app_private.normalize_member_profile_update();
