// Independent byte verification. No network, Auth, settings or deploy operations.
import {readFile,readdir,lstat} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {inflateRawSync} from 'node:zlib';
import {validateHostedPin} from '../../netlify/member-hosted/binding.mjs';

export const digest=(bytes,algorithm='sha256')=>createHash(algorithm).update(bytes).digest('hex');
const OFFICIAL_BOOTSTRAP_SHA256='d0a7166bbc0a4c664dccb3446e4c0358de247ced3214c1e7b944f34f467a4894';
const canonical=value=>JSON.stringify(value,(_key,v)=>v&&Object.getPrototypeOf(v)===Object.prototype?Object.fromEntries(Object.entries(v).sort(([a],[b])=>a.localeCompare(b))):v);
const equal=(a,b)=>canonical(a)===canonical(b);
function requireCondition(ok,message){if(!ok)throw Error(message);}
/** Bounded ZIP reader for independent inspection, never extracts or executes entries. */
export function zipCrc32(bytes){let crc=0xffffffff;for(const byte of bytes){crc^=byte;for(let bit=0;bit<8;bit++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}return (crc^0xffffffff)>>>0;}
export function inspectFunctionZip(bytes){
  requireCondition(Buffer.isBuffer(bytes)&&bytes.length<=16777216,'Archive size exceeded.');
  let end=-1;for(let p=bytes.length-22;p>=Math.max(0,bytes.length-65557);p--)if(bytes.readUInt32LE(p)===0x06054b50){end=p;break;}
  requireCondition(end>=0&&end+22+bytes.readUInt16LE(end+20)===bytes.length,'Invalid ZIP end record.');
  requireCondition(bytes.readUInt16LE(end+4)===0&&bytes.readUInt16LE(end+6)===0,'Multipart ZIP denied.');
  const count=bytes.readUInt16LE(end+10),size=bytes.readUInt32LE(end+12),offset=bytes.readUInt32LE(end+16);
  requireCondition(count===bytes.readUInt16LE(end+8)&&count<=32&&offset+size===end,'Invalid ZIP directory.');
  const entries={};let cursor=offset,total=0;
  for(let i=0;i<count;i++){
    requireCondition(cursor+46<=end&&bytes.readUInt32LE(cursor)===0x02014b50,'Invalid ZIP entry.');
    const flags=bytes.readUInt16LE(cursor+8),method=bytes.readUInt16LE(cursor+10),packed=bytes.readUInt32LE(cursor+20),plain=bytes.readUInt32LE(cursor+24),n=bytes.readUInt16LE(cursor+28),extra=bytes.readUInt16LE(cursor+30),comment=bytes.readUInt16LE(cursor+32),local=bytes.readUInt32LE(cursor+42),mode=bytes.readUInt32LE(cursor+38)>>>16;
    requireCondition(cursor+46+n+extra+comment<=end&&!(flags&1)&&[0,8].includes(method)&&plain<=8388608&&(mode&0xf000)!==0xa000,'Unsafe ZIP encoding or size.');
    const name=bytes.subarray(cursor+46,cursor+46+n).toString('utf8');
    requireCondition(name&&!name.startsWith('/')&&!name.includes('\\')&&!name.split('/').some(x=>!x||x==='.'||x==='..')&&!Object.hasOwn(entries,name),'Unsafe or duplicate ZIP path.');
    requireCondition(local+30<=offset&&bytes.readUInt32LE(local)===0x04034b50,'Invalid ZIP local header.');
    const ln=bytes.readUInt16LE(local+26),le=bytes.readUInt16LE(local+28),start=local+30+ln+le;
    requireCondition(bytes.subarray(local+30,local+30+ln).toString('utf8')===name&&bytes.readUInt16LE(local+8)===method&&start+packed<=offset,'ZIP local/central mismatch.');
    const content=method===0?bytes.subarray(start,start+packed):inflateRawSync(bytes.subarray(start,start+packed),{maxOutputLength:8388608});
    requireCondition(zipCrc32(content)===bytes.readUInt32LE(cursor+16),'ZIP content CRC mismatch.');
    total+=content.length;requireCondition(content.length===plain&&total<=16777216,'ZIP decoded size mismatch.');
    entries[name]={sha256:digest(content),size:content.length,content};cursor+=46+n+extra+comment;
  }
  requireCondition(cursor===end,'ZIP directory mismatch.');return entries;
}
export async function packageInventory(directory){
  const files={};
  async function walk(path,prefix=''){
    for(const entry of (await readdir(path)).sort()){
      const name=prefix+entry,full=join(path,entry),stat=await lstat(full);
      requireCondition(!stat.isSymbolicLink(),'Package symlinks are forbidden.');
      if(stat.isDirectory())await walk(full,name+'/');
      else {requireCondition(stat.isFile(),'Nonregular package entry.');if(name==='member-hosted-manifest.json')continue;
        const bytes=await readFile(full);files[name]={sha256:digest(bytes),sha1:digest(bytes,'sha1'),size:bytes.length};}
    }
  }
  await walk(resolve(directory));return files;
}
/** expectedManifestSha256 and pin must come from a reviewed source/artifact record,
 * not from this manifest, a page response, request header or the deployment title. */
export async function verifyLocalPackage({directory,expectedPin,expectedManifestSha256,allowLocalFixture=false}={}){
  requireCondition(Boolean(validateHostedPin(expectedPin)),'Invalid independent pin.');
  requireCondition(/^[a-f0-9]{64}$/.test(expectedManifestSha256||''),'An independently approved manifest digest is required.');
  const bytes=await readFile(join(directory,'member-hosted-manifest.json'));
  requireCondition(digest(bytes)===expectedManifestSha256,'Manifest digest mismatch.');
  const manifest=JSON.parse(bytes);
  requireCondition(typeof manifest.localFixture==='boolean'&&typeof manifest.source?.dirty==='boolean'&&typeof manifest.enabled==='boolean'&&typeof manifest.releaseEligible==='boolean','Invalid package authority types.');
  requireCondition(manifest.releaseEligible===(!manifest.localFixture&&manifest.enabled),'Inconsistent package authority.');
  requireCondition(manifest.version==='lockliel-member-package-v1','Unexpected package version.');
  requireCondition(equal(manifest.pin,expectedPin),'Package binding mismatch.');
  requireCondition(allowLocalFixture===true || manifest.localFixture===false,'Local fixture cannot certify a deployment.');
  requireCondition(manifest.source?.head===expectedPin.binding.source,'Source mismatch.');
  requireCondition(manifest.localFixture===true || manifest.source?.dirty===false,'Dirty source cannot certify a deployment.');
  const files=await packageInventory(directory);
  requireCondition(equal(files,manifest.files),'Package byte inventory mismatch.');
  const fn=manifest.function;
  requireCondition(fn?.name==='lockliel-member-read' && fn.path==='functions/lockliel-member-read.zip' && fn.compiled==='artifacts/lockliel-member-read.mjs' && fn.runtimeAPIVersion===2,'Unexpected function inventory.');
  requireCondition(Boolean(files[fn.path])&&Boolean(files[fn.compiled]),'Missing function bytes.');
  if(!manifest.localFixture || manifest.toolchain){
    const entries=inspectFunctionZip(await readFile(join(directory,fn.path)));
    const entry=entries['___netlify-entry-point.mjs'],bootstrap=entries['___netlify-bootstrap.mjs'],meta=entries['___netlify-metadata.json'];
    requireCondition(entry&&bootstrap&&meta,'Missing official runtime files.');
    requireCondition(manifest.toolchain?.bootstrap==='2.24.0'&&manifest.toolchain?.zisi==='16.3.0'&&/^[a-f0-9]{64}$/.test(manifest.toolchain?.bootstrapSha256||''),'Unreviewed official toolchain.');
    requireCondition(bootstrap.sha256===OFFICIAL_BOOTSTRAP_SHA256&&bootstrap.sha256===manifest.toolchain.bootstrapSha256,'Official bootstrap byte mismatch.');
    const metadata=JSON.parse(meta.content.toString('utf8'));
    requireCondition(metadata.version===1&&metadata.bootstrap_version===manifest.toolchain.bootstrap,'Bootstrap metadata mismatch.');
    requireCondition(equal(Object.keys(entries).sort(),['___netlify-bootstrap.mjs','___netlify-entry-point.mjs','___netlify-metadata.json','lockliel-member-read.mjs'].sort()),'Unexpected runtime archive entries.');
    requireCondition(entries['lockliel-member-read.mjs'].sha256===files[fn.compiled].sha256,'ZIP user module does not match compiled bytes.');
    requireCondition(entry.content.toString('utf8')==="import * as bootstrap from './___netlify-bootstrap.mjs';export const handler = bootstrap.getLambdaHandler('./lockliel-member-read.mjs')",'Official entrypoint byte template mismatch.');
    requireCondition(equal(metadata,{bootstrap_version:'2.24.0',version:1}),'Unexpected runtime metadata.');
    requireCondition(equal(fn.routes,[{pattern:'/api/lockliel/member-read',literal:'/api/lockliel/member-read',methods:['GET']}]),'Unexpected function route metadata.');
  }
  requireCondition(Object.keys(files).filter(x=>x.startsWith('functions/')).length===1,'Unexpected exposed function.');
  requireCondition(Object.keys(files).every(x=>/^(public\/|artifacts\/|functions\/|netlify\.toml$)/.test(x)),'Unexpected package surface.');
  for(const name of Object.keys(files))requireCondition(!name.split('/').includes('..')&&!name.startsWith('/')&&!name.includes('\\'),'Unsafe package path.');
  return Object.freeze({verifiedLocal:true,fixture:manifest.localFixture===true,pin:expectedPin,manifestSha256:expectedManifestSha256,manifest,files});
}
/** Trusted operator input only: receipts must be obtained via authenticated scoped
 * provider readers. This pure checker cannot authenticate a caller-supplied JSON file.
 * Tests always label their receipts synthetic. No browser-provided data is authority. */
export function verifyProviderBinding({local,provider,database,expectedDatabaseBaseline,keyProvenance,now=Date.now()}={}){
  requireCondition(local?.verifiedLocal===true && local.fixture===false && local.manifest?.releaseEligible===true && local.manifest?.enabled===true,'A release package, not a fixture, is required.');
  const {binding}=local.pin;
  requireCondition(provider?.source==='authenticated-scoped-provider-read' && provider.site===binding.site && provider.id===binding.deploy,'Unverified provider identity.');
  requireCondition(provider.context===local.pin.context && provider.draft===true && provider.published===false && provider.state==='ready','Wrong deployment state.');
  requireCondition(provider.url===local.pin.origin,'Wrong immutable origin.');
  requireCondition(provider.commit===null || provider.commit===binding.source,'Provider source mismatch.');
  const staticFiles=Object.fromEntries(Object.entries(local.files).filter(([n])=>n.startsWith('public/')).map(([n,v])=>['/'+n.slice(7),v.sha1]));
  requireCondition(equal(provider.files,staticFiles),'Provider static bytes unbridged.');
  requireCondition(equal(provider.functions,{'lockliel-member-read':local.files['functions/lockliel-member-read.zip'].sha256}),'Provider ZIP bytes unbridged.');
  requireCondition(provider.routesVerified===true && equal(provider.routes,['/api/lockliel/member-read']) && provider.directFunctionBlocked===true && provider.otherApiBlocked===true,'Routing acceptance missing.');
  const fresh=x=>Number.isSafeInteger(x)&&x<=now&&now-x<=300000;
  requireCondition(fresh(provider.observedAt)&&fresh(database?.observedAt),'Fresh provider/database receipts required.');
  requireCondition(database?.source==='authenticated-read-only-provider-inspection' && database.project===binding.project && database.ledger===280 && database.paused===true && database.schemaReady===true && database.protocol==='278-v1','Backend state mismatch.');
  requireCondition(expectedDatabaseBaseline&&/^[a-f0-9]{64}$/.test(expectedDatabaseBaseline.versionsSha256||'')&&/^[a-f0-9]{32}$/.test(expectedDatabaseBaseline.migration280StatementsArrayTextMd5||'')&&/^[a-f0-9]{64}$/.test(expectedDatabaseBaseline.migration280SourceSha256||'')&&equal(database.baseline,expectedDatabaseBaseline),'Exact migration versions/fingerprint baseline missing.');
  requireCondition(database.currentSessionCatalogVerified===true&&database.requiredColumnGrantsVerified===true&&database.callerRestVerified===true,'Required RPC/grant/caller evidence missing.');
  requireCondition(database.rlsAll===true && database.notesServiceTablePrivileges===0 && database.notesServiceColumnPrivileges===0,'Backend security evidence missing.');
  requireCondition(keyProvenance?.project===binding.project && keyProvenance?.mechanism==='protected-owner-project-attestation' && keyProvenance.noValueRecorded===true,'Opaque key project provenance is not established.');
  return {verified:true,source:binding.source,site:binding.site,deploy:binding.deploy,project:binding.project,manifestSha256:local.manifestSha256};
}
