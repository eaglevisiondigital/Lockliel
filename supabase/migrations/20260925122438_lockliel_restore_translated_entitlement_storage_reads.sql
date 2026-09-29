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
