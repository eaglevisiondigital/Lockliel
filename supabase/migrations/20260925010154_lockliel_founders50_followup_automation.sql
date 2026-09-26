
create or replace function app_private.create_founders50_followup()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
begin
  if old.status is not distinct from new.status then return new; end if;

  if new.status='needs_info' then
    insert into public.follow_up_tasks(
      subject_profile_id,assigned_to,task_type,status,due_at,notes,context_type,context_id
    )
    values(
      new.profile_id,null,'founders50_needs_info','open',now()+interval '2 days',
      'Follow up with this Founders 50 applicant for additional information.',
      'founders50_application',new.id::text
    )
    on conflict do nothing;
  elsif new.status='accepted' then
    insert into public.follow_up_tasks(
      subject_profile_id,assigned_to,task_type,status,due_at,notes,context_type,context_id
    )
    values(
      new.profile_id,null,'founders50_orientation','open',now()+interval '3 days',
      'Connect this accepted Founders 50 applicant with orientation and next steps.',
      'founders50_application',new.id::text
    )
    on conflict do nothing;
  elsif new.status='orientation' then
    insert into public.follow_up_tasks(
      subject_profile_id,assigned_to,task_type,status,due_at,notes,context_type,context_id
    )
    values(
      new.profile_id,null,'founders50_orientation_followup','open',now()+interval '7 days',
      'Check orientation progress and readiness for a Founders 50 gathering.',
      'founders50_application',new.id::text
    )
    on conflict do nothing;
  elsif new.status='active_host' then
    insert into public.follow_up_tasks(
      subject_profile_id,assigned_to,task_type,status,due_at,notes,context_type,context_id
    )
    values(
      new.profile_id,null,'founders50_host_launch','open',now()+interval '3 days',
      'Help this active Founders 50 host launch or confirm their gathering. Active-host status does not grant admin permissions.',
      'founders50_application',new.id::text
    )
    on conflict do nothing;
  end if;

  return new;
end;
$$;

revoke all on function app_private.create_founders50_followup() from public,anon,authenticated;

drop trigger if exists create_founders50_followup_trigger on public.founders50_applications;
create trigger create_founders50_followup_trigger
after update of status on public.founders50_applications
for each row execute function app_private.create_founders50_followup();

create unique index if not exists follow_up_context_task_unique
on public.follow_up_tasks(context_type,context_id,task_type)
where context_type is not null and context_id is not null;
