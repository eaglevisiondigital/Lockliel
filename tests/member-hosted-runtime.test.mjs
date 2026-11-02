import test from 'node:test';
import assert from 'node:assert/strict';
import {validateHostedPin,HOSTED_VERSION,HOSTED_LOGIN_PATH,HOSTED_LOGOUT_PATH,HOSTED_READ_PATH,HOSTED_KEY_NAME} from '../netlify/member-hosted/binding.mjs';
import {createHostedTransport,createHostedReadTransport} from '../netlify/member-hosted/transport.mjs';
import {createHostedAuthHandler,createHostedMemberRead} from '../netlify/member-hosted/runtime.mjs';
import {PROFILE_SELECT} from '../netlify/lib/member-read-projection.mjs';
const project='qjksggxorghaxvpyslip';
const binding={project,site:'70b03a42-6329-476e-bf4b-2b1ce30e9567',deploy:'a'.repeat(24),source:'b'.repeat(40)};
const pin={version:HOSTED_VERSION,binding,origin:`https://${binding.deploy}--jade-unicorn-642f40.netlify.app`,context:'deploy-preview',schema:280,protocol:'278-v1',paused:true};
const context={site:{id:binding.site},deploy:{id:binding.deploy,context:'deploy-preview',published:false}};
const now=()=>1800000000000;
const A='11111111-1111-4111-8111-111111111111';
const B='22222222-2222-4222-8222-222222222222';
const token=(owner=A,extra={})=>`e30.${Buffer.from(JSON.stringify({sub:owner,session_id:'33333333-3333-4333-8333-333333333333',iss:`https://${project}.supabase.co/auth/v1`,role:'authenticated',aud:'authenticated',aal:'aal1',exp:now()/1000+3600,...extra})).toString('base64url')}.synthetic`;
const key='sb_publishable_'+'synthetic_fixture_only_not_real';
const keyReader=name=>name===HOSTED_KEY_NAME?key:null;
const url=path=>`https://${project}.supabase.co${path}`;
function request(path=HOSTED_READ_PATH,options={}){return new Request(pin.origin+path,{method:options.method||'GET',headers:{'x-lockliel-read-nonce':'c'.repeat(32),'x-lockliel-read-generation':'1',cookie:`lockliel_access=${token()}`,...options.headers},...(options.body===undefined?{}:{body:options.body})});}
function authRequest(path=HOSTED_LOGIN_PATH,options={}){return request(path,{method:'POST',body:'{}',headers:{Origin:pin.origin,'Content-Type':'application/json',...options.headers},...options});}
const config=extra=>({pin,runtimeSource:binding.source,enabled:true,keyReader,now,...extra});
function upstream({owner=A,readiness={paused:true,schemaReady:true,protocol:'278-v1'},active=true}={}){
  const calls=[];
  const fetchImpl=async(input,options)=>{calls.push({input,options});const u=new URL(input);assert.equal(options.redirect,'error');assert.equal(options.cache,'no-store');
    if(u.pathname==='/auth/v1/user')return Response.json({id:owner});
    if(u.pathname==='/rest/v1/rpc/lockliel_current_session_active')return Response.json(active);
    if(u.pathname==='/rest/v1/rpc/lockliel_course_cutover_status')return Response.json(readiness);
    if(u.pathname==='/rest/v1/profiles')return Response.json([{id:owner,first_name:owner===A?'Synthetic A':'Synthetic B',last_name:null,onboarding_status:'active'}]);
    if(u.pathname==='/rest/v1/communication_preferences')return Response.json([{profile_id:owner,ministry_email:true,faith_boost_email:false,book_release_email:true,partner_email:false,sms_updates:false,updated_at:'2026-11-01T00:00:00Z'}]);
    throw Error('Unexpected test transport');
  };return {calls,fetchImpl};
}

