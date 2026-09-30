import test from 'node:test';
import assert from 'node:assert/strict';
import {createPersonHandler} from '../netlify/functions/lockliel-admin-person.mjs';

test('MFA course manager reads enrollment once and never requests private learner notes',async()=>{
 const paths=[];
 const token='header.'+Buffer.from(JSON.stringify({aal:'aal2'})).toString('base64url')+'.signature';
 const handler=createPersonHandler({sessionFor:async()=>({user:{id:'manager'},access:token}),fetcher:async url=>{
  const path=new URL(url).pathname.split('/').pop();paths.push(path);
  const data={staff_roles:[{role:'discipleship_admin'}],profile_connection_cards:[{profile_id:'learner',first_name:'Synthetic',last_initial:'A'}],course_enrollments:[{course_id:'course',status:'active'}],courses:[{id:'course'}],lessons:[{id:'unstarted',course_id:'course',position:2},{id:'lesson',course_id:'course',position:1}],lesson_progress:[{lesson_id:'lesson',status:'in_progress',worksheet_answers:{1:'not yet submitted'}}]};
  return Response.json(data[path]||[]);
 }});
 const r=await handler(new Request('https://example.invalid/api/lockliel/admin/person?profileId=learner'));
 assert.equal(r.status,200);
 const body=await r.json();assert.equal(body.courses.length,1);assert.equal(body.courses[0].lessons.length,1);
 assert.equal(body.courses[0].totalLessons,2,'Unstarted lessons must remain in the completion denominator');
 assert.equal(body.courses[0].currentLesson.id,'lesson','First incomplete lesson follows course order');
 assert.equal(body.courses[0].lessons[0].worksheet_answers,undefined);
 assert.ok(!paths.includes('lesson_private_notes'));
 assert.equal(body.profile.email,null);
});
