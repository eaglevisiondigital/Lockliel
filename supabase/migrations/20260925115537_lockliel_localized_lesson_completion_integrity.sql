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
  preferred_locale text;
  preferred_base text;
  resolved uuid;
begin
  select *
    into source_lesson
  from public.lessons
  where id=canonical_lesson;

  if source_lesson.id is null then
    return null;
  end if;

  if source_lesson.translation_key is null then
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
    and c.status='published'
  order by
    case
      when lower(c.language_code)=preferred_locale then 1
      when lower(c.language_code)=preferred_base then 2
      when lower(c.language_code)='en' then 3
      when l.id=source_lesson.id then 4
      else 5
    end,
    l.position,
    l.id
  limit 1;

  return coalesce(resolved,source_lesson.id);
end;
$function$;

revoke execute on function app_private.resolve_content_lesson_for_profile(uuid,uuid)
from public, anon, authenticated;

create or replace function app_private.validate_lesson_completion()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
declare
  content_lesson_id uuid;
  required_videos int;
  completed_videos int;
  question_count int;
  answered_count int;
begin
  if new.status<>'completed' then
    return new;
  end if;

  content_lesson_id:=
    app_private.resolve_content_lesson_for_profile(
      new.profile_id,
      new.lesson_id
    );

  if content_lesson_id is null then
    raise exception 'Lesson content is not available for completion.';
  end if;

  select count(*)::int
    into required_videos
  from public.lesson_assets a
  where a.lesson_id=content_lesson_id
    and a.asset_type='video'
    and a.status='active';

  if required_videos>0 then
    select count(*)::int
      into completed_videos
    from public.lesson_assets a
    join public.media_progress mp
      on mp.asset_id=a.id
     and mp.profile_id=new.profile_id
    where a.lesson_id=content_lesson_id
      and a.asset_type='video'
      and a.status='active'
      and mp.percent_watched>=95;

    if completed_videos<required_videos then
      raise exception
        'Lesson cannot be completed until all required videos are watched to at least 95 percent.';
    end if;
  end if;

  select
    jsonb_array_length(
      coalesce(l.worksheet_schema->'questions','[]'::jsonb)
    )::int
    into question_count
  from public.lessons l
  where l.id=content_lesson_id;

  if coalesce(question_count,0)>0 then
    if new.worksheet_status<>'completed' then
      raise exception
        'Lesson cannot be completed until the worksheet is completed.';
    end if;

    select count(*)::int
      into answered_count
    from jsonb_array_elements(
      coalesce(
        (
          select l.worksheet_schema->'questions'
          from public.lessons l
          where l.id=content_lesson_id
        ),
        '[]'::jsonb
      )
    ) q
    where nullif(
      trim(
        coalesce(
          new.worksheet_answers->>(q->>'number'),
          ''
        )
      ),
      ''
    ) is not null;

    if answered_count<question_count then
      raise exception
        'Lesson cannot be completed until every worksheet or notes field has an answer.';
    end if;
  end if;

  if new.completed_at is null then
    new.completed_at:=now();
  end if;

  return new;
end;
$function$;

revoke execute on function app_private.validate_lesson_completion()
from public, anon, authenticated;
