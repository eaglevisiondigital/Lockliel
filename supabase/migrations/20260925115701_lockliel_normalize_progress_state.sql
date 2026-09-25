alter table public.lesson_progress
  drop constraint if exists lesson_progress_status_check,
  add constraint lesson_progress_status_check
    check (status in ('not_started','in_progress','completed'));

alter table public.lesson_progress
  drop constraint if exists lesson_progress_worksheet_status_check,
  add constraint lesson_progress_worksheet_status_check
    check (worksheet_status in ('not_started','in_progress','completed','not_required'));

alter table public.lesson_progress
  drop constraint if exists lesson_progress_last_position_nonnegative,
  add constraint lesson_progress_last_position_nonnegative
    check (last_position_seconds>=0);

alter table public.lesson_progress
  drop constraint if exists lesson_progress_watched_seconds_nonnegative,
  add constraint lesson_progress_watched_seconds_nonnegative
    check (watched_seconds>=0);

alter table public.media_progress
  drop constraint if exists media_progress_last_position_nonnegative,
  add constraint media_progress_last_position_nonnegative
    check (last_position_seconds>=0);

alter table public.media_progress
  drop constraint if exists media_progress_played_seconds_nonnegative,
  add constraint media_progress_played_seconds_nonnegative
    check (played_seconds>=0);

alter table public.media_progress
  drop constraint if exists media_progress_covered_intervals_array,
  add constraint media_progress_covered_intervals_array
    check (jsonb_typeof(covered_intervals)='array');

create or replace function app_private.normalize_lesson_progress_state()
returns trigger
language plpgsql
set search_path to ''
as $function$
begin
  if tg_op='UPDATE' and old.status='completed' and new.status<>'completed' then
    raise exception 'Completed lessons cannot be moved back to an incomplete status.';
  end if;

  if tg_op='UPDATE' then
    new.started_at:=coalesce(
      old.started_at,
      new.started_at,
      case when new.status<>'not_started' then now() else null end
    );
  else
    new.started_at:=coalesce(
      new.started_at,
      case when new.status<>'not_started' then now() else null end
    );
  end if;

  new.last_activity_at:=now();

  if new.status='completed' then
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

revoke execute on function app_private.normalize_lesson_progress_state()
from public, anon, authenticated;

drop trigger if exists preserve_lesson_start_time_trigger
on public.lesson_progress;

drop trigger if exists normalize_lesson_progress_state_trigger
on public.lesson_progress;

create trigger normalize_lesson_progress_state_trigger
before insert or update on public.lesson_progress
for each row
execute function app_private.normalize_lesson_progress_state();

create or replace function app_private.normalize_media_progress_state()
returns trigger
language plpgsql
set search_path to ''
as $function$
begin
  if tg_op='UPDATE' then
    new.first_started_at:=coalesce(
      old.first_started_at,
      new.first_started_at,
      now()
    );
    new.played_seconds:=greatest(
      coalesce(old.played_seconds,0),
      coalesce(new.played_seconds,0)
    );
    new.percent_watched:=greatest(
      coalesce(old.percent_watched,0),
      coalesce(new.percent_watched,0)
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
from public, anon, authenticated;

drop trigger if exists normalize_media_progress_state_trigger
on public.media_progress;

create trigger normalize_media_progress_state_trigger
before insert or update on public.media_progress
for each row
execute function app_private.normalize_media_progress_state();
