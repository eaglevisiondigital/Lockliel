-- Publication eligibility for direct authenticated sampling. No data backfill.
-- Preserve all prior migration bytes and durable historical achievement.
create or replace function public.lockliel_sample_media(expected_user uuid,target_asset uuid,position_seconds numeric,playing boolean)
returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); sid uuid; asset public.lesson_assets; canonical uuid; p public.media_progress;
 elapsed numeric; movement numeric; intervals jsonb:='[]'; percent numeric; now_at timestamptz:=clock_timestamp(); canonical_course uuid; content_course uuid; content_lesson uuid;
begin
 if uid is null or uid is distinct from expected_user or not app_private.current_session_is_active() then raise exception 'Account changed.' using errcode='42501'; end if;
 sid:=(auth.jwt()->>'session_id')::uuid;
 -- Resolve first, lock the selected eligibility rows, then recheck before any write.
 -- SHARE conflicts with publication/enrollment/media UPDATE or DELETE until commit.
 select a.lesson_id,l.course_id into content_lesson,content_course
 from public.lesson_assets a join public.lessons l on l.id=a.lesson_id
 where a.id=target_asset and a.asset_type='video' and a.status='active';
 select l.id,l.course_id into canonical,canonical_course
 from public.lessons l join public.courses c on c.id=l.course_id
 join public.course_enrollments e on e.course_id=c.id and e.profile_id=uid and e.status in ('active','completed')
 where c.status='published' and app_private.resolve_content_lesson_for_profile(uid,l.id)=content_lesson
 order by l.id limit 1;
 if canonical is null or content_course is null then raise exception 'Media unavailable.' using errcode='42501'; end if;
 perform 1 from public.courses where id in (canonical_course,content_course) order by id for share;
 perform 1 from public.lessons where id in (canonical,content_lesson) order by id for share;
 perform 1 from public.course_enrollments where profile_id=uid and course_id=canonical_course for share;
 select * into asset from public.lesson_assets where id=target_asset for share;
 if not exists(select 1 from public.courses where id=canonical_course and status='published')
 or not exists(select 1 from public.courses where id=content_course and status='published')
 or not exists(select 1 from public.lessons where id=canonical and course_id=canonical_course)
 or not exists(select 1 from public.lessons where id=content_lesson and course_id=content_course)
 or not exists(select 1 from public.course_enrollments where profile_id=uid and course_id=canonical_course and status in ('active','completed'))
 or asset.id is null or asset.lesson_id is distinct from content_lesson or asset.asset_type<>'video' or asset.status<>'active'
 or app_private.resolve_content_lesson_for_profile(uid,canonical) is distinct from content_lesson
 or not app_private.course_lesson_unlocked(uid,canonical)
 then raise exception 'Media unavailable.' using errcode='42501'; end if;
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

