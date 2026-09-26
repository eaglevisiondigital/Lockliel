alter table public.gifts
  drop constraint if exists gifts_received_after_creation;

CREATE OR REPLACE FUNCTION app_private.lockliel_integrity_health_internal()
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  profiles_without_journey integer:=0;
  reach_count_mismatches integer:=0;
  connection_count_mismatches integer:=0;
  ineligible_primary_group_leaders integer:=0;
  ineligible_group_leadership_memberships integer:=0;
  primary_leader_membership_mismatches integer:=0;
  checkout_state_mismatch integer:=0;
  digital_book_release_mismatch integer:=0;
  book_benefit_release_mismatch integer:=0;
  financial_cross_link_mismatches integer:=0;
  financial_temporal_mismatches integer:=0;
  media_progress_payload_mismatches integer:=0;
  checkout_flag boolean:=false;
  digital_book_flag boolean:=false;
  book_benefit_flag boolean:=false;
  provider_ready boolean:=false;
  provider_one_time boolean:=false;
  provider_recurring boolean:=false;
  issue_total integer:=0;
begin
  if not app_private.has_staff_role(array['super_admin','admin']) then
    raise exception 'Administrator access required';
  end if;

  select count(*)::integer
    into profiles_without_journey
  from public.profiles p
  left join public.member_journey mj on mj.profile_id=p.id
  where mj.profile_id is null;

  select count(*)::integer
    into reach_count_mismatches
  from public.member_journey mj
  where coalesce(mj.reach_one_count,0) <>
    (
      (
        select count(*)::integer
        from public.reach_contacts rc
        where rc.owner_id=mj.profile_id
          and rc.status in ('invited','connected','growing','completed')
      )
      +
      (
        select count(distinct re.member_id)::integer
        from public.referral_events re
        join public.referral_links rl on rl.id=re.referral_link_id
        where rl.owner_id=mj.profile_id
          and re.event_type='signup'
          and re.member_id is not null
          and not exists(
            select 1
            from public.reach_contacts rc
            where rc.owner_id=mj.profile_id
              and rc.linked_profile_id=re.member_id
              and rc.status in ('invited','connected','growing','completed')
          )
      )
    );

  select count(*)::integer
    into connection_count_mismatches
  from public.member_journey mj
  where coalesce(mj.active_connections_count,0) <>
    (
      select count(distinct x.other_id)::integer
      from (
        select cp.other_profile_id as other_id
        from public.contact_permissions cp
        where cp.profile_id=mj.profile_id
          and cp.revoked_at is null
        union
        select cp.profile_id as other_id
        from public.contact_permissions cp
        where cp.other_profile_id=mj.profile_id
          and cp.revoked_at is null
      ) x
    );

  select count(*)::integer
    into ineligible_primary_group_leaders
  from public.groups g
  where g.status in ('forming','active')
    and g.leader_id is not null
    and not (
      exists(
        select 1
        from public.leader_profiles lp
        where lp.profile_id=g.leader_id
          and lp.active=true
          and lp.leader_type in ('group_leader','regional_leader')
      )
      or exists(
        select 1
        from public.founders50_applications f
        where f.profile_id=g.leader_id
          and f.status='active_host'
      )
    );

  select count(*)::integer
    into ineligible_group_leadership_memberships
  from public.group_members gm
  join public.groups g on g.id=gm.group_id
  where gm.status='active'
    and gm.role in ('leader','host')
    and g.status in ('forming','active')
    and not (
      exists(
        select 1
        from public.leader_profiles lp
        where lp.profile_id=gm.profile_id
          and lp.active=true
          and lp.leader_type in ('group_leader','regional_leader')
      )
      or exists(
        select 1
        from public.founders50_applications f
        where f.profile_id=gm.profile_id
          and f.status='active_host'
      )
    );

  select count(*)::integer
    into primary_leader_membership_mismatches
  from public.groups g
  where g.status in ('forming','active')
    and g.leader_id is not null
    and not exists(
      select 1
      from public.group_members gm
      where gm.group_id=g.id
        and gm.profile_id=g.leader_id
        and gm.role='leader'
        and gm.status='active'
    );

  select
    coalesce(bool_or(f.enabled) filter(where f.key='partner_checkout'),false),
    coalesce(bool_or(f.enabled) filter(where f.key='digital_book_delivery'),false),
    coalesce(bool_or(f.enabled) filter(where f.key='heart_book_gift_benefit'),false)
    into checkout_flag,digital_book_flag,book_benefit_flag
  from public.feature_flags f
  where f.key in ('partner_checkout','digital_book_delivery','heart_book_gift_benefit');

  select
    true,
    p.supports_one_time,
    p.supports_recurring
    into provider_ready,provider_one_time,provider_recurring
  from public.payment_provider_connections p
  where p.status='active'
    and p.checkout_adapter_ready=true
    and p.webhook_ready=true
  order by case p.provider
    when 'authorize_net' then 1
    when 'stripe' then 2
    when 'paypal' then 3
    when 'square' then 4
    else 9
  end
  limit 1;

  provider_ready:=coalesce(provider_ready,false);
  provider_one_time:=coalesce(provider_one_time,false);
  provider_recurring:=coalesce(provider_recurring,false);

  select case
    when count(*)=1
      and bool_and(
        s.checkout_ready=(checkout_flag and provider_ready)
        and s.supports_one_time=provider_one_time
        and s.supports_recurring=provider_recurring
      )
    then 0
    else 1
  end
    into checkout_state_mismatch
  from public.partner_checkout_state s
  where s.id=true;

  digital_book_release_mismatch:=
    case
      when digital_book_flag
       and not exists(
         select 1
         from public.products p
         join storage.objects o
           on o.bucket_id='member-resources'
          and o.name=p.storage_path
         where p.product_type='digital_book'
           and p.status='active'
           and p.storage_path is not null
       )
      then 1
      else 0
    end;

  book_benefit_release_mismatch:=
    case
      when book_benefit_flag
       and (
         not digital_book_flag
         or not exists(
           select 1
           from public.benefit_rules br
           join public.products p on p.id=br.product_id
           join storage.objects o
             on o.bucket_id='member-resources'
            and o.name=p.storage_path
           where br.slug='heart-for-the-lost-gift-20'
             and br.status='active'
             and p.status='active'
             and p.storage_path is not null
         )
       )
      then 1
      else 0
    end;


  select (
    (
      select count(*)::integer
      from public.checkout_sessions cs
      join public.orders o on o.id=cs.order_id
      where (
        o.provider is not null
        and o.provider<>cs.provider
      )
      or (
        cs.profile_id is not null
        and o.profile_id is not null
        and cs.profile_id<>o.profile_id
      )
    )
    +
    (
      select count(*)::integer
      from public.payment_events pe
      left join public.checkout_sessions cs on cs.id=pe.checkout_session_id
      left join public.gifts g on g.id=pe.gift_id
      left join public.orders o on o.id=pe.order_id
      left join public.partner_commitments pc on pc.id=pe.commitment_id
      where
        (cs.id is not null and cs.provider<>pe.provider)
        or (g.id is not null and g.provider<>pe.provider)
        or (o.id is not null and o.provider is not null and o.provider<>pe.provider)
        or (pc.id is not null and pc.provider is not null and pc.provider<>pe.provider)
        or (
          cs.order_id is not null
          and pe.order_id is not null
          and cs.order_id<>pe.order_id
        )
        or (
          select count(distinct x.profile_id)
          from (
            values
              (cs.profile_id),
              (g.profile_id),
              (o.profile_id),
              (pc.profile_id)
          ) x(profile_id)
          where x.profile_id is not null
        )>1
    )
  ) into financial_cross_link_mismatches;

  select (
    (select count(*)::integer from public.checkout_sessions
      where (completed_at is not null and completed_at<created_at)
         or (status='completed' and completed_at is null)
         or (status<>'completed' and completed_at is not null))
    +
    (select count(*)::integer from public.payment_events
      where (processed_at is not null and processed_at<received_at)
         or (status in ('processed','ignored','failed') and processed_at is null)
         or (status in ('received','processing') and processed_at is not null))
    +
    (select count(*)::integer from public.gifts
      where status in ('succeeded','paid','completed')
        and received_at is null)
    +
    (select count(*)::integer from public.orders
      where (paid_at is not null and paid_at<created_at)
         or (fulfilled_at is not null and fulfilled_at<created_at)
         or (fulfilled_at is not null and paid_at is not null and fulfilled_at<paid_at)
         or (status in ('paid','fulfilled','partially_refunded','refunded') and paid_at is null)
         or (status='fulfilled' and fulfilled_at is null))
    +
    (select count(*)::integer from public.partner_commitments
      where (started_at is not null and started_at<created_at)
         or (cancelled_at is not null and cancelled_at<created_at)
         or (started_at is not null and cancelled_at is not null and cancelled_at<started_at)
         or (status='active' and started_at is null)
         or (status in ('cancelled','ended') and cancelled_at is null))
  ) into financial_temporal_mismatches;

  select count(*)::integer
    into media_progress_payload_mismatches
  from public.media_progress mp
  where case
    when jsonb_typeof(mp.covered_intervals)='array' then
      jsonb_array_length(mp.covered_intervals)>250
      or pg_column_size(mp.covered_intervals)>32768
    else true
  end;

  issue_total:=
    profiles_without_journey
    + reach_count_mismatches
    + connection_count_mismatches
    + ineligible_primary_group_leaders
    + ineligible_group_leadership_memberships
    + primary_leader_membership_mismatches
    + checkout_state_mismatch
    + digital_book_release_mismatch
    + book_benefit_release_mismatch
    + financial_cross_link_mismatches
    + financial_temporal_mismatches
    + media_progress_payload_mismatches;

  return jsonb_build_object(
    'healthy',issue_total=0,
    'issue_count',issue_total,
    'profiles_without_journey',profiles_without_journey,
    'reach_count_mismatches',reach_count_mismatches,
    'connection_count_mismatches',connection_count_mismatches,
    'ineligible_primary_group_leaders',ineligible_primary_group_leaders,
    'ineligible_group_leadership_memberships',ineligible_group_leadership_memberships,
    'primary_leader_membership_mismatches',primary_leader_membership_mismatches,
    'checkout_state_mismatch',checkout_state_mismatch,
    'digital_book_release_mismatch',digital_book_release_mismatch,
    'book_benefit_release_mismatch',book_benefit_release_mismatch,
    'financial_cross_link_mismatches',financial_cross_link_mismatches,
    'financial_temporal_mismatches',financial_temporal_mismatches,
    'media_progress_payload_mismatches',media_progress_payload_mismatches
  );
end;
$function$
;
