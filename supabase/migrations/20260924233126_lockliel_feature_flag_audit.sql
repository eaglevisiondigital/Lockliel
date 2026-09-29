
create or replace function app_private.audit_feature_flag_change()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
begin
 if old.enabled is distinct from new.enabled then
   insert into public.audit_events(actor_profile_id,event_type,entity_type,entity_id,summary,metadata)
   values((select auth.uid()),'feature_flag_changed','feature_flag',new.key,
     'Feature flag changed',
     jsonb_build_object('from',old.enabled,'to',new.enabled));
   new.updated_at:=now();
 end if;
 return new;
end;
$$;
revoke all on function app_private.audit_feature_flag_change() from public,anon,authenticated;
drop trigger if exists audit_feature_flag_change_trigger on public.feature_flags;
create trigger audit_feature_flag_change_trigger
before update of enabled on public.feature_flags
for each row execute function app_private.audit_feature_flag_change();
