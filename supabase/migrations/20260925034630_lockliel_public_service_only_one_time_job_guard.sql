
create table if not exists public.system_one_time_jobs (
  key text primary key,
  status text not null default 'ready'
    check(status in ('ready','running','completed','failed')),
  run_count int not null default 0,
  result jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.system_one_time_jobs enable row level security;
revoke all on public.system_one_time_jobs from anon,authenticated;

insert into public.system_one_time_jobs(key,status,run_count,result)
values('import_grip_pdfs','ready',0,'{}'::jsonb)
on conflict(key) do update
set status='ready',
    run_count=0,
    result='{}'::jsonb,
    updated_at=now();
