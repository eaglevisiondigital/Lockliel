import type { ComponentPropsWithoutRef, ReactNode, SelectHTMLAttributes } from "react";
import styles from "./member-experience-preview.module.css";
import { faithBannerEmptyMessage, projectMemberCard, signupPresentation, VIEW_STATES } from "./preview-model";
import type { PhotoPreviewState, PreviewAudience, PreviewLoadState, SignupStage } from "./preview-model";

export function PreviewPanel({ children, className = "", ...attributes }: ComponentPropsWithoutRef<"section">) {
  return <section {...attributes} className={`${styles.panel} ${className}`}>{children}</section>;
}

/** Keeps the visible label and explanatory text connected to their native select. */
export function PreviewSelect({ id, label, description, children, className = "", ...attributes }: {
  id: string; label: string; description?: string; children: ReactNode; className?: string;
} & Omit<SelectHTMLAttributes<HTMLSelectElement>, "id" | "children" | "className">) {
  const descriptionId = description ? `${id}-help` : undefined;
  const describedBy = [attributes["aria-describedby"], descriptionId].filter(Boolean).join(" ") || undefined;
  return <div className={`${styles.selectControl} ${className}`}>
    <label className={styles.label} htmlFor={id}>{label}</label>
    <select {...attributes} id={id} aria-describedby={describedBy}>{children}</select>
    {description && <p className={styles.controlHelp} id={descriptionId}>{description}</p>}
  </div>;
}

export function ProfilePhotoControls({ state, onChange, idPrefix = "prototype" }: {
  idPrefix?: string; state: PhotoPreviewState; onChange: (state: PhotoPreviewState) => void;
}) {
  return <fieldset className={styles.photoControls}>
    <legend>Profile photo preview</legend>
    <PreviewSelect id={`${idPrefix}-photo-state`} label="Photo placeholder state" value={state}
      description="Initials only. No file can be selected or uploaded. Changing this sample resets photo visibility to Only me."
      onChange={event => onChange(event.target.value as PhotoPreviewState)}>
      <option value="initials">Initials placeholder</option>
      <option value="removed">No photo placeholder</option>
      <option value="unavailable">Photo unavailable</option>
    </PreviewSelect>
    <button type="button" className={styles.secondary} disabled={state === "removed"} onClick={() => onChange("removed")}>Remove sample placeholder</button>
  </fieldset>;
}

export function FaithBanner({ message, audience }: { message: string | null; audience: PreviewAudience }) {
  if (!message) return <p className={styles.quiet}>{faithBannerEmptyMessage(audience)}</p>;
  return <div className={styles.faithBanner}>
    <span className={styles.eyebrow}>My Faith Banner</span>
    <p>{message}</p>
    <small>A message you choose, never an assessment or score.</small>
  </div>;
}

export function MemberCard({ card, audience }: {
  audience: PreviewAudience; card: ReturnType<typeof projectMemberCard>;
}) {
  if (!card) return <p className={styles.quiet}>No public member card is available.</p>;
  return <article className={styles.memberCard} aria-label="Synthetic member card">
    <div className={styles.personRow}>
      <span className={card.showPhotoPlaceholder ? styles.avatar : styles.hiddenAvatar}
        role="img" aria-label={card.photo.label}>
        <span aria-hidden="true">{card.showPhotoPlaceholder ? card.initials : "◎"}</span>
      </span>
      <div><h3>{card.displayName}</h3><p>{card.locationLabel || "No location shared in this preview"}</p></div>
    </div>
    <FaithBanner message={card.faithBanner} audience={audience}/>
    <p className={styles.cardFootnote}>Display preview only. Contact details, private prayers, assessments and giving never appear here.</p>
  </article>;
}

export function NextStepCard({ id, state, onTryAgain, onPreviewAction }: {
  id: string; state: PreviewLoadState; onTryAgain: () => void; onPreviewAction: () => void;
}) {
  const fallback = state === "ready" ? null : VIEW_STATES[state];
  return <PreviewPanel className={styles.nextStep} aria-labelledby={`${id}-heading`} aria-busy={state === "loading"}>
    <div className={styles.sectionHeading}><span className={styles.eyebrow}>Your next step</span><span className={styles.smallTag}>Synthetic state</span></div>
    {fallback ? <>
      <h2 id={`${id}-heading`}>{fallback.title}</h2><p>{fallback.description}</p>
      {state === "error" && <button type="button" className={styles.primary} onClick={onTryAgain}>Try the sample again <span aria-hidden="true">↗</span></button>}
      {state === "loading" && <p role="status" className={styles.loading}>Loading sample information…</p>}
      {(state === "empty" || state === "denied") && <a className={styles.secondary} href="#prototype-profile">Review your profile <span aria-hidden="true">↗</span></a>}
    </> : <>
      <h2 id={`${id}-heading`}>A little time.<br/><em>A meaningful next step.</em></h2>
      <p>Continue your example lesson, then take a moment to reflect. Move at a pace that helps you understand and apply what you learn.</p>
      <div className={styles.lessonRow}><span className={styles.lessonIcon} aria-hidden="true">▷</span><div><strong>Getting a Grip</strong><span>Example lesson · No live progress</span></div></div>
      <button type="button" className={styles.primary} onClick={onPreviewAction}>Preview your next step <span aria-hidden="true">↗</span></button>
      <small className={styles.quiet}>A suggested action never grants course access or marks a lesson complete.</small>
    </>}
  </PreviewPanel>;
}

export function SignupStatusCard({ stage }: { stage: SignupStage }) {
  const presentation = signupPresentation(stage);
  return <div className={styles.signupStatus}>
    <span aria-hidden="true" className={styles.statusIcon}>✓</span>
    <div><h3>{presentation.title}</h3><p>{presentation.description}</p><strong>Next: {presentation.next}</strong></div>
  </div>;
}
