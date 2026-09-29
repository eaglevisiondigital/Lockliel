alter table public.member_staff_notes
  drop constraint if exists member_staff_notes_body_check,
  add constraint member_staff_notes_body_check
    check (
      char_length(trim(body))>=1
      and char_length(body)<=5000
    );
