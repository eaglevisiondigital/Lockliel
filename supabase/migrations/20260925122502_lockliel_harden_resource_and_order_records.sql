revoke all privileges on table public.order_items from anon;
revoke all privileges on table public.order_items from authenticated;
grant select on table public.order_items to authenticated;

revoke all privileges on table public.order_shipping_addresses from anon;
revoke all privileges on table public.order_shipping_addresses from authenticated;
grant select on table public.order_shipping_addresses to authenticated;

revoke all privileges on table public.order_fulfillment_events from anon;
revoke all privileges on table public.order_fulfillment_events from authenticated;
grant select on table public.order_fulfillment_events to authenticated;
grant insert (
  order_id,
  actor_profile_id,
  event_type,
  carrier,
  tracking_number,
  note
) on table public.order_fulfillment_events to authenticated;

revoke all privileges on table public.products from anon;
revoke all privileges on table public.products from authenticated;
grant select on table public.products to authenticated;
grant update (
  title,
  status,
  price_cents,
  currency,
  storage_path,
  cover_path,
  description,
  language_code,
  translation_key
) on table public.products to authenticated;

revoke all privileges on table public.benefit_rules from anon;
revoke all privileges on table public.benefit_rules from authenticated;
grant select on table public.benefit_rules to authenticated;
grant update (status) on table public.benefit_rules to authenticated;

revoke all privileges on table public.entitlements from anon;
revoke all privileges on table public.entitlements from authenticated;
grant select on table public.entitlements to authenticated;
grant insert (
  profile_id,
  product_id,
  reason,
  source_ref
) on table public.entitlements to authenticated;
grant delete on table public.entitlements to authenticated;

create or replace function app_private.audit_entitlement_change()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
declare
  row_data public.entitlements%rowtype;
begin
  row_data:=case when tg_op='DELETE' then old else new end;

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
    case
      when tg_op='DELETE' then 'entitlement_revoked'
      else 'entitlement_granted'
    end,
    'entitlement',
    row_data.id::text,
    case
      when tg_op='DELETE' then 'Resource entitlement revoked'
      else 'Resource entitlement granted'
    end,
    jsonb_build_object(
      'profile_id',row_data.profile_id,
      'product_id',row_data.product_id,
      'reason',row_data.reason,
      'source_ref',row_data.source_ref
    )
  );

  return case when tg_op='DELETE' then old else new end;
end;
$function$;

revoke execute on function app_private.audit_entitlement_change()
from public, anon, authenticated;

drop trigger if exists audit_entitlement_change_trigger
on public.entitlements;

create trigger audit_entitlement_change_trigger
after insert or delete on public.entitlements
for each row
execute function app_private.audit_entitlement_change();
