
insert into storage.buckets(id,name,public,file_size_limit)
values('lesson-assets','lesson-assets',false,104857600)
on conflict(id) do update set public=false;

drop policy if exists "lesson_asset_storage_read" on storage.objects;
create policy "lesson_asset_storage_read" on storage.objects for select to authenticated
using(
 bucket_id='lesson-assets'
 and exists(
  select 1
  from public.lesson_assets la
  join public.lessons l on l.id=la.lesson_id
  join public.courses c on c.id=l.course_id
  where la.storage_path=storage.objects.name
    and la.status='active'
    and (
      c.status='published'
      or exists(
        select 1 from public.course_enrollments ce
        where ce.course_id=c.id and ce.profile_id=(select auth.uid()) and ce.status in ('active','completed')
      )
    )
 )
);

drop policy if exists "lesson_asset_storage_staff_insert" on storage.objects;
create policy "lesson_asset_storage_staff_insert" on storage.objects for insert to authenticated
with check(
 bucket_id='lesson-assets'
 and app_private.has_staff_role(array['super_admin','admin','discipleship_admin','content_admin'])
);

drop policy if exists "lesson_asset_storage_staff_update" on storage.objects;
create policy "lesson_asset_storage_staff_update" on storage.objects for update to authenticated
using(bucket_id='lesson-assets' and app_private.has_staff_role(array['super_admin','admin','discipleship_admin','content_admin']))
with check(bucket_id='lesson-assets' and app_private.has_staff_role(array['super_admin','admin','discipleship_admin','content_admin']));

drop policy if exists "lesson_asset_storage_staff_delete" on storage.objects;
create policy "lesson_asset_storage_staff_delete" on storage.objects for delete to authenticated
using(bucket_id='lesson-assets' and app_private.has_staff_role(array['super_admin','admin','discipleship_admin','content_admin']));
