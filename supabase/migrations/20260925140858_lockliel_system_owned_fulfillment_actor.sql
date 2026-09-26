revoke insert on table public.order_fulfillment_events from authenticated;

grant insert (
  order_id,
  event_type,
  carrier,
  tracking_number,
  note
) on table public.order_fulfillment_events to authenticated;
