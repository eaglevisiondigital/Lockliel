alter table public.gifts
  drop constraint if exists gifts_status_check,
  add constraint gifts_status_check
    check (
      status in (
        'pending',
        'processing',
        'succeeded',
        'paid',
        'completed',
        'failed',
        'cancelled',
        'refunded',
        'partially_refunded',
        'chargeback',
        'reversed',
        'voided'
      )
    );

create or replace function app_private.entitlement_is_current(
  entitlement_profile uuid,
  entitlement_product uuid,
  entitlement_reason text
)
returns boolean
language sql
stable
security definer
set search_path to ''
as $function$
  select case
    when entitlement_reason not like 'gift-benefit:%' then true
    else exists(
      select 1
      from public.benefit_rules br
      where br.slug=replace(entitlement_reason,'gift-benefit:','')
        and br.product_id=entitlement_product
        and br.rule_type='gift_minimum_product_entitlement'
        and exists(
          select 1
          from public.gifts g
          where g.profile_id=entitlement_profile
            and g.status in ('succeeded','paid','completed')
            and g.amount_cents>=br.minimum_gift_cents
            and (
              br.starts_at is null
              or coalesce(g.received_at,g.created_at)>=br.starts_at
            )
            and (
              br.ends_at is null
              or coalesce(g.received_at,g.created_at)<=br.ends_at
            )
        )
    )
  end;
$function$;

revoke execute on function app_private.entitlement_is_current(uuid,uuid,text)
from public, anon;

grant execute on function app_private.entitlement_is_current(uuid,uuid,text)
to authenticated;

drop policy if exists entitlements_combined_read
on public.entitlements;

create policy entitlements_combined_read
on public.entitlements
for select
to authenticated
using (
  (
    profile_id=(select auth.uid())
    and app_private.entitlement_is_current(
      profile_id,
      product_id,
      reason
    )
  )
  or app_private.has_staff_role(
    array['super_admin','admin','finance_admin','content_admin']
  )
);

drop policy if exists entitled_member_resource_read
on storage.objects;

create policy entitled_member_resource_read
on storage.objects
for select
to authenticated
using (
  bucket_id='member-resources'
  and exists(
    select 1
    from public.entitlements e
    join public.products source_product
      on source_product.id=e.product_id
    join public.products content_product
      on content_product.storage_path=storage.objects.name
    where e.profile_id=(select auth.uid())
      and app_private.entitlement_is_current(
        e.profile_id,
        e.product_id,
        e.reason
      )
      and content_product.status='active'
      and (
        content_product.id=source_product.id
        or (
          source_product.translation_key is not null
          and content_product.translation_key=source_product.translation_key
        )
      )
      and (
        content_product.product_type<>'digital_book'
        or exists(
          select 1
          from public.feature_flags f
          where f.key='digital_book_delivery'
            and f.enabled=true
        )
      )
  )
);
