-- The former double-escaped dot rejected ordinary emails with
-- standard_conforming_strings=on. [.] avoids SQL/regex escape ambiguity.
-- Prepared and tested locally only; production application needs a separate release.
alter table public.profiles
  drop constraint profiles_email_format,
  add constraint profiles_email_format
    check (
      email is null
      or (
        char_length(email)<=254
        and email=lower(trim(email))
        and email ~ '^[^[:space:]<>@]+@[^[:space:]<>@]+[.][^[:space:]<>@]+$'
      )
    );
