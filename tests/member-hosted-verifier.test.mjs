import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,mkdir,rm,readFile,symlink} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {packageInventory,digest,verifyLocalPackage,verifyProviderBinding,inspectFunctionZip,zipCrc32} from '../scripts/member-hosted/verify.mjs';
const pin={version:'lockliel-member-hosted-v1',binding:{project:'qjksggxorghaxvpyslip',site:'70b03a42-6329-476e-bf4b-2b1ce30e9567',deploy:'a'.repeat(24),source:'b'.repeat(40)},origin:`https://${'a'.repeat(24)}--jade-unicorn-642f40.netlify.app`,context:'deploy-preview',schema:280,protocol:'278-v1',paused:true};
async function fixture(run){const directory=await mkdtemp(join(tmpdir(),'lockliel-wave10-verify-'));try{
  for(const dir of ['public','functions','artifacts'])await mkdir(join(directory,dir));
  await writeFile(join(directory,'public/404.html'),'unavailable');
  await writeFile(join(directory,'netlify.toml'),'# synthetic verifier fixture, not a native archive');
  await writeFile(join(directory,'functions/lockliel-member-read.zip'),'synthetic byte fixture');
  await writeFile(join(directory,'artifacts/lockliel-member-read.mjs'),'export default ()=>{};');
  const manifest={version:'lockliel-member-package-v1',pin,localFixture:true,enabled:false,releaseEligible:false,source:{head:pin.binding.source,dirty:true},files:await packageInventory(directory),function:{name:'lockliel-member-read',path:'functions/lockliel-member-read.zip',compiled:'artifacts/lockliel-member-read.mjs',runtimeAPIVersion:2}};
  const bytes=JSON.stringify(manifest);await writeFile(join(directory,'member-hosted-manifest.json'),bytes);
  await run({directory,expectedPin:pin,expectedManifestSha256:digest(bytes),allowLocalFixture:true});
}finally{await rm(directory,{recursive:true,force:true});}}
test('independent digest and exact pin verify local bytes only',()=>fixture(async args=>{const local=await verifyLocalPackage(args);assert.equal(local.verifiedLocal,true);assert.equal(local.fixture,true);assert.throws(()=>verifyProviderBinding({local}),/fixture/);}));
for(const [label,change] of [
 ['no independent approval',args=>({...args,expectedManifestSha256:undefined})],
 ['wrong project',args=>({...args,expectedPin:{...pin,binding:{...pin.binding,project:'bsndfhbemstyrrglajat'}}})],
 ['wrong site',args=>({...args,expectedPin:{...pin,binding:{...pin.binding,site:'60579b8e-d0ca-4ac1-abe5-7128f4243e8b'}}})],
 ['wrong source',args=>({...args,expectedPin:{...pin,binding:{...pin.binding,source:'c'.repeat(40)}}})],
 ['wrong deploy',args=>({...args,expectedPin:{...pin,binding:{...pin.binding,deploy:'d'.repeat(24)}}})],
 ['fixture release',args=>({...args,allowLocalFixture:false})],
])test(`verifier rejects ${label}`,()=>fixture(args=>assert.rejects(verifyLocalPackage(change(args)))));
for(const name of ['public/404.html','artifacts/lockliel-member-read.mjs','functions/lockliel-member-read.zip','netlify.toml'])test(`byte tamper denied: ${name}`,()=>fixture(async args=>{await writeFile(join(args.directory,name),'tamper');await assert.rejects(verifyLocalPackage(args),/inventory/);}));
test('extra public/Auth file denied',()=>fixture(async args=>{await writeFile(join(args.directory,'public/sign-up.html'),'unexpected');await assert.rejects(verifyLocalPackage(args),/inventory/);}));
test('symlink is denied',()=>fixture(async args=>{await symlink(join(args.directory,'netlify.toml'),join(args.directory,'public/link'));await assert.rejects(verifyLocalPackage(args),/symlink/);}));
test('manifest tamper denied before parsing',()=>fixture(async args=>{await writeFile(join(args.directory,'member-hosted-manifest.json'),'{}');await assert.rejects(verifyLocalPackage(args),/digest/);}));
const now=Date.now();
const dbBaseline={versionsSha256:'1'.repeat(64),migration280StatementsArrayTextMd5:'2'.repeat(32),migration280SourceSha256:'3'.repeat(64)};
function receipts(){return {now,expectedDatabaseBaseline:dbBaseline,local:{verifiedLocal:true,fixture:false,manifest:{releaseEligible:true,enabled:true},pin,manifestSha256:'f'.repeat(64),files:{'public/404.html':{sha1:'file-sha1'},'functions/lockliel-member-read.zip':{sha256:'zip-sha256'}}},provider:{source:'authenticated-scoped-provider-read',site:pin.binding.site,id:pin.binding.deploy,context:'deploy-preview',draft:true,published:false,state:'ready',url:pin.origin,commit:null,files:{'/404.html':'file-sha1'},functions:{'lockliel-member-read':'zip-sha256'},routesVerified:true,routes:['/api/lockliel/member-read'],directFunctionBlocked:true,otherApiBlocked:true,observedAt:now},database:{source:'authenticated-read-only-provider-inspection',project:pin.binding.project,ledger:280,baseline:dbBaseline,currentSessionCatalogVerified:true,requiredColumnGrantsVerified:true,callerRestVerified:true,paused:true,schemaReady:true,protocol:'278-v1',rlsAll:true,notesServiceTablePrivileges:0,notesServiceColumnPrivileges:0,observedAt:now},keyProvenance:{project:pin.binding.project,mechanism:'protected-owner-project-attestation',noValueRecorded:true}};}
test('synthetic trusted-receipt contract bridges ZIP domain and all state, not a live attestation',()=>{assert.equal(verifyProviderBinding(receipts()).verified,true);});
for(const [field,value] of [['source','page-header'],['site','wrong'],['id','wrong'],['context','production'],['draft',false],['published',true],['state','error'],['url','https://lockliel.com'],['commit','wrong'],['files',{}],['functions',{'lockliel-member-read':'compiled-source-sha256'}],['routesVerified',false],['directFunctionBlocked',false],['otherApiBlocked',false],['observedAt',now-300001]])test(`provider receipt rejects ${field}`,()=>{const args=receipts();args.provider[field]=value;assert.throws(()=>verifyProviderBinding(args));});
for(const [field,value] of [['project','bsndfhbemstyrrglajat'],['baseline',{}],['currentSessionCatalogVerified',false],['requiredColumnGrantsVerified',false],['callerRestVerified',false],['ledger',279],['paused',false],['schemaReady',false],['protocol','other'],['rlsAll',false],['notesServiceTablePrivileges',1],['notesServiceColumnPrivileges',1],['observedAt',now-300001]])test(`database receipt rejects ${field}`,()=>{const args=receipts();args.database[field]=value;assert.throws(()=>verifyProviderBinding(args));});
test('key syntax or a browser echo does not prove backend provenance',()=>{const args=receipts();args.keyProvenance={project:'unknown',mechanism:'response-header'};assert.throws(()=>verifyProviderBinding(args),/provenance/);});
test('source contains no uploader or default production key',async()=>{const code=await readFile(new URL('../scripts/member-hosted/verify.mjs',import.meta.url),'utf8');assert.ok(!code.includes('globalThis.fetch'));assert.ok(!code.includes('process.env'));});

