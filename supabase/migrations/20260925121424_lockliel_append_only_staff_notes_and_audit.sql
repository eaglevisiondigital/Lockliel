revoke all privileges on table public.member_staff_notes from anon;
revoke insert, update, delete on table public.member_staff_notes from authenticated;

grant select on table public.member_staff_notes to authenticated;
grant insert (
  profile_id,
  author_id,
  visibility,
  note_type,
  body
) on table public.member_staff_notes to authenticated;

drop policy if exists member_staff_notes_author_update
on public.member_staff_notes;

revoke all privileges on table public.audit_events from anon;
revoke insert, update, delete on table public.audit_events from authenticated;
grant select on table public.audit_events to authenticated;
