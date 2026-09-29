
create policy "referral_events_owner_insert" on public.referral_events for insert to authenticated
with check(
 event_type='share_initiated'
 and member_id=(select auth.uid())
 and exists(
   select 1 from public.referral_links rl
   where rl.id=referral_link_id and rl.owner_id=(select auth.uid()) and rl.active=true
 )
);
grant insert on public.referral_events to authenticated;
grant usage,select on sequence public.referral_events_id_seq to authenticated;

create or replace function app_private.track_referred_discipleship_progress()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
declare signup_link uuid;
begin
 select re.referral_link_id into signup_link
 from public.referral_events re
 where re.member_id=new.profile_id and re.event_type='signup' and re.referral_link_id is not null
 order by re.occurred_at asc
 limit 1;

 if signup_link is null then return new; end if;

 if (tg_op='INSERT' or old.status='not_started') and new.status in ('in_progress','completed') then
   if not exists(
     select 1 from public.referral_events re
     where re.referral_link_id=signup_link and re.member_id=new.profile_id and re.event_type='course_started'
   ) then
     insert into public.referral_events(referral_link_id,event_type,member_id,metadata)
     values(signup_link,'course_started',new.profile_id,jsonb_build_object('lesson_id',new.lesson_id));
   end if;
 end if;

 if new.status='completed' and (tg_op='INSERT' or old.status is distinct from 'completed') then
   insert into public.referral_events(referral_link_id,event_type,member_id,metadata)
   values(signup_link,'lesson_completed',new.profile_id,jsonb_build_object('lesson_id',new.lesson_id));
 end if;
 return new;
end;
$$;
revoke all on function app_private.track_referred_discipleship_progress() from public,anon,authenticated;

drop trigger if exists on_lesson_progress_referral_tracking on public.lesson_progress;
create trigger on_lesson_progress_referral_tracking
after insert or update of status on public.lesson_progress
for each row execute function app_private.track_referred_discipleship_progress();
