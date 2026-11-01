import type {ServerMemberReadPort,ServerReadState} from './contracts';
type Options=Readonly<{clock?:()=>number;nonce?:()=>string;schedule?:(callback:()=>void,delay:number)=>()=>void}>;
/** Account/session changes clear synchronously. This controller never derives identity. */
export function createServerReadController(port:ServerMemberReadPort,options:Options={}){
 const clock=options.clock||Date.now,nonce=options.nonce||(()=>{const b=new Uint8Array(16);globalThis.crypto.getRandomValues(b);return Array.from(b,x=>x.toString(16).padStart(2,'0')).join('');});
 const schedule=options.schedule||((fn,delay)=>{const timer=setTimeout(fn,delay);return()=>clearTimeout(timer);});
 let generation=0,state:ServerReadState=Object.freeze({status:'idle',generation}),abort:AbortController|null=null,cancel:(()=>void)|null=null,disposed=false;
 const listeners=new Set<()=>void>();
 function publish(next:ServerReadState){state=Object.freeze(next);listeners.forEach(fn=>fn());}
 function clear(){generation++;abort?.abort();abort=null;cancel?.();cancel=null;}
 function invalidate(){if(disposed)return;clear();publish({status:'idle',generation});}
 return {getSnapshot:()=>state,subscribe(fn:()=>void){listeners.add(fn);return()=>{listeners.delete(fn);};},invalidate,
  async load(){if(disposed)return;clear();const own=generation,controller=new AbortController();abort=controller;publish({status:'loading',generation:own});
   try{const result=await port.read({nonce:nonce(),generation:own,signal:controller.signal});if(disposed||generation!==own||controller.signal.aborted)return;
    if(result.status!=='ready'){publish({status:result.status,generation:own});return;}
    const life=result.data.validUntil-clock();if(!Number.isFinite(life)||life<=0||life>60000){publish({status:'expired',generation:own});return;}
    publish({status:'ready',generation:own,data:result.data});cancel=schedule(()=>{if(!disposed&&generation===own){clear();publish({status:'expired',generation});}},life);
   }catch{if(!disposed&&generation===own)publish({status:'error',generation:own});}
  },dispose(){if(disposed)return;clear();disposed=true;state=Object.freeze({status:'idle',generation});listeners.clear();}
 };
}
