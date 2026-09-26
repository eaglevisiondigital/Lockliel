
drop policy if exists "member_resources_staff_insert" on storage.objects;
create policy "member_resources_staff_insert" on storage.objects for insert to authenticated
with check(
  bucket_id='member-resources'
  and app_private.has_staff_role(array['super_admin','admin','content_admin'])
);

drop policy if exists "member_resources_staff_update" on storage.objects;
create policy "member_resources_staff_update" on storage.objects for update to authenticated
using(
  bucket_id='member-resources'
  and app_private.has_staff_role(array['super_admin','admin','content_admin'])
)
with check(
  bucket_id='member-resources'
  and app_private.has_staff_role(array['super_admin','admin','content_admin'])
);

drop policy if exists "member_resources_staff_delete" on storage.objects;
create policy "member_resources_staff_delete" on storage.objects for delete to authenticated
using(
  bucket_id='member-resources'
  and app_private.has_staff_role(array['super_admin','admin','content_admin'])
);

drop policy if exists "products_staff_update" on public.products;
create policy "products_staff_update" on public.products for update to authenticated
using(app_private.has_staff_role(array['super_admin','admin','content_admin']))
with check(app_private.has_staff_role(array['super_admin','admin','content_admin']));
