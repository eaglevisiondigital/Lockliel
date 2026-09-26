
create table public.lead_contacts (
 id uuid primary key default gen_random_uuid(),
 email text not null,
 first_name text,
 last_name text,
 phone text,
 linked_profile_id uuid references public.profiles(id) on delete set null,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create unique index lead_contacts_email_unique on public.lead_contacts(lower(email));
create index lead_contacts_profile_idx on public.lead_contacts(linked_profile_id);

create table public.lead_sources (
 id uuid primary key default gen_random_uuid(),
 lead_id uuid not null references public.lead_contacts(id) on delete cascade,
 source_type text not null,
 source_ref text,
 campaign text,
 attribution jsonb not null default '{}'::jsonb,
 consent jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now()
);
create index lead_sources_lead_idx on public.lead_sources(lead_id);
create index lead_sources_type_campaign_idx on public.lead_sources(source_type,campaign);

alter table public.lead_contacts enable row level security;
alter table public.lead_sources enable row level security;

create policy "lead_contacts_admin_read" on public.lead_contacts for select to authenticated
using(app_private.has_staff_role(array['super_admin','admin']));
create policy "lead_sources_admin_read" on public.lead_sources for select to authenticated
using(app_private.has_staff_role(array['super_admin','admin']));
grant select on public.lead_contacts,public.lead_sources to authenticated;

create or replace function app_private.link_existing_lead_contact()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
begin
 update public.lead_contacts
 set linked_profile_id=new.id,
     first_name=coalesce(first_name,new.first_name),
     last_name=coalesce(last_name,new.last_name),
     phone=coalesce(phone,new.phone),
     updated_at=now()
 where linked_profile_id is null and lower(email)=lower(new.email);
 return new;
end;
$$;
revoke all on function app_private.link_existing_lead_contact() from public,anon,authenticated;

drop trigger if exists on_profile_link_lead_contact on public.profiles;
create trigger on_profile_link_lead_contact
after insert on public.profiles
for each row execute function app_private.link_existing_lead_contact();
