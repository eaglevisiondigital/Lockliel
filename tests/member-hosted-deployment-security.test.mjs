// Independent attacker-oriented operator tests. Every provider/key value is synthetic.
import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createProviderReceiptReader,publicationReceipt,retirementReceipt,compareArtifactBytes,assessApplicationReceipt} from '../scripts/member-hosted/provider-receipts.mjs';
const SITE='70b03a42-6329-476e-bf4b-2b1ce30e9567',PROJECT='qjksggxorghaxvpyslip',SOURCE='327ba098628f70aa65140862b8b14cd709bfd711';
const ID='a12345678901234567890123',OLD='b12345678901234567890123',ROOT=`/api/v1/sites/${SITE}`,NOW=1793628000000;
const pin={version:'lockliel-member-hosted-v1',binding:{project:PROJECT,site:SITE,deploy:ID,source:SOURCE},origin:`https://${ID}--jade-unicorn-642f40.netlify.app`,context:'deploy-preview',schema:280,protocol:'278-v1',paused:true};
function harness({changeSite=s=>s,changeDeployment=d=>d,changeReply=r=>r,postStatus=404}={}){
 let exists=false,deleted=false,time=NOW;const publicCalls=[];
 const site={id:SITE,name:'jade-unicorn-642f40',account_id:'6a674f7a0e2cdcc2b838db89',published_deploy:null,deploy_id:'',custom_domain:null,domain_aliases:[],branch_deploy_custom_domain:null,deploy_preview_custom_domain:null};
 const row=(id=ID)=>({id,site_id:SITE,state:'ready',context:'deploy-preview',branch:null,review_id:null,published_at:null,created_at:'2026-11-02T14:00:00.000Z'});
 const request=async({method,path,redirect})=>{
  assert.equal(method,'GET');assert.equal(redirect,'error');let data,status=200;
  if(path===ROOT)data=changeSite(structuredClone(site));
  else if(path===`${ROOT}/deployed-branches`)data=[];
  else if(path===`${ROOT}/deploys?per_page=100&page=1`)data=[row(OLD),...(exists&&!deleted?[changeDeployment(row())]:[])];
  else if([`${ROOT}/deploys/${ID}`,`/api/v1/deploys/${ID}`].includes(path)){status=deleted?404:200;data=changeDeployment(row());}
  else throw Error('Unexpected path.');
  return changeReply({url:'https://api.netlify.com'+path,status,redirected:false,data});
 };
 const reader=createProviderReceiptReader({request,now:()=>time,publicRequest:async args=>{publicCalls.push(args);return {url:args.url,redirected:false,status:args.method==='POST'?postStatus:404};}});
 return {reader,pin,publicCalls,site,setLive(){exists=true;},setDeleted(){deleted=true;},setTime(value){time=value;}};
}
async function capture(h){const before=await h.reader.captureBaseline();h.setLive();const publication=await h.reader.verifyFinalized({pin:h.pin,before});return {before,publication};}
test('independent review: forged serialized receipt cannot acquire transport authority',async()=>{
 const h=harness(),{publication}=await capture(h);const value=publicationReceipt(publication,{now:NOW});
 for(const forged of [value,structuredClone(publication),JSON.parse(JSON.stringify(publication)),{kind:'publication'}])assert.throws(()=>publicationReceipt(forged,{now:NOW}),/Untrusted/);
});
test('independent review: receipt cannot be transferred between operator reader instances',async()=>{
 const a=harness(),b=harness(),before=await a.reader.captureBaseline();b.setLive();await assert.rejects(b.reader.verifyFinalized({pin,before}),/Untrusted/);
});
test('independent review: late raw response mutation cannot turn captured receipt into another site',async()=>{
 const h=harness(),{publication}=await capture(h);h.site.id='wrong';assert.equal(publicationReceipt(publication,{now:NOW}).site,SITE);
 assert.throws(()=>{publicationReceipt(publication,{now:NOW}).pin.binding.project='wrong';},TypeError);
});
for(const [field,value]of [['site_id','wrong'],['context','production'],['published_at','2026-11-02T14:00:00Z'],['draft',false],['branch','rehearsal'],['review_id',4]])test(`independent review: raw deployment ${field} rejects even when local pin is correct`,async()=>{
 const h=harness({changeDeployment:d=>({...d,[field]:value})});const before=await h.reader.captureBaseline();h.setLive();await assert.rejects(h.reader.verifyFinalized({pin,before}));
});
for(const field of ['published_deploy','deploy_id','account_id'])test(`independent review: missing site publication authority ${field} cannot default to safe`,async()=>{
 const h=harness({changeSite:s=>{delete s[field];return s;}});await assert.rejects(h.reader.captureBaseline());
});
for(const replyChange of [r=>({...r,url:'https://attacker.invalid'+new URL(r.url).pathname}),r=>({...r,redirected:true})])test('independent review: provider redirect/origin mismatch denies raw capture',async()=>{
 const h=harness({changeReply:replyChange});await assert.rejects(h.reader.captureBaseline(),/origin or redirect/);
});
test('independent review: production project cannot be mixed with valid provider identity',async()=>{
 const h=harness(),before=await h.reader.captureBaseline();h.setLive();await assert.rejects(h.reader.verifyFinalized({pin:{...pin,binding:{...pin.binding,project:'bsndfhbemstyrrglajat'}},before}));
});
test('independent review: stale baseline and future-dated receipt deny',async()=>{
 const h=harness(),{publication}=await capture(h);assert.throws(()=>publicationReceipt(publication,{now:NOW-1}),/Fresh/);assert.throws(()=>publicationReceipt(publication,{now:NOW+300001}),/Fresh/);
});
test('independent review: unknown provider fields never escape allowlisted receipt',async()=>{
 const marker='synthetic-sensitive-sentinel-do-not-forward';const h=harness({changeDeployment:d=>({...d,environment:[{value:marker}],token:marker,error:marker})}),{publication}=await capture(h);
 assert.ok(!JSON.stringify(publicationReceipt(publication,{now:NOW})).includes(marker));
});
test('independent review: authentic lifecycle alone cannot certify native/config/rate/Auth readiness',async()=>{
 const h=harness(),{publication}=await capture(h);assert.equal(assessApplicationReceipt({publication,now:NOW}).ready,false);
 for(const claims of [{functionsVerified:true},{protectedConfiguration:true},{rateLimitEnforced:true},{provider:{source:'authenticated-scoped-provider-read'}}])assert.throws(()=>assessApplicationReceipt({publication,now:NOW,...claims}),/Caller-supplied/);
});
test('independent review: different byte length/hash domains cannot certify artifact',()=>{
 const bytes=Buffer.from('synthetic immutable bytes'),expected={sha256:createHash('sha256').update(bytes).digest('hex'),sha1:createHash('sha1').update(bytes).digest('hex'),size:bytes.length};
 assert.deepEqual(compareArtifactBytes({expected,bytes}),expected);
 assert.throws(()=>compareArtifactBytes({expected,bytes:Buffer.concat([bytes,Buffer.from('x')])}));
 assert.throws(()=>compareArtifactBytes({expected:{...expected,sha256:expected.sha1},bytes}));
});
test('independent review: historical alias mutation denies finalization',async()=>{
 let mutate=false;const h=harness({changeSite:s=>({...s,domain_aliases:mutate?['changed.invalid']:[]})}),before=await h.reader.captureBaseline();mutate=true;h.setLive();await assert.rejects(h.reader.verifyFinalized({pin,before}));
});
test('independent review: GET404 cannot conceal still-live POST Auth surface during retirement',async()=>{
 const h=harness({postStatus:200}),{before}=await capture(h);h.setDeleted();await assert.rejects(h.reader.verifyRetirement({pin,before}),/Containment/);
 assert.ok(h.publicCalls.some(call=>call.method==='POST'));
});
test('independent review: retired receipt requires GET and harmless POST checks for Auth surfaces',async()=>{
 const h=harness(),{before}=await capture(h);h.setDeleted();const result=retirementReceipt(await h.reader.verifyRetirement({pin,before}),{now:NOW});assert.equal(result.immutableStatus,404);
 for(const route of ['/api/lockliel-auth/login','/api/lockliel-auth/logout','/.netlify/functions/lockliel-login','/.netlify/functions/lockliel-logout'])assert.ok(h.publicCalls.some(call=>call.method==='POST'&&call.url===pin.origin+route));
});

