update public.lead_contacts
set email=lower(trim(email))
where email is distinct from lower(trim(email));

alter table public.lead_contacts
  drop constraint if exists lead_contacts_email_key,
  add constraint lead_contacts_email_key unique(email);

alter table public.lead_contacts
  drop constraint if exists lead_contacts_email_format,
  add constraint lead_contacts_email_format
    check (
      char_length(email)<=254
      and email=lower(trim(email))
      and email ~ '^[^[:space:]<>@]+@[^[:space:]<>@]+\.[^[:space:]<>@]+$'
    );

alter table public.lead_contacts
  drop constraint if exists lead_contacts_first_name_length,
  add constraint lead_contacts_first_name_length
    check (first_name is null or char_length(first_name)<=120);

alter table public.lead_contacts
  drop constraint if exists lead_contacts_last_name_length,
  add constraint lead_contacts_last_name_length
    check (last_name is null or char_length(last_name)<=120);

alter table public.lead_contacts
  drop constraint if exists lead_contacts_phone_length,
  add constraint lead_contacts_phone_length
    check (phone is null or char_length(phone)<=60);

create or replace function app_private.normalize_lead_contact_identity()
returns trigger
language plpgsql
set search_path to ''
as $function$
begin
  if tg_op='UPDATE' and old.id is distinct from new.id then
    raise exception 'Lead contact identity cannot be changed.';
  end if;

  new.email:=lower(trim(new.email));
  new.first_name:=nullif(trim(coalesce(new.first_name,'')),'');
  new.last_name:=nullif(trim(coalesce(new.last_name,'')),'');
  new.phone:=nullif(trim(coalesce(new.phone,'')),'');
  return new;
end;
$function$;

revoke execute on function app_private.normalize_lead_contact_identity()
from public, anon, authenticated;

drop trigger if exists normalize_lead_contact_identity_trigger
on public.lead_contacts;

create trigger normalize_lead_contact_identity_trigger
before insert or update of email, first_name, last_name, phone
on public.lead_contacts
for each row
execute function app_private.normalize_lead_contact_identity();

alter table public.lead_sources
  drop constraint if exists lead_sources_source_type_check,
  add constraint lead_sources_source_type_check
    check (
      source_type in (
        'faith_boost',
        'book_interest',
        'website_interest',
        'founders50'
      )
    );

alter table public.lead_sources
  drop constraint if exists lead_sources_source_ref_length,
  add constraint lead_sources_source_ref_length
    check (source_ref is null or char_length(source_ref)<=240);

alter table public.lead_sources
  drop constraint if exists lead_sources_campaign_length,
  add constraint lead_sources_campaign_length
    check (campaign is null or char_length(campaign)<=120);

alter table public.lead_sources
  drop constraint if exists lead_sources_attribution_object,
  add constraint lead_sources_attribution_object
    check (
      jsonb_typeof(attribution)='object'
      and octet_length(attribution::text)<=25000
    );

alter table public.lead_sources
  drop constraint if exists lead_sources_consent_object,
  add constraint lead_sources_consent_object
    check (
      jsonb_typeof(consent)='object'
      and octet_length(consent::text)<=25000
    );

alter table public.founders50_applications
  drop constraint if exists founders50_first_name_length,
  add constraint founders50_first_name_length
    check (char_length(first_name) between 1 and 120);

alter table public.founders50_applications
  drop constraint if exists founders50_last_name_length,
  add constraint founders50_last_name_length
    check (char_length(last_name) between 1 and 120);

alter table public.founders50_applications
  drop constraint if exists founders50_email_format,
  add constraint founders50_email_format
    check (
      char_length(email)<=254
      and email=lower(trim(email))
      and email ~ '^[^[:space:]<>@]+@[^[:space:]<>@]+\.[^[:space:]<>@]+$'
    );

alter table public.founders50_applications
  drop constraint if exists founders50_phone_length,
  add constraint founders50_phone_length
    check (phone is null or char_length(phone)<=60);

alter table public.founders50_applications
  drop constraint if exists founders50_city_length,
  add constraint founders50_city_length
    check (city is null or char_length(city)<=160);

alter table public.founders50_applications
  drop constraint if exists founders50_region_length,
  add constraint founders50_region_length
    check (region is null or char_length(region)<=160);

alter table public.founders50_applications
  drop constraint if exists founders50_country_length,
  add constraint founders50_country_length
    check (country is null or char_length(country)<=160);

alter table public.founders50_applications
  drop constraint if exists founders50_church_affiliation_length,
  add constraint founders50_church_affiliation_length
    check (church_affiliation is null or char_length(church_affiliation)<=500);

alter table public.founders50_applications
  drop constraint if exists founders50_faith_background_length,
  add constraint founders50_faith_background_length
    check (faith_background is null or char_length(faith_background)<=3000);

alter table public.founders50_applications
  drop constraint if exists founders50_ministry_experience_length,
  add constraint founders50_ministry_experience_length
    check (ministry_experience is null or char_length(ministry_experience)<=3000);

alter table public.founders50_applications
  drop constraint if exists founders50_gathering_place_length,
  add constraint founders50_gathering_place_length
    check (gathering_place is null or char_length(gathering_place)<=1000);

alter table public.founders50_applications
  drop constraint if exists founders50_invite_count_length,
  add constraint founders50_invite_count_length
    check (invite_count is null or char_length(invite_count)<=100);

alter table public.founders50_applications
  drop constraint if exists founders50_why_interested_length,
  add constraint founders50_why_interested_length
    check (why_interested is not null and char_length(why_interested) between 1 and 5000);

alter table public.founders50_applications
  drop constraint if exists founders50_what_excites_length,
  add constraint founders50_what_excites_length
    check (what_excites_you is not null and char_length(what_excites_you) between 1 and 5000);

alter table public.founders50_applications
  drop constraint if exists founders50_share_with_five_length,
  add constraint founders50_share_with_five_length
    check (share_with_five is null or char_length(share_with_five)<=500);

alter table public.founders50_applications
  drop constraint if exists founders50_gather_weekly_length,
  add constraint founders50_gather_weekly_length
    check (gather_weekly is null or char_length(gather_weekly)<=500);

alter table public.founders50_applications
  drop constraint if exists founders50_growth_interests_check,
  add constraint founders50_growth_interests_check
    check (
      cardinality(growth_interests)<=20
      and growth_interests <@ array[
        'biblical-foundations',
        'identity-in-christ',
        'prayer',
        'faith-development',
        'evangelism',
        'discipleship',
        'leadership',
        'healing-wholeness',
        'family-relationships'
      ]::text[]
    );
