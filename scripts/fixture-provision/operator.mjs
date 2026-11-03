/** Concrete fixed composition. Entry remains uninstalled and has no automatic
 * invocation. Opaque authority cannot be supplied through caller callbacks. */
import {verifyLocalFixturePackage} from './launcher.mjs';
import {loadFixtureOperatorAuthority,requireFixtureAuthority,consumeFixtureAttempt,claimFixtureStep,finishFixtureAttempt,recordFixtureCheckpoint,fixtureOperatorReadiness} from './operator-authority.mjs';
import {createReviewedFixtureTransport,openReviewedFixtureTransport,createReviewedMember,disposeReviewedFixtureTransport,plannedLoginDigests,createOfflineProvider,createOfflineMember,disposeOfflineProvider} from './transport.mjs';
import {collectFixtureNative,consumeFixtureNative} from './native-channel.mjs';
import {readHiddenLocalInput,disposeOwnedInputs} from './protected-input.mjs';
import {createFixtureProvenanceStore,appendFixtureProvenance,inspectFixtureProvenance,FIXTURE_PURPOSE} from './provenance-store.mjs';
import {consumeOfflineAttempt,claimOfflineStep,recordOfflineOutcome} from './durable-ledger.mjs';
import {IDENTITY,need,clone,freeze,sha256,canonical,validateNativeReceipt,verifyPost,safeFailure} from './contracts.mjs';
const hash=x=>sha256(canonical(x));
async function sequence(io){let created=[],store,currentLabel,consumed=false,providerOpened=false;const inputs=[];try{
 const grant=io.consume();consumed=true;const planned=plannedLoginDigests(grant.generation),logins=planned.map(x=>x.loginSha256);
 io.fresh();io.claim('PRECHECK');const database=await io.input('database');inputs.push(database);const before=await io.native('before',database,logins,null,null);io.fresh();
 const record=createFixtureProvenanceStore({root:grant.registryRoot,anchorRoot:grant.anchorRoot,header:{project:IDENTITY.project,branch:IDENTITY.branch,branchId:IDENTITY.branchId,purpose:FIXTURE_PURPOSE,sourceSha:grant.sourceSha,creationAuthorizationSha256:hash(grant),identityEvidenceSha256:grant.providerEvidenceSha256,attemptSha256:grant.grantSha256,beforeSha256:hash(before),generation:grant.generation,createdAt:io.now(),syntheticOnly:io.syntheticOnly}});store=record.store;io.checkpoint(record.checkpoint);
 // Collect both fixture passwords before the first irreversible provider request.
 const a=await io.input('A');inputs.push(a);const b=await io.input('B');inputs.push(b);need(!a.equals(b));await io.open();providerOpened=true;
 for(const [i,label]of ['A','B'].entries()){
  io.fresh();currentLabel=label;io.claim('CREATE_'+label);io.checkpoint(appendFixtureProvenance(store,{label,state:'CREATE_CLAIMED',recordedAt:io.now(),evidenceSha256:hash({generation:grant.generation,label,planned:planned[i]})}));
  const projection=await io.create(label,[a,b][i]);created.push(projection);io.fresh();need(projection.tuple.loginSha256===logins[i]);io.checkpoint(appendFixtureProvenance(store,{label,state:'CREATED_UNVERIFIED',recordedAt:io.now(),evidenceSha256:projection.projectionSha256,tuple:projection.tuple,providerEvidenceSha256:projection.projectionSha256}));currentLabel=null;
 }
 io.fresh();io.claim('POSTCHECK');const after=await io.native('after',database,logins,created.map(x=>x.tuple.subjectSha256),before);io.fresh();verifyPost(before,after,created);
 for(const [i,label]of ['A','B'].entries())io.checkpoint(appendFixtureProvenance(store,{label,state:'VERIFIED',recordedAt:io.now(),evidenceSha256:hash(after),nativeEvidenceSha256:hash(after),providerEvidenceSha256:created[i].projectionSha256}));
 io.claim('FINAL');io.finish('PASS');const status=inspectFixtureProvenance(store);return freeze({ok:true,syntheticOnly:io.syntheticOnly,hostedUsersCreated:io.syntheticOnly?0:2,simulatedCreates:io.syntheticOnly?2:0,independentDatabaseVerified:!io.syntheticOnly,provenanceStatus:status.status,attemptConsumed:true,retryAllowed:false,memberSessionsCreated:0,managerAcceptance:false,deploymentAttempted:false});
 }catch(error){const category=safeFailure(error);if(store&&currentLabel)try{io.checkpoint(appendFixtureProvenance(store,{label:currentLabel,state:category==='PROVIDER_REJECTED'?'REJECTED':'AMBIGUOUS',recordedAt:io.now(),evidenceSha256:hash({category,generation:'failed-current-attempt'})}));}catch{/* Durable pending state remains a fail-closed reconciliation stop. */}
 if(consumed)try{io.finish(category==='PROVIDER_REJECTED'?(created.length?'PARTIAL':'BLOCKED'):(currentLabel?'AMBIGUOUS':created.length?'PARTIAL':'BLOCKED'));}catch{/* No resetting or replacement grant. */}
 return freeze({ok:false,category,syntheticOnly:io.syntheticOnly,attemptConsumed:consumed,knownCreated:created.length,retryAllowed:false,reconciliationRequired:consumed,memberSessionsCreated:0,deploymentAttempted:false});
 }finally{disposeOwnedInputs(inputs);if(providerOpened)io.close();}
}
export function createFixtureOperator(...args){need(args.length===0);let used=false;return freeze({
 prepare(...options){need(options.length===0);verifyLocalFixturePackage();return fixtureOperatorReadiness();},
 async execute(...options){need(options.length===0&&!used,'ATTEMPT_UNAVAILABLE');used=true;verifyLocalFixturePackage();const authority=loadFixtureOperatorAuthority();let transport;
 const io={syntheticOnly:false,now:Date.now,fresh:()=>requireFixtureAuthority(authority),consume:()=>consumeFixtureAttempt(authority),claim:s=>claimFixtureStep(authority,s),finish:s=>finishFixtureAttempt(authority,s),checkpoint:c=>recordFixtureCheckpoint(authority,c),input:readHiddenLocalInput,
 native:async(phase,pw,logins,subjects,before)=>consumeFixtureNative(await collectFixtureNative(authority,phase,pw,logins,subjects,before)),
 open:async()=>{transport=createReviewedFixtureTransport(authority);await openReviewedFixtureTransport(transport);},create:(label,pw)=>createReviewedMember(transport,label,pw),close:()=>{if(transport)disposeReviewedFixtureTransport(transport);}};
 return sequence(io);
 }
 });}
