/** Concrete official-HTTPS and hidden-input bindings. No I/O on import.
 * Production factory accepts no callbacks. Offline factory is a distinct private
 * capability domain. Credentials never leave the owning closure as strings. */
import {request as httpsRequest} from 'node:https';
import {requireReviewedOperatorAuthority} from './operator-authority.mjs';
import {types} from 'node:util';
import {privateIdentityMappingPayload,createSyntheticIdentityMappingFixture} from './identity-mapping.mjs';
import {createHash} from 'node:crypto';
import {createProtectedApiTransport,protectCredential,disposeCredential} from './uploader.mjs';
const SITE='70b03a42-6329-476e-bf4b-2b1ce30e9567',TEAM='6a674f7a0e2cdcc2b838db89';
const live=new WeakSet(),fixtures=new WeakSet();
const deny=()=>{throw Error('Protected operator network denied.');};
const need=x=>{if(!x)deny();};
function secureSessionCookie(value){need(typeof value==='string'&&value.length<=8192);const parts=value.split(';').map(v=>v.trim()),pair=parts.shift();need(/^(lockliel_access|lockliel_refresh)=[^;\s]*$/.test(pair));const entries=parts.map(v=>[v.split('=')[0].toLowerCase(),v]);need(new Set(entries.map(v=>v[0])).size===entries.length&&entries.every(([k])=>['path','httponly','secure','samesite','max-age'].includes(k)));const attrs=new Map(entries);need(attrs.get('path')==='Path=/'&&attrs.get('httponly')==='HttpOnly'&&attrs.get('secure')==='Secure'&&attrs.get('samesite')==='SameSite=Lax'&&/^Max-Age=\d+$/.test(attrs.get('max-age')||''));return value;}
const hash=v=>createHash('sha256').update(v).digest('hex');
const routes=['/api/lockliel/member-read','/api/lockliel-auth/login','/api/lockliel-auth/logout'];
const exact=(v,keys)=>{need(v&&Object.getPrototypeOf(v)===Object.prototype&&Object.keys(v).length===keys.length&&keys.every(k=>Object.hasOwn(v,k)));};
function readProjection(value,origin){
 exact(value,['version','nonce','generation','boundary','validUntil','binding','identity','profile','preferences','dashboard']);
 need(value.version==='lockliel-member-server-read-v1'&&/^[a-f0-9]{32}$/.test(value.nonce)&&Number.isInteger(value.generation)&&value.generation>=1&&/^[a-f0-9]{64}$/.test(value.boundary)&&Number.isSafeInteger(value.validUntil));
 exact(value.binding,['project','site','deploy','source']);need(value.binding.project==='qjksggxorghaxvpyslip'&&value.binding.site===SITE&&value.binding.source==='327ba098628f70aa65140862b8b14cd709bfd711'&&origin===`https://${value.binding.deploy}--jade-unicorn-642f40.netlify.app`);
 exact(value.identity,['status','value']);need(value.identity.status==='ready');exact(value.identity.value,['displayName','initials','assurance']);need(['aal1','aal2'].includes(value.identity.value.assurance));
 for(const [name,keys]of [['profile',['displayName','initials','onboardingStatus']],['preferences',['ministryEmail','faithBoostEmail','bookReleaseEmail','partnerEmail','smsUpdates','revision']]]){
  const section=value[name];need(section&&['ready','missing','unavailable'].includes(section.status));exact(section,section.status==='ready'?['status','value']:['status']);if(section.status==='ready')exact(section.value,keys);
 }
 exact(value.dashboard,['status','value']);need(value.dashboard.status==='ready');exact(value.dashboard.value,['courseAvailability']);need(value.dashboard.value.courseAvailability==='unavailable');
 return Object.freeze({nonce:value.nonce,generation:value.generation,boundary:value.boundary,validUntil:value.validUntil,binding:Object.freeze({...value.binding}),assurance:value.identity.value.assurance,profileStatus:value.profile.status,preferencesStatus:value.preferences.status,privateDataExcluded:true});
}
function authProjection(data,path,status){
 if(status!==200){need(data&&typeof data==='object'&&Object.keys(data).every(k=>['error','requiresMfa','revocation'].includes(k))&&typeof data.error==='string'&&data.error.length<=512);return Object.freeze({denied:true,requiresMfa:data.requiresMfa===true});}
 if(path===routes[1]){exact(data,['ok','requiresMfa','aal']);need(data.ok===true&&data.requiresMfa===false&&data.aal==='aal1');return Object.freeze({ok:true,assurance:'aal1'});}
 exact(data,['ok','localCleared','revocation']);need(data.ok===true&&data.localCleared===true&&data.revocation==='verified');return Object.freeze({ok:true,localCleared:true,revocationVerified:true});
}
function secretInput(input,output,label){
 need(input?.isTTY===true&&output?.isTTY===true&&!input.isRaw&&!input.readableEncoding);
 return new Promise((resolve,reject)=>{
  const owned=Buffer.alloc(2048);let used=0,done=false;const wasFlowing=input.readableFlowing;
  const timer=setTimeout(()=>finish(false),120000);
  function finish(ok){if(done)return;done=true;clearTimeout(timer);input.removeListener('data',onData);input.removeListener('error',onError);input.removeListener('end',onError);
   let restored=true;try{input.setRawMode(false);if(wasFlowing!==true)input.pause();output.write('\n');}catch{restored=false;}
   if(ok&&restored&&used>0){const result=Buffer.from(owned.subarray(0,used));owned.fill(0);resolve(result);}else{owned.fill(0);reject(Error('Protected local input denied.'));}}
  const onError=()=>finish(false);
  function onData(chunk){if(!Buffer.isBuffer(chunk)){finish(false);return;}try{for(const byte of chunk){if(done)break;if([3,4,27].includes(byte)){finish(false);break;}if(byte===10||byte===13){finish(true);break;}if([8,127].includes(byte)){if(used)owned[--used]=0;continue;}if(byte<32||used===owned.length){finish(false);break;}owned[used++]=byte;}}finally{chunk.fill(0);}}
  try{input.setRawMode(true);output.write(label);input.on('data',onData);input.on('error',onError);input.on('end',onError);input.resume();}catch{finish(false);}
 });
}
function assemble({requestImpl,input,output,syntheticOnly=false,identityFixture}){
 let closed=false,containment=false,normal=0,cleanup=0,publicNormal=0,publicCleanup=0,functionNormal=0,functionCleanup=0,normalReceived=0,cleanupReceived=0,origin=null,transport=null,operatorToken=null,key=null,identities=null,identityHandle=null,authorityHandle=null;
 if(syntheticOnly&&identityFixture){createSyntheticIdentityMappingFixture(identityFixture);identities=identityFixture.artifact;}
 const jars=new Map(),memberInputs=new Map(),pendingAuth=new Set();let keyAttested=false;
 const normalAuthority=()=>{if(!syntheticOnly){need(authorityHandle);requireReviewedOperatorAuthority(authorityHandle);if(identityHandle)privateIdentityMappingPayload(identityHandle);}};
 const functionBudget=()=>{if(containment)need(++functionCleanup<=20);else need(++functionNormal<=180);};
 const publicBudget=()=>{need(!closed);if(containment)need(++publicCleanup<=50);else need(++publicNormal<=950);};
 const budget=()=>{need(!closed);if(!containment)normalAuthority();if(containment)need(++cleanup<=40);else need(++normal<=200);};
 function confinedUrl(url){
  const u=new URL(url);need(u.protocol==='https:'&&!u.username&&!u.password&&!u.hash);
  need(origin&&u.origin===origin&&!u.search);
  const direct=/^\/.netlify\/functions\/lockliel-(?:member-read|login|logout)$/.test(u.pathname);
  need(routes.includes(u.pathname)||direct||['/','/my-lockliel/review','/api/lockliel/unlisted','/api/lockliel/unavailable','/api/lockliel/admin'].includes(u.pathname));return u;
 }
 async function wire(url,{method='GET',headers={},bytes=null,json=false,max=1024*1024}={}){
  need(!closed&&typeof url==='string'&&(bytes===null||Buffer.isBuffer(bytes)));if(!containment)normalAuthority();
  return new Promise((resolve,reject)=>{
   let settled=false,size=0;const chunks=[];const finish=(ok,result)=>{if(settled)return;settled=true;for(const c of chunks)c.fill(0);if(ok)resolve(result);else reject(Error('Protected HTTPS observation failed.'));};
   let req;try{req=requestImpl(url,{method,headers,timeout:20000,rejectUnauthorized:true},res=>{
    if(!Number.isInteger(res.statusCode)||res.statusCode>=300&&res.statusCode<400){res.resume();finish(false);return;}
    res.on('data',c=>{if(!Buffer.isBuffer(c)||(size+=c.length)>max||(containment?(cleanupReceived+=c.length)>1024*1024:(normalReceived+=c.length)>49*1024*1024)){res.destroy();finish(false);return;}chunks.push(c);});
    res.on('error',()=>finish(false));res.on('aborted',()=>finish(false));res.on('end',()=>{
     let raw;try{raw=Buffer.concat(chunks);if(operatorToken)need(!raw.includes(operatorToken));
      const data=json&&raw.length?JSON.parse(raw.toString('utf8')):null;
      finish(true,{status:res.statusCode,url,redirected:false,headers:res.headers??{},body:raw,data});raw=null;
     }catch{raw?.fill(0);finish(false);}
    });
   });req.on('error',()=>finish(false));req.on('timeout',()=>{req.destroy();finish(false);});if(bytes)req.write(bytes);req.end();}catch{req?.destroy();finish(false);}
  });
 }
 const api={
  bindAuthority(handle){need(!authorityHandle&&!closed&&!containment);requireReviewedOperatorAuthority(handle);authorityHandle=handle;},
  bindIdentities(handle){need(!identities&&!closed&&!containment);identities=privateIdentityMappingPayload(handle);identityHandle=handle;},
  async openOperator(){normalAuthority();need(!operatorToken&&!transport&&!closed&&!containment);operatorToken=await secretInput(input,output,'Netlify operator token (hidden): ');normalAuthority();need(operatorToken.length>=12&&operatorToken.length<=512);
   const handle=protectCredential(Buffer.from(operatorToken));
   try{transport=createProtectedApiTransport({credential:handle,requestImpl:(url,options,callback)=>{budget();return requestImpl(url,options,callback);},authorize:()=>!closed});}catch{disposeCredential(handle);throw Error('Protected operator network denied.');}
  },
  async providerAuthority(expectedCallerId){
   need(operatorToken&&typeof expectedCallerId==='string'&&/^[a-f0-9]{24}$/.test(expectedCallerId));
   const project=async path=>{budget();const r=await wire('https://api.netlify.com/api/v1'+path,{headers:{authorization:'Bearer '+operatorToken.toString('utf8')},json:true,max:4*1024*1024});try{need(r.status===200);return r.data;}finally{r.body.fill(0);}};
   const caller=await project('/user'),account=await project('/accounts/'+TEAM);
   need(caller?.id===expectedCallerId&&account?.id===TEAM&&Array.isArray(account.owner_ids)&&account.owner_ids.includes(caller.id)&&account.role==='Owner'&&account.site_access==='all');
   const credits=account.capabilities?.credits,rules=account.capabilities?.max_traffic_rules;
   need(account.lifecycle_state==='active'&&account.auto_topup_enabled===false&&Array.isArray(account.usages_exceeded)&&account.usages_exceeded.length===0&&Array.isArray(account.configurable_limits_exceeded)&&account.configurable_limits_exceeded.length===0);
   for(const item of [credits,rules])need(item&&Number.isFinite(item.included)&&Number.isFinite(item.used)&&item.used>=0&&item.included>=item.used);
   need(credits.included-credits.used>=20&&rules.included-rules.used>=2);
   return Object.freeze({site:SITE,account:TEAM,operatorIdSha256:hash(caller.id),ownerVerified:true,siteAccessAll:true,creditHeadroom:credits.included-credits.used,autoTopup:false,ruleHeadroom:rules.included-rules.used,source:'official-authenticated-provider-identity'});
  },
  async request(operation){need(transport);return transport.request(operation);},
  bindOrigin(id){need(!origin&&typeof id==='string'&&/^[a-f0-9]{24}$/.test(id)&&!['6ae8942b7f6512d039ce0da6','6ae8a1aa48521d4528081700'].includes(id));origin=`https://${id}--jade-unicorn-642f40.netlify.app`;},
  async publicRequest(op){need(op?.redirect==='error');publicBudget();const u=confinedUrl(op.url);if(u.pathname.startsWith('/api/')||u.pathname.startsWith('/.netlify/functions/'))functionBudget();need(['GET','POST'].includes(op.method)&&[undefined,'','{}','{"invalid":true}'].includes(op.body));
   const bytes=op.method==='POST'?Buffer.from(op.body??'{}'):null;
   try{const r=await wire(op.url,{method:op.method,headers:{origin,'content-type':'application/json',...(op.method==='GET'&&u.pathname===routes[0]?{'x-lockliel-read-nonce':'1'.repeat(32),'x-lockliel-read-generation':'1'}:{})},bytes});r.body.fill(0);return {status:r.status,url:r.url,redirected:false};}finally{bytes?.fill(0);}
  },
  async isolatedKey(){normalAuthority();need(!key&&!closed&&!containment);const confirmation=await secretInput(input,output,'Confirm key source: type isolated project ref (hidden): ');try{normalAuthority();need(confirmation.toString('utf8')==='qjksggxorghaxvpyslip');keyAttested=true;}finally{confirmation.fill(0);}const bytes=await secretInput(input,output,'Isolated qjks publishable key (hidden): ');try{normalAuthority();need(/^sb_publishable_[A-Za-z0-9_-]{12,200}$/.test(bytes.toString('utf8')));key=protectCredential(bytes);return key;}finally{bytes.fill(0);}},
  keyProvenance(){need(key&&keyAttested&&!closed);return Object.freeze({project:'qjksggxorghaxvpyslip',mechanism:'protected-owner-project-attestation',noValueRecorded:true});},
  async member(label,method,path,{body,headers={}}={}){
   normalAuthority();need(!containment&&['A','B'].includes(label)&&routes.includes(path)&&['GET','POST'].includes(method));publicBudget();functionBudget();need(headers&&Object.getPrototypeOf(headers)===Object.prototype&&Object.keys(headers).every(k=>['x-lockliel-read-nonce','x-lockliel-read-generation'].includes(k)));confinedUrl(origin+path);
   let bytes=null;
   if(path===routes[1]){
    need(method==='POST'&&!memberInputs.has(label)&&identities);memberInputs.set(label,true);let email,password;
    try{email=await secretInput(input,output,`Synthetic User ${label} login identifier (hidden): `);normalAuthority();const identifier=new TextDecoder('utf-8',{fatal:true}).decode(email).trim().toLowerCase();need(hash('lockliel:qjks:login:'+identifier)===identities.subjects.find(row=>row.label===label).loginSha256);password=await secretInput(input,output,`Synthetic User ${label} password (hidden): `);
     normalAuthority();const decoder=new TextDecoder('utf-8',{fatal:true});const e=decoder.decode(email),p=decoder.decode(password);need(e.length<=254&&p.length>0&&p.length<=128&&/^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(e));bytes=Buffer.from(JSON.stringify({email:e,password:p}));memberInputs.set(label,true);
    }finally{email?.fill(0);password?.fill(0);}
   }else if(method==='POST'){need(body===undefined||body==='{}');bytes=Buffer.from('{}');}
   try{
    if(path===routes[1])pendingAuth.add(label);
    const r=await wire(origin+path,{method,headers:{...(method==='POST'?{origin,'content-type':'application/json'}:{}),...(jars.has(label)?{cookie:jars.get(label)}:{}),...headers},bytes,json:true});
    const rawCookies=r.headers['set-cookie'];let cookiesSecure=false;
    if(rawCookies!==undefined){need(Array.isArray(rawCookies)&&rawCookies.length===2&&rawCookies.every(c=>typeof c==='string'&&/^(lockliel_access|lockliel_refresh)=/.test(c)&&/; Secure(?:;|$)/i.test(c)&&/; HttpOnly(?:;|$)/i.test(c)&&/; SameSite=Lax(?:;|$)/i.test(c)&&!/; Domain=/i.test(c)&&/; Path=\/(?:;|$)/i.test(c)&&c.length<=8192&&secureSessionCookie(c)===c));const values=rawCookies.map(c=>c.split(';',1)[0]);need(values[0].split('=')[0]!==values[1].split('=')[0]);jars.set(label,values.join('; '));cookiesSecure=true;}
    // Raw body and cookie material never leave this method; only DTO validation
    // callback-free projection. Member DTO itself must be reviewed by caller.
    let projected,subjectSha256=null;
    try{
     need(!/eyJ[A-Za-z0-9_-]{12,}\.[A-Za-z0-9_-]{12,}\.[A-Za-z0-9_-]{8,}/.test(r.body.toString('utf8')));
     if(path===routes[0]&&r.status===200)projected=readProjection(r.data,origin);
     else if(path===routes[0]){exact(r.data,['error']);need(typeof r.data.error==='string'&&r.data.error.length<=512);projected={denied:true};}
     else projected=authProjection(r.data,path,r.status);
     if(path===routes[1]&&r.status===200){
      need(cookiesSecure);const cookie=jars.get(label),access=cookie.split('; ').find(c=>c.startsWith('lockliel_access=')).slice(16);need(access.length<=8192&&access.split('.').length===3);
      const claims=JSON.parse(Buffer.from(access.split('.')[1],'base64url').toString('utf8'));need(/^[a-f0-9-]{36}$/i.test(claims.sub)&&claims.iss==='https://qjksggxorghaxvpyslip.supabase.co/auth/v1'&&claims.role==='authenticated'&&claims.aal==='aal1'&&Number.isSafeInteger(claims.exp)&&claims.exp*1000>Date.now());
      for(const [other,jar]of jars)if(other!==label)need(jar!==cookie);
      subjectSha256=hash('lockliel:qjks:auth:'+claims.sub.toLowerCase());
     }
     if(path===routes[2]&&r.status===200){jars.delete(label);pendingAuth.delete(label);}
     return Object.freeze({status:r.status,cookiesSecure,subjectSha256,projection:projected});
    }finally{r.body.fill(0);}
   }catch{throw Error('Protected synthetic member observation failed.');}finally{bytes?.fill(0);}
  },
  async cleanupMembers(){
   if(!containment){containment=true;await transport?.beginContainment();}let verified=true;for(const [label,cookie]of jars){let body;try{publicBudget();functionBudget();body=Buffer.from('{}');const r=await wire(origin+routes[2],{method:'POST',headers:{origin,'content-type':'application/json',cookie},bytes:body,json:true});try{const result=authProjection(r.data,routes[2],r.status);need(r.status===200&&result.revocationVerified===true);pendingAuth.delete(label);}finally{r.body.fill(0);}}catch{verified=false;}finally{body?.fill(0);jars.delete(label);}}
   return Object.freeze({verified:verified&&pendingAuth.size===0,remainingPrivateJars:jars.size,unresolvedSessionPossible:pendingAuth.size>0});
  },
  async beginContainment(){if(!containment){containment=true;await transport?.beginContainment();}},
  close(){closed=true;transport?.close();operatorToken?.fill(0);operatorToken=null;disposeCredential(key);jars.clear();memberInputs.clear();pendingAuth.clear();identities=null;identityHandle=null;authorityHandle=null;},
 };
 const result=Object.freeze(api);(syntheticOnly?fixtures:live).add(result);return result;
}
export function createOfficialOperatorNetwork(...args){need(args.length===0);return assemble({requestImpl:httpsRequest,input:process.stdin,output:process.stdout});}
export function requireOfficialOperatorNetwork(value){need(live.has(value));return value;}
/** Offline-only callback seam; cannot pass requireOfficialOperatorNetwork. */
export function createSyntheticOperatorNetwork(options){need(options?.syntheticOnly===true&&!types.isProxy(options)&&typeof options.requestImpl==='function');return assemble({...options,syntheticOnly:true});}
