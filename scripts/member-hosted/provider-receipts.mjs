// LOCAL operator preparation only. No default network, environment or key reader.
import {createHash} from 'node:crypto';
import {validateHostedPin} from '../../netlify/member-hosted/binding.mjs';

export const RECEIPT_SOURCE = '327ba098628f70aa65140862b8b14cd709bfd711';
export const RECEIPT_SITE = '70b03a42-6329-476e-bf4b-2b1ce30e9567';
export const RECEIPT_PROJECT = 'qjksggxorghaxvpyslip';
const NAME='jade-unicorn-642f40', TEAM='6a674f7a0e2cdcc2b838db89';
const ROOT=`/api/v1/sites/${RECEIPT_SITE}`, API='https://api.netlify.com';
const RETIRED=new Set(['6ae8942b7f6512d039ce0da6','6ae8a1aa48521d4528081700']);
const ROUTES=['/api/lockliel/member-read','/api/lockliel-auth/login','/api/lockliel-auth/logout'];
const FUNCTIONS=['lockliel-member-read','lockliel-login','lockliel-logout'];
const handles=new WeakMap();
const fail=message=>{throw Error(message);};
const demand=(condition,message)=>{if(!condition)fail(message);};
const canonical=value=>JSON.stringify(value,(_k,v)=>v&&Object.getPrototypeOf(v)===Object.prototype?Object.fromEntries(Object.entries(v).sort(([a],[b])=>a.localeCompare(b))):v);
const same=(a,b)=>canonical(a)===canonical(b);
const own=(value,key)=>Boolean(value)&&Object.hasOwn(value,key);
const copy=value=>JSON.parse(JSON.stringify(value));
const freeze=value=>{if(value&&typeof value==='object'){for(const child of Object.values(value))freeze(child);Object.freeze(value);}return value;};
function seal(kind,value,owner){const handle=Object.freeze({kind});handles.set(handle,{kind,value:freeze(value),owner});return handle;}
function unseal(handle,kind,owner){const record=handles.get(handle);demand(record?.kind===kind&&(!owner||record.owner===owner),'Untrusted receipt handle.');return record.value;}
function pinValue(pin){const valid=validateHostedPin(pin);demand(valid&&valid.binding.source===RECEIPT_SOURCE&&valid.binding.site===RECEIPT_SITE&&valid.binding.project===RECEIPT_PROJECT&&!RETIRED.has(valid.binding.deploy),'Exact fresh isolated candidate pin required.');return copy(valid);}
function draftForm(value){if(!own(value,'draft'))return 'omitted';if(value.draft===null)return 'null';if(value.draft===true)return 'true';fail('Explicit false or malformed draft denied.');}
function siteProjection(raw){
  demand(raw&&['id','name','account_id','published_deploy','deploy_id','custom_domain','domain_aliases','branch_deploy_custom_domain','deploy_preview_custom_domain'].every(k=>own(raw,k)),'Incomplete site publication metadata.');
  demand(raw.id===RECEIPT_SITE&&raw.name===NAME&&raw.account_id===TEAM,'Wrong site identity.');
  demand(raw.published_deploy===null&&raw.deploy_id===''&&raw.custom_domain===null&&same(raw.domain_aliases,[])&&raw.branch_deploy_custom_domain===null&&raw.deploy_preview_custom_domain===null,'Unexpected publication or alias configuration.');
  return Object.fromEntries(['id','name','account_id','published_deploy','deploy_id','custom_domain','domain_aliases','branch_deploy_custom_domain','deploy_preview_custom_domain'].map(k=>[k,copy(raw[k])]));
}
function deployProjection(raw){
  const keys=['id','site_id','state','context','branch','review_id','published_at','created_at'];
  demand(raw&&keys.every(k=>own(raw,k))&&/^[a-f0-9]{24}$/.test(raw.id)&&raw.site_id===RECEIPT_SITE,'Incomplete deployment identity metadata.');
  demand(typeof raw.state==='string'&&typeof raw.context==='string'&&typeof raw.created_at==='string'&&Number.isFinite(Date.parse(raw.created_at)),'Malformed deployment metadata.');
  const projection=Object.fromEntries(keys.map(k=>[k,copy(raw[k])]));
  if(own(raw,'draft'))projection.draft=raw.draft;
  if(own(raw,'commit_ref'))projection.commit_ref=raw.commit_ref;
  return projection;
}
function fresh(at,now){demand(Number.isSafeInteger(at)&&Number.isSafeInteger(now)&&at<=now&&now-at<=300000,'Fresh captured provider evidence required.');}
function preservation(before,after,id,removed=false){
  demand(same(before.site,after.site)&&same(before.branches,after.branches),'Publication or alias preservation failed.');
  demand(before.history.length>0&&!before.history.some(d=>d.id===id),'New deployment must not be historical.');
  demand(same(before.history,after.history.filter(d=>d.id!==id)),'Historical deployment preservation failed.');
  demand(after.history.filter(d=>d.id===id).length===(removed?0:1),'Unexpected deployment inventory changed.');
}

