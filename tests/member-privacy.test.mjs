import test from 'node:test';
import assert from 'node:assert/strict';
import privacy from '../netlify/functions/lockliel-privacy.mjs';
import exportData from '../netlify/functions/lockliel-privacy-export.mjs';
import {exportRows} from '../netlify/lib/lockliel-export-pages.mjs';

const member='11111111-1111-4111-8111-111111111111';
const id='22222222-2222-4222-8222-222222222222';
async function run(options={}){
  const original=globalThis.fetch;
  const calls=[];
  const reply=(value,status=200,headers={})=>new Response(JSON.stringify(value),{status,headers});
  globalThis.fetch=async(url,init={})=>{
    const u=new URL(url);calls.push({url:u,init});
    if(u.pathname==='/auth/v1/user')return reply({id:member,email:'member@example.invalid'});
    if(u.pathname.endsWith('/lockliel_current_session_active'))return reply(true);
    const table=u.pathname.split('/').pop();
    if(options.disconnect===table)throw Error('Private infrastructure diagnostic');
    if(options.export){
      if(table==='privacy_requests'&&u.searchParams.has('id'))return reply(Object.hasOwn(options,'approval')?options.approval:[{id}],options.approvalStatus||200);
      if(options.sourceFailure===table)return reply({},500);
      if(options.malformed===table)return reply({},200,{'Content-Range':'*/0'});
      return reply([],200,options.missingRange?{}:{'Content-Range':options.truncated===table?'*/1001':'*/0'});
    }
    if(table==='privacy_requests'){
      if(init.method==='POST'||init.method==='PATCH')return reply(Object.hasOwn(options,'saved')?options.saved:[{id,profile_id:member,request_type:'data_export',status:init.method==='POST'?'submitted':'cancelled'}]);
      return reply(Object.hasOwn(options,'history')?options.history:[],options.lookupStatus||200);
    }
    throw Error('Unexpected '+table);
  };
  try{
    const token='test.'+Buffer.from(JSON.stringify({aal:'aal1'})).toString('base64url')+'.test';
    const req=new Request('https://lockliel.com/api/lockliel/privacy'+(options.export?'-export?requestId='+encodeURIComponent(options.id??id):''),{
      method:options.body?'POST':'GET',headers:{cookie:'lockliel_access='+token,'Content-Type':'application/json'},
      ...(options.body?{body:JSON.stringify(options.body)}:{})
    });
    const r=await (options.export?exportData:privacy)(req);
    return {status:r.status,body:await r.json(),headers:r.headers,calls};
  }finally{globalThis.fetch=original;}
}

test('export requires matching completed approval before reading datasets',async()=>{
  for(const [options,status] of [[{id:'bad'},400],[{approval:[]},403],[{approvalStatus:500},503],[{approval:{}},503],[{approval:[{id:'different'}]},503]]){
    const r=await run({export:true,...options});assert.equal(r.status,status);
    assert.ok(!r.calls.some(c=>c.url.pathname.endsWith('/faith_profiles')));
  }
});
test('export rejects failed, malformed, disconnected or truncated datasets',async()=>{
  for(const options of [{sourceFailure:'gifts'},{malformed:'faith_profiles'},{disconnect:'orders'},{truncated:'notifications'},{missingRange:true}]){
    const r=await run({export:true,...options});assert.equal(r.status,503);
    assert.equal(r.headers.get('content-disposition'),null);
    assert.equal(r.body.code,'export_incomplete');
    assert.doesNotMatch(r.body.error,/Private infrastructure/);
  }
});
test('verified export uses caller credentials and exact counts on every source',async()=>{
  const r=await run({export:true});assert.equal(r.status,200);
  assert.match(r.headers.get('content-disposition'),/attachment/);
  assert.match(r.headers.get('cache-control'),/no-store/);
  const sources=r.calls.filter(c=>c.url.pathname.includes('/rest/')&&!c.url.pathname.includes('/rpc/')&&!(c.url.pathname.endsWith('/privacy_requests')&&c.url.searchParams.has('id')));
  assert.ok(sources.length>20);
  for(const c of sources){assert.equal(c.init.headers.Prefer,'count=exact');assert.match(c.init.headers.Authorization,/Bearer test\./);}
});
test('member history failure never becomes an empty queue',async()=>{
  for(const options of [{lookupStatus:500},{history:{}},{disconnect:'privacy_requests'}])assert.equal((await run(options)).status,503);
});
test('failed duplicate lookup stops creation',async()=>{
  const r=await run({body:{action:'create',requestType:'data_export'},lookupStatus:500});
  assert.equal(r.status,503);assert.ok(!r.calls.some(c=>c.init.method==='POST'&&c.url.pathname.endsWith('/privacy_requests')));
});
test('create and cancel require matching persisted ownership and status',async()=>{
  for(const action of ['create','cancel']){
    const body={action,requestType:'data_export',id};
    assert.equal((await run({body})).status,200);
    for(const saved of [[],null,{},[{id,profile_id:'other',request_type:'data_export',status:'submitted'}]]){
      assert.equal((await run({body,saved})).status,action==='create'?502:409);
    }
  }
});
test('invalid cancellation IDs are rejected without mutation',async()=>{
  const r=await run({body:{action:'cancel',id:'bad'}});assert.equal(r.status,400);
  assert.ok(!r.calls.some(c=>c.init.method==='PATCH'));
});

