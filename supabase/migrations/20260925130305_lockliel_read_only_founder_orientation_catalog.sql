revoke all privileges on table public.founder_orientation_steps
from anon;

revoke insert, update, delete
on table public.founder_orientation_steps
from authenticated;

grant select
on table public.founder_orientation_steps
to authenticated;
