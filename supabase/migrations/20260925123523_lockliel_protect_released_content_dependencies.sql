create or replace function app_private.ensure_grip_course_ready(target_course uuid)
returns void
language plpgsql
security definer
set search_path to ''
as $function$
begin
  if target_course is null then
    return;
  end if;

  if exists(
    select 1
    from public.courses c
    where c.id=target_course
      and c.translation_key='getting-a-grip-on-the-basics'
      and c.status='published'
  ) and not app_private.grip_course_release_ready(target_course) then

    update public.courses
    set status='draft'
    where id=target_course
      and status='published';

    insert into public.audit_events(
      actor_profile_id,
      event_type,
      entity_type,
      entity_id,
      summary,
      metadata
    )
    values(
      (select auth.uid()),
      'course_auto_unpublished',
      'course',
      target_course::text,
      'Getting a Grip automatically returned to draft because required release content became incomplete',
      '{}'::jsonb
    );
  end if;
end;
$function$;

revoke execute on function app_private.ensure_grip_course_ready(uuid)
from public, anon, authenticated;

create or replace function app_private.recheck_grip_course_release()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
declare
  target_course uuid;
begin
  select l.course_id
    into target_course
  from public.lessons l
  where l.id=coalesce(new.lesson_id,old.lesson_id);

  perform app_private.ensure_grip_course_ready(target_course);
  return coalesce(new,old);
end;
$function$;

revoke execute on function app_private.recheck_grip_course_release()
from public, anon, authenticated;

create or replace function app_private.recheck_grip_course_after_lesson_change()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
declare
  old_course uuid;
  new_course uuid;
begin
  if tg_op<>'INSERT' then
    old_course:=old.course_id;
  end if;

  if tg_op<>'DELETE' then
    new_course:=new.course_id;
  end if;

  perform app_private.ensure_grip_course_ready(old_course);

  if new_course is distinct from old_course then
    perform app_private.ensure_grip_course_ready(new_course);
  end if;

  return coalesce(new,old);
end;
$function$;

revoke execute on function app_private.recheck_grip_course_after_lesson_change()
from public, anon, authenticated;

drop trigger if exists recheck_grip_course_after_lesson_change_trigger
on public.lessons;

create trigger recheck_grip_course_after_lesson_change_trigger
after insert or delete or update of
  course_id,
  position,
  worksheet_schema,
  title
on public.lessons
for each row
execute function app_private.recheck_grip_course_after_lesson_change();

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
  object_bucket:=case when tg_op='DELETE' then old.bucket_id else new.bucket_id end;
  object_name:=case when tg_op='DELETE' then old.name else old.name end;

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
before delete or update of bucket_id,name
on storage.objects
for each row
execute function app_private.protect_released_storage_object();
