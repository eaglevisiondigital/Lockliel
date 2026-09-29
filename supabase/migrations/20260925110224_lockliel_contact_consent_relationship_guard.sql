drop policy if exists contact_permissions_self_update on public.contact_permissions;

create policy contact_permissions_self_update
on public.contact_permissions
for update
to authenticated
using (
  (select auth.uid()) = profile_id
)
with check (
  (select auth.uid()) = profile_id
  and (
    revoked_at is not null
    or (
      permission_type = 'inviter_followup'
      and exists(
        select 1
        from public.profiles p
        where p.id = profile_id
          and p.original_inviter_id = other_profile_id
      )
    )
    or (
      permission_type = 'leader_followup'
      and exists(
        select 1
        from public.leader_assignments la
        where la.member_id = profile_id
          and la.leader_id = other_profile_id
          and la.status = 'active'
      )
    )
  )
);

create or replace function app_private.sync_contact_permission_conversation_state()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
declare
  convo uuid;
  convo_type text;
  relationship_valid boolean := false;
begin
  if old.revoked_at is not distinct from new.revoked_at then
    return new;
  end if;

  if new.permission_type not in ('inviter_followup','leader_followup') then
    return new;
  end if;

  convo_type := new.permission_type;

  if new.revoked_at is null then
    if new.permission_type='inviter_followup' then
      select exists(
        select 1
        from public.profiles p
        where p.id=new.profile_id
          and p.original_inviter_id=new.other_profile_id
      )
      into relationship_valid;
    else
      select exists(
        select 1
        from public.leader_assignments la
        where la.member_id=new.profile_id
          and la.leader_id=new.other_profile_id
          and la.status='active'
      )
      into relationship_valid;
    end if;

    if not relationship_valid then
      raise exception 'Contact relationship is no longer active.';
    end if;
  end if;

  if new.revoked_at is not null then
    update public.conversation_members cm
    set left_at = coalesce(cm.left_at, now())
    from public.conversations c
    where c.id = cm.conversation_id
      and c.conversation_type = convo_type
      and cm.profile_id in (new.profile_id,new.other_profile_id)
      and exists(
        select 1
        from public.conversation_members a
        where a.conversation_id=c.id
          and a.profile_id=new.profile_id
      )
      and exists(
        select 1
        from public.conversation_members b
        where b.conversation_id=c.id
          and b.profile_id=new.other_profile_id
      );
  else
    select c.id
      into convo
    from public.conversations c
    where c.conversation_type = convo_type
      and exists(
        select 1
        from public.conversation_members a
        where a.conversation_id=c.id
          and a.profile_id=new.profile_id
      )
      and exists(
        select 1
        from public.conversation_members b
        where b.conversation_id=c.id
          and b.profile_id=new.other_profile_id
      )
    order by c.created_at desc
    limit 1;

    if convo is null then
      insert into public.conversations(conversation_type)
      values(convo_type)
      returning id into convo;

      if new.permission_type='inviter_followup' then
        insert into public.conversation_members(
          conversation_id, profile_id, member_role
        )
        values
          (convo,new.profile_id,'invitee'),
          (convo,new.other_profile_id,'inviter');
      else
        insert into public.conversation_members(
          conversation_id, profile_id, member_role
        )
        values
          (convo,new.profile_id,'member'),
          (convo,new.other_profile_id,'leader');
      end if;
    else
      update public.conversation_members
      set left_at=null
      where conversation_id=convo
        and profile_id in (new.profile_id,new.other_profile_id);
    end if;
  end if;

  return new;
end;
$function$;

revoke execute on function app_private.sync_contact_permission_conversation_state()
from public, anon, authenticated;
