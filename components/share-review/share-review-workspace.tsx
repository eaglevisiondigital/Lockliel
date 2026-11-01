"use client";

import { useEffect, useId, useRef, useState } from 'react';
import type { SyntheticContext } from '../../lib/synthetic-contracts/context';
import { buildSharePreview, CHANNEL_LABELS, confirmSharePreview, createShareSnapshot, projectShareWorkspace, shareBoundary } from '../../lib/share-review/adapter';
import type { ShareChannel, SharePreview, ShareScenario } from '../../lib/share-review/adapter';
import { isMemberReadModel } from '../../lib/member-read-model/validation';
import type { MemberReadModel } from '../../lib/member-read-model/contracts';
import styles from './share-review.module.css';

export type ShareReviewWorkspaceProps=Readonly<{context:SyntheticContext|null;boundaryKey:string;idPrefix?:string}>;
type Step='choose'|'details'|'review'|'complete';
const SCENARIO_LABELS:Readonly<Record<ShareScenario,string>>={ready:'Ready sample',loading:'Loading sample',empty:'Empty sample',error:'Unavailable sample',revoked:'Consent withdrawn',stale:'Resource changed'};
const SCENARIO_COPY:Readonly<Record<Exclude<ShareScenario,'ready'>,{title:string;body:string}>>={
 loading:{title:'Making space for your next choice',body:'This is a loading sample. No resources or recipient choices are ready yet.'},
 empty:{title:'A quiet moment is okay, too',body:'This sample has no resources to share. There is no need to rush or choose something else.'},
 error:{title:'The preview is unavailable',body:'This sample could not load. An unavailable response is different from an empty list.'},
 revoked:{title:'This share preview is paused',body:'The sample recipient withdrew consent. Selecting their name cannot restore permission.'},
 stale:{title:'The resource changed',body:'An earlier review is no longer current. Return to the ready sample to review the latest version.'},
};

