create or replace function app_private.notify_group_membership_change()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
declare
  gname text;
  has_other_active boolean;
begin
  if old.status is not distinct from new.status then
    return new;
  end if;

  select g.name into gname
  from public.groups g
  where g.id=new.group_id;

  if old.status<>'active' and new.status='active' then
    insert into public.notifications(
      profile_id,notification_type,title,body,href
    )
    values(
      new.profile_id,
      'group_assignment',
      'Your Lockliel group connection is active',
      'You are now connected to ' || coalesce(gname,'a Lockliel group') || '.',
      '/my-lockliel/group'
    );
  elsif old.status='active' and new.status<>'active' then
    select exists(
      select 1
      from public.group_members gm
      where gm.profile_id=new.profile_id
        and gm.status='active'
        and gm.group_id<>new.group_id
    )
    into has_other_active;

    if not has_other_active then
      insert into public.notifications(
        profile_id,notification_type,title,body,href
      )
      values(
        new.profile_id,
        'group_assignment',
        'Your Lockliel group membership was updated',
        'You are no longer assigned to ' || coalesce(gname,'that Lockliel group') || '. You can request another group whenever you are ready.',
        '/my-lockliel/group'
      );
    end if;
  end if;

  return new;
end;
$function$;

revoke execute on function app_private.notify_group_membership_change()
from public, anon, authenticated;

drop trigger if exists notify_group_membership_change_trigger
on public.group_members;

create trigger notify_group_membership_change_trigger
after update of status on public.group_members
for each row
execute function app_private.notify_group_membership_change();
