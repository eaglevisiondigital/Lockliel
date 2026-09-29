-- Keep component helpers private while allowing MFA administrators to run all checks.
alter function app_private.lockliel_integrity_health_internal() rename to lockliel_integrity_health_base;
revoke all on function app_private.lockliel_integrity_health_base() from public, anon, authenticated;

create function app_private.lockliel_integrity_health_internal()
returns jsonb language plpgsql stable security definer set search_path=''
as $function$
declare
  base jsonb;
  security_health jsonb;
  media_health jsonb;
  issues integer;
begin
  if not app_private.has_staff_role(array['super_admin','admin']) then
    raise exception 'Administrator access required' using errcode='42501';
  end if;
  base:=app_private.lockliel_integrity_health_base();
  security_health:=app_private.lockliel_security_health_internal();
  media_health:=app_private.lockliel_media_evidence_health_internal();
  issues:=(base->>'issue_count')::integer
    +(security_health->>'security_issue_count')::integer
    +(media_health->>'media_evidence_issue_count')::integer;
  return base||security_health||media_health||jsonb_build_object('healthy',issues=0,'issue_count',issues);
end;
$function$;
revoke all on function app_private.lockliel_integrity_health_internal() from public, anon;
grant execute on function app_private.lockliel_integrity_health_internal() to authenticated;

create or replace function public.lockliel_integrity_health()
returns jsonb language sql stable security invoker set search_path=''
as $function$
  select app_private.lockliel_integrity_health_internal();
$function$;
revoke all on function public.lockliel_integrity_health() from public, anon;
grant execute on function public.lockliel_integrity_health() to authenticated;
