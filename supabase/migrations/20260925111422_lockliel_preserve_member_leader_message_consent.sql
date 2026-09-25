create or replace function app_private.sync_leader_assignment_relationship()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
declare
  convo uuid;
  activate_permission boolean := false;
  permission_open boolean := false;
begin
  if tg_op='UPDATE'
     and old.status='active'
     and (new.status<>'active' or old.leader_id is distinct from new.leader_id) then

    update public.contact_permissions
    set revoked_at=now()
    where profile_id=old.member_id
      and other_profile_id=old.leader_id
      and permission_type='leader_followup'
      and revoked_at is null;

    update public.conversation_members cm
    set left_at=now()
    from public.conversations c
    where cm.conversation_id=c.id
      and c.conversation_type='leader_followup'
      and cm.profile_id in (old.member_id,old.leader_id)
      and exists(
        select 1 from public.conversation_members x
        where x.conversation_id=c.id and x.profile_id=old.member_id
      )
      and exists(
        select 1 from public.conversation_members y
        where y.conversation_id=c.id and y.profile_id=old.leader_id
      )
      and cm.left_at is null;
  end if;

  if new.status='active' then
    update public.profiles
    set current_leader_id=new.leader_id,
        updated_at=now()
    where id=new.member_id;

    if tg_op='INSERT' then
      activate_permission:=true;
    elsif old.status<>'active'
          or old.leader_id is distinct from new.leader_id then
      activate_permission:=true;
    end if;

    if activate_permission then
      insert into public.contact_permissions(
        profile_id,other_profile_id,permission_type
      )
      values(new.member_id,new.leader_id,'leader_followup')
      on conflict(profile_id,other_profile_id,permission_type)
      do update set revoked_at=null;
    end if;

    select exists(
      select 1
      from public.contact_permissions cp
      where cp.profile_id=new.member_id
        and cp.other_profile_id=new.leader_id
        and cp.permission_type='leader_followup'
        and cp.revoked_at is null
    )
    into permission_open;

    if permission_open then
      select c.id into convo
      from public.conversations c
      where c.conversation_type='leader_followup'
        and exists(
          select 1 from public.conversation_members a
          where a.conversation_id=c.id
            and a.profile_id=new.member_id
            and a.left_at is null
        )
        and exists(
          select 1 from public.conversation_members b
          where b.conversation_id=c.id
            and b.profile_id=new.leader_id
            and b.left_at is null
        )
      limit 1;

      if convo is null then
        insert into public.conversations(conversation_type)
        values('leader_followup')
        returning id into convo;

        insert into public.conversation_members(
          conversation_id,profile_id,member_role
        )
        values
          (convo,new.member_id,'member'),
          (convo,new.leader_id,'leader');
      end if;
    end if;
  elsif tg_op='UPDATE'
        and old.status='active'
        and new.status<>'active' then

    update public.profiles
    set current_leader_id=null,
        updated_at=now()
    where id=new.member_id
      and current_leader_id=old.leader_id;
  end if;

  return new;
end;
$function$;

revoke execute on function app_private.sync_leader_assignment_relationship()
from public, anon, authenticated;
