alter table public.media_progress
  add constraint media_progress_covered_intervals_count
    check (
      jsonb_typeof(covered_intervals)='array'
      and jsonb_array_length(covered_intervals)<=250
    ),
  add constraint media_progress_covered_intervals_size
    check (pg_column_size(covered_intervals)<=32768);
