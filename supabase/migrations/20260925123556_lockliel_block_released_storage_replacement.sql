create or replace function app_private.protect_released_storage_object()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
declare
  object_bucket text;
  object_name text;
begin
  object_bucket:=old.bucket_id;
  object_name:=old.name;

  if object_bucket='lesson-assets'
     and exists(
       select 1
       from public.lesson_assets a
       join public.lessons l on l.id=a.lesson_id
       join public.courses c on c.id=l.course_id
       where a.storage_path=object_name
         and a.status='active'
         and c.status='published'
     ) then
    raise exception
      'Unpublish or deactivate the lesson asset before deleting or replacing a released course file.';
  end if;

  if object_bucket='member-resources'
     and exists(
       select 1
       from public.products p
       where p.storage_path=object_name
         and p.status='active'
     ) then
    raise exception
      'Archive the active product before deleting or replacing its protected file.';
  end if;

  return case when tg_op='DELETE' then old else new end;
end;
$function$;

revoke execute on function app_private.protect_released_storage_object()
from public, anon, authenticated;

drop trigger if exists protect_released_storage_object_trigger
on storage.objects;

create trigger protect_released_storage_object_trigger
before delete or update
on storage.objects
for each row
execute function app_private.protect_released_storage_object();
