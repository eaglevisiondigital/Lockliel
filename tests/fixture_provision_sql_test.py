"""Explicit disposable Unix-socket-only regression, never a managed DB test.
Run manually with --disposable-local-only. No inherited PG/environment settings.
No credentials. Uses existing PG17 binaries; removes only its own stopped fixture.
"""
from pathlib import Path
import tempfile,subprocess,json,shutil,hashlib,importlib.util,sys
ROOT=Path(__file__).resolve().parents[1]
BIN=Path('/opt/homebrew/opt/postgresql@17/bin')
IDS=['00000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000002']
OLD='00000000-0000-4000-8000-000000000003'
EMAILS=['synthetic-a@fixture.invalid','synthetic-b@fixture.invalid']

def main():
 if sys.argv[1:]!=['--disposable-local-only']:raise SystemExit('Explicit local fixture flag required')
 base=Path(tempfile.mkdtemp(prefix='lkirqsql-',dir='/private/tmp'));data=base/'data';sock=base/'s';sock.mkdir(mode=0o700)
 env={'PATH':str(BIN)+':/usr/bin:/bin','LANG':'C','LC_ALL':'C'};started=False;phase='setup';checks=[]
 result={'scope':'disposable-unix-socket-only','managedConnections':0,'hostedEquivalent':False}
 def run(cmd,args,source=None):
  p=subprocess.run([str(BIN/cmd),*args],input=source,text=True,capture_output=True,env=env,timeout=120)
  if p.returncode:raise RuntimeError('LOCAL_SQL_COMMAND_FAILED')
  return p.stdout
 args=['-X','-h',str(sock),'-p','5432','-U','postgres','-d','postgres','-v','ON_ERROR_STOP=1','-qAt']
 def sql(s):return run('psql',args,s)
 def src(p):return (ROOT/p).read_text()
 def one(s):return json.loads(sql(s))
 def check(name,condition):
  if not condition:raise AssertionError(name)
  checks.append(name)
 def read(s):
  rows=sql("begin read only;set local lock_timeout='5s';set local statement_timeout='30s';set local search_path='';select json_build_array(current_setting('transaction_read_only'),current_setting('lock_timeout'),current_setting('statement_timeout'));\n"+s+'\nrollback;').strip().splitlines()
  if json.loads(rows[0])!=['on','5s','30s']:raise AssertionError('local settings')
  return json.loads(rows[1])
 def create(idx):
  uid=IDS[idx];email=EMAILS[idx];label=['A','B'][idx]
  # Models documented Admin-create SQL actions, not GoTrue execution/equivalence.
  return "\n".join([
   "insert into auth.users(id,email,role,aud,raw_app_meta_data,raw_user_meta_data) values ('"+uid+"','"+email+"','authenticated','authenticated','{\"provider\":\"email\",\"providers\":[\"email\"]}','{\"full_name\":\"Synthetic User "+label+"\"}');",
   "insert into auth.identities(id,user_id,provider,provider_id,identity_data) values(gen_random_uuid(),'"+uid+"','email','"+uid+"','{\"sub\":\""+uid+"\",\"email\":\""+email+"\"}');",
   "update auth.users set email_confirmed_at=now() where id='"+uid+"';",
   "update auth.users set raw_user_meta_data=raw_user_meta_data||'{\"email_verified\":true}'::jsonb where id='"+uid+"';"])
 try:
  run('initdb',['-D',str(data),'-U','postgres','-A','trust','--no-locale','-E','UTF8'])
  with (data/'postgresql.conf').open('a') as f:f.write("\nlisten_addresses = ''\nunix_socket_directories = '"+str(sock)+"'\nunix_socket_permissions = 0700\nport = 5432\n")
  run('pg_ctl',['-D',str(data),'-l',str(base/'postgres.log'),'-w','-t','30','start']);started=True
  check('owned Unix socket only',sql("select inet_server_addr() is null and current_setting('data_directory')='"+str(data)+"';").strip()=='t')
  phase='compat';sql(src('tests/support/supabase-compat.sql'))
  sql("alter table auth.users add column role text,add column aud text,add column phone text default '',add column is_anonymous boolean default false;create table auth.identities(id uuid primary key,user_id uuid references auth.users,provider text,provider_id text,identity_data jsonb);create table auth.mfa_factors(id uuid primary key,user_id uuid references auth.users);create table auth.one_time_tokens(id uuid primary key,user_id uuid references auth.users);")
  migrations=sorted((ROOT/'supabase/migrations').glob('*.sql'));check('280 authoritative sources',len(migrations)==280)
  hashes={p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in migrations}
  for i,p in enumerate(migrations):phase='migration-'+str(i+1);sql('begin;\n'+p.read_text()+'\ncommit;')
  result['migrationsReplayed']=280
  phase='operational-fixture';sql('create role authenticator nologin;create schema supabase_migrations;create table supabase_migrations.schema_migrations(version text primary key,name text,statements text[]);')
  for p in migrations:sql("insert into supabase_migrations.schema_migrations values ('"+p.name[:14]+"','"+p.name[15:-4]+"',array['"+p.read_text().replace("'","''")+"']);")
  sql(src('supabase/verification/course-release-280/maintenance-install.sql'))
  phase='existing-learner';sql("insert into auth.users(id,email,role,aud,email_confirmed_at,raw_app_meta_data) values ('"+OLD+"','synthetic-old@fixture.invalid','authenticated','authenticated',now(),'{\"provider\":\"email\",\"providers\":[\"email\"]}');")
  sql("insert into public.course_enrollments(profile_id,course_id) select '"+OLD+"',id from public.courses order by id limit 1;insert into public.lesson_progress(profile_id,lesson_id) select '"+OLD+"',id from public.lessons order by id limit 1;")
  check('old learner enrollment and progress seeded',one("select json_build_array((select count(*) from public.course_enrollments where profile_id='"+OLD+"'),(select count(*) from public.lesson_progress where profile_id='"+OLD+"'));")==[1,1])
  spec=importlib.util.spec_from_file_location('fixture_inventory',ROOT/'scripts/fixture-native/fixture_inventory.py');n=importlib.util.module_from_spec(spec);spec.loader.exec_module(n)
  login=[hashlib.sha256(('lockliel:qjks:login:'+x).encode()).hexdigest() for x in EMAILS]
  subjects=[hashlib.sha256(('lockliel:qjks:auth:'+x).encode()).hexdigest() for x in IDS]
  def inventory(stage):return {k:read(q) for k,q in n.plan(stage,login,None if stage=='before' else subjects)}
  phase='before';before=inventory('before');graph=before['triggerGraph']['graphSha256'];witness=n.validate_extra(before,'before',login,(),graph)
  check('before inventory accepted',witness['collisionCount']==0)
  phase='partial-A';sql('begin;'+create(0)+'commit;')
  partial=inventory('after')
  try:n.validate_extra(partial,'after',login,subjects,graph,witness);raise AssertionError('partial accepted')
  except n.Denied:checks.append('partial A cannot pass two-account acceptance')
  check('partial state does not fabricate B',one("select to_json(count(*)) from auth.users where id='"+IDS[1]+"';")==0)
  phase='complete-B';sql('begin;'+create(1)+'commit;');after=inventory('after');accepted=n.validate_extra(after,'after',login,subjects,graph,witness)
  check('per-account exact seven bootstrap tables plus identities metadata',len(after['bootstrap'])==18 and all(x['validCount']==1 for x in after['bootstrap']))
  check('distinct ordinary A B no roles enrollment progress notes sessions',len(accepted['subjects'])==2)
  check('existing rows unchanged across protected domains',accepted['protectedStateSha256']==witness['protectedStateSha256'])
  check('catalog trigger graph unchanged',after['triggerGraph']==before['triggerGraph'])
  phase='RLS';rls=read("select json_build_object('publicTables',(select count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r'),'enabled',(select count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r' and c.relrowsecurity),'notesTable',has_table_privilege('service_role','public.lesson_private_notes','SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER'),'notesColumn',has_any_column_privilege('service_role','public.lesson_private_notes','SELECT,INSERT,UPDATE,REFERENCES'));")
  check('57 RLS tables and zero service note grants',rls=={'publicTables':57,'enabled':57,'notesTable':False,'notesColumn':False})
  for idx in (0,1):
   uid=IDS[idx];other=IDS[1-idx]
   q="begin read only;set local lock_timeout='5s';set local statement_timeout='30s';set local role authenticated;set local request.jwt.claims='"+json.dumps({'sub':uid,'role':'authenticated','aal':'aal1'})+"';select json_build_array((select count(*) from public.profiles where id='"+uid+"'),(select count(*) from public.profiles where id='"+other+"'),(select count(*) from public.member_journey where profile_id='"+other+"'),(select count(*) from public.communication_preferences where profile_id='"+other+"'));rollback;"
   check(('A' if idx==0 else 'B')+' cross-owner select denial',one(q)==[1,0,0,0])
  phase='negative-defaults'
  # Each local-only malicious mutation is rolled back; no managed transport used.
  changes=[('wrong identity subject',"update auth.identities set provider_id='wrong' where user_id='"+IDS[0]+"'"),('wrong identity email',"update auth.identities set identity_data=jsonb_set(identity_data,'{email}','\"wrong@fixture.invalid\"') where user_id='"+IDS[1]+"'"),('unexpected metadata',"update auth.users set raw_user_meta_data=raw_user_meta_data||'{\"role\":\"manager\"}' where id='"+IDS[0]+"'"),('wrong profile default',"update public.profiles set city='unexpected' where id='"+IDS[0]+"'"),('wrong ordinary claim',"update auth.users set role='service_role' where id='"+IDS[1]+"'"),('unintended enrollment',"insert into public.course_enrollments(profile_id,course_id) select '"+IDS[0]+"',id from public.courses order by id limit 1"),('existing learner mutation',"update public.profiles set city='changed' where id='"+OLD+"'")]
  for name,change in changes:
   phase='negative-'+name
   query='begin;'+change+';'+''.join(q for _,q in n.plan('after',login,subjects))+'rollback;'
   vals=[json.loads(line) for line in sql(query).strip().splitlines()];altered=dict(zip([k for k,_ in n.plan('after',login,subjects)],vals))
   try:n.validate_extra(altered,'after',login,subjects,graph,witness);raise AssertionError('negative accepted '+name)
   except n.Denied:checks.append('reject '+name)
  phase='final';final=inventory('after');n.validate_extra(final,'after',login,subjects,graph,witness)
  check('all negative local changes rolled back',final==after)
  check('280 migration hashes unchanged',hashes=={p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in migrations})
  result['triggerInventory']=read("select coalesce(json_agg(json_build_object('schema',n.nspname,'table',c.relname,'trigger',t.tgname,'functionSchema',pn.nspname,'function',p.proname,'definition',pg_get_triggerdef(t.oid)) order by n.nspname,c.relname,t.tgname),'[]') from pg_trigger t join pg_class c on c.oid=t.tgrelid join pg_namespace n on n.oid=c.relnamespace join pg_proc p on p.oid=t.tgfoid join pg_namespace pn on pn.oid=p.pronamespace where not t.tgisinternal and n.nspname in ('auth','public','app_private','lockliel_cutover');")
  result.update(ok=True,checks=checks,checkCount=len(checks),localTriggerGraphSha256=graph,rls=rls,localCatalogOnly=True,managedAuthHooksVerified=False)
 except BaseException as e:result.update(ok=False,failedPhase=phase,errorCategory=type(e).__name__,checks=checks)
 finally:
  if started:
   try:run('pg_ctl',['-D',str(data),'-m','fast','-w','stop']);result['ownClusterStopped']=True
   except BaseException:result['ownClusterStopped']=False
  if not started or result.get('ownClusterStopped'):shutil.rmtree(base);result['ownFixtureRemoved']=True
  target=Path('/private/tmp/lockliel-wave10ir-sql-result.json');target.write_text(json.dumps(result,indent=2)+'\n')
  print(json.dumps({k:v for k,v in result.items() if k!='triggerInventory'},indent=2))
 return 0 if result.get('ok') else 1
if __name__=='__main__':raise SystemExit(main())
