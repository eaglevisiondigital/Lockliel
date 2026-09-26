create or replace function app_private.validate_checkout_order_relationship()
returns trigger
language plpgsql
set search_path to ''
as $function$
declare
  _order_provider text;
  _order_profile_id uuid;
begin
  if new.order_id is null then
    return new;
  end if;

  select o.provider,o.profile_id
    into _order_provider,_order_profile_id
  from public.orders o
  where o.id=new.order_id;

  if _order_provider is not null
     and _order_provider<>new.provider then
    raise exception 'Checkout and linked order must use the same payment provider.';
  end if;

  if new.profile_id is not null
     and _order_profile_id is not null
     and new.profile_id<>_order_profile_id then
    raise exception 'Checkout and linked order must belong to the same member.';
  end if;

  return new;
end;
$function$;

revoke execute on function app_private.validate_checkout_order_relationship()
from public,anon,authenticated;

drop trigger if exists validate_checkout_order_relationship_trigger
on public.checkout_sessions;

create trigger validate_checkout_order_relationship_trigger
before insert or update of order_id,provider,profile_id
on public.checkout_sessions
for each row
execute function app_private.validate_checkout_order_relationship();


create or replace function app_private.validate_payment_event_relationships()
returns trigger
language plpgsql
set search_path to ''
as $function$
declare
  _checkout_provider text;
  _checkout_profile_id uuid;
  _checkout_order_id uuid;
  _gift_provider text;
  _gift_profile_id uuid;
  _order_provider text;
  _order_profile_id uuid;
  _commitment_provider text;
  _commitment_profile_id uuid;
  _profile_id uuid;
begin
  if tg_op='UPDATE' then
    if old.checkout_session_id is not null
       and old.checkout_session_id is distinct from new.checkout_session_id then
      raise exception 'Payment event checkout link cannot be replaced once recorded.';
    end if;
    if old.gift_id is not null
       and old.gift_id is distinct from new.gift_id then
      raise exception 'Payment event gift link cannot be replaced once recorded.';
    end if;
    if old.order_id is not null
       and old.order_id is distinct from new.order_id then
      raise exception 'Payment event order link cannot be replaced once recorded.';
    end if;
    if old.commitment_id is not null
       and old.commitment_id is distinct from new.commitment_id then
      raise exception 'Payment event commitment link cannot be replaced once recorded.';
    end if;
  end if;

  if new.checkout_session_id is not null then
    select cs.provider,cs.profile_id,cs.order_id
      into _checkout_provider,_checkout_profile_id,_checkout_order_id
    from public.checkout_sessions cs
    where cs.id=new.checkout_session_id;

    if _checkout_provider is not null
       and _checkout_provider<>new.provider then
      raise exception 'Payment event and checkout must use the same payment provider.';
    end if;

    _profile_id:=_checkout_profile_id;
  end if;

  if new.gift_id is not null then
    select g.provider,g.profile_id
      into _gift_provider,_gift_profile_id
    from public.gifts g
    where g.id=new.gift_id;

    if _gift_provider is not null
       and _gift_provider<>new.provider then
      raise exception 'Payment event and gift must use the same payment provider.';
    end if;

    if _profile_id is not null
       and _gift_profile_id is not null
       and _profile_id<>_gift_profile_id then
      raise exception 'Linked payment records must belong to the same member.';
    end if;
    _profile_id:=coalesce(_profile_id,_gift_profile_id);
  end if;

  if new.order_id is not null then
    select o.provider,o.profile_id
      into _order_provider,_order_profile_id
    from public.orders o
    where o.id=new.order_id;

    if _order_provider is not null
       and _order_provider<>new.provider then
      raise exception 'Payment event and order must use the same payment provider.';
    end if;

    if _checkout_order_id is not null
       and _checkout_order_id<>new.order_id then
      raise exception 'Payment event order must match the order linked to its checkout.';
    end if;

    if _profile_id is not null
       and _order_profile_id is not null
       and _profile_id<>_order_profile_id then
      raise exception 'Linked payment records must belong to the same member.';
    end if;
    _profile_id:=coalesce(_profile_id,_order_profile_id);
  end if;

  if new.commitment_id is not null then
    select pc.provider,pc.profile_id
      into _commitment_provider,_commitment_profile_id
    from public.partner_commitments pc
    where pc.id=new.commitment_id;

    if _commitment_provider is not null
       and _commitment_provider<>new.provider then
      raise exception 'Payment event and commitment must use the same payment provider.';
    end if;

    if _profile_id is not null
       and _commitment_profile_id is not null
       and _profile_id<>_commitment_profile_id then
      raise exception 'Linked payment records must belong to the same member.';
    end if;
  end if;

  return new;
end;
$function$;

revoke execute on function app_private.validate_payment_event_relationships()
from public,anon,authenticated;

drop trigger if exists validate_payment_event_relationships_trigger
on public.payment_events;

create trigger validate_payment_event_relationships_trigger
before insert or update of
  provider,
  checkout_session_id,
  gift_id,
  order_id,
  commitment_id
on public.payment_events
for each row
execute function app_private.validate_payment_event_relationships();


create or replace function app_private.validate_order_provider_relationships()
returns trigger
language plpgsql
set search_path to ''
as $function$
begin
  if new.provider is null then
    return new;
  end if;

  if exists(
    select 1
    from public.checkout_sessions cs
    where cs.order_id=new.id
      and cs.provider<>new.provider
  ) then
    raise exception 'Order provider must match its linked checkout provider.';
  end if;

  if exists(
    select 1
    from public.payment_events pe
    where pe.order_id=new.id
      and pe.provider<>new.provider
  ) then
    raise exception 'Order provider must match its linked payment event provider.';
  end if;

  return new;
end;
$function$;

revoke execute on function app_private.validate_order_provider_relationships()
from public,anon,authenticated;

drop trigger if exists validate_order_provider_relationships_trigger
on public.orders;

create trigger validate_order_provider_relationships_trigger
before insert or update of provider
on public.orders
for each row
execute function app_private.validate_order_provider_relationships();


create or replace function app_private.validate_commitment_provider_relationships()
returns trigger
language plpgsql
set search_path to ''
as $function$
begin
  if new.provider is null then
    return new;
  end if;

  if exists(
    select 1
    from public.payment_events pe
    where pe.commitment_id=new.id
      and pe.provider<>new.provider
  ) then
    raise exception 'Commitment provider must match its linked payment event provider.';
  end if;

  return new;
end;
$function$;

revoke execute on function app_private.validate_commitment_provider_relationships()
from public,anon,authenticated;

drop trigger if exists validate_commitment_provider_relationships_trigger
on public.partner_commitments;

create trigger validate_commitment_provider_relationships_trigger
before insert or update of provider
on public.partner_commitments
for each row
execute function app_private.validate_commitment_provider_relationships();
