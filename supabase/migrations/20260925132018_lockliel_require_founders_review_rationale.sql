alter table public.founders50_reviews
  drop constraint if exists founders50_reviews_decision_rationale,
  add constraint founders50_reviews_decision_rationale
    check (
      decision='note'
      or char_length(trim(coalesce(rationale,'')))>=20
    );
