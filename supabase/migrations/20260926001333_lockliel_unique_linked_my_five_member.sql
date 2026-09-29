create unique index if not exists reach_contacts_owner_linked_profile_uidx
on public.reach_contacts(owner_id,linked_profile_id)
where linked_profile_id is not null;
