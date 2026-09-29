
drop trigger if exists on_gift_apply_benefits on public.gifts;

create trigger on_gift_apply_benefits
after insert or update of status,amount_cents,profile_id on public.gifts
for each row execute function app_private.apply_active_gift_benefits();
