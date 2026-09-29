alter table public.member_journey
  add constraint member_journey_next_step_type_format
    check (
      next_step_type is null
      or (
        char_length(next_step_type) between 1 and 80
        and next_step_type ~ '^[a-z][a-z0-9_]*$'
      )
    ),
  add constraint member_journey_next_step_title_length
    check (
      next_step_title is null
      or char_length(trim(next_step_title)) between 1 and 300
    ),
  add constraint member_journey_next_step_path_internal
    check (
      next_step_path is null
      or (
        char_length(next_step_path) between 1 and 1000
        and left(next_step_path,1)='/'
        and left(next_step_path,2)<>'//'
      )
    ),
  add constraint member_journey_counts_nonnegative
    check (reach_one_count>=0 and active_connections_count>=0);

alter table public.notifications
  add constraint notifications_type_format
    check (
      char_length(notification_type) between 1 and 80
      and notification_type ~ '^[a-z][a-z0-9_]*$'
    ),
  add constraint notifications_title_length
    check (char_length(trim(title)) between 1 and 300),
  add constraint notifications_body_length
    check (body is null or char_length(body)<=3000),
  add constraint notifications_href_internal
    check (
      href is null
      or (
        char_length(href) between 1 and 1000
        and left(href,1)='/'
        and left(href,2)<>'//'
      )
    ),
  add constraint notifications_read_after_create
    check (read_at is null or read_at>=created_at);

alter table public.founder_orientation_steps
  add constraint founder_orientation_steps_slug_format
    check (
      char_length(slug) between 1 and 120
      and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
    ),
  add constraint founder_orientation_steps_position_positive
    check (position>=1),
  add constraint founder_orientation_steps_title_length
    check (char_length(trim(title)) between 1 and 300),
  add constraint founder_orientation_steps_description_length
    check (description is null or char_length(description)<=3000),
  add constraint founder_orientation_steps_href_internal
    check (
      href is null
      or (
        char_length(href) between 1 and 1000
        and left(href,1)='/'
        and left(href,2)<>'//'
      )
    );

alter table public.feature_flags
  add constraint feature_flags_key_format
    check (
      char_length(key) between 1 and 120
      and key ~ '^[a-z][a-z0-9_]*$'
    ),
  add constraint feature_flags_description_length
    check (description is null or char_length(description)<=1000);
