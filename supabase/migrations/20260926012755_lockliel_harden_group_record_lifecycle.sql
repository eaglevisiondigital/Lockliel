alter table public.groups
  add constraint groups_status_check
    check (status in ('forming','active')),
  add constraint groups_name_length
    check (char_length(trim(name)) between 1 and 200),
  add constraint groups_city_length
    check (city is null or char_length(city) between 1 and 160),
  add constraint groups_region_length
    check (region is null or char_length(region) between 1 and 160),
  add constraint groups_country_length
    check (country is null or char_length(country) between 1 and 160),
  add constraint groups_language_code_length
    check (char_length(language_code) between 2 and 35),
  add constraint groups_active_requires_leader
    check (status<>'active' or leader_id is not null);

create or replace function app_private.validate_group_leader_approval()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
begin
  if new.leader_id is null then
    if new.status='active' then
      raise exception 'Active groups require an approved primary leader.';
    end if;
    return new;
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(new.leader_id::text,0)
  );

  if not (
    exists(
      select 1
      from public.leader_profiles lp
      where lp.profile_id=new.leader_id
        and lp.active=true
        and lp.leader_type in ('group_leader','regional_leader')
    )
    or app_private.is_active_founders50_host(new.leader_id)
  ) then
    raise exception
      'Group leaders must be an approved group/regional leader or an active Founders 50 host.';
  end if;

  return new;
end;
$function$;

revoke execute on function app_private.validate_group_leader_approval()
from public,anon,authenticated;

create or replace function app_private.protect_group_identity()
returns trigger
language plpgsql
set search_path to ''
as $function$
begin
  new.name:=trim(new.name);
  new.city:=nullif(trim(coalesce(new.city,'')),'');
  new.region:=nullif(trim(coalesce(new.region,'')),'');
  new.country:=nullif(trim(coalesce(new.country,'')),'');
  new.language_code:=lower(trim(coalesce(new.language_code,'en')));

  if tg_op='UPDATE'
     and (
       old.id is distinct from new.id
       or old.created_at is distinct from new.created_at
     ) then
    raise exception 'Group identity fields cannot be changed after creation.';
  end if;

  return new;
end;
$function$;

revoke execute on function app_private.protect_group_identity()
from public,anon,authenticated;

drop trigger if exists protect_group_identity_trigger
on public.groups;

create trigger protect_group_identity_trigger
before insert or update
on public.groups
for each row
execute function app_private.protect_group_identity();