test('hosted pin exact immutable identity and schema',()=>{assert.ok(validateHostedPin(pin));for(const patch of [{version:'v2'},{context:'production'},{schema:279},{paused:false},{origin:'https://lockliel.com'},{origin:pin.origin+'/'},{protocol:'280-v1'},{unexpected:true}])assert.equal(validateHostedPin({...pin,...patch}),null);for(const patch of [{project:'bsndfhbemstyrrglajat'},{site:'60579b8e-d0ca-4ac1-abe5-7128f4243e8b'},{source:'x'},{deploy:'123'}])assert.equal(validateHostedPin({...pin,binding:{...binding,...patch}}),null);});
for(const [name,ctx,source,enabled] of [
  ['missing',{},binding.source,true],['production',{...context,deploy:{...context.deploy,context:'production'}},binding.source,true],
  ['published',{...context,deploy:{...context.deploy,published:true}},binding.source,true],['unattested publication',{...context,deploy:{id:binding.deploy,context:'deploy-preview'}},binding.source,true],
  ['wrong deploy',{...context,deploy:{...context.deploy,id:'d'.repeat(24)}},binding.source,true],['wrong site',{...context,site:{id:'other'}},binding.source,true],['wrong source',context,'e'.repeat(40),true],['default off',context,binding.source,false],
])test(`runtime denies ${name} before key read and network`,async()=>{let touched=0;const read=createHostedMemberRead(config({runtimeSource:source,enabled,keyReader:()=>{touched++;return key;},fetchImpl:()=>{touched++;}}));assert.equal((await read(request(),ctx)).status,503);assert.equal(touched,0);});

test('read composes actual server projection with caller RLS and maintenance ON',async()=>{const mock=upstream();const result=await createHostedMemberRead(config(mock))(request(),context);assert.equal(result.status,200);const body=await result.json();assert.equal(body.profile.value.displayName,'Synthetic A');assert.deepEqual(body.preferences,{status:'ready',value:{ministryEmail:true,faithBoostEmail:false,bookReleaseEmail:true,partnerEmail:false,smsUpdates:false,revision:'2026-11-01T00:00:00Z'}});assert.equal(body.dashboard.value.courseAvailability,'unavailable');assert.equal(body.binding.source,binding.source);assert.equal(mock.calls.length,6);assert.equal(mock.calls[2].input,url('/rest/v1/rpc/lockliel_course_cutover_status'));assert.equal(result.headers.get('cache-control'),'private, no-store');assert.equal(result.headers.getSetCookie().length,0);assert.equal(JSON.stringify(body).includes(A),false);assert.equal(JSON.stringify(body).includes('refresh_token'),false);});
for(const state of [{paused:false,schemaReady:true,protocol:'278-v1'},{paused:true,schemaReady:false,protocol:'278-v1'},{paused:true,schemaReady:true,protocol:'old'},null])test(`read denies readiness ${JSON.stringify(state)}`,async()=>{const mock=upstream({readiness:state});const result=await createHostedMemberRead(config(mock))(request(),context);assert.equal(result.status,503);assert.equal(mock.calls.some(x=>x.input.includes('/profiles?')),false);});
for(const [label,override,expected] of [
  ['anonymous',{headers:{cookie:''}},401],['expired',{headers:{cookie:`lockliel_access=${token(A,{exp:1})}`}},401],['foreign issuer',{headers:{cookie:`lockliel_access=${token(A,{iss:'https://bsndfhbemstyrrglajat.supabase.co/auth/v1'})}`}},401],['forged owner',{path:HOSTED_READ_PATH+'?profileId='+B},400],['forged context header',{headers:{'x-netlify-deploy-context':'production'}},200],
])test(`read ${label}`,async()=>{const mock=upstream();const path=override.path||HOSTED_READ_PATH;const result=await createHostedMemberRead(config(mock))(request(path,override),context);assert.equal(result.status,expected);if(expected!==200)assert.equal(mock.calls.length,0);});
test('A/B identity mismatch denies before profile',async()=>{const mock=upstream({owner:B});const result=await createHostedMemberRead(config(mock))(request(),context);assert.equal(result.status,401);assert.equal(mock.calls.length,1);});
test('active-session revocation denies before private reads',async()=>{const mock=upstream({active:false});const result=await createHostedMemberRead(config(mock))(request(),context);assert.equal(result.status,401);assert.equal(mock.calls.length,2);});
test('wrong publication cannot be forged with request headers',async()=>{const mock=upstream();const result=await createHostedMemberRead(config(mock))(request(HOSTED_READ_PATH,{headers:{'x-netlify-deploy-context':'deploy-preview','x-netlify-deploy-id':binding.deploy,'x-lockliel-source':binding.source}}),{...context,deploy:{...context.deploy,published:true}});assert.equal(result.status,503);assert.equal(mock.calls.length,0);});