/** Trust boundary: construct ONLY with a reviewed authenticated, redirect-denying
 * provider transport. Dependency injection is not cryptographic authentication.
 * Arbitrary JSON/browser input cannot create opaque handles; the JS host itself is
 * trusted. No provider URL is followed, and response bodies never escape this reader. */
export function createProviderReceiptReader({request,publicRequest,now=Date.now}={}){
  demand(typeof request==='function'&&typeof now==='function','A reviewed provider transport is required.');
  const owner={};
  async function read(path,expected=200){
    let reply;try{reply=await request({method:'GET',path,redirect:'error'});}catch{fail('Provider metadata transport failed.');}
    demand(reply?.url===API+path&&reply.redirected===false,'Provider transport origin or redirect not verified.');
    demand(reply.status===expected,'Unexpected provider metadata status.');
    return expected===200?reply.data:null;
  }
  async function snapshot(){
    const site=siteProjection(await read(ROOT));
    const branches=await read(`${ROOT}/deployed-branches`);
    demand(same(branches,[]),'Unexpected branch alias inventory.');
    const history=[],ids=new Set();let complete=false;
    for(let page=1;page<=10;page++){
      const rows=await read(`${ROOT}/deploys?per_page=100&page=${page}`);
      demand(Array.isArray(rows)&&rows.length<=100,'Malformed deployment pagination.');
      for(const row of rows){const d=deployProjection(row);demand(!ids.has(d.id),'Duplicate deployment pagination denied.');ids.add(d.id);history.push(d);}
      if(rows.length<100){complete=true;break;}
    }
    demand(complete,'Complete deployment pagination unavailable.');
    history.sort((a,b)=>a.id.localeCompare(b.id));
    // Re-read publication authority after pagination, rather than trusting one stale site view.
    demand(same(site,siteProjection(await read(ROOT))),'Site changed during snapshot.');
    return {site,branches:[],history,observedAt:now()};
  }
  async function captureBaseline(){return seal('baseline',await snapshot(),owner);}
  async function collectPublication({pin,before,stage='finalize'}={}){
    const p=pinValue(pin),baseline=unseal(before,'baseline',owner);fresh(baseline.observedAt,now());
    demand(['reserve','finalize'].includes(stage),'Unsupported publication stage.');
    const path=`${ROOT}/deploys/${p.binding.deploy}`;
    const first=deployProjection(await read(path));
    const after=await snapshot(),last=deployProjection(await read(path));
    fresh(after.observedAt,now());preservation(baseline,after,p.binding.deploy);
    for(const d of [first,last,after.history.find(d=>d.id===p.binding.deploy)]){
      demand(d.id===p.binding.deploy&&d.site_id===p.binding.site&&d.context===p.context,'Wrong deployment binding or context.');
      demand(d.published_at===null&&d.branch===null&&d.review_id===null,'Deployment publication or alias binding denied.');
      demand(!own(d,'commit_ref')||d.commit_ref===null||d.commit_ref===p.binding.source,'Provider source mismatch.');
      demand((stage==='finalize'?['ready']:['new','prepared']).includes(d.state),'Wrong deployment lifecycle state.');
      draftForm(d);
    }
    demand(same(first,last),'Deployment changed during publication capture.');
    return seal('publication',{source:'authenticated-scoped-provider-read',site:p.binding.site,id:p.binding.deploy,context:p.context,draft:true,published:false,state:last.state,url:p.origin,commit:last.commit_ref??null,observedAt:after.observedAt,rawDraft:{present:own(last,'draft'),form:draftForm(last)},derivation:'complete-independent-publication-and-history',pin:p},owner);
  }
  async function verifyRetirement({pin,before}={}){
    const p=pinValue(pin),baseline=unseal(before,'baseline',owner);
    // Historical baseline remains authority for preservation; aging must not
    // prevent containment. All retirement observations below are fresh reads.
    await read(`${ROOT}/deploys/${p.binding.deploy}`,404);await read(`/api/v1/deploys/${p.binding.deploy}`,404);
    const after=await snapshot();preservation(baseline,after,p.binding.deploy,true);
    demand(typeof publicRequest==='function','Independent credential-free URL reader required.');
    const paths=['/','/my-lockliel/review',...ROUTES,...FUNCTIONS.map(n=>`/.netlify/functions/${n}`)];
    const probes=paths.map(path=>({path,method:'GET'}));
    for(const path of [...ROUTES.slice(1),...FUNCTIONS.slice(1).map(n=>`/.netlify/functions/${n}`)])probes.push({path,method:'POST'});
    for(const {path,method} of probes){
      const url=p.origin+path;let response;try{response=await publicRequest({method,url,redirect:'error',...(method==='POST'?{body:''}:{})});}catch{fail('Independent retirement URL transport failed.');}
      demand(response?.status===404&&response.url===url&&response.redirected===false,'Containment failure: immutable surface remains accessible or unverified.');
    }
    return seal('retirement',{site:p.binding.site,id:p.binding.deploy,scopedStatus:404,globalStatus:404,paths,immutableStatus:404,historicalPreservation:true,observedAt:now()},owner);
  }
  return Object.freeze({captureBaseline,collectPublication,verifyReservation:args=>collectPublication({...args,stage:'reserve'}),verifyFinalized:args=>collectPublication({...args,stage:'finalize'}),verifyRetirement});
}
export function publicationReceipt(handle,{now=Date.now()}={}){const value=unseal(handle,'publication');fresh(value.observedAt,now);return freeze(copy(value));}
export function retirementReceipt(handle,{now=Date.now()}={}){const value=unseal(handle,'retirement');fresh(value.observedAt,now);return freeze(copy(value));}

