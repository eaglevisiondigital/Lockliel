create unique index referral_events_unique_visitor_visit_uidx
  on public.referral_events(referral_link_id, visitor_key)
  where event_type='visit'
    and referral_link_id is not null
    and visitor_key is not null;
