import test from 'node:test';
import assert from 'node:assert/strict';
import {EventEmitter} from 'node:events';
import {mkdtemp,mkdir,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {inspect} from 'node:util';
import {protectCredential,disposeCredential,readHiddenCredential,createProtectedApiTransport,createDeploymentOperator,prepareUpload,APPROVED_SOURCE,APPROVED_SITE,APPROVED_PROJECT,HOSTED_FUNCTIONS} from '../scripts/member-hosted/uploader.mjs';
import {digest,packageInventory,zipCrc32} from '../scripts/member-hosted/verify.mjs';
import {createProviderReceiptReader,createRouteReceiptObserver} from '../scripts/member-hosted/provider-receipts.mjs';

const id='c'.repeat(24),path=`/api/v1/sites/${APPROVED_SITE}/deploys/${id}`;
const pin={version:'lockliel-member-hosted-v1',binding:{source:APPROVED_SOURCE,site:APPROVED_SITE,project:APPROVED_PROJECT,deploy:id},origin:`https://${id}--jade-unicorn-642f40.netlify.app`,context:'deploy-preview',schema:280,protocol:'278-v1',paused:true};
const syntheticKey='sb_publishable_synthetic_fixture_only';
const provenance={project:APPROVED_PROJECT,mechanism:'protected-owner-project-attestation',noValueRecorded:true};
const protectedKey=()=>protectCredential(Buffer.from(syntheticKey));
const token=()=>protectCredential(Buffer.from('synthetic_operator_credential_only'));
const deploy=(extra={})=>({id,site_id:APPROVED_SITE,state:'new',context:'deploy-preview',published_at:null,branch:null,review_id:null,...extra});
const response=(data,status=200,url='https://api.netlify.com'+path)=>({status,data,url,redirected:false});

test('protected handle is redacted and immediately clears input, repeated disposal safe',()=>{
  const input=Buffer.from('synthetic_credential_only'),handle=protectCredential(input);assert.ok(input.every(x=>x===0));
  assert.equal(inspect(handle),'[Protected credential]');assert.equal(JSON.stringify(handle),'"[Protected credential]"');
  disposeCredential(handle);disposeCredential(handle);assert.throws(()=>createProtectedApiTransport({credential:handle,requestImpl:()=>{},authorize:()=>true}));
});
test('rejected short credential input is also cleared',()=>{const input=Buffer.from('short');assert.throws(()=>protectCredential(input));assert.ok(input.every(x=>x===0));});
test('missing protected credential cannot create a transport',()=>assert.throws(()=>createProtectedApiTransport({requestImpl:()=>{},authorize:()=>true})));
test('no default live request or authority can be inferred',()=>{for(const args of [{},{requestImpl:()=>{}},{authorize:()=>true}]){const credential=token();assert.throws(()=>createProtectedApiTransport({...args,credential}));disposeCredential(credential);}});

class Terminal extends EventEmitter{
  constructor(){super();this.isTTY=true;this.isRaw=false;this.readableFlowing=false;this.output='';}
  setRawMode(value){this.isRaw=value;return this;}
  resume(){this.readableFlowing=true;return this;}
  pause(){this.readableFlowing=false;return this;}
  write(value){this.output+=value;return true;}
}
test('hidden TTY input echoes no characters, restores mode and clears input chunks',async()=>{
  const input=new Terminal(),output=new Terminal(),pending=readHiddenCredential({input,output});
  const chunk=Buffer.from('synthetic_hidden_value\n');input.emit('data',chunk);const handle=await pending;
  assert.ok(chunk.every(x=>x===0));assert.equal(output.output,'Protected value (hidden): \n');assert.equal(input.isRaw,false);assert.equal(input.readableFlowing,false);disposeCredential(handle);
});
for(const value of ['short\n','synthetic\x03','synthetic\x1b','synthetic value\n'])test('hidden TTY rejects short/control/paste escape input without echo',async()=>{
  const input=new Terminal(),output=new Terminal(),pending=readHiddenCredential({input,output});const bytes=Buffer.from(value);input.emit('data',bytes);await assert.rejects(pending,/unavailable/);assert.ok(bytes.every(x=>x===0));assert.equal(input.isRaw,false);assert.ok(!output.output.includes('synthetic'));
});
test('hidden TTY timeout restores raw mode',async()=>{const input=new Terminal(),output=new Terminal();await assert.rejects(readHiddenCredential({input,output,timeoutMs:1}));assert.equal(input.isRaw,false);});
test('non-TTY/encoded/raw stream is denied before a credential is collected',async()=>{
  assert.throws(()=>readHiddenCredential({input:{isTTY:false},output:new Terminal()}));
  const input=new Terminal();input.readableEncoding='utf8';await assert.rejects(readHiddenCredential({input,output:new Terminal()}));
});

function fakeHttp({status=200,data=deploy(),error=null,redirect=false}={}){
  const calls=[];
  const request=(url,options,onResponse)=>{
    const req=new EventEmitter();req.write=bytes=>{calls.push({kind:'body',bytes:Buffer.from(bytes)});};req.destroy=()=>{};req.end=()=>{
      queueMicrotask(()=>{if(error){req.emit('error',Error(error));return;}
        const res=new EventEmitter();res.statusCode=redirect?302:status;res.resume=()=>{};res.destroy=()=>{};onResponse(res);
        if(!redirect){res.emit('data',Buffer.from(typeof data==='string'?data:JSON.stringify(data)));res.emit('end');}
      });
    };
    // Inspect synthetic request internals only; never use this test fake with keys.
    calls.push({kind:'request',url,options});return req;
  };return {request,calls};
}
test('protected transport uses fixed TLS API, denies redirects, strips unexpected secret metadata',async()=>{
  const fake=fakeHttp({data:{...deploy(),environment:[{value:'not forwarded'}],skew_protection_value:'not forwarded',error_message:'not forwarded'}});
  const transport=createProtectedApiTransport({credential:token(),requestImpl:fake.request,authorize:()=>true});
  const result=await transport.request({method:'GET',path,redirect:'error'});assert.equal(result.data.id,id);
  assert.equal(result.data.environment,undefined);assert.equal(result.data.skew_protection_value,undefined);assert.equal(result.data.error_message,undefined);
  assert.equal(fake.calls[0].url,'https://api.netlify.com'+path);assert.equal(fake.calls[0].options.rejectUnauthorized,true);transport.close();
});
for(const operation of [
  {method:'GET',path:'https://evil.invalid/'},{method:'GET',path:'/api/v1/sites/other'},
  {method:'PATCH',path:'/api/v1/accounts/example/env'},{method:'PUT',path:`/api/v1/sites/${APPROVED_SITE}/env`},
  {method:'POST',path:`/api/v1/sites/${APPROVED_SITE}/deploys?production=true`},
  {method:'PUT',path:`/api/v1/deploys/${id}/files/../secret`},{method:'PUT',path:`/api/v1/deploys/${id}/files/%2e%2e/secret`},
  {method:'PUT',path:`/api/v1/deploys/${id}/functions/foreign?runtime=js&size=1`},
  {method:'GET',path:'/api/v1/deploys/'+id,redirect:'follow'}
])test('protected transport denies foreign settings, destination, traversal or redirect behavior',async()=>{
  let calls=0;const transport=createProtectedApiTransport({credential:token(),requestImpl:()=>{calls++;},authorize:()=>true});
  await assert.rejects(transport.request({redirect:'error',...operation}),/transport failed/);assert.equal(calls,0);transport.close();
});
test('fixed-site branch inventory read is allowed, but no other site branch read',async()=>{
  const fake=fakeHttp({data:[]}),transport=createProtectedApiTransport({credential:token(),requestImpl:fake.request,authorize:()=>true});
  assert.deepEqual((await transport.request({method:'GET',path:`/api/v1/sites/${APPROVED_SITE}/deployed-branches`,redirect:'error'})).data,[]);transport.close();
});
for(const fakeArgs of [{error:'synthetic_operator_credential_only'},{status:403,data:'synthetic_operator_credential_only'},{status:200,data:{id:'synthetic_operator_credential_only'}},{redirect:true}])test('provider errors, credential reflection and redirects never escape through errors',async()=>{
  const fake=fakeHttp(fakeArgs),transport=createProtectedApiTransport({credential:token(),requestImpl:fake.request,authorize:()=>true});
  try{const result=await transport.request({method:'GET',path,redirect:'error'});assert.ok(!JSON.stringify(result).includes('synthetic_operator_credential_only'));}
  catch(error){assert.equal(error.message,'Protected provider transport failed.');assert.equal(error.cause,undefined);}finally{transport.close();}
});
test('private value reflected during finalization is denied and never returned',async()=>{
  const fake=fakeHttp({data:{...deploy(),id:syntheticKey}}),transport=createProtectedApiTransport({credential:token(),requestImpl:fake.request,authorize:()=>true});
  await assert.rejects(transport.request({method:'PUT',path,redirect:'error',body:{environment:[{value:syntheticKey}]}}),error=>error.message==='Protected provider transport failed.');transport.close();
});
test('exhausted normal transport budget preserves a separate one-way cleanup budget',async()=>{
  const fake=fakeHttp(),transport=createProtectedApiTransport({credential:token(),requestImpl:fake.request,authorize:()=>true});
  for(let i=0;i<200;i++)await transport.request({method:'GET',path,redirect:'error'});
  await assert.rejects(transport.request({method:'GET',path,redirect:'error'}));
  await transport.beginContainment();
  assert.equal((await transport.request({method:'GET',path,redirect:'error'})).status,200);
  await assert.rejects(transport.request({method:'POST',path:`/api/v1/sites/${APPROVED_SITE}/deploys`,body:{draft:true},redirect:'error'}));
  await assert.rejects(transport.beginContainment());transport.close();
});

function storedZip(entries){
  const local=[],central=[];let offset=0;
  for(const [name,data]of entries){const filename=Buffer.from(name),lh=Buffer.alloc(30),ch=Buffer.alloc(46),crc=zipCrc32(data);
    lh.writeUInt32LE(0x04034b50);lh.writeUInt16LE(20,4);lh.writeUInt32LE(crc,14);lh.writeUInt32LE(data.length,18);lh.writeUInt32LE(data.length,22);lh.writeUInt16LE(filename.length,26);
    ch.writeUInt32LE(0x02014b50);ch.writeUInt16LE(20,4);ch.writeUInt16LE(20,6);ch.writeUInt32LE(crc,16);ch.writeUInt32LE(data.length,20);ch.writeUInt32LE(data.length,24);ch.writeUInt16LE(filename.length,28);ch.writeUInt32LE(offset,42);
    local.push(lh,filename,data);central.push(ch,filename);offset+=lh.length+filename.length+data.length;
  }
  const cd=Buffer.concat(central),end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50);end.writeUInt16LE(entries.length,8);end.writeUInt16LE(entries.length,10);end.writeUInt32LE(cd.length,12);end.writeUInt32LE(offset,16);return Buffer.concat([...local,cd,end]);
}
const toolchain=process.env.LOCKLIEL_MEMBER_PACKAGE_TOOLCHAIN_ROOT;
const optional={skip:toolchain?false:'Explicit installed official toolchain not supplied.'};
async function withPackage(run){
  const directory=await mkdtemp(join(tmpdir(),'lockliel-uploader-synthetic-'));
  try{
    const api=await import(pathToFileURL(join(toolchain,'@netlify/serverless-functions-api/dist/index.js')).href),bootstrap=await readFile(api.getPath());
    for(const name of ['public','functions','artifacts'])await mkdir(join(directory,name));
    await writeFile(join(directory,'public/404.html'),'synthetic isolated fixture only');await writeFile(join(directory,'netlify.toml'),'# synthetic, never deployed');
    const functions=[];
    for(const fn of HOSTED_FUNCTIONS){const code=Buffer.from('export default ()=>{}; // synthetic never deployed');
      await writeFile(join(directory,`artifacts/${fn.name}.mjs`),code);
      await writeFile(join(directory,`functions/${fn.name}.zip`),storedZip([
        ['___netlify-entry-point.mjs',Buffer.from(`import * as bootstrap from './___netlify-bootstrap.mjs';export const handler = bootstrap.getLambdaHandler('./${fn.name}.mjs')`)],
        ['___netlify-bootstrap.mjs',bootstrap],['___netlify-metadata.json',Buffer.from(JSON.stringify({bootstrap_version:'2.24.0',version:1}))],[`${fn.name}.mjs`,code]
      ]));functions.push({name:fn.name,path:`functions/${fn.name}.zip`,compiled:`artifacts/${fn.name}.mjs`,runtimeAPIVersion:2,routes:[{pattern:fn.route,literal:fn.route,methods:[fn.method]}]});
    }
    // Synthetic offline manifest only. The independently passed expected digest
    // authorizes this test fixture within mocks; it is never a release artifact.
    const manifest={version:'lockliel-member-auth-package-v1',localFixture:false,enabled:true,authEnabled:true,releaseEligible:true,pin,source:{head:APPROVED_SOURCE,dirty:false},functions,toolchain:{bootstrap:'2.24.0',zisi:'16.3.0',bootstrapSha256:digest(bootstrap)},files:await packageInventory(directory)};
    const bytes=JSON.stringify(manifest);await writeFile(join(directory,'member-hosted-manifest.json'),bytes);
    return await run({directory,expectedManifestSha256:digest(bytes),manifest});
  }finally{await rm(directory,{recursive:true,force:true});}
}
function workflow(spec,changes={}){
  const calls=[];let phase='new',created=false;
  const old={...deploy(),id:'e'.repeat(24),state:'ready',branch:'rehearsal',created_at:'2026-10-01T00:00:00Z'};
  const site={id:APPROVED_SITE,name:'jade-unicorn-642f40',account_id:'6a674f7a0e2cdcc2b838db89',published_deploy:null,deploy_id:'',custom_domain:null,domain_aliases:[],branch_deploy_custom_domain:null,deploy_preview_custom_domain:null};
  const rawDeploy=extra=>deploy({state:phase,created_at:'2026-11-02T00:00:00Z',...extra});
  const request=async op=>{
    calls.push({method:op.method,path:op.path,...(op.body?{body:structuredClone(op.body)}:{})});
    if(changes.request){const override=await changes.request(op);if(override)return override;}
    if(op.method==='POST'){created=true;return response(rawDeploy(changes.reserved));}
    if(op.method==='PUT'&&op.path===path){phase='ready';return response(rawDeploy({state:'prepared',required:[],required_functions:Object.values(op.body.functions)}));}
    if(op.method==='PUT'){const file=op.path.includes('/functions/'),name=op.path.split('/functions/')[1]?.split('?')[0];return response(file?{name,sha:digest(op.bytes)}:{path:'/'+op.path.split('/files/')[1],sha:digest(op.bytes,'sha1')},200,'https://api.netlify.com'+op.path);}
    if(op.method==='GET'){
      let data;if(op.path===`/api/v1/sites/${APPROVED_SITE}`)data=site;
      else if(op.path.endsWith('/deployed-branches'))data=[];
      else if(op.path.includes('/deploys?'))data=created?[old,rawDeploy()]:[old];
      else if(created)data=rawDeploy();
      else return response(null,404,'https://api.netlify.com'+op.path);
      return response(data,200,'https://api.netlify.com'+op.path);
    }
    if(op.method==='DELETE'){created=false;return response(null,204);}
    throw Error('Unknown synthetic operation');
  };
  const rates={};const publicRequest=async op=>{
    let status=404;
    if(created){const urlPath=new URL(op.url).pathname,fn=HOSTED_FUNCTIONS.find(f=>f.route===urlPath);
      if(fn)status=op.method!==fn.method?405:op.method==='POST'?((rates[urlPath]=(rates[urlPath]||0)+1)>30?429:400):401;
    }
    return {status,url:op.url,redirected:false};
  };
  const reader={...createProviderReceiptReader({request,publicRequest}),...changes.reader};
  const operator=createDeploymentOperator({request,reader,authorize:changes.authorize||(()=>true),preparePackage:async actual=>{assert.deepEqual(actual,pin);return spec;},beforeAcceptance:changes.beforeAcceptance||(()=>createRouteReceiptObserver({publicRequest,pin}).observe()),acceptance:changes.acceptance||(()=>true),beginContainment:changes.beginContainment||(()=>true),wait:async()=>{}});
  return {operator,calls};
}
test('offline complete lifecycle reserves exactly once and finalizes same ID, with deployment-only private config',optional,()=>withPackage(async spec=>{
  const {operator,calls}=workflow(spec);const result=await operator.run({key:protectedKey(),keyProvenance:provenance});assert.equal(result.ok,true);assert.equal(result.containment,'verified');
  assert.equal(calls.filter(c=>c.method==='POST').length,1);const finalize=calls.find(c=>c.method==='PUT'&&c.path===path);assert.equal(finalize.body.draft,true);
  assert.deepEqual(Object.keys(finalize.body.functions),HOSTED_FUNCTIONS.map(fn=>fn.name));assert.deepEqual(finalize.body.environment,[{key:'LOCKLIEL_MEMBER_READ_PUBLISHABLE_KEY',value:syntheticKey,scopes:['functions'],is_secret:true}]);
  assert.deepEqual(finalize.body.functions_config['lockliel-login'].traffic_rules.action.config.rate_limit_config,{algorithm:'sliding_window',window_size:60,window_limit:30});
  assert.equal(calls.filter(c=>c.method==='DELETE').length,1);assert.ok(!calls.some(c=>/env|publish|restore/.test(c.path)));assert.ok(!JSON.stringify(result).includes(syntheticKey));await assert.rejects(operator.run({key:protectedKey(),keyProvenance:provenance}));
}));
for(const change of [{site_id:'foreign'},{context:'production'},{published_at:'2026-11-02T00:00:00Z'},{draft:false},{id:'6ae8a1aa48521d4528081700'}])test('unexpected reserve identity/context/publication cannot authorize cleanup or replacement',async()=>{
  const {operator,calls}=workflow({}, {reserved:change});const result=await operator.run({key:protectedKey(),keyProvenance:provenance});assert.equal(result.ok,false);assert.equal(result.containment,'unresolved-reservation');assert.equal(calls.filter(c=>c.method==='POST').length,1);assert.equal(calls.filter(c=>c.method==='DELETE').length,0);
});
test('historical/forged reservation rejected by independent reader never becomes cleanup authority',async()=>{
  const {operator,calls}=workflow({}, {reader:{verifyReservation:async()=>{throw Error('Historical ID');}}});const result=await operator.run({key:protectedKey(),keyProvenance:provenance});assert.equal(result.containment,'unresolved-reservation');assert.equal(calls.filter(c=>c.method==='DELETE').length,0);
});
for(const keyProvenance of [undefined,{...provenance,project:'bsndfhbemstyrrglajat'},{...provenance,noValueRecorded:false}])test('missing or foreign key attestation stops before reservation',async()=>{
  const {operator,calls}=workflow({});const result=await operator.run({key:protectedKey(),keyProvenance});assert.equal(result.ok,false);assert.equal(result.reservationAttempted,false);assert.equal(calls.length,0);
});
test('missing protected key stops before reservation',async()=>{const {operator,calls}=workflow({});assert.equal((await operator.run({keyProvenance:provenance})).reservationAttempted,false);assert.equal(calls.length,0);});
test('ambiguous creation error is never retried and reports unresolved containment',async()=>{
  const {operator,calls}=workflow({}, {request:op=>{if(op.method==='POST')throw Error(syntheticKey);}});const result=await operator.run({key:protectedKey(),keyProvenance:provenance});assert.equal(result.containment,'unresolved-reservation');assert.equal(calls.filter(c=>c.method==='POST').length,1);assert.ok(!JSON.stringify(result).includes(syntheticKey));
});
for(const failure of ['artifact','finalize','missing-evidence','cleanup'])test(`known exact new-ID containment after ${failure} failure`,optional,()=>withPackage(async spec=>{
  const changes=failure==='artifact'?{}:failure==='missing-evidence'?{beforeAcceptance:()=>false}:{request:op=>{if(failure==='finalize'&&op.method==='PUT'&&op.path===path)throw Error(syntheticKey);if(failure==='cleanup'&&op.method==='DELETE')return response(null,500);}};
  if(failure==='artifact')await writeFile(join(spec.directory,'public/404.html'),'altered');
  const {operator,calls}=workflow(spec,changes),result=await operator.run({key:protectedKey(),keyProvenance:provenance});assert.equal(result.ok,false);assert.equal(result.containment,failure==='cleanup'?'unverified':'verified');assert.equal(calls.filter(c=>c.method==='POST').length,1);assert.equal(calls.filter(c=>c.method==='DELETE').length,1);assert.equal(result.accepted,failure==='cleanup');assert.ok(!JSON.stringify(result).includes(syntheticKey));
}));
test('frozen verified upload bytes survive later file mutation, and caller pin mutation cannot repoint upload',optional,()=>withPackage(async spec=>{
  const supplied=structuredClone(pin),plan=await prepareUpload({...spec,pin:supplied}),body=plan.body(),sent=[];
  await writeFile(join(spec.directory,'public/404.html'),'altered after private snapshot');supplied.binding.deploy='d'.repeat(24);
  await plan.sendRequired(async op=>{sent.push({path:op.path,sha1:digest(op.bytes,'sha1')});return response({});},{required:Object.values(body.files),required_functions:[]});
  assert.equal(sent.length,4);const staticSent=sent.find(entry=>entry.path.includes('/files/'));assert.ok(staticSent.path.startsWith(`/api/v1/deploys/${id}/files/`));assert.equal(staticSent.sha1,Object.values(body.files)[0]);assert.ok(sent.every(entry=>entry.path.includes(`/deploys/${id}/`)));plan.dispose();assert.throws(()=>plan.body());await assert.rejects(plan.sendRequired(()=>{},{}));
}));
test('a boolean or forged route object cannot bypass captured provider evidence before Auth',optional,()=>withPackage(async spec=>{
  for(const forged of [true,{routesVerified:true}]){let accepted=0;const {operator}=workflow(spec,{beforeAcceptance:()=>forged,acceptance:()=>{accepted++;return true;}});const result=await operator.run({key:protectedKey(),keyProvenance:provenance});assert.equal(accepted,0);assert.equal(result.ok,false);assert.equal(result.containment,'verified');}
}));
test('failure to enter protected cleanup mode is a containment failure, never unrelated deletion',optional,()=>withPackage(async spec=>{
  const {operator,calls}=workflow(spec,{beforeAcceptance:()=>false,beginContainment:()=>{throw Error(syntheticKey);}});const result=await operator.run({key:protectedKey(),keyProvenance:provenance});assert.equal(result.containment,'unverified');assert.equal(result.ok,false);assert.equal(calls.filter(c=>c.method==='DELETE').length,0);assert.ok(!JSON.stringify(result).includes(syntheticKey));
}));
test('provider-required unknown bytes are denied without any upload',optional,()=>withPackage(async spec=>{
  const plan=await prepareUpload({...spec,pin});let calls=0;await assert.rejects(plan.sendRequired(()=>{calls++;},{required:['unknown'],required_functions:[]}));assert.equal(calls,0);plan.dispose();
}));
for(const field of ['source','site','project','deploy'])test(`package pin ${field} mismatch denied before any network`,async()=>{
  const wrong=structuredClone(pin);wrong.binding[field]=field==='source'?'d'.repeat(40):'wrong';await assert.rejects(prepareUpload({directory:'/does-not-exist',pin:wrong,expectedManifestSha256:'f'.repeat(64)}));
});
test('uploader import has no ambient live credential or automatic execution hook',async()=>{
  const text=await readFile(new URL('../scripts/member-hosted/uploader.mjs',import.meta.url),'utf8');for(const forbidden of ['process.env','process.argv','globalThis.fetch','console.log','execFile','writeFile','https.request('])assert.ok(!text.includes(forbidden),forbidden);
});
