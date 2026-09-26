revoke all privileges on table public.order_items
from anon;

revoke insert, update, delete
on table public.order_items
from authenticated;

revoke all privileges on table public.order_shipping_addresses
from anon;

revoke insert, update, delete
on table public.order_shipping_addresses
from authenticated;

alter table public.order_items
  drop constraint if exists order_items_unit_price_nonnegative,
  add constraint order_items_unit_price_nonnegative
    check (unit_price_cents>=0);

create unique index if not exists order_items_order_product_uidx
on public.order_items(order_id,product_id);

alter table public.order_shipping_addresses
  drop constraint if exists shipping_recipient_name_length,
  add constraint shipping_recipient_name_length
    check (char_length(recipient_name) between 1 and 300);

alter table public.order_shipping_addresses
  drop constraint if exists shipping_line1_length,
  add constraint shipping_line1_length
    check (char_length(line1) between 1 and 300);

alter table public.order_shipping_addresses
  drop constraint if exists shipping_line2_length,
  add constraint shipping_line2_length
    check (line2 is null or char_length(line2)<=300);

alter table public.order_shipping_addresses
  drop constraint if exists shipping_city_length,
  add constraint shipping_city_length
    check (char_length(city) between 1 and 160);

alter table public.order_shipping_addresses
  drop constraint if exists shipping_region_length,
  add constraint shipping_region_length
    check (char_length(region) between 1 and 160);

alter table public.order_shipping_addresses
  drop constraint if exists shipping_postal_code_length,
  add constraint shipping_postal_code_length
    check (char_length(postal_code) between 1 and 40);

alter table public.order_shipping_addresses
  drop constraint if exists shipping_country_length,
  add constraint shipping_country_length
    check (char_length(country) between 2 and 100);

alter table public.order_fulfillment_events
  drop constraint if exists fulfillment_carrier_length,
  add constraint fulfillment_carrier_length
    check (carrier is null or char_length(carrier)<=120);

alter table public.order_fulfillment_events
  drop constraint if exists fulfillment_tracking_length,
  add constraint fulfillment_tracking_length
    check (tracking_number is null or char_length(tracking_number)<=240);

alter table public.order_fulfillment_events
  drop constraint if exists fulfillment_note_length,
  add constraint fulfillment_note_length
    check (note is null or char_length(note)<=2000);

alter table public.order_fulfillment_events
  drop constraint if exists fulfillment_note_event_requires_note,
  add constraint fulfillment_note_event_requires_note
    check (
      event_type<>'note'
      or nullif(trim(coalesce(note,'')),'') is not null
    );

create or replace function app_private.normalize_fulfillment_event()
returns trigger
language plpgsql
set search_path to ''
as $function$
begin
  new.actor_profile_id:=coalesce((select auth.uid()),new.actor_profile_id);
  new.carrier:=nullif(trim(coalesce(new.carrier,'')),'');
  new.tracking_number:=nullif(trim(coalesce(new.tracking_number,'')),'');
  new.note:=nullif(trim(coalesce(new.note,'')),'');
  new.created_at:=now();

  return new;
end;
$function$;

revoke execute on function app_private.normalize_fulfillment_event()
from public, anon, authenticated;

drop trigger if exists normalize_fulfillment_event_trigger
on public.order_fulfillment_events;

create trigger normalize_fulfillment_event_trigger
before insert on public.order_fulfillment_events
for each row
execute function app_private.normalize_fulfillment_event();
