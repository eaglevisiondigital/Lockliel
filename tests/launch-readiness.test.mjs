import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../netlify/functions/lockliel-admin-readiness.mjs';
const healthy={healthy:true,issue_count:0,security_issue_count:0,media_evidence_issue_count:0};
async function run(options={}){
  const original=globalThis.fetch;
  const calls=[];
  const token='test.'+Buffer.from(JSON.stringify({aal:options.aal||'aal2'})).toString('base64url')+'.test';
  const reply=(v,status=200)=>new Response(JSON.stringify(v),{status});
  globalThis.fetch=async(url,init={})=>{
    const u=new URL(url);calls.push({url:u,init});
    if(u.pathname==='/auth/v1/user')return reply({id:'11111111-1111-4111-8111-111111111111'});
    if(u.pathname.endsWith('/lockliel_current_session_active'))return reply(true);
    if(u.pathname.endsWith('/staff_roles'))return reply([{role:options.role||'admin'}]);
    if(u.pathname.endsWith('/lockliel_integrity_health'))return options.invalidJson?new Response('{'):reply(Object.hasOwn(options,'health')?options.health:healthy,options.healthStatus||200);
    if(u.pathname.endsWith('/lockliel_grip_readiness'))return reply({release_ready:true,published:true,private_workbook_lessons:13,video_assets_total:13,video_assets_with_verified_duration:0});
    if(u.pathname.endsWith('/launch_verifications')&&init.method==='PATCH')return reply(Object.hasOwn(options,'updated')?options.updated:[{key:options.body.key,verified:options.body.verified}]);
    if(['/feature_flags','/payment_provider_connections','/products','/launch_verifications'].some(p=>u.pathname.endsWith(p)))return reply([]);
    throw Error('Unexpected call '+u.pathname);
  };
  try{
    const r=await handler(new Request('https://lockliel.com/api/lockliel/admin/readiness',{
      method:options.body?'POST':'GET',headers:{cookie:'lockliel_access='+token,'Content-Type':'application/json'},
      ...(options.body?{body:JSON.stringify(options.body)}:{})
    }));
    return {status:r.status,body:await r.json(),calls};
  }finally{globalThis.fetch=original;}
}
test('valid integrity result is ready while video durations remain optional',async()=>{
  const r=await run();assert.equal(r.status,200);
  assert.equal(r.body.checks.find(c=>c.key==='database_integrity').ready,true);
  assert.equal(r.body.checks.find(c=>c.key==='grip_engine').ready,true);
  assert.equal(r.body.checks.find(c=>c.key==='grip_video_durations').required,false);
});
test('unavailable or inconsistent health cannot show green',async()=>{
  for(const options of [{health:null},{health:{}},{health:{...healthy,healthy:'false'}},{health:{...healthy,issue_count:3}},{health:{...healthy,security_issue_count:1}},{health:{...healthy,verified_media_evidence_mismatches:1}},{health:{...healthy,issue_count:-1}},{healthStatus:403},{invalidJson:true}]){
    const r=await run(options);
    assert.equal(r.status,200);assert.equal(r.body.integrityHealth,null);
    assert.equal(r.body.checks.find(c=>c.key==='database_integrity').ready,false);
    assert.match(r.body.checks.find(c=>c.key==='database_integrity').detail,/could not be completed/);
  }
});
test('actual issue counts retain specific diagnostic labels',async()=>{
  const r=await run({health:{...healthy,healthy:false,issue_count:1,security_issue_count:1,public_tables_without_rls:1}});
  const check=r.body.checks.find(c=>c.key==='database_integrity');
  assert.equal(check.ready,false);assert.match(check.detail,/1 integrity issue detected: public tables without RLS/);
});
test('manual checks reject coerced booleans before writing',async()=>{
  for(const verified of ['false','true',1,null,undefined]){
    const r=await run({body:{key:'custom_smtp',verified,note:'Verified with a production email delivery test.'}});
    assert.equal(r.status,400);assert.ok(!r.calls.some(c=>c.init.method==='PATCH'));
  }
});
test('manual verification requires a matching persisted row',async()=>{
  const body={key:'custom_smtp',verified:true,note:'Verified with a production email delivery test.'};
  assert.equal((await run({body})).status,200);
  for(const updated of [[],null,[{key:'other',verified:true}],[{key:'custom_smtp',verified:false}]])assert.equal((await run({body,updated})).status,502);
  assert.equal((await run({body:{...body,verified:false,note:''}})).status,200);
});
test('non-admin and AAL1 callers cannot inspect readiness',async()=>{
  for(const options of [{role:'finance_admin'},{aal:'aal1'}]){
    const r=await run(options);assert.equal(r.status,403);
    assert.ok(!r.calls.some(c=>c.url.pathname.endsWith('/lockliel_integrity_health')));
  }
});
