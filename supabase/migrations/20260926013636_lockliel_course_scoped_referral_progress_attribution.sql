drop index if exists public.referral_events_one_course_start_per_member_uidx;

alter table public.referral_events
  drop constraint if exists referral_events_course_started_identity,
  add constraint referral_events_course_started_identity
    check (
      event_type<>'course_started'
      or (
        member_id is not null
        and referral_link_id is not null
        and nullif(metadata->>'course_id','') is not null
      )
    );

create unique index referral_events_one_course_start_per_member_uidx
on public.referral_events(
  member_id,
  (metadata->>'course_id')
)
where event_type='course_started'
  and member_id is not null
  and nullif(metadata->>'course_id','') is not null;

create or replace function app_private.track_referred_discipleship_progress()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
declare
  signup_link uuid;
  lesson_course uuid;
begin
  select re.referral_link_id
    into signup_link
  from public.referral_events re
  where re.member_id=new.profile_id
    and re.event_type='signup'
    and re.referral_link_id is not null
  order by re.occurred_at asc
  limit 1;

  if signup_link is null then
    return new;
  end if;

  select l.course_id
    into lesson_course
  from public.lessons l
  where l.id=new.lesson_id;

  if lesson_course is null then
    return new;
  end if;

  if (tg_op='INSERT' or old.status='not_started')
     and new.status in ('in_progress','completed') then
    insert into public.referral_events(
      referral_link_id,event_type,member_id,metadata
    )
    values(
      signup_link,
      'course_started',
      new.profile_id,
      jsonb_build_object(
        'course_id',lesson_course,
        'lesson_id',new.lesson_id
      )
    )
    on conflict do nothing;
  end if;

  if new.status='completed'
     and (tg_op='INSERT' or old.status is distinct from 'completed') then
    insert into public.referral_events(
      referral_link_id,event_type,member_id,metadata
    )
    values(
      signup_link,
      'lesson_completed',
      new.profile_id,
      jsonb_build_object('lesson_id',new.lesson_id)
    )
    on conflict do nothing;
  end if;

  return new;
end;
$function$;

revoke execute on function app_private.track_referred_discipleship_progress()
from public,anon,authenticated;
