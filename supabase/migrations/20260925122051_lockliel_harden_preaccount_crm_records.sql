revoke all privileges on table public.lead_contacts from anon;
revoke all privileges on table public.lead_contacts from authenticated;

grant select on table public.lead_contacts to authenticated;
grant update (
  status,
  assigned_to,
  next_follow_up_at,
  last_contacted_at,
  admin_notes
) on table public.lead_contacts to authenticated;

revoke all privileges on table public.lead_sources from anon;
revoke all privileges on table public.lead_sources from authenticated;
grant select on table public.lead_sources to authenticated;

alter table public.lead_contacts
  drop constraint if exists lead_contacts_admin_notes_length,
  add constraint lead_contacts_admin_notes_length
    check (
      admin_notes is null
      or char_length(admin_notes)<=5000
    );

create or replace function app_private.normalize_lead_contact_update()
returns trigger
language plpgsql
set search_path to ''
as $function$
begin
  new.updated_at:=now();
  return new;
end;
$function$;

revoke execute on function app_private.normalize_lead_contact_update()
from public, anon, authenticated;

drop trigger if exists normalize_lead_contact_update_trigger
on public.lead_contacts;

create trigger normalize_lead_contact_update_trigger
before update on public.lead_contacts
for each row
execute function app_private.normalize_lead_contact_update();

create or replace function app_private.audit_lead_operational_change()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
begin
  if old.status is not distinct from new.status
     and old.assigned_to is not distinct from new.assigned_to
     and old.next_follow_up_at is not distinct from new.next_follow_up_at
     and old.last_contacted_at is not distinct from new.last_contacted_at then
    return new;
  end if;

  insert into public.audit_events(
    actor_profile_id,
    event_type,
    entity_type,
    entity_id,
    summary,
    metadata
  )
  values(
    (select auth.uid()),
    'lead_operational_change',
    'lead_contact',
    new.id::text,
    'Lead assignment, status, or follow-up timing changed',
    jsonb_build_object(
      'status_from',old.status,
      'status_to',new.status,
      'assigned_to_from',old.assigned_to,
      'assigned_to_to',new.assigned_to,
      'next_follow_up_from',old.next_follow_up_at,
      'next_follow_up_to',new.next_follow_up_at,
      'last_contacted_from',old.last_contacted_at,
      'last_contacted_to',new.last_contacted_at
    )
  );

  return new;
end;
$function$;

revoke execute on function app_private.audit_lead_operational_change()
from public, anon, authenticated;

drop trigger if exists audit_lead_operational_change_trigger
on public.lead_contacts;

create trigger audit_lead_operational_change_trigger
after update of
  status,
  assigned_to,
  next_follow_up_at,
  last_contacted_at
on public.lead_contacts
for each row
execute function app_private.audit_lead_operational_change();
