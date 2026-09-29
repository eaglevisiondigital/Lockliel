
create table if not exists app_private.one_time_jobs (
  key text primary key,
  status text not null default 'ready'
    check(status in ('ready','running','completed','failed')),
  run_count int not null default 0,
  result jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

insert into app_private.one_time_jobs(key,status,run_count,result)
values('import_grip_pdfs','ready',0,'{}'::jsonb)
on conflict(key) do update
set status=case
      when app_private.one_time_jobs.status='completed' then 'completed'
      else 'ready'
    end,
    updated_at=now();
