alter table public.messages
  drop constraint if exists messages_body_check,
  add constraint messages_body_check
    check (
      char_length(trim(body))>=1
      and char_length(body)<=5000
    );