test('independent review: conflicting provider commit_ref cannot be rewritten as null',async()=>{
 const h=harness({changeDeployment:d=>({...d,commit_ref:'f'.repeat(40)})}),before=await h.reader.captureBaseline();h.setLive();await assert.rejects(h.reader.verifyFinalized({pin,before}),/source|commit/i);
});
test('independent review: old preservation baseline does not prevent independently fresh exact retirement',async()=>{
 const h=harness(),{before}=await capture(h);h.setTime(NOW+12*60*1000);h.setDeleted();const result=retirementReceipt(await h.reader.verifyRetirement({pin,before}),{now:NOW+12*60*1000});assert.equal(result.immutableStatus,404);
});

test('independent review: forged reservation naming historical deployment never authorizes DELETE',async()=>{
 const {createDeploymentOperator,protectCredential}=await import('../scripts/member-hosted/uploader.mjs');
 const h=harness(),writes=[];
 const request=async operation=>{
  writes.push({method:operation.method,path:operation.path});
  if(operation.method==='POST')return {status:200,redirected:false,data:{id:OLD,site_id:SITE,context:'deploy-preview',published_at:null,branch:null,review_id:null,state:'new'}};
  if(operation.method==='GET')return {status:200,redirected:false,data:{id:OLD,site_id:SITE,context:'deploy-preview',published_at:null,branch:null,review_id:null,state:'ready'}};
  if(operation.method==='DELETE')return {status:204,redirected:false};
  throw Error('Unexpected operation.');
 };
 const operator=createDeploymentOperator({request,reader:h.reader,authorize:()=>true,preparePackage:()=>{throw Error('must not build');},beforeAcceptance:()=>false,acceptance:()=>false,now:()=>NOW});
 const result=await operator.run({key:protectCredential(Buffer.from('sb_publishable_synthetic_only_credential')),keyProvenance:{project:PROJECT,mechanism:'protected-owner-project-attestation',noValueRecorded:true}});
 assert.equal(result.ok,false);assert.ok(!writes.some(op=>op.method==='DELETE'),'historical ID was sent to DELETE');
});

