
create or replace function app_private.ensure_grip_enrollment()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
declare
  cid uuid;
  preferred_language text;
begin
  select lower(split_part(coalesce(p.locale,'en-US'),'-',1))
    into preferred_language
  from public.profiles p
  where p.id=new.profile_id;

  preferred_language:=coalesce(nullif(preferred_language,''),'en');

  select c.id
    into cid
  from public.courses c
  where c.translation_key='getting-a-grip-on-the-basics'
    and c.status='published'
    and c.language_code in (preferred_language,'en')
  order by
    case when c.language_code=preferred_language then 0 else 1 end,
    c.created_at asc
  limit 1;

  if cid is not null then
    insert into public.course_enrollments(profile_id,course_id,status)
    values(new.profile_id,cid,'active')
    on conflict(profile_id,course_id) do nothing;
  end if;

  return new;
end;
$$;

revoke all on function app_private.ensure_grip_enrollment()
from public,anon,authenticated;
