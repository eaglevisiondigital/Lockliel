// Independent Wave10I-N installation review. No operator import or live authority.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {auditReviewedInstallationSource,stageReviewedInstallationPreparation,reviewPreparationManifest} from '../scripts/member-hosted/prepare-operator-installation.mjs';
const exec=promisify(execFile),sha=value=>createHash('sha256').update(value).digest('hex');
async function fixture(){
 const seal=await readFile(new URL('../scripts/member-hosted/operator-source-seal.mjs',import.meta.url));
 const files=Object.fromEntries([...seal.toString().matchAll(/^ '([^']+)':'([a-f0-9]{64})',$/gm)].map(row=>[row[1],row[2]]));
 for(const name of ['operator-source-seal.mjs','operator-binding-launch.command','deployment_native_launch.command','recovery-runtime-SHA256SUMS'])files['scripts/member-hosted/'+name]=sha(await readFile(new URL('../scripts/member-hosted/'+name,import.meta.url)));
 return {version:'lockliel-offline-installation-preparation-v1',source:'d51b90db66d5fc650e7b5139a8a5787ba6a994ac',application:'327ba098628f70aa65140862b8b14cd709bfd711',site:'70b03a42-6329-476e-bf4b-2b1ce30e9567',project:'qjksggxorghaxvpyslip',branch:'course-cutover-rehearsal-274',state:'PREPARATION_ONLY',executionAuthorized:false,operatorApproval:null,identityApproval:null,usableGrantCreated:false,jAllowance:'CONSUMED',applicationReservation:'UNUSED',files};
}
const denied=/Offline operator installation preparation denied\./;
test('independent IN: preparation manifest is never a live capability',async()=>{assert.deepEqual(reviewPreparationManifest(await fixture()),{preparationOnly:true,liveAuthority:false,files:40});});
for(const [field,value]of [['executionAuthorized',true],['operatorApproval',{}],['identityApproval',{}],['usableGrantCreated',true],['jAllowance','UNUSED'],['applicationReservation','CONSUMED'],['project','bsndfhbemstyrrglajat'],['site','00000000-0000-0000-0000-000000000000']])test('independent IN: rejects changed '+field,async()=>{const f=await fixture();f[field]=value;assert.throws(()=>reviewPreparationManifest(f),denied);});
test('independent IN: digest array cannot exploit coercion',async()=>{const f=await fixture();f.files['scripts/member-hosted/operator-authority.mjs']=['a'.repeat(64)];assert.throws(()=>reviewPreparationManifest(f),denied);});
test('independent IN: unknown secret-shaped field never escapes error',async()=>{const f=await fixture(),secret='SYNTHETIC_IN_SECRET_CANARY';f.password=secret;assert.throws(()=>reviewPreparationManifest(f),error=>denied.test(String(error))&&!String(error).includes(secret));});
test('independent IN: proxy and accessor claims are not evaluated',async()=>{let touched=0;const f=await fixture();Object.defineProperty(f,'operatorApproval',{enumerable:true,get(){touched++;throw Error('SYNTHETIC');}});assert.throws(()=>reviewPreparationManifest(f),denied);assert.throws(()=>reviewPreparationManifest(new Proxy({},{get(){touched++;throw Error('SYNTHETIC');}})),denied);assert.equal(touched,0);});
test('independent IN: audit/staging options cannot inject paths, callbacks or authority',async()=>{let touched=0;const options=new Proxy({},{get(){touched++;throw Error('SYNTHETIC');}});for(const method of [auditReviewedInstallationSource,stageReviewedInstallationPreparation])await assert.rejects(method(options),denied);assert.equal(touched,0);});
test('independent IN: CLI rejects execution flags with fixed sanitized output',async()=>{const path=new URL('../scripts/member-hosted/prepare-operator-installation.mjs',import.meta.url).pathname;for(const mode of ['--execute','--install','--password=SYNTHETIC_IN_SECRET_CANARY']){let result;try{await exec(process.execPath,[path,mode],{env:{PATH:'/usr/bin:/bin'},timeout:10000});assert.fail('must deny');}catch(error){result=error;}assert.equal(result.code,1);assert.equal(result.stderr,'');assert.deepEqual(JSON.parse(result.stdout),{ok:false,errorCode:'OFFLINE_INSTALLATION_PREPARATION_DENIED'});}});
