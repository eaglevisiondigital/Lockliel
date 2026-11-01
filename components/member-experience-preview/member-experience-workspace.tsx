"use client";

import { useId, useState } from "react";
import { MemberCard, PreviewPanel, PreviewSelect, ProfilePhotoControls } from "./member-components";
import { changePhotoPreview, FAITH_BANNER_OPTIONS, PRIVATE_VISIBILITY, projectMemberCard } from "./preview-model";
import type { FaithBannerMessage, PhotoPreviewState, PreviewAudience, Visibility, VisibilityChoices } from "./preview-model";
import { emitMemberIntent, normalizeMemberWorkspaceDisplay, readMemberReviewIdentity } from "./member-display-contract";
import type { MemberIntentHandler, MemberIntentKind, MemberNextStepDisplay, MemberReviewIdentity, MemberWorkspaceDisplayModel } from "./member-display-contract";
import styles from "./member-experience-preview.module.css";

export interface MemberExperienceWorkspaceProps {
  readonly identity: MemberReviewIdentity;
  readonly displayModel: MemberWorkspaceDisplayModel;
  readonly resetKey: string;
  readonly idPrefix?: string;
  readonly onIntent?: MemberIntentHandler;
}

const FALLBACKS = {
  loading: { title: "Loading your next step", description: "Wait for a verified response. No progress is shown as loaded yet." },
  empty: { title: "Start with one small step", description: "No active recommendation is available. Reviewing your profile does not create course access or progress." },
  denied: { title: "This information is not available to this account", description: "An invitation, tag or application does not grant access." },
  error: { title: "Your next step could not be loaded", description: "An unavailable response is not an empty account. Try again without changing saved information." },
};
const FIELD_LABELS: Record<keyof VisibilityChoices, string> = { photo: "Photo placeholder", location: "Location", faithBanner: "Faith Banner" };

/** Headless presentation boundary: no application header/main/navigation, Auth, API or persistence. */
export function MemberExperienceWorkspace(props: MemberExperienceWorkspaceProps) {
  const identity = readMemberReviewIdentity(props.identity);
  // Do not inspect a display model or create interactive descendants for unknown identity.
  if (!identity) return <PreviewPanel><h2>Member review unavailable</h2><p>Review identity is unknown. No member information or actions are available.</p></PreviewPanel>;
  const display = normalizeMemberWorkspaceDisplay(props.displayModel);
  if (!display || typeof props.resetKey !== "string" || props.resetKey.length > 100) {
    return <PreviewPanel><h2>Member information unavailable</h2><p>The display model is incomplete. No profile or action is shown.</p></PreviewPanel>;
  }
  return <WorkspaceBoundary key={JSON.stringify([identity.boundaryKey, props.resetKey])}
    {...props} identity={identity} displayModel={display}/>;
}

