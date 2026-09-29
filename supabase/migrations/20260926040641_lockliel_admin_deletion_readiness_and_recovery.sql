-- Staff receive only operational status, never the preserved deletion email/identity.
create or replace function public.lockliel_admin_deletion_readiness(request_id_input uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path to ''
as $function$
declare
  request_row public.privacy_requests%rowtype;
  target app_private.account_deletion_targets%rowtype;
  target_id uuid;
  health jsonb;
  storage_count integer:=0;
  sessions integer:=0;
  auth_exists boolean:=false;
  profile_exists boolean:=false;
  suspended boolean:=false;
  handler_eligible boolean:=false;
  blockers integer:=0;
  actor uuid:=(select auth.uid());
begin
  if not app_private.has_staff_role(array['super_admin','admin']) then
    raise exception 'Active administrator MFA session required.';
  end if;
  select * into request_row from public.privacy_requests where id=request_id_input;
  if request_row.id is null or request_row.request_type<>'account_deletion' then
    raise exception 'Account deletion request not found.';
  end if;
  if request_row.status not in ('submitted','in_review') then
    return jsonb_build_object('request_id',request_id_input,'request_status',request_row.status,
      'terminal',true,'can_execute',false,'can_reclaim',false);
  end if;

  select * into target from app_private.account_deletion_targets where request_id=request_id_input;
  target_id:=coalesce(target.target_profile_id,request_row.profile_id);
  if target_id is null then raise exception 'Account deletion target is unavailable.'; end if;
  health:=app_private.account_deletion_responsibility_counts(target_id);
  select count(*)::integer into storage_count from storage.objects
  where owner=target_id or owner_id=target_id::text;
  select count(*)::integer into sessions from auth.sessions where user_id=target_id;
  select exists(select 1 from auth.users where id=target_id),
    exists(select 1 from public.profiles where id=target_id),
    exists(select 1 from auth.users where id=target_id and banned_until>now()),
    exists(select 1 from public.staff_roles where profile_id=request_row.handled_by and role in ('super_admin','admin'))
  into auth_exists,profile_exists,suspended,handler_eligible;
  blockers:=coalesce((health->>'blocker_count')::integer,0)+storage_count;
  return jsonb_build_object(
    'request_id',request_id_input,'request_status',request_row.status,'terminal',false,
    'is_handler',request_row.handled_by=actor,'handler_eligible',handler_eligible,
    'can_reclaim',request_row.status='in_review' and not handler_eligible
      and request_row.handled_by is distinct from actor and target_id<>actor,
    'can_execute',request_row.status='in_review' and request_row.handled_by=actor
      and target_id<>actor and blockers=0,
    'self_deletion',target_id=actor,
    'execution_started',target.execution_started_at is not null,
    'sessions_revoked',target.sessions_revoked_at is not null and sessions=0,
    'personal_data_scrubbed',target.scrubbed_at is not null,
    'auth_removed',not auth_exists,'profile_removed',not profile_exists,
    'sign_in_suspended',suspended,'active_session_count',sessions,
    'owned_storage_objects',storage_count,'blocker_count',blockers,
    'responsibilities',health
  );
end;
$function$;
revoke all on function public.lockliel_admin_deletion_readiness(uuid) from public,anon;
grant execute on function public.lockliel_admin_deletion_readiness(uuid) to authenticated;

create or replace function public.lockliel_reclaim_account_deletion(request_id_input uuid)
returns jsonb
language plpgsql
security definer
set search_path to ''
as $function$
declare
  request_row public.privacy_requests%rowtype;
  actor uuid:=(select auth.uid());
  target_id uuid;
begin
  if not app_private.has_staff_role(array['super_admin','admin']) then
    raise exception 'Active administrator MFA session required.';
  end if;
  select * into request_row from public.privacy_requests where id=request_id_input for update;
  if request_row.id is null or request_row.request_type<>'account_deletion'
    or request_row.status<>'in_review' then
    raise exception 'In-review account deletion request required.';
  end if;
  select coalesce(t.target_profile_id,request_row.profile_id) into target_id
  from (select 1) seed left join app_private.account_deletion_targets t on t.request_id=request_id_input;
  if target_id is null or target_id=actor then
    raise exception 'Another administrator must process this account deletion.';
  end if;
  if request_row.handled_by=actor then
    return jsonb_build_object('ok',true,'request_id',request_id_input);
  end if;
  if exists(select 1 from public.staff_roles where profile_id=request_row.handled_by
    and role in ('super_admin','admin')) then
    raise exception 'The current handler still has administrator access.';
  end if;
  update public.privacy_requests set status='in_review' where id=request_id_input;
  insert into public.audit_events(actor_profile_id,event_type,entity_type,entity_id,summary,metadata)
  values(actor,'account_deletion_reclaimed','privacy_request',request_id_input::text,
    'Account deletion reassigned after previous administrator access ended',
    jsonb_build_object('previous_handler',request_row.handled_by));
  return jsonb_build_object('ok',true,'request_id',request_id_input);
end;
$function$;
revoke all on function public.lockliel_reclaim_account_deletion(uuid) from public,anon;
grant execute on function public.lockliel_reclaim_account_deletion(uuid) to authenticated;
