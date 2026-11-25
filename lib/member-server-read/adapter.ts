import type {IsolatedReadBinding,ServerMemberReadPort} from './contracts';
import {isolatedReadBinding,validateServerSnapshot} from './validation';
export const MEMBER_READ_PATH='/api/lockliel/member-read';
type Transport=(path:string,init:RequestInit)=>Promise<Response>;
/** One fixed same-origin GET. Cookies stay in the existing BFF; no browser bearer or owner. */
export function createServerMemberAdapter(expected:IsolatedReadBinding|null,options:Readonly<{transport?:Transport;clock?:()=>number}>={}):ServerMemberReadPort{
 const binding=isolatedReadBinding(expected),clock=options.clock||Date.now;
 return {async read(input){
  if(!binding||!/^[a-f0-9]{32}$/.test(input.nonce)||!Number.isSafeInteger(input.generation)||input.generation<1||input.generation>999999999||input.signal.aborted)return {status:'unavailable'};
  try{
   const response=await (options.transport||((path,init)=>fetch(path,init)))(MEMBER_READ_PATH,{method:'GET',credentials:'same-origin',cache:'no-store',redirect:'error',signal:input.signal,headers:{Accept:'application/json','X-Lockliel-Read-Nonce':input.nonce,'X-Lockliel-Read-Generation':String(input.generation)}});
   if(input.signal.aborted)return {status:'unavailable'};
   if(response.status===401)return {status:'anonymous'};if(response.status===403)return {status:'forbidden'};
   if(!response.ok||!response.headers.get('content-type')?.toLowerCase().startsWith('application/json'))return {status:'unavailable'};
   const text=await response.text();if(input.signal.aborted||text.length>12000)return {status:'unavailable'};
   const data=validateServerSnapshot(JSON.parse(text),binding,input,clock());
   return data?{status:'ready',data}:{status:'unavailable'};
  }catch{return {status:'error'};}
 }};
}
