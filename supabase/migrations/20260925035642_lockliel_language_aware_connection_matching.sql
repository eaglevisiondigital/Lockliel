
alter table public.profile_connection_cards
  add column if not exists language_code text not null default 'en';

alter table public.leader_profiles
  add column if not exists language_code text not null default 'en';

create index if not exists connection_cards_language_location_idx
  on public.profile_connection_cards(language_code,country,region,city);

create index if not exists leader_profiles_language_location_idx
  on public.leader_profiles(language_code,country,region,city,active);

create or replace function app_private.sync_profile_connection_card()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
declare
  lang text;
begin
 lang:=lower(split_part(coalesce(new.locale,'en-US'),'-',1));
 if lang is null or lang='' then lang:='en'; end if;

 insert into public.profile_connection_cards(
   profile_id,
   first_name,
   last_initial,
   city,
   region,
   country,
   language_code,
   updated_at
 )
 values(
   new.id,
   new.first_name,
   case when new.last_name is null or new.last_name='' then null else left(new.last_name,1) end,
   new.city,
   new.region,
   new.country,
   lang,
   now()
 )
 on conflict(profile_id) do update set
  first_name=excluded.first_name,
  last_initial=excluded.last_initial,
  city=excluded.city,
  region=excluded.region,
  country=excluded.country,
  language_code=excluded.language_code,
  updated_at=now();

 return new;
end;
$$;

revoke all on function app_private.sync_profile_connection_card()
from public,anon,authenticated;

drop trigger if exists on_profile_sync_connection_card on public.profiles;
create trigger on_profile_sync_connection_card
after insert or update of first_name,last_name,city,region,country,locale
on public.profiles
for each row execute function app_private.sync_profile_connection_card();

update public.profile_connection_cards c
set language_code=coalesce(
  nullif(lower(split_part(p.locale,'-',1)),''),
  'en'
)
from public.profiles p
where p.id=c.profile_id;

update public.leader_profiles lp
set language_code=coalesce(c.language_code,'en')
from public.profile_connection_cards c
where c.profile_id=lp.profile_id;

update public.groups g
set language_code=coalesce(c.language_code,'en')
from public.profile_connection_cards c
where c.profile_id=g.leader_id;
