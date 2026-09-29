alter table public.gifts
  drop constraint if exists gifts_status_format,
  add constraint gifts_status_format
    check (
      char_length(status) between 1 and 50
      and status ~ '^[a-z][a-z0-9_]*$'
    );

alter table public.entitlements
  drop constraint if exists entitlements_reason_length,
  add constraint entitlements_reason_length
    check (
      char_length(trim(reason)) between 1 and 200
    );

alter table public.entitlements
  drop constraint if exists entitlements_source_ref_length,
  add constraint entitlements_source_ref_length
    check (
      source_ref is null
      or char_length(source_ref)<=300
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
  new.status:=lower(trim(new.status));
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
