
alter table public.gifts add column if not exists donor_email text;
alter table public.gifts add column if not exists donor_name text;

create table if not exists public.profile_finance_cards (
 profile_id uuid primary key references public.profiles(id) on delete cascade,
 display_name text,
 email text,
 city text,
 region text,
 country text,
 updated_at timestamptz not null default now()
);
alter table public.profile_finance_cards enable row level security;
drop policy if exists "finance_cards_staff_read" on public.profile_finance_cards;
create policy "finance_cards_staff_read" on public.profile_finance_cards for select to authenticated
using(app_private.has_staff_role(array['super_admin','admin','finance_admin']));
grant select on public.profile_finance_cards to authenticated;

create or replace function app_private.sync_profile_finance_card()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
begin
 insert into public.profile_finance_cards(profile_id,display_name,email,city,region,country,updated_at)
 values(new.id,trim(coalesce(new.first_name,'') || ' ' || coalesce(new.last_name,'')),new.email,new.city,new.region,new.country,now())
 on conflict(profile_id) do update set
  display_name=excluded.display_name,
  email=excluded.email,
  city=excluded.city,
  region=excluded.region,
  country=excluded.country,
  updated_at=now();
 return new;
end;
$$;
revoke all on function app_private.sync_profile_finance_card() from public,anon,authenticated;

drop trigger if exists on_profile_sync_finance_card on public.profiles;
create trigger on_profile_sync_finance_card
after insert or update of first_name,last_name,email,city,region,country on public.profiles
for each row execute function app_private.sync_profile_finance_card();

insert into public.profile_finance_cards(profile_id,display_name,email,city,region,country)
select id,trim(coalesce(first_name,'') || ' ' || coalesce(last_name,'')),email,city,region,country
from public.profiles
on conflict(profile_id) do nothing;

drop policy if exists "benefit_rules_staff_update" on public.benefit_rules;
create policy "benefit_rules_staff_update" on public.benefit_rules for update to authenticated
using(app_private.has_staff_role(array['super_admin','admin','finance_admin']))
with check(app_private.has_staff_role(array['super_admin','admin','finance_admin']));
grant update on public.benefit_rules to authenticated;
