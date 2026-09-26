alter table public.lesson_assets
  add column duration_verified_at timestamptz;

alter table public.lesson_assets
  add constraint lesson_assets_duration_verification_consistency
    check (
      (duration_seconds is null and duration_verified_at is null)
      or
      (duration_seconds is not null and duration_seconds>0 and duration_verified_at is not null)
    );

create or replace function app_private.normalize_lesson_asset_duration_verification()
returns trigger
language plpgsql
set search_path to ''
as $function$
begin
  if new.duration_seconds is null then
    new.duration_verified_at:=null;
    return new;
  end if;

  if new.duration_seconds<=0 then
    raise exception 'Verified media duration must be greater than zero.';
  end if;

  if tg_op='INSERT'
     or old.duration_seconds is distinct from new.duration_seconds then
    new.duration_verified_at:=now();
  else
    new.duration_verified_at:=old.duration_verified_at;
  end if;

  return new;
end;
$function$;

revoke execute on function app_private.normalize_lesson_asset_duration_verification()
from public,anon,authenticated;

drop trigger if exists normalize_lesson_asset_duration_verification_trigger
on public.lesson_assets;

create trigger normalize_lesson_asset_duration_verification_trigger
before insert or update of duration_seconds
on public.lesson_assets
for each row
execute function app_private.normalize_lesson_asset_duration_verification();

create or replace function app_private.audit_lesson_asset_duration_verification()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
begin
  if new.duration_seconds is null then
    return new;
  end if;

  if tg_op='UPDATE'
     and old.duration_seconds is not distinct from new.duration_seconds then
    return new;
  end if;

  insert into public.audit_events(
    actor_profile_id,event_type,entity_type,entity_id,summary,metadata
  )
  values(
    (select auth.uid()),
    'lesson_asset_duration_verified',
    'lesson_asset',
    new.id::text,
    'Lesson media duration verified',
    jsonb_build_object(
      'duration_seconds',new.duration_seconds,
      'provider',new.provider,
      'provider_ref',new.provider_ref
    )
  );

  return new;
end;
$function$;

revoke execute on function app_private.audit_lesson_asset_duration_verification()
from public,anon,authenticated;

drop trigger if exists audit_lesson_asset_duration_verification_trigger
on public.lesson_assets;

create trigger audit_lesson_asset_duration_verification_trigger
after insert or update of duration_seconds
on public.lesson_assets
for each row
execute function app_private.audit_lesson_asset_duration_verification();

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
  video_assets_total int:=0;
  video_assets_with_verified_duration int:=0;
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
      'private_workbook_lessons',0,
      'video_assets_total',0,
      'video_assets_with_verified_duration',0
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

  select
    count(*)::int,
    count(*) filter(
      where a.duration_seconds is not null
        and a.duration_verified_at is not null
    )::int
  into video_assets_total,video_assets_with_verified_duration
  from public.lesson_assets a
  join public.lessons l on l.id=a.lesson_id
  where l.course_id=course_row.id
    and a.asset_type='video'
    and a.status='active'
    and lower(coalesce(a.provider,''))='youtube'
    and nullif(trim(coalesce(a.provider_ref,'')),'') is not null;

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
    'private_workbook_lessons',private_workbook_lessons,
    'video_assets_total',video_assets_total,
    'video_assets_with_verified_duration',video_assets_with_verified_duration
  );
end;
$function$;

revoke all on function public.lockliel_grip_readiness()
from public,anon;

grant execute on function public.lockliel_grip_readiness()
to authenticated;
