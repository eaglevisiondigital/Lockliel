/** Local reviewed operator library. Importing this file performs no I/O. There is
 * no CLI, ambient credential source, network fallback, or execution authorization.
 * The injected authority, provider reader and HTTP implementation are trusted
 * operator code, never browser/caller JSON. Wave 10H exercises synthetic mocks only.
 */
import {readFile, lstat} from 'node:fs/promises';
import {join, resolve, relative} from 'node:path';
import {inspect} from 'node:util';
import {validateHostedPin, HOSTED_KEY_NAME} from '../../netlify/member-hosted/binding.mjs';
import {digest, verifyLocalPackage} from './verify.mjs';
import {createArtifactReceiptTransport,createConfigurationReceiptTransport,composeProviderReceipt} from './provider-receipts.mjs';

export const APPROVED_SOURCE='327ba098628f70aa65140862b8b14cd709bfd711';
export const APPROVED_SITE='70b03a42-6329-476e-bf4b-2b1ce30e9567';
export const APPROVED_PROJECT='qjksggxorghaxvpyslip';
export const RETIRED_EXPERIMENTS=Object.freeze(['6ae8942b7f6512d039ce0da6','6ae8a1aa48521d4528081700']);
export const HOSTED_FUNCTIONS=Object.freeze([
  Object.freeze({name:'lockliel-member-read',route:'/api/lockliel/member-read',method:'GET'}),
  Object.freeze({name:'lockliel-login',route:'/api/lockliel-auth/login',method:'POST'}),
  Object.freeze({name:'lockliel-logout',route:'/api/lockliel-auth/logout',method:'POST'})
]);
const API='https://api.netlify.com';
const secrets=new WeakMap();
const safeId=value=>typeof value==='string'&&/^[a-f0-9]{24}$/.test(value)&&!RETIRED_EXPERIMENTS.includes(value);
const requireCondition=(ok)=>{if(!ok)throw Error('Protected deployment operation denied.');};
const plain=value=>value&&Object.getPrototypeOf(value)===Object.prototype;
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);

/** Takes ownership of a caller buffer, clears it immediately, and stores a private
 * copy. All owned buffers are cleared on use/disposal. JavaScript/TLS libraries
 * may create immutable strings; physical erasure of those GC-managed copies is
 * not guaranteed. Never stringify, log or persist transport internals.
 */
export function protectCredential(input){
  const valid=Buffer.isBuffer(input)&&input.length>=12&&input.length<=512;
  if(!valid){if(Buffer.isBuffer(input))input.fill(0);requireCondition(false);}
  const held=Buffer.from(input);input.fill(0);
  const handle=Object.freeze({[inspect.custom]:()=> '[Protected credential]',toJSON:()=> '[Protected credential]'});
  secrets.set(handle,held);return handle;
}
export function disposeCredential(handle){const bytes=secrets.get(handle);if(bytes)bytes.fill(0);secrets.delete(handle);}
function credentialBytes(handle){const bytes=secrets.get(handle);requireCondition(bytes?.length>=12);return bytes;}

/** Explicitly supplied interactive terminal only. No env/argv/file/clipboard
 * source. Raw mode prevents echo. Labels, exceptions and cancellation are fixed.
 * The caller must retain exclusive ownership of the supplied TTY streams.
 */
