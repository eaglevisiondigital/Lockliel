/** Fixed child-only Admin creation transport. No get/list/update/delete/invite,
 * retries, redirects, sessions or configuration endpoints exist in this module.
 * Actual production authority cannot be obtained from an offline factory. */
import https from 'node:https';
import {EventEmitter} from 'node:events';
import {IDENTITY,clone,need,deny,freeze,projectCreatedUser,loginDigest,safeFailure} from './contracts.mjs';
import {validateOwnedPassword,disposeOwnedInputs,readHiddenLocalInput} from './protected-input.mjs';
import {requireFixtureAuthority,requireFixtureOperation} from './operator-authority.mjs';
const HOST='qjksggxorghaxvpyslip.supabase.co',PATH='/auth/v1/admin/users';
const live=new WeakMap();
const offline=new WeakMap(),httpFixtures=new WeakMap();
function login(label,generation){need(['A','B'].includes(label)&&/^[a-f0-9]{32}$/.test(generation));return 'lockliel-'+generation+'-'+label.toLowerCase()+'@fixture.invalid';}
export function plannedLoginDigests(generation){return freeze(['A','B'].map(label=>({label,loginSha256:loginDigest(login(label,generation))})));}
function realRequest(token,body,fixture){const f=fixture===undefined?null:httpFixtures.get(fixture);need(fixture===undefined||f);return new Promise((resolve,reject)=>{
 let responseBytes=0,done=false,request,timer;const chunks=[];
 const fail=category=>{if(done)return;done=true;clearTimeout(timer);request?.destroy();for(const b of chunks)b.fill(0);reject(new Error(category));};
 try{
  timer=setTimeout(()=>fail('PROVIDER_TIMEOUT'),f?10:10000);
  request=(f?f.request:https.request)({protocol:'https:',hostname:HOST,servername:HOST,port:443,path:PATH,method:'POST',rejectUnauthorized:true,agent:false,headers:{apikey:token.toString('utf8'),authorization:'Bearer '+token.toString('utf8'),'content-type':'application/json','content-length':body.length}},response=>{
   if(response.statusCode!==200&&response.statusCode!==201){response.resume();fail(response.statusCode>=400&&response.statusCode<500?'PROVIDER_REJECTED':'PROVIDER_AMBIGUOUS');return;}
   response.on('data',chunk=>{if(done){if(Buffer.isBuffer(chunk))chunk.fill(0);return;}responseBytes+=chunk.length;if(responseBytes>65536){if(Buffer.isBuffer(chunk))chunk.fill(0);fail('PROVIDER_AMBIGUOUS');return;}chunks.push(Buffer.from(chunk));if(Buffer.isBuffer(chunk))chunk.fill(0);});
   response.once('aborted',()=>fail('PROVIDER_AMBIGUOUS'));response.once('error',()=>fail('PROVIDER_AMBIGUOUS'));
   response.once('end',()=>{if(done)return;done=true;clearTimeout(timer);const bytes=Buffer.concat(chunks);for(const b of chunks)b.fill(0);resolve(bytes);});
  });request.setTimeout(10000,()=>fail('PROVIDER_TIMEOUT'));request.once('error',()=>fail('PROVIDER_AMBIGUOUS'));request.end(body);
 }catch{fail('PROVIDER_AMBIGUOUS');}
});}
async function create(state,label,password,generation,now,request){
 let body,raw;
 try{
  need(!state.closed&&['A','B'][state.count]===label);validateOwnedPassword(password);need(state.token.length>=32&&state.token.length<=8192&&state.token.every(x=>x>32&&x<127));state.count++;
  const email=login(label,generation);body=Buffer.from(JSON.stringify({email,password:password.toString('utf8'),email_confirm:true,user_metadata:{full_name:'Synthetic User '+label}}));
  const startedAt=state.syntheticOnly?now:Date.now();raw=await request(state.token,body);const completedAt=state.syntheticOnly?now:Date.now();need(completedAt>=startedAt&&completedAt-startedAt<=10000);need(Buffer.isBuffer(raw)&&raw.length<=65536);const user=JSON.parse(raw.toString('utf8'));const projected=projectCreatedUser(user,label,email,completedAt);need(Date.parse(projected.createdAt)>=startedAt);return projected;
 }catch(error){state.closed=true;throw new Error(safeFailure(error)==='DENIED'?'PROVIDER_AMBIGUOUS':safeFailure(error));}
 finally{disposeOwnedInputs([password,body,raw]);}
}
/** Explicit disabled zero-argument boundary: no input, no filesystem credential
 * access, no native connection and no network before reviewed live acquisition. */
