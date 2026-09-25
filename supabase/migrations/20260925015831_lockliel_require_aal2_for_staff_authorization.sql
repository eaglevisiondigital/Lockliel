
create or replace function app_private.has_staff_role(required_roles text[])
returns boolean
language sql
stable
security definer
set search_path=''
as $$
  select
    (select auth.uid()) is not null
    and coalesce((select auth.jwt()->>'aal'),'aal1')='aal2'
    and exists(
      select 1
      from public.staff_roles sr
      where sr.profile_id=(select auth.uid())
        and sr.role=any(required_roles)
    );
$$;

revoke all on function app_private.has_staff_role(text[]) from public,anon;
grant execute on function app_private.has_staff_role(text[]) to authenticated;
