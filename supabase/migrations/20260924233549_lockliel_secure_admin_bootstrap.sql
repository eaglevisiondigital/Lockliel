
create table app_private.admin_bootstrap_tokens (
 id uuid primary key default gen_random_uuid(),
 token_hash text unique not null,
 expires_at timestamptz not null,
 used_at timestamptz,
 used_by uuid references public.profiles(id) on delete set null,
 created_at timestamptz not null default now()
);

insert into app_private.admin_bootstrap_tokens(token_hash,expires_at)
values('1317b9651b98bb5cb4c3eda27cbd23332de56255e7de49288f3d773bf5f73215',now()+interval '30 days');

create or replace function public.claim_initial_super_admin(p_token_hash text)
returns boolean
language plpgsql
security definer
set search_path=''
as $$
declare
  uid uuid := (select auth.uid());
  token_id uuid;
begin
  if uid is null then
    return false;
  end if;

  if exists(select 1 from public.staff_roles where role='super_admin') then
    return false;
  end if;

  update app_private.admin_bootstrap_tokens
    set used_at=now(), used_by=uid
    where token_hash=p_token_hash
      and used_at is null
      and expires_at>now()
    returning id into token_id;

  if token_id is null then
    return false;
  end if;

  insert into public.staff_roles(profile_id,role)
  values(uid,'super_admin')
  on conflict(profile_id,role) do nothing;

  insert into public.audit_events(actor_profile_id,event_type,entity_type,entity_id,summary,metadata)
  values(uid,'initial_super_admin_claimed','staff_role',uid::text,'Initial Lockliel super administrator established','{}'::jsonb);

  return true;
end;
$$;

revoke all on function public.claim_initial_super_admin(text) from public,anon;
grant execute on function public.claim_initial_super_admin(text) to authenticated;