test('independent review: escaped provider credential reflection in allowed metadata cannot escape transport',async()=>{
 const {EventEmitter}=await import('node:events');const {createProtectedApiTransport,protectCredential}=await import('../scripts/member-hosted/uploader.mjs');
 const synthetic='synthetic-provider-token-reflection-42';
 const escaped=[...synthetic].map(character=>'\\u'+character.charCodeAt(0).toString(16).padStart(4,'0')).join('');
 const payload=Buffer.from('{"name":"'+escaped+'"}');
 const requestImpl=(_url,_options,callback)=>{
  const request=new EventEmitter();request.write=()=>{};request.destroy=()=>{};
  request.end=()=>queueMicrotask(()=>{const response=new EventEmitter();response.statusCode=200;response.resume=()=>{};response.destroy=()=>{};callback(response);response.emit('data',Buffer.from(payload));response.emit('end');});return request;
 };
 const transport=createProtectedApiTransport({credential:protectCredential(Buffer.from(synthetic)),requestImpl,authorize:()=>true});
 try{await assert.rejects(transport.request({method:'GET',path:ROOT,redirect:'error'}),/Protected provider transport failed/);}finally{transport.close();payload.fill(0);}
});

test('independent review: permissive 31-request rule cannot masquerade as the required 30-request rule',async()=>{
 const {createRouteReceiptObserver}=await import('../scripts/member-hosted/provider-receipts.mjs');
 const counts={};const observer=createRouteReceiptObserver({pin,now:()=>NOW,publicRequest:async request=>{
  const path=new URL(request.url).pathname;let status=404;
  if(path==='/api/lockliel/member-read')status=request.method==='GET'?401:405;
  if(['/api/lockliel-auth/login','/api/lockliel-auth/logout'].includes(path)){
   counts[path]=(counts[path]||0)+1;status=counts[path]>31?429:request.method==='GET'?405:400;
  }
  return {url:request.url,redirected:false,status};
 }});
 await assert.rejects(observer.observe(),/threshold|limit|rate/i);
});
