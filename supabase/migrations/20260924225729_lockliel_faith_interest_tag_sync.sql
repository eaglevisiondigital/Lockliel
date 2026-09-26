
insert into public.tags(slug,label,category) values
('faith-development','Faith Development','interest'),
('discipleship','Discipleship','interest'),
('healing-wholeness','Healing & Wholeness','interest'),
('family-relationships','Family & Relationships','interest')
on conflict(slug) do nothing;

create or replace function app_private.sync_faith_profile_interest_tags()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
declare slugs text[];
begin
  delete from public.profile_tags pt
  using public.tags t
  where pt.profile_id=new.profile_id
    and pt.tag_id=t.id
    and pt.source='faith-profile'
    and t.category='interest';

  slugs:=coalesce(new.growth_interests,'{}'::text[]);
  if new.wants_group then slugs:=array_append(slugs,'join-group'); end if;
  if new.wants_host then slugs:=array_append(slugs,'hosting'); end if;

  insert into public.profile_tags(profile_id,tag_id,source)
  select new.profile_id,t.id,'faith-profile'
  from public.tags t
  where t.category='interest' and t.slug=any(slugs)
  on conflict(profile_id,tag_id) do update set source=excluded.source;
  return new;
end;
$$;
revoke all on function app_private.sync_faith_profile_interest_tags() from public,anon,authenticated;

drop trigger if exists on_faith_profile_sync_tags on public.faith_profiles;
create trigger on_faith_profile_sync_tags
after insert or update on public.faith_profiles
for each row execute function app_private.sync_faith_profile_interest_tags();
