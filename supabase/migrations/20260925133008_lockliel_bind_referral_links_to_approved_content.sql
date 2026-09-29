drop policy if exists referral_links_owner_insert
on public.referral_links;

create policy referral_links_owner_insert
on public.referral_links
for insert
to authenticated
with check (
  owner_id=(select auth.uid())
  and campaign in ('share-center','share-center-my-five')
  and (
    (campaign='share-center' and reach_contact_id is null)
    or
    (campaign='share-center-my-five' and reach_contact_id is not null)
  )
  and exists(
    select 1
    from public.share_assets sa
    where sa.id::text=content_id
      and sa.status='active'
      and sa.asset_type=content_type
      and sa.destination_path=destination_path
  )
);

drop policy if exists referral_links_owner_update
on public.referral_links;

drop policy if exists referral_links_owner_delete
on public.referral_links;

alter table public.referral_links
  drop constraint if exists referral_links_code_format,
  add constraint referral_links_code_format
    check (code ~ '^[a-z0-9]{6,20}$');

alter table public.referral_links
  drop constraint if exists referral_links_destination_path_check,
  add constraint referral_links_destination_path_check
    check (
      char_length(destination_path) between 1 and 500
      and left(destination_path,1)='/'
    );

create or replace function app_private.validate_referral_link_content()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
begin
  if new.campaign='member-invite' then
    if new.content_type<>'invitation'
       or new.destination_path<>'/my-lockliel/sign-up'
       or new.content_id is not null
       or new.reach_contact_id is not null then
      raise exception 'Default member invitation links must use the canonical Lockliel sign-up destination.';
    end if;

    new.active:=true;
    return new;
  end if;

  if new.campaign not in ('share-center','share-center-my-five') then
    raise exception 'Member referral links must be created from the approved Share Center.';
  end if;

  if new.campaign='share-center'
     and new.reach_contact_id is not null then
    raise exception 'General Share Center links cannot be attached to a My Five person.';
  end if;

  if new.campaign='share-center-my-five'
     and new.reach_contact_id is null then
    raise exception 'My Five Share Center links require an active My Five person.';
  end if;

  if not exists(
    select 1
    from public.share_assets sa
    where sa.id::text=new.content_id
      and sa.status='active'
      and sa.asset_type=new.content_type
      and sa.destination_path=new.destination_path
  ) then
    raise exception 'Referral links must match an active approved Share Library resource.';
  end if;

  new.active:=true;
  return new;
end;
$function$;

revoke execute on function app_private.validate_referral_link_content()
from public, anon, authenticated;

drop trigger if exists validate_referral_link_content_trigger
on public.referral_links;

create trigger validate_referral_link_content_trigger
before insert on public.referral_links
for each row
execute function app_private.validate_referral_link_content();
