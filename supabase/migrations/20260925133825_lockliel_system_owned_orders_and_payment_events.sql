drop policy if exists orders_finance_update
on public.orders;

revoke update on table public.orders
from authenticated;

alter table public.orders
  drop constraint if exists orders_currency_format,
  add constraint orders_currency_format
    check (currency ~ '^[A-Z]{3}$');

alter table public.orders
  drop constraint if exists orders_amounts_nonnegative,
  add constraint orders_amounts_nonnegative
    check (
      subtotal_cents>=0
      and shipping_cents>=0
      and tax_cents>=0
      and total_cents>=0
    );

alter table public.orders
  drop constraint if exists orders_total_matches_components,
  add constraint orders_total_matches_components
    check (
      total_cents=subtotal_cents+shipping_cents+tax_cents
    );

alter table public.orders
  drop constraint if exists orders_provider_allowed,
  add constraint orders_provider_allowed
    check (
      provider is null
      or provider in ('authorize_net','stripe','paypal','square')
    );

alter table public.orders
  drop constraint if exists orders_provider_session_ref_length,
  add constraint orders_provider_session_ref_length
    check (
      provider_session_ref is null
      or char_length(provider_session_ref)<=300
    );

alter table public.orders
  drop constraint if exists orders_provider_transaction_ref_length,
  add constraint orders_provider_transaction_ref_length
    check (
      provider_transaction_ref is null
      or char_length(provider_transaction_ref)<=300
    );

alter table public.orders
  drop constraint if exists orders_customer_email_length,
  add constraint orders_customer_email_length
    check (
      customer_email is null
      or char_length(customer_email)<=254
    );

alter table public.orders
  drop constraint if exists orders_customer_name_length,
  add constraint orders_customer_name_length
    check (
      customer_name is null
      or char_length(customer_name)<=300
    );

create or replace function app_private.normalize_order_record()
returns trigger
language plpgsql
set search_path to ''
as $function$
begin
  new.currency:=upper(trim(new.currency));
  new.provider:=nullif(trim(coalesce(new.provider,'')),'');
  new.provider_session_ref:=nullif(trim(coalesce(new.provider_session_ref,'')),'');
  new.provider_transaction_ref:=nullif(trim(coalesce(new.provider_transaction_ref,'')),'');
  new.customer_email:=nullif(lower(trim(coalesce(new.customer_email,''))),'');
  new.customer_name:=nullif(trim(coalesce(new.customer_name,'')),'');

  if tg_op='UPDATE' then
    if old.id is distinct from new.id
       or old.profile_id is distinct from new.profile_id
       or old.currency is distinct from new.currency
       or old.subtotal_cents is distinct from new.subtotal_cents
       or old.shipping_cents is distinct from new.shipping_cents
       or old.tax_cents is distinct from new.tax_cents
       or old.total_cents is distinct from new.total_cents
       or old.delivery_method is distinct from new.delivery_method
       or old.created_at is distinct from new.created_at then
      raise exception 'Order financial identity and totals cannot be changed after creation.';
    end if;

    if old.provider is not null
       and old.provider is distinct from new.provider then
      raise exception 'Order payment provider cannot be replaced once recorded.';
    end if;

    if old.provider_session_ref is not null
       and old.provider_session_ref is distinct from new.provider_session_ref then
      raise exception 'Order provider session reference cannot be replaced once recorded.';
    end if;

    if old.provider_transaction_ref is not null
       and old.provider_transaction_ref is distinct from new.provider_transaction_ref then
      raise exception 'Order provider transaction reference cannot be replaced once recorded.';
    end if;
  end if;

  if new.status in ('paid','fulfilled','partially_refunded','refunded')
     and new.paid_at is null then
    new.paid_at:=now();
  end if;

  if new.status='fulfilled'
     and new.fulfilled_at is null then
    new.fulfilled_at:=now();
  end if;

  return new;
end;
$function$;

revoke execute on function app_private.normalize_order_record()
from public, anon, authenticated;

drop trigger if exists normalize_order_record_trigger
on public.orders;

create trigger normalize_order_record_trigger
before insert or update on public.orders
for each row
execute function app_private.normalize_order_record();

alter table public.payment_events
  drop constraint if exists payment_events_provider_event_ref_length,
  add constraint payment_events_provider_event_ref_length
    check (char_length(provider_event_ref) between 1 and 300);

alter table public.payment_events
  drop constraint if exists payment_events_event_type_length,
  add constraint payment_events_event_type_length
    check (char_length(event_type) between 1 and 200);

alter table public.payment_events
  drop constraint if exists payment_events_fingerprint_length,
  add constraint payment_events_fingerprint_length
    check (
      payload_fingerprint is null
      or char_length(payload_fingerprint)<=200
    );

alter table public.payment_events
  drop constraint if exists payment_events_error_length,
  add constraint payment_events_error_length
    check (
      error_message is null
      or char_length(error_message)<=2000
    );

alter table public.payment_events
  drop constraint if exists payment_events_safe_metadata_object,
  add constraint payment_events_safe_metadata_object
    check (jsonb_typeof(safe_metadata)='object');

create or replace function app_private.normalize_payment_event()
returns trigger
language plpgsql
set search_path to ''
as $function$
begin
  new.provider_event_ref:=trim(new.provider_event_ref);
  new.event_type:=trim(new.event_type);
  new.payload_fingerprint:=nullif(trim(coalesce(new.payload_fingerprint,'')),'');
  new.error_message:=nullif(trim(coalesce(new.error_message,'')),'');

  if tg_op='INSERT' then
    new.received_at:=now();
  else
    if old.id is distinct from new.id
       or old.provider is distinct from new.provider
       or old.provider_event_ref is distinct from new.provider_event_ref
       or old.event_type is distinct from new.event_type
       or old.received_at is distinct from new.received_at
       or old.payload_fingerprint is distinct from new.payload_fingerprint then
      raise exception 'Payment event identity cannot be changed after receipt.';
    end if;
  end if;

  if new.status in ('processed','ignored','failed') then
    new.processed_at:=coalesce(
      case when tg_op='UPDATE' then old.processed_at else null end,
      now()
    );
  elsif new.status in ('received','processing') then
    new.processed_at:=null;
  end if;

  return new;
end;
$function$;

revoke execute on function app_private.normalize_payment_event()
from public, anon, authenticated;

drop trigger if exists normalize_payment_event_trigger
on public.payment_events;

create trigger normalize_payment_event_trigger
before insert or update on public.payment_events
for each row
execute function app_private.normalize_payment_event();
