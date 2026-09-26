-- READ ONLY. Aggregate counts only; never return member identities.
-- Re-run immediately before a separately authorized release.
select jsonb_build_object(
  'profiles', (select jsonb_build_object(
    'total',count(*),
    'null_email',count(*) filter(where email is null),
    'unnormalized',count(*) filter(where email<>lower(trim(email))),
    'overlength',count(*) filter(where char_length(email)>254),
    'malformed',count(*) filter(where email is not null and email !~ '^[^[:space:]<>@]+@[^[:space:]<>@]+[.][^[:space:]<>@]+$'),
    'would_fail',count(*) filter(where not(email is null or
      (char_length(email)<=254 and email=lower(trim(email)) and
       email ~ '^[^[:space:]<>@]+@[^[:space:]<>@]+[.][^[:space:]<>@]+$')))
  ) from public.profiles),
  'normalization_collision_groups', (select count(*) from (
    select lower(trim(email)) from public.profiles where email is not null
    group by lower(trim(email)) having count(*)>1
  ) collisions),
  'auth', (select jsonb_build_object(
    'total',count(*),
    'normalized_would_fail',count(*) filter(where nullif(lower(trim(email)),'') is not null and
      (char_length(lower(trim(email)))>254 or lower(trim(email)) !~ '^[^[:space:]<>@]+@[^[:space:]<>@]+[.][^[:space:]<>@]+$'))
  ) from auth.users)
) as email_preflight;
