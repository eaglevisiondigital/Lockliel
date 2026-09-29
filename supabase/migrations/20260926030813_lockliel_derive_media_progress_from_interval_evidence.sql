create or replace function app_private.media_covered_seconds(intervals jsonb)
returns numeric
language sql
immutable
set search_path to ''
as $function$
  with ranges as (
    select numrange(
      (x->>0)::numeric,
      (x->>1)::numeric,
      '[)'
    ) as r
    from jsonb_array_elements(coalesce(intervals,'[]'::jsonb)) x
  ),
  merged as (
    select range_agg(r) as mr
    from ranges
  )
  select coalesce(sum(upper(r)-lower(r)),0)::numeric
  from merged
  cross join lateral unnest(mr) as r;
$function$;

revoke all on function app_private.media_covered_seconds(jsonb)
from public,anon,authenticated;

alter table public.lesson_assets
  add constraint lesson_assets_video_duration_positive
    check (
      asset_type<>'video'
      or duration_seconds is null
      or duration_seconds>0
    );

create or replace function app_private.normalize_media_progress_state()
returns trigger
language plpgsql
set search_path to ''
as $function$
declare
  asset_duration numeric;
  covered_seconds numeric:=0;
  derived_percent numeric:=0;
  max_interval_end numeric:=0;
begin
  select a.duration_seconds
    into asset_duration
  from public.lesson_assets a
  where a.id=new.asset_id;

  covered_seconds:=app_private.media_covered_seconds(new.covered_intervals);

  select coalesce(max((x->>1)::numeric),0)
    into max_interval_end
  from jsonb_array_elements(coalesce(new.covered_intervals,'[]'::jsonb)) x;

  if asset_duration is not null then
    if new.last_position_seconds>asset_duration+5
       or max_interval_end>asset_duration+5 then
      raise exception 'Media progress cannot exceed the verified asset duration.';
    end if;

    covered_seconds:=least(covered_seconds,asset_duration);
    derived_percent:=least(
      100::numeric,
      round((covered_seconds/asset_duration)*100,2)
    );
  end if;

  if tg_op='UPDATE' then
    new.first_started_at:=coalesce(old.first_started_at,new.first_started_at,now());
    new.played_seconds:=greatest(coalesce(old.played_seconds,0),covered_seconds);

    if asset_duration is not null then
      new.percent_watched:=greatest(
        coalesce(old.percent_watched,0),
        derived_percent
      );
    else
      new.percent_watched:=greatest(
        coalesce(old.percent_watched,0),
        coalesce(new.percent_watched,0)
      );
    end if;
  else
    new.first_started_at:=coalesce(new.first_started_at,now());
    new.played_seconds:=covered_seconds;

    if asset_duration is not null then
      new.percent_watched:=derived_percent;
    end if;
  end if;

  new.last_activity_at:=now();

  if new.percent_watched>=95 then
    new.completed_at:=coalesce(
      case when tg_op='UPDATE' then old.completed_at else null end,
      new.completed_at,
      now()
    );
  else
    new.completed_at:=null;
  end if;

  return new;
end;
$function$;

revoke execute on function app_private.normalize_media_progress_state()
from public,anon,authenticated;
