revoke all privileges on table public.profile_connection_cards
from anon;

revoke insert, update, delete
on table public.profile_connection_cards
from authenticated;

grant select
on table public.profile_connection_cards
to authenticated;

revoke all privileges on table public.profile_finance_cards
from anon;

revoke insert, update, delete
on table public.profile_finance_cards
from authenticated;

grant select
on table public.profile_finance_cards
to authenticated;
