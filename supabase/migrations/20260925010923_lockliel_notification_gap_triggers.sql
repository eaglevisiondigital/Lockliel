
create or replace function app_private.notify_new_message()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
begin
  insert into public.notifications(profile_id,notification_type,title,body,href)
  select
    cm.profile_id,
    'message',
    'New My Lockliel message',
    'You have a new private message waiting for you.',
    '/my-lockliel/connections'
  from public.conversation_members cm
  where cm.conversation_id=new.conversation_id
    and cm.profile_id<>new.sender_id
    and cm.left_at is null;
  return new;
end;
$$;
revoke all on function app_private.notify_new_message() from public,anon,authenticated;

drop trigger if exists notify_new_message_trigger on public.messages;
create trigger notify_new_message_trigger
after insert on public.messages
for each row execute function app_private.notify_new_message();

create or replace function app_private.notify_founders50_status()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
begin
  if new.profile_id is null or old.status is not distinct from new.status then
    return new;
  end if;

  insert into public.notifications(profile_id,notification_type,title,body,href)
  values(
    new.profile_id,
    'founders50',
    case new.status
      when 'accepted' then 'Founders 50 application accepted'
      when 'orientation' then 'Your Founders 50 orientation is ready'
      when 'active_host' then 'You are active as a Founders 50 host'
      when 'needs_info' then 'Your Founders 50 application needs information'
      else 'Founders 50 application updated'
    end,
    case new.status
      when 'accepted' then 'Your Founders 50 application has been accepted. Open My Lockliel for your next step.'
      when 'orientation' then 'Your Founders 50 journey has moved into orientation.'
      when 'active_host' then 'Your Founders 50 host status is active. Your host and group tools are available in My Lockliel.'
      when 'needs_info' then 'The Lockliel team needs a little more information before continuing your Founders 50 review.'
      else 'Your Founders 50 application status is now ' || replace(new.status,'_',' ') || '.'
    end,
    case when new.status in ('accepted','orientation','active_host') then '/my-lockliel' else '/founders-50' end
  );

  return new;
end;
$$;
revoke all on function app_private.notify_founders50_status() from public,anon,authenticated;

drop trigger if exists notify_founders50_status_trigger on public.founders50_applications;
create trigger notify_founders50_status_trigger
after update of status on public.founders50_applications
for each row execute function app_private.notify_founders50_status();

create or replace function app_private.notify_course_enrollment()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
declare
  course_title text;
begin
  select c.title into course_title
  from public.courses c
  where c.id=new.course_id;

  insert into public.notifications(profile_id,notification_type,title,body,href)
  values(
    new.profile_id,
    'course',
    'Your discipleship journey is ready',
    coalesce(course_title,'Your course') || ' is ready for you in My Lockliel.',
    '/my-lockliel/journey'
  );

  return new;
end;
$$;
revoke all on function app_private.notify_course_enrollment() from public,anon,authenticated;

drop trigger if exists notify_course_enrollment_trigger on public.course_enrollments;
create trigger notify_course_enrollment_trigger
after insert on public.course_enrollments
for each row execute function app_private.notify_course_enrollment();
