
alter table public.payment_provider_connections
  add column if not exists checkout_adapter_ready boolean not null default false,
  add column if not exists webhook_ready boolean not null default false,
  add column if not exists last_verified_at timestamptz,
  add column if not exists verification_note text;

create or replace function app_private.audit_payment_provider_readiness()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
begin
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

  if new.status='active'
     and new.checkout_adapter_ready
     and new.webhook_ready then
    new.last_verified_at:=coalesce(new.last_verified_at,now());
  end if;

  return new;
end;
$$;
revoke all on function app_private.audit_payment_provider_readiness() from public,anon,authenticated;

drop trigger if exists audit_payment_provider_readiness_trigger on public.payment_provider_connections;
create trigger audit_payment_provider_readiness_trigger
before update on public.payment_provider_connections
for each row execute function app_private.audit_payment_provider_readiness();
