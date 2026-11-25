-- Local release candidate only. Preserve all historical migration bytes.
-- Updated while unapplied: trusted duration provenance, never browser duration.
alter table public.lesson_assets add column duration_verification_source text
 check(duration_verification_source is null or char_length(duration_verification_source) between 10 and 500);
-- Match existing column-scoped media editing privileges; staff/MFA RLS still applies.
grant insert (duration_verification_source), update (duration_verification_source) on public.lesson_assets to authenticated;
update public.lesson_assets set duration_verification_source='existing_verified_configuration' where duration_seconds is not null;
create or replace function app_private.normalize_lesson_asset_duration_verification()
returns trigger language plpgsql set search_path='' as $$
begin
 if tg_op='UPDATE' and (old.provider is distinct from new.provider or old.provider_ref is distinct from new.provider_ref or old.external_url is distinct from new.external_url or old.storage_path is distinct from new.storage_path) then
  new.duration_seconds:=null; new.duration_verified_at:=null; new.duration_verification_source:=null;
 elsif new.duration_seconds is null then
  new.duration_verified_at:=null; new.duration_verification_source:=null;
 else
  if new.duration_seconds<=0 or new.duration_seconds>86400 or new.duration_seconds::text in ('NaN','Infinity','-Infinity') then raise exception 'Invalid trusted duration.' using errcode='22023'; end if;
  new.duration_verification_source:=coalesce(nullif(btrim(new.duration_verification_source),''),'trusted_database_configuration');
  if tg_op='INSERT' or old.duration_seconds is distinct from new.duration_seconds or old.duration_verification_source is distinct from new.duration_verification_source then new.duration_verified_at:=clock_timestamp();
  else new.duration_verified_at:=old.duration_verified_at; end if;
 end if;
 return new;
end; $$;
drop trigger normalize_lesson_asset_duration_verification_trigger on public.lesson_assets;
create trigger normalize_lesson_asset_duration_verification_trigger before insert or update of duration_seconds,duration_verification_source,provider,provider_ref,external_url,storage_path on public.lesson_assets
 for each row execute function app_private.normalize_lesson_asset_duration_verification();
alter table public.lesson_assets add constraint lesson_asset_duration_source_consistency check(
 (duration_seconds is null and duration_verification_source is null) or (duration_seconds is not null and duration_verification_source is not null));
alter table public.courses add column learning_rules jsonb not null default '{}';
alter table public.lessons add column configuration_version integer not null default 1 check(configuration_version>0);
alter table public.lesson_progress add column revision bigint not null default 0;
alter table public.lesson_progress add column content_snapshot jsonb not null default '{}';
alter table public.lesson_progress add column watch_requirement_met_at timestamptz;
alter table public.lesson_progress add column review_approved_at timestamptz;
alter table public.media_progress add column last_sample_at timestamptz;
alter table public.media_progress add column last_sample_position numeric;
alter table public.media_progress add column sample_session uuid;

alter table public.courses add constraint course_learning_rules_shape check(
 jsonb_typeof(learning_rules)='object' and (
 learning_rules='{}'::jsonb or (
 learning_rules ?& array['model','sequential','watch_threshold','minimum_score']
 and learning_rules->>'model' in ('watch_answer','watch_score','simple','review')
 and (learning_rules->>'model') is not null
 and jsonb_typeof(learning_rules->'sequential')='boolean'
 and jsonb_typeof(learning_rules->'watch_threshold')='number'
 and jsonb_typeof(learning_rules->'minimum_score')='number'
 and (learning_rules->>'watch_threshold')::numeric between 1 and 100
 and (learning_rules->>'minimum_score')::numeric between 0 and 100)));
update public.courses set learning_rules='{"model":"watch_answer","sequential":true,"watch_threshold":95,"minimum_score":0}'
where translation_key='getting-a-grip-on-the-basics';
alter table public.courses add constraint getting_a_grip_permanent_rule check(
 translation_key is distinct from 'getting-a-grip-on-the-basics' or
 coalesce((learning_rules->>'model'='watch_answer' and (learning_rules->>'watch_threshold')::numeric=95 and (learning_rules->>'minimum_score')::numeric=0 and (learning_rules->>'sequential')::boolean and coalesce((learning_rules->>'worksheet_required')::boolean,true)),false));

