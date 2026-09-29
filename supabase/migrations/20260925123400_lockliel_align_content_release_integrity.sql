alter table public.courses
  drop constraint if exists courses_status_check,
  add constraint courses_status_check
    check (status in ('draft','published','archived'));

alter table public.products
  drop constraint if exists products_status_check,
  add constraint products_status_check
    check (status in ('draft','active','archived'));

alter table public.products
  drop constraint if exists products_price_nonnegative,
  add constraint products_price_nonnegative
    check (price_cents is null or price_cents>=0);

alter table public.lessons
  drop constraint if exists lessons_position_positive,
  add constraint lessons_position_positive
    check (position>=1);

alter table public.lesson_assets
  drop constraint if exists lesson_assets_sort_order_nonnegative,
  add constraint lesson_assets_sort_order_nonnegative
    check (sort_order>=0);

alter table public.lesson_assets
  drop constraint if exists lesson_assets_duration_nonnegative,
  add constraint lesson_assets_duration_nonnegative
    check (duration_seconds is null or duration_seconds>=0);

revoke insert, update on table public.lesson_assets from authenticated;

grant insert (
  lesson_id,
  asset_type,
  title,
  provider,
  provider_ref,
  storage_path,
  external_url,
  duration_seconds,
  sort_order,
  status
) on table public.lesson_assets to authenticated;

grant update (
  asset_type,
  title,
  provider,
  provider_ref,
  storage_path,
  external_url,
  duration_seconds,
  sort_order,
  status
) on table public.lesson_assets to authenticated;

create or replace function app_private.normalize_lesson_asset()
returns trigger
language plpgsql
set search_path to ''
as $function$
begin
  if tg_op='UPDATE' and old.lesson_id is distinct from new.lesson_id then
    raise exception 'Lesson asset identity cannot be moved to another lesson.';
  end if;

  if new.status='active' then
    if new.asset_type='video' then
      if lower(coalesce(new.provider,''))<>'youtube'
         or nullif(trim(coalesce(new.provider_ref,'')),'') is null then
        raise exception 'Active video assets require a YouTube provider and video reference.';
      end if;
    elsif new.asset_type in ('pdf','worksheet') then
      if nullif(trim(coalesce(new.storage_path,'')),'') is null
         and nullif(trim(coalesce(new.external_url,'')),'') is null then
        raise exception 'Active document assets require a private storage path or external URL.';
      end if;
    elsif new.asset_type='external_link' then
      if nullif(trim(coalesce(new.external_url,'')),'') is null then
        raise exception 'Active external-link assets require an external URL.';
      end if;
    elsif new.asset_type='audio' then
      if nullif(trim(coalesce(new.provider_ref,'')),'') is null
         and nullif(trim(coalesce(new.storage_path,'')),'') is null
         and nullif(trim(coalesce(new.external_url,'')),'') is null then
        raise exception 'Active audio assets require a provider reference, storage path, or external URL.';
      end if;
    end if;
  end if;

  new.updated_at:=now();
  return new;
end;
$function$;

revoke execute on function app_private.normalize_lesson_asset()
from public, anon, authenticated;

drop trigger if exists normalize_lesson_asset_trigger
on public.lesson_assets;

create trigger normalize_lesson_asset_trigger
before insert or update on public.lesson_assets
for each row
execute function app_private.normalize_lesson_asset();

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
        )
    )=13;
$function$;

revoke execute on function app_private.grip_course_release_ready(uuid)
from public, anon, authenticated;

create or replace function app_private.validate_course_release()
returns trigger
language plpgsql
set search_path to ''
as $function$
begin
  if new.status<>'published' or old.status='published' then
    return new;
  end if;

  if new.translation_key='getting-a-grip-on-the-basics'
     and not app_private.grip_course_release_ready(new.id) then
    raise exception
      'Getting a Grip cannot be published until all 13 lessons are structured, at least 10 distinct lessons have playable teaching videos, and all 13 private workbooks exist in Lockliel storage';
  end if;

  return new;
end;
$function$;

revoke execute on function app_private.validate_course_release()
from public, anon, authenticated;
