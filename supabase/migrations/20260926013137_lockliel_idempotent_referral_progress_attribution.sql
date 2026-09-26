alter table public.referral_events
  add constraint referral_events_signup_identity
    check (
      event_type<>'signup'
      or (member_id is not null and referral_link_id is not null)
    ),
  add constraint referral_events_course_started_identity
    check (
      event_type<>'course_started'
      or (member_id is not null and referral_link_id is not null)
    ),
  add constraint referral_events_lesson_completed_identity
    check (
      event_type<>'lesson_completed'
      or (
        member_id is not null
        and referral_link_id is not null
        and nullif(metadata->>'lesson_id','') is not null
      )
    );

create unique index referral_events_one_signup_per_member_uidx
on public.referral_events(member_id)
where event_type='signup' and member_id is not null;

create unique index referral_events_one_course_start_per_member_uidx
on public.referral_events(member_id)
where event_type='course_started' and member_id is not null;

create unique index referral_events_one_lesson_completion_uidx
on public.referral_events(member_id,(metadata->>'lesson_id'))
where event_type='lesson_completed'
  and member_id is not null
  and nullif(metadata->>'lesson_id','') is not null;

create or replace function app_private.track_referred_discipleship_progress()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
declare signup_link uuid;
begin
  select re.referral_link_id into signup_link
  from public.referral_events re
  where re.member_id=new.profile_id
    and re.event_type='signup'
    and re.referral_link_id is not null
  order by re.occurred_at asc
  limit 1;

  if signup_link is null then
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
      jsonb_build_object('lesson_id',new.lesson_id)
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
