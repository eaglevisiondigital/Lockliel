alter table public.checkout_sessions
  add constraint checkout_sessions_completed_after_creation
    check (completed_at is null or completed_at>=created_at),
  add constraint checkout_sessions_completion_state
    check (
      (status='completed' and completed_at is not null)
      or
      (status<>'completed' and completed_at is null)
    );

alter table public.payment_events
  add constraint payment_events_processed_after_receipt
    check (processed_at is null or processed_at>=received_at),
  add constraint payment_events_processing_state
    check (
      (status in ('processed','ignored','failed') and processed_at is not null)
      or
      (status in ('received','processing') and processed_at is null)
    );

alter table public.gifts
  add constraint gifts_received_after_creation
    check (received_at is null or received_at>=created_at),
  add constraint gifts_success_timestamp
    check (
      status not in ('succeeded','paid','completed')
      or received_at is not null
    );

alter table public.orders
  add constraint orders_paid_after_creation
    check (paid_at is null or paid_at>=created_at),
  add constraint orders_fulfilled_after_creation
    check (fulfilled_at is null or fulfilled_at>=created_at),
  add constraint orders_fulfilled_after_payment
    check (
      fulfilled_at is null
      or paid_at is null
      or fulfilled_at>=paid_at
    ),
  add constraint orders_paid_state_timestamp
    check (
      status not in ('paid','fulfilled','partially_refunded','refunded')
      or paid_at is not null
    ),
  add constraint orders_fulfilled_timestamp
    check (status<>'fulfilled' or fulfilled_at is not null);

alter table public.partner_commitments
  add constraint partner_commitments_started_after_creation
    check (started_at is null or started_at>=created_at),
  add constraint partner_commitments_cancelled_after_creation
    check (cancelled_at is null or cancelled_at>=created_at),
  add constraint partner_commitments_cancelled_after_start
    check (
      cancelled_at is null
      or started_at is null
      or cancelled_at>=started_at
    ),
  add constraint partner_commitments_active_timestamp
    check (status<>'active' or started_at is not null),
  add constraint partner_commitments_closed_timestamp
    check (
      status not in ('cancelled','ended')
      or cancelled_at is not null
    );
