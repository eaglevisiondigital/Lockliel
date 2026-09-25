
create or replace function app_private.lock_partner_checkout_transition()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
begin
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('lockliel:partner-checkout-readiness',0)
  );
  return null;
end;
$function$;

revoke execute on function app_private.lock_partner_checkout_transition()
from public, anon, authenticated;

drop trigger if exists lock_partner_checkout_feature_transition_trigger
on public.feature_flags;

create trigger lock_partner_checkout_feature_transition_trigger
before update of enabled
on public.feature_flags
for each statement
execute function app_private.lock_partner_checkout_transition();

drop trigger if exists lock_partner_checkout_provider_transition_trigger
on public.payment_provider_connections;

create trigger lock_partner_checkout_provider_transition_trigger
before update of status, checkout_adapter_ready, webhook_ready
on public.payment_provider_connections
for each statement
execute function app_private.lock_partner_checkout_transition();
