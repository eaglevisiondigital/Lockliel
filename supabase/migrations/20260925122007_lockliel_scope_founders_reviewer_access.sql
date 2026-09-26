drop policy if exists groups_combined_read on public.groups;
create policy groups_combined_read
on public.groups
for select
to authenticated
using (
  exists(
    select 1
    from public.group_members gm
    where gm.group_id=groups.id
      and gm.profile_id=(select auth.uid())
  )
  or app_private.has_staff_role(
    array['super_admin','admin','discipleship_admin']
  )
);

drop policy if exists groups_staff_insert on public.groups;
create policy groups_staff_insert
on public.groups
for insert
to authenticated
with check (
  app_private.has_staff_role(
    array['super_admin','admin','discipleship_admin']
  )
);

drop policy if exists groups_staff_update on public.groups;
create policy groups_staff_update
on public.groups
for update
to authenticated
using (
  app_private.has_staff_role(
    array['super_admin','admin','discipleship_admin']
  )
  or leader_id=(select auth.uid())
)
with check (
  app_private.has_staff_role(
    array['super_admin','admin','discipleship_admin']
  )
  or leader_id=(select auth.uid())
);

drop policy if exists group_members_combined_read on public.group_members;
create policy group_members_combined_read
on public.group_members
for select
to authenticated
using (
  profile_id=(select auth.uid())
  or app_private.has_staff_role(
    array['super_admin','admin','discipleship_admin']
  )
  or app_private.shares_group(profile_id)
);

drop policy if exists group_members_staff_insert on public.group_members;
create policy group_members_staff_insert
on public.group_members
for insert
to authenticated
with check (
  app_private.has_staff_role(
    array['super_admin','admin','discipleship_admin']
  )
);

drop policy if exists group_members_staff_update on public.group_members;
create policy group_members_staff_update
on public.group_members
for update
to authenticated
using (
  app_private.has_staff_role(
    array['super_admin','admin','discipleship_admin']
  )
)
with check (
  app_private.has_staff_role(
    array['super_admin','admin','discipleship_admin']
  )
);

drop policy if exists group_checkins_read on public.group_weekly_checkins;
create policy group_checkins_read
on public.group_weekly_checkins
for select
to authenticated
using (
  app_private.is_group_leader(group_id)
  or app_private.has_staff_role(
    array['super_admin','admin','discipleship_admin']
  )
);

drop policy if exists leader_profiles_self_read on public.leader_profiles;
create policy leader_profiles_self_read
on public.leader_profiles
for select
to authenticated
using (
  profile_id=(select auth.uid())
  or app_private.has_staff_role(
    array['super_admin','admin','discipleship_admin']
  )
);

drop policy if exists leader_profiles_staff_insert on public.leader_profiles;
create policy leader_profiles_staff_insert
on public.leader_profiles
for insert
to authenticated
with check (
  approved_by=(select auth.uid())
  and app_private.has_staff_role(
    array['super_admin','admin','discipleship_admin']
  )
);

drop policy if exists leader_profiles_staff_update on public.leader_profiles;
create policy leader_profiles_staff_update
on public.leader_profiles
for update
to authenticated
using (
  app_private.has_staff_role(
    array['super_admin','admin','discipleship_admin']
  )
)
with check (
  app_private.has_staff_role(
    array['super_admin','admin','discipleship_admin']
  )
);

drop policy if exists leader_assignments_related_read on public.leader_assignments;
create policy leader_assignments_related_read
on public.leader_assignments
for select
to authenticated
using (
  member_id=(select auth.uid())
  or leader_id=(select auth.uid())
  or app_private.has_staff_role(
    array['super_admin','admin','discipleship_admin']
  )
);

drop policy if exists leader_assignments_staff_insert on public.leader_assignments;
create policy leader_assignments_staff_insert
on public.leader_assignments
for insert
to authenticated
with check (
  assigned_by=(select auth.uid())
  and app_private.has_staff_role(
    array['super_admin','admin','discipleship_admin']
  )
);

drop policy if exists leader_assignments_staff_update on public.leader_assignments;
create policy leader_assignments_staff_update
on public.leader_assignments
for update
to authenticated
using (
  app_private.has_staff_role(
    array['super_admin','admin','discipleship_admin']
  )
)
with check (
  app_private.has_staff_role(
    array['super_admin','admin','discipleship_admin']
  )
);

drop policy if exists connection_requests_combined_read on public.connection_requests;
create policy connection_requests_combined_read
on public.connection_requests
for select
to authenticated
using (
  requester_id=(select auth.uid())
  or app_private.has_staff_role(
    array['super_admin','admin','discipleship_admin']
  )
);