test('export pages follow exact ranges and remove internal-only paging keys',async()=>{
  const calls=[];
  const result=await exportRows('https://example.invalid/rest/v1/notifications?profile_id=eq.member&select=title&order=created_at.asc',{Authorization:'Bearer caller'},{pageSize:2,fetchImpl:async(url,init)=>{
    const u=new URL(url);calls.push(u);
    assert.equal(u.searchParams.get('profile_id'),'eq.member');
    assert.equal(u.searchParams.get('select'),'title,id');
    assert.equal(u.searchParams.get('order'),'created_at.asc,id.asc');
    assert.equal(init.headers.Authorization,'Bearer caller');
    const offset=Number(u.searchParams.get('offset'));
    const data=offset===0?[{id:'a',title:'A'},{id:'b',title:'B'}]:[{id:'c',title:'C'}];
    return new Response(JSON.stringify(data),{headers:{'Content-Range':offset===0?'0-1/3':'2-2/3'}});
  }});
  assert.deepEqual(result,[{title:'A'},{title:'B'},{title:'C'}]);
  assert.equal(calls.length,2);
});

test('export can continue when the server page cap is smaller than requested',async()=>{
  let calls=0;
  const result=await exportRows('https://example.invalid/rest/v1/orders?select=*',{}, {pageSize:500,fetchImpl:async()=>{
    const offset=calls++;
    return new Response(JSON.stringify([{id:String(offset)}]),{headers:{'Content-Range':offset+'-'+offset+'/3'}});
  }});
  assert.equal(result.length,3);assert.equal(calls,3);
});

test('paging refuses count drift, duplicate identities, empty pages and invalid ranges',async()=>{
  for(const [second,range] of [[[{id:'b'}],'1-1/3'],[[{id:'a'}],'1-1/2'],[[],'*/2'],[[{id:'b'}],'0-0/2'],[[{}],'1-1/2']]){
    let calls=0;
    await assert.rejects(exportRows('https://example.invalid/rest/v1/orders?select=*',{}, {pageSize:1,fetchImpl:async()=>{
      const first=calls++===0;
      return new Response(JSON.stringify(first?[{id:'a'}]:second),{headers:{'Content-Range':first?'0-0/2':range}});
    }}));
  }
});

test('composite identities are stable and additional keys never leak into projection',async()=>{
  const result=await exportRows('https://example.invalid/rest/v1/contact_permissions?profile_id=eq.owner&select=permission_type',{}, {fetchImpl:async(url)=>{
    assert.match(new URL(url).searchParams.get('order'),/profile_id.asc,other_profile_id.asc,permission_type.asc/);
    return new Response(JSON.stringify([{profile_id:'owner',other_profile_id:'a',permission_type:'inviter_followup'},{profile_id:'owner',other_profile_id:'b',permission_type:'inviter_followup'}]),{headers:{'Content-Range':'0-1/2'}});
  }});
  assert.deepEqual(result,[{permission_type:'inviter_followup'},{permission_type:'inviter_followup'}]);
});

test('exports enforce bounded row and byte budgets',async()=>{
  const fetchImpl=async()=>new Response(JSON.stringify([{id:'a',title:'A large value'}]),{headers:{'Content-Range':'0-0/1'}});
  await assert.rejects(exportRows('https://example.invalid/rest/v1/orders',{}, {maxRows:0,fetchImpl}));
  await assert.rejects(exportRows('https://example.invalid/rest/v1/orders',{}, {budget:{bytes:0,maxBytes:2},fetchImpl}));
});

test('export retrieves more than the default thousand-row response limit',async()=>{
  const source=Array.from({length:1201},(_,i)=>({id:String(i),title:'Notification '+i}));
  let pages=0;
  const result=await exportRows('https://example.invalid/rest/v1/notifications?select=title',{}, {fetchImpl:async(url)=>{
    pages++;
    const u=new URL(url),offset=Number(u.searchParams.get('offset'));
    const page=source.slice(offset,offset+Number(u.searchParams.get('limit')));
    return new Response(JSON.stringify(page),{headers:{'Content-Range':offset+'-'+(offset+page.length-1)+'/1201'}});
  }});
  assert.equal(pages,3);assert.equal(result.length,1201);
  assert.deepEqual(result[1200],{title:'Notification 1200'});
});
