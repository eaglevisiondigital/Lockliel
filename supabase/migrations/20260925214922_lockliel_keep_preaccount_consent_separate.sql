
drop trigger if exists on_lead_contact_sync_consent
on public.lead_contacts;

create or replace function app_private.sync_lead_consent_to_preferences()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
begin
  return new;
end;
$function$;

revoke execute on function app_private.sync_lead_consent_to_preferences()
from public, anon, authenticated;
