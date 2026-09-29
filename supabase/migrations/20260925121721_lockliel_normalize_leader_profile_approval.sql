revoke insert, update on table public.leader_profiles from authenticated;

grant insert (
  profile_id,
  leader_type,
  active,
  city,
  region,
  country,
  capacity,
  approved_by,
  language_code
) on table public.leader_profiles to authenticated;

grant update (
  leader_type,
  active,
  city,
  region,
  country,
  capacity,
  approved_by,
  language_code
) on table public.leader_profiles to authenticated;

create or replace function app_private.normalize_leader_profile_approval()
returns trigger
language plpgsql
set search_path to ''
as $function$
declare
  actor uuid;
begin
  actor:=(select auth.uid());

  if tg_op='UPDATE' and old.profile_id is distinct from new.profile_id then
    raise exception 'Leader profile identity cannot be changed.';
  end if;

  if tg_op='INSERT' then
    new.approved_by:=coalesce(actor,new.approved_by);
    new.approved_at:=now();
  else
    new.approved_by:=old.approved_by;
    new.approved_at:=old.approved_at;
  end if;

  new.updated_at:=now();
  return new;
end;
$function$;

revoke execute on function app_private.normalize_leader_profile_approval()
from public, anon, authenticated;

drop trigger if exists normalize_leader_profile_approval_trigger
on public.leader_profiles;

create trigger normalize_leader_profile_approval_trigger
before insert or update on public.leader_profiles
for each row
execute function app_private.normalize_leader_profile_approval();
