"use client";
import { useReducer, useState } from 'react';
import { MemberExperienceWorkspace } from '../member-experience-preview/member-experience-workspace';
import type { MemberWorkspaceDisplayModel } from '../member-experience-preview/member-display-contract';
import { FaithJourneyWorkspace } from '../faith-journey-preview/faith-journey-workspace';
import { initialReviewState, reduceReviewState, reviewIdentity } from '../../lib/member-review/review-policy';
import type { ReviewState } from '../../lib/member-review/review-policy';
import { ShareReviewWorkspace } from '../share-review/share-review-workspace';
import { LOCKLIEL_ORG, SYNTHETIC_SCHEMA } from '../../lib/synthetic-contracts/context';
import type { SyntheticContext } from '../../lib/synthetic-contracts/context';
import styles from './member-review.module.css';

/** Synthetic host only. No account/session request, persistence or protected information. */
export default function MemberReviewShell({initialState=initialReviewState(),shareReviewEnabled=false}:Readonly<{initialState?:ReviewState;shareReviewEnabled?:boolean}>){
  const [state,dispatch]=useReducer(reduceReviewState,initialState);
  const [notice,setNotice]=useState('Choose a synthetic review context. This page does not sign anyone in.');
  const identity=reviewIdentity(state);
  const view=state.view==='share'&&!shareReviewEnabled?'dashboard':state.view;
  const shareContext:SyntheticContext|null=identity.status==='unknown'?null:{schemaVersion:SYNTHETIC_SCHEMA,mode:'synthetic',organizationId:LOCKLIEL_ORG,actorId:state.actor==='member-b'?'synthetic-b':'synthetic-a',aal:1,sessionActive:true,grants:['member:read','connections:read','connections:share']};
  const display:MemberWorkspaceDisplayModel={member:{displayName:state.actor==='member-b'?'Riley Example':'Jordan Example',initials:state.actor==='member-b'?'RE':'JE',locationLabel:'Sample City',faithBanner:'Take the next faithful step.'},nextStep:{status:'ready',title:'Make a little room to grow.',description:'Review a small next step, or open the private Faith Journey example. Nothing here changes a course, account or permission.',actionLabel:'Preview a next step',supportingLabel:'Synthetic example. No live course progress.'}};
  const reset=()=>{dispatch({type:'reset'});setNotice('Review reset. All contexts, preferences and in-memory drafts are cleared.');};
  return <div className={styles.reviewRoot}>
    <a className={styles.skip} href="#member-review-main" onClick={()=>document.getElementById('member-review-main')?.focus()}>Skip to My Lockliel review</a>
    <div className={styles.notice}><strong>LOCAL INTEGRATION REVIEW</strong><span>Synthetic data only. Memory only. No account, upload, sharing or cloud saving.</span></div>
    <div className={styles.shell}>
      <header className={styles.header}><div><strong>Lockliel</strong><span>MY LOCKLIEL</span></div><button type="button" onClick={reset}>Reset review</button></header>
      <main id="member-review-main" tabIndex={-1}>
        <div className={styles.welcome}><p>REACH. TEACH. TRAIN. DISCIPLE. MULTIPLY.</p><h1>A place to grow, at your pace.</h1><p>One member workspace, with intentional privacy and honest next steps.</p></div>
        <section className={styles.controls} aria-labelledby="review-context-heading"><h2 id="review-context-heading">Review context</h2>
          <label htmlFor="review-actor">Synthetic identity context</label><select id="review-actor" value={state.actor} aria-describedby="review-identity-help" onChange={event=>{dispatch({type:'actor',value:event.target.value});setNotice('Context changed. Previous private drafts and edition preferences were cleared.');}}>
            <option value="unselected">Unknown context</option><option value="member-a">Synthetic member A</option><option value="member-b">Synthetic member B</option>
          </select><p id="review-identity-help">These are invented review cases, not authenticated users or permission grants. Do not enter real personal information.</p>
        </section>
        <nav className={styles.navigation} aria-label="Integrated member review sections">
          <button type="button" disabled={identity.status==='unknown'} aria-current={view==='dashboard'?'page':undefined} onClick={()=>dispatch({type:'view',value:'dashboard'})}>Dashboard</button>
          <button type="button" disabled={identity.status==='unknown'} aria-current={view==='faith'?'page':undefined} onClick={()=>dispatch({type:'view',value:'faith'})}>Faith Journey</button>
          {shareReviewEnabled&&<button type="button" disabled={identity.status==='unknown'} aria-current={view==='share'?'page':undefined} onClick={()=>dispatch({type:'view',value:'share'})}>Share Review</button>}
        </nav>
        <p className={styles.status} role="status" aria-live="polite">{notice}</p>
        {identity.status==='unknown'?<section className={styles.controls}><h2>Private workspace unavailable</h2><p>Choose an invented review case to explore. No member information or private forms are loaded for an unknown context.</p></section>:<div key={identity.boundaryKey}>
          <div hidden={view!=='dashboard'} className={styles.panel}><MemberExperienceWorkspace identity={identity} displayModel={display} resetKey={`review-${state.epoch}`} idPrefix="integrated-member" onIntent={()=>setNotice('A local member action was reviewed. No course opened, message sent or permission changed.')}/></div>
          <div hidden={view!=='faith'} className={styles.panel}><FaithJourneyWorkspace identity={identity} editionPreference={state.editionId?{status:'selected',editionId:state.editionId}:{status:'unselected'}} idPrefix="integrated-faith" resetKey={`review-${state.epoch}`} providerMode="ready" onIntent={intent=>{if(intent.type==='preferred-edition-change-requested'){dispatch({type:'edition',value:intent.editionId||''});setNotice('Synthetic edition preference changed for this page visit only.');}else reset();}}/></div>
          {shareReviewEnabled&&<div hidden={view!=='share'} className={styles.panel}><ShareReviewWorkspace context={shareContext} boundaryKey={identity.boundaryKey} idPrefix="integrated-share"/></div>}
        </div>}
      </main>
      <footer className={styles.footer}>A review candidate, not a connected member service. Inviter, campaign, mentor/group and permissions remain separate. Refreshing clears this visit.</footer>
    </div>
  </div>;
}
