"use client";
import {useEffect,useRef,useState,useSyncExternalStore} from 'react';
import {PreviewPanel} from '../member-experience-preview/member-components';
import {createServerMemberAdapter} from '../../lib/member-server-read/adapter';
import {createServerReadController} from '../../lib/member-server-read/controller';
import {bindServerReadInvalidation} from '../../lib/member-server-read/session-events';
import {isolatedReadBinding} from '../../lib/member-server-read/validation';
import type {IsolatedReadBinding,ServerMemberSnapshot,ServerReadState} from '../../lib/member-server-read/contracts';
import styles from './member-review.module.css';
type View='dashboard'|'faith'|'share'|'privacy';
const messages:Readonly<Record<Exclude<ServerReadState['status'],'ready'>,string>>={idle:'No private member information is loaded. Use an existing isolated session only after its target is authorized.',loading:'Loading the current isolated session. Previous private information has been cleared.',unavailable:'The isolated member read is unavailable. No sample or previous member information has been substituted.',anonymous:'No valid current session was returned. Sign-in is not performed by this review.',forbidden:'Access was denied. No private member information is displayed.',expired:'This member snapshot expired and was cleared. Load the current session again to continue.',error:'The member read could not finish. No private member information is retained.'};
/** Real server port mode, never a mock-login selector. Missing binding performs no request. */
export function ServerMemberReadShell({binding}:Readonly<{binding:IsolatedReadBinding|null}>){
 const [controller]=useState(()=>createServerReadController(createServerMemberAdapter(binding)));
 const state=useSyncExternalStore(controller.subscribe,controller.getSnapshot,controller.getSnapshot);
 const [view,setView]=useState<View>('dashboard'),heading=useRef<HTMLHeadingElement>(null);
 const configured=isolatedReadBinding(binding)!==null;
 useEffect(()=>{
  const clear=()=>{controller.invalidate();setView('dashboard');};
  const unbind=bindServerReadInvalidation(window,document,clear);
  return()=>{unbind();controller.invalidate();};
 },[controller]);
 const clear=()=>{controller.invalidate();setView('dashboard');heading.current?.focus();};
 const load=()=>{setView('dashboard');void controller.load();};
 return <div className={styles.reviewRoot}><a className={styles.skip} href="#member-review-main" onClick={()=>document.getElementById('member-review-main')?.focus()}>Skip to My Lockliel review</a>
  <div className={styles.notice}><strong>ISOLATED SERVER READ REVIEW</strong><span>Existing session only. Read-only member projections. No saving or delivery.</span></div>
  <div className={styles.shell}><header className={styles.header}><div><strong>Lockliel</strong><span>MY LOCKLIEL</span></div><button type="button" onClick={clear}>Clear member view</button></header>
   <main id="member-review-main" tabIndex={-1}><div className={styles.welcome}><p>REACH. TEACH. TRAIN. DISCIPLE. MULTIPLY.</p><h1 ref={heading} tabIndex={-1}>Your space. With clear boundaries.</h1><p>The existing member experience, with minimal owner-scoped server reads.</p></div>
    <section className={styles.controls} aria-labelledby="server-read-title"><h2 id="server-read-title">Isolated session review</h2><p>{configured?'An exact isolated target is configured. This page does not sign in, refresh a session, change an account or infer consent.':'Trusted isolated deployment binding is missing. No request will be made. Mock data is not used as a fallback.'}</p><button type="button" disabled={!configured||state.status==='loading'} onClick={load}>{state.status==='loading'?'Loading current session':'Load current isolated session'}</button><p>Only an independently authorized synthetic isolated account may be used. Private data clears on reload, expiry, session-change notification or leaving this window.</p></section>
    <nav className={styles.navigation} aria-label="Integrated member review sections">{(['dashboard','faith','share','privacy'] as View[]).map(item=><button key={item} type="button" disabled={state.status!=='ready'} aria-current={view===item?'page':undefined} onClick={()=>setView(item)}>{{dashboard:'Dashboard',faith:'Faith Journey',share:'Share Review',privacy:'Privacy'}[item]}</button>)}</nav>
    <p className={styles.status} role="status" aria-live="polite" aria-atomic="true">{state.status==='ready'?'A short-lived owner-only server projection is ready. No content was changed.':messages[state.status]}</p>
    {state.status==='ready'?<ServerMemberPanels key={`${state.data.boundary}:${state.generation}`} data={state.data} view={view}/>:<PreviewPanel aria-busy={state.status==='loading'}><h2>Private member view unavailable</h2><p>No profile, preferences, private drafts or sharing controls are displayed until a verified server response is complete.</p></PreviewPanel>}
   </main><footer className={styles.footer}>Isolated development review. No production fallback, upload, message, share event, course write or saved setting. Unknown sharing consent always blocks sharing.</footer>
  </div></div>;
}
export function ServerMemberPanels({data,view}:Readonly<{data:ServerMemberSnapshot;view:View}>){
 return <div><div hidden={view!=='dashboard'} className={styles.panel}><PreviewPanel><h2>Your member card</h2><p>{data.identity.value.displayName}</p><p>Owner-only profile summary. No contact details, role, inviter, private notes or entitlement information is included.</p>{data.profile.status==='ready'?<dl><dt>Initials</dt><dd>{data.profile.value.initials}</dd><dt>Onboarding state</dt><dd>{data.profile.value.onboardingStatus}</dd></dl>:<p>{data.profile.status==='missing'?'No profile was returned.':'The profile summary is unavailable.'}</p>}</PreviewPanel><PreviewPanel><h2>Your next step</h2><p>Course progress summary is unavailable in this read slice. No progress, enrollment or completion is inferred.</p></PreviewPanel><PreviewPanel><h2>Your profile, your choice</h2><p>Saved photo visibility and Faith Banner: Unknown. Uploads, photo changes and saved banner controls are unavailable.</p><button type="button" disabled>Profile changes unavailable</button></PreviewPanel></div>
  <div hidden={view!=='faith'} className={styles.panel}><PreviewPanel><h2>Your private Faith Journey</h2><p>Saved Scripture preferences, Anchors, Prayer Board, growth areas and personal action plans are unavailable. No saved private content or default preference is invented.</p></PreviewPanel></div>
  <div hidden={view!=='share'} className={styles.panel}><PreviewPanel><h2>Sharing stays intentional</h2><p>My Five recipients, eligible catalog resources and scoped sharing consent are unavailable in this read slice. Selecting a recipient would not establish consent.</p><p>Private contact notes, prayers, growth entries and financial information never enter a share preview.</p><button type="button" disabled>Share confirmation unavailable</button><p>Nothing was sent.</p></PreviewPanel></div>
  <div hidden={view!=='privacy'} className={styles.panel}><PreviewPanel><h2>Your communication preferences</h2>{data.preferences.status==='ready'?<><p>Current owner-only read. These preferences do not grant permission to share a resource or private information.</p><dl>{(['ministryEmail','faithBoostEmail','bookReleaseEmail','partnerEmail','smsUpdates'] as const).map((key,i)=><div key={key}><dt>{['Ministry email','Faith Boost email','Book release email','Partner email','SMS updates'][i]}</dt><dd>{data.preferences.status==='ready'?(data.preferences.value[key]?'Enabled':'Disabled'):'Unknown'}</dd></div>)}</dl><p>No preference can be changed here.</p></>:<p>{data.preferences.status==='missing'?'No preference record was returned.':'Communication preferences are unavailable.'} No consent or default opt-in is inferred.</p>}</PreviewPanel><PreviewPanel><h2>Private by default, without assumptions</h2><p>Live profile-photo, Faith Banner, Prayer Board, growth, Scripture Anchor and My Five visibility: Unknown. No live privacy or permission setting is changed by this page.</p></PreviewPanel></div>
 </div>;
}
