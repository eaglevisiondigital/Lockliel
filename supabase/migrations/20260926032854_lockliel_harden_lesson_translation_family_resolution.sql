create or replace function app_private.validate_lesson_translation_family()
returns trigger
language plpgsql
set search_path to ''
as $function$
declare
  _course_translation_key text;
begin
  select c.translation_key
    into _course_translation_key
  from public.courses c
  where c.id=new.course_id;

  if _course_translation_key is null then
    raise exception 'Lesson course translation family is required.';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      'lockliel:lesson-translation:'||new.translation_key,
      0
    )
  );

  if exists(
    select 1
    from public.lessons l
    join public.courses c on c.id=l.course_id
    where l.translation_key=new.translation_key
      and l.id<>new.id
      and c.translation_key<>_course_translation_key
  ) then
    raise exception 'Translated lesson variants must stay within the same course translation family.';
  end if;

  if exists(
    select 1
    from public.lessons l
    join public.courses c on c.id=l.course_id
    where l.translation_key=new.translation_key
      and l.id<>new.id
      and c.translation_key=_course_translation_key
      and l.position<>new.position
  ) then
    raise exception 'Translated lesson variants must keep the same lesson position.';
  end if;

  return new;
end;
$function$;

revoke execute on function app_private.validate_lesson_translation_family()
from public,anon,authenticated;

drop trigger if exists validate_lesson_translation_family_trigger
on public.lessons;

create trigger validate_lesson_translation_family_trigger
before insert or update of translation_key,course_id,position
on public.lessons
for each row
execute function app_private.validate_lesson_translation_family();


create or replace function app_private.resolve_content_lesson_for_profile(
  target_profile uuid,
  canonical_lesson uuid
)
returns uuid
language plpgsql
stable
security definer
set search_path to ''
as $function$
declare
  source_lesson public.lessons%rowtype;
  source_course_translation_key text;
  preferred_locale text;
  preferred_base text;
  resolved uuid;
begin
  select l.*
    into source_lesson
  from public.lessons l
  where l.id=canonical_lesson;

  if source_lesson.id is null then
    return null;
  end if;

  select c.translation_key
    into source_course_translation_key
  from public.courses c
  where c.id=source_lesson.course_id;

  if source_lesson.translation_key is null
     or source_course_translation_key is null then
    return source_lesson.id;
  end if;

  select lower(replace(coalesce(p.locale,'en-US'),'_','-'))
    into preferred_locale
  from public.profiles p
  where p.id=target_profile;

  preferred_locale:=coalesce(preferred_locale,'en-us');
  preferred_base:=split_part(preferred_locale,'-',1);

  select l.id
    into resolved
  from public.lessons l
  join public.courses c on c.id=l.course_id
  where l.translation_key=source_lesson.translation_key
    and c.translation_key=source_course_translation_key
    and l.position=source_lesson.position
    and c.status='published'
  order by
    case
      when lower(c.language_code)=preferred_locale then 1
      when lower(c.language_code)=preferred_base then 2
      when lower(c.language_code)='en' then 3
      when l.id=source_lesson.id then 4
      else 5
    end,
    l.id
  limit 1;

  return coalesce(resolved,source_lesson.id);
end;
$function$;

revoke all on function app_private.resolve_content_lesson_for_profile(uuid,uuid)
from public,anon,authenticated;
