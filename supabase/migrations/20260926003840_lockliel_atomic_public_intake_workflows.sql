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

  if _source_ref is not null then
    insert into public.lead_sources(
      lead_id,source_type,source_ref,campaign,attribution,consent
    )
    values(
      _lead_id,_source_type,_source_ref,_campaign,_attribution,_consent
    )
    on conflict(lead_id,source_type,source_ref)
      where source_ref is not null
    do nothing
    returning id into _source_id;

    return query select _lead_id, (_source_id is null);
    return;
  end if;

  select ls.id
  into _source_id
  from public.lead_sources ls
  where ls.lead_id=_lead_id
    and ls.source_type=_source_type
    and ls.campaign is not distinct from _campaign
    and ls.created_at>=now()-interval '15 minutes'
  order by ls.created_at desc
  limit 1;

  if _source_id is not null then
    return query select _lead_id,true;
    return;
  end if;

  insert into public.lead_sources(
    lead_id,source_type,source_ref,campaign,attribution,consent
  )
  values(
    _lead_id,_source_type,null,_campaign,_attribution,_consent
  );

  return query select _lead_id,false;
end;
$function$;

revoke all on function public.capture_public_lead_atomic(
  text,text,text,text,text,text,text,jsonb,jsonb
) from public, anon, authenticated;

grant execute on function public.capture_public_lead_atomic(
  text,text,text,text,text,text,text,jsonb,jsonb
) to service_role;


create or replace function public.submit_public_founders50_application_atomic(
  application_input jsonb
)
returns table(submitted_application_id uuid, is_duplicate boolean)
language plpgsql
security invoker
set search_path to ''
as $function$
declare
  _application_id uuid;
  _lead_id uuid;
  _normalized_email text;
  _first_name text;
  _last_name text;
  _phone text;
  _faith_stage text;
  _interest_path text;
  _why_interested text;
  _what_excites text;
  _growth_interests text[];
  _training_willingness boolean;
  _duplicate boolean:=false;
  _recruiting_enabled boolean:=false;
begin
  if application_input is null
     or jsonb_typeof(application_input)<>'object' then
    raise exception 'Invalid Founders 50 application.';
  end if;

  select f.enabled
  into _recruiting_enabled
  from public.feature_flags f
  where f.key='founders50_public_recruiting'
  limit 1;

  if coalesce(_recruiting_enabled,false) is not true then
    raise exception 'Founders 50 applications are closed.';
  end if;

  _normalized_email:=lower(trim(coalesce(application_input->>'email','')));
  _first_name:=trim(coalesce(application_input->>'first_name',''));
  _last_name:=trim(coalesce(application_input->>'last_name',''));
  _phone:=nullif(trim(coalesce(application_input->>'phone','')),'');
  _faith_stage:=nullif(trim(coalesce(application_input->>'faith_stage','')),'');
  _interest_path:=nullif(trim(coalesce(application_input->>'interest_path','')),'');
  _why_interested:=trim(coalesce(application_input->>'why_interested',''));
  _what_excites:=trim(coalesce(application_input->>'what_excites_you',''));

  if _normalized_email=''
     or char_length(_normalized_email)>254
     or _normalized_email !~ '^[^[:space:]<>@]+@[^[:space:]<>@]+\.[^[:space:]<>@]+$'
     or _first_name=''
     or _last_name=''
     or _why_interested=''
     or _what_excites='' then
    raise exception 'Invalid Founders 50 application.';
  end if;

  if application_input ? 'growth_interests'
     and jsonb_typeof(application_input->'growth_interests')<>'array' then
    raise exception 'Invalid Founders 50 growth interests.';
  end if;

  select coalesce(array_agg(x.value order by x.value),'{}'::text[])
  into _growth_interests
  from (
    select distinct value
    from jsonb_array_elements_text(
      case
        when jsonb_typeof(application_input->'growth_interests')='array'
          then application_input->'growth_interests'
        else '[]'::jsonb
      end
    )
  ) x;

  _training_willingness:=
    case
      when jsonb_typeof(application_input->'training_willingness')='boolean'
        then (application_input->>'training_willingness')::boolean
      else null
    end;

  select fa.id
  into _application_id
  from public.founders50_applications fa
  where fa.email=_normalized_email
    and fa.status not in ('withdrawn','declined')
  order by fa.created_at desc
  limit 1;

  if _application_id is null then
    begin
      insert into public.founders50_applications(
        profile_id,first_name,last_name,email,phone,city,region,country,
        church_affiliation,faith_stage,faith_background,ministry_experience,
        interest_path,growth_interests,gathering_place,invite_count,
        why_interested,what_excites_you,share_with_five,gather_weekly,
        training_willingness,status,source_campaign
      )
      values(
        null,_first_name,_last_name,_normalized_email,_phone,
        nullif(trim(coalesce(application_input->>'city','')),''),
        nullif(trim(coalesce(application_input->>'region','')),''),
        nullif(trim(coalesce(application_input->>'country','')),''),
        nullif(trim(coalesce(application_input->>'church_affiliation','')),''),
        _faith_stage,
        nullif(trim(coalesce(application_input->>'faith_background','')),''),
        nullif(trim(coalesce(application_input->>'ministry_experience','')),''),
        _interest_path,_growth_interests,
        nullif(trim(coalesce(application_input->>'gathering_place','')),''),
        nullif(trim(coalesce(application_input->>'invite_count','')),''),
        _why_interested,_what_excites,
        nullif(trim(coalesce(application_input->>'share_with_five','')),''),
        nullif(trim(coalesce(application_input->>'gather_weekly','')),''),
        _training_willingness,'applied','founders50'
      )
      returning id into _application_id;
    exception
      when unique_violation then
        select fa.id
        into _application_id
        from public.founders50_applications fa
        where fa.email=_normalized_email
          and fa.status not in ('withdrawn','declined')
        order by fa.created_at desc
        limit 1;

        if _application_id is null then
          raise;
        end if;
        _duplicate:=true;
    end;
  else
    _duplicate:=true;
  end if;

  _lead_id:=public.upsert_public_lead_contact(
    _normalized_email,_first_name,_last_name,_phone,null
  );

  insert into public.lead_sources(
    lead_id,source_type,source_ref,campaign,attribution,consent
  )
  values(
    _lead_id,'founders50',_application_id::text,'founders50',
    jsonb_build_object('entry','website','interest_path',_interest_path),
    jsonb_build_object(
      'purpose','founders50_followup',
      'submitted',true,
      'faith_context_self_reported',true
    )
  )
  on conflict(lead_id,source_type,source_ref)
    where source_ref is not null
  do nothing;

  return query select _application_id,_duplicate;
end;
$function$;

revoke all on function public.submit_public_founders50_application_atomic(jsonb)
from public, anon, authenticated;

grant execute on function public.submit_public_founders50_application_atomic(jsonb)
to service_role;
