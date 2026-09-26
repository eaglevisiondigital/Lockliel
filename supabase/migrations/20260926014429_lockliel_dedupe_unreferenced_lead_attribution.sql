with ranked as (
  select
    id,
    row_number() over(
      partition by lead_id,source_type,coalesce(campaign,'')
      order by created_at,id
    ) as rn
  from public.lead_sources
  where source_ref is null
)
delete from public.lead_sources ls
using ranked r
where ls.id=r.id
  and r.rn>1;

create unique index lead_sources_unique_unreferenced_attribution_uidx
on public.lead_sources(
  lead_id,
  source_type,
  (coalesce(campaign,''))
)
where source_ref is null;

create or replace function public.capture_public_lead_atomic(
  email_input text,
  first_name_input text,
  last_name_input text,
  phone_input text,
  source_type_input text,
  source_ref_input text,
  campaign_input text,
  attribution_input jsonb,
  consent_input jsonb
)
returns table(captured_lead_id uuid, is_duplicate boolean)
language plpgsql
security invoker
set search_path to ''
as $function$
declare
  _lead_id uuid;
  _source_id uuid;
  _source_type text;
  _source_ref text;
  _campaign text;
  _attribution jsonb;
  _consent jsonb;
begin
  _source_type:=trim(coalesce(source_type_input,''));
  _source_ref:=nullif(left(trim(coalesce(source_ref_input,'')),240),'');
  _campaign:=left(trim(coalesce(nullif(campaign_input,''),_source_type)),120);
  _attribution:=coalesce(attribution_input,'{}'::jsonb);
  _consent:=coalesce(consent_input,'{}'::jsonb);

  if _source_type not in ('faith_boost','book_interest','website_interest') then
    raise exception 'Invalid public lead source type.';
  end if;

  if jsonb_typeof(_attribution)<>'object'
     or jsonb_typeof(_consent)<>'object' then
    raise exception 'Invalid public lead metadata.';
  end if;

  _lead_id:=public.upsert_public_lead_contact(
    email_input,
    first_name_input,
    last_name_input,
    phone_input,
    null
  );

  perform pg_advisory_xact_lock(
    hashtextextended(
      _lead_id::text||'|'||_source_type||'|'||_campaign,
      0
    )
  );

  insert into public.lead_sources(
    lead_id,source_type,source_ref,campaign,attribution,consent
  )
  values(
    _lead_id,_source_type,_source_ref,_campaign,_attribution,_consent
  )
  on conflict do nothing
  returning id into _source_id;

  return query select _lead_id,(_source_id is null);
end;
$function$;

revoke all on function public.capture_public_lead_atomic(
  text,text,text,text,text,text,text,jsonb,jsonb
) from public,anon,authenticated;

grant execute on function public.capture_public_lead_atomic(
  text,text,text,text,text,text,text,jsonb,jsonb
) to service_role;
