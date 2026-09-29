
create policy "gifts_finance_insert" on public.gifts for insert to authenticated
with check(app_private.has_staff_role(array['super_admin','admin','finance_admin']));
create policy "gifts_finance_update" on public.gifts for update to authenticated
using(app_private.has_staff_role(array['super_admin','admin','finance_admin']))
with check(app_private.has_staff_role(array['super_admin','admin','finance_admin']));

create policy "entitlements_staff_insert" on public.entitlements for insert to authenticated
with check(app_private.has_staff_role(array['super_admin','admin','finance_admin','content_admin']));
create policy "entitlements_staff_delete" on public.entitlements for delete to authenticated
using(app_private.has_staff_role(array['super_admin','admin','finance_admin','content_admin']));

create policy "products_staff_update" on public.products for update to authenticated
using(app_private.has_staff_role(array['super_admin','admin','content_admin']))
with check(app_private.has_staff_role(array['super_admin','admin','content_admin']));

grant insert,update on public.gifts to authenticated;
grant insert,delete on public.entitlements to authenticated;
grant update on public.products to authenticated;

create or replace function app_private.apply_active_gift_benefits()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
begin
  if new.profile_id is null then return new; end if;
  if new.status not in ('succeeded','paid','completed') then return new; end if;

  insert into public.entitlements(profile_id,product_id,reason,source_ref)
  select
    new.profile_id,
    br.product_id,
    'gift-benefit:' || br.slug,
    new.id::text
  from public.benefit_rules br
  where br.status='active'
    and br.rule_type='gift_minimum_product_entitlement'
    and new.amount_cents >= br.minimum_gift_cents
    and (br.starts_at is null or br.starts_at <= now())
    and (br.ends_at is null or br.ends_at >= now())
  on conflict(profile_id,product_id,reason) do nothing;

  return new;
end;
$$;
revoke all on function app_private.apply_active_gift_benefits() from public,anon,authenticated;

drop trigger if exists on_gift_apply_benefits on public.gifts;
create trigger on_gift_apply_benefits
after insert or update of status,amount_cents on public.gifts
for each row execute function app_private.apply_active_gift_benefits();
