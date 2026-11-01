import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {createMemberReadHandler} from '../netlify/lib/member-read-server.mjs';
import closedRoute from '../netlify/functions/lockliel-member-read.mjs';
const compiled=await build({stdin:{contents:"export * from './lib/member-server-read/adapter';export * from './lib/member-server-read/controller';",resolveDir:new URL('..',import.meta.url).pathname},bundle:true,write:false,format:'esm',platform:'node',logLevel:'silent'});
const {createServerMemberAdapter,createServerReadController}=await import('data:text/javascript;base64,'+Buffer.from(compiled.outputFiles[0].text).toString('base64'));
const now=Date.parse('2026-11-01T12:00:00Z'),binding={project:'qjksggxorghaxvpyslip',site:'70b03a42-6329-476e-bf4b-2b1ce30e9567',deploy:'a'.repeat(24),source:'b'.repeat(40)},origin=`https://${binding.deploy}--jade-unicorn-642f40.netlify.app`;
const A='00000000-0000-4000-8000-000000000001',B='00000000-0000-4000-8000-000000000002';
const claims=(id)=>({sub:id,session_id:id.replace('00000000','10000000'),role:'authenticated',aud:'authenticated',iss:`https://${binding.project}.supabase.co/auth/v1`,exp:now/1000+3600,aal:'aal1'});
const encode=c=>`eyJhbGciOiJFUzI1NiJ9.${Buffer.from(JSON.stringify(c)).toString('base64url')}.synthetic-signature`;
function integration(options={}){
 let owner=A,activeCalls=0;const upstream=[],responses=[];
 const handler=createMemberReadHandler({enabled:true,expectedBinding:binding,runtimeSource:binding.source,expectedOrigin:origin,publishableKey:'sb_publishable_synthetic_only_not_a_real_key',now:()=>now,fetchImpl:async(url,init)=>{
  upstream.push({url,init});const current=JSON.parse(Buffer.from(init.headers.Authorization.split('.')[1],'base64url').toString()).sub;
  if(options.fail)throw Error('PRIVATE ERROR');
  if(url.endsWith('/auth/v1/user'))return Response.json({id:current,email:'excluded@example.invalid',user_metadata:{role:'admin',private_notes:'PRIVATE'}});
  if(url.endsWith('/rpc/lockliel_current_session_active'))return Response.json(options.revoke?++activeCalls===1:true);
  if(url.includes('/profiles?'))return Response.json(options.missing?[]:[{id:options.foreign?B:current,first_name:options.long?'A'.repeat(120):current===A?'Alex':'Blair',last_name:options.long?'B'.repeat(120):'Synthetic',onboarding_status:options.long?'s'.repeat(80):'active',private_notes:'PRIVATE',email:'excluded@example.invalid'}]);
  if(url.includes('/communication_preferences?'))return options.preferencesFailure?Response.json({message:'PRIVATE ERROR'},{status:500}):Response.json([{profile_id:current,ministry_email:false,faith_boost_email:true,book_release_email:false,partner_email:false,sms_updates:false,updated_at:'2026-11-01T11:00:00.000Z',private_notes:'PRIVATE'}]);
  throw Error('Unexpected endpoint');
 }});
 const port=createServerMemberAdapter(options.expected??binding,{clock:()=>now,transport:async(path,init)=>{
  assert.equal(path,'/api/lockliel/member-read');assert.equal(init.method,'GET');assert.equal(init.credentials,'same-origin');assert.equal(init.cache,'no-store');assert.equal(init.redirect,'error');
  const headers=new Headers(init.headers);if(owner)headers.set('cookie',`lockliel_access=${encode({...claims(owner),...options.claims})}; lockliel_refresh=NEVER_USED`);
  const response=await (options.closed?closedRoute:handler)(new Request(origin+path,{...init,headers}),{site:{id:binding.site},deploy:{id:binding.deploy,context:options.runtime||'branch-deploy'}});
  assert.equal(response.headers.get('cache-control'),'private, no-store');assert.equal(response.headers.has('set-cookie'),false);responses.push(response.status);return response;
 }});
 const controller=createServerReadController(port,{clock:()=>now,nonce:()=> 'c'.repeat(32),schedule:()=>()=>{}});
 return {port,controller,upstream,responses,setOwner:id=>{owner=id;}};
}
const request=()=>({nonce:'c'.repeat(32),generation:1,signal:new AbortController().signal});
test('actual server output crosses actual adapter and controller with only owner-safe fields',async()=>{
 const h=integration();await h.controller.load();const data=h.controller.getSnapshot().data;assert.equal(data.identity.value.displayName,'Alex Synthetic');assert.equal(data.preferences.value.smsUpdates,false);assert.equal(data.dashboard.value.courseAvailability,'unavailable');
 assert.equal(h.upstream.length,5);for(const {url,init}of h.upstream){assert.equal(new URL(url).origin,`https://${binding.project}.supabase.co`);assert.equal(init.method,'GET');assert.equal(init.body,undefined);assert.equal(init.cache,'no-store');}
 const text=JSON.stringify(data);for(const value of [A,'PRIVATE','excluded@','NEVER_USED','user_metadata'])assert.equal(text.includes(value),false);h.controller.dispose();
});
test('maximum legitimate projection crosses wire without incompatible bounds',async()=>{const h=integration({long:true}),r=await h.port.read(request());assert.equal(r.status,'ready');assert.equal(r.data.identity.value.displayName.length,241);assert.equal(r.data.profile.value.onboardingStatus.length,80);});
test('actual A-to-B switch clears A synchronously and changes response boundary',async()=>{const h=integration();await h.controller.load();const a=h.controller.getSnapshot().data;h.setOwner(B);const pending=h.controller.load();assert.equal(h.controller.getSnapshot().data,undefined);await pending;const b=h.controller.getSnapshot().data;assert.equal(b.identity.value.displayName,'Blair Synthetic');assert.notEqual(a.boundary,b.boundary);assert.equal(JSON.stringify(b).includes('Alex'),false);h.controller.dispose();});
test('lost session clears previous real server result with no fixture fallback',async()=>{const h=integration();await h.controller.load();h.setOwner(null);await h.controller.load();assert.equal(h.controller.getSnapshot().status,'anonymous');assert.equal(h.controller.getSnapshot().data,undefined);h.controller.dispose();});
for(const [name,options,status]of [['expired',{claims:{exp:now/1000}},'anonymous'],['wrong issuer',{claims:{iss:'https://bsndfhbemstyrrglajat.supabase.co/auth/v1'}},'anonymous'],['production runtime',{runtime:'production'},'unavailable'],['closed default route',{closed:true},'unavailable']])test(name+' is rejected across actual boundary before provider calls',async()=>{const h=integration(options);assert.equal((await h.port.read(request())).status,status);assert.equal(h.upstream.length,0);});
test('revocation between identity and final snapshot denies composition',async()=>{const h=integration({revoke:true});assert.equal((await h.port.read(request())).status,'anonymous');});
test('partial domain failure stays unavailable, never sample preferences or whole false success',async()=>{const h=integration({preferencesFailure:true}),r=await h.port.read(request());assert.equal(r.status,'ready');assert.equal(r.data.profile.status,'ready');assert.deepEqual(r.data.preferences,{status:'unavailable'});assert.equal(JSON.stringify(r).includes('PRIVATE'),false);});
test('missing and foreign rows remain explicit and cannot supply another profile',async()=>{for(const options of [{missing:true},{foreign:true}]){const h=integration(options),r=await h.port.read(request());assert.equal(r.status,'ready');assert.equal(r.data.profile.status,options.missing?'missing':'unavailable');assert.equal(r.data.identity.value.displayName,'Member');}});
test('upstream failure traverses real adapter without raw error or private retention',async()=>{const h=integration({fail:true});assert.deepEqual(await h.port.read(request()),{status:'unavailable'});});
test('wrong expected binding rejects actual server result',async()=>{const h=integration({expected:{...binding,source:'f'.repeat(40)}});assert.deepEqual(await h.port.read(request()),{status:'unavailable'});});
test('closed export denies every method in production, isolated, preview and unknown contexts',async()=>{for(const context of [undefined,{},...['production','branch-deploy','deploy-preview','dev'].map(value=>({site:{id:binding.site},deploy:{id:binding.deploy,context:value}}))])for(const method of ['GET','HEAD','POST','PUT','PATCH','DELETE','OPTIONS']){const r=await closedRoute(new Request(origin+'/api/lockliel/member-read',{method,headers:{'X-Netlify-Context':'production'}}),context);assert.equal(r.status,503);assert.equal(r.headers.has('set-cookie'),false);assert.equal(r.headers.has('location'),false);assert.deepEqual(await r.json(),{error:'Member read unavailable.'});}});
