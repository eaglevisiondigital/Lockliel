revoke all privileges on all tables in schema public from anon;
revoke all privileges on all sequences in schema public from anon;

revoke truncate, references, trigger, maintain
on all tables in schema public
from authenticated;

alter default privileges for role postgres in schema public
  revoke all privileges on tables from anon, authenticated;

alter default privileges for role postgres in schema public
  revoke all privileges on sequences from anon, authenticated;

alter default privileges for role postgres in schema public
  revoke execute on functions from public, anon, authenticated;
