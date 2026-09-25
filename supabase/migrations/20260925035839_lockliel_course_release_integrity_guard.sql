
create or replace function app_private.grip_course_release_ready(target_course uuid)
returns boolean
language sql
stable
security definer
set search_path=''
as $$
  select
    (select count(*) from public.lessons l where l.course_id=target_course)=13
    and
    (
      select count(*)
      from public.lessons l
      where l.course_id=target_course
        and jsonb_array_length(coalesce(l.worksheet_schema->'questions','[]'::jsonb))>0
    )=13
    and
    (
      select count(*)
      from public.lesson_assets a
      join public.lessons l on l.id=a.lesson_id
      where l.course_id=target_course
        and a.asset_type='video'
        and a.status='active'
    )>=13
    and
    (
      select count(*)
      from public.lesson_assets a
      join public.lessons l on l.id=a.lesson_id
      where l.course_id=target_course
        and a.asset_type='pdf'
        and a.status='active'
        and a.storage_path is not null
        and exists(
          select 1
          from storage.objects o
          where o.bucket_id='lesson-assets'
            and o.name=a.storage_path
        )
    )=13;
$$;

revoke all on function app_private.grip_course_release_ready(uuid)
from public,anon,authenticated;

create or replace function app_private.validate_course_publish()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
begin
  if new.status='published'
     and old.status is distinct from 'published'
     and new.translation_key='getting-a-grip-on-the-basics'
     and not app_private.grip_course_release_ready(new.id) then
    raise exception 'Getting a Grip cannot be published until all required lessons, videos, structured notes/worksheets, and private workbook files are ready';
  end if;

  return new;
end;
$$;

revoke all on function app_private.validate_course_publish()
from public,anon,authenticated;

drop trigger if exists validate_course_publish_trigger on public.courses;
create trigger validate_course_publish_trigger
before update of status on public.courses
for each row execute function app_private.validate_course_publish();

create or replace function app_private.recheck_grip_course_release()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
declare
  course_id uuid;
begin
  select l.course_id
    into course_id
  from public.lessons l
  where l.id=coalesce(new.lesson_id,old.lesson_id);

  if course_id is null then
    return coalesce(new,old);
  end if;

  if exists(
    select 1
    from public.courses c
    where c.id=course_id
      and c.translation_key='getting-a-grip-on-the-basics'
      and c.status='published'
  ) and not app_private.grip_course_release_ready(course_id) then

    update public.courses
    set status='draft'
    where id=course_id;

    insert into public.audit_events(
      actor_profile_id,event_type,entity_type,entity_id,summary,metadata
    )
    values(
      (select auth.uid()),
      'course_auto_unpublished',
      'course',
      course_id::text,
      'Getting a Grip automatically returned to draft because required release assets are incomplete',
      '{}'::jsonb
    );
  end if;

  return coalesce(new,old);
end;
$$;

revoke all on function app_private.recheck_grip_course_release()
from public,anon,authenticated;

drop trigger if exists recheck_grip_course_release_trigger on public.lesson_assets;
create trigger recheck_grip_course_release_trigger
after insert or update of status,storage_path,asset_type or delete
on public.lesson_assets
for each row execute function app_private.recheck_grip_course_release();
