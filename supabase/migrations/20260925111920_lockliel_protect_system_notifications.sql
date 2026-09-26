revoke insert, update, delete, truncate
on table public.notifications
from anon, authenticated;

grant update (read_at)
on table public.notifications
to authenticated;
