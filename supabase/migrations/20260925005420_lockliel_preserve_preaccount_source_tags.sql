
create or replace function app_private.sync_lead_sources_to_profile_tags()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
begin
  if new.linked_profile_id is null then return new; end if;

  insert into public.profile_tags(profile_id,tag_id,source)
  select
    new.linked_profile_id,
    t.id,
    'lead-source'
  from public.lead_sources ls
  join public.tags t
    on t.slug = case ls.source_type
      when 'faith_boost' then 'faith-boost'
      when 'book_interest' then 'book-interest'
      when 'founders50' then 'founders-50'
      else null
    end
  where ls.lead_id=new.id
  on conflict(profile_id,tag_id)
  do update set source=excluded.source;

  return new;
end;
$$;

revoke all on function app_private.sync_lead_sources_to_profile_tags() from public,anon,authenticated;

drop trigger if exists on_lead_contact_sync_source_tags on public.lead_contacts;
create trigger on_lead_contact_sync_source_tags
after update of linked_profile_id on public.lead_contacts
for each row
when (new.linked_profile_id is not null)
execute function app_private.sync_lead_sources_to_profile_tags();
