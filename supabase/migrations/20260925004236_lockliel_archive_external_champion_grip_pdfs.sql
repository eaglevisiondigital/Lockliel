
update public.lesson_assets
set status='archived', updated_at=now()
where asset_type='pdf'
  and provider='champion-life'
  and external_url like 'https://championlifefwb.com/%';