-- Independent learner-only notes. Existing staff progress SELECT policies cannot expose them.
create table public.lesson_private_notes (
 profile_id uuid not null,
 lesson_id uuid not null,
 body text not null default '' check(char_length(body)<=12000),
 updated_at timestamptz not null default now(),
 primary key(profile_id,lesson_id),
 foreign key(profile_id,lesson_id) references public.lesson_progress(profile_id,lesson_id) on delete cascade
);
alter table public.lesson_private_notes enable row level security;
create policy lesson_private_notes_owner on public.lesson_private_notes for select to authenticated
 using(profile_id=(select auth.uid()) and app_private.current_session_is_active());
grant select on public.lesson_private_notes to authenticated;
revoke all on public.lesson_private_notes from anon;

-- Grading keys are never returned in course/worksheet reads. Model B is opt-in.
create table app_private.course_answer_keys (
 lesson_id uuid references public.lessons(id) on delete cascade,
 configuration_version integer not null,
 answers jsonb not null check(jsonb_typeof(answers)='object'),
 primary key(lesson_id,configuration_version)
);
revoke all on app_private.course_answer_keys from public,anon,authenticated;

create function app_private.course_watch_met(learner uuid, target_lesson uuid)
returns boolean language plpgsql stable security definer set search_path='' as $$
declare content_id uuid; threshold numeric; model text;
begin
 select coalesce(c.learning_rules->>'model','legacy'),coalesce((c.learning_rules->>'watch_threshold')::numeric,95)
 into model,threshold from public.lessons l join public.courses c on c.id=l.course_id where l.id=target_lesson;
 if model in ('simple','review') then return true; end if;
 if exists(select 1 from public.lesson_progress where profile_id=learner and lesson_id=target_lesson and watch_requirement_met_at is not null) then return true; end if;
 content_id:=app_private.resolve_content_lesson_for_profile(learner,target_lesson);
 return exists(select 1 from public.lesson_assets where lesson_id=content_id and asset_type='video' and status='active')
 and not exists(select 1 from public.lesson_assets a left join public.media_progress p on p.asset_id=a.id and p.profile_id=learner
 where a.lesson_id=content_id and a.asset_type='video' and a.status='active'
 and (a.provider is distinct from 'youtube' or nullif(btrim(a.provider_ref),'') is null or a.duration_seconds is null or a.duration_verified_at is null or a.duration_verification_source is null or 100*app_private.media_covered_seconds(coalesce(p.covered_intervals,'[]'))/a.duration_seconds<threshold));
end; $$;
revoke all on function app_private.course_watch_met(uuid,uuid) from public,anon,authenticated;

create function app_private.course_lesson_unlocked(learner uuid,target_lesson uuid)
returns boolean language plpgsql stable security definer set search_path='' as $$
declare lesson public.lessons; rules jsonb; prior record;
begin
 select * into lesson from public.lessons where id=target_lesson;
 select learning_rules into rules from public.courses where id=lesson.course_id;
 if exists(select 1 from public.lesson_progress where profile_id=learner and lesson_id=target_lesson and status='completed') then return true; end if;
 if not coalesce((rules->>'sequential')::boolean,false) then return true; end if;
 for prior in select id from public.lessons where course_id=lesson.course_id and position<lesson.position loop
  if rules->>'model'='watch_answer' then
   if not app_private.course_watch_met(learner,prior.id) then return false; end if;
  elsif not exists(select 1 from public.lesson_progress where profile_id=learner and lesson_id=prior.id and status='completed') then return false;
  end if;
 end loop;
 return true;
end; $$;
revoke all on function app_private.course_lesson_unlocked(uuid,uuid) from public,anon,authenticated;

-- Only the current learner can ask for their gate projection.
create function public.lockliel_course_gates()
returns jsonb language sql stable security definer set search_path='' as $$
 select coalesce(jsonb_agg(jsonb_build_object('lesson_id',l.id,'unlocked',app_private.course_lesson_unlocked(auth.uid(),l.id),
 'watch_met',app_private.course_watch_met(auth.uid(),l.id))),'[]'::jsonb)
 from public.lessons l join public.courses c on c.id=l.course_id
 join public.course_enrollments e on e.course_id=c.id and e.profile_id=auth.uid() and e.status in ('active','completed')
 where c.status='published' and app_private.current_session_is_active();
