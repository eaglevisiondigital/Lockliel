"use client";

import { useState } from "react";
import styles from "./member-experience-preview.module.css";
import { PreviewPanel, PreviewSelect, SignupStatusCard } from "./member-components";
import { MemberExperienceWorkspace } from "./member-experience-workspace";
import type { MemberWorkspaceDisplayModel } from "./member-display-contract";
import { FAITH_BANNER_OPTIONS } from "./preview-model";
import type { PreviewLoadState, SignupStage } from "./preview-model";
import { SYNTHETIC_MEMBER } from "./synthetic-fixtures";

const STATE_LABELS: Record<PreviewLoadState, string> = {
  ready: "Ready", loading: "Loading", empty: "No recommendation", denied: "Access denied", error: "Unavailable",
};
const SIGNUP_LABELS: Record<SignupStage, string> = {
  "request-received": "Request received", "confirmation-needed": "Confirmation needed", confirmed: "Email confirmed", "signed-in": "Signed in",
};

/** Never import into a live route without a separately reviewed integration assignment. */
export default function MemberExperiencePreview() {
  const [loadState, setLoadState] = useState<PreviewLoadState>("ready");
  const [signupStage, setSignupStage] = useState<SignupStage>("confirmation-needed");
  const [notice, setNotice] = useState("");
  const displayModel: MemberWorkspaceDisplayModel = {
    member: { displayName: SYNTHETIC_MEMBER.displayName, initials: SYNTHETIC_MEMBER.initials,
      locationLabel: SYNTHETIC_MEMBER.locationLabel, faithBanner: FAITH_BANNER_OPTIONS[0] },
    nextStep: loadState === "ready" ? {
      status: "ready", title: "A little time.", accent: "A meaningful next step.",
      description: "Continue your example lesson, then take a moment to reflect. Move at a pace that helps you understand and apply what you learn.",
      supportingLabel: "Getting a Grip · Example lesson · No live progress", actionLabel: "Preview your next step",
    } : { status: loadState },
  };

  return <div className={styles.preview}>
    <a className={styles.skipLink} href="#prototype-main">Skip to preview content</a>
    <div className={styles.prototypeBar}><span className={styles.prototypeDot} aria-hidden="true"/><strong>Design prototype</strong><span>Synthetic information only. Nothing is saved or shared.</span></div>
    <div className={styles.shell}>
      <header className={styles.header}>
        <a href="#prototype-main" className={styles.brand} aria-label="Lockliel member design preview">
          {/* eslint-disable-next-line @next/next/no-img-element -- The standalone harness reuses a local asset without adding a Next image route. */}
          <img src="/lockliel-mark.png" alt="" width="40" height="40"/>
          <span>Lockliel<small>MY LOCKLIEL</small></span>
        </a>
        <nav aria-label="Preview sections"><a href="#prototype-main">Dashboard</a><a href="#prototype-profile">Profile and privacy</a><a href="#prototype-signup">Signup states</a></nav>
        <span className={styles.headerAvatar} role="img" aria-label="Synthetic member Jordan Example">JE</span>
      </header>
      <main id="prototype-main" className={styles.main} tabIndex={-1}>
        <div className={styles.welcome}><div><p className={styles.eyebrow}>A place to grow and help someone grow</p><h1>Welcome back, Jordan<span>.</span></h1><p>One next step. One person encouraged. Room to keep growing.</p></div><span className={styles.privatePill}>◇ Private by choice</span></div>
        <MemberExperienceWorkspace identity={{ status: "synthetic-owner", boundaryKey: "standalone-member-example" }}
          displayModel={displayModel} resetKey="standalone-review-1" idPrefix="prototype"
          onIntent={intent => { if (intent.kind === "member:retry") setLoadState("ready"); }}/>
        <section className={styles.pathSection} aria-labelledby="prototype-paths"><div className={styles.sectionHeading}><h2 id="prototype-paths">Keep growing, your way</h2><span className={styles.quiet}>No scores. No pressure.</span></div>
          <div className={styles.pathGrid}>
            <PreviewPanel><span className={styles.pathIcon} aria-hidden="true">01</span><h3>Grow in the Word</h3><p>Return to a lesson and make space for what you are learning.</p><button type="button" className={styles.textButton} onClick={() => setNotice("Course navigation is a placeholder. Access and progress remain owned by the existing course system.")}>Explore the sample <span aria-hidden="true">↗</span></button></PreviewPanel>
            <PreviewPanel><span className={styles.pathIcon} aria-hidden="true">02</span><h3>Encourage one person</h3><p>Choose a thoughtful next step in My Five, at your own pace.</p><button type="button" className={styles.textButton} onClick={() => setNotice("No contact was opened or messaged. Existing consent rules would still apply.")}>Preview My Five <span aria-hidden="true">↗</span></button></PreviewPanel>
            <PreviewPanel><span className={styles.pathIcon} aria-hidden="true">03</span><h3>Find your community</h3><p>Explore a conversation about connecting with others.</p><button type="button" className={styles.textButton} onClick={() => setNotice("No group request, assignment or leadership role was created.")}>See the sample <span aria-hidden="true">↗</span></button></PreviewPanel>
          </div>
        </section>
        <section id="prototype-signup" className={styles.signupSection} aria-labelledby="prototype-signup-title">
          <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>Clear from the first step</p><h2 id="prototype-signup-title">An honest welcome.</h2></div></div>
          <PreviewPanel>
            <PreviewSelect id="prototype-signup-stage" label="Synthetic signup state" value={signupStage}
              description="No account request, email, confirmation or session is created by this preview."
              onChange={event => {
                const stage = event.target.value as SignupStage;
                setSignupStage(stage);
                setNotice(`Signup example: ${SIGNUP_LABELS[stage]}. No account or session was created.`);
              }}>
              {(Object.keys(SIGNUP_LABELS) as SignupStage[]).map(stage => <option value={stage} key={stage}>{SIGNUP_LABELS[stage]}</option>)}
            </PreviewSelect>
            <SignupStatusCard stage={signupStage}/>
          </PreviewPanel>
        </section>
        <aside className={styles.stateControls} aria-label="Prototype test controls">
          <PreviewSelect id="prototype-load-state" label="Next-step state" value={loadState}
            description="These controls change synthetic presentation only. They make no network requests."
            onChange={event => {
              const state = event.target.value as PreviewLoadState;
              setLoadState(state);
              setNotice(`Next-step example: ${STATE_LABELS[state]}. No account information was loaded or changed.`);
            }}>
            {(Object.keys(STATE_LABELS) as PreviewLoadState[]).map(state => <option key={state} value={state}>{STATE_LABELS[state]}</option>)}
          </PreviewSelect>
        </aside>
        <p id="prototype-shell-notice" role="status" aria-live="polite" aria-atomic="true" className={styles.notice}>{notice || "All interactions stay in this page. Refreshing resets the preview."}</p>
      </main>
      <footer className={styles.footer}><strong>REACH. TEACH. TRAIN. DISCIPLE. MULTIPLY.</strong><p>Member experience exploration · Prepared for review · Not connected to Lockliel accounts</p></footer>
    </div>
  </div>;
}
