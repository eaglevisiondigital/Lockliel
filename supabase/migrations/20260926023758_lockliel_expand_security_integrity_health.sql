create or replace function app_private.lockliel_security_health_internal()
returns jsonb
language plpgsql
stable
security definer
set search_path to ''
as $function$
declare
  public_tables_without_rls integer:=0;
  public_views_without_security_invoker integer:=0;
  anonymous_public_table_grants integer:=0;
  unexpected_private_function_execute integer:=0;
  unvalidated_constraints integer:=0;
  course_enrollment_mismatches integer:=0;
  referral_identity_mismatches integer:=0;
  duplicate_unreferenced_lead_attribution integer:=0;
  protected_storage_mismatches integer:=0;
  issue_total integer:=0;
begin
  if not app_private.has_staff_role(array['super_admin','admin']) then
    raise exception 'Administrator access required';
  end if;

  select count(*)::integer
    into public_tables_without_rls
  from pg_catalog.pg_class c
  join pg_catalog.pg_namespace n on n.oid=c.relnamespace
  where n.nspname='public'
    and c.relkind in ('r','p')
    and not c.relrowsecurity;

  select count(*)::integer
    into public_views_without_security_invoker
  from pg_catalog.pg_class c
  join pg_catalog.pg_namespace n on n.oid=c.relnamespace
  where n.nspname='public'
    and c.relkind='v'
    and not (
      coalesce(c.reloptions,array[]::text[])
      @> array['security_invoker=true']::text[]
      or coalesce(c.reloptions,array[]::text[])
      @> array['security_invoker=on']::text[]
    );

  select count(*)::integer
    into anonymous_public_table_grants
  from information_schema.table_privileges p
  where p.table_schema='public'
    and p.grantee='anon';

  select count(*)::integer
    into unexpected_private_function_execute
  from pg_catalog.pg_proc p
  join pg_catalog.pg_namespace n on n.oid=p.pronamespace
  where n.nspname='app_private'
    and (
      pg_catalog.has_function_privilege('anon',p.oid,'EXECUTE')
      or pg_catalog.has_function_privilege('public',p.oid,'EXECUTE')
      or (
        pg_catalog.has_function_privilege('authenticated',p.oid,'EXECUTE')
        and p.proname not in (
          'can_read_course',
          'current_session_is_active',
          'entitlement_is_current',
          'group_host_candidate_ids',
          'has_staff_role',
          'is_conversation_member',
          'is_founders50_member',
          'is_group_leader',
          'lockliel_integrity_health_internal',
          'shares_group'
        )
      )
    );

  select count(*)::integer
    into unvalidated_constraints
  from pg_catalog.pg_constraint con
  join pg_catalog.pg_class cl on cl.oid=con.conrelid
  join pg_catalog.pg_namespace n on n.oid=cl.relnamespace
  where n.nspname in ('public','storage')
    and not con.convalidated;

  select count(*)::integer
    into course_enrollment_mismatches
  from public.course_enrollments ce
  where ce.status not in ('active','completed')
     or (ce.status='active' and ce.completed_at is not null)
     or (ce.status='completed' and ce.completed_at is null)
     or (ce.completed_at is not null and ce.completed_at<ce.enrolled_at);

  select count(*)::integer
    into referral_identity_mismatches
  from public.referral_events re
  where (re.event_type='visit' and re.member_id is not null)
     or (
       re.event_type='signup'
       and (re.member_id is null or re.referral_link_id is null)
     )
     or (
       re.event_type='course_started'
       and (
         re.member_id is null
         or re.referral_link_id is null
         or nullif(re.metadata->>'course_id','') is null
       )
     )
     or (
       re.event_type='lesson_completed'
       and (
         re.member_id is null
         or re.referral_link_id is null
         or nullif(re.metadata->>'lesson_id','') is null
       )
     );

  select count(*)::integer
    into duplicate_unreferenced_lead_attribution
  from (
    select ls.lead_id,ls.source_type,coalesce(ls.campaign,'')
    from public.lead_sources ls
    where ls.source_ref is null
    group by ls.lead_id,ls.source_type,coalesce(ls.campaign,'')
    having count(*)>1
  ) d;

  protected_storage_mismatches:=
    (
      select count(*)::integer
      from public.lesson_assets la
      where la.status='active'
        and la.storage_path is not null
        and (
          not exists(
            select 1
            from storage.objects o
            where o.bucket_id='lesson-assets'
              and o.name=la.storage_path
          )
          or (
            la.asset_type in ('pdf','worksheet')
            and not exists(
              select 1
              from storage.objects o
              where o.bucket_id='lesson-assets'
                and o.name=la.storage_path
                and lower(coalesce(o.metadata->>'mimetype',''))='application/pdf'
            )
          )
        )
    )
    +
    (
      select count(*)::integer
      from public.products p
      where p.status='active'
        and p.storage_path is not null
        and not exists(
          select 1
          from storage.objects o
          where o.bucket_id='member-resources'
            and o.name=p.storage_path
        )
    );

  issue_total:=
    public_tables_without_rls
    + public_views_without_security_invoker
    + anonymous_public_table_grants
    + unexpected_private_function_execute
    + unvalidated_constraints
    + course_enrollment_mismatches
    + referral_identity_mismatches
    + duplicate_unreferenced_lead_attribution
    + protected_storage_mismatches;

  return jsonb_build_object(
    'security_issue_count',issue_total,
    'public_tables_without_rls',public_tables_without_rls,
    'public_views_without_security_invoker',public_views_without_security_invoker,
    'anonymous_public_table_grants',anonymous_public_table_grants,
    'unexpected_private_function_execute',unexpected_private_function_execute,
    'unvalidated_constraints',unvalidated_constraints,
    'course_enrollment_mismatches',course_enrollment_mismatches,
    'referral_identity_mismatches',referral_identity_mismatches,
    'duplicate_unreferenced_lead_attribution',duplicate_unreferenced_lead_attribution,
    'protected_storage_mismatches',protected_storage_mismatches
  );
end;
$function$;

revoke all on function app_private.lockliel_security_health_internal()
from public,anon,authenticated;

create or replace function public.lockliel_integrity_health()
returns jsonb
language plpgsql
stable
set search_path to ''
as $function$
declare
  base jsonb;
  security_health jsonb;
  base_issues integer:=0;
  security_issues integer:=0;
begin
  base:=app_private.lockliel_integrity_health_internal();
  security_health:=app_private.lockliel_security_health_internal();

  base_issues:=coalesce((base->>'issue_count')::integer,0);
  security_issues:=coalesce((security_health->>'security_issue_count')::integer,0);

  return
    base
    || security_health
    || jsonb_build_object(
      'healthy',(base_issues+security_issues)=0,
      'issue_count',base_issues+security_issues
    );
end;
$function$;

revoke all on function public.lockliel_integrity_health()
from public,anon;

grant execute on function public.lockliel_integrity_health()
to authenticated;
