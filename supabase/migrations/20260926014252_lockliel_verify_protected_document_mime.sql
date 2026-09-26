create or replace function app_private.normalize_lesson_asset()
returns trigger
language plpgsql
set search_path to ''
as $function$
begin
  if tg_op='UPDATE' and old.lesson_id is distinct from new.lesson_id then
    raise exception 'Lesson asset identity cannot be moved to another lesson.';
  end if;

  new.external_url:=nullif(trim(coalesce(new.external_url,'')),'');
  new.provider:=nullif(lower(trim(coalesce(new.provider,''))),'');
  new.provider_ref:=nullif(trim(coalesce(new.provider_ref,'')),'');
  new.storage_path:=nullif(trim(coalesce(new.storage_path,'')),'');

  if new.external_url is not null
     and new.external_url !~* '^https://[^[:space:]]+$' then
    raise exception 'Lesson external URLs must use HTTPS.';
  end if;

  if new.status='active' then
    if new.asset_type='video' then
      if coalesce(new.provider,'')<>'youtube'
         or new.provider_ref is null then
        raise exception 'Active video assets require a YouTube provider and video reference.';
      end if;
    elsif new.asset_type in ('pdf','worksheet') then
      if new.storage_path is null
         and new.external_url is null then
        raise exception 'Active document assets require a private storage path or external URL.';
      end if;

      if new.storage_path is not null
         and not exists(
           select 1
           from storage.objects o
           where o.bucket_id='lesson-assets'
             and o.name=new.storage_path
             and lower(coalesce(o.metadata->>'mimetype',''))='application/pdf'
         ) then
        raise exception 'Active stored document assets require an uploaded PDF object.';
      end if;
    elsif new.asset_type='external_link' then
      if new.external_url is null then
        raise exception 'Active external-link assets require an external URL.';
      end if;
    elsif new.asset_type='audio' then
      if new.provider_ref is null
         and new.storage_path is null
         and new.external_url is null then
        raise exception 'Active audio assets require a provider reference, storage path, or external URL.';
      end if;
    end if;
  end if;

  new.updated_at:=now();
  return new;
end;
$function$;

revoke execute on function app_private.normalize_lesson_asset()
from public,anon,authenticated;

create or replace function app_private.grip_course_release_ready(target_course uuid)
returns boolean
language sql
stable
security definer
set search_path to ''
as $function$
  select
    (
      select count(*)
      from public.lessons l
      where l.course_id=target_course
    )=13
    and
    (
      select count(*)
      from public.lessons l
      where l.course_id=target_course
        and jsonb_array_length(
          coalesce(l.worksheet_schema->'questions','[]'::jsonb)
        )>0
    )=13
    and
    (
      select count(distinct a.lesson_id)
      from public.lesson_assets a
      join public.lessons l on l.id=a.lesson_id
      where l.course_id=target_course
        and a.asset_type='video'
        and a.status='active'
        and lower(coalesce(a.provider,''))='youtube'
        and nullif(trim(coalesce(a.provider_ref,'')),'') is not null
    )>=10
    and
    (
      select count(distinct a.lesson_id)
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
            and lower(coalesce(o.metadata->>'mimetype',''))='application/pdf'
        )
    )=13;
$function$;

revoke execute on function app_private.grip_course_release_ready(uuid)
from public,anon,authenticated;

create or replace function public.lockliel_grip_readiness()
returns jsonb
language plpgsql
stable
set search_path to ''
as $function$
declare
  course_row record;
  lesson_count int:=0;
  structured_count int:=0;
  playable_video_lessons int:=0;
  private_workbook_lessons int:=0;
  ready boolean:=false;
begin
  if not app_private.has_staff_role(
    array['super_admin','admin']
  ) then
    raise exception 'Administrator access required';
  end if;

  select c.id,c.slug,c.title,c.status
    into course_row
  from public.courses c
  where c.translation_key='getting-a-grip-on-the-basics'
  order by
    case when c.language_code='en' then 0 else 1 end,
    c.created_at
  limit 1;

  if course_row.id is null then
    return jsonb_build_object(
      'exists',false,
      'release_ready',false,
      'published',false,
      'lesson_count',0,
      'structured_lessons',0,
      'playable_video_lessons',0,
      'private_workbook_lessons',0
    );
  end if;

  select
    count(*)::int,
    count(*) filter(
      where jsonb_array_length(
        coalesce(l.worksheet_schema->'questions','[]'::jsonb)
      )>0
    )::int
  into lesson_count,structured_count
  from public.lessons l
  where l.course_id=course_row.id;

  select count(distinct a.lesson_id)::int
    into playable_video_lessons
  from public.lesson_assets a
  join public.lessons l on l.id=a.lesson_id
  where l.course_id=course_row.id
    and a.asset_type='video'
    and a.status='active'
    and lower(coalesce(a.provider,''))='youtube'
    and nullif(trim(coalesce(a.provider_ref,'')),'') is not null;

  select count(distinct a.lesson_id)::int
    into private_workbook_lessons
  from public.lesson_assets a
  join public.lessons l on l.id=a.lesson_id
  where l.course_id=course_row.id
    and a.asset_type='pdf'
    and a.status='active'
    and a.storage_path is not null
    and exists(
      select 1
      from storage.objects o
      where o.bucket_id='lesson-assets'
        and o.name=a.storage_path
        and lower(coalesce(o.metadata->>'mimetype',''))='application/pdf'
    );

  ready:=
    lesson_count=13
    and structured_count=13
    and playable_video_lessons>=10
    and private_workbook_lessons=13;

  return jsonb_build_object(
    'exists',true,
    'course_id',course_row.id,
    'slug',course_row.slug,
    'title',course_row.title,
    'status',course_row.status,
    'published',course_row.status='published',
    'release_ready',ready,
    'lesson_count',lesson_count,
    'structured_lessons',structured_count,
    'playable_video_lessons',playable_video_lessons,
    'private_workbook_lessons',private_workbook_lessons
  );
end;
$function$;
