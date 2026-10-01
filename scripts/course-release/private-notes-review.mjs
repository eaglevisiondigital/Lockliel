import assert from 'node:assert/strict';

// Intended access, not platform default ACLs. The postgres-owned RPC performs
// writes with explicit learner/session/enrollment checks; it never uses service_role.
export function assertPrivateNotesPrivileges(report) {
 const tables=['public.lesson_private_notes','app_private.course_answer_keys'];
 const roles=['anon','authenticated','service_role'];
 const privileges=['SELECT','INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER','MAINTAIN'];
 assert(Array.isArray(report?.effective),'Private notes privilege evidence missing');
 assert.equal(report.effective.length,tables.length*roles.length*privileges.length,'Incomplete privilege evidence');
 assert.equal(report.public_grants,0,'PUBLIC private-data grant');
 const unexpected=[];
 for(const table of tables)for(const role of roles)for(const privilege of privileges){
  const rows=report.effective.filter(row=>row.table===table&&row.role===role&&row.privilege===privilege);
  assert.equal(rows.length,1,'Missing or duplicate privilege evidence');
  const intended=table==='public.lesson_private_notes'&&role==='authenticated'&&privilege==='SELECT';
  if(rows[0].allowed!==intended)unexpected.push(`${table}:${role}:${privilege}`);
 }
 assert.deepEqual(unexpected,[],'Private notes least-privilege mismatch: '+unexpected.join(', '));
 return true;
}
