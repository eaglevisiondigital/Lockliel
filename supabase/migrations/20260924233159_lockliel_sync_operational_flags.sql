
create or replace function app_private.sync_operational_feature_flags()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
begin
 if new.key='heart_book_gift_benefit' and old.enabled is distinct from new.enabled then
   if new.enabled then
     update public.benefit_rules
       set status='active'
       where slug='heart-for-the-lost-gift-20';
   else
     update public.benefit_rules
       set status=case when status='active' then 'paused' else status end
       where slug='heart-for-the-lost-gift-20';
   end if;
 end if;
 return new;
end;
$$;
revoke all on function app_private.sync_operational_feature_flags() from public,anon,authenticated;
drop trigger if exists sync_operational_feature_flags_trigger on public.feature_flags;
create trigger sync_operational_feature_flags_trigger
after update of enabled on public.feature_flags
for each row execute function app_private.sync_operational_feature_flags();