/** Closed data-only fixture domain executes the same composition, with no exported
 * arbitrary callback or live source capability. Cannot activate a provider. */
export async function runSyntheticFixtureOperator(ledger,paths,options={},now=Date.now()){
 const cfg=clone(options);need(Object.keys(cfg).every(k=>['provider','before','after','elapsed','inputFailure'].includes(k)));need(paths&&Object.keys(paths).sort().join()==='anchorRoot,root'&&Object.values(paths).every(x=>typeof x==='string'&&x.startsWith('/private/tmp/lockliel-fixture-')));
 let generation,provider,created=[],clock=now;const owned=[];let nativeCalls=0,createCalls=0,inputCalls=0;const guard={directIPv6:true,tlsVerifyFull:true,hostnameVerified:true,transactionReadOnly:'on',lockTimeout:'5s',statementTimeout:'30s',sameConnectionAndTransaction:true,rolledBack:true,connectionClosed:true};const trigger=sha256('offline-trigger-graph');
 const io={syntheticOnly:true,now:()=>clock,fresh:()=>need(clock>=now&&clock-now<300000,'AUTHORITY_MISSING'),consume:()=>{const g=consumeOfflineAttempt(ledger,clock);generation=g.generation;return {...g,registryRoot:paths.root,anchorRoot:paths.anchorRoot,sourceSha:'1'.repeat(40),providerEvidenceSha256:sha256('offline-provider'),grantSha256:ledger.anchor};},claim:s=>claimOfflineStep(ledger,s,clock),finish:s=>recordOfflineOutcome(ledger,s,clock),checkpoint:()=>{},input:async kind=>{inputCalls++;if(cfg.inputFailure===kind)throw new Error('INTERRUPTED');const b=Buffer.from('ONLY-SYNTHETIC-'+kind+'-PASSWORD-ONLY');owned.push(b);return b;},
 native:async phase=>{nativeCalls++;clock+=phase==='after'?(cfg.elapsed??1):1;const subjects=phase==='before'?[]:created.map(x=>({...x.tuple,profileCount:1,confirmed:true,staffRoleCount:0,factorCount:0,sessionCount:0,enrollmentCount:0,progressCount:0,noteCount:0,unexpectedClaimCount:0}));return validateNativeReceipt({schema:'lockliel-fixture-native-v1',phase,project:IDENTITY.project,branch:IDENTITY.branch,branchId:IDENTITY.branchId,startedAt:clock,observedAt:clock,safeguards:guard,ledger:280,paused:true,schemaReady:true,protocol:'278-v1',collisionCount:0,protectedStateSha256:sha256('offline-old-state'),triggerGraphSha256:trigger,unexpectedWriteCount:0,subjects,...(cfg[phase]||{})},phase,trigger,clock);},
 open:async()=>{if(cfg.inputFailure==='operator')throw new Error('INTERRUPTED');provider=createOfflineProvider(cfg.provider||[{kind:'success'},{kind:'success'}]);},create:async(label,pw)=>{createCalls++;clock++;const r=await createOfflineMember(provider,label,pw,generation,clock);created.push(r);return r;},close:()=>disposeOfflineProvider(provider)};
 const result=await sequence(io);return freeze({...result,ownedInputBuffersCleared:owned.every(b=>b.every(v=>v===0)),inputCalls,nativeCalls,createCalls});
}
