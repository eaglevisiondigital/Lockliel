import type {FixtureActor,ReadScenario,MemberReadPort,MemberLoadState} from './contracts';
export type ReadControllerOptions=Readonly<{clock?:()=>number;schedule?:(callback:()=>void,delayMs:number)=>()=>void}>;
function defaultSchedule(callback:()=>void,delayMs:number){const timer=setTimeout(callback,delayMs);if(typeof timer==='object'&&'unref'in timer)timer.unref();return()=>clearTimeout(timer);}
/** Synchronous clearing, expiry and generation fencing even if a port ignores abort. */
export function createMemberReadController(adapter:MemberReadPort,options:ReadControllerOptions={}){
 const clock=options.clock??Date.now,schedule=options.schedule??defaultSchedule;
 let generation=0,state:MemberLoadState={status:'idle',generation:0},abort:AbortController|null=null,disposed=false,cancelExpiry:(()=>void)|null=null;
 const listeners=new Set<()=>void>();
 const publish=(next:MemberLoadState)=>{state=Object.freeze(next);for(const listener of listeners)listener();};
 const clear=()=>{generation++;abort?.abort();abort=null;cancelExpiry?.();cancelExpiry=null;adapter.invalidate();};
 return {
  getSnapshot:()=>state,
  subscribe(listener:()=>void){listeners.add(listener);return()=>{listeners.delete(listener);};},
  reset(){if(disposed)return;clear();publish({status:'idle',generation});},
  dispose(){if(disposed)return;clear();disposed=true;state={status:'idle',generation};listeners.clear();},
  async load(actor:FixtureActor,scenario:ReadScenario='ready',expectedRevision?:string){
   if(disposed)return state;clear();const current=generation;abort=new AbortController();const signal=abort.signal;publish({status:'loading',generation:current});
   try{
    const session=await adapter.validateSession(actor,scenario);
    if(disposed||signal.aborted||current!==generation)return state;
    if(session.status!=='authenticated'){publish({...session,generation:current});return state;}
    const remaining=session.validUntilMs-clock();
    if(!Number.isFinite(remaining)||remaining<=0||remaining>300000){publish({status:'expired',generation:current,message:'The sample session expired. Private content is cleared.'});return state;}
    cancelExpiry=schedule(()=>{if(disposed||current!==generation)return;clear();publish({status:'expired',generation,message:'The sample session expired. Private content is cleared.'});},remaining);
    const result=await adapter.readMember(session.session,{signal,expectedRevision});
    if(disposed||signal.aborted||current!==generation)return state;
    if(clock()>=session.validUntilMs){clear();publish({status:'expired',generation,message:'The sample session expired. Private content is cleared.'});return state;}
    if(result.status==='ready')publish({status:'ready',generation:current,boundary:session.boundary,data:result.data});
    else publish({...result,generation:current});
   }catch{if(!disposed&&!signal.aborted&&current===generation)publish({status:'error',generation:current,message:'The member service is unavailable. Private content was cleared.'});}
   return state;
  }
 };
}
