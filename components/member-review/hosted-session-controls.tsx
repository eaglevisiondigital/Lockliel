"use client";
import {useEffect,useId,useRef,useState,useSyncExternalStore,type FormEvent} from 'react';
import {AUTH_CHANGE_STORAGE_KEY} from '../../lib/member-server-read/session-events';
import styles from './member-review.module.css';

type Intent='login'|'logout';
export type HostedSessionOutcome='signed-in'|'signed-out'|'local-clear-unverified'|'mfa-denied'|'mfa-revocation-unverified'|'failed';
type Payload=Readonly<{email?:string;password?:string}>;
const endpoints={login:'/api/lockliel-auth/login',logout:'/api/lockliel-auth/logout'} as const;
const outcomeMessages:Readonly<Record<HostedSessionOutcome,string>>={
 'signed-in':'Sign-in completed. Use Load current isolated session to verify the current owner-only view.',
 'signed-out':'This host’s session cookies and member view were cleared.',
 'local-clear-unverified':'This host’s session cookies and member view were cleared. Provider session revocation could not be verified. Stop acceptance and request operator review.',
 'mfa-denied':'This review does not support accounts requiring additional verification. No member access was granted.',
 'mfa-revocation-unverified':'Additional verification is required. This review is unavailable, and provider session revocation could not be verified. Stop acceptance and request operator review.',
 failed:'The authentication request could not complete. No previous member information is retained.'
};
/** Existing same-host handlers only. No provider SDK, browser token store or redirect input. */
export async function requestHostedSession(intent:Intent,payload:Payload,signal:AbortSignal,transport:typeof fetch=fetch):Promise<HostedSessionOutcome>{
 try{
  const response=await transport(endpoints[intent],{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(intent==='login'?{email:payload.email,password:payload.password}:{}),credentials:'same-origin',cache:'no-store',redirect:'error',referrerPolicy:'no-referrer',signal});
  const text=await response.text();
  if(text.length>4096)return 'failed';
  const body:unknown=JSON.parse(text);
  if(!body||typeof body!=='object'||Array.isArray(body))return 'failed';
  const data=body as Record<string,unknown>;
  const exactKeys=(expected:readonly string[])=>Object.keys(data).length===expected.length&&expected.every(key=>Object.hasOwn(data,key));
  if(intent==='login'){
   if(data.requiresMfa===true)return exactKeys(['error','requiresMfa','revocation'])&&data.revocation==='verified'?'mfa-denied':'mfa-revocation-unverified';
   return response.ok&&exactKeys(['ok','requiresMfa','aal'])&&data.ok===true&&data.requiresMfa===false&&(data.aal==='aal1'||data.aal==='aal2')?'signed-in':'failed';
  }
  if(!response.ok||!exactKeys(['ok','localCleared','revocation'])||data.ok!==true||data.localCleared!==true)return 'failed';
  return data.revocation==='verified'||data.revocation==='not-attempted'?'signed-out':data.revocation==='unverified'?'local-clear-unverified':'failed';
 }catch{return 'failed';}
}
/** Notification contains no account identifiers, secrets or permission claims. */
export function notifyHostedSessionChange(target:Pick<Window,'dispatchEvent'|'localStorage'>):void{
 target.dispatchEvent(new Event('lockliel:session-changed'));
 try{target.localStorage.setItem(AUTH_CHANGE_STORAGE_KEY,String(Date.now()));}catch{/* Display invalidation still occurs in this window. */}
}
const subscribeToHydration=()=>()=>{};
const clientReady=()=>true,serverNotReady=()=>false;
export function HostedSessionControls({onTransition,onBusyChange}:Readonly<{onTransition:()=>void;onBusyChange?:(busy:boolean)=>void}>){
 const ready=useSyncExternalStore(subscribeToHydration,clientReady,serverNotReady);
 const [busy,setBusy]=useState(false),[message,setMessage]=useState('Only independently authorized synthetic isolated accounts may sign in here.');
 const active=useRef<AbortController|null>(null),mounted=useRef(false),loginForm=useRef<HTMLFormElement>(null),logoutForm=useRef<HTMLFormElement>(null),description=useId();
 useEffect(()=>{
  mounted.current=true;const login=loginForm.current,logout=logoutForm.current;
  return()=>{mounted.current=false;active.current?.abort();active.current=null;login?.reset();logout?.reset();};
 },[]);
 async function submit(event:FormEvent<HTMLFormElement>,intent:Intent){
  event.preventDefault();
  const form=event.currentTarget;
  if(!ready||active.current){form.reset();return;}
  const request=new AbortController();active.current=request;
  onTransition();notifyHostedSessionChange(window);setBusy(true);onBusyChange?.(true);setMessage('Previous member information has been cleared. Authentication is in progress.');
  let payload:Payload={};
  try{
   if(intent==='login'){
    const data=new FormData(form);
    payload={email:String(data.get('email')||''),password:String(data.get('password')||'')};
    data.delete('email');data.delete('password');
   }
   // Clear the visible fields before awaiting any transport or provider response.
   form.reset();
   const outcome=await requestHostedSession(intent,payload,request.signal);
   if(mounted.current&&active.current===request){onTransition();notifyHostedSessionChange(window);setMessage(outcomeMessages[outcome]);}
  }finally{
   payload={};form.reset();
   if(mounted.current&&active.current===request){active.current=null;setBusy(false);onBusyChange?.(false);}
  }
 }
 return <section className={styles.controls} aria-labelledby="hosted-auth-title">
  <h2 id="hosted-auth-title">Isolated account access</h2>
  <p id={description}>Synthetic acceptance only. Sign-in uses this host’s existing protected session cookies. This surface does not create accounts, refresh expired access or support manager verification.</p>
  <form ref={loginForm} className="ml-auth-card" method="post" action={endpoints.login} autoComplete="off" aria-describedby={description} aria-busy={!ready||busy} onSubmit={event=>void submit(event,'login')}>
   <label>Email address<input name="email" type="email" autoComplete="off" maxLength={254} required disabled={!ready||busy}/></label>
   <label>Password<input name="password" type="password" autoComplete="off" maxLength={128} required disabled={!ready||busy}/></label>
   <button type="submit" disabled={!ready||busy}>{busy?'Authentication in progress':'Sign in to isolated review'}</button>
  </form>
  <form ref={logoutForm} method="post" action={endpoints.logout} aria-busy={!ready||busy} onSubmit={event=>void submit(event,'logout')}>
   <button type="submit" disabled={!ready||busy}>Sign out of this isolated host</button>
  </form>
  <p role="status" aria-live="polite" aria-atomic="true">{message}</p>
 </section>;
}