/** Bytes must come from a separately reviewed, immutable-deploy-scoped provider
 * reader. This helper verifies hash domains only, never upgrades bytes or upload
 * echoes into provider provenance. No raw file or archive bytes leave the helper. */
export function compareArtifactBytes({expected,bytes}={}){
  demand(expected&&/^[a-f0-9]{64}$/.test(expected.sha256)&&/^[a-f0-9]{40}$/.test(expected.sha1)&&Number.isSafeInteger(expected.size)&&expected.size>=0&&Buffer.isBuffer(bytes),'Artifact hash domains missing.');
  const hash=algorithm=>createHash(algorithm).update(bytes).digest('hex');
  demand(expected.sha256===hash('sha256')&&expected.sha1===hash('sha1')&&expected.size===bytes.length,'Altered artifact or hash-domain mismatch.');
  return Object.freeze({sha256:expected.sha256,sha1:expected.sha1,size:expected.size});
}

// The published API documents SITE-scoped file/function GETs, and native upload
// PUTs, but does not establish immutable deploy ZIP or private-env readback. A
// site-level result or submitted digest cannot satisfy this missing authority.
export function assessApplicationReceipt({publication,now=Date.now(),...claims}={}){
  const captured=publicationReceipt(publication,{now});
  demand(Object.keys(claims).length===0,'Caller-supplied application/provider claims denied.');
  demand(captured.state==='ready','Finalized publication evidence required.');
  return freeze({ready:false,provider:captured,requiredIndependentEvidence:[
    'immutable-deploy-scoped static SHA1 and native ZIP SHA256 provider bridge',
    'exact three accepted native function routes and denied fallback/direct routes',
    'accepted 30 requests/60 seconds/IP processing and bounded HTTP 429 enforcement',
    'deployment-only functions secret scope and protected isolated project attestation',
    'fresh isolated database and separately authorized hosted Auth acceptance'
  ]});
}

