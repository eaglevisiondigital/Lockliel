revoke insert, update on table public.lesson_progress from authenticated;

grant insert (
  profile_id,
  lesson_id,
  status,
  last_position_seconds,
  watched_seconds,
  worksheet_status,
  worksheet_answers
) on table public.lesson_progress to authenticated;

grant update (
  status,
  last_position_seconds,
  watched_seconds,
  worksheet_status,
  worksheet_answers
) on table public.lesson_progress to authenticated;

revoke insert, update on table public.media_progress from authenticated;

grant insert (
  profile_id,
  asset_id,
  last_position_seconds,
  played_seconds,
  percent_watched,
  covered_intervals
) on table public.media_progress to authenticated;

grant update (
  last_position_seconds,
  played_seconds,
  percent_watched,
  covered_intervals
) on table public.media_progress to authenticated;
