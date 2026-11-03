import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {performFixedRead} from '../scripts/provider-evidence-collector/transport.mjs';
import {runCollector} from '../scripts/provider-evidence-collector/collector.mjs';
import {takeVerifiedAuthority} from '../scripts/provider-evidence-collector/authority.mjs';

const sentinel='SYNTHETIC_PRIVATE_REVIEW_SENTINEL_NOT_A_CREDENTIAL';
const forgeries={
 null:null,
 empty:{},
 providerLabel:{provider:'supabase-management-api'},
 ownerLabel:{operator:'owner',authorized:true},
 expectedProject:{project:'qjksggxorghaxvpyslip',verified:true},
 productionProject:{project:'bsndfhbemstyrrglajat',verified:true},
 broadPermission:{scope:'organization-admin',verified:true},
 exactPermission:{scope:'auth_config_read',project:'qjksggxorghaxvpyslip',verified:true},
 localDigest:{sha256:'a'.repeat(64),verified:true},
 freshReceipt:{observedAt:Date.now(),providerIdentity:'supabase-management-api',verified:true},
 expiredReceipt:{observedAt:1,verified:true},
 tokenPrefix:{credential:'sbp_fc_'+sentinel},
};
for(const [name,value] of Object.entries(forgeries))test('independent security rejects '+name+' before any provider request',async()=>{
 const credential=Buffer.from(sentinel);
 const out=await performFixedRead(value,credential);
 assert.equal(out.ok,false);assert.equal(out.category,'AUTHORITY_UNAVAILABLE');assert.equal(out.activationAllowed,false);
 assert.equal(JSON.stringify(out).includes(sentinel),false);assert.equal(credential.every(byte=>byte===0),true);
});
test('independent security does not coerce authority getters',async()=>{
 let calls=0;const authority=new Proxy({}, {get(){calls++;throw new Error(sentinel);}});
 const out=await performFixedRead(authority,Buffer.from(sentinel));
 assert.equal(calls,0);assert.equal(out.category,'AUTHORITY_UNAVAILABLE');assert.equal(JSON.stringify(out).includes(sentinel),false);
});
test('independent security cannot forge authority using prototypes or frozen objects',()=>{
 for(const value of [Object.freeze({verified:true}),Object.create(null),new WeakSet(),()=>true])assert.throws(()=>takeVerifiedAuthority(value),/^Error: AUTHORITY_UNAVAILABLE$/);
});
test('independent security rejects caller enabling flags without input or consumption',async()=>{
 const out=await runCollector({enabled:true,authority:{verified:true},token:sentinel});
 assert.equal(out.liveEntryEnabled,false);assert.equal(out.inputRequested,false);assert.equal(out.requestAttempted,false);assert.equal(out.attemptConsumed,false);
 assert.equal(out.operatorIdentity,'UNKNOWN');assert.equal(out.credentialBinding,'UNKNOWN');assert.equal(JSON.stringify(out).includes(sentinel),false);
});
test('independent security blocked readiness cannot be mutated into authority',async()=>{
 const out=await runCollector();assert.equal(Object.isFrozen(out),true);
 assert.throws(()=>{out.liveEntryEnabled=true;},TypeError);
 const result=await performFixedRead(out,Buffer.from(sentinel));assert.equal(result.category,'AUTHORITY_UNAVAILABLE');
});

for(const target of ['launcher.mjs','source-manifest.json'])test('independent launcher rejects tampered '+target+' before evaluating entry',()=>{
 const repository=resolve(dirname(fileURLToPath(import.meta.url)),'..');
 const sandbox=fs.mkdtempSync('/private/tmp/lockliel-collector-independent-');
 try{
  const source=repository+'/scripts/provider-evidence-collector/';
  const folder=sandbox+'/scripts/provider-evidence-collector';fs.mkdirSync(folder,{recursive:true});
  fs.copyFileSync(source+'launcher.mjs',folder+'/launcher.mjs');fs.copyFileSync(source+'source-manifest.json',folder+'/source-manifest.json');
  const command=fs.readFileSync(source+'readiness.command','utf8').replace(/^ROOT=.*$/m,"ROOT='"+sandbox+"'");
  fs.writeFileSync(sandbox+'/check.command',command);
  if(target==='launcher.mjs')fs.writeFileSync(folder+'/'+target,"process.stdout.write('UNVERIFIED_ENTRY_EXECUTED');");
  else fs.writeFileSync(folder+'/'+target,'{}');
  const out=spawnSync('/bin/sh',[sandbox+'/check.command'],{env:{PATH:'/usr/bin:/bin'},encoding:'utf8',timeout:10000});
  assert.equal(out.status,1);assert.match(out.stdout,/SOURCE_MISMATCH/);assert.doesNotMatch(out.stdout+out.stderr,/UNVERIFIED_ENTRY_EXECUTED/);
 }finally{fs.rmSync(sandbox,{recursive:true,force:true});}
});
