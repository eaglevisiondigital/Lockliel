/** Presentation-only contracts. These functions never establish authorization. */
export type PhotoPreviewState = "initials" | "removed" | "unavailable";
export type PhotoPresentationKind = "initials" | "empty" | "unavailable" | "not-shared";
export type Visibility = "private" | "approved-connections";
export type PreviewAudience = "self" | "approved-connection" | "public";
export type VisibilityChoices = Record<"photo" | "location" | "faithBanner", Visibility>;
export type PreviewLoadState = "ready" | "loading" | "empty" | "denied" | "error";
export type SignupStage = "request-received" | "confirmation-needed" | "confirmed" | "signed-in";

export interface SyntheticMember {
  readonly fixtureKind: "synthetic";
  readonly displayName: string;
  readonly initials: string;
  readonly locationLabel: string;
}

export const PRIVATE_VISIBILITY: Readonly<VisibilityChoices> = Object.freeze({
  photo: "private", location: "private", faithBanner: "private",
});

export const FAITH_BANNER_OPTIONS = [
  "Take the next faithful step.",
  "Make room to grow, one day at a time.",
  "Reach one. Encourage one.",
] as const;
export type FaithBannerMessage = typeof FAITH_BANNER_OPTIONS[number];

function visible(choice: Visibility, audience: PreviewAudience): boolean {
  return audience === "self" || (audience === "approved-connection" && choice === "approved-connections");
}

/** Photo controls are synthetic only; changing the sample never keeps an old sharing choice. */
export function changePhotoPreview(state: PhotoPreviewState) {
  return {
    photoState: (["initials", "removed", "unavailable"].includes(state) ? state : "removed") as PhotoPreviewState,
    visibility: "private" as const,
  };
}

export function photoPresentation(
  state: PhotoPreviewState,
  visibility: Visibility,
  audience: PreviewAudience,
): { kind: PhotoPresentationKind; label: string } {
  if (audience !== "self" && (!visible(visibility, audience) || state !== "initials")) {
    return { kind: "not-shared", label: "No photo shared in this preview" };
  }
  if (state === "removed") return { kind: "empty", label: "No photo placeholder selected" };
  if (state === "unavailable") return { kind: "unavailable", label: "Photo placeholder unavailable" };
  return { kind: "initials", label: "Synthetic photo placeholder, initials only" };
}

/** Explicit projection: no profile spreading, contact details, assessment or finance fields. */
export function projectMemberCard(
  member: SyntheticMember,
  choices: VisibilityChoices,
  audience: PreviewAudience,
  banner: FaithBannerMessage | null,
  photoState: PhotoPreviewState = "initials",
) {
  if (member.fixtureKind !== "synthetic" || (audience !== "self" && audience !== "approved-connection")) return null;
  return {
    displayName: member.displayName,
    initials: member.initials,
    showPhotoPlaceholder: photoPresentation(photoState, choices.photo, audience).kind === "initials",
    photo: photoPresentation(photoState, choices.photo, audience),
    locationLabel: visible(choices.location, audience) ? member.locationLabel : null,
    faithBanner: visible(choices.faithBanner, audience) && FAITH_BANNER_OPTIONS.includes(banner as FaithBannerMessage)
      ? banner : null,
  };
}

/** Non-owner copy never reveals whether an unshared banner exists. */
export function faithBannerEmptyMessage(audience: PreviewAudience): string {
  return audience === "self"
    ? "No Faith Banner selected. You can leave this space empty."
    : "No Faith Banner is shared in this preview.";
}

/** Mock events, not inferred Auth success or a claim that mail arrived. */
export function signupPresentation(stage: SignupStage) {
  switch (stage) {
    case "request-received": return {
      title: "Your request was received",
      description: "An account request is not a confirmed account or a signed-in session. Wait for the next verified step.",
      next: "Wait for confirmation instructions",
    };
    case "confirmation-needed": return {
      title: "Confirm your email to continue",
      description: "Check your inbox for confirmation instructions. This state does not prove the message arrived, and you are not signed in.",
      next: "Return to sign in after confirmation",
    };
    case "confirmed": return {
      title: "Email confirmed",
      description: "Your email is confirmed in this example. Sign in to start a session. Confirmation does not grant a staff or leadership role.",
      next: "Sign in to continue",
    };
    case "signed-in": return {
      title: "You are signed in",
      description: "This example represents a verified member session. Your existing permissions still apply. No new role or course access is granted.",
      next: "Open your dashboard",
    };
  }
}

export const VIEW_STATES: Record<Exclude<PreviewLoadState, "ready">, { title: string; description: string }> = {
  loading: { title: "Loading your next step", description: "Wait for a verified response. No progress or profile data is shown as loaded yet." },
  empty: { title: "Start with one small step", description: "There is no active recommendation in this example. You can review your profile without inventing course access or progress." },
  denied: { title: "This information is not available to this account", description: "An invitation, tag or application does not grant access. Return to a view your account is allowed to use." },
  error: { title: "Your next step could not be loaded", description: "An unavailable response is not an empty account. Try again without changing saved information." },
};
