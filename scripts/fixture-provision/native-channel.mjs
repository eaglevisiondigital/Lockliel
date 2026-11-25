/** Private fixed subprocess channel. No callback, shell, environment secret or
 * caller-supplied executable can mint a native receipt. */
import {spawn} from 'node:child_process';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {randomBytes} from 'node:crypto';
import {performance} from 'node:perf_hooks';
import {requireFixtureAuthority,requireFixtureOperation,operatorRoot} from './operator-authority.mjs';
import {need,sha256,canonical,validateNativeReceipt,freeze} from './contracts.mjs';
const PYTHON='/Library/Developer/CommandLineTools/usr/bin/python3';
const PYTHON_REAL='/Library/Developer/CommandLineTools/Library/Frameworks/Python3.framework/Versions/3.9/bin/python3.9';
const PYTHON_SHA='bdea59019a38eb6600cc9e71e984a97fedadc406448431281e7657030f54987e';
const receipts=new WeakMap(),usage=new WeakMap();
function pinned(path,hash,max=2000000){const s=fs.lstatSync(path);need(s.isFile()&&!s.isSymbolicLink()&&[0,process.getuid()].includes(s.uid)&&!(s.mode&0o022)&&s.nlink===1&&s.size>0&&s.size<=max,'SOURCE_MISMATCH');need(sha256(fs.readFileSync(path))===hash,'SOURCE_MISMATCH');}
export async function collectFixtureNative(authority,phase,password,logins,subjects=null,before=null){
 const a=requireFixtureOperation(authority,phase==='before'?'BEFORE':'AFTER'),n=usage.get(authority)||0;need((phase==='before'&&n===0)||(phase==='after'&&n===1));need(Buffer.isBuffer(password)&&password.length>0&&password.length<=4096);usage.set(authority,n+1);
 need(fs.realpathSync(PYTHON)===PYTHON_REAL);pinned(PYTHON_REAL,PYTHON_SHA,20000000);const worker=fileURLToPath(new URL('../fixture-native/fixture_native_worker.py',import.meta.url));pinned(worker,a.nativeWorkerSha256);pinned(fileURLToPath(new URL('../fixture-native/fixture_inventory.py',import.meta.url)),a.nativeInventorySha256);pinned(a.caPath,a.caSha256,100000);
 const nonce=randomBytes(16).toString('hex'),started=Date.now(),mono=performance.now();const payload=Buffer.from(JSON.stringify({nonce,phase,approvalSha256:sha256(canonical(a)),password:password.toString('utf8'),logins,subjects,before}));need(payload.length<=65536);let bytes;
 try{bytes=await new Promise((resolve,reject)=>{let done=false,size=0;const chunks=[],child=spawn(PYTHON,['-I','-B','-S',worker,'--private-fixture-channel'],{shell:false,env:{},stdio:['pipe','pipe','pipe']});const timer=setTimeout(()=>fail(),65000);function fail(){if(done)return;done=true;clearTimeout(timer);child.kill('SIGKILL');for(const c of chunks)c.fill(0);reject(new Error('PREFLIGHT_FAILED'));}child.once('error',fail);child.stdin.once('error',fail);child.stderr.on('data',b=>{b.fill(0);fail();});child.stdout.on('data',b=>{if(done){b.fill(0);return;}size+=b.length;if(size>65536){b.fill(0);fail();}else{chunks.push(Buffer.from(b));b.fill(0);}});child.once('close',code=>{if(done)return;if(code!==0){fail();return;}done=true;clearTimeout(timer);const b=Buffer.concat(chunks);for(const c of chunks)c.fill(0);resolve(b);});child.stdin.end(payload);});
 requireFixtureAuthority(authority);need(Date.now()>=started&&Date.now()-started<=65000&&Math.abs(Date.now()-started-(performance.now()-mono))<=1000);const result=JSON.parse(bytes.toString());need(Object.keys(result).sort().join()===['ok','nonce','receipt'].sort().join()&&result.ok===true&&result.nonce===nonce);const receipt=validateNativeReceipt(result.receipt,phase,a.triggerGraphSha256,Date.now());need(receipt.startedAt>=started);const h=freeze({kind:'private-native-fixture-receipt'});receipts.set(h,receipt);return h;
 }catch{throw new Error('PREFLIGHT_FAILED');}finally{payload.fill(0);bytes?.fill(0);}
}
export function consumeFixtureNative(handle){const receipt=receipts.get(handle);need(receipt,'PREFLIGHT_FAILED');receipts.delete(handle);return receipt;}
export function fixtureNativeChannelReadiness(){return freeze({fixedPython:true,privatePipe:true,maximumConnections:2,maximumMillisecondsPerConnection:65000,allowsCallbacks:false,usesConsumedJ:false,liveExecuted:false,approvalRoot:operatorRoot});}