export function readHiddenCredential({input,output,timeoutMs=120000}={}){
  requireCondition(input?.isTTY===true&&output?.isTTY===true&&typeof input.setRawMode==='function'&&typeof output.write==='function'&&Number.isSafeInteger(timeoutMs)&&timeoutMs>=1&&timeoutMs<=120000);
  return new Promise((resolvePromise,reject)=>{
    const bytes=Buffer.alloc(512);let used=0,settled=false,timer;
    const wasRaw=input.isRaw===true,wasFlowing=input.readableFlowing;
    function finish(ok){
      if(settled)return;settled=true;
      clearTimeout(timer);input.removeListener('data',onData);input.removeListener('error',onError);input.removeListener('end',onError);
      let restored=true;try{input.setRawMode(wasRaw);if(wasFlowing!==true)input.pause();output.write('\n');}catch{restored=false;}
      if(ok&&restored&&used>=12){const value=protectCredential(Buffer.from(bytes.subarray(0,used)));bytes.fill(0);resolvePromise(value);}
      else {bytes.fill(0);reject(Error('Protected credential input unavailable.'));}
    }
    function onError(){finish(false);}
    function onData(chunk){
      // Reject strings: a stream configured with an encoding creates additional
      // credential strings which this input routine cannot clear.
      if(!Buffer.isBuffer(chunk)){finish(false);return;}
      try{for(const byte of chunk){
        if(settled)break;
        if(byte===3||byte===4||byte===27){finish(false);break;}
        if(byte===10||byte===13){finish(true);break;}
        if(byte===8||byte===127){if(used)bytes[--used]=0;continue;}
        if(byte<33||byte>126||used===bytes.length){finish(false);break;}
        bytes[used++]=byte;
      }}finally{chunk.fill(0);}
    }
    try{requireCondition(!input.readableEncoding&&!wasRaw);input.setRawMode(true);output.write('Protected value (hidden): ');input.on('data',onData);input.on('error',onError);input.on('end',onError);timer=setTimeout(onError,timeoutMs);input.resume();}
    catch{finish(false);}
  });
}

function pinFor(id){
  requireCondition(safeId(id));
  return {version:'lockliel-member-hosted-v1',binding:{source:APPROVED_SOURCE,site:APPROVED_SITE,project:APPROVED_PROJECT,deploy:id},origin:`https://${id}--jade-unicorn-642f40.netlify.app`,context:'deploy-preview',schema:280,protocol:'278-v1',paused:true};
}
function checkPin(pin){requireCondition(validateHostedPin(pin)&&pin.binding.source===APPROVED_SOURCE&&pin.binding.site===APPROVED_SITE&&pin.binding.project===APPROVED_PROJECT&&safeId(pin.binding.deploy));}
function checkDeploy(value,id){
  requireCondition(plain(value)&&value.id===id&&value.site_id===APPROVED_SITE&&value.context==='deploy-preview'&&Object.hasOwn(value,'published_at')&&value.published_at===null&&(!Object.hasOwn(value,'draft')||value.draft===null||value.draft===true)&&value.branch==null&&value.review_id==null);
}
function responseOK(response){requireCondition(response&&response.status===200&&response.redirected===false);return response.data;}

/** Frozen-byte upload plan. Never uploads artifacts/, local config, the manifest,
 * wider application source, or evidence. Reads each package byte again and checks
 * hashes before retaining an owned copy, preventing mutable-file upload races.
 */