$$;
revoke all on function public.lockliel_course_gates() from public,anon;
grant execute on function public.lockliel_course_gates() to authenticated;

-- Keep legacy writes for unconfigured courses. Configured courses use the atomic RPC.
create policy engine_lesson_insert on public.lesson_progress as restrictive for insert to authenticated with check(exists(select 1 from public.lessons l join public.courses c on c.id=l.course_id where l.id=lesson_id and c.learning_rules='{}'::jsonb));
create policy engine_lesson_update on public.lesson_progress as restrictive for update to authenticated using(exists(select 1 from public.lessons l join public.courses c on c.id=l.course_id where l.id=lesson_id and c.learning_rules='{}'::jsonb));
create policy engine_media_insert on public.media_progress as restrictive for insert to authenticated with check(exists(select 1 from public.lesson_assets a join public.lessons l on l.id=a.lesson_id join public.courses c on c.id=l.course_id where a.id=asset_id and c.learning_rules='{}'::jsonb and not exists(select 1 from public.courses family where family.translation_key=c.translation_key and family.learning_rules<>'{}'::jsonb)));
create policy engine_media_update on public.media_progress as restrictive for update to authenticated using(exists(select 1 from public.lesson_assets a join public.lessons l on l.id=a.lesson_id join public.courses c on c.id=l.course_id where a.id=asset_id and c.learning_rules='{}'::jsonb and not exists(select 1 from public.courses family where family.translation_key=c.translation_key and family.learning_rules<>'{}'::jsonb)));

create function public.lockliel_save_lesson(expected_user uuid,target_lesson uuid,expected_revision bigint,answers jsonb,notes text,complete boolean default false)
returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); lesson public.lessons; progress public.lesson_progress; rules jsonb;
 content_id uuid; questions jsonb; worksheet_done boolean; watch_done boolean; grade numeric; keys jsonb; snapshot jsonb;
