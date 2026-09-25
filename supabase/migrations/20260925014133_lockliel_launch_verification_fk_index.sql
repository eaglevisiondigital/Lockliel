
create index if not exists launch_verifications_verified_by_idx
  on public.launch_verifications(verified_by);
