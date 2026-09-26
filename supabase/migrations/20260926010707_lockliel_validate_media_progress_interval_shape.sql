alter table public.media_progress
  add constraint media_progress_covered_intervals_shape
    check (
      not jsonb_path_exists(
        covered_intervals,
        'strict $[*] ? (@.type() != "array" || @.size() != 2 || @[0].type() != "number" || @[1].type() != "number" || @[0] < 0 || @[1] <= @[0])'
      )
    );
