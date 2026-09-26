
alter table public.referral_events
  add constraint referral_events_visit_member_check
  check (event_type <> 'visit' or member_id is null) not valid;

create policy "anon_visit_insert" on public.referral_events
for insert to anon
with check (
  event_type='visit'
  and member_id is null
  and exists(
    select 1 from public.referral_links rl
    where rl.id=referral_link_id and rl.active=true
  )
);

grant insert on public.referral_events to anon;
grant usage, select on sequence public.referral_events_id_seq to anon;

create or replace function app_private.ensure_default_referral_link()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
begin
  insert into public.referral_links(owner_id,code,campaign,content_type,destination_path)
  values(
    new.id,
    lower(substr(replace(gen_random_uuid()::text,'-',''),1,10)),
    'member-invite',
    'invitation',
    '/my-lockliel/sign-up'
  )
  on conflict do nothing;
  return new;
end;
$$;
revoke all on function app_private.ensure_default_referral_link() from public, anon, authenticated;

drop trigger if exists on_profile_created_referral on public.profiles;
create trigger on_profile_created_referral
after insert on public.profiles
for each row execute function app_private.ensure_default_referral_link();
