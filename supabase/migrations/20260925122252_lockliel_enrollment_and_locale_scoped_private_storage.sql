drop policy if exists lesson_assets_member_read
on public.lesson_assets;

create policy lesson_assets_member_read
on public.lesson_assets
for select
to authenticated
using (
  app_private.has_staff_role(
    array['super_admin','admin','discipleship_admin','content_admin']
  )
  or (
    status='active'
    and exists(
      select 1
      from public.lessons content_lesson
      join public.courses content_course
        on content_course.id=content_lesson.course_id
      join public.course_enrollments ce
        on ce.profile_id=(select auth.uid())
       and ce.status in ('active','completed')
      join public.courses enrolled_course
        on enrolled_course.id=ce.course_id
      where content_lesson.id=lesson_assets.lesson_id
        and content_course.status='published'
        and (
          content_course.id=enrolled_course.id
          or (
            content_course.translation_key is not null
            and content_course.translation_key=enrolled_course.translation_key
          )
        )
    )
  )
);

drop policy if exists lesson_asset_storage_read
on storage.objects;

create policy lesson_asset_storage_read
on storage.objects
for select
to authenticated
using (
  bucket_id='lesson-assets'
  and exists(
    select 1
    from public.lesson_assets la
    join public.lessons content_lesson
      on content_lesson.id=la.lesson_id
    join public.courses content_course
      on content_course.id=content_lesson.course_id
    join public.course_enrollments ce
      on ce.profile_id=(select auth.uid())
     and ce.status in ('active','completed')
    join public.courses enrolled_course
      on enrolled_course.id=ce.course_id
    where la.storage_path=storage.objects.name
      and la.status='active'
      and content_course.status='published'
      and (
        content_course.id=enrolled_course.id
        or (
          content_course.translation_key is not null
          and content_course.translation_key=enrolled_course.translation_key
        )
      )
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
