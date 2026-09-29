
drop policy if exists "connection_requests_self_cancel" on public.connection_requests;
create policy "connection_requests_self_cancel" on public.connection_requests for update to authenticated
using(
  requester_id=(select auth.uid())
  and status='open'
)
with check(
  requester_id=(select auth.uid())
  and status in ('open','closed')
);

grant update on public.connection_requests to authenticated;
