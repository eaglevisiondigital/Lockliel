
create or replace function app_private.sync_lead_followup_task()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
declare
  label text;
begin
  label:=trim(coalesce(new.first_name,'') || ' ' || coalesce(new.last_name,''));
  if label='' then label:=new.email; end if;

  if new.status in ('converted','closed') then
    update public.follow_up_tasks
    set status='completed',
        completed_at=coalesce(completed_at,now())
    where context_type='lead'
      and context_id=new.id::text
      and status in ('open','in_progress');
    return new;
  end if;

  if new.assigned_to is not null and new.next_follow_up_at is not null then
    if exists(
      select 1 from public.follow_up_tasks f
      where f.context_type='lead'
        and f.context_id=new.id::text
        and f.status in ('open','in_progress')
    ) then
      update public.follow_up_tasks
      set assigned_to=new.assigned_to,
          due_at=new.next_follow_up_at,
          notes='Follow up with pre-account lead ' || label || ' (' || new.email || ').'
      where context_type='lead'
        and context_id=new.id::text
        and status in ('open','in_progress');
    else
      insert into public.follow_up_tasks(
        subject_profile_id,
        assigned_to,
        task_type,
        status,
        due_at,
        notes,
        context_type,
        context_id
      )
      values(
        null,
        new.assigned_to,
        'preaccount_lead_followup',
        'open',
        new.next_follow_up_at,
        'Follow up with pre-account lead ' || label || ' (' || new.email || ').',
        'lead',
        new.id::text
      );
    end if;
  end if;

  return new;
end;
$$;

revoke all on function app_private.sync_lead_followup_task() from public,anon,authenticated;

drop trigger if exists sync_lead_followup_task_trigger on public.lead_contacts;
create trigger sync_lead_followup_task_trigger
after insert or update of status,assigned_to,next_follow_up_at on public.lead_contacts
for each row execute function app_private.sync_lead_followup_task();