begin
 if uid is null or uid is distinct from expected_user or not app_private.current_session_is_active() then raise exception 'Account changed. Sign in again.' using errcode='42501'; end if;
 select l.* into lesson from public.lessons l join public.courses c on c.id=l.course_id
 join public.course_enrollments e on e.course_id=c.id and e.profile_id=uid and e.status in ('active','completed')
 where l.id=target_lesson and c.status='published';
 if lesson.id is null then raise exception 'Lesson unavailable.' using errcode='42501'; end if;
 if not app_private.course_lesson_unlocked(uid,target_lesson) then raise exception 'Previous lesson requirement is not met.' using errcode='42501'; end if;
 if expected_revision is null or expected_revision<0 or answers is null or jsonb_typeof(answers)<>'object' or octet_length(answers::text)>60000
 or notes is null or char_length(notes)>12000 then raise exception 'Invalid lesson response.' using errcode='22023'; end if;
 if (select count(*) from jsonb_each(answers))>100 or exists(select 1 from jsonb_each(answers) x where jsonb_typeof(value)<>'string' or char_length(value#>>'{}')>4000) then raise exception 'Answer limits exceeded.' using errcode='22023'; end if;
 perform pg_advisory_xact_lock(hashtextextended('lesson:'||uid||':'||target_lesson,0));
 select * into progress from public.lesson_progress where profile_id=uid and lesson_id=target_lesson for update;
 -- A lost response may be retried verbatim; acknowledge the same atomic result.
 if progress.revision=expected_revision+1 and progress.worksheet_answers=answers
 and exists(select 1 from public.lesson_private_notes n where n.profile_id=uid and n.lesson_id=target_lesson and n.body=notes)
 and (not complete or progress.status='completed') then return to_jsonb(progress)||jsonb_build_object('notes',notes); end if;
 if coalesce(progress.revision,0)<>expected_revision then raise exception 'Newer cloud work exists. Reload before saving.' using errcode='40001'; end if;
 if progress.last_activity_at>clock_timestamp()-interval '300 milliseconds' then raise exception 'Save rate exceeded.' using errcode='54000'; end if;
 content_id:=app_private.resolve_content_lesson_for_profile(uid,target_lesson);
 select learning_rules into rules from public.courses where id=lesson.course_id;
 select worksheet_schema->'questions' into questions from public.lessons where id=content_id;
 questions:=coalesce(questions,'[]'::jsonb);
 -- Preserve exactly which prompts/version were answered. Completed answers are immutable; notes remain editable.
 snapshot:=case when progress.content_snapshot ? 'questions' then progress.content_snapshot else jsonb_build_object('configuration_version',lesson.configuration_version,'questions',questions,'rules',rules,'media',(select coalesce(jsonb_agg(jsonb_build_object('asset',id,'provider_ref',provider_ref,'duration_seconds',duration_seconds)),'[]') from public.lesson_assets where lesson_id=content_id and asset_type='video' and status='active')) end;
 questions:=snapshot->'questions';
 if progress.status='completed' then
  if answers is distinct from progress.worksheet_answers then raise exception 'Completed answers cannot be changed.' using errcode='22023'; end if;
  snapshot:=progress.content_snapshot;
  worksheet_done:=true;
 else
  worksheet_done:=not exists(select 1 from jsonb_array_elements(questions) q
   where coalesce((q->>'required')::boolean,true) and nullif(btrim(answers->>coalesce(q->>'number',q->>'id')),'') is null);
 end if;
 watch_done:=app_private.course_watch_met(uid,target_lesson);
 if complete and progress.status is distinct from 'completed' then
  if rules->>'model' in ('watch_answer','watch_score','review') and coalesce((rules->>'worksheet_required')::boolean,true) and jsonb_array_length(questions)=0 then raise exception 'Worksheet configuration is pending.' using errcode='22023'; end if;
  if not watch_done or not worksheet_done then raise exception 'Watch and worksheet requirements are not met.' using errcode='22023'; end if;
  if rules->>'model'='review' and progress.review_approved_at is null then raise exception 'Course manager review is required.' using errcode='22023'; end if;
  if rules->>'model'='watch_score' then
   select k.answers into keys from app_private.course_answer_keys k where k.lesson_id=content_id and k.configuration_version=(snapshot->>'configuration_version')::integer;
   if keys is null or keys='{}'::jsonb then raise exception 'Scoring is not configured.' using errcode='22023'; end if;
   select 100.0*count(*) filter(where lower(btrim(answers->>key))=lower(btrim(value#>>'{}')))/count(*) into grade from jsonb_each(keys);
   if grade<(rules->>'minimum_score')::numeric then raise exception 'The configured score requirement is not met.' using errcode='22023'; end if;
  end if;
 end if;
 insert into public.lesson_progress(profile_id,lesson_id,status,worksheet_status,worksheet_answers,revision,content_snapshot,watch_requirement_met_at)
 values(uid,target_lesson,case when complete or progress.status='completed' then 'completed' else 'in_progress' end,
 case when worksheet_done then 'completed' else 'in_progress' end,answers,expected_revision+1,snapshot,
 coalesce(progress.watch_requirement_met_at,case when watch_done then clock_timestamp() end))
 on conflict(profile_id,lesson_id) do update set status=excluded.status,worksheet_status=excluded.worksheet_status,
 worksheet_answers=excluded.worksheet_answers,revision=excluded.revision,content_snapshot=excluded.content_snapshot,
 watch_requirement_met_at=coalesce(public.lesson_progress.watch_requirement_met_at,excluded.watch_requirement_met_at) returning * into progress;
 insert into public.lesson_private_notes(profile_id,lesson_id,body) values(uid,target_lesson,notes)
 on conflict(profile_id,lesson_id) do update set body=excluded.body,updated_at=clock_timestamp();
 return to_jsonb(progress)||jsonb_build_object('notes',notes);
end; $$;
revoke all on function public.lockliel_save_lesson(uuid,uuid,bigint,jsonb,text,boolean) from public,anon;
grant execute on function public.lockliel_save_lesson(uuid,uuid,bigint,jsonb,text,boolean) to authenticated;

-- Server-timed samples replace arbitrary percent/range submissions for configured courses.
create function public.lockliel_sample_media(expected_user uuid,target_asset uuid,position_seconds numeric,playing boolean)
returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); sid uuid; asset public.lesson_assets; canonical uuid; p public.media_progress;
 elapsed numeric; movement numeric; intervals jsonb:='[]'; percent numeric; now_at timestamptz:=clock_timestamp();
begin
 if uid is null or uid is distinct from expected_user or not app_private.current_session_is_active() then raise exception 'Account changed.' using errcode='42501'; end if;
 sid:=(auth.jwt()->>'session_id')::uuid;
 select * into asset from public.lesson_assets where id=target_asset and asset_type='video' and status='active';
 select l.id into canonical from public.lessons l join public.course_enrollments e on e.course_id=l.course_id and e.profile_id=uid and e.status in ('active','completed')
 where app_private.resolve_content_lesson_for_profile(uid,l.id)=asset.lesson_id limit 1;
 if canonical is null or not app_private.course_lesson_unlocked(uid,canonical) then raise exception 'Media unavailable.' using errcode='42501'; end if;
 if position_seconds is null or position_seconds<0 or position_seconds>86400 or position_seconds::text in ('NaN','Infinity','-Infinity') then raise exception 'Invalid position.' using errcode='22023'; end if;
 if asset.duration_seconds is not null and position_seconds>asset.duration_seconds+1 then raise exception 'Position exceeds duration.' using errcode='22023'; end if;
 perform pg_advisory_xact_lock(hashtextextended('media:'||uid||':'||target_asset,0));
 select * into p from public.media_progress where profile_id=uid and asset_id=target_asset for update;
 elapsed:=extract(epoch from now_at-p.last_sample_at); movement:=position_seconds-p.last_sample_position;
 if p.last_sample_at is not null and elapsed<2 then return to_jsonb(p)-'sample_session'; end if;
 -- A pause/seek/start sample (playing=false) resets the baseline. A 30s gap earns no credit.
 if playing and p.sample_session=sid and elapsed between 2 and 20 and movement>0 and movement<=least(20,elapsed*2+0.75) then
  intervals:=jsonb_build_array(jsonb_build_array(p.last_sample_position,position_seconds));
 end if;
 insert into public.media_progress(profile_id,asset_id,last_position_seconds,covered_intervals,percent_watched,last_sample_at,last_sample_position,sample_session)
 values(uid,target_asset,position_seconds,intervals,0,now_at,position_seconds,sid)
 on conflict(profile_id,asset_id) do update set last_position_seconds=excluded.last_position_seconds,
 covered_intervals=excluded.covered_intervals,percent_watched=0,last_sample_at=excluded.last_sample_at,
 last_sample_position=excluded.last_sample_position,sample_session=excluded.sample_session returning * into p;
 if asset.duration_seconds is null then
  -- No client-provided duration or percentage can establish a threshold.
  update public.media_progress set percent_watched=0 where profile_id=uid and asset_id=target_asset;
  p.percent_watched:=0;
 end if;
 insert into public.lesson_progress(profile_id,lesson_id,status) values(uid,canonical,'in_progress') on conflict(profile_id,lesson_id) do nothing;
 if app_private.course_watch_met(uid,canonical) then
  update public.lesson_progress set watch_requirement_met_at=coalesce(watch_requirement_met_at,now_at)
  where profile_id=uid and lesson_id=canonical;
 end if;
 return to_jsonb(p)-'sample_session';
end; $$;
revoke all on function public.lockliel_sample_media(uuid,uuid,numeric,boolean) from public,anon;
grant execute on function public.lockliel_sample_media(uuid,uuid,numeric,boolean) to authenticated;

create or replace function app_private.validate_lesson_completion()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
declare
  content_lesson_id uuid;
  engine_rules jsonb;
  required_videos int;
  completed_videos int;
  question_count int;
  answered_count int;
begin
  select c.learning_rules into engine_rules from public.courses c join public.lessons l on l.course_id=c.id where l.id=new.lesson_id;
  if engine_rules<>'{}'::jsonb then
    if tg_op='UPDATE' and old.status='completed' then
      if new.worksheet_answers is distinct from old.worksheet_answers then raise exception 'Completed answers are immutable.'; end if;
      return new;
    end if;
    if new.status='completed' then
      if not app_private.course_watch_met(new.profile_id,new.lesson_id) or new.worksheet_status<>'completed' then raise exception 'Course requirements are not met.'; end if;
    end if;
    return new;
  end if;
  if new.status<>'completed' then
    return new;
  end if;

  content_lesson_id:=
    app_private.resolve_content_lesson_for_profile(
      new.profile_id,
      new.lesson_id
    );

  if content_lesson_id is null then
    raise exception 'Lesson content is not available for completion.';
  end if;

  select count(*)::int
    into required_videos
  from public.lesson_assets a
  where a.lesson_id=content_lesson_id
    and a.asset_type='video'
    and a.status='active';

  if required_videos>0 then
    select count(*)::int
      into completed_videos
    from public.lesson_assets a
    join public.media_progress mp
      on mp.asset_id=a.id
     and mp.profile_id=new.profile_id
    where a.lesson_id=content_lesson_id
      and a.asset_type='video'
      and a.status='active'
      and mp.percent_watched>=95;

    if completed_videos<required_videos then
      raise exception
        'Lesson cannot be completed until all required videos are watched to at least 95 percent.';
    end if;
  end if;

  select
    jsonb_array_length(
      coalesce(l.worksheet_schema->'questions','[]'::jsonb)
    )::int
    into question_count
  from public.lessons l
  where l.id=content_lesson_id;

  if coalesce(question_count,0)>0 then
    if new.worksheet_status<>'completed' then
      raise exception
        'Lesson cannot be completed until the worksheet is completed.';
    end if;

    select count(*)::int
      into answered_count
    from jsonb_array_elements(
      coalesce(
        (
          select l.worksheet_schema->'questions'
          from public.lessons l
          where l.id=content_lesson_id
        ),
        '[]'::jsonb
      )
    ) q
    where nullif(
      trim(
        coalesce(
          new.worksheet_answers->>(q->>'number'),
          ''
        )
      ),
      ''
    ) is not null;

    if answered_count<question_count then
      raise exception
        'Lesson cannot be completed until every worksheet or notes field has an answer.';
    end if;
  end if;

  if new.completed_at is null then
    new.completed_at:=now();
  end if;

  return new;
end;
$function$;

revoke execute on function app_private.validate_lesson_completion()
from public, anon, authenticated;

-- Configuration changes are security audit events, not learner autosave activity.
create function app_private.audit_learning_configuration()
returns trigger language plpgsql security definer set search_path='' as $$
declare before_value jsonb:=to_jsonb(old); after_value jsonb:=to_jsonb(new); fields jsonb:='[]'; field text;
begin
 foreach field in array tg_argv loop
  if before_value->field is distinct from after_value->field then fields:=fields||to_jsonb(field); end if;
 end loop;
 if fields<>'[]'::jsonb then
  insert into public.audit_events(actor_profile_id,event_type,entity_type,entity_id,summary,metadata)
  values(auth.uid(),'learning_configuration_changed',tg_table_name,new.id::text,'Course configuration changed',
   jsonb_build_object('fields',fields,'before_hash',md5(before_value::text),'after_hash',md5(after_value::text)));
 end if;
 return new;
end; $$;
revoke all on function app_private.audit_learning_configuration() from public,anon,authenticated;
create trigger audit_learning_course after update of learning_rules on public.courses
 for each row execute function app_private.audit_learning_configuration('learning_rules');
create trigger audit_learning_lesson after update of worksheet_schema,configuration_version,position on public.lessons
 for each row execute function app_private.audit_learning_configuration('worksheet_schema','configuration_version','position');
create trigger audit_learning_media after update of provider,provider_ref,external_url,storage_path,status on public.lesson_assets
 for each row execute function app_private.audit_learning_configuration('provider','provider_ref','external_url','storage_path','status');

create trigger audit_learning_duration_source after update of duration_verification_source on public.lesson_assets
 for each row execute function app_private.audit_learning_configuration('duration_verification_source');
alter table app_private.course_answer_keys enable row level security;
