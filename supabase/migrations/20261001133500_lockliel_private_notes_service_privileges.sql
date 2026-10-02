-- Learner notes use authenticated owner/session reads and the postgres-owned RPC.
-- No service_role table privilege is required. Cover both hosted Dxtm defaults
-- and broader historical defaults without changing data, RLS, policies or RPCs.
revoke select, insert, update, delete, truncate, references, trigger, maintain
on table public.lesson_private_notes
from service_role;
