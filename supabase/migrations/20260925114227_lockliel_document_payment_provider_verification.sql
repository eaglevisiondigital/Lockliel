create or replace function app_private.audit_payment_provider_readiness()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
declare
  fully_ready boolean;
  was_fully_ready boolean;
begin
  fully_ready :=
    new.status='active'
    and new.checkout_adapter_ready=true
    and new.webhook_ready=true;

  was_fully_ready :=
    old.status='active'
    and old.checkout_adapter_ready=true
    and old.webhook_ready=true;

  if fully_ready
     and char_length(trim(coalesce(new.verification_note,'')))<20 then
    raise exception
      'Fully verified payment providers require a verification note of at least 20 characters.';
  end if;

  if old.status is distinct from new.status
     or old.checkout_adapter_ready is distinct from new.checkout_adapter_ready
     or old.webhook_ready is distinct from new.webhook_ready then
    insert into public.audit_events(
      actor_profile_id,event_type,entity_type,entity_id,summary,metadata
    )
    values(
      (select auth.uid()),
      'payment_provider_readiness_changed',
      'payment_provider_connection',
      new.provider,
      'Payment provider readiness changed',
      jsonb_build_object(
        'status',new.status,
        'checkout_adapter_ready',new.checkout_adapter_ready,
        'webhook_ready',new.webhook_ready
      )
    );
  end if;

  if fully_ready then
    if not was_fully_ready
       or old.verification_note is distinct from new.verification_note then
      new.last_verified_at:=now();
    else
      new.last_verified_at:=old.last_verified_at;
    end if;
  else
    new.last_verified_at:=null;
  end if;

  return new;
end;
$function$;

revoke execute on function app_private.audit_payment_provider_readiness()
from public, anon, authenticated;
