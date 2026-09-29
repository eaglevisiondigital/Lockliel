revoke all privileges on table public.messages from anon;
revoke insert, update, delete on table public.messages from authenticated;

grant select on table public.messages to authenticated;
grant insert (
  conversation_id,
  sender_id,
  body
) on table public.messages to authenticated;

drop policy if exists messages_member_insert on public.messages;

create policy messages_member_insert
on public.messages
for insert
to authenticated
with check (
  sender_id = (select auth.uid())
  and app_private.is_conversation_member(conversation_id)
  and exists(
    select 1
    from public.feature_flags f
    where f.key='internal_messaging'
      and f.enabled=true
  )
);
