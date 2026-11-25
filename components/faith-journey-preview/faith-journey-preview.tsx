"use client";
import { useState } from 'react';
import { FaithJourneyWorkspace } from './faith-journey-workspace';
import type { FaithEditionPreference, FaithWorkspaceIdentity, FaithWorkspaceIntent, FaithProviderPreviewMode } from './workspace-contract';
import styles from './faith-journey-preview.module.css';

/** Standalone local review shell. Integrated hosts import FaithJourneyWorkspace instead. */
export default function FaithJourneyPreview() {
  const [identity, setIdentity] = useState<FaithWorkspaceIdentity>({status: 'synthetic-owner', boundaryKey: 'standalone-owner'});
  const [editionPreference, setEditionPreference] = useState<FaithEditionPreference>({status: 'unselected'});
  const [providerMode, setProviderMode] = useState<FaithProviderPreviewMode>('ready');
  const [resetKey, setResetKey] = useState(0);
  function reset() {setResetKey(value => value + 1); setEditionPreference({status: 'unselected'});}
  function onIntent(intent: FaithWorkspaceIntent) {
    if (intent.type === 'reset-requested') reset();
    else setEditionPreference(intent.editionId === null ? {status: 'unselected'} : {status: 'selected', editionId: intent.editionId});
  }
  return <div className={styles.preview}>
    <a className={styles.skip} href="#faith-preview-main" onClick={() => document.getElementById('faith-preview-main')?.focus()}>Skip to Faith Journey preview</a>
    <div className={styles.prototypeBar}><strong>ISOLATED SYNTHETIC PREVIEW</strong><span>Memory only. Refresh resets everything. No accounts, cloud saving, sharing or messages.</span></div>
    <div className={styles.shell}><header className={styles.header}><div className={styles.brand}>Lockliel<span>REACH. TEACH. TRAIN. DISCIPLE. MULTIPLY.</span></div><button className={styles.secondary} onClick={() => {reset(); setProviderMode('ready');}}>Reset preview</button></header>
      <main id="faith-preview-main" tabIndex={-1} className={styles.main}><div className={styles.welcome}><div><span className={styles.eyebrow}>A little space to reflect and grow</span><h1>Your personal faith journey</h1><p>Explore with synthetic examples only. Do not enter real prayers, health details or personal information.</p></div></div>
        <section className={styles.reviewControls} aria-labelledby="preview-controls"><h2 id="preview-controls">Review controls</h2>
          <div><label htmlFor="faith-preview-context">Identity context</label><select id="faith-preview-context" value={identity.status === 'synthetic-owner' ? 'owner' : 'unknown'} onChange={event => {reset(); setIdentity(event.target.value === 'owner' ? {status: 'synthetic-owner', boundaryKey: 'standalone-owner'} : {status: 'unknown'});}}><option value="owner">Synthetic owner context</option><option value="unknown">Unknown context</option></select></div>
          <div><label htmlFor="faith-preview-provider">Synthetic provider state</label><select id="faith-preview-provider" value={providerMode} onChange={event => setProviderMode(event.target.value as FaithProviderPreviewMode)}><option value="ready">Ready</option><option value="unavailable">Unavailable</option><option value="unknown">Unknown</option></select></div>
          <p>These controls test presentation, not authentication or permissions.</p>
        </section>
        <FaithJourneyWorkspace identity={identity} editionPreference={editionPreference} onIntent={onIntent} idPrefix="standalone-faith" providerMode={providerMode} resetKey={resetKey}/>
      </main><footer className={styles.footer}>Synthetic review surface only. No real member information. No change to either published website.</footer>
    </div>
  </div>;
}
