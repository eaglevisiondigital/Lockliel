alter table public.benefit_rules
  drop constraint if exists benefit_rules_valid_date_window,
  add constraint benefit_rules_valid_date_window
    check (
      starts_at is null
      or ends_at is null
      or starts_at<=ends_at
    );
