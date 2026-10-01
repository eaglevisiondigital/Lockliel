// Called only inside test-sql.mjs's fresh socket-only PostgreSQL17 cluster at274.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {assertLedger,catalogSQL,classify,expectedTransition} from '../../scripts/course-release/runner.mjs';
import {assertPrivateNotesPrivileges} from '../../scripts/course-release/private-notes-review.mjs';

export function verifyCourseACLMatrix(sql,repo,migrations) {
 const read=path=>readFileSync(join(repo,path),'utf8');
 const reference=JSON.parse(read('supabase/verification/course-release-279/stage-reference.json'));
 const securitySQL=read('supabase/verification/course-release-279/private-notes-privileges.sql').trim().replace(/;$/,'');
 const catalog=catalogSQL.trim().replace(/;$/,'');
 const snapshot=(stage,label='stage')=>`select jsonb_build_object('stage',${stage},'label','${label}'${label==='stage'?`, 'catalog',(${catalog})`:''}${stage>274?`, 'security',(${securitySQL})`:''});`;
 const ledger=migrations.slice(0,274).map(file=>`('${file.slice(0,14)}')`).join(',');
 const drifts=[
  ['service_table','grant select on public.lesson_private_notes to service_role'],
  ['service_maintain','grant maintain on public.lesson_private_notes to service_role'],
  ['service_column_select','grant select(body) on public.lesson_private_notes to service_role'],
  ['service_column_update','grant update(body) on public.lesson_private_notes to service_role'],
  ['service_column_insert','grant insert(body) on public.lesson_private_notes to service_role'],
  ['service_column_references','grant references(body) on public.lesson_private_notes to service_role'],
  ['anon_table','grant select on public.lesson_private_notes to anon'],
  ['anon_column','grant select(body) on public.lesson_private_notes to anon'],
  ['authenticated_write','grant update(body) on public.lesson_private_notes to authenticated'],
  ['authenticated_truncate','grant truncate on public.lesson_private_notes to authenticated'],
  ['public_table','grant select on public.lesson_private_notes to public'],
  ['public_column','grant select(body) on public.lesson_private_notes to public'],
  ['keys_service_column','grant select(answers) on app_private.course_answer_keys to service_role'],
 ];
 for(const profile of ['production_full8','restricted_zero']){
  let source=`begin;
   alter default privileges for role postgres in schema public revoke all on tables from service_role;
   ${profile==='production_full8'?'alter default privileges for role postgres in schema public grant all on tables to service_role;':''}
   create schema supabase_migrations;
   create table supabase_migrations.schema_migrations(version text primary key,name text,statements text[]);
   insert into supabase_migrations.schema_migrations(version) values ${ledger};
   ${snapshot(274)}`;
  for(const stage of [275,276,277,278,279])source+=read('supabase/migrations/'+migrations[stage-1])+`
   insert into supabase_migrations.schema_migrations(version) values('${migrations[stage-1].slice(0,14)}');
   ${snapshot(stage)}`;
  for(const [label,drift] of drifts)source+=`savepoint drift;${drift};${snapshot(279,label)}rollback to savepoint drift;`;
  source+='rollback;';
  const rows=sql(source).trim().split('\n').map(line=>JSON.parse(line));
  let before=rows[0].catalog;
  const defaults=structuredClone(before.table_defaults);
  for(const row of rows.slice(1,6)){
   assertLedger(row.catalog,row.stage);
   const expected=expectedTransition(before,reference[row.stage-1],reference[row.stage]);
   // This SQL replay deliberately writes versions only. The separate pinned CLI
   // rehearsal verifies actual CLI names/statements and ledger transactionality.
   expected.ledger=row.catalog.ledger;
   assert.equal(classify(before,expected,row.catalog),'COMMITTED',`${profile}/${row.stage} exact catalog`);
   assert.deepEqual(row.catalog.table_defaults,defaults,'Migration changed creation defaults');
   assertPrivateNotesPrivileges(row.security,{stage:row.stage,maintenancePaused:true});
   if(row.stage<279&&profile==='production_full8'){
    assert.throws(()=>assertPrivateNotesPrivileges(row.security),/least-privilege/,'Missing279 must fail final security');
    assert.throws(()=>assertLedger(row.catalog,279),/Wrong repository ledger/);
   }
   before=row.catalog;
  }
  for(const row of rows.slice(6))assert.throws(()=>assertPrivateNotesPrivileges(row.security),/least-privilege|PUBLIC/,`${profile}/${row.label} did not fail closed`);
  console.log(`PASS ACL ${profile}: exact275–279 catalog, unchanged defaults, final zero service table/column privileges; ${drifts.length} actual grant defects rejected.`);
 }
 console.log('PASS ACL cases A/B/C/D: production full8, restricted defaults, excessive actual grants, missing/incomplete279 fail closed.');
}
