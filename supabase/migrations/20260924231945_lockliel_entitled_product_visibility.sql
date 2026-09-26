
drop policy if exists "products_member_read" on public.products;
create policy "products_member_read" on public.products for select to authenticated
using(
 status='active'
 or exists(
   select 1 from public.entitlements e
   where e.product_id=products.id
     and e.profile_id=(select auth.uid())
 )
 or app_private.has_staff_role(array['super_admin','admin','content_admin','finance_admin'])
);
