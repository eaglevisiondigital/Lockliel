revoke all privileges on table public.conversations
from anon;

revoke insert, update, delete
on table public.conversations
from authenticated;

grant select
on table public.conversations
to authenticated;

revoke all privileges on table public.conversation_members
from anon;

revoke insert, update, delete
on table public.conversation_members
from authenticated;

grant select
on table public.conversation_members
to authenticated;