export async function prepareUpload({directory,pin,expectedManifestSha256}={}){
  checkPin(pin);
  pin=structuredClone(pin);Object.freeze(pin.binding);Object.freeze(pin);
  let local;
  try{local=await verifyLocalPackage({directory,expectedPin:pin,expectedManifestSha256,allowLocalFixture:false});}
  catch{throw Error('Protected deployment package verification failed.');}
  requireCondition(local.manifest.version==='lockliel-member-auth-package-v1'&&local.manifest.authEnabled===true);
  const root=resolve(directory),blobs=new Map();let disposed=false;
  try{
    for(const [name,expected]of Object.entries(local.files)){
      if(!name.startsWith('public/')&&!HOSTED_FUNCTIONS.some(fn=>name===`functions/${fn.name}.zip`))continue;
      const path=resolve(root,name);requireCondition(relative(root,path)&&!relative(root,path).startsWith('..'));
      let cursor=root;for(const part of name.split('/')){cursor=join(cursor,part);requireCondition(!(await lstat(cursor)).isSymbolicLink());}
      const bytes=await readFile(path);requireCondition(bytes.length===expected.size&&digest(bytes)===expected.sha256&&digest(bytes,'sha1')===expected.sha1);blobs.set(name,bytes);
    }
    const files=Object.fromEntries([...blobs].filter(([n])=>n.startsWith('public/')).map(([n,b])=>['/'+n.slice(7),digest(b,'sha1')]));
    const functions=Object.fromEntries(HOSTED_FUNCTIONS.map(fn=>[fn.name,digest(blobs.get(`functions/${fn.name}.zip`))]));
    const functions_config=Object.fromEntries(HOSTED_FUNCTIONS.map(fn=>[fn.name,{
      routes:[{pattern:fn.route,literal:fn.route,methods:[fn.method]}],
      ...(fn.method==='POST'?{traffic_rules:{action:{type:'rate_limit',config:{rate_limit_config:{algorithm:'sliding_window',window_size:60,window_limit:30},aggregate:{keys:[{type:'ip'}]}}}}}: {})
    }]));
    const plan={files,functions,functions_config};
    // Internal closure, not exported bytes/manifest references, owns the plan.
    return Object.freeze({pin:structuredClone(pin),manifestSha256:local.manifestSha256,
      body:()=>{requireCondition(!disposed);return structuredClone(plan);},
      inventory:()=>{requireCondition(!disposed);return structuredClone(local.files);},
      async sendRequired(request,required){
        requireCondition(!disposed);
        requireCondition(Array.isArray(required.required)&&Array.isArray(required.required_functions));
        requireCondition(required.required_edge_functions==null||same(required.required_edge_functions,[]));
        requireCondition(required.required_server==null||same(required.required_server,[]));
        const wantedFiles=new Set(required.required),wantedFunctions=new Set(required.required_functions);
        requireCondition(wantedFiles.size===required.required.length&&wantedFunctions.size===required.required_functions.length&&[...wantedFiles].every(x=>Object.values(files).includes(x))&&[...wantedFunctions].every(x=>Object.values(functions).includes(x)));
        for(const [name,bytes]of blobs){
          const isStatic=name.startsWith('public/'),key=isStatic?digest(bytes,'sha1'):digest(bytes);
          // Obtain a complete fresh byte/ACK bridge even when provider digest
          // deduplication says some approved bytes are already cached. Send each
          // exact approved blob once, never unrequested/unapproved extra content.
          requireCondition(isStatic?Object.values(files).includes(key):Object.values(functions).includes(key));
          const suffix=isStatic?`files/${name.slice(7).split('/').map(encodeURIComponent).join('/')}`:`functions/${name.slice(10,-4)}?runtime=js&size=${bytes.length}`;
          const copy=Buffer.from(bytes);
          try{const response=await request({method:'PUT',path:`/api/v1/deploys/${pin.binding.deploy}/${suffix}`,bytes:copy,redirect:'error'});requireCondition(response.status===200&&response.redirected===false);}finally{copy.fill(0);}
        }
      },dispose(){disposed=true;for(const bytes of blobs.values())bytes.fill(0);blobs.clear();}
    });
  }catch{for(const bytes of blobs.values())bytes.fill(0);throw Error('Protected deployment package verification failed.');}
}

