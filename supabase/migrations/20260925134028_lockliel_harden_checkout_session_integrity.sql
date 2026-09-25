alter table public.checkout_sessions
  drop constraint if exists checkout_sessions_amount_positive,
  add constraint checkout_sessions_amount_positive
    check (amount_cents is null or amount_cents>0);

alter table public.checkout_sessions
  drop constraint if exists checkout_sessions_currency_format,
  add constraint checkout_sessions_currency_format
    check (currency ~ '^[A-Z]{3}$');

alter table public.checkout_sessions
  drop constraint if exists checkout_sessions_provider_ref_length,
  add constraint checkout_sessions_provider_ref_length
    check (
      provider_session_ref is null
      or char_length(provider_session_ref)<=300
    );

alter table public.checkout_sessions
  drop constraint if exists checkout_sessions_designation_length,
  add constraint checkout_sessions_designation_length
    check (
      designation is null
      or char_length(designation)<=200
    );

alter table public.checkout_sessions
  drop constraint if exists checkout_sessions_campaign_length,
  add constraint checkout_sessions_campaign_length
    check (
      campaign is null
      or char_length(campaign)<=200
    );

alter table public.checkout_sessions
  drop constraint if exists checkout_sessions_contact_email_length,
  add constraint checkout_sessions_contact_email_length
    check (
      contact_email is null
      or char_length(contact_email)<=254
    );

alter table public.checkout_sessions
  drop constraint if exists checkout_sessions_contact_name_length,
  add constraint checkout_sessions_contact_name_length
    check (
      contact_name is null
      or char_length(contact_name)<=300
    );

alter table public.checkout_sessions
  drop constraint if exists checkout_sessions_metadata_object,
  add constraint checkout_sessions_metadata_object
    check (jsonb_typeof(metadata)='object');

alter table public.checkout_sessions
  drop constraint if exists checkout_sessions_expiry_after_creation,
  add constraint checkout_sessions_expiry_after_creation
    check (
      expires_at is null
      or expires_at>created_at
    );

create or replace function app_private.normalize_checkout_session()
returns trigger
language plpgsql
set search_path to ''
as $function$
begin
  new.currency:=upper(trim(new.currency));
  new.provider_session_ref:=nullif(trim(coalesce(new.provider_session_ref,'')),'');
  new.designation:=nullif(trim(coalesce(new.designation,'')),'');
  new.campaign:=nullif(trim(coalesce(new.campaign,'')),'');
  new.contact_email:=nullif(lower(trim(coalesce(new.contact_email,''))),'');
  new.contact_name:=nullif(trim(coalesce(new.contact_name,'')),'');

  if tg_op='INSERT' then
    new.created_at:=now();
  else
    if old.id is distinct from new.id
       or old.profile_id is distinct from new.profile_id
       or old.purpose is distinct from new.purpose
       or old.provider is distinct from new.provider
       or old.amount_cents is distinct from new.amount_cents
       or old.currency is distinct from new.currency
       or old.designation is distinct from new.designation
       or old.campaign is distinct from new.campaign
       or old.created_at is distinct from new.created_at then
      raise exception 'Checkout financial identity cannot be changed after creation.';
    end if;

    if old.provider_session_ref is not null
       and old.provider_session_ref is distinct from new.provider_session_ref then
      raise exception 'Checkout provider session reference cannot be replaced once recorded.';
    end if;

    if old.order_id is not null
       and old.order_id is distinct from new.order_id then
      raise exception 'Checkout order link cannot be replaced once recorded.';
    end if;

    if old.status in ('completed','expired','cancelled','failed')
       and old.status is distinct from new.status then
      raise exception 'Terminal checkout sessions cannot be reopened.';
    end if;
  end if;

  if new.status='completed' then
    new.completed_at:=coalesce(
      case when tg_op='UPDATE' then old.completed_at else null end,
      now()
    );
  else
    new.completed_at:=null;
  end if;

  return new;
end;
$function$;

revoke execute on function app_private.normalize_checkout_session()
from public, anon, authenticated;

drop trigger if exists normalize_checkout_session_trigger
on public.checkout_sessions;

create trigger normalize_checkout_session_trigger
before insert or update on public.checkout_sessions
for each row
execute function app_private.normalize_checkout_session();

create or replace function app_private.audit_checkout_session_status()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
begin
  if old.status is not distinct from new.status then
    return new;
  end if;

  insert into public.audit_events(
    actor_profile_id,
    event_type,
    entity_type,
    entity_id,
    summary,
    metadata
  )
  values(
    (select auth.uid()),
    'checkout_session_status_changed',
    'checkout_session',
    new.id::text,
    'Checkout session status changed',
    jsonb_build_object(
      'purpose',new.purpose,
      'provider',new.provider,
      'status_from',old.status,
      'status_to',new.status,
      'profile_id',new.profile_id,
      'order_id',new.order_id
    )
  );

  return new;
end;
$function$;

revoke execute on function app_private.audit_checkout_session_status()
from public, anon, authenticated;

drop trigger if exists audit_checkout_session_status_trigger
on public.checkout_sessions;

create trigger audit_checkout_session_status_trigger
after update of status on public.checkout_sessions
for each row
execute function app_private.audit_checkout_session_status();
