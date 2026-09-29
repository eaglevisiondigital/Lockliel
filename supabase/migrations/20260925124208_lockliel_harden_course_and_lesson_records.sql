revoke insert, update on table public.courses from authenticated;

grant update (
  title,
  description,
  status,
  language_code
) on table public.courses to authenticated;

revoke insert, update on table public.lessons from authenticated;

grant insert (
  course_id,
  position,
  slug,
  title,
  video_provider,
  video_ref,
  worksheet_schema,
  translation_key
) on table public.lessons to authenticated;

grant update (
  position,
  title,
  video_provider,
  video_ref,
  worksheet_schema
) on table public.lessons to authenticated;

create or replace function app_private.protect_course_identity()
returns trigger
language plpgsql
set search_path to ''
as $function$
begin
  if old.id is distinct from new.id
     or old.slug is distinct from new.slug
     or old.created_at is distinct from new.created_at
     or old.translation_key is distinct from new.translation_key then
    raise exception 'Course identity fields cannot be changed after creation.';
  end if;

  return new;
end;
$function$;

revoke execute on function app_private.protect_course_identity()
from public, anon, authenticated;

drop trigger if exists protect_course_identity_trigger
on public.courses;

create trigger protect_course_identity_trigger
before update on public.courses
for each row
execute function app_private.protect_course_identity();

create or replace function app_private.protect_lesson_identity()
returns trigger
language plpgsql
set search_path to ''
as $function$
begin
  if old.id is distinct from new.id
     or old.course_id is distinct from new.course_id
     or old.slug is distinct from new.slug
     or old.created_at is distinct from new.created_at
     or old.translation_key is distinct from new.translation_key then
    raise exception 'Lesson identity fields cannot be changed after creation.';
  end if;

  return new;
end;
$function$;

revoke execute on function app_private.protect_lesson_identity()
from public, anon, authenticated;

drop trigger if exists protect_lesson_identity_trigger
on public.lessons;

create trigger protect_lesson_identity_trigger
before update on public.lessons
for each row
execute function app_private.protect_lesson_identity();

create or replace function app_private.audit_course_status_change()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
begin
  if old.status is distinct from new.status then
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
      'course_status_changed',
      'course',
      new.id::text,
      'Course release status changed',
      jsonb_build_object(
        'slug',new.slug,
        'status_from',old.status,
        'status_to',new.status
      )
    );
  end if;

  return new;
end;
$function$;

revoke execute on function app_private.audit_course_status_change()
from public, anon, authenticated;

drop trigger if exists audit_course_status_change_trigger
on public.courses;

create trigger audit_course_status_change_trigger
after update of status on public.courses
for each row
execute function app_private.audit_course_status_change();