for(const [label,path,method] of [['production','https://bsndfhbemstyrrglajat.supabase.co/auth/v1/user','GET'],['SMTP',url('/smtp'),'POST'],['signup',url('/auth/v1/signup'),'POST'],['recovery',url('/auth/v1/recover'),'POST'],['refresh',url('/auth/v1/token?grant_type=refresh_token'),'POST'],['admin',url('/auth/v1/admin/users'),'GET'],['notes',url('/rest/v1/lesson_private_notes'),'GET'],['wildcard',url('/rest/v1/profiles?select=*'),'GET'],['foreign owner',url(`/rest/v1/profiles?id=eq.${B}&select=${PROFILE_SELECT}&limit=1`),'GET'],['write',url('/rest/v1/profiles'),'PATCH'],['unrelated query',url('/rest/v1/rpc/lockliel_current_session_active?owner='+B),'GET']])test(`confined transport denies ${label}`,async()=>{let calls=0;const transport=createHostedTransport({pin,keyReader,now,fetchImpl:()=>{calls++;}});assert.equal((await transport(path,{method,headers:{apikey:key,Authorization:`Bearer ${token()}`}})).status,503);assert.equal(calls,0);});
test('confined transport denies foreign token and incorrect API key',async()=>{let calls=0;const transport=createHostedTransport({pin,keyReader,now,fetchImpl:()=>{calls++;}});for(const headers of [{apikey:key,Authorization:`Bearer ${token(A,{ref:'production'})}`},{apikey:'sb_publishable_other',Authorization:`Bearer ${token()}`}])assert.equal((await transport(url('/auth/v1/user'),{headers})).status,503);assert.equal(calls,0);});
test('transport cannot follow upstream redirects or leak upstream failure body',async()=>{for(const upstream of [new Response(null,{status:302,headers:{Location:'https://lockliel.com'}}),Response.json({error:'PRIVATE_UPSTREAM_DETAIL'},{status:500})]){const transport=createHostedTransport({pin,keyReader,now,fetchImpl:async()=>upstream});const result=await transport(url('/auth/v1/user'),{headers:{apikey:key,Authorization:`Bearer ${token()}`}});assert.equal(result.status,503);assert.equal((await result.text()).includes('PRIVATE_UPSTREAM_DETAIL'),false);}});
test('password grant response is issuer checked and private provider data excluded',async()=>{const body=JSON.stringify({email:'synthetic@example.invalid',password:'synthetic-not-a-real-password'});for(const foreign of [false,true]){const transport=createHostedTransport({pin,keyReader,now,fetchImpl:async()=>Response.json({access_token:token(A,foreign?{iss:'https://foreign.invalid/auth/v1'}:{}),refresh_token:'synthetic-refresh-only',expires_in:100,user:{id:A,email:'PRIVATE_EMAIL',user_metadata:{private_notes:'PRIVATE_NOTES'},factors:[]}})});const result=await transport(url('/auth/v1/token?grant_type=password'),{method:'POST',headers:{apikey:key},body});assert.equal(result.status,foreign?503:200);const resultText=await result.text();assert.equal(resultText.includes('PRIVATE_EMAIL'),false);assert.equal(resultText.includes('PRIVATE_NOTES'),false);}});

