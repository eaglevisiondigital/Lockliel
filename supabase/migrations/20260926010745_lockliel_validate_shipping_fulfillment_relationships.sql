create or replace function app_private.validate_shipping_address_order()
returns trigger
language plpgsql
set search_path to ''
as $function$
declare
  _delivery_method text;
begin
  select o.delivery_method
    into _delivery_method
  from public.orders o
  where o.id=new.order_id;

  if _delivery_method not in ('shipping','mixed') then
    raise exception 'Shipping addresses are allowed only for shipping or mixed-delivery orders.';
  end if;

  return new;
end;
$function$;

revoke execute on function app_private.validate_shipping_address_order()
from public,anon,authenticated;

drop trigger if exists validate_shipping_address_order_trigger
on public.order_shipping_addresses;

create trigger validate_shipping_address_order_trigger
before insert or update on public.order_shipping_addresses
for each row
execute function app_private.validate_shipping_address_order();


create or replace function app_private.validate_fulfillment_event_order()
returns trigger
language plpgsql
set search_path to ''
as $function$
declare
  _delivery_method text;
  _has_address boolean:=false;
begin
  select o.delivery_method
    into _delivery_method
  from public.orders o
  where o.id=new.order_id;

  select exists(
    select 1
    from public.order_shipping_addresses osa
    where osa.order_id=new.order_id
  ) into _has_address;

  if new.event_type in ('packed','shipped','delivered') then
    if _delivery_method not in ('shipping','mixed') then
      raise exception 'Packed, shipped, and delivered events require a shipping or mixed-delivery order.';
    end if;

    if not _has_address then
      raise exception 'A shipping address is required before recording physical fulfillment events.';
    end if;
  end if;

  if new.event_type='fulfilled'
     and _delivery_method in ('shipping','mixed')
     and not _has_address then
    raise exception 'A shipping address is required before fulfilling a shipping or mixed-delivery order.';
  end if;

  return new;
end;
$function$;

revoke execute on function app_private.validate_fulfillment_event_order()
from public,anon,authenticated;

drop trigger if exists validate_fulfillment_event_order_trigger
on public.order_fulfillment_events;

create trigger validate_fulfillment_event_order_trigger
before insert on public.order_fulfillment_events
for each row
execute function app_private.validate_fulfillment_event_order();
