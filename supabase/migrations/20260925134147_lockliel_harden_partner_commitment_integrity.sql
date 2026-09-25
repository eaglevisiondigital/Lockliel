alter table public.partner_commitments
  drop constraint if exists partner_commitments_amount_positive,
  add constraint partner_commitments_amount_positive
    check (amount_cents is null or amount_cents>0);

alter table public.partner_commitments
  drop constraint if exists partner_commitments_currency_format,
  add constraint partner_commitments_currency_format
    check (currency ~ '^[A-Z]{3}$');

alter table public.partner_commitments
  drop constraint if exists partner_commitments_provider_allowed,
  add constraint partner_commitments_provider_allowed
    check (
      provider is null
      or provider in ('authorize_net','stripe','paypal','square')
    );

alter table public.partner_commitments
  drop constraint if exists partner_commitments_customer_ref_length,
  add constraint partner_commitments_customer_ref_length
    check (
      provider_customer_ref is null
      or char_length(provider_customer_ref)<=300
    );

alter table public.partner_commitments
  drop constraint if exists partner_commitments_subscription_ref_length,
  add constraint partner_commitments_subscription_ref_length
    check (
      provider_subscription_ref is null
      or char_length(provider_subscription_ref)<=300
    );

alter table public.partner_commitments
  drop constraint if exists partner_commitments_designation_length,
  add constraint partner_commitments_designation_length
    check (char_length(designation) between 1 and 200);

alter table public.partner_commitments
  drop constraint if exists partner_commitments_campaign_length,
  add constraint partner_commitments_campaign_length
    check (
      campaign is null
      or char_length(campaign)<=200
    );

alter table public.partner_commitments
  drop constraint if exists partner_commitments_donor_email_length,
  add constraint partner_commitments_donor_email_length
    check (
      donor_email is null
      or char_length(donor_email)<=254
    );

alter table public.partner_commitments
  drop constraint if exists partner_commitments_donor_name_length,
  add constraint partner_commitments_donor_name_length
    check (
      donor_name is null
      or char_length(donor_name)<=300
    );

create or replace function app_private.normalize_partner_commitment()
returns trigger
language plpgsql
set search_path to ''
as $function$
begin
  new.currency:=upper(trim(new.currency));
  new.provider:=nullif(trim(coalesce(new.provider,'')),'');
  new.provider_customer_ref:=nullif(trim(coalesce(new.provider_customer_ref,'')),'');
  new.provider_subscription_ref:=nullif(trim(coalesce(new.provider_subscription_ref,'')),'');
  new.designation:=trim(new.designation);
  new.campaign:=nullif(trim(coalesce(new.campaign,'')),'');
  new.donor_email:=nullif(lower(trim(coalesce(new.donor_email,''))),'');
  new.donor_name:=nullif(trim(coalesce(new.donor_name,'')),'');

  if tg_op='INSERT' then
    new.created_at:=now();
  else
    if old.id is distinct from new.id
       or old.profile_id is distinct from new.profile_id
       or old.cadence is distinct from new.cadence
       or old.amount_cents is distinct from new.amount_cents
       or old.currency is distinct from new.currency
       or old.designation is distinct from new.designation
       or old.campaign is distinct from new.campaign
       or old.created_at is distinct from new.created_at then
      raise exception 'Partnership commitment identity and amount fields cannot be changed after creation.';
    end if;

    if old.provider is not null
       and old.provider is distinct from new.provider then
      raise exception 'Partnership payment provider cannot be replaced once recorded.';
    end if;

    if old.provider_customer_ref is not null
       and old.provider_customer_ref is distinct from new.provider_customer_ref then
      raise exception 'Partnership customer reference cannot be replaced once recorded.';
    end if;

    if old.provider_subscription_ref is not null
       and old.provider_subscription_ref is distinct from new.provider_subscription_ref then
      raise exception 'Partnership subscription reference cannot be replaced once recorded.';
    end if;
  end if;

  if new.status='active'
     and new.started_at is null then
    new.started_at:=now();
  end if;

  if new.status in ('cancelled','ended')
     and new.cancelled_at is null then
    new.cancelled_at:=now();
  end if;

  return new;
end;
$function$;

revoke execute on function app_private.normalize_partner_commitment()
from public, anon, authenticated;

drop trigger if exists normalize_partner_commitment_trigger
on public.partner_commitments;

create trigger normalize_partner_commitment_trigger
before insert or update on public.partner_commitments
for each row
execute function app_private.normalize_partner_commitment();

create or replace function app_private.audit_partner_commitment_change()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
begin
  if tg_op='INSERT' then
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
      'partner_commitment_created',
      'partner_commitment',
      new.id::text,
      'Partner commitment recorded',
      jsonb_build_object(
        'profile_id',new.profile_id,
        'provider',new.provider,
        'cadence',new.cadence,
        'amount_cents',new.amount_cents,
        'currency',new.currency,
        'status',new.status,
        'designation',new.designation
      )
    );
    return new;
  end if;

  if old.status is not distinct from new.status
     and old.started_at is not distinct from new.started_at
     and old.cancelled_at is not distinct from new.cancelled_at
     and old.provider_customer_ref is not distinct from new.provider_customer_ref
     and old.provider_subscription_ref is not distinct from new.provider_subscription_ref
     and old.donor_email is not distinct from new.donor_email
     and old.donor_name is not distinct from new.donor_name then
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
    'partner_commitment_changed',
    'partner_commitment',
    new.id::text,
    'Partner commitment changed',
    jsonb_build_object(
      'status_from',old.status,
      'status_to',new.status,
      'started_at_changed',old.started_at is distinct from new.started_at,
      'cancelled_at_changed',old.cancelled_at is distinct from new.cancelled_at,
      'provider_refs_changed',
        old.provider_customer_ref is distinct from new.provider_customer_ref
        or old.provider_subscription_ref is distinct from new.provider_subscription_ref,
      'donor_identity_changed',
        old.donor_email is distinct from new.donor_email
        or old.donor_name is distinct from new.donor_name
    )
  );

  return new;
end;
$function$;

revoke execute on function app_private.audit_partner_commitment_change()
from public, anon, authenticated;

drop trigger if exists audit_partner_commitment_change_trigger
on public.partner_commitments;

create trigger audit_partner_commitment_change_trigger
after insert or update on public.partner_commitments
for each row
execute function app_private.audit_partner_commitment_change();
