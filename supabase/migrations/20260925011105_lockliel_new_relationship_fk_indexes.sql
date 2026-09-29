
create index if not exists checkout_sessions_order_idx
  on public.checkout_sessions(order_id);

create index if not exists leader_assignments_assigned_by_idx
  on public.leader_assignments(assigned_by);

create index if not exists leader_profiles_approved_by_idx
  on public.leader_profiles(approved_by);

create index if not exists payment_events_commitment_idx
  on public.payment_events(commitment_id);

create index if not exists payment_events_gift_idx
  on public.payment_events(gift_id);

create index if not exists payment_events_order_idx
  on public.payment_events(order_id);
