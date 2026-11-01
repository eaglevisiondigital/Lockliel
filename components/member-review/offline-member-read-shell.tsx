"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createOfflineMemberAdapter } from '../../lib/member-read-model/offline-adapter';
import { createMemberReadController } from '../../lib/member-read-model/controller';
import type { FixtureActor, ReadScenario, MemberReadModel } from '../../lib/member-read-model/contracts';
import { MemberExperienceWorkspace } from '../member-experience-preview/member-experience-workspace';
import { FaithJourneyWorkspace } from '../faith-journey-preview/faith-journey-workspace';
import { OwnerPrivacyWorkspace } from '../owner-privacy-preview/owner-privacy-workspace';
import { ShareReviewWorkspace } from '../share-review/share-review-workspace';
import styles from './member-review.module.css';
type View='dashboard'|'faith'|'share'|'privacy';
type Scenario=ReadScenario|'loading';
const labels:Readonly<Record<Scenario,string>>={ready:'Available fixture',loading:'Hold loading state',missing:'Missing profile','network-error':'Network failure',stale:'Stale revision',unauthorized:'Access denied','unknown-permissions':'Unknown permissions'};
/** Uses the existing member route and modules. This is an OFFLINE session simulation, never a login. */
export function OfflineMemberReadShell({shareReviewEnabled=false,privacyReviewEnabled=false}:Readonly<{shareReviewEnabled?:boolean;privacyReviewEnabled?:boolean}>){
 const [controller]=useState(()=>createMemberReadController(createOfflineMemberAdapter()));
 const state=useSyncExternalStore(controller.subscribe,controller.getSnapshot,controller.getSnapshot);
 const [actor,setActor]=useState<FixtureActor>('anonymous'),[scenario,setScenario]=useState<Scenario>('ready'),[view,setView]=useState<View>('dashboard');
 const heading=useRef<HTMLHeadingElement>(null);
 useEffect(()=>()=>controller.reset(),[controller]);
 const ready=state.status==='ready'&&scenario!=='loading';
 function load(nextActor:FixtureActor,nextScenario:Scenario){
  // The controller invalidates authority and clears data synchronously, before awaiting anything.
  if(nextScenario==='loading')controller.reset();else void controller.load(nextActor,nextScenario);
 }
 function reset(){controller.reset();setActor('anonymous');setScenario('ready');setView('dashboard');heading.current?.focus();}
 const status=scenario==='loading'?'Loading demonstration paused. No previous private data is retained. Choose another state to continue.':state.status==='ready'?'Offline member snapshot ready. Nothing was read from a live account.':state.status==='idle'?'Choose a synthetic session fixture. No private information has been loaded.':state.status==='loading'?'Loading the offline member snapshot. Previous private state has been cleared.':'message' in state?state.message:'Private content unavailable.';
 const titles={dashboard:'Dashboard',faith:'Faith Journey',share:'Share Review',privacy:'Privacy'};
 return <div className={styles.reviewRoot}>
  <a className={styles.skip} href="#member-review-main" onClick={()=>document.getElementById('member-review-main')?.focus()}>Skip to My Lockliel review</a>
  <div className={styles.notice}><strong>OFFLINE AUTHENTICATED READ REVIEW</strong><span>Mock sessions and invented data. No real sign-in, cloud saving or delivery.</span></div>
  <div className={styles.shell}><header className={styles.header}><div><strong>Lockliel</strong><span>MY LOCKLIEL</span></div><button type="button" onClick={reset}>Reset review</button></header>
   <main id="member-review-main" tabIndex={-1}>
    <div className={styles.welcome}><p>REACH. TEACH. TRAIN. DISCIPLE. MULTIPLY.</p><h1 ref={heading} tabIndex={-1}>Your space. With clear boundaries.</h1><p>The same member experience, now driven by owner-scoped offline read contracts.</p></div>
    <section className={styles.controls} aria-labelledby="read-context-title"><h2 id="read-context-title">Offline session review</h2>
     <label htmlFor="read-actor">Mock session fixture</label><select id="read-actor" value={actor} aria-describedby="read-context-help" onChange={event=>{const next=event.target.value as FixtureActor;setActor(next);setView('dashboard');load(next,scenario);}}><option value="anonymous">Anonymous</option><option value="user-a">Synthetic User A</option><option value="user-b">Synthetic User B</option><option value="expired">Expired session</option><option value="staff">Staff without owner permission</option></select>
     <label htmlFor="read-scenario">Read response demonstration</label><select id="read-scenario" value={scenario} onChange={event=>{const next=event.target.value as Scenario;setScenario(next);load(actor,next);}}>{Object.entries(labels).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select>
     <p id="read-context-help">Fixture selection is not authentication or a permission grant. A future server must derive identity from the existing validated Lockliel session. Use invented examples only.</p>
    </section>
    <nav className={styles.navigation} aria-label="Integrated member review sections">{(Object.keys(titles) as View[]).filter(item=>item!=='share'||shareReviewEnabled).filter(item=>item!=='privacy'||privacyReviewEnabled).map(item=><button type="button" key={item} disabled={!ready} aria-current={view===item?'page':undefined} onClick={()=>setView(item)}>{titles[item]}</button>)}</nav>
    <p className={styles.status} role="status" aria-live="polite" aria-atomic="true">{status}</p>
    {ready&&state.status==='ready'?<OfflineMemberPanels key={`${state.boundary}:${state.generation}`} model={state.data} view={view} shareReviewEnabled={shareReviewEnabled} privacyReviewEnabled={privacyReviewEnabled}/>:<section className={styles.controls} aria-busy={state.status==='loading'||scenario==='loading'}><h2>Private member view unavailable</h2><p>No member, relationship, private draft or sharing controls are displayed until an authorized fixture response is complete.</p>{state.status!=='idle'&&<button type="button" onClick={()=>{setScenario('ready');load(actor,'ready');heading.current?.focus();}}>Retry current mock session</button>}</section>}
   </main><footer className={styles.footer}>Offline review only. No real account, production API, upload, message, share event or saved change. Refreshing clears this visit.</footer>
  </div>
 </div>;
}
/** Presentation consumes only allowlisted DTOs. Raw API responses and session authority never reach modules. */
export function OfflineMemberPanels({model,view,shareReviewEnabled=false,privacyReviewEnabled=false}:Readonly<{model:MemberReadModel;view:View;shareReviewEnabled?:boolean;privacyReviewEnabled?:boolean}>){
 return <div><div hidden={view!=='dashboard'} className={styles.panel}><MemberExperienceWorkspace readModel={model}/></div>
  <div hidden={view!=='faith'} className={styles.panel}><FaithJourneyWorkspace readModel={model}/></div>
  {shareReviewEnabled&&<div hidden={view!=='share'} className={styles.panel}><ShareReviewWorkspace readModel={model}/></div>}
  {privacyReviewEnabled&&<div hidden={view!=='privacy'} className={styles.panel}><OwnerPrivacyWorkspace readModel={model}/></div>}
 </div>;
}
