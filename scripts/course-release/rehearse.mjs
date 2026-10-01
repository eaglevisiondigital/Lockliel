// Entirely disposable. No caller-supplied DB URL or production credentials accepted.
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,readFileSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync,spawn} from 'node:child_process';
import {randomBytes} from 'node:crypto';
import {createConnection,createServer} from 'node:net';
import {repo,manifest,prepare,verifyBinary,verifyPrepared} from './prepare.mjs';
import {catalogSQL,connectionURL,inspect,invokeCLI,discovery,classify,normalize,expectedTransition,executeStage,assertLedger,verifyPostconditions} from './runner.mjs';
assert.equal(process.argv.length,2,'No connection arguments allowed');
const binary=process.env.LOCKLIEL_SUPABASE_BIN;verifyBinary(binary);
await new Promise((ok,fail)=>{const s=createConnection({host:'192.0.2.1',port:443});s.setTimeout(1000,()=>{s.destroy();fail(Error('OS outbound denial required'));});s.on('connect',()=>{s.destroy();fail(Error('External network available'));});s.on('error',e=>['EPERM','EACCES'].includes(e.code)?ok():fail(e));});
const port=await new Promise(ok=>{const s=createServer();s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>ok(p));});});
const root=mkdtempSync(join(tmpdir(),'lockliel-course-rehearsal-')),data=join(root,'data'),sock=join(root,'socket');mkdirSync(sock,{mode:0o700});
const password=randomBytes(24).toString('hex'),env={PATH:process.env.PATH,LANG:'C',LC_ALL:'C',SUPABASE_TELEMETRY_DISABLED:'1',DO_NOT_TRACK:'1',PGPASSWORD:password,PGPASSFILE:join(root,'empty-pass')};
writeFileSync(join(root,'password'),password,{mode:0o600});writeFileSync(env.PGPASSFILE,'',{mode:0o600});
let started=false;const evidence={source:manifest.source_commit,stages:[],failures:[],tls:{},maintenance:{}};
function run(command,args,options={}){const r=spawnSync(command,args,{env,cwd:root,encoding:'utf8',timeout:120000,...options});if(r.error||r.status!==0)throw Error(command+': '+(r.error?.message||r.stderr||r.stdout).slice(-2400));return r.stdout.trim();}
const quote=s=>"'"+s.replaceAll("'","''")+"'";
const args=db=>['-X','-h',sock,'-p',String(port),'-U','postgres','-d',db,'-v','ON_ERROR_STOP=1','-qAt'];
const sql=(q,db='postgres')=>run('psql',args(db),{input:q});
const catalog=db=>JSON.parse(sql(catalogSQL,db));
function cleanup(){if(started){run('pg_ctl',['-D',data,'-m','immediate','-w','stop']);started=false;}rmSync(root,{recursive:true,force:true});}
for(const signal of ['SIGINT','SIGTERM'])process.once(signal,()=>{cleanup();process.exit(1);});
const connection=db=>({host:'localhost',port,database:db,ca:join(root,'ca.crt')});
const clone=(name,template='baseline')=>{sql('create database '+name+' template '+template);return name;};
try{
 assert.match(run('initdb',['--version']),/PostgreSQL\) 17\./);assert.equal(run(binary,['--version']),manifest.cli_version);
 run('openssl',['req','-x509','-newkey','rsa:2048','-nodes','-keyout','ca.key','-out','ca.crt','-days','1','-subj','/CN=Lockliel disposable CA']);
 run('openssl',['req','-newkey','rsa:2048','-nodes','-keyout','server.key','-out','server.csr','-subj','/CN=localhost']);
 writeFileSync(join(root,'extensions'),'subjectAltName=DNS:localhost\nextendedKeyUsage=serverAuth\n');
 run('openssl',['x509','-req','-in','server.csr','-CA','ca.crt','-CAkey','ca.key','-CAcreateserial','-out','server.crt','-days','1','-extfile','extensions']);
 run('chmod',['600',join(root,'server.key')]);
 run('initdb',['-D',data,'-U','postgres','-A','scram-sha-256','--pwfile',join(root,'password'),'--no-locale','-E','UTF8']);
 writeFileSync(join(data,'postgresql.conf'),readFileSync(join(data,'postgresql.conf'),'utf8')+`\nlisten_addresses='127.0.0.1,::1'\nport=${port}\nunix_socket_directories='${sock}'\nunix_socket_permissions=0700\nssl=on\nssl_cert_file='${join(root,'server.crt')}'\nssl_key_file='${join(root,'server.key')}'\n`);
 run('pg_ctl',['-D',data,'-l',join(root,'pg.log'),'-w','start']);started=true;
 assert.equal(sql("select current_setting('data_directory')"),data);
 sql('create database baseline');sql(readFileSync(join(repo,'tests/support/supabase-compat.sql'),'utf8'),'baseline');
 sql('create role authenticator nologin; create schema supabase_migrations; create table supabase_migrations.schema_migrations(version text primary key,name text,statements text[]);','baseline');
 const files=Object.keys({...JSON.parse(readFileSync(join(repo,manifest.historical_manifest))),...Object.fromEntries(manifest.migrations.map(m=>[m.filename,m.sha256]))}).sort();
 for(const f of files.slice(0,274)){const source=readFileSync(join(repo,'supabase/migrations',f),'utf8');sql('begin;\n'+source+'\ninsert into supabase_migrations.schema_migrations values('+quote(f.slice(0,14))+','+quote(f.slice(15,-4))+',array['+quote(source)+']);commit;','baseline');}
 const release=prepare(join(root,'release'));
 const ident=inspect(connection('baseline'),env);evidence.tls.positive=ident.identity;
 const badhost=connectionURL(connection('baseline'),true).replace('localhost:', 'wrong.localhost:')+'&hostaddr=127.0.0.1';
 const bad=spawnSync('psql',['-X',badhost,'-qAt','-c','select 1'],{env,encoding:'utf8',timeout:10000});assert.notEqual(bad.status,0);assert.match(bad.stderr,/does not match host name|certificate/i);evidence.tls.wrongHost='rejected';
 run('openssl',['req','-x509','-newkey','rsa:2048','-nodes','-keyout','wrong.key','-out','wrong.crt','-days','1','-subj','/CN=Wrong CA']);
 const wrong={...connection('baseline'),ca:join(root,'wrong.crt')};assert.throws(()=>inspect(wrong,env),/certificate|SSL/i);evidence.tls.wrongCA='rejected';
 console.log('PASS direct TLS verify-full, actual read-only/timeouts and wrong-host/CA denials');
 sql("insert into public.courses(slug,title,status) values('cutover-synthetic','Before drain','draft');",'baseline');
 const draining=spawn('psql',args('baseline'),{env,stdio:['pipe','pipe','pipe']});let drainReady=false;draining.stdout.on('data',b=>{if(b.toString().includes('LOCKED'))drainReady=true;});draining.stderr.resume();
 draining.stdin.end("begin;update public.courses set title='In-flight write committed' where slug='cutover-synthetic';select 'LOCKED';select pg_sleep(2);commit;");
 while(!drainReady){await new Promise(r=>setTimeout(r,20));if(draining.exitCode!==null)throw Error('Drain holder failed');}
 const drainStart=Date.now();
 sql("set lock_timeout='5s';set statement_timeout='30s';"+readFileSync(join(repo,'supabase/verification/course-release-279/maintenance-install.sql'),'utf8'),'baseline');
 assert(Date.now()-drainStart>1200,'Pause did not drain in-flight write');assert.equal(sql("select title from public.courses where slug='cutover-synthetic'",'baseline'),'In-flight write committed');
 assert.throws(()=>sql("begin;select set_config('request.jwt.claims','{\"role\":\"authenticated\"}',true);update public.courses set title='Must not save' where slug='cutover-synthetic';commit;",'baseline'),/being updated/);
 sql("update lockliel_cutover.control set paused=false",'baseline');assert.equal(sql("select public.lockliel_course_cutover_status()->>'paused'",'baseline'),'true','Schema274 must stay closed even if operator opens the flag');sql("update lockliel_cutover.control set paused=true",'baseline');
 console.log('PASS in-flight write drained before pause committed; later course writes rejected');

 // Assert write connection safeguards at DDL start and migration-ledger insertion.
 sql(`create schema rehearsal;create table rehearsal.control(mode text);insert into rehearsal.control values('normal');
 create function rehearsal.guard() returns event_trigger language plpgsql as $$begin
  if (select mode='permission' from rehearsal.control) then raise insufficient_privilege using message='Synthetic permission failure';end if;
 end$$;
 create event trigger release_connection_guard on ddl_command_start execute function rehearsal.guard();
 create function rehearsal.ledger_probe() returns trigger language plpgsql as $$declare m text;begin
 assert current_setting('lock_timeout')='5s';assert current_setting('statement_timeout')='30s';assert current_setting('transaction_read_only')='off';assert (select ssl from pg_stat_ssl where pid=pg_backend_pid());
 select mode into m from rehearsal.control;
 if m='sql_error' then raise exception 'Synthetic SQL error before commit';end if;
 if m='statement_timeout' then perform pg_sleep(31);end if;
 if m='disconnect' then perform pg_terminate_backend(pg_backend_pid());end if;
 return new;end$$;
 create trigger release_probe before insert on supabase_migrations.schema_migrations for each row execute function rehearsal.ledger_probe();`,'baseline');
 const priorReferences=JSON.parse(readFileSync(join(repo,'supabase/verification/course-release-279/stage-reference.json')));
 const references={274:catalog('baseline')};const happy=clone('happy');
 for(const stage of [275,276,277,278,279]){
 const c=connection(happy);const before=catalog(happy);discovery(invokeCLI({binary,root:release,stage,connection:c,env}),stage);verifyPrepared(release);
 if(stage===279){
  // Bootstrap only the new canonical reference in a disposable clone using the
  // pinned CLI. Assert every non-ledger byte differs solely by service ACL removal.
  const db=clone('reference279',happy);
  const applied=invokeCLI({binary,root:release,stage,connection:connection(db),env,dryRun:false});assert.equal(applied.status,0);
  const actual=catalog(db);assertLedger(actual,279);verifyPostconditions(connection(db),env,279);
  const intended=structuredClone(before);
  intended.tables.find(t=>t.schema==='public'&&t.name==='lesson_private_notes').acl=intended.tables.find(t=>t.schema==='public'&&t.name==='lesson_private_notes').acl.filter(a=>!a.startsWith('service_role='));
  intended.ledger=actual.ledger;assert.deepEqual(normalize(actual),normalize(intended),'279 caused unrelated catalog drift');
  priorReferences[279]=actual;
 }
 const expected=expectedTransition(before,priorReferences[stage-1],priorReferences[stage]);
 const r=executeStage({binary,root:release,stage,connection:c,env,authorized:true,expected});assert.equal(r.state,'COMMITTED');assert.equal(r.clientSucceeded,true);
 const after=inspect(c,env).catalog;assert.equal(after.ledger.length,stage);references[stage]=after;assert.equal(sql("select public.lockliel_course_cutover_status()->>'paused'",happy),'true');
 evidence.stages.push({stage,only:files[stage-1],ledger:stage,tlsAndTimeoutsAssertedOnWriter:true});console.log('PASS exact pinned CLI stage '+stage+', catalog/ledger captured, maintenance stays closed');
 assert.equal(classify(before,after,after),'COMMITTED');clone('stage_'+stage,happy);
 }
 // Exact CLI rehearsal with captured production full8 and already-restricted
 // creation defaults. Neither profile authorizes service access after279.
 evidence.defaultACLProfiles=[];
 for(const profile of ['production_full8','restricted_zero']){
  const db=clone('acl_'+profile);
  sql('alter default privileges for role postgres in schema public revoke all on tables from service_role;'+
   (profile==='production_full8'?'alter default privileges for role postgres in schema public grant all on tables to service_role;':''),db);
  const defaults=catalog(db).table_defaults;
  for(const stage of [275,276,277,278,279]){
   const before=catalog(db),expected=expectedTransition(before,references[stage-1],references[stage]);
   const result=executeStage({binary,root:release,stage,connection:connection(db),env,authorized:true,expected});
   assert.equal(result.state,'COMMITTED');assert.equal(result.clientSucceeded,true);
   assert.deepEqual(catalog(db).table_defaults,defaults);
   assert.equal(sql("select public.lockliel_course_cutover_status()->>'paused'",db),'true');
  }
  evidence.defaultACLProfiles.push({profile,stages:[275,276,277,278,279],finalServicePrivileges:0,defaultsUnchanged:true,maintenance:'ON'});
  console.log('PASS exact five-stage CLI '+profile+': defaults preserved, final notes zero service privileges');
 }
 // Each migration stage failure independently leaves hosted-equivalent maintenance closed.
 for(const stage of [275,276,277,278,279]){
  const db=clone('closed_failure_'+stage,stage===275?'baseline':'stage_'+(stage-1));sql("update rehearsal.control set mode='permission'",db);
  const before=catalog(db),expected=expectedTransition(before,references[stage-1],references[stage]);
  const r=executeStage({binary,root:release,stage,connection:connection(db),env,authorized:true,expected});assert.equal(r.state,'ROLLED_BACK');assert.equal(r.clientSucceeded,false);assert.equal(sql("select public.lockliel_course_cutover_status()->>'paused'",db),'true');
  evidence.failures.push({mode:'stage_'+stage+'_failure',state:r.state,maintenance:'ON',operator:'STOP / INVESTIGATE'});
 }
 // Verify reference deltas preserve pre-existing production-only grants rather than replacing the catalog wholesale.
 for(const stage of [275,276,277,278,279])assert.deepEqual(expectedTransition(references[stage-1],references[stage-1],references[stage]),normalize(references[stage]));
 writeFileSync(join(repo,'supabase/verification/course-release-279/stage-reference.json'),JSON.stringify(references,null,2)+'\n');
 for(const mode of ['sql_error','permission','statement_timeout','disconnect']){
 const db=clone('failure_'+mode);sql('update rehearsal.control set mode='+quote(mode),db);const before=catalog(db);
 const r=invokeCLI({binary,root:release,stage:275,connection:connection(db),env,dryRun:false});assert.notEqual(r.status,0,'Failure injection did not fail');const observed=catalog(db);assert.equal(classify(before,references[275],observed),'ROLLED_BACK');
 evidence.failures.push({mode,state:'ROLLED_BACK'});console.log('PASS '+mode+': SQL and ledger rolled back; no retry');
 }
 // Real conflicting transaction forces the pinned CLI lock_timeout.
 const locked=clone('failure_lock');const before=catalog(locked);const holder=spawn('psql',args(locked),{env,stdio:['pipe','pipe','pipe']});holder.stdin.end('begin; lock table public.lesson_assets in access exclusive mode; select pg_sleep(12); rollback;');
 await new Promise(r=>setTimeout(r,700));const lr=invokeCLI({binary,root:release,stage:275,connection:connection(locked),env,dryRun:false});assert.notEqual(lr.status,0);assert.match(lr.stderr+lr.stdout,/lock timeout/i);holder.kill('SIGTERM');await new Promise(r=>holder.once('exit',r));assert.equal(classify(before,references[275],catalog(locked)),'ROLLED_BACK');evidence.failures.push({mode:'lock_timeout',state:'ROLLED_BACK'});console.log('PASS real lock timeout');
 // Commit-state mismatch probes mutate only cloned disposable catalogs.
 const missing=clone('ledger_only');sql("alter table supabase_migrations.schema_migrations disable trigger release_probe;insert into supabase_migrations.schema_migrations values('20260929215159','synthetic',array['synthetic']);",missing);
 assert.equal(classify(references[274],references[275],catalog(missing)),'UNKNOWN_STOP');
 const objects=clone('objects_only','happy');sql("delete from supabase_migrations.schema_migrations where version>='20260929215159'",objects);
 assert.equal(classify(references[274],references[279],catalog(objects)),'UNKNOWN_STOP');
 evidence.failures.push({mode:'ledger_only',state:'UNKNOWN_STOP'},{mode:'objects_only',state:'UNKNOWN_STOP'});
 // A failed client report is never used as proof of rollback.
 assert.equal(classify(references[278],references[279],catalog(happy)),'COMMITTED');
 evidence.failures.push({mode:'client_failure_after_commit',state:'COMMITTED'});
 // Real TCP loss after the server committed but before its result reaches the client.
 const network=clone('network_after_commit'),networkBefore=catalog(network),sockets=new Set(),timers=new Set();let cut=false;
 const proxy=createServer(client=>{
  const upstream=createConnection({host:'127.0.0.1',port});sockets.add(client);sockets.add(upstream);
  client.on('error',()=>{});upstream.on('error',()=>client.destroy());client.on('close',()=>upstream.destroy());upstream.on('close',()=>client.destroy());
  client.pipe(upstream);upstream.on('data',chunk=>{const timer=setTimeout(()=>{timers.delete(timer);if(!cut&&!client.destroyed)client.write(chunk);},300);timers.add(timer);});
 });
 await new Promise(r=>proxy.listen(0,'127.0.0.1',r));
 const child=spawn(binary,['db','push','--workdir',join(release,'275'),'--db-url',connectionURL({...connection(network),port:proxy.address().port},false),'--skip-vault','--yes','--output-format','json'],{env,stdio:['ignore','pipe','pipe']});
 child.stdout.resume();child.stderr.resume();
 const clientExit=new Promise(r=>child.once('exit',r));
 const deadline=Date.now()+45000;
 while(Date.now()<deadline){
  if(sql("select count(*) from supabase_migrations.schema_migrations where version='20260929215159'",network)==='1'){cut=true;break;}
  await new Promise(r=>setTimeout(r,30));
 }
 for(const t of timers)clearTimeout(t);for(const socket of sockets)socket.destroy();await new Promise(r=>proxy.close(r));
 if(!cut)child.kill('SIGTERM');const networkStatus=await clientExit;
 assert(cut,'Server never committed during TCP test');assert.notEqual(networkStatus,0,'Client unexpectedly acknowledged before network cut');
 assert.equal(classify(networkBefore,references[275],catalog(network)),'COMMITTED');evidence.failures.push({mode:'tcp_loss_after_commit',state:'COMMITTED',clientStatus:networkStatus});console.log('PASS actual TCP loss after commit: read-only verifier recognizes committed state');
 // Hook tests exercise the actual SQL guard without requiring a PostgREST binary.
 const guard=(db,path,method='POST',protocol='')=>sql(`begin;select set_config('request.path',${quote(path)},true),set_config('request.method',${quote(method)},true),set_config('request.headers',${quote(JSON.stringify({'x-lockliel-course-protocol':protocol}))},true);select lockliel_cutover.request();rollback;`,db);
 for(const stage of [274,279]){
 const db=stage===274?'baseline':'happy';assert.throws(()=>guard(db,'/rpc/lockliel_sample_media'),/being updated/);assert.throws(()=>guard(db,'/lesson_progress'),/being updated/);guard(db,'/profiles');guard(db,'/rpc/lockliel_course_cutover_status');
 assert.equal(sql("select public.lockliel_course_cutover_status()->>'paused'",db),'true');
 }
 sql("update lockliel_cutover.control set paused=false",happy);
 assert.throws(()=>guard(happy,'/rpc/lockliel_sample_media'),/Reload/);guard(happy,'/rpc/lockliel_sample_media','POST','278-v1');guard(happy,'/courses','GET');guard(happy,'/rpc/lockliel_course_gates');guard(happy,'/rpc/lockliel_grip_readiness');guard(happy,'/profiles');
 evidence.maintenance={inflightDrained:true,laterDirectWriteRejected:true,schema274Paused:true,schema279Paused:true,oldProtocolRejectedAfterReopen:true,newProtocolAcceptedAfterReopen:true,unrelatedProfilesRouteAllowed:true,scope:'Disposable PostgreSQL only; hosted evidence is reported separately'};
 // Two-session publication race: sampling holds publication locks until commit;
 // an unpublication that wins the lock first must cause the waiting sampler to deny.
 const fixture=JSON.parse(sql(`do $$declare u uuid:=gen_random_uuid();sid uuid:=gen_random_uuid();c uuid;l uuid;a uuid;begin
 insert into auth.users(id,email,raw_user_meta_data) values(u,u||'@example.invalid','{}');insert into auth.sessions(id,user_id,aal) values(sid,u,'aal1');
 insert into public.courses(slug,title,status,translation_key,language_code) values('race','Synthetic race','published','race','en') returning id into c;
 insert into public.lessons(course_id,position,slug,title,worksheet_schema) values(c,1,'race','Synthetic','{"questions":[{"number":1,"text":"Synthetic"}]}') returning id into l;
 insert into public.lesson_assets(lesson_id,asset_type,provider,provider_ref,status,duration_seconds) values(l,'video','youtube','synthetic01','active',100) returning id into a;
 insert into public.course_enrollments(profile_id,course_id) values(u,c);
 create table rehearsal.fixture(value jsonb);insert into rehearsal.fixture values(jsonb_build_object('user',u,'session',sid,'course',c,'asset',a));end$$;select value from rehearsal.fixture;`,happy));
 const claims=JSON.stringify({sub:fixture.user,session_id:fixture.session,role:'authenticated',aal:'aal1'});
 const sampleSQL=`select set_config('request.jwt.claims',${quote(claims)},true);set local role authenticated;select public.lockliel_sample_media('${fixture.user}','${fixture.asset}',0,false);`;
 async function hold(q){const p=spawn('psql',args(happy),{env,stdio:['pipe','pipe','pipe']});let ready=false;p.stdout.on('data',b=>{if(b.toString().includes('HELD'))ready=true;});p.stderr.resume();const done=new Promise(r=>p.once('exit',r));p.stdin.end('begin;'+q+"select 'HELD';select pg_sleep(2);commit;");while(!ready){await new Promise(r=>setTimeout(r,20));if(p.exitCode!==null)throw Error('Concurrent holder failed');}return {p,done};}
 const sampler=await hold(sampleSQL);assert.throws(()=>sql("set lock_timeout='200ms';update public.courses set status='draft' where id='"+fixture.course+"';",happy),/lock timeout/);assert.equal(await sampler.done,0);
 const unpublisher=await hold("update public.courses set status='draft' where id='"+fixture.course+"';");
 assert.throws(()=>sql('begin;'+sampleSQL+'commit;',happy),/not available|eligible|unavailable/i);assert.equal(await unpublisher.done,0);
 evidence.publicationConcurrency={samplingLocksPublication:true,unpublishFirstRejectsWaitingSampler:true};console.log('PASS publication concurrency in both lock orders');
 evidence.pending='Hosted schema execution and full old-app/new-app acceptance are reported separately; this proves only disposable five-stage behavior';
 writeFileSync(join(repo,'docs/evidence/verifier-duration-policy-2026-10-01/rehearsal-279.json'),JSON.stringify(evidence,null,2)+'\n');
 console.log('Staged runner and failure rehearsal evidence saved; remaining maintenance cases explicitly pending');
}finally{cleanup();}
