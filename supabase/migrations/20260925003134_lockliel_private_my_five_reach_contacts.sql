
create table public.reach_contacts (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references public.profiles(id) on delete cascade,
 display_name text not null check(char_length(display_name) between 1 and 120),
 relationship_context text,
 status text not null default 'praying' check(status in ('praying','invited','connected','growing','paused','completed')),
 linked_profile_id uuid references public.profiles(id) on delete set null,
 last_shared_at timestamptz,
 last_follow_up_at timestamptz,
 next_follow_up_at timestamptz,
 private_notes text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index reach_contacts_owner_status_idx on public.reach_contacts(owner_id,status,updated_at desc);
create index reach_contacts_linked_profile_idx on public.reach_contacts(linked_profile_id);

alter table public.reach_contacts enable row level security;
create policy "reach_contacts_owner_select" on public.reach_contacts for select to authenticated
using(owner_id=(select auth.uid()));
create policy "reach_contacts_owner_insert" on public.reach_contacts for insert to authenticated
with check(owner_id=(select auth.uid()));
create policy "reach_contacts_owner_update" on public.reach_contacts for update to authenticated
using(owner_id=(select auth.uid())) with check(owner_id=(select auth.uid()));
create policy "reach_contacts_owner_delete" on public.reach_contacts for delete to authenticated
using(owner_id=(select auth.uid()));
grant select,insert,update,delete on public.reach_contacts to authenticated;

create or replace function app_private.sync_member_reach_counts()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
declare uid uuid;
begin
 uid:=coalesce(new.owner_id,old.owner_id);
 update public.member_journey
 set reach_one_count=(
   select count(*)::int
   from public.reach_contacts rc
   where rc.owner_id=uid and rc.status in ('invited','connected','growing','completed')
 ),
 updated_at=now()
 where profile_id=uid;
 return coalesce(new,old);
end;
$$;
revoke all on function app_private.sync_member_reach_counts() from public,anon,authenticated;

drop trigger if exists sync_member_reach_counts_trigger on public.reach_contacts;
create trigger sync_member_reach_counts_trigger
after insert or update or delete on public.reach_contacts
for each row execute function app_private.sync_member_reach_counts();