for(const [name,options,expected] of [['missing origin',{headers:{'Content-Type':'application/json'}},403],['cross origin',{headers:{Origin:'https://lockliel.com','Content-Type':'application/json'}},403],['same site',{headers:{Origin:pin.origin,'Content-Type':'application/json','Sec-Fetch-Site':'same-site'}},403],['text body',{headers:{Origin:pin.origin,'Content-Type':'text/plain'}},400],['body limit',{body:'x'.repeat(4097)},503]])test(`auth ${name} rejects before handler`,async()=>{let invoked=0;const handler=createHostedAuthHandler(config({path:HOSTED_LOGIN_PATH,compose:()=>{invoked++;return()=>Response.json({ok:true});}}));assert.equal((await handler(authRequest(HOSTED_LOGIN_PATH,options),context)).status,expected);assert.equal(invoked,0);});
test('Auth wrapper reuses injected reviewed handler after exact guards',async()=>{let invoked=0;const handler=createHostedAuthHandler(config({path:HOSTED_LOGIN_PATH,compose:({key:received,fetchImpl})=>{assert.equal(received,key);assert.equal(typeof fetchImpl,'function');return async request=>{invoked++;assert.deepEqual(await request.json(),{});return Response.json({ok:true},{headers:{'Set-Cookie':'lockliel_access=synthetic; Path=/; HttpOnly; SameSite=Lax; Secure'}});};}}));const result=await handler(authRequest(),context);assert.equal(result.status,200);assert.equal(invoked,1);assert.equal(result.headers.get('CDN-Cache-Control'),'no-store');assert.match(result.headers.getSetCookie()[0],/Secure/);});
test('Auth wrapper refuses insecure or domain cookies',async()=>{for(const cookie of ['lockliel_access=x; HttpOnly; SameSite=Lax','lockliel_access=x; HttpOnly; SameSite=Lax; Secure; Domain=.netlify.app','other_cookie=x; HttpOnly; SameSite=Lax; Secure']){const handler=createHostedAuthHandler(config({path:HOSTED_LOGIN_PATH,compose:()=>async()=>Response.json({ok:true},{headers:{'Set-Cookie':cookie}})}));assert.equal((await handler(authRequest(),context)).status,503);}});
test('logout refuses production cookie before reused handler',async()=>{let invoked=0;const handler=createHostedAuthHandler(config({path:HOSTED_LOGOUT_PATH,compose:()=>{invoked++;return()=>Response.json({ok:true});}}));assert.equal((await handler(authRequest(HOSTED_LOGOUT_PATH,{headers:{Origin:pin.origin,'Content-Type':'application/json',Cookie:`lockliel_access=${token(A,{ref:'production'})}`}}),context)).status,401);assert.equal(invoked,0);});
test('missing key returns unavailable and never invokes transport or Auth handler',async()=>{let calls=0;const options=config({keyReader:()=>null,fetchImpl:()=>{calls++;},compose:()=>{calls++;}});assert.equal((await createHostedMemberRead(options)(request(),context)).status,503);assert.equal((await createHostedAuthHandler({...options,path:HOSTED_LOGIN_PATH})(authRequest(),context)).status,503);assert.equal(calls,0);});

test('member-only lexical transport denies every Auth POST before keys or network',async()=>{
  let reads=0,calls=0;
  const readOnly=createHostedReadTransport({pin,now,keyReader:()=>{reads++;return key;},fetchImpl:()=>{calls++;}});
  for(const path of ['/auth/v1/token?grant_type=password','/auth/v1/logout','/auth/v1/signup','/auth/v1/recover']) {
    const result=await readOnly(url(path),{method:'POST',headers:{apikey:key},body:'{}'});
    assert.equal(result.status,503);
  }
  assert.equal((await readOnly(url('/auth/v1/user'),{method:'GET',body:'{}'})).status,503);
  assert.equal(reads,0);assert.equal(calls,0);
});

test('standalone GET transport preserves approved reads and rejects private or foreign reads',async()=>{
  const calls=[]; const transport=createHostedReadTransport({pin,keyReader,now,fetchImpl:async(input,options)=>{calls.push({input,options});return Response.json(true);}});
  const headers={apikey:key,Authorization:`Bearer ${token()}`};
  for(const path of ['/auth/v1/user','/rest/v1/rpc/lockliel_current_session_active','/rest/v1/rpc/lockliel_course_cutover_status',`/rest/v1/profiles?id=eq.${A}&select=${PROFILE_SELECT}&limit=1`]) assert.equal((await transport(url(path),{headers})).status,200);
  assert.equal(calls.length,4);
  for(const path of ['/rest/v1/lesson_private_notes','/rest/v1/profiles?select=*',`/rest/v1/profiles?id=eq.${B}&select=${PROFILE_SELECT}&limit=1`])assert.equal((await transport(url(path),{headers})).status,503);
  assert.equal((await transport('https://bsndfhbemstyrrglajat.supabase.co/auth/v1/user',{headers})).status,503);
  assert.equal((await transport(url('/auth/v1/user'),{headers:{...headers,Authorization:`Bearer ${token(A,{ref:'foreign'})}`}})).status,503);
  assert.equal(calls.length,4);
  for(const call of calls){assert.equal(call.options.method,'GET');assert.equal(call.options.redirect,'error');assert.equal(call.options.credentials,'omit');assert.equal(call.options.cache,'no-store');}
});
test('standalone GET transport preserves denial status and excludes raw errors and redirects',async()=>{
  for(const status of [401,403,500,302]){
    const transport=createHostedReadTransport({pin,keyReader,now,fetchImpl:async()=>status===302?new Response(null,{status,headers:{Location:'https://lockliel.com'}}):Response.json({error:'PRIVATE_RESPONSE'},{status})});
    const result=await transport(url('/auth/v1/user'),{headers:{apikey:key,Authorization:`Bearer ${token()}`}});
    assert.equal(result.status,[401,403].includes(status)?status:503);assert.equal((await result.text()).includes('PRIVATE_RESPONSE'),false);
  }
});
