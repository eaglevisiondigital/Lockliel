
create table public.checkout_sessions (
 id uuid primary key default gen_random_uuid(),
 profile_id uuid references public.profiles(id) on delete set null,
 purpose text not null check(purpose in ('gift','partnership','order')),
 provider text not null check(provider in ('authorize_net','stripe','paypal','square')),
 provider_session_ref text,
 status text not null default 'created' check(status in ('created','pending','completed','expired','cancelled','failed')),
 amount_cents bigint,
 currency text not null default 'USD',
 designation text,
 campaign text,
 order_id uuid references public.orders(id) on delete set null,
 metadata jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),
 expires_at timestamptz,
 completed_at timestamptz
);
create unique index checkout_sessions_provider_ref_unique
  on public.checkout_sessions(provider,provider_session_ref)
  where provider_session_ref is not null;
create index checkout_sessions_profile_idx on public.checkout_sessions(profile_id,created_at desc);
create index checkout_sessions_status_idx on public.checkout_sessions(status,created_at desc);

create table public.payment_events (
 id bigint generated always as identity primary key,
 provider text not null check(provider in ('authorize_net','stripe','paypal','square')),
 provider_event_ref text not null,
 event_type text not null,
 status text not null default 'received' check(status in ('received','processing','processed','ignored','failed')),
 checkout_session_id uuid references public.checkout_sessions(id) on delete set null,
 gift_id uuid references public.gifts(id) on delete set null,
 order_id uuid references public.orders(id) on delete set null,
 commitment_id uuid references public.partner_commitments(id) on delete set null,
 payload_fingerprint text,
 safe_metadata jsonb not null default '{}'::jsonb,
 received_at timestamptz not null default now(),
 processed_at timestamptz,
 error_message text,
 unique(provider,provider_event_ref)
);
create index payment_events_status_idx on public.payment_events(status,received_at desc);
create index payment_events_checkout_idx on public.payment_events(checkout_session_id);

alter table public.checkout_sessions enable row level security;
alter table public.payment_events enable row level security;

create policy "checkout_sessions_self_finance_read" on public.checkout_sessions for select to authenticated
using(
  profile_id=(select auth.uid())
  or app_private.has_staff_role(array['super_admin','admin','finance_admin'])
);
create policy "payment_events_finance_read" on public.payment_events for select to authenticated
using(app_private.has_staff_role(array['super_admin','admin','finance_admin']));

grant select on public.checkout_sessions,public.payment_events to authenticated;

create or replace function app_private.audit_payment_event_failure()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
begin
  if new.status='failed' and old.status is distinct from new.status then
    insert into public.audit_events(
      actor_profile_id,event_type,entity_type,entity_id,summary,metadata
    )
    values(
      null,
      'payment_event_failed',
      'payment_event',
      new.id::text,
      'Payment provider event failed processing',
      jsonb_build_object(
        'provider',new.provider,
        'event_type',new.event_type,
        'provider_event_ref',new.provider_event_ref
      )
    );
  end if;
  return new;
end;
$$;
revoke all on function app_private.audit_payment_event_failure() from public,anon,authenticated;

drop trigger if exists audit_payment_event_failure_trigger on public.payment_events;
create trigger audit_payment_event_failure_trigger
after update of status on public.payment_events
for each row execute function app_private.audit_payment_event_failure();
