-- TEMPORARY OPERATIONAL INSTALL, not a migration. Local/disposable rehearsal only
-- until separately authorized for production. Capture prior authenticator config.
-- Starts CLOSED. Never install into a schema where these names already exist.
begin;
create schema lockliel_cutover;
revoke all on schema lockliel_cutover from public,anon,authenticated;
create table lockliel_cutover.control(singleton boolean primary key default true check(singleton),paused boolean not null default true,protocol text not null default '278-v1');
insert into lockliel_cutover.control values(true,true,'278-v1');
alter table lockliel_cutover.control enable row level security;
revoke all on lockliel_cutover.control from public,anon,authenticated;
create function public.lockliel_course_cutover_status() returns jsonb language sql stable security definer set search_path='' as $$
 with ready as (select
 (select count(*)=278 from supabase_migrations.schema_migrations)
 and (select count(*)=9 and bool_and(md5(pg_get_functiondef(p.oid))=expected.value and pg_get_userbyid(p.proowner)='postgres')
 from jsonb_each_text('{"app_private.audit_learning_configuration":"abacb6205c5aa998ff5e566108a494e4","app_private.course_lesson_unlocked":"4ee41fbb39e108322c0ae7fd9b7104bc","app_private.course_watch_met":"e27d583485b82a70712915f4d1a93d2a","app_private.normalize_lesson_asset_duration_verification":"ffcb56a46a947385dd3c515ca6916fa5","app_private.validate_course_release":"a9c38e606b5510100854ed9b5da72550","app_private.validate_lesson_completion":"445dc44467c92cf1fac7d3bca2e00a00","public.lockliel_course_gates":"f9220d0f0d325909c82b56c49b4c43b1","public.lockliel_sample_media":"9a5509a2b798cb45dc83e8cec67d5b1c","public.lockliel_save_lesson":"670f673fcfd9aa78f75164a18a321050"}'::jsonb) expected
 join pg_namespace n on n.nspname=split_part(expected.key,'.',1)
 join pg_proc p on p.pronamespace=n.oid and p.proname=split_part(expected.key,'.',2)) as ok)
 select jsonb_build_object('paused',paused or not coalesce(ready.ok,false),'protocol',protocol,'schemaReady',coalesce(ready.ok,false)) from lockliel_cutover.control,ready where singleton;
$$;
revoke all on function public.lockliel_course_cutover_status() from public,anon;
grant execute on function public.lockliel_course_cutover_status() to authenticated;
create function lockliel_cutover.deny_write() returns trigger language plpgsql security definer set search_path='' as $$
begin
 -- Only a direct maintenance/migration connection with no request claims may bypass.
 if session_user='postgres' and coalesce(current_setting('request.jwt.claims',true),'') in ('','{}') then return case when tg_op='DELETE' then old else new end; end if;
 if coalesce((public.lockliel_course_cutover_status()->>'paused')::boolean,true) then
  raise sqlstate 'PT503' using message='Getting a Grip is being updated. Your progress is safe. Please check back in a few minutes.';
 end if;
 return case when tg_op='DELETE' then old else new end;
end;$$;
revoke all on function lockliel_cutover.deny_write() from public,anon,authenticated;
-- Table locks drain old writes before the CLOSED state becomes installed/committed.
-- A bounded lock_timeout must be set by the operational executor.
lock table public.courses,public.lessons,public.lesson_assets,public.lesson_progress,public.media_progress in share row exclusive mode;
create trigger cutover_write_guard before insert or update or delete on public.courses for each row execute function lockliel_cutover.deny_write();
create trigger cutover_write_guard before insert or update or delete on public.lessons for each row execute function lockliel_cutover.deny_write();
create trigger cutover_write_guard before insert or update or delete on public.lesson_assets for each row execute function lockliel_cutover.deny_write();
create trigger cutover_write_guard before insert or update or delete on public.lesson_progress for each row execute function lockliel_cutover.deny_write();
create trigger cutover_write_guard before insert or update or delete on public.media_progress for each row execute function lockliel_cutover.deny_write();
-- Embedded table reads must also remain closed, irrespective of request path.
create policy cutover_read_guard on public.courses as restrictive for select to authenticated using(not coalesce((public.lockliel_course_cutover_status()->>'paused')::boolean,true));
create policy cutover_read_guard on public.lessons as restrictive for select to authenticated using(not coalesce((public.lockliel_course_cutover_status()->>'paused')::boolean,true));
create policy cutover_read_guard on public.lesson_assets as restrictive for select to authenticated using(not coalesce((public.lockliel_course_cutover_status()->>'paused')::boolean,true));
create policy cutover_read_guard on public.lesson_progress as restrictive for select to authenticated using(not coalesce((public.lockliel_course_cutover_status()->>'paused')::boolean,true));
create policy cutover_read_guard on public.media_progress as restrictive for select to authenticated using(not coalesce((public.lockliel_course_cutover_status()->>'paused')::boolean,true));
-- PostgREST path guard covers direct RPCs as well as ordinary table endpoints.
create function lockliel_cutover.request() returns void language plpgsql security definer set search_path='' as $$
declare path text:=current_setting('request.path',true); method text:=current_setting('request.method',true); headers jsonb:=coalesce(nullif(current_setting('request.headers',true),''),'{}')::jsonb; state jsonb;
begin
 if path is null or method is null then raise sqlstate 'PT503' using message='Course request context unavailable.';end if;
 if path ~ '^/(courses|lessons|lesson_assets|course_enrollments|lesson_progress|media_progress|lesson_private_notes)(/|$)'
 or path ~ '^/rpc/(lockliel_(sample_media|save_lesson|course_gates|grip_readiness)|.*course.*|.*lesson.*)$' and path not in ('/rpc/lockliel_course_cutover_status','/rpc/lockliel_course_cutover_request') then
  state:=public.lockliel_course_cutover_status();
  if coalesce((state->>'paused')::boolean,true) then raise sqlstate 'PT503' using message='Getting a Grip is being updated. Your progress is safe. Please check back in a few minutes.';end if;
  if method not in ('GET','HEAD','OPTIONS') and path not in ('/rpc/lockliel_course_gates','/rpc/lockliel_grip_readiness') and headers->>'x-lockliel-course-protocol' is distinct from state->>'protocol' then raise sqlstate 'PT426' using message='Reload Getting a Grip before saving. Keep a copy of unsaved answers.';end if;
 end if;
end;$$;
revoke all on function lockliel_cutover.request() from public;
grant usage on schema lockliel_cutover to anon,authenticated,service_role;
grant execute on function lockliel_cutover.request() to anon,authenticated,service_role;
-- Refuse to replace an existing pre-request hook. Chaining needs separate review.
do $$begin
 if exists(select 1 from pg_db_role_setting s join pg_roles r on r.oid=s.setrole where r.rolname='authenticator' and exists(select 1 from unnest(s.setconfig) c where c like 'pgrst.db_pre_request=%')) then raise exception 'Existing pre-request hook requires reviewed chaining';end if;
end$$;
alter role authenticator set pgrst.db_pre_request='lockliel_cutover.request';
notify pgrst,'reload config';
commit;
