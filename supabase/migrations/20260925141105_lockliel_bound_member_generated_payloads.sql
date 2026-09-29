alter table public.connection_requests
  drop constraint if exists connection_requests_message_length,
  add constraint connection_requests_message_length
    check (
      message is null
      or char_length(message)<=5000
    );

alter table public.reach_contacts
  drop constraint if exists reach_contacts_relationship_context_length,
  add constraint reach_contacts_relationship_context_length
    check (
      relationship_context is null
      or char_length(relationship_context)<=500
    );

alter table public.reach_contacts
  drop constraint if exists reach_contacts_private_notes_length,
  add constraint reach_contacts_private_notes_length
    check (
      private_notes is null
      or char_length(private_notes)<=3000
    );

alter table public.lesson_progress
  drop constraint if exists lesson_progress_worksheet_answers_object,
  add constraint lesson_progress_worksheet_answers_object
    check (jsonb_typeof(worksheet_answers)='object');

alter table public.lesson_progress
  drop constraint if exists lesson_progress_worksheet_answers_size,
  add constraint lesson_progress_worksheet_answers_size
    check (pg_column_size(worksheet_answers)<=65536);

alter table public.referral_events
  drop constraint if exists referral_events_metadata_object,
  add constraint referral_events_metadata_object
    check (jsonb_typeof(metadata)='object');

alter table public.referral_events
  drop constraint if exists referral_events_metadata_size,
  add constraint referral_events_metadata_size
    check (pg_column_size(metadata)<=16384);
