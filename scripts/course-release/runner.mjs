import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {manifest,hashes,repo,verifyPrepared,verifyBinary} from './prepare.mjs';
import {assertPrivateNotesPrivileges} from './private-notes-review.mjs';
export const catalogSQL=readFileSync(join(repo,'supabase/verification/course-release-279/catalog.sql'),'utf8');
export function connectionURL({host,port=5432,database='postgres',user='postgres',ca},readonly){
 assert(['db.bsndfhbemstyrrglajat.supabase.co','db.qjksggxorghaxvpyslip.supabase.co','localhost'].includes(host),'Direct endpoint only');
 assert(ca&&ca.startsWith('/'),'Trusted CA path required');
 const u=new URL(`postgresql://${user}@${host}:${port}/${database}`);
 u.searchParams.set('sslmode','verify-full');u.searchParams.set('sslrootcert',ca);
 u.searchParams.set('connect_timeout','5');u.searchParams.set('application_name','lockliel-course-release');
 u.searchParams.set('options','-c lock_timeout=5s -c statement_timeout=30s -c default_transaction_read_only='+(readonly?'on':'off'));
 return u.toString().replaceAll('+','%20');
}
export function psql(connection,sql,{readonly=true,env}={}){
 const r=spawnSync('psql',['-X',connectionURL(connection,readonly),'-v','ON_ERROR_STOP=1','-qAt'],{env,encoding:'utf8',input:sql,timeout:45000});
 if(r.error||r.status!==0)throw Error('Read/check connection failed: '+(r.error?.message||r.stderr).slice(-1200));
 return r.stdout.trim();
}
export const connectionSQL=`select jsonb_build_object('database',current_database(),'server',current_setting('server_version'),'readonly',current_setting('transaction_read_only'),'lock',current_setting('lock_timeout'),'statement',current_setting('statement_timeout'),'ssl',(select ssl from pg_stat_ssl where pid=pg_backend_pid()),'tls',(select version from pg_stat_ssl where pid=pg_backend_pid()),'cipher',(select cipher from pg_stat_ssl where pid=pg_backend_pid()));`;
export function inspect(connection,env){
 const identity=JSON.parse(psql(connection,connectionSQL,{env}));
 assert.equal(identity.database,connection.database||'postgres');assert.match(identity.server,/^17\./);assert.equal(identity.readonly,'on');assert.equal(identity.lock,'5s');assert.equal(identity.statement,'30s');assert.equal(identity.ssl,true);assert(identity.tls&&identity.cipher);
 return {identity,catalog:JSON.parse(psql(connection,catalogSQL,{env}))};
}
export function verifyPostconditions(connection,env,stage){
 const p=JSON.parse(psql(connection,readFileSync(join(repo,'supabase/verification/course-release-277/postconditions.sql'),'utf8'),{env}));
 assert.equal(p.ledger_count,stage);for(const k of ['grip_rules_invalid','duration_invalid','notes_orphans','negative_revisions','invalid_snapshots','progress_totals_invalid'])assert.equal(p[k],0,k);
 for(const k of ['notes_rls','keys_rls','notes_authenticated_select','save_authenticated'])assert.equal(p[k],true,k);
 for(const k of ['notes_authenticated_write','notes_anon_any','keys_authenticated_any','keys_anon_any','save_anon'])assert.equal(p[k],false,k);
 assert.equal(p.save_conflict_pt409,stage>=277);assert.equal(p.save_conflict_40001,stage<277);assert.equal(p.release_trigger_definer,stage>=276);if(stage>=276)assert.equal(p.release_trigger_authenticated,false);
 // Exact catalog agreement is not evidence that inherited grants are intended.
 // Fail closed even when a disposable reference shares the same excessive grants.
 const gate=JSON.parse(psql(connection,'select public.lockliel_course_cutover_status();',{env}));
 assert.equal(gate.paused,true,'Verification requires closed maintenance');
 assertPrivateNotesPrivileges(JSON.parse(psql(connection,readFileSync(join(repo,'supabase/verification/course-release-279/private-notes-privileges.sql'),'utf8'),{env})),{stage,maintenancePaused:gate.paused});
 return p;
}
export function assertLedger(catalog,stage){assert.deepEqual(catalog.ledger.map(x=>x.version),Object.keys(hashes).sort().slice(0,stage).map(f=>f.slice(0,14)),'Wrong repository ledger prefix');}
const itemKey=(k,x)=>k==='functions'?x.schema+'.'+x.name+'('+x.args+')':k==='columns'?x.table+'.'+x.column:k==='policies'?x.schemaname+'.'+x.tablename+'.'+x.policyname:k==='column_grants'?[x.table_schema,x.table_name,x.column_name,x.grantee,x.privilege_type,x.grantor].join('.'):(x.schema||'')+'.'+x.table+'.'+x.name;
export function notesCreationACL(before){
 assert.deepEqual(before.global_table_defaults,[],'Global table defaults require separate review');
 assert.equal(before.table_defaults?.length,1,'Captured postgres public defaults required');
 const d=before.table_defaults[0];assert.equal(d.schema,'public');assert.equal(d.owner,'postgres');
 const acl=[...(d.acl||[])].sort();
 const owner='postgres=arwdDxtm/postgres';
 // Per-schema default ACLs are additive to built-in owner privileges and may
 // omit the owner entry. Nonstandard global defaults were rejected above.
 assert(!acl.some(x=>x.startsWith('postgres=')&&x!==owner),'Unexpected creator privileges');
 const inherited=acl.filter(x=>x!==owner);
 assert(inherited.length===0||(inherited.length===1&&['service_role=Dxtm/postgres','service_role=arwdDxt/postgres'].includes(inherited[0])),'Unreviewed default privileges');
 return [owner,...inherited,'authenticated=r/postgres'].sort();
}
export function expectedTransition(before,referenceBefore,referenceAfter){
 const result=structuredClone(before);
 for(const k of Object.keys(referenceAfter)){
  if(k==='ledger'){result.ledger=[...before.ledger,referenceAfter.ledger.at(-1)];continue;}
  const old=new Map((referenceBefore[k]||[]).map(x=>[itemKey(k,x),x])),next=new Map((referenceAfter[k]||[]).map(x=>[itemKey(k,x),x]));
  let rows=[...(before[k]||[])];
  for(const [key,was] of old){if(!next.has(key))rows=rows.filter(x=>itemKey(k,x)!==key);else{const after=next.get(key);if(JSON.stringify(was)!==JSON.stringify(after)){
   const i=rows.findIndex(x=>itemKey(k,x)===key);assert(i>=0,'Expected prior object missing: '+key);const changed={...rows[i]};for(const field of Object.keys(after))if(JSON.stringify(was[field])!==JSON.stringify(after[field]))changed[field]=after[field];rows[i]=changed;}}}
  for(const [key,item] of next)if(!old.has(key)){assert(!rows.some(x=>itemKey(k,x)===key),'Object collision: '+key);rows.push(k==='tables'&&item.schema==='public'&&item.name==='lesson_private_notes'?{...item,acl:notesCreationACL(before)}:item);}
  result[k]=rows;
 }
 return normalize(result);
}
export function normalize(catalog){return Object.fromEntries(Object.entries(catalog).map(([k,v])=>[k,Array.isArray(v)?[...v].sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b))):v]));}
export function classify(before,expected,observed){
 if(JSON.stringify(normalize(observed))===JSON.stringify(normalize(before)))return 'ROLLED_BACK';
 if(JSON.stringify(normalize(observed))===JSON.stringify(normalize(expected)))return 'COMMITTED';
 return 'UNKNOWN_STOP';
}
export function invokeCLI({binary,root,stage,connection,env,dryRun=true}){
 verifyBinary(binary);verifyPrepared(root);assert([275,276,277,278,279].includes(stage));
 return spawnSync(binary,['db','push','--workdir',join(root,String(stage)),'--db-url',connectionURL(connection,dryRun),'--skip-vault','--yes','--output-format','json',...(dryRun?['--dry-run']:[])],{env,encoding:'utf8',timeout:60000});
}
export function discovery(result,stage){assert(!result.error&&result.status===0,'CLI dry-run failed');const raw=JSON.parse(result.stdout.trim()),d=raw.data||raw;
 assert.deepEqual(d.migrations,[manifest.migrations.find(m=>m.ordinal===stage).filename]);assert.deepEqual(d.seeds,[]);assert.deepEqual(d.roles,[]);return d;
}
// Called only by a separately reviewed operator entry point or disposable rehearsal.
// The caller must provide fresh expected catalog and explicit execution authorization.
export function executeStage(options){
 assert(options.authorized===true,'No execution authorization');
 const before=inspect(options.connection,options.env).catalog;assertLedger(before,options.stage-1);
 assert(options.expected,'Reviewed expected catalog required');
 const gate=JSON.parse(psql(options.connection,'select public.lockliel_course_cutover_status();',{env:options.env}));assert.equal(gate.paused,true,'Maintenance must remain closed');assert.equal(gate.protocol,'278-v1');
 discovery(invokeCLI({...options,dryRun:true}),options.stage);
 const result=invokeCLI({...options,dryRun:false});
 let observed;try{observed=inspect(options.connection,options.env).catalog;}catch{return {state:'UNKNOWN_STOP',clientSucceeded:result.status===0};}
 const state=classify(before,options.expected,observed);
 if(state==='COMMITTED'){try{assertLedger(observed,options.stage);verifyPostconditions(options.connection,options.env,options.stage);}catch{return {state:'UNKNOWN_STOP',clientSucceeded:result.status===0,observed};}}
 return {state,clientSucceeded:result.status===0,observed}; // Never retry, restore, or drop.
}
