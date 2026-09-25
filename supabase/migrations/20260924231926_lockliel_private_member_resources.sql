
alter table public.products add column if not exists storage_path text;
alter table public.products add column if not exists cover_path text;
alter table public.products add column if not exists description text;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('member-resources','member-resources',false,52428800,array['application/pdf'])
on conflict(id) do update set public=false;

drop policy if exists "entitled_member_resource_read" on storage.objects;
create policy "entitled_member_resource_read"
on storage.objects for select to authenticated
using(
 bucket_id='member-resources'
 and exists(
   select 1
   from public.entitlements e
   join public.products p on p.id=e.product_id
   where e.profile_id=(select auth.uid())
     and p.storage_path=storage.objects.name
 )
);

update public.products
set storage_path='books/a-heart-for-the-lost.pdf',
    description='A practical, faith-building resource designed to help believers rediscover the Father''s heart for people and confidently reach one.'
where slug='a-heart-for-the-lost-digital';
