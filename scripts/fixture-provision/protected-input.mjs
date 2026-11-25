/** Hidden local TTY input. No files, environment or command-line secrets.
 * This module has no top-level input action. The reviewed live entry is disabled. */
import {need} from './contracts.mjs';
const prompts=Object.freeze({operator:'Isolated fixture operator credential (hidden): ',A:'New synthetic User A password (hidden): ',B:'New synthetic User B password (hidden): ',database:'Isolated database password (hidden): '});
export async function readHiddenLocalInput(kind){
 need(Object.hasOwn(prompts,kind)&&process.stdin.isTTY&&process.stdout.isTTY&&typeof process.stdin.setRawMode==='function');
 const stream=process.stdin,wasRaw=stream.isRaw,wasPaused=stream.isPaused()||stream.readableFlowing!==true;const bytes=Buffer.alloc(8192);let length=0;
 return new Promise((resolve,reject)=>{
  let ended=false,timer;
  const finish=(ok)=>{if(ended)return;ended=true;clearTimeout(timer);stream.removeListener('data',data);stream.removeListener('error',failed);stream.removeListener('end',failed);process.removeListener('SIGTERM',failed);process.removeListener('SIGHUP',failed);try{stream.setRawMode(Boolean(wasRaw));if(wasPaused)stream.pause();process.stdout.write('\n');}catch{ok=false;}const value=ok?Buffer.from(bytes.subarray(0,length)):null;bytes.fill(0);if(ok&&length>0)resolve(value);else{value?.fill(0);reject(new Error('INTERRUPTED'));}};
  const failed=()=>finish(false);
  const data=chunk=>{try{for(const c of chunk){if(c===3||c===4){finish(false);return;}if(c===10||c===13){finish(true);return;}if(c===127||c===8){if(length)bytes[--length]=0;continue;}if(c<32||c>126||length>=bytes.length){finish(false);return;}bytes[length++]=c;}}catch{finish(false);}finally{if(Buffer.isBuffer(chunk))chunk.fill(0);}};
  try{timer=setTimeout(failed,60000);stream.setRawMode(true);process.stdout.write(prompts[kind]);stream.on('data',data);stream.once('error',failed);stream.once('end',failed);process.once('SIGTERM',failed);process.once('SIGHUP',failed);stream.resume();}catch{finish(false);}
 });
}
export function disposeOwnedInputs(values){for(const value of values)if(Buffer.isBuffer(value))value.fill(0);}
export function validateOwnedPassword(value){need(Buffer.isBuffer(value)&&value.length>=16&&value.length<=1024&&value.every(x=>x>=32&&x<=126));return true;}
export function protectedInputReadiness(){return Object.freeze({hiddenTTYOnly:true,inputExecuted:false,ownedBuffersCleared:true,runtimeCopies:'JavaScript/HTTP immutable copies cannot be guaranteed zeroized; process exit required',liveEntryEnabled:false});}
