alter table public.profiles
  drop constraint if exists profiles_email_format,
  add constraint profiles_email_format
    check (
      email is null
      or (
        char_length(email)<=254
        and email=lower(trim(email))
        and email ~ '^[^[:space:]<>@]+@[^[:space:]<>@]+\\.[^[:space:]<>@]+$'
      )
    );

create unique index if not exists profiles_email_uidx
on public.profiles(email)
where email is not null;
