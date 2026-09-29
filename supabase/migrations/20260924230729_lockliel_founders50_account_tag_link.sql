
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

  if exists(select 1 from public.founders50_applications f where f.profile_id=new.id) then
    insert into public.profile_tags(profile_id,tag_id,source)
    select new.id,t.id,'founders50-application'
    from public.tags t where t.slug='founders-50'
    on conflict(profile_id,tag_id) do update set source=excluded.source;
  end if;
  return new;
end;
$$;
revoke all on function app_private.link_existing_founders50_application() from public,anon,authenticated;
