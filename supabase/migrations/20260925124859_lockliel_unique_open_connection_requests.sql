create unique index connection_requests_one_open_type_uidx
on public.connection_requests(requester_id,request_type)
where status='open';
