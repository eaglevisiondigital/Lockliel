
create or replace function app_private.sync_deleted_storage_reference()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
begin
  if old.bucket_id='member-resources' then
    update public.products
    set storage_path=null,
        status=case when product_type in ('digital_book','resource') then 'draft' else status end
    where storage_path=old.name;
  elsif old.bucket_id='lesson-assets' then
    update public.lesson_assets
    set status='draft',
        updated_at=now()
    where storage_path=old.name;
  end if;

  return old;
end;
$$;

revoke all on function app_private.sync_deleted_storage_reference()
from public,anon,authenticated;

drop trigger if exists sync_deleted_storage_reference_trigger on storage.objects;
create trigger sync_deleted_storage_reference_trigger
after delete on storage.objects
for each row execute function app_private.sync_deleted_storage_reference();
