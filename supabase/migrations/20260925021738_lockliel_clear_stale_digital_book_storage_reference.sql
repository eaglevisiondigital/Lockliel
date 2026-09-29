
update public.products p
set storage_path=null
where p.slug='a-heart-for-the-lost-digital'
  and p.storage_path is not null
  and not exists(
    select 1
    from storage.objects o
    where o.bucket_id='member-resources'
      and o.name=p.storage_path
  );