// Minimal stored ZIP byte fixture, not a runtime archive or deployment artifact.
function syntheticZip(names=['sample.mjs']){
 const locals=[],central=[];let offset=0;
 for(const name of names){const filename=Buffer.from(name),data=Buffer.from('synthetic'),crc=zipCrc32(data),lh=Buffer.alloc(30),ch=Buffer.alloc(46);
 lh.writeUInt32LE(0x04034b50);lh.writeUInt16LE(20,4);lh.writeUInt32LE(crc,14);lh.writeUInt32LE(data.length,18);lh.writeUInt32LE(data.length,22);lh.writeUInt16LE(filename.length,26);
 ch.writeUInt32LE(0x02014b50);ch.writeUInt16LE(20,4);ch.writeUInt16LE(20,6);ch.writeUInt32LE(crc,16);ch.writeUInt32LE(data.length,20);ch.writeUInt32LE(data.length,24);ch.writeUInt16LE(filename.length,28);ch.writeUInt32LE(offset,42);
 locals.push(lh,filename,data);central.push(ch,filename);offset+=lh.length+filename.length+data.length;}
 const cd=Buffer.concat(central),end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50);end.writeUInt16LE(names.length,8);end.writeUInt16LE(names.length,10);end.writeUInt32LE(cd.length,12);end.writeUInt32LE(offset,16);return Buffer.concat([...locals,cd,end]);
}
test('bounded ZIP reader independently reads actual central and local bytes',()=>{const result=inspectFunctionZip(syntheticZip());assert.equal(result['sample.mjs'].content.toString(),'synthetic');});
for(const name of ['../outside','/absolute','folder/../outside','folder\\outside','folder//outside'])test(`unsafe ZIP path denied: ${name}`,()=>assert.throws(()=>inspectFunctionZip(syntheticZip([name]))));
test('duplicate ZIP entry denied',()=>assert.throws(()=>inspectFunctionZip(syntheticZip(['sample.mjs','sample.mjs']))));
test('truncated ZIP denied',()=>assert.throws(()=>inspectFunctionZip(syntheticZip().subarray(0,-1))));
test('ZIP CRC mismatch denied',()=>{const zip=syntheticZip();zip[40]^=1;assert.throws(()=>inspectFunctionZip(zip));});
test('ZIP size bomb denied before inflation',()=>{const zip=syntheticZip();const central=zip.readUInt32LE(zip.length-6);zip.writeUInt32LE(16777216,central+24);assert.throws(()=>inspectFunctionZip(zip));});

for(const malformed of ['false',null,0,{},[]])test(`malformed fixture authority rejected: ${JSON.stringify(malformed)}`,()=>fixture(async args=>{
 const path=join(args.directory,'member-hosted-manifest.json'),m=JSON.parse(await readFile(path));m.localFixture=malformed;const bytes=JSON.stringify(m);await writeFile(path,bytes);await assert.rejects(verifyLocalPackage({...args,expectedManifestSha256:digest(bytes)}),/authority/);
}));
test('dirty source type cannot become release authority',()=>fixture(async args=>{const path=join(args.directory,'member-hosted-manifest.json'),m=JSON.parse(await readFile(path));m.source.dirty='false';const bytes=JSON.stringify(m);await writeFile(path,bytes);await assert.rejects(verifyLocalPackage({...args,expectedManifestSha256:digest(bytes)}),/authority/);}));
test('held or disabled package cannot certify hosted binding',()=>{const args=receipts();args.local.manifest.releaseEligible=false;assert.throws(()=>verifyProviderBinding(args),/release package/);});

test('allow-fixture option never relaxes clean nonfixture source',()=>fixture(async args=>{const path=join(args.directory,'member-hosted-manifest.json'),m=JSON.parse(await readFile(path));m.localFixture=false;m.enabled=true;m.releaseEligible=true;const bytes=JSON.stringify(m);await writeFile(path,bytes);await assert.rejects(verifyLocalPackage({...args,expectedManifestSha256:digest(bytes)}),/Dirty source/);}));
