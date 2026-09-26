-- Execute with BEGIN/ROLLBACK; fixtures never persist.
do $test$
declare
  actor uuid:=gen_random_uuid();
  member uuid:=gen_random_uuid();
  session uuid:=gen_random_uuid();
  state jsonb;
  rejected boolean;
begin
  assert not has_function_privilege('anon','public.lockliel_integrity_health()','EXECUTE');
  assert not has_function_privilege('authenticated','app_private.lockliel_integrity_health_base()','EXECUTE');
  assert not has_function_privilege('authenticated','app_private.lockliel_security_health_internal()','EXECUTE');
  assert not has_function_privilege('authenticated','app_private.lockliel_media_evidence_health_internal()','EXECUTE');
  insert into auth.users(id,email,email_confirmed_at,raw_user_meta_data)
  values(actor,'integrity-test-'||actor||'@example.invalid',now(),'{}'),
        (member,'integrity-test-'||member||'@example.invalid',now(),'{}');
  insert into public.staff_roles(profile_id,role) values(actor,'admin');
  insert into auth.sessions(id,user_id,aal) values(session,actor,'aal2');
  perform set_config('request.jwt.claims',jsonb_build_object('sub',actor,'role','authenticated','aal','aal2','session_id',session)::text,true);
  execute 'set local role authenticated';
  state:=public.lockliel_integrity_health();
  execute 'reset role';
  assert state ? 'security_issue_count' and state ? 'media_evidence_issue_count' and state ? 'financial_cross_link_mismatches','Component checks missing';
  assert (state->>'unexpected_private_function_execute')::integer=0,'Unexpected private grants';
  assert (state->>'issue_count')::integer=(app_private.lockliel_integrity_health_base()->>'issue_count')::integer+(state->>'security_issue_count')::integer+(state->>'media_evidence_issue_count')::integer,'Aggregate count incorrect';
  assert (state->>'healthy')::boolean=((state->>'issue_count')::integer=0),'Health disagrees with count';
  perform set_config('request.jwt.claims',jsonb_build_object('sub',actor,'role','authenticated','aal','aal1','session_id',session)::text,true);
  execute 'set local role authenticated';
  rejected:=false;
  begin perform public.lockliel_integrity_health(); exception when insufficient_privilege then rejected:=true; end;
  assert rejected,'AAL1 admin accepted';
  execute 'reset role';
  perform set_config('request.jwt.claims',jsonb_build_object('sub',member,'role','authenticated','aal','aal2','session_id',session)::text,true);
  execute 'set local role authenticated';
  rejected:=false;
  begin perform public.lockliel_integrity_health(); exception when insufficient_privilege then rejected:=true; end;
  assert rejected,'Member accepted';
  execute 'reset role';
  perform set_config('request.jwt.claims',jsonb_build_object('sub',actor,'role','authenticated','aal','aal2','session_id',session)::text,true);
  delete from auth.sessions where id=session;
  execute 'set local role authenticated';
  rejected:=false;
  begin perform public.lockliel_integrity_health(); exception when insufficient_privilege then rejected:=true; end;
  assert rejected,'Revoked staff session accepted';
  execute 'reset role';
end;
$test$;
