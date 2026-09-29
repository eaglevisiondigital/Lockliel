drop trigger if exists audit_entitlement_insert_trigger
on public.entitlements;

drop policy if exists entitlements_staff_insert
on public.entitlements;

create policy entitlements_staff_insert
on public.entitlements
for insert
to authenticated
with check (
  app_private.has_staff_role(
    array['super_admin','admin','finance_admin','content_admin']
  )
  and reason not like 'gift-benefit:%'
);

drop policy if exists entitlements_staff_delete
on public.entitlements;

create policy entitlements_staff_delete
on public.entitlements
for delete
to authenticated
using (
  (
    reason not like 'gift-benefit:%'
    and app_private.has_staff_role(
      array['super_admin','admin','finance_admin','content_admin']
    )
  )
  or (
    reason like 'gift-benefit:%'
    and app_private.has_staff_role(
      array['super_admin','admin','finance_admin']
    )
  )
);

alter table public.benefit_rules
  drop constraint if exists benefit_rules_minimum_gift_positive,
  add constraint benefit_rules_minimum_gift_positive
    check (minimum_gift_cents>0);

alter table public.benefit_rules
  drop constraint if exists benefit_rules_date_window_valid,
  add constraint benefit_rules_date_window_valid
    check (
      starts_at is null
      or ends_at is null
      or starts_at<=ends_at
    );

create or replace function app_private.validate_benefit_rule_activation()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
declare
  product_row record;
begin
  if new.status<>'active' then
    return new;
  end if;

  select p.id,p.product_type,p.status,p.storage_path
    into product_row
  from public.products p
  where p.id=new.product_id;

  if product_row.id is null
     or product_row.status<>'active' then
    raise exception 'Benefit rules require an active product.';
  end if;

  if new.fulfillment_type='digital' then
    if product_row.storage_path is null
       or not exists(
         select 1
         from storage.objects o
         where o.bucket_id='member-resources'
           and o.name=product_row.storage_path
       ) then
      raise exception 'Digital benefit rules require a protected product file.';
    end if;

    if product_row.product_type='digital_book'
       and not exists(
         select 1
         from public.feature_flags f
         where f.key='digital_book_delivery'
           and f.enabled=true
       ) then
      raise exception 'Digital book benefit rules require digital book delivery to be enabled.';
    end if;
  end if;

  if new.slug='heart-for-the-lost-gift-20'
     and not exists(
       select 1
       from public.feature_flags f
       where f.key='heart_book_gift_benefit'
         and f.enabled=true
     ) then
    raise exception 'A Heart for the Lost gift benefit requires its release flag to be enabled.';
  end if;

  return new;
end;
$function$;

revoke execute on function app_private.validate_benefit_rule_activation()
from public, anon, authenticated;

drop trigger if exists validate_benefit_rule_activation_trigger
on public.benefit_rules;

create trigger validate_benefit_rule_activation_trigger
before insert or update of
  status,
  product_id,
  fulfillment_type,
  minimum_gift_cents,
  starts_at,
  ends_at
on public.benefit_rules
for each row
execute function app_private.validate_benefit_rule_activation();

revoke insert, update on table public.gifts
from authenticated;

grant insert (
  profile_id,
  provider,
  provider_transaction_ref,
  amount_cents,
  currency,
  status,
  received_at,
  designation,
  campaign,
  donor_email,
  donor_name
) on table public.gifts
to authenticated;

grant update (
  status,
  received_at,
  designation,
  campaign,
  donor_email,
  donor_name
) on table public.gifts
to authenticated;

alter table public.gifts
  drop constraint if exists gifts_amount_positive,
  add constraint gifts_amount_positive
    check (amount_cents>0);

alter table public.gifts
  drop constraint if exists gifts_currency_format,
  add constraint gifts_currency_format
    check (currency ~ '^[A-Z]{3}$');

alter table public.gifts
  drop constraint if exists gifts_provider_length,
  add constraint gifts_provider_length
    check (
      char_length(trim(provider)) between 1 and 80
    );

alter table public.gifts
  drop constraint if exists gifts_provider_ref_length,
  add constraint gifts_provider_ref_length
    check (
      char_length(trim(provider_transaction_ref)) between 1 and 300
    );

alter table public.gifts
  drop constraint if exists gifts_designation_length,
  add constraint gifts_designation_length
    check (
      char_length(designation) between 1 and 200
    );

alter table public.gifts
  drop constraint if exists gifts_campaign_length,
  add constraint gifts_campaign_length
    check (
      campaign is null
      or char_length(campaign)<=200
    );

alter table public.gifts
  drop constraint if exists gifts_donor_email_length,
  add constraint gifts_donor_email_length
    check (
      donor_email is null
      or char_length(donor_email)<=254
    );

alter table public.gifts
  drop constraint if exists gifts_donor_name_length,
  add constraint gifts_donor_name_length
    check (
      donor_name is null
      or char_length(donor_name)<=300
    );

create or replace function app_private.normalize_gift_record()
returns trigger
language plpgsql
set search_path to ''
as $function$
begin
  new.currency:=upper(trim(new.currency));
  new.provider:=trim(new.provider);
  new.provider_transaction_ref:=trim(new.provider_transaction_ref);
  new.designation:=trim(new.designation);
  new.campaign:=nullif(trim(coalesce(new.campaign,'')),'');
  new.donor_email:=nullif(lower(trim(coalesce(new.donor_email,''))),'');
  new.donor_name:=nullif(trim(coalesce(new.donor_name,'')),'');

  if tg_op='UPDATE' then
    if old.id is distinct from new.id
       or old.profile_id is distinct from new.profile_id
       or old.provider is distinct from new.provider
       or old.provider_transaction_ref is distinct from new.provider_transaction_ref
       or old.amount_cents is distinct from new.amount_cents
       or old.currency is distinct from new.currency
       or old.created_at is distinct from new.created_at then
      raise exception 'Gift transaction identity and amount fields cannot be changed after creation.';
    end if;
  end if;

  if new.status in ('succeeded','paid','completed')
     and new.received_at is null then
    new.received_at:=now();
  end if;

  return new;
end;
$function$;

revoke execute on function app_private.normalize_gift_record()
from public, anon, authenticated;

drop trigger if exists normalize_gift_record_trigger
on public.gifts;

create trigger normalize_gift_record_trigger
before insert or update on public.gifts
for each row
execute function app_private.normalize_gift_record();

create or replace function app_private.audit_gift_change()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
begin
  if old.status is not distinct from new.status
     and old.received_at is not distinct from new.received_at
     and old.designation is not distinct from new.designation
     and old.campaign is not distinct from new.campaign
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
    'gift_record_changed',
    'gift',
    new.id::text,
    'Gift record updated',
    jsonb_build_object(
      'status_from',old.status,
      'status_to',new.status,
      'received_at_changed',old.received_at is distinct from new.received_at,
      'designation_changed',old.designation is distinct from new.designation,
      'campaign_changed',old.campaign is distinct from new.campaign,
      'donor_identity_changed',
        old.donor_email is distinct from new.donor_email
        or old.donor_name is distinct from new.donor_name
    )
  );

  return new;
end;
$function$;

revoke execute on function app_private.audit_gift_change()
from public, anon, authenticated;

drop trigger if exists audit_gift_change_trigger
on public.gifts;

create trigger audit_gift_change_trigger
after update of
  status,
  received_at,
  designation,
  campaign,
  donor_email,
  donor_name
on public.gifts
for each row
execute function app_private.audit_gift_change();
