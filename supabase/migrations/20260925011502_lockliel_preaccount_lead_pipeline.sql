
alter table public.lead_contacts
  add column if not exists status text not null default 'new'
    check(status in ('new','contacted','nurture','converted','closed')),
  add column if not exists assigned_to uuid references public.profiles(id) on delete set null,
  add column if not exists next_follow_up_at timestamptz,
  add column if not exists last_contacted_at timestamptz,
  add column if not exists admin_notes text;

create index if not exists lead_contacts_status_idx
  on public.lead_contacts(status,created_at desc);
create index if not exists lead_contacts_assigned_to_idx
  on public.lead_contacts(assigned_to,status,next_follow_up_at);

drop policy if exists "lead_contacts_admin_read" on public.lead_contacts;
create policy "lead_contacts_admin_read" on public.lead_contacts for select to authenticated
using(app_private.has_staff_role(array['super_admin','admin']));

create policy "lead_contacts_admin_update" on public.lead_contacts for update to authenticated
using(app_private.has_staff_role(array['super_admin','admin']))
with check(app_private.has_staff_role(array['super_admin','admin']));

grant update on public.lead_contacts to authenticated;

create or replace function app_private.convert_linked_lead()
returns trigger
language plpgsql
set search_path=''
as $$
begin
  if new.linked_profile_id is not null and old.linked_profile_id is distinct from new.linked_profile_id then
    new.status:='converted';
    new.updated_at:=now();
  end if;
  return new;
end;
$$;

drop trigger if exists convert_linked_lead_trigger on public.lead_contacts;
create trigger convert_linked_lead_trigger
before update of linked_profile_id on public.lead_contacts
for each row execute function app_private.convert_linked_lead();

create or replace function app_private.audit_lead_pipeline_change()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
begin
  if old.status is distinct from new.status
     or old.assigned_to is distinct from new.assigned_to
     or old.next_follow_up_at is distinct from new.next_follow_up_at then
    insert into public.audit_events(
      actor_profile_id,event_type,entity_type,entity_id,summary,metadata
    )
    values(
      (select auth.uid()),
      'lead_pipeline_changed',
      'lead_contact',
      new.id::text,
      'Lead pipeline updated',
      jsonb_build_object(
        'status',new.status,
        'assigned_to',new.assigned_to,
        'next_follow_up_at',new.next_follow_up_at
      )
    );
  end if;
  return new;
end;
$$;
revoke all on function app_private.audit_lead_pipeline_change() from public,anon,authenticated;

drop trigger if exists audit_lead_pipeline_change_trigger on public.lead_contacts;
create trigger audit_lead_pipeline_change_trigger
after update on public.lead_contacts
for each row execute function app_private.audit_lead_pipeline_change();
