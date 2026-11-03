import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,lstat,readdir,rm} from 'node:fs/promises';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {auditReviewedInstallationSource,stageReviewedInstallationPreparation,reviewPreparationManifest} from '../scripts/member-hosted/prepare-operator-installation.mjs';
const digest=b=>createHash('sha256').update(b).digest('hex');
test('actual retained source audit verifies40 exact files without live authority',async()=>{
 const result=await auditReviewedInstallationSource();assert.equal(result.source,'d51b90db66d5fc650e7b5139a8a5787ba6a994ac');assert.equal(result.sourceVerified,true);assert.equal(Object.keys(result.files).length,40);assert.equal(result.executionAuthorized,false);assert.equal(result.privateArtifactsAccessed,false);assert.equal(result.connectionsOpened,0);assert.equal(result.identityApproval,null);assert.equal(result.operatorApproval,null);assert.equal(result.jAllowance,'CONSUMED');assert.equal(result.applicationReservation,'UNUSED');
});
test('actual temporary installation preparation copies exact disabled bytes and creates no grant',async()=>{
 let root;
 try{const result=await stageReviewedInstallationPreparation();root=result.path;assert.match(root,/^\/private\/tmp\/lockliel-wave10in-preparation-[A-Za-z0-9]+$/);assert.equal((await lstat(root)).mode&0o777,0o700);assert.equal(result.liveExecutionAuthorized,false);assert.equal(result.grantCreated,false);assert.equal(result.credentialsRequested,false);
  const m=JSON.parse(await readFile(join(root,'PREPARATION_ONLY.json'),'utf8'));assert.equal(reviewPreparationManifest(m).liveAuthority,false);let files=0;
  async function walk(path){for(const name of await readdir(path)){const p=join(path,name),s=await lstat(p);assert.equal(s.isSymbolicLink(),false);if(s.isDirectory()){assert.equal(s.mode&0o777,0o700);await walk(p);}else{files++;assert.equal(s.mode&0o777,0o400);assert.equal(s.nlink,1);assert.ok(!['READY','CONSUMED','approved-operator.json','approved-mapping.json','grant.json'].includes(name));}}}await walk(root);assert.equal(files,41);
  for(const [name,hash]of Object.entries(m.files))assert.equal(digest(await readFile(join(root,name))),hash);
  const native=JSON.parse(await readFile(join(root,'scripts/member-hosted/deployment-native-worker-manifest.json'),'utf8'));assert.equal(native.executionAuthorized,false);assert.equal(native.operatorSeal,null);assert.equal(native.identityApproval,null);
 }finally{if(root)await rm(root,{recursive:true,force:true});}
});
