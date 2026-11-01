"use client";
import { useEffect, useId, useRef, useState } from 'react';
import type { SyntheticContext } from '../../lib/synthetic-contracts/context';
import { changePrivacyIdea, createPrivacyDraft, privacyBoundary, projectOwnerPrivacy } from '../../lib/owner-privacy-preview/model';
import type { PrivacyIdeas, PrivacyScenario } from '../../lib/owner-privacy-preview/model';
import styles from './owner-privacy.module.css';
export type OwnerPrivacyWorkspaceProps=Readonly<{context:SyntheticContext|null;boundaryKey:string;idPrefix?:string}>;
const scenarioCopy={loading:{title:'Privacy review is loading',body:'This is a loading sample. No account setting or privacy status has been read.'},empty:{title:'No sample areas are shown',body:'This is an empty example, not an empty account or a claim that privacy controls do not exist.'},error:{title:'Privacy review is unavailable',body:'This sample could not load. Current live settings remain unknown; unavailable does not mean public.'}} as const;
/** Headless owner information only. The host owns identity, navigation and default-OFF exposure. */
export function OwnerPrivacyWorkspace({context,boundaryKey,idPrefix}:OwnerPrivacyWorkspaceProps) {
 const instance=useId(),prefix=typeof idPrefix==='string'&&/^[A-Za-z][A-Za-z0-9_-]{0,59}$/.test(idPrefix)?idPrefix:`privacy-${instance}`;
 const boundary=privacyBoundary(context,boundaryKey);
 if(!boundary||!context)return <section className={styles.workspace} aria-labelledby={`${prefix}-title`}><div className={styles.panel}><h2 id={`${prefix}-title`}>Owner privacy review unavailable</h2><p>No known owner context is available. No privacy details or controls are shown.</p><p className={styles.muted}>Current live settings are unknown. No account setting was changed.</p></div></section>;
 return <OwnerBoundary key={boundary} context={context} prefix={prefix}/>;
}
function OwnerBoundary({context,prefix}:{context:SyntheticContext;prefix:string}) {
 const [draft,setDraft]=useState(()=>createPrivacyDraft(context));
 const [scenario,setScenario]=useState<PrivacyScenario>('ready');
 const [notice,setNotice]=useState('');
 const [resetEpoch,setResetEpoch]=useState(0);
 const title=useRef<HTMLHeadingElement>(null);
 const model=projectOwnerPrivacy(context,draft,scenario);
 useEffect(()=>{if(resetEpoch>0)title.current?.focus();},[resetEpoch]);
 function update(field:keyof PrivacyIdeas,value:string) {
  const result=changePrivacyIdea(context,draft,{field,value},draft?.revision);
  if(result.status!=='local-idea'){setNotice('That local idea is unavailable. No setting, consent or permission changed.');return;}
  setDraft(result.draft);setNotice('Local idea updated in this view only. No live setting, consent, audience or communication preference changed.');
 }
 function reset() {
  setDraft(createPrivacyDraft(context));setScenario('ready');setResetEpoch(value=>value+1);setNotice('All local ideas are private again. No live setting changed and nothing was saved or sent.');
 }
 return <section className={styles.workspace} aria-labelledby={`${prefix}-title`}>
  <div className={styles.intro}><div><p className={styles.eyebrow}>YOUR PRIVACY</p><h2 ref={title} tabIndex={-1} id={`${prefix}-title`}>Your space.<br/><span>Your boundaries.</span></h2><p>Understand what stays personal and what needs a separate, intentional decision.</p></div><span className={styles.pill}>Owner-only local preview</span></div>
  <aside className={styles.liveNotice} aria-labelledby={`${prefix}-live-title`}><span className={styles.lock} aria-hidden="true">◇</span><div><h3 id={`${prefix}-live-title`}>Current live settings: Unknown</h3><p>This panel is not connected to your account settings. Every status below describes a synthetic sample, never a verified live privacy state.</p></div></aside>
  <div className={styles.legend} aria-label="Privacy status meanings"><span><i aria-hidden="true"/>Private in this sample</span><span><i aria-hidden="true"/>Explicit review required</span><span><i aria-hidden="true"/>Live state unknown</span></div>
  <details className={styles.scenarios}><summary>Review sample states</summary><label htmlFor={`${prefix}-scenario`}>Sample state</label><select id={`${prefix}-scenario`} value={scenario} onChange={event=>{setScenario(event.target.value as PrivacyScenario);setNotice('Sample state changed. No live privacy setting was read or changed.');}}><option value="ready">Ready sample</option><option value="loading">Loading sample</option><option value="empty">Empty sample</option><option value="error">Unavailable sample</option></select><p>These examples do not load account data or change a service setting.</p></details>
  <p className={styles.notice} role="status" aria-live="polite" aria-atomic="true">{notice}</p>
  {model.status==='ready'?<>
   <div className={styles.sectionTitle}><h3>Eight boundaries to understand</h3><span>{model.localIdeas?`${model.localIdeas} local ${model.localIdeas===1?'idea':'ideas'}`:'Private starting point'}</span></div>
   <div className={styles.grid}>{model.areas.map((area,index)=><article className={styles.card} key={area.id} aria-labelledby={`${prefix}-${area.id}-title`}>
    <div className={styles.cardTop}><span className={styles.number} aria-hidden="true">{String(index+1).padStart(2,'0')}</span><span className={`${styles.badge} ${area.localStatus.includes('idea')?styles.reviewBadge:''}`}>{area.localStatus}</span></div>
    <h3 id={`${prefix}-${area.id}-title`}>{area.title}</h3><p className={styles.description}>{area.description}</p>
    {area.id==='photo'||area.id==='faithBanner'?<div className={styles.field}><label htmlFor={`${prefix}-${area.id}-idea`}>{area.id==='photo'?'Photo':'Faith Banner'} audience idea</label><select id={`${prefix}-${area.id}-idea`} value={model.ideas[area.id]} onChange={event=>update(area.id as 'photo'|'faithBanner',event.target.value)} aria-describedby={`${prefix}-${area.id}-help`}><option value="private">Only me in this sample</option><option value="approved-connections">Review an approved-connections idea</option></select><small id={`${prefix}-${area.id}-help`}>Memory only. Selecting an audience does not share anything or grant access.</small></div>:
     area.id==='sharing'?<div className={styles.field}><label htmlFor={`${prefix}-sharing-idea`}>Sharing review idea</label><select id={`${prefix}-sharing-idea`} value={model.ideas.sharing} onChange={event=>update('sharing',event.target.value)} aria-describedby={`${prefix}-sharing-help`}><option value="not-given">No consent created</option><option value="review-idea">Explore an explicit review idea</option></select><small id={`${prefix}-sharing-help`}>This never accepts, creates or changes consent for you or another person.</small></div>:
     area.id==='communications'?<div className={styles.field}><label htmlFor={`${prefix}-communications-idea`}>Communication preference idea</label><select id={`${prefix}-communications-idea`} value={model.ideas.communications} onChange={event=>update('communications',event.target.value)} aria-describedby={`${prefix}-communications-help`}><option value="not-connected">No channel connected</option><option value="review-idea">Explore a preference review idea</option></select><small id={`${prefix}-communications-help`}>No real subscription, unsubscribe choice, email, text or in-app preference changes.</small></div>:<p className={styles.readOnly}>Informative only. No content is loaded or shared.</p>}
    <p className={styles.rule}>{area.rule}</p><dl className={styles.liveStatus}><div><dt>Current live status</dt><dd>Unknown</dd></div></dl>
   </article>)}</div>
   <aside className={styles.boundary}><h3>A local idea is not a permission.</h3><p>Private prayers, growth, anchors, relationship information and contact details never become visible to an inviter, leader or group through this panel. Applications, tags and audience ideas do not grant leadership.</p></aside>
  </>:model.status==='unavailable'?<div className={styles.panel}><h3>Privacy information unavailable</h3><p>No status or control is shown. Current live settings remain unknown.</p></div>:<div className={styles.panel} aria-busy={model.status==='loading'}><h3>{scenarioCopy[model.status].title}</h3><p>{scenarioCopy[model.status].body}</p><button type="button" className={styles.secondary} onClick={()=>{setScenario('ready');setResetEpoch(value=>value+1);setNotice('Ready sample restored locally. No account data was loaded.');}}>Return to ready sample</button></div>}
  <div className={styles.actions}><button type="button" className={styles.primary} onClick={reset}>Reset local ideas</button><p>Reset clears this preview only. Refreshing or changing owner/context also clears local ideas.</p></div>
  <p className={styles.footer}>No live settings are saved. No uploads, sharing, messages, exports, deletion, account changes or operations are available here.</p>
 </section>;
}
