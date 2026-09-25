
create or replace function app_private.sync_member_reach_counts()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
declare
  uid uuid;
  manual_count int;
  referral_count int;
begin
  uid:=coalesce(new.owner_id,old.owner_id);

  select count(*)::int into manual_count
  from public.reach_contacts rc
  where rc.owner_id=uid
    and rc.status in ('invited','connected','growing','completed');

  select count(distinct re.member_id)::int into referral_count
  from public.referral_events re
  join public.referral_links rl on rl.id=re.referral_link_id
  where rl.owner_id=uid
    and re.event_type='signup'
    and re.member_id is not null
    and not exists(
      select 1 from public.reach_contacts rc
      where rc.owner_id=uid
        and rc.linked_profile_id=re.member_id
        and rc.status in ('invited','connected','growing','completed')
    );

  update public.member_journey
  set reach_one_count=coalesce(manual_count,0)+coalesce(referral_count,0),
      updated_at=now()
  where profile_id=uid;

  return coalesce(new,old);
end;
$$;
