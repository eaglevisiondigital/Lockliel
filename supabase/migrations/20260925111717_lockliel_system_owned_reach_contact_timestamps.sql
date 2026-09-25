revoke update (updated_at) on table public.reach_contacts from authenticated;

create or replace function app_private.touch_reach_contact_updated_at()
returns trigger
language plpgsql
set search_path to ''
as $function$
begin
  new.updated_at:=now();
  return new;
end;
$function$;

revoke execute on function app_private.touch_reach_contact_updated_at()
from public, anon, authenticated;

drop trigger if exists touch_reach_contact_updated_at_trigger
on public.reach_contacts;

create trigger touch_reach_contact_updated_at_trigger
before update on public.reach_contacts
for each row
execute function app_private.touch_reach_contact_updated_at();
