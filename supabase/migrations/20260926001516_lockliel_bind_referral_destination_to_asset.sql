alter table public.referral_links
  drop constraint if exists referral_links_destination_local_path,
  add constraint referral_links_destination_local_path
    check (
      char_length(destination_path)>=1
      and char_length(destination_path)<=500
      and left(destination_path,1)='/'
      and left(destination_path,2)<>'//'
    );

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
    (
      campaign='share-center'
      and reach_contact_id is null
    )
    or (
      campaign='share-center-my-five'
      and reach_contact_id is not null
    )
  )
  and exists(
    select 1
    from public.share_assets sa
    where sa.id::text=referral_links.content_id
      and sa.status='active'
      and sa.asset_type=referral_links.content_type
      and sa.destination_path=referral_links.destination_path
  )
);
