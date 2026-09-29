-- Run inside BEGIN/ROLLBACK after the migration. Fixtures never persist.
do $test$
declare
  actor uuid:=gen_random_uuid();
  target uuid:=gen_random_uuid();
  staff_session uuid:=gen_random_uuid();
  member_session uuid:=gen_random_uuid();
  fixture_request_id uuid;
  application_id_fixture uuid;
  state jsonb;
  first_receipt jsonb;
  second_receipt jsonb;
  rejected boolean;
begin
  insert into auth.users(id,email,email_confirmed_at,raw_user_meta_data)
  values(actor,'deletion-test-'||actor||'@example.invalid',now(),'{}'),
        (target,'deletion-test-'||target||'@example.invalid',now(),'{}');
  insert into public.staff_roles(profile_id,role) values(actor,'admin');
  insert into auth.sessions(id,user_id,aal) values(staff_session,actor,'aal2'),(member_session,target,'aal1');
  insert into public.lead_contacts(email,first_name,admin_notes)
  values('deletion-test-'||target||'@example.invalid','Fixture','Private fixture notes');
  insert into public.founders50_applications(profile_id,first_name,last_name,email,status,why_interested,what_excites_you)
  values(target,'Fixture','Member','deletion-test-'||target||'@example.invalid','applied','Private motivation','Private hopes')
  returning id into application_id_fixture;
  insert into public.founders50_reviews(application_id,reviewer_id,decision,rationale)
  values(application_id_fixture,actor,'decline','Private fixture rationale to remove.');
  insert into public.privacy_requests(profile_id,request_type,status)
  values(target,'account_deletion','submitted') returning id into fixture_request_id;
  perform set_config('request.jwt.claims',jsonb_build_object('sub',actor,'role','authenticated','aal','aal2','session_id',staff_session)::text,true);
  update public.privacy_requests set status='in_review' where id=fixture_request_id;

  rejected:=false;
  begin
    perform public.lockliel_prepare_account_deletion(fixture_request_id,actor,member_session,false);
  exception when others then rejected:=true; end;
  assert rejected,'Wrong actor session accepted';

  state:=public.lockliel_prepare_account_deletion(fixture_request_id,actor,staff_session,false);
  assert (state->>'session_count')::integer=1,'Preparation unexpectedly removed member session';
  rejected:=false;
  begin
    update public.privacy_requests set status='declined' where id=fixture_request_id;
  exception when others then rejected:=true; end;
  assert rejected,'Started request was declined';

  rejected:=false;
  begin
    perform public.lockliel_prepare_account_deletion(fixture_request_id,actor,staff_session,true);
  exception when others then rejected:=true; end;
  assert rejected,'Revocation accepted before sign-in suspension';

  -- Simulate the Auth admin API's ban update, inside this rollback-only fixture.
  update auth.users set banned_until=now()+interval '1 day' where id=target;
  state:=public.lockliel_prepare_account_deletion(fixture_request_id,actor,staff_session,true);
  assert (state->>'session_count')::integer=0,'Sessions remained after revocation';
  assert exists(select 1 from auth.sessions where id=staff_session),'Staff session was revoked';
  perform public.lockliel_prepare_account_deletion(fixture_request_id,actor,staff_session,true);
  assert (select count(*)=1 from public.audit_events where entity_id=fixture_request_id::text and event_type='account_deletion_execution_started'),'Execution audit duplicated';

  rejected:=false;
  begin
    perform public.lockliel_scrub_deleted_nonfinancial_records(fixture_request_id);
  exception when others then rejected:=true; end;
  assert rejected,'Scrubbing ran before Auth deletion';

  perform set_config('request.jwt.claims','{}',true);
  delete from auth.users where id=target;
  perform set_config('request.jwt.claims',jsonb_build_object('sub',actor,'role','authenticated','aal','aal2','session_id',staff_session)::text,true);
  rejected:=false;
  begin
    update public.privacy_requests set status='completed',admin_note='Rollback fixture verification only.',
      deletion_sessions_revoked=true,deletion_auth_account_processed=true,deletion_personal_data_processed=true
    where id=fixture_request_id;
  exception when others then rejected:=true; end;
  assert rejected,'Completion accepted without scrub receipt';

  first_receipt:=public.lockliel_scrub_deleted_nonfinancial_records(fixture_request_id);
  second_receipt:=public.lockliel_scrub_deleted_nonfinancial_records(fixture_request_id);
  assert first_receipt=second_receipt,'Scrub retry changed receipt';
  assert (first_receipt->>'lead_contacts_deleted')::integer=1,'CRM contact not removed';
  assert (first_receipt->>'founders50_applications_anonymized')::integer=1,'Application not anonymized';
  assert (select rationale='Personal data removed for account deletion.' from public.founders50_reviews where application_id=application_id_fixture),'Review private text remained';
  assert (select status='declined' and email like '%@privacy.invalid' and profile_id is null from public.founders50_applications where id=application_id_fixture),'Historical application decision lost';
  assert (select count(*)=1 from public.audit_events where entity_id=fixture_request_id::text and event_type='account_deletion_nonfinancial_data_scrubbed'),'Scrub audit duplicated';
  update public.privacy_requests set status='completed',admin_note='Rollback fixture verification only.',
    deletion_sessions_revoked=true,deletion_auth_account_processed=true,deletion_personal_data_processed=true
  where id=fixture_request_id;
  assert not exists(select 1 from app_private.account_deletion_targets where request_id=fixture_request_id),'Private deletion target remained';
  rejected:=false;
  begin
    perform public.lockliel_account_deletion_state(fixture_request_id);
  exception when others then rejected:=true; end;
  assert rejected,'Terminal request recreated a deletion target';
end;
$test$;