export function createReviewedFixtureTransport(...args){
 need(args.length===1,'AUTHORITY_MISSING');const authority=args[0];requireFixtureAuthority(authority);
 const state={count:0,closed:false,token:null,syntheticOnly:false};const h=freeze({kind:'private-fixture-provider'});live.set(h,{state,authority});return h;
}
/** Format/destination check is not proof of key provenance or cryptographic
 * signature verification. Opaque secret keys require the separately reviewed
 * private Dashboard provenance seal; upstream verifies actual credentials. */
export function validateIsolatedOperatorCredential(value,now=Date.now()){
 try{need(Buffer.isBuffer(value)&&value.length>=32&&value.length<=8192&&value.every(x=>x>32&&x<127));const token=value.toString('utf8');
 // An opaque key cannot be bound to qjks by this owner-input path. Do not
 // transmit it and hope a wrong-project rejection establishes provenance.
 need(!token.startsWith('sb_secret_'),'AUTHORITY_MISSING');
 need(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token));const claims=JSON.parse(Buffer.from(token.split('.')[1],'base64url').toString('utf8'));need(claims.ref===IDENTITY.project&&claims.role==='service_role'&&Number.isSafeInteger(claims.exp)&&claims.exp*1000>now);
 return freeze({kind:'legacy-project-service-role',decodedProjectClaimMatches:true,requiresPrivateProjectProvenance:true});
 }catch{throw new Error('AUTHORITY_MISSING');}
}
export async function openReviewedFixtureTransport(handle){const r=live.get(handle);need(r&&!r.state.token&&!r.state.closed,'AUTHORITY_MISSING');requireFixtureOperation(r.authority,'INPUT');r.state.token=await readHiddenLocalInput('operator');try{requireFixtureAuthority(r.authority);validateIsolatedOperatorCredential(r.state.token);}catch{disposeReviewedFixtureTransport(handle);throw new Error('AUTHORITY_MISSING');}}
export async function createReviewedMember(handle,label,password){const r=live.get(handle);need(r&&r.state.token,'AUTHORITY_MISSING');const a=requireFixtureOperation(r.authority,'CREATE_'+label);const projected=await create(r.state,label,password,a.generation,Date.now(),realRequest);requireFixtureAuthority(r.authority);return projected;}
export function disposeReviewedFixtureTransport(handle){const r=live.get(handle);need(r,'AUTHORITY_MISSING');r.state.closed=true;disposeOwnedInputs([r.state.token]);r.state.token=null;live.delete(handle);}

