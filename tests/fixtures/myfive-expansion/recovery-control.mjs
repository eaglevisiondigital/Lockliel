import {createInterface} from 'node:readline';
export function parseRecoveryCommand(line) {
 if(line==='stop')return null;
 const match=/^recover ([a-f0-9]{64})$/.exec(line);
 if(!match)throw Error('Only stop or one reviewed fixed-module SHA256 recovery is allowed');
 return match[1];
}
export function waitForRecoveryCommand(input,timeoutMs=300000) {
 return new Promise(resolve=>{const reader=createInterface({input});let done=false;const finish=value=>{if(done)return;done=true;clearTimeout(timer);reader.close();resolve(value);};const timer=setTimeout(()=>finish(null),timeoutMs);reader.once('line',line=>finish(line));reader.once('close',()=>finish(null));input.once('error',()=>finish(null));});
}
