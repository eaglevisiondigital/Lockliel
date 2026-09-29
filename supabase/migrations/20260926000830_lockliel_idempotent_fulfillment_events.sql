create unique index if not exists order_fulfillment_one_stage_uidx
on public.order_fulfillment_events(order_id,event_type)
where event_type in ('processing','packed','delivered','fulfilled');

create unique index if not exists order_fulfillment_shipment_uidx
on public.order_fulfillment_events(
  order_id,
  event_type,
  coalesce(tracking_number,'')
)
where event_type='shipped';