const readPaths=path=>path===`/api/v1/sites/${APPROVED_SITE}`||path===`/api/v1/sites/${APPROVED_SITE}/deployed-branches`||new RegExp(`^/api/v1/sites/${APPROVED_SITE}/deploys(?:\\?per_page=100&page=[1-9][0-9]{0,2}|/[a-f0-9]{24})?$`).test(path)||/^\/api\/v1\/deploys\/[a-f0-9]{24}$/.test(path);
function operationAllowed({method,path}){
  if(typeof path!=='string'||/[\r\n#]/.test(path))return false;
  if(method==='GET')return readPaths(path);
  if(method==='POST')return path===`/api/v1/sites/${APPROVED_SITE}/deploys`||/^\/api\/v1\/deploys\/[a-f0-9]{24}\/cancel$/.test(path);
  if(['PUT','DELETE'].includes(method)&&new RegExp(`^/api/v1/sites/${APPROVED_SITE}/deploys/[a-f0-9]{24}$`).test(path))return true;
  return method==='PUT'&&/^\/api\/v1\/deploys\/[a-f0-9]{24}\/(?:files\/[A-Za-z0-9_./@%+-]+|functions\/lockliel-(?:member-read|login|logout)\?runtime=js&size=[1-9][0-9]{0,7})$/.test(path)&&!path.includes('..')&&!/%(?:2e|2f|5c|00)/i.test(path);
}

/** Protected HTTPS transport composition, not an authorization mechanism. No
 * default request implementation is imported. A reviewed future operator must
 * explicitly inject node:https.request and an exact-operation authority closure.
 * requestImpl/authorize must never log options, bodies, responses or credentials.
 * Redirects are never followed and failed bodies/errors are never propagated.
 */
export function createProtectedApiTransport({credential,requestImpl,authorize}={}){
  credentialBytes(credential);requireCondition(typeof requestImpl==='function'&&typeof authorize==='function');
  let closed=false,calls=0,cleanupCalls=0,containment=false;
  return Object.freeze({
    async request(operation){
      let body,wire;
      try{
        requireCondition(!closed&&(containment?cleanupCalls++<40:calls++<200)&&operation?.redirect==='error'&&operationAllowed(operation)&&(!containment||operation.method==='GET'||operation.method==='DELETE'||operation.path.endsWith('/cancel'))&&await authorize(Object.freeze({phase:containment?'cleanup':'normal',method:operation.method,path:operation.path}))===true);
        requireCondition(!(operation.body&&operation.bytes));
        wire=operation.bytes?Buffer.from(operation.bytes):operation.body?Buffer.from(JSON.stringify(operation.body)):null;
        const token=credentialBytes(credential),url=API+operation.path;
        const result=await new Promise((resolvePromise,reject)=>{
          let size=0,settled=false;const chunks=[];
          const done=(ok,value)=>{if(settled)return;settled=true;for(const chunk of chunks)chunk.fill(0);if(ok)resolvePromise(value);else reject(Error('Protected provider transport failed.'));};
          const req=requestImpl(url,{method:operation.method,headers:{authorization:`Bearer ${token.toString('utf8')}`,...(wire?{'content-type':operation.bytes?'application/octet-stream':'application/json','content-length':wire.length}:{})},timeout:20000,rejectUnauthorized:true},res=>{
            if(res.statusCode>=300&&res.statusCode<400){res.resume();done(false);return;}
            res.on('data',chunk=>{if(!Buffer.isBuffer(chunk)||size+chunk.length>8*1024*1024){res.destroy();done(false);return;}size+=chunk.length;chunks.push(chunk);});
            res.on('error',()=>done(false));res.on('aborted',()=>done(false));res.on('end',()=>{
              try{
                body=Buffer.concat(chunks);requireCondition(!body.includes(token));
                if(operation.body?.environment)for(const field of operation.body.environment)requireCondition(!body.includes(Buffer.from(field.value)));
                // Do not propagate failed response bodies, error text or optional
                // environment/secret fields. Successful metadata is projected.
                const status=res.statusCode;const parsed=status===200&&body.length?JSON.parse(body.toString('utf8')):null;
                const sensitive=[token.toString('utf8'),...(operation.body?.environment||[]).map(field=>field.value)];
                assertNoDecodedReflection(parsed,sensitive);
                done(true,{status,url,redirected:false,data:parsed===null?null:metadataOnly(parsed)});
              }catch{done(false);}
            });
          });
          req.on('error',()=>done(false));req.on('timeout',()=>{req.destroy();done(false);});if(wire)req.write(wire);req.end();
        });
        return result;
      }catch{throw Error('Protected provider transport failed.');}
      finally{wire?.fill(0);body?.fill(0);}
    },async beginContainment(){
      requireCondition(!closed&&!containment&&await authorize(Object.freeze({phase:'begin-containment'}))===true);containment=true;
    },close(){closed=true;disposeCredential(credential);}
  });
}

function assertNoDecodedReflection(value,sensitive,depth=0){
  requireCondition(depth<=32);
  if(typeof value==='string'){requireCondition(!sensitive.some(secret=>secret&&value.includes(secret)));return;}
  if(value&&typeof value==='object')for(const [key,child]of Object.entries(value)){
    requireCondition(!sensitive.some(secret=>secret&&key.includes(secret)));assertNoDecodedReflection(child,sensitive,depth+1);
  }
}

const metadataFields=new Set(['id','name','account_id','published_deploy','deploy_id','custom_domain','domain_aliases','branch_deploy_custom_domain','deploy_preview_custom_domain','site_id','state','context','published_at','draft','branch','review_id','created_at','updated_at','commit_ref','deploy_ssl_url','ssl_url','required','required_functions','required_edge_functions','required_server','url','functions','sha','path','size','runtime','routes','pattern','literal','methods']);
function metadataOnly(raw,depth=0){
  requireCondition(depth<=8);
  if(raw===null||typeof raw==='boolean'||typeof raw==='number')return raw;
  if(typeof raw==='string'){requireCondition(raw.length<=2048&&!/sb_(?:secret|publishable)_[A-Za-z0-9_-]+|eyJ[A-Za-z0-9_-]{12,}\./.test(raw));return raw;}
  if(Array.isArray(raw)){requireCondition(raw.length<=1000);return raw.map(value=>metadataOnly(value,depth+1));}
  requireCondition(plain(raw));return Object.fromEntries(Object.entries(raw).filter(([key])=>metadataFields.has(key)).map(([key,value])=>[key,metadataOnly(value,depth+1)]));
}

/** One-shot supervised lifecycle. The reader uses independent authenticated
 * captures; preparePackage must build AFTER actual ID reservation from clean exact
 * source. beforeAcceptance is a separately reviewed evidence gate, NOT an app echo.
 * It must deny pending private-scope/artifact/rate evidence. Failure always attempts
 * only exact new-ID containment, never a replacement or site-setting operation.
 */
export function createDeploymentOperator({request,reader,authorize,preparePackage,beforeAcceptance,acceptance,beginContainment=async()=>true,wait=()=>Promise.resolve(),now=Date.now}={}){
  requireCondition(typeof request==='function'&&typeof authorize==='function'&&typeof preparePackage==='function'&&typeof beforeAcceptance==='function'&&typeof acceptance==='function'&&typeof wait==='function'&&typeof now==='function'&&reader);
  let used=false;
  return Object.freeze({async run({key,keyProvenance}={}){
    requireCondition(!used);used=true;
    const started=now();let id=null,pin=null,before=null,plan=null,reservationAttempted=false,owned=false,finalized=false,accepted=false,containment='not-created',failure=false,calls=0;
    const bounded=async operation=>{
      requireCondition(++calls<=160&&now()-started<=1200000&&await authorize(Object.freeze({method:operation.method,path:operation.path,source:APPROVED_SOURCE,site:APPROVED_SITE,project:APPROVED_PROJECT}))===true);
      try{return await request({...operation,redirect:'error'});}catch{throw Error('Protected deployment request failed.');}
    };
    try{
      requireCondition(await authorize(Object.freeze({phase:'preflight',source:APPROVED_SOURCE,site:APPROVED_SITE,project:APPROVED_PROJECT}))===true);
      requireCondition(keyProvenance?.project===APPROVED_PROJECT&&keyProvenance.mechanism==='protected-owner-project-attestation'&&keyProvenance.noValueRecorded===true);
      requireCondition(/^sb_publishable_[A-Za-z0-9_-]{12,200}$/.test(credentialBytes(key).toString('utf8')));
      before=await reader.captureBaseline();
      reservationAttempted=true;const reserved=responseOK(await bounded({method:'POST',path:`/api/v1/sites/${APPROVED_SITE}/deploys`,body:{draft:true}}));
      // Uncertain/foreign ownership may never authorize deletion. Even a malformed
      // response containing an ID is not sufficient authority for cleanup.
      requireCondition(safeId(reserved?.id));id=reserved.id;pin=pinFor(id);
      checkDeploy(reserved,id);requireCondition(['new','prepared'].includes(reserved.state));
      await reader.verifyReservation({pin,before});
      // Only the independent reader's complete pre/post inventory can prove the
      // ID is new. A forged POST reply must never authorize historical deletion.
      owned=true;
      const spec=await preparePackage(structuredClone(pin));
      plan=await prepareUpload({...spec,pin});
      const body=plan.body(),inventory=plan.inventory();
      const artifactTransport=createArtifactReceiptTransport({request:bounded,pin,files:inventory,now});
      const configurationTransport=createConfigurationReceiptTransport({request:bounded,pin,files:inventory,now});
      const protectedValue=credentialBytes(key);
      try{
        body.draft=true;body.environment=[{key:HOSTED_KEY_NAME,value:protectedValue.toString('utf8'),scopes:['functions'],is_secret:true}];
        const response=await configurationTransport.finalize({method:'PUT',path:`/api/v1/sites/${APPROVED_SITE}/deploys/${id}`,body});
        finalized=true;checkDeploy(response,id);
        await plan.sendRequired(async operation=>({...await artifactTransport.upload(operation),redirected:false}),response);
      }finally{if(body.environment){body.environment[0].value='';body.environment.length=0;}disposeCredential(key);}
      let ready=false;
      for(let i=0;i<20;i++){
        const current=responseOK(await bounded({method:'GET',path:`/api/v1/sites/${APPROVED_SITE}/deploys/${id}`}));checkDeploy(current,id);
        if(current.state==='ready'){ready=true;break;}
        requireCondition(['new','prepared','uploading','uploaded','processing','processed','preparing'].includes(current.state));await wait(500);
      }
      requireCondition(ready);
      const publication=await reader.verifyFinalized({pin,before});
      const artifacts=artifactTransport.capture(),configuration=configurationTransport.capture();
      // The independently captured opaque route/rate handle is mandatory. A
      // caller boolean or application-generated claims cannot enable Auth tests.
      const routes=await beforeAcceptance(Object.freeze({publication,artifacts,configuration,pin:structuredClone(pin),manifestSha256:plan.manifestSha256}));
      const provider=composeProviderReceipt({publication,artifacts,configuration,routes,now:now()});
      requireCondition(now()-started<=900000);
      requireCondition(await acceptance(Object.freeze({provider,pin:structuredClone(pin),manifestSha256:plan.manifestSha256}))===true);accepted=true;
    }catch{failure=true;}
    finally{
      disposeCredential(key);plan?.dispose();
      if(id&&owned){
        containment='unverified';
        try{
          await beginContainment();
          // Cleanup gets a separate small budget even when the normal window/call
          // budget expires. No retry of reserve/finalize/upload is permitted.
          const cleanup=async operation=>{requireCondition(await authorize(Object.freeze({phase:'cleanup',method:operation.method,path:operation.path,site:APPROVED_SITE,id}))===true);return await request({...operation,redirect:'error'});};
          const current=responseOK(await cleanup({method:'GET',path:`/api/v1/sites/${APPROVED_SITE}/deploys/${id}`}));checkDeploy(current,id);
          if(!['new','prepared','ready','error','canceled'].includes(current.state)){
            const cancel=await cleanup({method:'POST',path:`/api/v1/deploys/${id}/cancel`});requireCondition([200,201].includes(cancel.status));
            const stopped=responseOK(await cleanup({method:'GET',path:`/api/v1/sites/${APPROVED_SITE}/deploys/${id}`}));checkDeploy(stopped,id);requireCondition(['ready','error','canceled'].includes(stopped.state));
          }
          const removed=await cleanup({method:'DELETE',path:`/api/v1/sites/${APPROVED_SITE}/deploys/${id}`});requireCondition(removed.status===204&&removed.redirected===false);
          await reader.verifyRetirement({pin,before});containment='verified';
        }catch{failure=true;}
      }else if(reservationAttempted)containment='unresolved-reservation';
    }
    return Object.freeze({source:APPROVED_SOURCE,site:APPROVED_SITE,project:APPROVED_PROJECT,id,reservationAttempted,finalized,accepted,containment,ok:!failure&&accepted&&containment==='verified'});
  }});
}
