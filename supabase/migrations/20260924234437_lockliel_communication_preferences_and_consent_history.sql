
create table public.communication_preferences (
 profile_id uuid primary key references public.profiles(id) on delete cascade,
 ministry_email boolean not null default false,
 faith_boost_email boolean not null default false,
 book_release_email boolean not null default false,
 partner_email boolean not null default false,
 sms_updates boolean not null default false,
 sms_consent_at timestamptz,
 email_consent_at timestamptz,
 updated_at timestamptz not null default now()
);
alter table public.communication_preferences enable row level security;
create policy "communication_preferences_self_read" on public.communication_preferences for select to authenticated
using(profile_id=(select auth.uid()) or app_private.has_staff_role(array['super_admin','admin']));
create policy "communication_preferences_self_update" on public.communication_preferences for update to authenticated
using(profile_id=(select auth.uid())) with check(profile_id=(select auth.uid()));
grant select,update on public.communication_preferences to authenticated;

create table public.communication_preference_events (
 id bigint generated always as identity primary key,
 profile_id uuid not null references public.profiles(id) on delete cascade,
 preference_key text not null,
 old_value boolean,
 new_value boolean not null,
 source text not null default 'my-lockliel',
 created_at timestamptz not null default now()
);
create index communication_preference_events_profile_idx on public.communication_preference_events(profile_id,created_at desc);
alter table public.communication_preference_events enable row level security;
create policy "preference_events_self_read" on public.communication_preference_events for select to authenticated
using(profile_id=(select auth.uid()) or app_private.has_staff_role(array['super_admin','admin']));
grant select on public.communication_preference_events to authenticated;

create or replace function app_private.create_default_communication_preferences()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
begin
 insert into public.communication_preferences(profile_id)
 values(new.id)
 on conflict(profile_id) do nothing;
 return new;
end;
$$;
revoke all on function app_private.create_default_communication_preferences() from public,anon,authenticated;
drop trigger if exists on_profile_create_communication_preferences on public.profiles;
create trigger on_profile_create_communication_preferences
after insert on public.profiles
for each row execute function app_private.create_default_communication_preferences();

insert into public.communication_preferences(profile_id)
select id from public.profiles
on conflict(profile_id) do nothing;

create or replace function app_private.audit_communication_preferences()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
begin
 if old.ministry_email is distinct from new.ministry_email then
   insert into public.communication_preference_events(profile_id,preference_key,old_value,new_value) values(new.profile_id,'ministry_email',old.ministry_email,new.ministry_email);
 end if;
 if old.faith_boost_email is distinct from new.faith_boost_email then
   insert into public.communication_preference_events(profile_id,preference_key,old_value,new_value) values(new.profile_id,'faith_boost_email',old.faith_boost_email,new.faith_boost_email);
 end if;
 if old.book_release_email is distinct from new.book_release_email then
   insert into public.communication_preference_events(profile_id,preference_key,old_value,new_value) values(new.profile_id,'book_release_email',old.book_release_email,new.book_release_email);
 end if;
 if old.partner_email is distinct from new.partner_email then
   insert into public.communication_preference_events(profile_id,preference_key,old_value,new_value) values(new.profile_id,'partner_email',old.partner_email,new.partner_email);
 end if;
 if old.sms_updates is distinct from new.sms_updates then
   insert into public.communication_preference_events(profile_id,preference_key,old_value,new_value) values(new.profile_id,'sms_updates',old.sms_updates,new.sms_updates);
 end if;
 new.updated_at:=now();
 if new.sms_updates and not old.sms_updates then new.sms_consent_at:=now(); end if;
 if (new.ministry_email or new.faith_boost_email or new.book_release_email or new.partner_email)
    and not (old.ministry_email or old.faith_boost_email or old.book_release_email or old.partner_email)
 then new.email_consent_at:=now(); end if;
 return new;
end;
$$;
revoke all on function app_private.audit_communication_preferences() from public,anon,authenticated;
drop trigger if exists audit_communication_preferences_trigger on public.communication_preferences;
create trigger audit_communication_preferences_trigger
before update on public.communication_preferences
for each row execute function app_private.audit_communication_preferences();

create or replace function app_private.sync_lead_consent_to_preferences()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
declare
 has_faith_boost boolean;
 has_book_release boolean;
begin
 if new.linked_profile_id is null then return new; end if;

 select exists(
   select 1 from public.lead_sources ls
   where ls.lead_id=new.id
     and ls.source_type='faith_boost'
     and coalesce((ls.consent->>'email')::boolean,false)=true
 ) into has_faith_boost;

 select exists(
   select 1 from public.lead_sources ls
   where ls.lead_id=new.id
     and ls.source_type='book_interest'
     and coalesce((ls.consent->>'releaseNotifications')::boolean,false)=true
 ) into has_book_release;

 update public.communication_preferences
 set faith_boost_email=faith_boost_email or has_faith_boost,
     ministry_email=ministry_email or has_faith_boost,
     book_release_email=book_release_email or has_book_release,
     email_consent_at=case when has_faith_boost or has_book_release then coalesce(email_consent_at,now()) else email_consent_at end,
     updated_at=now()
 where profile_id=new.linked_profile_id;

 return new;
end;
$$;
revoke all on function app_private.sync_lead_consent_to_preferences() from public,anon,authenticated;
drop trigger if exists on_lead_contact_sync_consent on public.lead_contacts;
create trigger on_lead_contact_sync_consent
after update of linked_profile_id on public.lead_contacts
for each row when (new.linked_profile_id is not null)
execute function app_private.sync_lead_consent_to_preferences();
