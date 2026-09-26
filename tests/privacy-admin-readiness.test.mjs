import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../netlify/functions/lockliel-admin-privacy.mjs';

const staff='11111111-1111-4111-8111-111111111111';
const id='22222222-2222-4222-8222-222222222222';
async function run(options={}){
  const original=globalThis.fetch;
  const calls=[];
  const token='test.'+Buffer.from(JSON.stringify({aal:options.aal||'aal2'})).toString('base64url')+'.test';
  const reply=(value,status=200)=>new Response(JSON.stringify(value),{status});
  globalThis.fetch=async(url,init={})=>{
    const u=new URL(url);calls.push({url:u,init});
    if(options.disconnect===u.pathname.split('/').pop()&&(!options.disconnectMethod||init.method===options.disconnectMethod))throw Error('Sensitive upstream diagnostic');
    if(u.pathname==='/auth/v1/user')return reply({id:staff});
    if(u.pathname.endsWith('/lockliel_current_session_active'))return reply(true);
    if(u.pathname.endsWith('/staff_roles'))return reply(options.rolesMalformed?{}:[{role:options.role||'admin'}]);
    if(u.pathname.endsWith('/lockliel_admin_deletion_readiness')){
      if(options.networkError)throw Error('Fixture network failure');
      return reply(Object.hasOwn(options,'readiness')?options.readiness:{request_id:id,terminal:false,can_execute:true},options.rpcStatus||200);
    }
    if(u.pathname.endsWith('/lockliel_reclaim_account_deletion')){
      if(options.networkError)throw Error('Fixture network failure');
      return reply(Object.hasOwn(options,'recovery')?options.recovery:{ok:true,request_id:id},options.rpcStatus||200);
    }
    if(u.pathname.endsWith('/privacy_requests')){
      if(init.method==='PATCH')return reply(Object.hasOwn(options,'updated')?options.updated:[{id,status:options.action==='claim'?'in_review':'declined',handled_by:staff}]);
      return reply(Object.hasOwn(options,'lookup')?options.lookup:options.queueMalformed?{}:[{id,request_type:options.type||'account_deletion',status:'in_review',handled_by:options.otherHandler?'another-admin':staff}],options.queueStatus||200);
    }
    if(u.pathname.endsWith('/profile_finance_cards'))return reply(options.peopleMalformed?{}:[]);
    throw Error('Unexpected upstream call '+u.pathname);
  };
  try{
    const method=options.action?'POST':'GET';
    const suffix=method==='GET'&&!options.queue?'?request_id='+encodeURIComponent(options.requestId??id):'';
    const request=new Request('https://lockliel.com/api/lockliel/admin/privacy'+suffix,{
      method,headers:{cookie:'lockliel_access='+token,'Content-Type':'application/json'},
      ...(method==='POST'?{body:JSON.stringify({id:options.requestId??id,action:options.action,status:'declined'})}:{})
    });
    const response=await handler(request);
    return {status:response.status,body:await response.json(),calls,headers:response.headers};
  }finally{globalThis.fetch=original;}
}

