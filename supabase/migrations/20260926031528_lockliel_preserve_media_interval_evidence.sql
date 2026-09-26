create or replace function app_private.media_canonical_intervals(
  existing_intervals jsonb,
  incoming_intervals jsonb
)
returns jsonb
language sql
immutable
set search_path to ''
as $function$
  with combined as (
    select x
    from jsonb_array_elements(
      coalesce(existing_intervals,'[]'::jsonb)
      || coalesce(incoming_intervals,'[]'::jsonb)
    ) x
  ),
  ranges as (
    select numrange(
      (x->>0)::numeric,
      (x->>1)::numeric,
      '[)'
    ) as r
    from combined
  ),
  merged as (
    select range_agg(r) as mr
    from ranges
  ),
  expanded as (
    select u.r
    from merged
    cross join lateral unnest(merged.mr) as u(r)
  ),
  ranked as (
    select
      r,
      row_number() over(order by lower(r) desc,upper(r) desc) as rn
    from expanded
  )
  select coalesce(
    jsonb_agg(
      jsonb_build_array(lower(r),upper(r))
      order by lower(r),upper(r)
    ) filter(where rn<=250),
    '[]'::jsonb
  )
  from ranked;
$function$;

revoke all on function app_private.media_canonical_intervals(jsonb,jsonb)
from public,anon,authenticated;

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
  if tg_op='UPDATE' then
    new.covered_intervals:=app_private.media_canonical_intervals(
      old.covered_intervals,
      new.covered_intervals
    );
  else
    new.covered_intervals:=app_private.media_canonical_intervals(
      '[]'::jsonb,
      new.covered_intervals
    );
  end if;

  select a.duration_seconds
    into asset_duration
  from public.lesson_assets a
  where a.id=new.asset_id;

  covered_seconds:=app_private.media_covered_seconds(new.covered_intervals);

  select coalesce(max((x->>1)::numeric),0)
    into max_interval_end
  from jsonb_array_elements(new.covered_intervals) x;

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

  new.played_seconds:=covered_seconds;

  if asset_duration is not null then
    new.percent_watched:=derived_percent;
  elsif tg_op='UPDATE' then
    new.percent_watched:=greatest(
      coalesce(old.percent_watched,0),
      coalesce(new.percent_watched,0)
    );
  end if;

  if tg_op='UPDATE' then
    new.first_started_at:=coalesce(
      old.first_started_at,
      new.first_started_at,
      now()
    );
  else
    new.first_started_at:=coalesce(new.first_started_at,now());
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

create or replace function app_private.rederive_media_progress_after_duration()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
begin
  if old.duration_seconds is not distinct from new.duration_seconds then
    return new;
  end if;

  update public.media_progress mp
  set covered_intervals=mp.covered_intervals,
      last_position_seconds=least(
        mp.last_position_seconds,
        new.duration_seconds
      )
  where mp.asset_id=new.id;

  return new;
end;
$function$;

revoke execute on function app_private.rederive_media_progress_after_duration()
from public,anon,authenticated;

drop trigger if exists rederive_media_progress_after_duration_trigger
on public.lesson_assets;

create trigger rederive_media_progress_after_duration_trigger
after update of duration_seconds
on public.lesson_assets
for each row
when (new.duration_seconds is not null)
execute function app_private.rederive_media_progress_after_duration();