export function transportReadiness(){return freeze({project:IDENTITY.project,host:HOST,path:PATH,method:'POST',maximumRequests:2,redirects:false,retries:false,liveEnabled:false,independentOperatorAuthority:'UNINSTALLED_REVIEWED_SEAL',nativeOpaqueAcquisition:'SOURCE_PINNED_PRIVATE_WORKER',requestImplementationPresent:typeof realRequest==='function'});}
/** Tests receive fixed scenario DATA, never a caller callback or live capability. */
export function createOfflineProvider(scenarios){const list=clone(scenarios);need(Array.isArray(list)&&list.length===2);for(const row of list){need(row&&['success','timeout','reject','redirect','malformed','wrong-project','duplicate','privileged','interrupt','secret-error'].includes(row.kind));need(Object.keys(row).every(k=>['kind','createdAt'].includes(k)));}const h=freeze({kind:'synthetic-provider-fixture',syntheticOnly:true});offline.set(h,{scenarios:list,syntheticOnly:true,count:0,closed:false,token:Buffer.from('synthetic-only-operator-credential-not-live'),calls:0});return h;}
export async function createOfflineMember(handle,label,password,generation,now){const state=offline.get(handle);need(state);return create(state,label,password,generation,now,async(_token,body)=>{
 state.calls++;const row=state.scenarios[state.calls-1],input=JSON.parse(body.toString('utf8'));
 if(row.kind==='timeout')deny('PROVIDER_TIMEOUT');if(row.kind==='reject')deny('PROVIDER_REJECTED');if(row.kind==='interrupt')deny('INTERRUPTED');if(row.kind==='secret-error')throw new Error(input.password);if(row.kind==='redirect')deny('PROVIDER_AMBIGUOUS');if(row.kind==='malformed')return Buffer.from('{');
 return Buffer.from(JSON.stringify({id:row.kind==='duplicate'?'00000000-0000-4000-8000-000000000001':label==='A'?'00000000-0000-4000-8000-000000000001':'00000000-0000-4000-8000-000000000002',email:row.kind==='wrong-project'?'wrong@fixture.invalid':input.email,created_at:row.createdAt||new Date(now).toISOString().replace(/\.([0-9]{3})Z$/,'.$1000Z'),email_confirmed_at:new Date(now).toISOString(),role:row.kind==='privileged'?'service_role':'authenticated',phone:'',is_anonymous:false,app_metadata:{provider:'email',providers:['email']},factors:[]}));
 });}
export function disposeOfflineProvider(handle){const r=offline.get(handle);need(r);r.token.fill(0);r.closed=true;return freeze({syntheticOnly:true,calls:r.calls,disposed:true});}

/** Exercises the same HTTPS envelope with a closed synthetic event source. No
 * arbitrary fetch/request callback is exported and no socket is opened. */
export async function exerciseOfflineHttpsEnvelope(kind){
 need(['success','redirect','reject','server-error','timeout','abort','overlimit','error'].includes(kind));
 let count=0,safeRequest=null;const handle=Object.freeze({});
 httpFixtures.set(handle,{request:(options,onResponse)=>{
  count++;safeRequest={hostname:options.hostname,servername:options.servername,path:options.path,method:options.method,port:options.port,rejectUnauthorized:options.rejectUnauthorized,agent:options.agent};
  const request=new EventEmitter();request.destroy=()=>{};request.setTimeout=()=>{};
  request.end=()=>queueMicrotask(()=>{
   if(kind==='timeout')return;
   if(kind==='error'){request.emit('error',new Error('SYNTHETIC_PRIVATE_RAW_FAILURE'));return;}
   const response=new EventEmitter();response.statusCode=kind==='redirect'?302:kind==='reject'?400:kind==='server-error'?503:200;response.resume=()=>{};onResponse(response);
   if(response.statusCode!==200)return;
   if(kind==='abort'){response.emit('aborted');return;}
   response.emit('data',Buffer.from(kind==='overlimit'?'x'.repeat(65537):'{}'));response.emit('end');
  });return request;
 }});
 const token=Buffer.from('SYNTHETIC-ONLY-OPERATOR-NOT-LIVE'),body=Buffer.from('{}');let result;
 try{const bytes=await realRequest(token,body,handle);bytes.fill(0);result={ok:true};}catch(error){result={ok:false,category:safeFailure(error)};}finally{disposeOwnedInputs([token,body]);httpFixtures.delete(handle);}
 return freeze({...result,syntheticOnly:true,networkRequests:0,simulatedRequests:count,request:safeRequest});
}