test('readiness uses caller-scoped RPC without executing deletion',async()=>{
  const r=await run();
  assert.equal(r.status,200);
  const rpc=r.calls.find(c=>c.url.pathname.endsWith('/lockliel_admin_deletion_readiness'));
  assert.deepEqual(JSON.parse(rpc.init.body),{request_id_input:id});
  assert.ok(rpc.init.headers.Authorization.startsWith('Bearer test.'));
  assert.ok(!r.calls.some(c=>c.url.pathname.includes('/functions/')||c.init.method==='PATCH'));
});
for(const options of [{requestId:''},{requestId:'bad-id'},{requestId:'bad-id',action:'reclaimDeletion'}]){
  test('invalid request identifier is rejected '+JSON.stringify(options),async()=>{
    const r=await run(options);assert.equal(r.status,400);
    assert.ok(!r.calls.some(c=>c.url.pathname.includes('deletion_readiness')||c.url.pathname.includes('reclaim_account')));
  });
}
for(const options of [{readiness:null},{readiness:{request_id:'different',terminal:false}},{readiness:{request_id:id}}]){
  test('incomplete readiness is not presented as verified '+JSON.stringify(options),async()=>{
    const r=await run(options);assert.equal(r.status,502);assert.equal(r.body.readiness,undefined);
  });
}
test('readiness network and database failures remain unavailable',async()=>{
  for(const options of [{networkError:true},{rpcStatus:403}])assert.equal((await run(options)).status,503);
});
test('recovery requires affirmative matching database response',async()=>{
  assert.equal((await run({action:'reclaimDeletion'})).status,200);
  for(const recovery of [null,{ok:false,request_id:id},{ok:true,request_id:'different'}]){
    assert.equal((await run({action:'reclaimDeletion',recovery})).status,502);
  }
  assert.equal((await run({action:'reclaimDeletion',rpcStatus:400})).status,409);
  assert.equal((await run({action:'reclaimDeletion',networkError:true})).status,503);
});
test('AAL1 and non-admin callers cannot inspect or recover deletion requests',async()=>{
  for(const options of [{aal:'aal1'},{role:'group_leader'},{role:'finance_admin',action:'reclaimDeletion'}]){
    const r=await run(options);assert.equal(r.status,403);
    assert.ok(!r.calls.some(c=>c.url.pathname.includes('deletion_readiness')||c.url.pathname.includes('reclaim_account')));
  }
});
test('queue failure never masquerades as an empty privacy queue',async()=>{
  for(const options of [{queueStatus:500},{queueMalformed:true}]){
    const r=await run({queue:true,...options});assert.equal(r.status,503);assert.equal(r.body.requests,undefined);
  }
});
test('resolving exports and declining deletions require the assigned handler',async()=>{
  for(const type of ['data_export','account_deletion']){
    const r=await run({action:'resolve',type,otherHandler:true});
    assert.equal(r.status,409);assert.ok(!r.calls.some(c=>c.init.method==='PATCH'));
  }
  const r=await run({action:'resolve',type:'data_export'});
  assert.equal(r.status,200);
  assert.equal(r.calls.find(c=>c.init.method==='PATCH').url.searchParams.get('handled_by'),'eq.'+staff);
});

for(const action of ['claim','resolve']){
  test(action+' requires a matching persisted request and handler',async()=>{
    assert.equal((await run({action})).status,200);
    for(const updated of [[],null,{},[{id,status:'completed',handled_by:staff}],[{id:'different',status:'in_review',handled_by:staff}],[{id,status:action==='claim'?'in_review':'declined',handled_by:'other'}]]){
      assert.equal((await run({action,updated})).status,409);
    }
  });
}
test('every mutation rejects invalid request identifiers before writing',async()=>{
  for(const action of ['claim','resolve','executeDeletion']){
    const r=await run({action,requestId:'bad-id'});assert.equal(r.status,400);
    assert.ok(!r.calls.some(c=>c.init.method==='PATCH'||c.url.pathname.includes('/functions/')));
  }
});

test('lookup outages and malformed identities never masquerade as missing requests',async()=>{
  for(const action of ['resolve','executeDeletion']){
    for(const options of [{queueStatus:500},{queueMalformed:true},{disconnect:'privacy_requests'},{lookup:[{id:'different',request_type:'account_deletion',status:'in_review'}]}]){
      const r=await run({action,...options});assert.equal(r.status,503);
      assert.ok(!r.calls.some(c=>c.init.method==='PATCH'||c.url.pathname.includes('/functions/')));
    }
    assert.equal((await run({action,lookup:[]})).status,404);
  }
});
test('authorization and mutation disconnects return sanitized no-store errors',async()=>{
  for(const options of [{rolesMalformed:true},{disconnect:'staff_roles'},{queue:true,disconnect:'privacy_requests'},{action:'claim',disconnect:'privacy_requests',disconnectMethod:'PATCH'},{action:'resolve',disconnect:'privacy_requests',disconnectMethod:'PATCH'}]){
    const r=await run(options);assert.equal(r.status,503);
    assert.match(r.headers.get('cache-control'),/no-store/);
    assert.doesNotMatch(r.body.error,/Sensitive upstream diagnostic/);
    assert.match(r.body.error,/Refresh the request history/);
  }
});
test('unavailable people directory does not hide the privacy queue',async()=>{
  for(const options of [{disconnect:'profile_finance_cards'},{peopleMalformed:true}]){
    const r=await run({queue:true,...options});assert.equal(r.status,200);
    assert.equal(r.body.requests.length,1);assert.equal(r.body.peopleUnavailable,true);
    assert.equal(r.body.requests[0].person,null);
  }
});
