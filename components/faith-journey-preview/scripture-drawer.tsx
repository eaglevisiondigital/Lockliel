'use client';
import { useEffect, useRef, useState } from 'react';
import type { PassageResult, ScriptureAnchor } from '../../lib/faith-journey/contracts';
import { createScriptureAnchorDraft, formatScriptureReference } from '../../lib/faith-journey/index';
import { SYNTHETIC_OWNER } from './preview-model';
import styles from './faith-journey-preview.module.css';
import { readSyntheticPreviewPassage } from './synthetic-scripture';

export type ProviderPreviewMode = 'ready' | 'unavailable' | 'unknown';
export function ScriptureDrawer({ edition, providerMode, idPrefix, onClose, onAnchor }: Readonly<{
  edition: string; providerMode: ProviderPreviewMode; idPrefix: string; onClose: () => void; onAnchor: (anchor: ScriptureAnchor) => boolean;
}>) {
  const dialog = useRef<HTMLDialogElement>(null), title = useRef<HTMLHeadingElement>(null);
  const [passage, setPassage] = useState<PassageResult | null>(null);
  const [reflection, setReflection] = useState(''), [message, setMessage] = useState('');
  useEffect(() => {
    const node = dialog.current;
    const returnTo = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    node?.showModal(); title.current?.focus();
    return () => { node?.close(); if (returnTo?.isConnected) returnTo.focus(); };
  }, []);
  useEffect(() => {
    let active = true;
    void readSyntheticPreviewPassage(edition, providerMode).then(result => { if (active) setPassage(result); });
    return () => { active = false; };
  }, [edition, providerMode]);
  function keepAnchor() {
    if (passage?.status !== 'available') return;
    const anchor = createScriptureAnchorDraft({ id: `fixture-anchor-${Date.now()}`, ownerId: SYNTHETIC_OWNER,
      reference: passage.reference, version: passage.version, reflection });
    const added = onAnchor(anchor);
    setMessage(added ? 'Reference added to memory in this preview. Nothing was saved or shared.' : 'The preview limit is 12 anchors. Remove one before adding another.');
  }
  function keepFocus(event: React.KeyboardEvent<HTMLDialogElement>) {
    if (event.key !== 'Tab') return;
    const controls = Array.from(dialog.current?.querySelectorAll<HTMLElement>('button:not([disabled]), textarea, a[href], select, input:not([disabled])') || []);
    const first = controls[0], last = controls.at(-1);
    if (!first || !last) { event.preventDefault(); title.current?.focus(); return; }
    if (event.shiftKey && (document.activeElement === first || document.activeElement === title.current)) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && (document.activeElement === last || document.activeElement === title.current)) { event.preventDefault(); first.focus(); }
  }
  return <dialog ref={dialog} className={styles.drawer} aria-labelledby={`${idPrefix}-scripture-title`} aria-describedby={`${idPrefix}-scripture-description`} onCancel={event => { event.preventDefault(); onClose(); }} onKeyDown={keepFocus}>
    <div className={styles.drawerHeader}><div><span className={styles.eyebrow}>Scripture reference preview</span><h2 id={`${idPrefix}-scripture-title`} ref={title} tabIndex={-1}>John 3:1-3</h2></div><button className={styles.iconButton} onClick={onClose} aria-label="Close Scripture reference">×</button></div>
    <div className={styles.drawerBody}>
      <p id={`${idPrefix}-scripture-description`} className={styles.notice}>Synthetic text only. These invented placeholders are not Scripture. This drawer makes no network request.</p>
      {!passage && <p role="status">Preparing the synthetic reference…</p>}
      {passage?.status === 'unavailable' && <div role="alert"><h3>Reference unavailable</h3><p>{!edition ? 'Choose a synthetic preferred edition first.' : providerMode !== 'ready' ? 'The synthetic provider is unavailable or its state is unknown.' : 'The selected synthetic edition is unavailable.'} No other edition was substituted.</p><button className={styles.secondary} onClick={onClose}>Return to edition choices</button></div>}
      {passage?.status === 'available' && <>
        <p className={styles.meta}>{edition === 'fixture-alternative' ? 'Synthetic edition B' : 'Synthetic edition A'} · {formatScriptureReference(passage.reference)}</p>
        <ol className={styles.verses}>{passage.verses.map(verse => <li key={`${verse.chapter}:${verse.verse}`}><span>{verse.verse}</span><p>{verse.text}</p></li>)}</ol>
        <p className={styles.meta}>{passage.attribution.map(item => item.label).join(' ')}</p>
        <label className={styles.field} htmlFor={`${idPrefix}-anchor-reflection`}>Synthetic anchor reflection <span>Optional. Do not enter real private information.</span><textarea id={`${idPrefix}-anchor-reflection`} rows={3} maxLength={4000} value={reflection} onChange={event => setReflection(event.target.value)}/></label>
        <button className={styles.primary} onClick={keepAnchor}>Keep reference in this preview</button>
        {message && <p role="status" className={styles.status}>{message}</p>}
      </>}
    </div>
    <div className={styles.drawerFoot}><span>Private by default · Memory only · Sharing unavailable</span><button className={styles.secondary} onClick={onClose}>Close reference</button></div>
  </dialog>;
}
