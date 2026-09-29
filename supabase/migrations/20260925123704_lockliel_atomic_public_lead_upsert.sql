create or replace function public.upsert_public_lead_contact(
  email_input text,
  first_name_input text,
  last_name_input text default null,
  phone_input text default null,
  linked_profile_input uuid default null
)
returns uuid
language plpgsql
security definer
set search_path to ''
as $function$
declare
  lead_id uuid;
  normalized_email text;
begin
  normalized_email:=lower(trim(email_input));

  if normalized_email is null
     or normalized_email=''
     or char_length(normalized_email)>254
     or normalized_email !~ '^[^[:space:]<>@]+@[^[:space:]<>@]+\.[^[:space:]<>@]+$'
     or nullif(trim(first_name_input),'') is null then
    raise exception 'Invalid lead identity.';
  end if;

  insert into public.lead_contacts(
    email,
    first_name,
    last_name,
    phone,
    linked_profile_id
  )
  values(
    normalized_email,
    left(trim(first_name_input),120),
    nullif(left(trim(coalesce(last_name_input,'')),120),''),
    nullif(left(trim(coalesce(phone_input,'')),60),''),
    linked_profile_input
  )
  on conflict(email)
  do update set
    first_name=excluded.first_name,
    last_name=coalesce(excluded.last_name,public.lead_contacts.last_name),
    phone=coalesce(excluded.phone,public.lead_contacts.phone),
    linked_profile_id=coalesce(
      excluded.linked_profile_id,
      public.lead_contacts.linked_profile_id
    ),
    updated_at=now()
  returning id into lead_id;

  return lead_id;
end;
$function$;

revoke all on function public.upsert_public_lead_contact(
  text,text,text,text,uuid
)
from public, anon, authenticated;

grant execute on function public.upsert_public_lead_contact(
  text,text,text,text,uuid
)
to service_role;
