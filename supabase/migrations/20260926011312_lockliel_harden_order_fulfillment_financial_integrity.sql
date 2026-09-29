create or replace function app_private.validate_checkout_order_relationship()
returns trigger
language plpgsql
set search_path to ''
as $function$
declare
  _order_provider text;
  _order_profile_id uuid;
  _order_currency text;
  _order_total_cents bigint;
begin
  if new.order_id is null then
    return new;
  end if;

  select o.provider,o.profile_id,o.currency,o.total_cents
    into _order_provider,_order_profile_id,_order_currency,_order_total_cents
  from public.orders o
  where o.id=new.order_id;

  if new.purpose<>'order' then
    raise exception 'Checkout sessions linked to an order must use order purpose.';
  end if;

  if _order_provider is not null
     and _order_provider<>new.provider then
    raise exception 'Checkout and linked order must use the same payment provider.';
  end if;

  if new.profile_id is not null
     and _order_profile_id is not null
     and new.profile_id<>_order_profile_id then
    raise exception 'Checkout and linked order must belong to the same member.';
  end if;

  if _order_currency is not null
     and new.currency<>_order_currency then
    raise exception 'Checkout and linked order must use the same currency.';
  end if;

  if new.amount_cents is not null
     and _order_total_cents is not null
     and new.amount_cents<>_order_total_cents then
    raise exception 'Checkout amount must match the linked order total.';
  end if;

  return new;
end;
$function$;

revoke execute on function app_private.validate_checkout_order_relationship()
from public,anon,authenticated;


create or replace function app_private.validate_fulfillment_event_order()
returns trigger
language plpgsql
set search_path to ''
as $function$
declare
  _delivery_method text;
  _order_status text;
  _order_total_cents bigint;
  _order_subtotal_cents bigint;
  _item_subtotal_cents bigint:=0;
  _has_address boolean:=false;
  _has_items boolean:=false;
begin
  select o.delivery_method,o.status,o.total_cents,o.subtotal_cents
    into _delivery_method,_order_status,_order_total_cents,_order_subtotal_cents
  from public.orders o
  where o.id=new.order_id;

  select exists(
    select 1
    from public.order_shipping_addresses osa
    where osa.order_id=new.order_id
  ) into _has_address;

  select
    count(*)>0,
    coalesce(sum(oi.quantity::bigint*oi.unit_price_cents),0)
    into _has_items,_item_subtotal_cents
  from public.order_items oi
  where oi.order_id=new.order_id;

  if new.event_type in ('packed','shipped','delivered','fulfilled') then
    if not _has_items then
      raise exception 'An order must contain at least one item before fulfillment can advance.';
    end if;

    if _item_subtotal_cents<>_order_subtotal_cents then
      raise exception 'Order item totals must match the recorded order subtotal before fulfillment can advance.';
    end if;

    if coalesce(_order_total_cents,0)>0
       and _order_status not in ('paid','partially_refunded','fulfilled') then
      raise exception 'A paid order is required before fulfillment can advance.';
    end if;
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


create or replace function app_private.sync_order_fulfillment_status()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
begin
  if new.event_type='fulfilled' then
    update public.orders
    set status=case
          when status='partially_refunded' then status
          else 'fulfilled'
        end,
        fulfilled_at=coalesce(fulfilled_at,now())
    where id=new.order_id;

    insert into public.notifications(profile_id,notification_type,title,body,href)
    select
      o.profile_id,
      'order',
      'Your Lockliel order is fulfilled',
      'Your order has been marked fulfilled in My Lockliel.',
      '/my-lockliel/orders'
    from public.orders o
    where o.id=new.order_id and o.profile_id is not null;
  elsif new.event_type='shipped' then
    insert into public.notifications(profile_id,notification_type,title,body,href)
    select
      o.profile_id,
      'order',
      'Your Lockliel order has shipped',
      case
        when nullif(trim(coalesce(new.tracking_number,'')),'') is not null
          then 'Your order has shipped. Tracking: ' || new.tracking_number
        else 'Your order has shipped.'
      end,
      '/my-lockliel/orders'
    from public.orders o
    where o.id=new.order_id and o.profile_id is not null;
  end if;

  return new;
end;
$function$;

revoke execute on function app_private.sync_order_fulfillment_status()
from public,anon,authenticated;


create or replace function app_private.protect_fulfillment_snapshot()
returns trigger
language plpgsql
set search_path to ''
as $function$
declare
  _old_order_id uuid;
  _new_order_id uuid;
  _target_order_id uuid;
begin
  if tg_op<>'INSERT' then
    _old_order_id:=old.order_id;
  end if;
  if tg_op<>'DELETE' then
    _new_order_id:=new.order_id;
  end if;
  _target_order_id:=coalesce(_old_order_id,_new_order_id);

  if tg_table_name='order_items' then
    if exists(
      select 1
      from public.order_fulfillment_events ofe
      where ofe.order_id=_target_order_id
        and ofe.event_type in ('packed','shipped','delivered','fulfilled')
    ) then
      raise exception 'Order items cannot be changed after fulfillment packing has begun.';
    end if;

    if _new_order_id is not null
       and _new_order_id is distinct from _target_order_id
       and exists(
         select 1
         from public.order_fulfillment_events ofe
         where ofe.order_id=_new_order_id
           and ofe.event_type in ('packed','shipped','delivered','fulfilled')
       ) then
      raise exception 'Order items cannot be moved into an order after fulfillment packing has begun.';
    end if;
  elsif tg_table_name='order_shipping_addresses' then
    if exists(
      select 1
      from public.order_fulfillment_events ofe
      where ofe.order_id=_target_order_id
        and ofe.event_type in ('shipped','delivered','fulfilled')
    ) then
      raise exception 'Shipping addresses cannot be changed after an order has shipped.';
    end if;

    if _new_order_id is not null
       and _new_order_id is distinct from _target_order_id
       and exists(
         select 1
         from public.order_fulfillment_events ofe
         where ofe.order_id=_new_order_id
           and ofe.event_type in ('shipped','delivered','fulfilled')
       ) then
      raise exception 'Shipping addresses cannot be moved into an order after shipment.';
    end if;
  end if;

  return case when tg_op='DELETE' then old else new end;
end;
$function$;

revoke execute on function app_private.protect_fulfillment_snapshot()
from public,anon,authenticated;

drop trigger if exists protect_order_items_fulfillment_snapshot_trigger
on public.order_items;

create trigger protect_order_items_fulfillment_snapshot_trigger
before insert or update or delete
on public.order_items
for each row
execute function app_private.protect_fulfillment_snapshot();

drop trigger if exists protect_shipping_address_fulfillment_snapshot_trigger
on public.order_shipping_addresses;

create trigger protect_shipping_address_fulfillment_snapshot_trigger
before insert or update or delete
on public.order_shipping_addresses
for each row
execute function app_private.protect_fulfillment_snapshot();
