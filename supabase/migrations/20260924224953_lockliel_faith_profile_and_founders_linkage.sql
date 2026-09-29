
create table public.faith_profiles (
 profile_id uuid primary key references public.profiles(id) on delete cascade,
 faith_stage text,
 church_background text,
 ministry_experience text,
 growth_interests text[] not null default '{}',
 wants_group boolean,
 wants_host boolean,
 preferred_connection text,
 notes jsonb not null default '{}'::jsonb,
 updated_at timestamptz not null default now()
);
alter table public.faith_profiles enable row level security;
create policy "faith_profile_self_read" on public.faith_profiles for select to authenticated
using(profile_id=(select auth.uid()));
create policy "faith_profile_self_insert" on public.faith_profiles for insert to authenticated
with check(profile_id=(select auth.uid()));
create policy "faith_profile_self_update" on public.faith_profiles for update to authenticated
using(profile_id=(select auth.uid())) with check(profile_id=(select auth.uid()));
grant select,insert,update on public.faith_profiles to authenticated;

create index idx_faith_profiles_stage on public.faith_profiles(faith_stage);

create or replace function app_private.link_existing_founders50_application()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
begin
  update public.founders50_applications
  set profile_id=new.id, updated_at=now()
  where profile_id is null and lower(email)=lower(new.email);
  return new;
end;
$$;
revoke all on function app_private.link_existing_founders50_application() from public,anon,authenticated;

drop trigger if exists on_profile_link_founders50 on public.profiles;
create trigger on_profile_link_founders50
after insert on public.profiles
for each row execute function app_private.link_existing_founders50_application();
