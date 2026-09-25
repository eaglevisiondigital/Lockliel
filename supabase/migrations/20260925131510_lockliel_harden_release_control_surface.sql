revoke all privileges on table public.feature_flags from anon;
revoke insert, update, delete on table public.feature_flags from authenticated;
grant select on table public.feature_flags to authenticated;
grant update (enabled) on table public.feature_flags to authenticated;

revoke all privileges on table public.launch_verifications from anon;
revoke insert, update, delete on table public.launch_verifications from authenticated;
grant select on table public.launch_verifications to authenticated;
grant update (verified,note) on table public.launch_verifications to authenticated;

alter table public.launch_verifications
  drop constraint if exists launch_verifications_note_length,
  add constraint launch_verifications_note_length
    check (note is null or char_length(note)<=3000);

drop policy if exists payment_provider_member_read
on public.payment_provider_connections;

create policy payment_provider_staff_read
on public.payment_provider_connections
for select
to authenticated
using (
  app_private.has_staff_role(array['super_admin','admin'])
);

create policy payment_provider_staff_update
on public.payment_provider_connections
for update
to authenticated
using (
  app_private.has_staff_role(array['super_admin','admin'])
)
with check (
  app_private.has_staff_role(array['super_admin','admin'])
);

revoke all privileges on table public.payment_provider_connections from anon;
revoke insert, update, delete on table public.payment_provider_connections from authenticated;
grant select on table public.payment_provider_connections to authenticated;
grant update (
  status,
  checkout_adapter_ready,
  webhook_ready,
  verification_note
) on table public.payment_provider_connections to authenticated;

alter table public.payment_provider_connections
  drop constraint if exists payment_provider_verification_note_length,
  add constraint payment_provider_verification_note_length
    check (
      verification_note is null
      or char_length(verification_note)<=2000
    );

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
     or old.webhook_ready is distinct from new.webhook_ready
     or old.verification_note is distinct from new.verification_note then
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
        'webhook_ready',new.webhook_ready,
        'verification_note_changed',
          old.verification_note is distinct from new.verification_note
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

  new.updated_at:=now();
  return new;
end;
$function$;

revoke execute on function app_private.audit_payment_provider_readiness()
from public, anon, authenticated;

create table if not exists public.partner_checkout_state(
  id boolean primary key default true check (id=true),
  checkout_ready boolean not null default false,
  supports_one_time boolean not null default false,
  supports_recurring boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.partner_checkout_state enable row level security;

drop policy if exists partner_checkout_state_member_read
on public.partner_checkout_state;

create policy partner_checkout_state_member_read
on public.partner_checkout_state
for select
to authenticated
using (true);

revoke all privileges on table public.partner_checkout_state from anon;
revoke insert, update, delete on table public.partner_checkout_state from authenticated;
grant select (
  checkout_ready,
  supports_one_time,
  supports_recurring,
  updated_at
) on table public.partner_checkout_state to authenticated;

create or replace function app_private.refresh_partner_checkout_state()
returns void
language plpgsql
security definer
set search_path to ''
as $function$
declare
  flag_enabled boolean:=false;
  selected_provider record;
begin
  select coalesce(f.enabled,false)
    into flag_enabled
  from public.feature_flags f
  where f.key='partner_checkout';

  select
    p.supports_one_time,
    p.supports_recurring
  into selected_provider
  from public.payment_provider_connections p
  where p.status='active'
    and p.checkout_adapter_ready=true
    and p.webhook_ready=true
  order by
    case p.provider
      when 'authorize_net' then 1
      when 'stripe' then 2
      when 'paypal' then 3
      when 'square' then 4
      else 9
    end
  limit 1;

  insert into public.partner_checkout_state(
    id,
    checkout_ready,
    supports_one_time,
    supports_recurring,
    updated_at
  )
  values(
    true,
    flag_enabled and selected_provider is not null,
    coalesce(selected_provider.supports_one_time,false),
    coalesce(selected_provider.supports_recurring,false),
    now()
  )
  on conflict(id) do update set
    checkout_ready=excluded.checkout_ready,
    supports_one_time=excluded.supports_one_time,
    supports_recurring=excluded.supports_recurring,
    updated_at=excluded.updated_at;
end;
$function$;

revoke execute on function app_private.refresh_partner_checkout_state()
from public, anon, authenticated;

create or replace function app_private.refresh_partner_checkout_state_trigger()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
begin
  perform app_private.refresh_partner_checkout_state();
  return coalesce(new,old);
end;
$function$;

revoke execute on function app_private.refresh_partner_checkout_state_trigger()
from public, anon, authenticated;

drop trigger if exists refresh_partner_checkout_state_provider_trigger
on public.payment_provider_connections;

create trigger refresh_partner_checkout_state_provider_trigger
after insert or delete or update of
  status,
  checkout_adapter_ready,
  webhook_ready,
  supports_one_time,
  supports_recurring
on public.payment_provider_connections
for each row
execute function app_private.refresh_partner_checkout_state_trigger();

drop trigger if exists refresh_partner_checkout_state_flag_trigger
on public.feature_flags;

create trigger refresh_partner_checkout_state_flag_trigger
after update of enabled
on public.feature_flags
for each row
when (new.key='partner_checkout')
execute function app_private.refresh_partner_checkout_state_trigger();

select app_private.refresh_partner_checkout_state();
