alter table public.conversation_members
  add constraint conversation_members_role_check
    check (member_role in ('inviter','invitee','leader','member')),
  add constraint conversation_members_left_after_join
    check (left_at is null or left_at>=joined_at);
