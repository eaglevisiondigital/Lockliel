create or replace function app_private.protect_fulfillment_snapshot()
returns trigger
language plpgsql
set search_path to ''
as $function$
declare
  _old_order_id uuid;
  _new_order_id uuid;
  _target_order_id uuid;
  _target_status text;
  _new_status text;
begin
  if tg_op<>'INSERT' then
    _old_order_id:=old.order_id;
  end if;
  if tg_op<>'DELETE' then
    _new_order_id:=new.order_id;
  end if;
  _target_order_id:=coalesce(_old_order_id,_new_order_id);

  if tg_table_name='order_items' then
    select o.status
      into _target_status
    from public.orders o
    where o.id=_target_order_id;

    if _target_status in ('paid','partially_refunded','refunded','fulfilled') then
      raise exception 'Order items cannot be changed after payment has been recorded.';
    end if;

    if exists(
      select 1
      from public.order_fulfillment_events ofe
      where ofe.order_id=_target_order_id
        and ofe.event_type in ('packed','shipped','delivered','fulfilled')
    ) then
      raise exception 'Order items cannot be changed after fulfillment packing has begun.';
    end if;

    if _new_order_id is not null
       and _new_order_id is distinct from _target_order_id then
      select o.status
        into _new_status
      from public.orders o
      where o.id=_new_order_id;

      if _new_status in ('paid','partially_refunded','refunded','fulfilled') then
        raise exception 'Order items cannot be moved into an order after payment has been recorded.';
      end if;

      if exists(
        select 1
        from public.order_fulfillment_events ofe
        where ofe.order_id=_new_order_id
          and ofe.event_type in ('packed','shipped','delivered','fulfilled')
      ) then
        raise exception 'Order items cannot be moved into an order after fulfillment packing has begun.';
      end if;
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
