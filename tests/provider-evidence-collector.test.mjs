import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import * as path from 'node:path';
import {EventEmitter} from 'node:events';
import {projectPrivateAuthConfigJson,PROVIDER_HOOK_FIELDS} from '../scripts/fixture-provision/private-provider-projection.mjs';
import SCHEMA from '../scripts/fixture-provision/auth-config-schema.json' with {type:'json'};
import {performFixedRead} from '../scripts/provider-evidence-collector/transport.mjs';
import {runCollector} from '../scripts/provider-evidence-collector/collector.mjs';
import {consumeInstalledAttempt} from '../scripts/provider-evidence-collector/attempt.mjs';
const SECRET='SYNTHETIC-NOT-A-LIVE-TOKEN', NOW=1793710800000;
function body(){return JSON.stringify(Object.fromEntries(Object.entries(SCHEMA.properties).map(([k,r])=>[k,r.nullable?null:r.enum?r.enum[0]:r.type==='boolean'?false:r.type==='string'?'synthetic':0])));}
if(!vm.SourceTextModule){
 test('collector actual native transport in offline VM adversarial suite',()=>{
  const output=execFileSync(process.execPath,['--experimental-vm-modules','--import',fileURLToPath(new URL('./support/network-guard.mjs',import.meta.url)),'--test-reporter=tap','--test',fileURLToPath(import.meta.url)],{env:{PATH:'/usr/bin:/bin'},encoding:'utf8',timeout:60000,maxBuffer:1024*1024});
  assert.match(output,/# fail 0/);assert.doesNotMatch(output,/not ok/);
 });
}else{
 async function harness(options={}) {
  let requests=0,requestOptions,consumed=false,cleared=false,clock=NOW;
  const credential=Buffer.from(SECRET),chunks=[];
  const context=vm.createContext({Buffer,TextDecoder,Date:{now:()=>clock},setTimeout:options.timeout?(fn=>{queueMicrotask(fn);return 1;}):setTimeout,clearTimeout,WeakSet,Object,Error});
  const https={request(opts,cb){
   requests++;requestOptions=opts;const req=new EventEmitter();req.destroy=()=>{cleared=true;};
   req.end=()=>queueMicrotask(()=>{
    if(options.requestError){req.emit('error',Error(SECRET));return;}
    const res=new EventEmitter();res.destroy=()=>{cleared=true;};res.statusCode=options.status??200;
    res.socket={encrypted:options.encrypted??true,authorized:options.tls??true,servername:options.host??'api.supabase.com'};
    res.headers={'content-type':'application/json',...options.headers};res.rawHeaders=options.rawHeaders??['Content-Type','application/json'];res.complete=options.complete??true;cb(res);
    if(options.timeout)return;
    if(options.abort){res.emit('aborted');return;}
    if(options.responseError){res.emit('error',Error(SECRET));return;}
    const payload=options.raw??body();const chunk=Buffer.isBuffer(payload)?Buffer.from(payload):Buffer.from(payload);
    chunks.push(chunk);res.emit('data',chunk);if(options.advance)clock+=options.advance;res.emit('end');
   });return req;
  }};
  const tls={checkServerIdentity:()=>undefined};
  const dependencies={
   'node:https':{default:https},'node:tls':{default:tls},
   './authority.mjs':{takeVerifiedAuthority:value=>{if(options.authority===false||value!=='VM_ONLY'||consumed)throw Error(SECRET);consumed=true;}},
   '../fixture-provision/private-provider-projection.mjs':{projectPrivateAuthConfigJson},
  };
  const source=fs.readFileSync(new URL('../scripts/provider-evidence-collector/transport.mjs',import.meta.url),'utf8');
  const mod=new vm.SourceTextModule(source,{context});
  await mod.link(key=>{const exp=dependencies[key];assert.ok(exp,'unexpected dependency');return new vm.SyntheticModule(Object.keys(exp),function(){for(const[k,v]of Object.entries(exp))this.setExport(k,v);},{context});});await mod.evaluate();
  const result=await mod.namespace.performFixedRead('VM_ONLY',credential);
  return {result,requests,requestOptions,credential,chunks,cleared,mod,tls};
 }
 test('actual live entry never prompts or consumes despite arbitrary claims',async()=>{for(const claim of [undefined,{}, {enabled:true,operator:'owner',project:'qjksggxorghaxvpyslip',permission:'auth_config_read'}]){const r=await runCollector(claim);assert.equal(r.category,'AUTHORITY_UNAVAILABLE');assert.equal(r.inputRequested,false);assert.equal(r.requestAttempted,false);assert.equal(r.attemptConsumed,false);}});
 test('actual authority cannot be minted with fixture or caller claims',async()=>{const r=await performFixedRead({project:'qjksggxorghaxvpyslip',operator:'owner'},Buffer.from(SECRET));assert.equal(r.category,'AUTHORITY_UNAVAILABLE');});
 test('actual transport uses fixed host path TLS and emits only seven flags',async()=>{
  const h=await harness(),r=h.result;assert.equal(r.ok,true);assert.equal(h.requests,1);
  const o=h.requestOptions;assert.equal(o.hostname,'api.supabase.com');assert.equal(o.path,'/v1/projects/qjksggxorghaxvpyslip/config/auth');assert.equal(o.port,443);assert.equal(o.method,'GET');assert.equal(o.rejectUnauthorized,true);assert.equal(o.servername,'api.supabase.com');assert.equal(o.agent,false);assert.equal(o.checkServerIdentity,h.tls.checkServerIdentity);
  assert.deepEqual(Object.keys(r.hooks),PROVIDER_HOOK_FIELDS);assert.equal(r.activationAllowed,false);assert.equal(r.independentAuthorityVerified,false);assert.equal(r.operatorIdentity,'UNKNOWN');assert.equal(r.credentialProvenance,'UNKNOWN');assert.equal(r.requestBinding,'FIXED_ISOLATED_PATH');assert.equal(h.credential.every(x=>x===0),true);assert.equal(h.chunks.every(c=>c.every(x=>x===0)),true);assert.equal(h.cleared,true);assert.equal(JSON.stringify(r).includes(SECRET),false);
 });
 const cases=[
  ['unknown authority',{authority:false},'AUTHORITY_UNAVAILABLE'],
  ['redirect301',{status:301},'REDIRECT_REJECTED'],['redirect302',{status:302},'REDIRECT_REJECTED'],['redirect307',{status:307},'REDIRECT_REJECTED'],['redirect308',{status:308},'REDIRECT_REJECTED'],
  ['401',{status:401},'PROVIDER_REJECTED'],['403',{status:403},'PROVIDER_REJECTED'],['500',{status:500},'PROVIDER_REJECTED'],
  ['TLS unauthorized',{tls:false},'TLS_UNVERIFIED'],['unencrypted',{encrypted:false},'TLS_UNVERIFIED'],['wronghost',{host:'evil.invalid'},'TLS_UNVERIFIED'],
  ['compression',{headers:{'content-encoding':'gzip'}},'RESPONSE_REJECTED'],['wrongtype',{headers:{'content-type':'text/html'}},'RESPONSE_REJECTED'],['lengthhuge',{headers:{'content-length':'65537'}},'RESPONSE_TOO_LARGE'],['lengthmismatch',{headers:{'content-length':'1'}},'RESPONSE_REJECTED'],['duplicateheader',{rawHeaders:['Content-Type','application/json','content-type','application/json']},'RESPONSE_REJECTED'],['lengthinvalid',{headers:{'content-length':SECRET}},'RESPONSE_TOO_LARGE'],
  ['oversized actual bytes',{raw:'x'.repeat(65537)},'RESPONSE_TOO_LARGE'],['malformedjson',{raw:SECRET},'RESPONSE_REJECTED'],['rawerror',{raw:JSON.stringify({error:SECRET})},'RESPONSE_REJECTED'],['badutf8',{raw:Buffer.from([0xc0,0xaf])},'RESPONSE_REJECTED'],
  ['requesterror',{requestError:true},'TRANSPORT_FAILED'],['responseerror',{responseError:true},'TRANSPORT_FAILED'],['abort',{abort:true},'INTERRUPTED'],['partial',{complete:false},'INTERRUPTED'],['deadline',{timeout:true},'DEADLINE_EXCEEDED'],['slow',{advance:15000},'DEADLINE_EXCEEDED'],['clockreverse',{advance:-1},'DEADLINE_EXCEEDED'],
 ];
 for(const [name,options,category]of cases)test('fixed sanitized failure '+name,async()=>{const h=await harness(options);assert.equal(h.result.ok,false);assert.equal(h.result.category,category);assert.equal(JSON.stringify(h.result).includes(SECRET),false);assert.ok(h.requests<=1);if(h.requests)assert.equal(h.credential.every(x=>x===0),true);});
 test('no response can supply project operator or permission authority',async()=>{for(const field of ['project','operator','permissions','hook_future_enabled']){const value=JSON.parse(body());value[field]=SECRET;const h=await harness({raw:JSON.stringify(value)});assert.equal(h.result.category,'RESPONSE_REJECTED');}});
 test('missing after-user hook fails rather than absent-as-disabled',async()=>{const value=JSON.parse(body());delete value.hook_after_user_created_enabled;assert.equal((await harness({raw:JSON.stringify(value)})).result.category,'RESPONSE_REJECTED');});
 test('same capability cannot request a second response',async()=>{const h=await harness();const again=await h.mod.namespace.performFixedRead('VM_ONLY',Buffer.from(SECRET));assert.equal(again.category,'AUTHORITY_UNAVAILABLE');assert.equal(h.requests,1);});

 async function load(sourceName,dependencies,extras={}) {
  const context=vm.createContext({Buffer,Date,process:{getuid:process.getuid},...extras});
  const mod=new vm.SourceTextModule(fs.readFileSync(new URL('../scripts/provider-evidence-collector/'+sourceName,import.meta.url),'utf8'),{context});
  await mod.link(key=>{const exp=dependencies[key];assert.ok(exp,'unexpected dependency');return new vm.SyntheticModule(Object.keys(exp),function(){for(const[k,v]of Object.entries(exp))this.setExport(k,v);},{context});});await mod.evaluate();return mod.namespace;
 }
 async function attemptHarness(root,grantSha256,fsModule=fs) {
  return load('attempt.mjs',{'node:fs':{default:fsModule},'node:path':{join:path.join,resolve:path.resolve},'node:crypto':{createHash},'./authority.mjs':{inspectVerifiedAuthority:()=>({attemptRoot:root,grantSha256})}});
 }
 async function ledgerTest(fn) {
  const root=fs.mkdtempSync('/private/tmp/lockliel-provider-offline-');fs.chmodSync(root,0o700);
  fs.writeFileSync(root+'/grant.json','{"syntheticOnly":true}',{mode:0o400});const hash=createHash('sha256').update(fs.readFileSync(root+'/grant.json')).digest('hex');
  try{await fn(root,hash);}finally{fs.rmSync(root,{recursive:true});}
 }
 test('durable marker stops restarted attempt with separately loaded module',async()=>ledgerTest(async(root,hash)=>{let a=await attemptHarness(root,hash);assert.equal(a.consumeInstalledAttempt({},NOW).consumed,true);a=await attemptHarness(root,hash);assert.equal(a.consumeInstalledAttempt({},NOW).consumed,false);assert.equal(fs.readFileSync(root+'/CONSUMED/receipt.json','utf8').includes(SECRET),false);}));
 test('partial durable marker fails closed',async()=>ledgerTest(async(root,hash)=>{fs.mkdirSync(root+'/CONSUMED');const a=await attemptHarness(root,hash);assert.equal(a.consumeInstalledAttempt({},NOW).consumed,false);}));
 test('partial marker receipt failure remains ambiguous and cannot repeat',async()=>ledgerTest(async(root,hash)=>{const mock={...fs,writeFileSync(){throw Error(SECRET);}};const a=await attemptHarness(root,hash,mock),r=a.consumeInstalledAttempt({},NOW);assert.equal(r.attemptState,'UNVERIFIED_OR_SPENT');assert.equal(fs.existsSync(root+'/CONSUMED'),true);assert.equal((await attemptHarness(root,hash)).consumeInstalledAttempt({},NOW).consumed,false);assert.equal(JSON.stringify(r).includes(SECRET),false);}));
 test('mismatched grant file rejects',async()=>ledgerTest(async(root)=>{const a=await attemptHarness(root,'b'.repeat(64));assert.equal(a.consumeInstalledAttempt({},NOW).consumed,false);assert.equal(fs.existsSync(root+'/CONSUMED'),false);}));
 test('authority cannot be claimed by direct attempt caller',()=>{assert.equal(consumeInstalledAttempt({attemptRoot:'/private/tmp',grantSha256:'a'.repeat(64)},NOW).consumed,false);});
 async function pipeline(options={}) {
  const events=[],credential=Buffer.from(SECRET);let now=NOW,mono=0;
  const proof={project:'qjksggxorghaxvpyslip',origin:'https://api.supabase.com',operation:'GET_AUTH_CONFIG',permission:'auth_config_read',scope:'ISOLATED_ONLY',operatorVerified:true,credentialBindingVerified:true,observedAt:NOW,expiresAt:NOW+300000,operatorEvidenceDigest:'a'.repeat(64),approvalDigest:'b'.repeat(64),credentialBindingEvidenceDigest:'c'.repeat(64),...options.proof};
  const mod=await load('collector.mjs',{
   './authority.mjs':{loadInstalledAuthority:()=>{events.push('authority');if(options.noAuthority)throw Error(SECRET);return {};},inspectVerifiedAuthority:()=>proof,verifyEnteredCredentialBinding:()=>{events.push('bind');if(options.bindingUnknown)throw Error(SECRET);return true;},operatorReadiness:()=>({liveEntryEnabled:false})},
   'node:perf_hooks':{performance:{now:()=>mono}},
   './attempt.mjs':{consumeInstalledAttempt:()=>{events.push('consume');return {consumed:!options.duplicate};}},
   '../fixture-provision/protected-input.mjs':{readHiddenLocalInput:async()=>{events.push('input');if(options.interrupted)throw Error(SECRET);now+=options.advance??0;mono+=options.monotonicAdvance??options.advance??0;return credential;}},
   './transport.mjs':{performFixedRead:async()=>{events.push('request');if(options.connectionFailure)throw Error(SECRET);return {ok:true,rawResponseRetained:false};}},
  },{Date:{now:()=>now}});
  const result=await mod.runCollector();assert.equal(JSON.stringify(result).includes(SECRET),false);if(events.includes('input')&&!options.interrupted)assert.equal(credential.every(x=>x===0),true);return {result,events};
 }
 test('duplicate or ambiguous consumption is not reported unused',async()=>{const r=await pipeline({duplicate:true});assert.equal(r.result.attemptConsumed,null);assert.equal(r.result.attemptState,'UNVERIFIED_OR_SPENT');});
 test('actual pipeline consumes before input then verifies request and clears credential',async()=>{const r=await pipeline();assert.deepEqual(r.events,['authority','consume','input','bind','request']);assert.equal(r.result.ok,true);assert.equal(r.result.processExitRequired,true);assert.equal(r.result.attemptConsumed,true);});
 const proofs=[['wrong project',{project:'bsndfhbemstyrrglajat'}],['sibling',{project:'other'}],['wrong operator',{operatorVerified:false}],['wrong origin',{origin:'https://evil.invalid'}],['expired',{expiresAt:NOW}],['future',{observedAt:NOW+1}],['overbroad',{scope:'ORG_WIDE'}],['wrong permission',{permission:'auth_config_write'}],['missing credential provenance',{credentialBindingVerified:false}],['missing operator evidence',{operatorEvidenceDigest:''}],['missing approval',{approvalDigest:''}]];
 for(const[name,proof]of proofs)test('pipeline stops before input: '+name,async()=>{const r=await pipeline({proof});assert.deepEqual(r.events,['authority']);assert.equal(r.result.ok,false);});
 for(const[name,options,events]of [['missing authority',{noAuthority:true},['authority']],['duplicate',{duplicate:true},['authority','consume']],['interrupted',{interrupted:true},['authority','consume','input']],['authority expired at input',{advance:300000},['authority','consume','input']],['credential binding unavailable',{bindingUnknown:true},['authority','consume','input','bind']],['clock rollback during input',{advance:1000,monotonicAdvance:5000},['authority','consume','input']],['connection failure',{connectionFailure:true},['authority','consume','input','bind','request']]])test('pipeline '+name,async()=>{const r=await pipeline(options);assert.deepEqual(r.events,events);assert.equal(r.result.ok,false);});
}
