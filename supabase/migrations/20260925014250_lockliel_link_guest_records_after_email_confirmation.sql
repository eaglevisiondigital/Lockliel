
alter table public.partner_commitments
  add column if not exists donor_email text,
  add column if not exists donor_name text;

alter table public.orders
  add column if not exists customer_email text,
  add column if not exists customer_name text;

alter table public.checkout_sessions
  add column if not exists contact_email text,
  add column if not exists contact_name text;

create index if not exists partner_commitments_donor_email_idx
  on public.partner_commitments(lower(donor_email))
  where donor_email is not null;

create index if not exists orders_customer_email_idx
  on public.orders(lower(customer_email))
  where customer_email is not null;

create index if not exists checkout_sessions_contact_email_idx
  on public.checkout_sessions(lower(contact_email))
  where contact_email is not null;

create or replace function app_private.link_confirmed_financial_records_for_user(
  target_user uuid,
  target_email text
)
returns jsonb
language plpgsql
security definer
set search_path=''
as $$
declare
  gifts_count int := 0;
  commitments_count int := 0;
  orders_count int := 0;
  checkouts_count int := 0;
begin
  if target_user is null or nullif(trim(target_email),'') is null then
    return jsonb_build_object(
      'gifts',0,
      'commitments',0,
      'orders',0,
      'checkouts',0
    );
  end if;

  update public.gifts
  set profile_id=target_user
  where profile_id is null
    and donor_email is not null
    and lower(donor_email)=lower(target_email);
  get diagnostics gifts_count = row_count;

  update public.partner_commitments
  set profile_id=target_user
  where profile_id is null
    and donor_email is not null
    and lower(donor_email)=lower(target_email);
  get diagnostics commitments_count = row_count;

  update public.orders
  set profile_id=target_user
  where profile_id is null
    and customer_email is not null
    and lower(customer_email)=lower(target_email);
  get diagnostics orders_count = row_count;

  update public.checkout_sessions
  set profile_id=target_user
  where profile_id is null
    and contact_email is not null
    and lower(contact_email)=lower(target_email);
  get diagnostics checkouts_count = row_count;

  if gifts_count+commitments_count+orders_count+checkouts_count > 0 then
    insert into public.audit_events(
      actor_profile_id,
      event_type,
      entity_type,
      entity_id,
      summary,
      metadata
    )
    values(
      null,
      'confirmed_email_records_linked',
      'profile',
      target_user::text,
      'Verified guest financial records linked to member account',
      jsonb_build_object(
        'gifts',gifts_count,
        'commitments',commitments_count,
        'orders',orders_count,
        'checkouts',checkouts_count
      )
    );

    insert into public.notifications(
      profile_id,
      notification_type,
      title,
      body,
      href
    )
    values(
      target_user,
      'account',
      'Your existing Lockliel activity is connected',
      'We connected verified giving or order activity that used your confirmed email address to My Lockliel.',
      '/my-lockliel'
    );
  end if;

  return jsonb_build_object(
    'gifts',gifts_count,
    'commitments',commitments_count,
    'orders',orders_count,
    'checkouts',checkouts_count
  );
end;
$$;

revoke all on function app_private.link_confirmed_financial_records_for_user(uuid,text)
from public,anon,authenticated;

create or replace function app_private.link_financial_records_on_email_confirmation()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
begin
  if new.email_confirmed_at is not null
     and old.email_confirmed_at is null
     and new.email is not null then
    perform app_private.link_confirmed_financial_records_for_user(new.id,new.email);
  end if;
  return new;
end;
$$;

revoke all on function app_private.link_financial_records_on_email_confirmation()
from public,anon,authenticated;

drop trigger if exists link_financial_records_on_email_confirmation_trigger on auth.users;
create trigger link_financial_records_on_email_confirmation_trigger
after update of email_confirmed_at on auth.users
for each row execute function app_private.link_financial_records_on_email_confirmation();

create or replace function app_private.link_financial_records_for_confirmed_new_profile()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
declare
  confirmed timestamptz;
begin
  select u.email_confirmed_at into confirmed
  from auth.users u
  where u.id=new.id;

  if confirmed is not null and new.email is not null then
    perform app_private.link_confirmed_financial_records_for_user(new.id,new.email);
  end if;

  return new;
end;
$$;

revoke all on function app_private.link_financial_records_for_confirmed_new_profile()
from public,anon,authenticated;

drop trigger if exists link_financial_records_for_confirmed_new_profile_trigger on public.profiles;
create trigger link_financial_records_for_confirmed_new_profile_trigger
after insert on public.profiles
for each row execute function app_private.link_financial_records_for_confirmed_new_profile();
