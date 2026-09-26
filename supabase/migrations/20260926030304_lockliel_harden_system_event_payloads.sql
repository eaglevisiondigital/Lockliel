alter table public.audit_events
  add constraint audit_events_event_type_format
    check (
      char_length(event_type) between 1 and 120
      and event_type ~ '^[a-z][a-z0-9_]*$'
    ),
  add constraint audit_events_entity_type_format
    check (
      char_length(entity_type) between 1 and 120
      and entity_type ~ '^[a-z][a-z0-9_]*$'
    ),
  add constraint audit_events_entity_id_length
    check (entity_id is null or char_length(entity_id)<=500),
  add constraint audit_events_summary_length
    check (summary is null or char_length(summary)<=2000),
  add constraint audit_events_metadata_object
    check (
      jsonb_typeof(metadata)='object'
      and pg_column_size(metadata)<=65536
    );

alter table public.communication_preference_events
  add constraint communication_preference_events_key_format
    check (
      char_length(preference_key) between 1 and 120
      and preference_key ~ '^[a-z][a-z0-9_]*$'
    ),
  add constraint communication_preference_events_source_format
    check (
      char_length(source) between 1 and 120
      and source ~ '^[a-z][a-z0-9_-]*$'
    );
