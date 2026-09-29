
create table public.profile_connection_cards (
 profile_id uuid primary key references public.profiles(id) on delete cascade,
 first_name text,
 last_initial text,
 city text,
 region text,
 country text,
 updated_at timestamptz not null default now()
);
alter table public.profile_connection_cards enable row level security;
create policy "connection_cards_allowed_read" on public.profile_connection_cards for select to authenticated
using(
 profile_id=(select auth.uid())
 or exists(
  select 1 from public.contact_permissions cp
  where cp.revoked_at is null
    and (
      (cp.profile_id=profile_connection_cards.profile_id and cp.other_profile_id=(select auth.uid()))
      or
      (cp.other_profile_id=profile_connection_cards.profile_id and cp.profile_id=(select auth.uid()))
    )
 )
);
grant select on public.profile_connection_cards to authenticated;

create policy "conversation_members_conversation_read" on public.conversation_members for select to authenticated
using(app_private.is_conversation_member(conversation_id));

create policy "followup_assignee_update" on public.follow_up_tasks for update to authenticated
using(assigned_to=(select auth.uid()))
with check(assigned_to=(select auth.uid()));
grant update on public.follow_up_tasks to authenticated;

create or replace function app_private.sync_profile_connection_card()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
begin
 insert into public.profile_connection_cards(profile_id,first_name,last_initial,city,region,country,updated_at)
 values(new.id,new.first_name,case when new.last_name is null or new.last_name='' then null else left(new.last_name,1) end,new.city,new.region,new.country,now())
 on conflict(profile_id) do update set
  first_name=excluded.first_name,
  last_initial=excluded.last_initial,
  city=excluded.city,
  region=excluded.region,
  country=excluded.country,
  updated_at=now();
 return new;
end;
$$;
revoke all on function app_private.sync_profile_connection_card() from public,anon,authenticated;

drop trigger if exists on_profile_sync_connection_card on public.profiles;
create trigger on_profile_sync_connection_card
after insert or update of first_name,last_name,city,region,country on public.profiles
for each row execute function app_private.sync_profile_connection_card();

insert into public.profile_connection_cards(profile_id,first_name,last_initial,city,region,country)
select id,first_name,case when last_name is null or last_name='' then null else left(last_name,1) end,city,region,country
from public.profiles
on conflict(profile_id) do nothing;
