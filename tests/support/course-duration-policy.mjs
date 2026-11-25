import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {catalogSQL,normalize} from '../../scripts/course-release/runner.mjs';
import {assertPrivateNotesPrivileges} from '../../scripts/course-release/private-notes-review.mjs';

// No live connection parameters. The parent owns the disposable socket cluster.
export function verifyDurationPolicy(sql,repo) {
 const read=path=>readFileSync(join(repo,path),'utf8');
 const fixture=read('tests/fixtures/course-duration-policy/checks.sql');
 const candidate=read('supabase/proposals/trusted-duration-policy/20261001204920_lockliel_current_trusted_duration_gate.sql');
 const baseline=JSON.parse(sql('begin;'+fixture+'rollback;'));
 assert.deepEqual(baseline.filter(row=>!row.passed).map(row=>row.case_number),[3,8],
  'Exact279 regression changed: review the known policy failures before updating expectations');
 console.log('CONFIRMED POLICY FAILURE on authoritative279: cases3 and8 allow stale-credit advancement. Six other focused cases pass.');
 const corrected=JSON.parse(sql('begin;'+candidate+'\n'+fixture+'rollback;'));
 assert.equal(corrected.length,8);
 for(const row of corrected)assert.equal(row.passed,true,row.name);
 // Verify the candidate changes ONLY watch evaluation and completed-save routing,
 // table, RLS, policy, data migration or other function in the targeted catalog.
 const ledger='create schema supabase_migrations;create table supabase_migrations.schema_migrations(version text,name text,statements text[]);';
 const catalogs=sql('begin;'+ledger+catalogSQL+candidate+catalogSQL+'rollback;').trim().split('\n').map(JSON.parse);
 const expected=structuredClone(catalogs[0]);
 for(const [schema,name] of [['app_private','course_watch_met'],['public','lockliel_save_lesson']]){
  const before=expected.functions.find(row=>row.schema===schema&&row.name===name);
  const after=catalogs[1].functions.find(row=>row.schema===schema&&row.name===name);
  assert.notEqual(after.definition,before.definition);
  before.definition=after.definition;
 }
 assert.deepEqual(normalize(catalogs[1]),normalize(expected),'Duration proposal changed unrelated catalog or privileges');
 assertPrivateNotesPrivileges(JSON.parse(sql('begin;'+candidate+read('supabase/verification/course-release-279/private-notes-privileges.sql')+'rollback;')));
 for(const file of ['authorization_boundaries.sql','course_persistence_regression.sql','course_private_notes_privileges.sql']){
  sql('begin;'+candidate+read('supabase/tests/'+file)+'rollback;');
  console.log('PASS duration proposal regression: '+file+' (rolled back)');
 }
 console.log('PASS LOCAL PROPOSAL ONLY: all8 duration cases, unchanged privileges/RLS, two reviewed function deltas. Authoritative279 is NOT policy-cleared.');
}