drop policy if exists connection_requests_combined_update on public.connection_requests;
create policy connection_requests_combined_update
on public.connection_requests
for update
to authenticated
using (
  app_private.has_staff_role(
    array['super_admin','admin','discipleship_admin']
  )
  or (
    requester_id=(select auth.uid())
    and status='open'
  )
)
with check (
  app_private.has_staff_role(
    array['super_admin','admin','discipleship_admin']
  )
  or (
    requester_id=(select auth.uid())
    and status in ('open','closed')
  )
);

drop policy if exists profile_connection_cards_allowed_read
on public.profile_connection_cards;

create policy profile_connection_cards_allowed_read
on public.profile_connection_cards
for select
to authenticated
using (
  profile_id=(select auth.uid())
  or app_private.has_staff_role(
    array['super_admin','admin','discipleship_admin']
  )
  or (
    app_private.has_staff_role(array['founders50_reviewer'])
    and exists(
      select 1
      from public.founders50_applications fa
      where fa.profile_id=profile_connection_cards.profile_id
    )
  )
  or app_private.shares_group(profile_id)
  or exists(
    select 1
    from public.contact_permissions cp
    where cp.revoked_at is null
      and (
        (
          cp.profile_id=profile_connection_cards.profile_id
          and cp.other_profile_id=(select auth.uid())
        )
        or (
          cp.other_profile_id=profile_connection_cards.profile_id
          and cp.profile_id=(select auth.uid())
        )
      )
  )
);

drop policy if exists member_staff_notes_insert on public.member_staff_notes;
create policy member_staff_notes_insert
on public.member_staff_notes
for insert
to authenticated
with check (
  author_id=(select auth.uid())
  and (
    (
      visibility='admin_only'
      and app_private.has_staff_role(array['super_admin','admin'])
    )
    or (
      visibility='finance_only'
      and app_private.has_staff_role(array['super_admin','admin','finance_admin'])
    )
    or (
      visibility='ministry_staff'
      and (
        app_private.has_staff_role(
          array['super_admin','admin','discipleship_admin']
        )
        or (
          app_private.has_staff_role(array['founders50_reviewer'])
          and exists(
            select 1
            from public.founders50_applications fa
            where fa.profile_id=member_staff_notes.profile_id
          )
        )
      )
    )
  )
);

drop policy if exists member_staff_notes_read on public.member_staff_notes;
create policy member_staff_notes_read
on public.member_staff_notes
for select
to authenticated
using (
  case visibility
    when 'admin_only' then
      app_private.has_staff_role(array['super_admin','admin'])
    when 'finance_only' then
      app_private.has_staff_role(array['super_admin','admin','finance_admin'])
    else
      app_private.has_staff_role(
        array['super_admin','admin','discipleship_admin']
      )
      or (
        app_private.has_staff_role(array['founders50_reviewer'])
        and exists(
          select 1
          from public.founders50_applications fa
          where fa.profile_id=member_staff_notes.profile_id
        )
      )
  end
);

drop policy if exists followup_combined_read on public.follow_up_tasks;
create policy followup_combined_read
on public.follow_up_tasks
for select
to authenticated
using (
  assigned_to=(select auth.uid())
  or app_private.has_staff_role(
    array['super_admin','admin','discipleship_admin']
  )
  or (
    app_private.has_staff_role(array['founders50_reviewer'])
    and (
      task_type in (
        'founders50_needs_info',
        'founders50_orientation',
        'founders50_orientation_followup',
        'founders50_host_launch',
        'founder_orientation_complete'
      )
      or context_type in ('founders50','founders50_application')
    )
  )
);

drop policy if exists followup_combined_update on public.follow_up_tasks;
create policy followup_combined_update
on public.follow_up_tasks
for update
to authenticated
using (
  assigned_to=(select auth.uid())
  or app_private.has_staff_role(
    array['super_admin','admin','discipleship_admin']
  )
  or (
    app_private.has_staff_role(array['founders50_reviewer'])
    and (
      task_type in (
        'founders50_needs_info',
        'founders50_orientation',
        'founders50_orientation_followup',
        'founders50_host_launch',
        'founder_orientation_complete'
      )
      or context_type in ('founders50','founders50_application')
    )
  )
)
with check (
  assigned_to=(select auth.uid())
  or app_private.has_staff_role(
    array['super_admin','admin','discipleship_admin']
  )
  or (
    app_private.has_staff_role(array['founders50_reviewer'])
    and (
      task_type in (
        'founders50_needs_info',
        'founders50_orientation',
        'founders50_orientation_followup',
        'founders50_host_launch',
        'founder_orientation_complete'
      )
      or context_type in ('founders50','founders50_application')
    )
  )
);
