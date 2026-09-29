
create or replace function app_private.current_session_is_active()
returns boolean
language sql
stable
security definer
set search_path to ''
as $function$
  select
    (select auth.uid()) is not null
    and nullif((select auth.jwt()->>'session_id'),'') is not null
    and exists(
      select 1
      from auth.sessions s
      where s.user_id=(select auth.uid())
        and s.id::text=(select auth.jwt()->>'session_id')
        and (s.not_after is null or s.not_after>now())
    );
$function$;

revoke execute on function app_private.current_session_is_active()
from public, anon, authenticated;
grant execute on function app_private.current_session_is_active()
to authenticated, service_role;

create or replace function public.lockliel_current_session_active()
returns boolean
language sql
stable
security invoker
set search_path to ''
as $function$
  select app_private.current_session_is_active();
$function$;

revoke execute on function public.lockliel_current_session_active()
from public, anon;
grant execute on function public.lockliel_current_session_active()
to authenticated, service_role;

create or replace function app_private.has_staff_role(required_roles text[])
returns boolean
language sql
stable
security definer
set search_path to ''
as $function$
  select
    app_private.current_session_is_active()
    and coalesce((select auth.jwt()->>'aal'),'aal1')='aal2'
    and exists(
      select 1
      from public.staff_roles sr
      where sr.profile_id=(select auth.uid())
        and sr.role=any(required_roles)
    );
$function$;

revoke execute on function app_private.has_staff_role(text[])
from public, anon;
grant execute on function app_private.has_staff_role(text[])
to authenticated, service_role;
