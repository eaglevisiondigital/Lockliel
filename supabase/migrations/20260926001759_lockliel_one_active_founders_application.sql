create unique index if not exists founders50_one_active_email_uidx
on public.founders50_applications(email)
where status not in ('withdrawn','declined');

create unique index if not exists founders50_one_active_profile_uidx
on public.founders50_applications(profile_id)
where profile_id is not null
  and status not in ('withdrawn','declined');
