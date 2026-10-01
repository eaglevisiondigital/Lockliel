import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {assertPrivateNotesPrivileges} from '../scripts/course-release/private-notes-review.mjs';
import {classify,expectedTransition,notesCreationACL} from '../scripts/course-release/runner.mjs';

const intended=()=>({public_grants:0,effective:
 ['public.lesson_private_notes','app_private.course_answer_keys'].flatMap(table=>
 ['anon','authenticated','service_role'].flatMap(role=>
 ['SELECT','INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER','MAINTAIN'].map(privilege=>
 ({table,role,privilege,allowed:table==='public.lesson_private_notes'&&role==='authenticated'&&privilege==='SELECT'}))))});
test('private notes require owner-scoped SELECT only; controlled RPC needs no service table privilege',()=>{
 assert.equal(assertPrivateNotesPrivileges(intended()),true);
});
test('hosted Dxtm and disposable broad service defaults are rejected, not accepted as intended access',()=>{
 for(const grants of [['TRUNCATE','REFERENCES','TRIGGER','MAINTAIN'],['SELECT','INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER']]){
  const report=intended();for(const row of report.effective)if(row.table==='public.lesson_private_notes'&&row.role==='service_role'&&grants.includes(row.privilege))row.allowed=true;
  assert.throws(()=>assertPrivateNotesPrivileges(report),/least-privilege mismatch/);
 }
});
test('known intermediate grants are allowed only at275–278 with maintenance closed;279 always rejects them',()=>{
 const report=intended();for(const row of report.effective)if(row.table==='public.lesson_private_notes'&&row.role==='service_role'&&['TRUNCATE','REFERENCES','TRIGGER','MAINTAIN'].includes(row.privilege))row.allowed=true;
 for(const stage of [275,276,277,278]){
  assert.equal(assertPrivateNotesPrivileges(report,{stage,maintenancePaused:true}),true);
  assert.throws(()=>assertPrivateNotesPrivileges(report,{stage,maintenancePaused:false}),/closed maintenance/);
 }
 assert.throws(()=>assertPrivateNotesPrivileges(report,{stage:279,maintenancePaused:true}),/least-privilege/);
 report.effective.find(row=>row.table==='public.lesson_private_notes'&&row.role==='service_role'&&row.privilege==='SELECT').allowed=true;
 assert.throws(()=>assertPrivateNotesPrivileges(report,{stage:278,maintenancePaused:true}),/Unknown intermediate/);
});
test('new notes ACL derives from captured creator defaults and rejects unreviewed grants',()=>{
 const base={global_table_defaults:[],table_defaults:[{schema:'public',owner:'postgres',acl:['postgres=arwdDxtm/postgres','service_role=Dxtm/postgres']}]};
 assert.deepEqual(notesCreationACL(base),['authenticated=r/postgres','postgres=arwdDxtm/postgres','service_role=Dxtm/postgres']);
 const additive=structuredClone(base);additive.table_defaults[0].acl=['service_role=Dxtm/postgres'];assert.deepEqual(notesCreationACL(additive),notesCreationACL(base));
 for(const grant of ['anon=r/postgres','authenticated=arwd/postgres','service_role=arwdDxtm/postgres','other=r/postgres']){
  const bad=structuredClone(base);bad.table_defaults[0].acl.push(grant);assert.throws(()=>notesCreationACL(bad),/Unreviewed/);
 }
 assert.throws(()=>notesCreationACL({...base,global_table_defaults:[['=r/postgres']]}),/Global/);
});
test('captured production defaults survive every transition; actual279 notes grants are zero',()=>{
 const reference=JSON.parse(readFileSync(new URL('../supabase/verification/course-release-279/stage-reference.json',import.meta.url)));
 let current=JSON.parse(readFileSync(new URL('../docs/evidence/final-production-readiness-resumed-2026-10-01/catalog.json',import.meta.url)));
 const defaults=structuredClone(current.table_defaults);
 assert.deepEqual(notesCreationACL(current),['authenticated=r/postgres','postgres=arwdDxtm/postgres','service_role=arwdDxtm/postgres']);
 for(const stage of [275,276,277,278,279]){
  current=expectedTransition(current,reference[stage-1],reference[stage]);
  assert.deepEqual(current.table_defaults,defaults);
  const notes=current.tables.find(row=>row.name==='lesson_private_notes');
  assert.equal(notes.acl.includes('service_role=arwdDxtm/postgres'),stage<279);
 }
 assert.deepEqual(current.tables.find(row=>row.name==='lesson_private_notes').acl,['authenticated=r/postgres','postgres=arwdDxtm/postgres']);
});
test('all eight inherited service privileges require closed maintenance before279 and fail at279',()=>{
 const report=intended();
 for(const row of report.effective)if(row.table==='public.lesson_private_notes'&&row.role==='service_role')row.allowed=true;
 for(const stage of [275,276,277,278]){
  assert.equal(assertPrivateNotesPrivileges(report,{stage,maintenancePaused:true}),true);
  assert.throws(()=>assertPrivateNotesPrivileges(report,{stage}),/closed maintenance/);
 }
 assert.throws(()=>assertPrivateNotesPrivileges(report),/least-privilege/);
});
test('each effective service privilege individually fails final279, including additive column access',()=>{
 for(const row of intended().effective.filter(row=>row.role==='service_role')){
  const report=intended();report.effective.find(x=>x.table===row.table&&x.role===row.role&&x.privilege===row.privilege).allowed=true;
  assert.throws(()=>assertPrivateNotesPrivileges(report),/least-privilege/);
 }
});
test('anonymous, member writes, grading-key service grants, PUBLIC and missing evidence fail closed',()=>{
 for(const [table,role,privilege] of [['public.lesson_private_notes','anon','SELECT'],['public.lesson_private_notes','authenticated','UPDATE'],['app_private.course_answer_keys','service_role','SELECT']]){
  const report=intended();report.effective.find(row=>row.table===table&&row.role===role&&row.privilege===privilege).allowed=true;
  assert.throws(()=>assertPrivateNotesPrivileges(report),/least-privilege mismatch/);
 }
 assert.throws(()=>assertPrivateNotesPrivileges({...intended(),public_grants:1}),/PUBLIC/);
 const incomplete=intended();incomplete.effective.pop();assert.throws(()=>assertPrivateNotesPrivileges(incomplete),/Incomplete/);
});
test('captured hosted275 mismatch remains UNKNOWN_STOP; reference defaults do not authorize broader grants',()=>{
 const reference=JSON.parse(readFileSync(new URL('../supabase/verification/course-release-279/stage-reference.json',import.meta.url)));
 const expected=expectedTransition(reference[274],reference[274],reference[275]);
 const observed=structuredClone(expected);
 const notes=observed.tables.find(row=>row.schema==='public'&&row.name==='lesson_private_notes');
 notes.acl=notes.acl.map(acl=>acl==='service_role=arwdDxt/postgres'?'service_role=Dxtm/postgres':acl);
 assert.equal(classify(reference[274],expected,observed),'UNKNOWN_STOP');
 // An unexpected grant, policy or owner must still stop, never be normalized away.
 notes.acl.push('anon=r/postgres');assert.equal(classify(reference[274],expected,observed),'UNKNOWN_STOP');
 for(const mutate of [
  value=>{value.functions.find(row=>row.name==='lockliel_save_lesson').owner='authenticated';},
  value=>{value.policies=value.policies.filter(row=>row.policyname!=='lesson_private_notes_owner');},
 ]){
  const drift=structuredClone(expected);mutate(drift);
  assert.equal(classify(reference[274],expected,drift),'UNKNOWN_STOP');
 }
});
