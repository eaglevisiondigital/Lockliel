-- Exercise the actual pending constraint via Auth/bootstrap and email sync.
do $test$
declare
  fixture_id uuid := gen_random_uuid();
  null_id uuid := gen_random_uuid();
  candidate text;
  rejected boolean;
begin
  insert into auth.users(id,email) values(fixture_id,'valid-'||fixture_id||'@example.invalid'),(null_id,null);
  assert (select email is null from public.profiles where id=null_id), 'NULL email behavior changed';
  update auth.users set email='  NEXT-'||fixture_id||'@EXAMPLE.INVALID  ' where id=fixture_id;
  assert (select email='next-'||fixture_id||'@example.invalid' from public.profiles where id=fixture_id), 'Auth update normalization failed';
  foreach candidate in array array['', 'no-at.invalid', 'two@@example.invalid', 'no-dot@example', 'x y@example.invalid', '<x>@example.invalid', 'UPPER@example.invalid', ' space@example.invalid ', repeat('x',245)||'@example.invalid'] loop
    rejected:=false;
    begin insert into auth.users(id,email) values(gen_random_uuid(),candidate);
    exception when check_violation then rejected:=true; end;
    assert rejected, 'Invalid/raw import email unexpectedly accepted';
  end loop;
end;
$test$;
