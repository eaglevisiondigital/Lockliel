create or replace function app_private.validate_fulfillment_event_order()
returns trigger
language plpgsql
set search_path to ''
as $function$
declare
  _delivery_method text;
  _has_address boolean:=false;
  _has_items boolean:=false;
begin
  select o.delivery_method
    into _delivery_method
  from public.orders o
  where o.id=new.order_id;

  select exists(
    select 1 from public.order_shipping_addresses osa where osa.order_id=new.order_id
  ) into _has_address;

  select exists(
    select 1 from public.order_items oi where oi.order_id=new.order_id
  ) into _has_items;

  if new.event_type in ('packed','shipped','delivered','fulfilled')
     and not _has_items then
    raise exception 'An order must contain at least one item before fulfillment can advance.';
  end if;

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
