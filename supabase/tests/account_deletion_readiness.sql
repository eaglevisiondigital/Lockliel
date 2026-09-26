-- Run inside BEGIN/ROLLBACK. All accounts and requests below are synthetic fixtures.
do $test$
declare
  actor uuid:=gen_random_uuid();
  handler uuid:=gen_random_uuid();
  member uuid:=gen_random_uuid();
  actor_session uuid:=gen_random_uuid();
  handler_session uuid:=gen_random_uuid();
  member_session uuid:=gen_random_uuid();
  fixture_request uuid;
  state jsonb;
  rejected boolean;
begin
  assert not has_function_privilege('anon','public.lockliel_admin_deletion_readiness(uuid)','EXECUTE'),'Anonymous readiness access';
  assert not has_function_privilege('anon','public.lockliel_reclaim_account_deletion(uuid)','EXECUTE'),'Anonymous recovery access';
  insert into auth.users(id,email,email_confirmed_at,raw_user_meta_data)
  values(actor,'readiness-test-'||actor||'@example.invalid',now(),'{}'),
        (handler,'readiness-test-'||handler||'@example.invalid',now(),'{}'),
        (member,'readiness-test-'||member||'@example.invalid',now(),'{}');
  insert into public.staff_roles(profile_id,role) values(actor,'admin'),(handler,'admin');
  insert into auth.sessions(id,user_id,aal)
  values(actor_session,actor,'aal2'),(handler_session,handler,'aal2'),(member_session,member,'aal1');
  insert into public.privacy_requests(profile_id,request_type,status)
  values(member,'account_deletion','submitted') returning id into fixture_request;
  perform set_config('request.jwt.claims',jsonb_build_object('sub',handler,'role','authenticated','aal','aal2','session_id',handler_session)::text,true);
  update public.privacy_requests set status='in_review' where id=fixture_request;
  execute 'set local role authenticated';
  state:=public.lockliel_admin_deletion_readiness(fixture_request);
  execute 'reset role';
  assert (state->>'can_execute')::boolean,'Assigned admin cannot process ready request';
  assert not (state ? 'target_email') and not (state ? 'target_profile_id'),'Private deletion identity leaked';
  assert not (state->>'execution_started')::boolean,'Readiness started execution';
  insert into public.staff_roles(profile_id,role) values(member,'content_admin');
  state:=public.lockliel_admin_deletion_readiness(fixture_request);
  assert (state->>'blocker_count')::integer=1 and not (state->>'can_execute')::boolean,'Staff blocker was not surfaced';
  delete from public.staff_roles where profile_id=member;

  perform set_config('request.jwt.claims',jsonb_build_object('sub',member,'role','authenticated','aal','aal2','session_id',member_session)::text,true);
  rejected:=false;
  begin perform public.lockliel_admin_deletion_readiness(fixture_request);
  exception when others then rejected:=true; end;
  assert rejected,'Member could inspect private readiness';
  perform set_config('request.jwt.claims',jsonb_build_object('sub',actor,'role','authenticated','aal','aal1','session_id',actor_session)::text,true);
  rejected:=false;
  begin perform public.lockliel_admin_deletion_readiness(fixture_request);
  exception when others then rejected:=true; end;
  assert rejected,'AAL1 admin could inspect readiness';

  perform set_config('request.jwt.claims',jsonb_build_object('sub',actor,'role','authenticated','aal','aal2','session_id',actor_session)::text,true);
  state:=public.lockliel_admin_deletion_readiness(fixture_request);
  assert not (state->>'can_execute')::boolean and not (state->>'can_reclaim')::boolean,'Another eligible handler can be bypassed';
  rejected:=false;
  begin perform public.lockliel_reclaim_account_deletion(fixture_request);
  exception when others then rejected:=true; end;
  assert rejected,'Eligible handler was replaced';

  perform public.lockliel_prepare_account_deletion(fixture_request,handler,handler_session,false);
  delete from public.staff_roles where profile_id=handler;
  state:=public.lockliel_admin_deletion_readiness(fixture_request);
  assert (state->>'can_reclaim')::boolean and (state->>'execution_started')::boolean,'Interrupted request cannot be recovered';
  execute 'set local role authenticated';
  perform public.lockliel_reclaim_account_deletion(fixture_request);
  perform public.lockliel_reclaim_account_deletion(fixture_request);
  execute 'reset role';
  assert (select handled_by=actor from public.privacy_requests where id=fixture_request),'Recovery did not assign caller';
  assert (select count(*)=1 from public.audit_events where entity_id=fixture_request::text and event_type='account_deletion_reclaimed'),'Recovery audit duplicated';
  state:=public.lockliel_admin_deletion_readiness(fixture_request);
  assert (state->>'can_execute')::boolean and not (state->>'can_reclaim')::boolean,'Recovered request not executable';

  state:=app_private.lockliel_security_health_internal();
  assert (state->>'unexpected_private_function_execute')::integer=0,'Private function monitor reports unexpected grants';
  delete from auth.sessions where id=actor_session;
  rejected:=false;
  begin perform public.lockliel_reclaim_account_deletion(fixture_request);
  exception when others then rejected:=true; end;
  assert rejected,'Revoked session could recover request';
end;
$test$;
