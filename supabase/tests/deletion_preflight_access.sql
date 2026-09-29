-- Run inside BEGIN/ROLLBACK. All identities are synthetic.
do $test$
declare
  actor uuid:=gen_random_uuid();
  target uuid:=gen_random_uuid();
  session uuid:=gen_random_uuid();
  state jsonb;
  rejected boolean;
begin
  assert not has_function_privilege('anon','public.lockliel_account_deletion_preflight(uuid)','EXECUTE');
  assert not has_function_privilege('authenticated','app_private.account_deletion_responsibility_counts(uuid)','EXECUTE');
  insert into auth.users(id,email,email_confirmed_at,raw_user_meta_data)
  values(actor,'preflight-test-'||actor||'@example.invalid',now(),'{}'),
        (target,'preflight-test-'||target||'@example.invalid',now(),'{}');
  insert into public.staff_roles(profile_id,role) values(actor,'admin');
  insert into auth.sessions(id,user_id,aal) values(session,actor,'aal2');
  perform set_config('request.jwt.claims',jsonb_build_object('sub',actor,'role','authenticated','aal','aal2','session_id',session)::text,true);
  execute 'set local role authenticated';
  state:=public.lockliel_account_deletion_preflight(target);
  assert (state->>'profile_exists')::boolean and (state->>'ready_for_profile_deletion')::boolean,'Unblocked profile not ready';
  state:=public.lockliel_account_deletion_preflight(actor);
  assert (state->>'staff_roles')::integer=1 and (state->>'blocker_count')::integer=1 and not (state->>'ready_for_profile_deletion')::boolean,'Staff blocker missing';
  state:=public.lockliel_account_deletion_preflight(null);
  assert not (state->>'profile_exists')::boolean,'Null target reported present';
  execute 'reset role';
  state:=app_private.lockliel_security_health_internal();
  assert (state->>'unexpected_private_function_execute')::integer=0,'Private grant exposure';
  perform set_config('request.jwt.claims',jsonb_build_object('sub',actor,'role','authenticated','aal','aal1','session_id',session)::text,true);
  execute 'set local role authenticated';
  rejected:=false;
  begin perform public.lockliel_account_deletion_preflight(target); exception when others then rejected:=true; end;
  assert rejected,'AAL1 administrator accepted';
  execute 'reset role';
  perform set_config('request.jwt.claims',jsonb_build_object('sub',target,'role','authenticated','aal','aal2','session_id',session)::text,true);
  execute 'set local role authenticated';
  rejected:=false;
  begin perform public.lockliel_account_deletion_preflight(actor); exception when others then rejected:=true; end;
  assert rejected,'Member accepted';
  execute 'reset role';
  perform set_config('request.jwt.claims',jsonb_build_object('sub',actor,'role','authenticated','aal','aal2','session_id',session)::text,true);
  delete from auth.sessions where id=session;
  execute 'set local role authenticated';
  rejected:=false;
  begin perform public.lockliel_account_deletion_preflight(target); exception when others then rejected:=true; end;
  assert rejected,'Revoked administrator accepted';
  execute 'reset role';
end;
$test$;
