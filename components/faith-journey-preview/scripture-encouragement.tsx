'use client';
import { useEffect, useState } from 'react';
import type { PassageResult } from '../../lib/faith-journey/contracts';
import { formatScriptureReference } from '../../lib/faith-journey/index';
import { readSyntheticPreviewPassage } from './synthetic-scripture';
import type { FaithProviderPreviewMode } from './workspace-contract';
import styles from './faith-journey-preview.module.css';

/** Presentation only: fixed versioned synthetic reference, never a private-data recommendation. */
export function ScriptureEncouragement({edition, providerMode, id, onOpenReference}: Readonly<{
  edition: string; providerMode: FaithProviderPreviewMode; id: string; onOpenReference: () => void;
}>) {
  const [passage, setPassage] = useState<PassageResult | null>(null);
  useEffect(() => {
    let active = true;
    void readSyntheticPreviewPassage(edition, providerMode).then(result => {if (active) setPassage(result);});
    return () => {active = false;};
  }, [edition, providerMode]);
  return <section className={`${styles.panel} ${styles.encouragement}`} aria-labelledby={id}>
    <span className={styles.eyebrow}>A reference to explore, at your pace</span><h3 id={id}>Scripture-based encouragement preview</h3>
    <p>This shows a possible encouragement presentation using invented placeholders. It is not Scripture, advice or a personalized recommendation.</p>
    {!passage && <p role="status">Preparing the synthetic reference…</p>}
    {passage?.status === 'unavailable' && <p role="status">Encouragement reference unavailable. Choose an available synthetic edition; no substitute or inferred message is shown.</p>}
    {passage?.status === 'available' && <>
      <p className={styles.meta}>{formatScriptureReference(passage.reference)} · {edition === 'fixture-alternative' ? 'Synthetic edition B' : 'Synthetic edition A'} · {passage.version.edition}</p>
      <blockquote className={styles.encouragementText}>{passage.verses[0].text}</blockquote>
      <p className={styles.meta}>{passage.attribution.map(item => item.label).join(' ')}</p>
      <button className={styles.secondary} aria-haspopup="dialog" onClick={onOpenReference}>Explore this reference</button>
    </>}
  </section>;
}