function WorkspaceBoundary({ identity, displayModel, idPrefix, onIntent }: MemberExperienceWorkspaceProps & {
  identity: Extract<MemberReviewIdentity, { status: "synthetic-owner" }>;
}) {
  const instanceId = useId();
  const prefix = typeof idPrefix === "string" && /^[A-Za-z][A-Za-z0-9_-]{0,59}$/.test(idPrefix) ? idPrefix : `member-${instanceId}`;
  const [choices, setChoices] = useState<VisibilityChoices>({ ...PRIVATE_VISIBILITY });
  const [audience, setAudience] = useState<PreviewAudience>("self");
  const [banner, setBanner] = useState<FaithBannerMessage | null>(displayModel.member.faithBanner || null);
  const [photoState, setPhotoState] = useState<PhotoPreviewState>(displayModel.member.initials ? "initials" : "removed");
  const [notice, setNotice] = useState("Optional fields start private. Changes remain in this view and are not saved or shared.");
  const member = { fixtureKind: "synthetic" as const, displayName: displayModel.member.displayName,
    initials: displayModel.member.initials || "", locationLabel: displayModel.member.locationLabel || "" };
  const card = projectMemberCard(member, choices, audience, banner, photoState);
  function intent(kind: MemberIntentKind) {
    const emitted = emitMemberIntent(identity, kind, onIntent);
    setNotice(emitted ? "An action intent was offered to the review host. These components did not save or share information."
      : "This action is unavailable in this view. Nothing was saved or shared.");
  }
  function updatePhoto(state: PhotoPreviewState) {
    const change = changePhotoPreview(state);
    setPhotoState(change.photoState);
    setChoices(current => ({ ...current, photo: change.visibility }));
    setNotice("Photo sample changed. Photo visibility is Only me again. No image was uploaded or saved.");
  }
  return <section className={styles.workspace} aria-label="Member experience review">
    <div className={styles.dashboardGrid}>
      <MemberNextStepCard id={`${prefix}-next-step`} model={displayModel.nextStep}
        canAct={typeof onIntent === "function"} onIntent={intent}/>
      <PreviewPanel className={styles.memberSummary}>
        <span className={styles.eyebrow}>Your member card</span>
        <MemberCard card={projectMemberCard(member, choices, "self", banner, photoState)} audience="self"/>
        <button type="button" className={styles.textButton} disabled={typeof onIntent !== "function"} onClick={() => intent("member:review-profile")}>Review profile and privacy <span aria-hidden="true">↗</span></button>
      </PreviewPanel>
    </div>
    <section id={`${prefix}-profile`} className={styles.profileSection} aria-labelledby={`${prefix}-profile-title`}>
      <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>Your profile, your choice</p><h2 id={`${prefix}-profile-title`}>Make a little space for you.</h2></div><span className={styles.smallTag}>Local review only</span></div>
      <div className={styles.profileGrid}>
        <PreviewPanel>
          <h3>Choose your Faith Banner</h3>
          <PreviewSelect id={`${prefix}-banner`} label="Banner message" value={banner || ""}
            description="Optional and private by default. This message is not an assessment, score or permission."
            onChange={event => { setBanner(event.target.value ? event.target.value as FaithBannerMessage : null); setNotice("Banner preview changed in this view only. Nothing was saved."); }}>
            <option value="">No Faith Banner</option>
            {FAITH_BANNER_OPTIONS.map(message => <option key={message} value={message}>{message}</option>)}
          </PreviewSelect>
          <ProfilePhotoControls idPrefix={prefix} state={photoState} onChange={updatePhoto}/>
          <fieldset className={styles.visibility} aria-describedby={`${prefix}-visibility-help`}>
            <legend>Visibility for this review</legend>
            <p id={`${prefix}-visibility-help`}>Every optional field starts private. These controls do not grant access to anyone.</p>
            {(Object.keys(FIELD_LABELS) as (keyof VisibilityChoices)[]).map(field =>
              <PreviewSelect key={field} id={`${prefix}-${field}`} label={FIELD_LABELS[field]}
                className={styles.visibilityRow} value={choices[field]} aria-describedby={`${prefix}-visibility-help`}
                description={field === "photo" ? "Initials only. No upload is available." : undefined}
                onChange={event => {
                  const value = event.target.value as Visibility;
                  setChoices(current => ({ ...current, [field]: value }));
                  setNotice(`${FIELD_LABELS[field]} preview visibility changed. No saved setting or permission changed.`);
                }}>
                <option value="private">Only me</option><option value="approved-connections">Approved connections</option>
              </PreviewSelect>
            )}
          </fieldset>
          <p className={styles.privacyNote}>Private prayers, assessments, notes, giving and contact details are excluded. A card never creates a staff or leadership role.</p>
          <button type="button" className={styles.secondary} onClick={() => { setChoices({ ...PRIVATE_VISIBILITY }); setNotice("All optional fields are private again. No saved setting changed."); }}>Reset review visibility</button>
        </PreviewPanel>
        <PreviewPanel className={styles.audiencePanel}>
          <PreviewSelect id={`${prefix}-audience`} label="Preview the card as" value={audience}
            description="This comparison creates no relationship or permission. Public visitors receive no card."
            onChange={event => { setAudience(event.target.value as PreviewAudience); setNotice("Audience comparison changed. Nothing was shared."); }}>
            <option value="self">Me</option><option value="approved-connection">An approved connection</option><option value="public">A public visitor</option>
          </PreviewSelect>
          <MemberCard card={card} audience={audience}/>
          <div className={styles.privateNote}><strong>Sharing stays intentional.</strong><p>Photo storage, audiences and live sharing require separate review before connecting real data.</p></div>
        </PreviewPanel>
      </div>
    </section>
    <p id={`${prefix}-notice`} role="status" aria-live="polite" aria-atomic="true" className={styles.notice}>{notice}</p>
  </section>;
}

/** Data-driven presentation only; navigation and writes can occur solely in a separately reviewed host. */
function MemberNextStepCard({ id, model, canAct = false, onIntent }: {
  id: string; model: MemberNextStepDisplay; canAct?: boolean; onIntent?: (kind: MemberIntentKind) => void;
}) {
  const fallback = model.status === "ready" ? null : FALLBACKS[model.status];
  return <PreviewPanel className={styles.nextStep} aria-labelledby={`${id}-heading`} aria-busy={model.status === "loading"}>
    <div className={styles.sectionHeading}><span className={styles.eyebrow}>Your next step</span><span className={styles.smallTag}>Review display</span></div>
    {fallback ? <>
      <h2 id={`${id}-heading`}>{fallback.title}</h2><p>{fallback.description}</p>
      {model.status === "loading" && <p role="status" className={styles.loading}>Loading information…</p>}
      {model.status === "error" && <button type="button" className={styles.primary} disabled={!canAct || !onIntent} onClick={() => onIntent?.("member:retry")}>Try again <span aria-hidden="true">↗</span></button>}
      {(model.status === "empty" || model.status === "denied") && <button type="button" className={styles.secondary} disabled={!canAct || !onIntent} onClick={() => onIntent?.("member:review-profile")}>Review your profile</button>}
    </> : model.status === "ready" && <>
      <h2 id={`${id}-heading`}>{model.title}{model.accent && <><br/><em>{model.accent}</em></>}</h2>
      <p>{model.description}</p>
      {model.supportingLabel && <div className={styles.lessonRow}><span className={styles.lessonIcon} aria-hidden="true">▷</span><div><strong>{model.supportingLabel}</strong></div></div>}
      <button type="button" className={styles.primary} disabled={!canAct || !onIntent} onClick={() => onIntent?.("member:continue")}>{model.actionLabel} <span aria-hidden="true">↗</span></button>
      <small className={styles.quiet}>A suggested action never grants access or marks a lesson complete.</small>
    </>}
  </PreviewPanel>;
}
