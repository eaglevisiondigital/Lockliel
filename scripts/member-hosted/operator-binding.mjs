/** Complete fixed dependency composition for controlled preflight review.
 * Import/factory/prepare never prompt, connect or create a grant. Execution needs
 * separately installed source-approved authority and exact existing identities. */
import {readFile,lstat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {setTimeout as delay} from 'node:timers/promises';
import {verifyInstalledRuntime} from './operator-runtime.mjs';
import {SOURCE_SEALS} from './operator-source-seal.mjs';
import {loadReviewedOperatorAuthority,requireReviewedOperatorAuthority,operatorInstallationReadiness} from './operator-authority.mjs';
import {loadReviewedIdentityMapping,identityMappingReadiness,identityMappingSummary} from './identity-mapping.mjs';
import {collectPinnedNativePreflight,consumePinnedNativePreflight} from './native-channel.mjs';
import {createOfficialOperatorNetwork,requireOfficialOperatorNetwork} from './operator-network.mjs';
import {createExactSourcePackageBuilder} from './operator-package.mjs';
import {createDeploymentOperator} from './uploader.mjs';
import {createProviderReceiptReader,createRouteReceiptObserver,publicationReceipt} from './provider-receipts.mjs';
import {verifyLocalPackage,verifyProviderBinding} from './verify.mjs';
import {createDeploymentEvidenceRegistry} from './deployment-evidence.mjs';
import {observeBoundMembers,acceptanceEvidenceRequirements} from './operator-acceptance.mjs';
const ID=Object.freeze({source:'327ba098628f70aa65140862b8b14cd709bfd711',site:'70b03a42-6329-476e-bf4b-2b1ce30e9567',project:'qjksggxorghaxvpyslip'});
const need=x=>{if(!x)throw Error('Reviewed isolated operator stopped.');};
const sha=b=>createHash('sha256').update(b).digest('hex');
async function sources(){const result=[];for(const [name,digest]of Object.entries(SOURCE_SEALS)){const path=fileURLToPath(new URL('../../'+name,import.meta.url)),s=await lstat(path);need(s.isFile()&&!s.isSymbolicLink()&&s.uid===process.getuid()&&!(s.mode&0o022)&&s.size<=2000000&&sha(await readFile(path))===digest);result.push(name);}return Object.freeze(result);}
async function acquire(expectedScope){
 await sources();const authorityHandle=await loadReviewedOperatorAuthority(),authority=requireReviewedOperatorAuthority(authorityHandle);need(authority.scope===expectedScope);await verifyInstalledRuntime({execution:true});
 // Approval cannot substitute another compiler/runtime/network/worker or identity
 // implementation. The installer record excludes its own approval module to avoid
 // a mutual hash cycle; the externally pinned bootstrap seals that module.
 for(const [name,digest]of Object.entries(SOURCE_SEALS))if(name!=='scripts/member-hosted/operator-authority.mjs')need(authority.sourceHashes[name]===digest);
 const mapping=await loadReviewedIdentityMapping();identityMappingSummary(mapping);
 const registry=createDeploymentEvidenceRegistry({identity:ID});const providerObservation=registry.begin('provider');const network=createOfficialOperatorNetwork();requireOfficialOperatorNetwork(network);
 try{
  network.bindAuthority(authorityHandle);network.bindIdentities(mapping);await network.openOperator();const provider=await network.providerAuthority(authority.operatorId);
  const reader=createProviderReceiptReader({request:network.request,publicRequest:network.publicRequest});await reader.captureBaseline();
  const providerProof=registry.finish(providerObservation,{identity:ID,value:provider});
  const observation=registry.begin('database');const proof=await collectPinnedNativePreflight(mapping,authorityHandle),database=consumePinnedNativePreflight(proof);
  const databaseProof=registry.finish(observation,{identity:ID,value:database});
  return {authorityHandle,authority,mapping,registry,network,reader,database,providerProof,databaseProof};
 }catch{network.close();throw Error('Reviewed isolated operator stopped.');}
}
export function createBoundIsolatedOperator(...args){
 need(args.length===0);let used=false;
 return Object.freeze({
  async prepare(...options){need(options.length===0);const sealed=await sources();const runtime=await verifyInstalledRuntime();return Object.freeze({localBindingsVerified:true,liveExecutionAuthorized:false,runtime,sourceSeals:sealed,identity:ID,operator:operatorInstallationReadiness(),identities:identityMappingReadiness(),authEvidence:acceptanceEvidenceRequirements(),jAllowance:'CONSUMED',applicationReservation:'UNUSED'});},
  async runHostedPreflight(...options){
   need(options.length===0&&!used);used=true;let c;
   try{c=await acquire('isolated-preflight-only');const provider=c.registry.consume(c.providerProof,'provider'),database=c.registry.consume(c.databaseProof,'database');
    return Object.freeze({ok:true,preflightOnly:true,providerAuthorityVerified:provider.value.ownerVerified===true,databaseSafeguardsVerified:true,ledger:database.value.ledger,maintenance:'ON',project:ID.project,syntheticSubjectsVerified:true,branchLinkage:'historical-provider-metadata',branchLinkageFresh:false,deploymentAuthorized:false,reservationAttempted:false});
   }catch{throw Error('Reviewed isolated operator stopped.');}finally{c?.network.close();}
  },
  async runDeployment(...options){
   need(options.length===0&&!used);used=true;let c,builder,spec,sessionCleanup=true,outcome=null,localPackageCleanupVerified=true;
   try{
    need(acceptanceEvidenceRequirements().complete===true);c=await acquire('isolated-deployment-and-acceptance');
    // Current reviewed Auth scope has unobserved dynamic checks. Do not spend the
    // single reservation on an acceptance plan known to be incomplete.
    need(acceptanceEvidenceRequirements().complete===true);
    const providerFresh=c.registry.consume(c.providerProof,'provider'),dbFresh=c.registry.consume(c.databaseProof,'database');need(providerFresh.value.ownerVerified&&dbFresh.value.ledger===280);
    const key=await c.network.isolatedKey();const keyProvenance=c.network.keyProvenance();builder=createExactSourcePackageBuilder();let pinBound=false,finalDatabase=c.database;
    const fresh=()=>{requireReviewedOperatorAuthority(c.authorityHandle);need(Date.now()>=c.database.observedStartedAt&&Date.now()-c.database.observedStartedAt<=300000);identityMappingSummary(c.mapping);};
    const operator=createDeploymentOperator({request:c.network.request,reader:c.reader,authorize:operation=>{if(operation.phase==='cleanup'||operation.phase==='begin-containment')return true;fresh();return true;},
     preparePackage:async pin=>{fresh();c.network.bindOrigin(pin.binding.deploy);spec=await builder.build(pin);return spec;},
     beforeAcceptance:async value=>{fresh();publicationReceipt(value.publication);if(!pinBound){c.registry.bindDeployment({deploy:value.pin.binding.deploy,manifestSha256:value.manifestSha256});pinBound=true;}return createRouteReceiptObserver({publicRequest:c.network.publicRequest,pin:value.pin}).observe();},
     acceptance:async value=>{
      fresh();await delay(61000);fresh();const auth=await observeBoundMembers(c.network,c.mapping,value.pin,value.manifestSha256);sessionCleanup=auth.cleanupVerified;
      const local=await verifyLocalPackage({directory:spec.directory,expectedPin:value.pin,expectedManifestSha256:spec.expectedManifestSha256,allowLocalFixture:false});
      finalDatabase={...c.database,callerRestVerified:auth.callerRestVerified};
      return verifyProviderBinding({local,provider:{...value.provider,authAcceptance:auth},database:finalDatabase,expectedDatabaseBaseline:c.database.baseline,keyProvenance}).verified===true;
     },
     beginContainment:async()=>{await c.network.beginContainment();try{const cleanup=await c.network.cleanupMembers();sessionCleanup=sessionCleanup&&cleanup.verified;}catch{sessionCleanup=false;}},wait:delay});
    outcome=await operator.run({key,keyProvenance});
   }catch{throw Error('Reviewed isolated operator stopped.');}finally{try{await builder?.close();}catch{localPackageCleanupVerified=false;}finally{c?.network.close();}}
   return Object.freeze({...outcome,sessionCleanupVerified:sessionCleanup,localPackageCleanupVerified,ok:outcome.ok&&sessionCleanup&&localPackageCleanupVerified});
  },
 });
}