/** Headless local module. The host owns its shell, navigation, feature gate and identity. */
export function ShareReviewWorkspace(props:ShareReviewWorkspaceProps | Readonly<{readModel:MemberReadModel}>) {
 if (!props) return <section role="status"><h2>Member view unavailable</h2><p>No private details or controls are shown.</p></section>;
 if ('readModel' in props && !isMemberReadModel(props.readModel)) return <section role="status"><h2>Member information unavailable</h2><p>No private details or controls are shown.</p></section>;
 return 'readModel' in props ? <ReadShareWorkspace model={props.readModel}/> : <SyntheticShareReviewWorkspace {...props}/>;
}
function SyntheticShareReviewWorkspace({context,boundaryKey,idPrefix}:ShareReviewWorkspaceProps) {
 const instance=useId();
 const prefix=typeof idPrefix==='string'&&/^[A-Za-z][A-Za-z0-9_-]{0,59}$/.test(idPrefix)?idPrefix:`share-${instance}`;
 const boundary=shareBoundary(context,boundaryKey);
 if(!boundary||!context)return <section className={styles.workspace} aria-labelledby={`${prefix}-title`}><div className={styles.unavailable}><h2 id={`${prefix}-title`}>Share review unavailable</h2><p>A verified synthetic review context is required. No recipients, private drafts or sharing controls are shown.</p><p>Nothing was sent.</p></div></section>;
 return <ShareBoundary key={boundary} context={context} prefix={prefix}/>;
}
function ShareBoundary({context,prefix}:{context:SyntheticContext;prefix:string}) {
 const [scenario,setScenario]=useState<ShareScenario>('ready');
 const [step,setStep]=useState<Step>('choose');
 const [resourceId,setResource]=useState('');
 const [contactId,setContact]=useState('');
 const [channel,setChannel]=useState<ShareChannel>('in-app');
 const [message,setMessage]=useState('');
 const [preview,setPreview]=useState<SharePreview|null>(null);
 const [confirmed,setConfirmed]=useState(false);
 const [notice,setNotice]=useState('');
 const [errorFocusEpoch,setErrorFocusEpoch]=useState(0);
 const [headingEpoch,setHeadingEpoch]=useState(0);
 const heading=useRef<HTMLHeadingElement>(null);
 const alert=useRef<HTMLParagraphElement>(null);
 const snapshot=createShareSnapshot(context,scenario);
 const model=projectShareWorkspace(context,snapshot);
 useEffect(()=>{heading.current?.focus();},[step,headingEpoch]);
 useEffect(()=>{if(errorFocusEpoch>0)alert.current?.focus();},[errorFocusEpoch]);
 function clearDraft() {
  setResource('');setContact('');setChannel('in-app');setMessage('');setPreview(null);setConfirmed(false);setStep('choose');setHeadingEpoch(value=>value+1);setNotice('The local draft was cleared. Nothing was saved or sent.');
 }
 function buildPreview() {
  const result=buildSharePreview(context,snapshot,{resourceId,contactId,channel,message});
  setConfirmed(false);
  if(result.status!=='draft-preview'){setNotice('The resource, recipient permission or message could not be verified. Use synthetic text without contact details or links. Nothing was sent.');setErrorFocusEpoch(value=>value+1);return;}
  setPreview(result.preview);setNotice('');setStep('review');
 }
 function confirmPreview() {
  // Read the CURRENT context/scenario snapshot, never a cached eligibility boolean.
  const result=confirmSharePreview(context,createShareSnapshot(context,scenario),preview,confirmed);
  if(result.status!=='preview-confirmed'){setConfirmed(false);setNotice('This preview has changed or permission is no longer current. Return to the resource choices and review again. Nothing was sent.');setErrorFocusEpoch(value=>value+1);return;}
  setPreview(result.preview);setConfirmed(false);setNotice('');setStep('complete');
 }
 const hasDraft=step!=='choose'||!!resourceId||!!message;
 const frozen=step==='review'||step==='complete';
 const stepIndex=step==='choose'?0:step==='details'?1:2;
 return <section className={styles.workspace} aria-labelledby={`${prefix}-title`}>
  <div className={styles.intro}><div><p className={styles.eyebrow}>SHARE CENTER</p><h2 id={`${prefix}-title`}>A little encouragement.<br/><span>A thoughtful next step.</span></h2><p>Choose a sample resource and take a moment to review it with care.</p></div><span className={styles.pill}>Private local preview</span></div>
  <aside className={styles.boundary}><strong>Nothing leaves this page.</strong><p>All people and resources are invented samples. No account, email, text or in-app message is created. Use synthetic examples only.</p></aside>
  <ol className={styles.steps} aria-label="Share review steps">{['Choose a resource','Make it personal','Review with care'].map((label,i)=><li key={label} aria-current={stepIndex===i?'step':undefined}><span aria-hidden="true">{i+1}</span>{label}</li>)}</ol>
  <details className={styles.scenarios}><summary>Review sample states</summary><label htmlFor={`${prefix}-scenario`}>Sample state</label><select id={`${prefix}-scenario`} value={scenario} onChange={event=>{setScenario(event.target.value as ShareScenario);setConfirmed(false);setNotice('Sample state changed. This does not change a real permission or resource.');}}>{Object.entries(SCENARIO_LABELS).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select><p>Changing a sample after preparing a preview tests its final check. These controls never change a live setting.</p></details>
  <p ref={alert} tabIndex={-1} role={notice?'alert':undefined} className={styles.notice}>{notice}</p>
  {scenario!=='ready'&&<aside className={styles.stateNotice} role="status"><strong>{SCENARIO_COPY[scenario].title}</strong><p>{SCENARIO_COPY[scenario].body}</p>{!frozen&&<button type="button" className={styles.secondary} onClick={()=>{setScenario('ready');setConfirmed(false);setNotice('Ready sample restored. Nothing was loaded from a service.');}}>Try the ready sample</button>}</aside>}
  {step==='choose'&&<div className={styles.panel} aria-busy={model.status==='loading'}>
   <h3 ref={heading} tabIndex={-1}>Choose something encouraging</h3>
   {model.status==='ready'?<><p className={styles.muted}>A resource can open a conversation. It never creates course access, leadership or a contact permission.</p>
   <fieldset className={styles.resourceChoices}><legend className={styles.srOnly}>Choose a sample resource</legend>{model.resources.map((resource,i)=><label className={`${styles.resourceCard} ${resourceId===resource.id?styles.selected:''}`} key={resource.id}>
    <input type="radio" name={`${prefix}-resource`} checked={resourceId===resource.id} value={resource.id} onChange={()=>{setResource(resource.id);setPreview(null);setConfirmed(false);setNotice('');}}/><span className={`${styles.resourceArt} ${i%2?styles.alternate:''}`} aria-hidden="true"><span className={styles.book}><span>REACH.<br/>ENCOURAGE.<br/>CONNECT.</span></span><i/></span>
    <span className={styles.cardBody}><span className={styles.cardMeta}>{resource.audience} · {resource.kindLabel}</span><strong>{resource.label.replace(/^Synthetic /,'')}</strong><span>{resource.description}</span><span className={styles.cardAction}>{resourceId===resource.id?'Selected for review':'Choose this sample'} <span aria-hidden="true">↗</span></span></span>
   </label>)}</fieldset><div className={styles.actions}><button type="button" className={styles.primary} disabled={!resourceId} onClick={()=>{setStep('details');setNotice('');}}>Continue to details <span aria-hidden="true">→</span></button>{hasDraft&&<button type="button" className={styles.textButton} onClick={clearDraft}>Clear draft</button>}</div></>:
    <p className={styles.muted}>{model.status==='blocked'?'Resource and recipient permission are unavailable for this context. No private choices are shown.':model.status==='empty'?'No eligible sample resources and recipients are available.':scenario==='ready'?'This preview is unavailable.':'Choose the ready sample to continue.'}</p>}
  </div>}
  {step==='details'&&<div className={styles.panel}>
   <h3 ref={heading} tabIndex={-1}>Make room for the person</h3><p className={styles.muted}>Choosing a recipient is not consent. The sample’s current resource-sharing permission is checked again before confirmation.</p>
   <div className={styles.twoColumns}><div className={styles.field}><label htmlFor={`${prefix}-recipient`}>Sample recipient</label><select id={`${prefix}-recipient`} value={contactId} onChange={event=>{setContact(event.target.value);setConfirmed(false);setPreview(null);}} aria-describedby={`${prefix}-recipient-help`}><option value="">Choose a synthetic person</option>{model.recipients.map(recipient=><option key={recipient.id} value={recipient.id}>{recipient.label}</option>)}</select><small id={`${prefix}-recipient-help`}>Only sample names are shown. No phone number, address, notes or private reflections are used.</small></div>
    <div className={styles.field}><label htmlFor={`${prefix}-channel`}>Preview format</label><select id={`${prefix}-channel`} value={channel} onChange={event=>{setChannel(event.target.value as ShareChannel);setConfirmed(false);setPreview(null);}} aria-describedby={`${prefix}-channel-help`}>{Object.entries(CHANNEL_LABELS).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select><small id={`${prefix}-channel-help`}>A format is not email or SMS permission. No recipient address is available and no delivery is connected.</small></div></div>
   <div className={styles.field}><label htmlFor={`${prefix}-message`}>An optional note</label><textarea id={`${prefix}-message`} value={message} maxLength={240} rows={3} onChange={event=>{setMessage(event.target.value);setConfirmed(false);setPreview(null);}} aria-describedby={`${prefix}-message-help`} placeholder="Write an invented encouragement, or leave this blank."/><small id={`${prefix}-message-help`}>Synthetic examples only. No real names, contact details, links, prayer requests or private information. {message.length}/240 characters.</small><button type="button" className={styles.textButton} onClick={()=>{setMessage('Synthetic example: I thought this might bring a little encouragement to your day.');setConfirmed(false);setPreview(null);}}>Use a sample note</button></div>
   <div className={styles.actions}><button type="button" className={styles.primary} disabled={!contactId||model.status!=='ready'} onClick={buildPreview}>Review the preview <span aria-hidden="true">→</span></button><button type="button" className={styles.secondary} onClick={()=>{setStep('choose');setConfirmed(false);setNotice('');}}>Back to resources</button><button type="button" className={styles.textButton} onClick={clearDraft}>Cancel and clear draft</button></div>
  </div>}
  {step==='review'&&preview&&<div className={styles.panel}>
   <h3 ref={heading} tabIndex={-1}>Take one last look</h3><p className={styles.muted}>This is a complete local preview. It is not a sent message or proof of delivery.</p><PreviewSummary preview={preview}/>
   <label className={styles.confirmation}><input type="checkbox" checked={confirmed} onChange={event=>setConfirmed(event.target.checked)}/><span>I have reviewed this resource, sample recipient, format and note. I understand that nothing will be sent.</span></label>
   <div className={styles.actions}><button type="button" className={styles.primary} disabled={!confirmed} onClick={confirmPreview}>Confirm local preview</button><button type="button" className={styles.secondary} onClick={()=>{setStep('details');setConfirmed(false);setPreview(null);setNotice('');}}>Back to details</button><button type="button" className={styles.textButton} onClick={clearDraft}>Cancel and clear draft</button></div>
  </div>}
  {step==='complete'&&preview&&<div className={`${styles.panel} ${styles.complete}`}>
   <span className={styles.completeMark} aria-hidden="true">✓</span><h3 ref={heading} tabIndex={-1}>Nothing was sent.</h3><p>You reviewed an encouragement with care. This result lives only on this page and is cleared when you reset, refresh or change context.</p><PreviewSummary preview={preview}/><p className={styles.muted}>No message, notification, link, sharing event or saved record was created. No consent, access or setting changed.</p><button type="button" className={styles.primary} onClick={clearDraft}>Start a fresh preview</button>
  </div>}
  <p className={styles.footer}>Private prayers, personal growth, assessments, notes, finances and contact details stay outside this review. Inviter, campaign, mentor and group labels never grant sharing permission.</p>
 </section>;
}
function PreviewSummary({preview}:{preview:SharePreview}) {
 return <div className={styles.preview}><span className={styles.eyebrow}>YOUR LOCAL PREVIEW</span><h4>{preview.resourceLabel.replace(/^Synthetic /,'')}</h4><dl><div><dt>Type</dt><dd>{preview.resourceType}</dd></div><div><dt>For</dt><dd>{preview.recipientLabel}</dd></div><div><dt>Format</dt><dd>{preview.channelLabel}</dd></div><div><dt>Delivery</dt><dd>Not connected. Nothing will be sent.</dd></div></dl>{preview.message?<blockquote>{preview.message}</blockquote>:<p className={styles.muted}>No optional note added.</p>}<small>Invented resource and recipient. No contact address or protected content is included.</small></div>;
}

/** Existing API shapes do not establish accepted, scoped consent. Selection cannot manufacture it. */
function ReadShareWorkspace({model}:{model:MemberReadModel}){
 const [resource,setResource]=useState(''),[recipient,setRecipient]=useState(''),[message,setMessage]=useState(''),[notice,setNotice]=useState('');
 const heading=useRef<HTMLHeadingElement>(null);
 const catalog=model.catalog,relationships=model.myFive;
 return <section className={styles.workspace} aria-labelledby="offline-share-title"><div className={styles.intro}><div><p className={styles.eyebrow}>SHARE CENTER</p><h2 id="offline-share-title">A thoughtful next step.</h2><p>Review resource and relationship projections together, without turning selection into consent.</p></div><span className={styles.pill}>Offline read contract</span></div><aside className={styles.boundary}><strong>Nothing leaves this page.</strong><p>Current resource-sharing consent is unverified. No message, link, sharing event or completed share can be created.</p></aside>
 <div className={styles.panel}><h3 ref={heading} tabIndex={-1}>Resource and recipient review</h3><div className={styles.twoColumns}><div className={styles.field}><label htmlFor="offline-share-resource">Resource fixture</label><select id="offline-share-resource" value={resource} onChange={event=>{setResource(event.target.value);setNotice('Selection changed locally. Sharing permission remains unavailable.');}} disabled={catalog.status!=='ready'}><option value="">Choose a sample resource</option>{catalog.status==='ready'&&catalog.value.map(item=><option value={item.id} key={item.id}>{item.title}</option>)}</select>{catalog.status==='unavailable'&&<p>{catalog.message}</p>}</div><div className={styles.field}><label htmlFor="offline-share-recipient">Existing My Five relationship fixture</label><select id="offline-share-recipient" value={recipient} onChange={event=>{setRecipient(event.target.value);setNotice('A recipient choice is not permission to contact them.');}} disabled={relationships.status!=='ready'}><option value="">Choose a sample relationship</option>{relationships.status==='ready'&&relationships.value.map(person=><option value={person.id} key={person.id}>{person.label}</option>)}</select>{relationships.status==='unavailable'&&<p>{relationships.message}</p>}</div></div>
 {catalog.status==='ready'&&resource&&catalog.value.filter(item=>item.id===resource).map(item=><div key={item.id} className={styles.preview}><h4>{item.title}</h4><p>{item.description}</p><p>Type: {item.type}. Resource sharing eligibility: Unverified.</p></div>)}
 <div className={styles.field}><label htmlFor="offline-share-note">Optional invented draft</label><textarea id="offline-share-note" rows={3} maxLength={240} value={message} onChange={event=>setMessage(event.target.value)} aria-describedby="offline-share-help"/><small id="offline-share-help">Memory only. Do not enter real contact details, prayers or private information. Draft content is never passed to an adapter.</small></div>
 <aside className={styles.stateNotice}><strong>Consent must be verified first.</strong><p>{model.sharing.status==='unavailable'?model.sharing.message:'Sharing permission unavailable.'}</p><p>The existing follow-up flag and communication preferences do not prove current, scoped resource-share consent.</p></aside><div className={styles.actions}><button type="button" className={styles.primary} disabled>Share preview unavailable</button><button type="button" className={styles.secondary} onClick={()=>{setResource('');setRecipient('');setMessage('');setNotice('Local choices and draft cleared. Nothing was sent.');heading.current?.focus();}}>Cancel and clear draft</button></div><p className={styles.notice} role="status" aria-live="polite">{notice}</p></div><p className={styles.footer}>No private notes, prayer or growth content, financial data, contact details, protected files or internal entitlements enter this review.</p></section>;
}