/** Independently observe the actual byte-upload transport, not a caller's digest
 * report. This does not perform requests until the reviewed uploader calls it.
 * The injected transport is the same explicit trusted operator boundary as above.
 * Only upload ACK integrity is established, not effective hosted routing/runtime.
 */
export function createArtifactReceiptTransport({request,pin,files,now=Date.now}={}){
  const p=pinValue(pin);demand(typeof request==='function'&&files&&typeof now==='function','Reviewed artifact transport and byte inventory required.');
  const owner={},accepted=new Map();
  const expected=copy(files);
  const allowed=new Map();
  for(const [name,info] of Object.entries(expected)){
    if(name.startsWith('public/')){
      const path='/'+name.slice(7);
      demand(!path.includes('..')&&!path.includes('\\')&&!/[?#%]/.test(path),'Unsafe artifact upload path.');
      allowed.set(`/api/v1/deploys/${p.binding.deploy}/files${path.split('/').map(encodeURIComponent).join('/')}`,{name,info,algorithm:'sha1',providerName:null});
    }
  }
  for(const name of FUNCTIONS){const file=`functions/${name}.zip`;demand(expected[file],'Missing approved native archive.');allowed.set(`/api/v1/deploys/${p.binding.deploy}/functions/${name}`,{name:file,info:expected[file],algorithm:'sha256',providerName:name});}
  async function upload(input){
    const {method,path,bytes}=input||{};
    const parsed=new URL(path||'/',API),entry=allowed.get(parsed.pathname);
    demand(method==='PUT'&&parsed.origin===API&&entry&&typeof path==='string'&&path.startsWith('/api/v1/')&&path===parsed.pathname+parsed.search&&!/[\r\n#]/.test(path),'Unapproved artifact upload endpoint.');
    const query=[...parsed.searchParams.entries()];
    demand(query.every(([k,v])=>k==='runtime'&&entry.providerName&&v==='js'||k==='size'&&v===String(bytes?.length))&&new Set(query.map(([k])=>k)).size===query.length,'Unapproved artifact upload query.');
    demand(!accepted.has(entry.name),'Duplicate artifact upload denied.');
    const actual=compareArtifactBytes({expected:entry.info,bytes});
    // A private copy prevents the caller mutating bytes between verification and transport.
    const sent=Buffer.from(bytes);let reply;
    try{reply=await request({method:'PUT',path,bytes:sent,redirect:'error'});}catch{fail('Artifact upload transport failed.');}finally{sent.fill(0);}
    demand(reply?.url===API+path&&reply.redirected===false&&reply.status===200,'Artifact provider acknowledgment unverified.');
    demand(reply.data&&reply.data.sha===actual[entry.algorithm]&&(entry.providerName?reply.data.name===entry.providerName:reply.data.path===('/'+entry.name.slice(7))),'Provider artifact SHA acknowledgment mismatch.');
    accepted.set(entry.name,{...actual,providerSha:reply.data.sha,providerHashDomain:entry.algorithm,observedAt:now()});
    return Object.freeze({status:200});
  }
  function capture({configuration,publication}={}){
    const output=new Map(accepted);
    if(accepted.size!==allowed.size){
      const conf=configurationReceipt(configuration,{now:now()}),pub=publicationReceipt(publication,{now:now()});
      demand(same(conf.pin,p)&&same(pub.pin,p)&&pub.state==='ready','Fresh ready same-ID dedup authority required.');
      for(const {name,info,algorithm,providerName} of allowed.values()){
        if(output.has(name))continue;
        const key=providerName?providerName:'/'+name.slice(7),map=providerName?conf.artifactMaps.functions:conf.artifactMaps.files;
        const required=providerName?conf.required.functions:conf.required.files;
        demand(map[key]===info[algorithm],'Content-addressed dedup map mismatch.');
        const uploaded=[...accepted.values()].some(v=>v.providerSha===info[algorithm]&&v.providerHashDomain===algorithm);
        demand(!required.includes(info[algorithm])||uploaded,'Required artifact upload acknowledgment missing.');
        output.set(name,{...info,providerSha:info[algorithm],providerHashDomain:algorithm,observedAt:pub.observedAt,proof:uploaded?'content-addressed-upload-ack':'provider-finalization-dedup-and-ready'});
      }
    }
    demand(output.size===allowed.size,'Complete independent artifact acknowledgments missing.');
    return seal('artifact',{pin:p,files:Object.fromEntries(output),observedAt:now(),proof:'actual-transport-acks-or-contractual-content-addressed-ready-dedup'},owner);
  }
  return Object.freeze({upload,capture});
}
export function artifactReceipt(handle,{now=Date.now()}={}){const value=unseal(handle,'artifact');fresh(value.observedAt,now);for(const file of Object.values(value.files))fresh(file.observedAt,now);return freeze(copy(value));}

/** Exact same-ID finalization request/ACK observation. This records contractual
 * deployment-only provisioning, NOT secret readback or opaque-key project proof.
 * Secret value is neither retained in the receipt nor returned by this adapter.
 */
export function createConfigurationReceiptTransport({request,pin,files,now=Date.now}={}){
  const p=pinValue(pin),inventory=copy(files),owner={};let captured=null,attempted=false;
  demand(typeof request==='function'&&typeof now==='function','Reviewed configuration transport required.');
  async function finalize({method,path,body}={}){
    demand(!attempted,'Configuration finalization is one-shot.');attempted=true;
    demand(method==='PUT'&&path===`${ROOT}/deploys/${p.binding.deploy}`&&body&&body.draft===true,'Wrong configuration finalization endpoint.');
    demand(same(Object.keys(body).sort(),['draft','environment','files','functions','functions_config']),'Unexpected finalization configuration.');
    const staticMap=Object.fromEntries(Object.entries(inventory).filter(([n])=>n.startsWith('public/')).map(([n,v])=>['/'+n.slice(7),v.sha1]));
    const functionMap=Object.fromEntries(FUNCTIONS.map(n=>[n,inventory[`functions/${n}.zip`]?.sha256]));
    demand(same(body.files,staticMap)&&same(body.functions,functionMap)&&Object.values(functionMap).every(s=>/^[a-f0-9]{64}$/.test(s)),'Configuration artifact map mismatch.');
    demand(Array.isArray(body.environment)&&body.environment.length===1,'Exactly one deployment-private key required.');
    const env=body.environment[0];
    demand(env&&same(Object.keys(env).sort(),['is_secret','key','scopes','value'])&&env.key==='LOCKLIEL_MEMBER_READ_PUBLISHABLE_KEY'&&env.is_secret===true&&same(env.scopes,['functions'])&&typeof env.value==='string'&&/^sb_publishable_[A-Za-z0-9_-]{12,200}$/.test(env.value),'Missing or invalid deployment-private configuration.');
    demand(same(Object.keys(body.functions_config).sort(),[...FUNCTIONS].sort()),'Unexpected configured function.');
    const rates={};
    for(const [index,name] of FUNCTIONS.entries()){
      const method=index===0?'GET':'POST',config=body.functions_config[name];
      demand(same(config.routes,[{pattern:ROUTES[index],literal:ROUTES[index],methods:[method]}]),'Wrong native route configuration.');
      demand(same(Object.keys(config).sort(),index===0?['routes']:['routes','traffic_rules']),'Unexpected native function configuration.');
      if(index>0){
        const expected={action:{type:'rate_limit',config:{rate_limit_config:{algorithm:'sliding_window',window_size:60,window_limit:30},aggregate:{keys:[{type:'ip'}]}}}};
        demand(same(config.traffic_rules,expected),'Required rate configuration missing.');rates[name]={windowSize:60,windowLimit:30,aggregateBy:['ip']};
      }
    }
    let reply;try{reply=await request({method,path,body,redirect:'error'});}catch{fail('Private configuration transport failed.');}
    demand(reply?.url===API+path&&reply.redirected===false&&reply.status===200,'Private configuration provider ACK missing.');
    const ack=reply.data;
    demand(ack?.id===p.binding.deploy&&ack.site_id===p.binding.site&&ack.context===p.context&&own(ack,'published_at')&&ack.published_at===null,'Private configuration ACK binding mismatch.');draftForm(ack);
    demand(['new','prepared','uploading','uploaded','processing','processed','preparing','ready'].includes(ack.state)&&ack.branch===null&&ack.review_id===null,'Unexpected configuration ACK lifecycle.');
    for(const key of ['required','required_functions'])demand(Array.isArray(ack[key])&&new Set(ack[key]).size===ack[key].length&&ack[key].every(sha=>Object.values(key==='required'?staticMap:functionMap).includes(sha)),'Unexpected upload continuation metadata.');
    for(const key of ['required_edge_functions','required_server'])demand(!own(ack,key)||ack[key]===null||same(ack[key],[]),'Unexpected upload continuation surface.');
    captured=seal('configuration',{pin:p,observedAt:now(),scope:'deployment-only',functionsScope:true,isSecret:true,keyName:'LOCKLIEL_MEMBER_READ_PUBLISHABLE_KEY',proof:'exact-finalization-request-and-provider-ack',effectiveRuntimeVerified:false,rates,artifactMaps:{files:staticMap,functions:functionMap},required:{files:copy(ack.required),functions:copy(ack.required_functions)}},owner);
    // Return an allowlisted upload continuation projection; never echo the request.
    return freeze(copy(Object.fromEntries(['id','site_id','state','context','published_at','branch','review_id','required','required_functions','required_edge_functions','required_server'].filter(k=>own(ack,k)).map(k=>[k,ack[k]]))));
  }
  return Object.freeze({finalize,capture(){demand(captured,'Private configuration ACK not captured.');return captured;}});
}
export function configurationReceipt(handle,{now=Date.now()}={}){const value=unseal(handle,'configuration');fresh(value.observedAt,now);return freeze(copy(value));}

/** Harmless exact-origin route/rate observations. Sends only an invalid Auth body
 * with no cookie, bearer token, personal data, password or key. This observer must
 * only be invoked during a separately authorized hosted acceptance window. */
export function createRouteReceiptObserver({publicRequest,pin,now=Date.now}={}){
  const p=pinValue(pin),owner={};let used=false;
  demand(typeof publicRequest==='function'&&typeof now==='function','Reviewed credential-free HTTP observer required.');
  async function probe(method,path,expected){
    const url=p.origin+path;let reply;
    const options={method,url,redirect:'error',headers:{origin:p.origin,'content-type':'application/json',...(method==='GET'&&path===ROUTES[0]?{'x-lockliel-read-nonce':'1'.repeat(32),'x-lockliel-read-generation':'1'}:{})},...(method==='POST'?{body:'{"invalid":true}'}:{})};
    try{reply=await publicRequest(options);}catch{fail('Hosted route observation transport failed.');}
    demand(reply?.url===url&&reply.redirected===false&&expected.includes(reply.status),'Hosted route or rate evidence mismatch.');return reply.status;
  }
  return Object.freeze({async observe(){
    demand(!used,'Route/rate observer is one-shot.');used=true;
    await probe('POST',ROUTES[0],[404,405]);
    // Correct-method unauthenticated read must reach the reviewed runtime,
    // including its key/context gate, then deny the missing session.
    await probe('GET',ROUTES[0],[401]);
    for(const name of FUNCTIONS)for(const method of ['GET','POST'])await probe(method,`/.netlify/functions/${name}`,[404]);
    for(const method of ['GET','POST'])await probe(method,'/api/lockliel/unavailable',[404]);
    const rates={};
    for(const path of ROUTES.slice(1)){
      const started=now();let denied=0;
      // Invalid request bodies are rejected before key lookup/upstream Auth.
      for(let i=0;i<31;i++){const status=await probe('POST',path,[400,429]);if(i<30)demand(status===400,'Observed limit is lower than configured isolated budget.');if(i===30)demand(status===429,'Configured threshold denial missing.');if(status===429)denied++;}
      demand(now()-started>=0&&now()-started<60000&&denied>0,'Bounded rate enforcement was not observed.');
      rates[path]={requests:31,denials:denied,windowMilliseconds:now()-started};
    }
    // After exhausting the budget, a wrong-method Auth request may be
    // intercepted by the limiter. This is denial evidence only; exact method
    // enforcement is still required in separately authorized Auth acceptance.
    for(const path of ROUTES.slice(1))await probe('GET',path,[404,405,429]);
    return seal('routes',{pin:p,observedAt:now(),routes:[...ROUTES],directFunctionBlocked:true,otherApiBlocked:true,rates,proof:'independent-exact-origin-invalid-body-observation'},owner);
  }});
}
export function routeReceipt(handle,{now=Date.now()}={}){const value=unseal(handle,'routes');fresh(value.observedAt,now);return freeze(copy(value));}

/** Compose only opaque observed handles. The result fits the provider section of
 * verifyProviderBinding; its unchanged independent Auth/database/provenance gates
 * still reject it until separately authorized evidence is supplied. No hosted
 * success is implied by preparing this adapter or by offline fixtures. */
export function composeProviderReceipt({publication,artifacts,configuration,routes,now=Date.now()}={}){
  const pub=publicationReceipt(publication,{now}),art=artifactReceipt(artifacts,{now}),conf=configurationReceipt(configuration,{now}),route=routeReceipt(routes,{now});
  demand(pub.state==='ready'&&[art,conf,route].every(r=>same(r.pin,pub.pin)),'Independent evidence pin mismatch.');
  const fileMap=Object.fromEntries(Object.entries(art.files).filter(([n])=>n.startsWith('public/')).map(([n,v])=>['/'+n.slice(7),v.providerSha]));
  const functionMap=Object.fromEntries(FUNCTIONS.map(n=>[n,art.files[`functions/${n}.zip`]?.providerSha]));
  demand(Object.values(functionMap).every(s=>/^[a-f0-9]{64}$/.test(s)),'Independent native ACK inventory missing.');
  demand(same(conf.artifactMaps,{files:fileMap,functions:functionMap}),'Configuration/artifact content maps disagree.');
  return freeze({...pub,preAuthProviderEvidenceReady:true,files:fileMap,functions:functionMap,routesVerified:true,routes:route.routes,directFunctionBlocked:true,otherApiBlocked:true,configurationEvidence:{scope:conf.scope,isSecret:conf.isSecret,functionsScope:conf.functionsScope,effectiveRuntimeVerified:false},rateEvidence:route.rates,authAcceptance:null,readiness:'requires-fresh-database-key-provenance-and-authorized-auth-acceptance'});
}
