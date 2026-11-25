import type { FaithBannerMessage } from "./preview-model";
import { FAITH_BANNER_OPTIONS } from "./preview-model";

/** Review identity is a host boundary marker, never an Auth/session/role assertion. */
export type MemberReviewIdentity =
  | { readonly status: "synthetic-owner"; readonly boundaryKey: string }
  | { readonly status: "unknown" };

export type MemberIntentKind = "member:continue" | "member:review-profile" | "member:retry";
export interface MemberIntent {
  readonly kind: MemberIntentKind;
  readonly boundaryKey: string;
}
export type MemberIntentHandler = (intent: MemberIntent) => void;

export type MemberNextStepDisplay =
  | { readonly status: "ready"; readonly title: string; readonly accent?: string;
      readonly description: string; readonly actionLabel: string; readonly supportingLabel?: string }
  | { readonly status: "loading" | "empty" | "denied" | "error" };

/** Already-filtered display inputs only. Do not pass a raw profile or private-domain record. */
export interface MemberWorkspaceDisplayModel {
  readonly member: {
    readonly displayName: string;
    readonly initials?: string;
    readonly locationLabel?: string;
    readonly faithBanner?: FaithBannerMessage | null;
  };
  readonly nextStep: MemberNextStepDisplay;
}

function record(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown> : null;
}
function text(value: unknown, maximum: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed && trimmed.length <= maximum && !/[\x00-\x1f\x7f]/.test(trimmed) ? trimmed : null;
}

export function readMemberReviewIdentity(value: unknown): Extract<MemberReviewIdentity, { status: "synthetic-owner" }> | null {
  const input = record(value);
  if (input?.status !== "synthetic-owner" || typeof input.boundaryKey !== "string"
    || !/^[A-Za-z0-9][A-Za-z0-9._:-]{0,79}$/.test(input.boundaryKey)) return null;
  return { status: "synthetic-owner", boundaryKey: input.boundaryKey };
}

/** Explicitly rebuild each field. Unknown keys, photo/destination URL fields, roles and sensitive extras are discarded. */
export function normalizeMemberWorkspaceDisplay(value: unknown): MemberWorkspaceDisplayModel | null {
  const input = record(value);
  const member = record(input?.member);
  const nextStep = record(input?.nextStep);
  const displayName = text(member?.displayName, 80);
  if (!member || !nextStep || !displayName) return null;
  const initials = text(member.initials, 4) || undefined;
  const locationLabel = text(member.locationLabel, 80) || undefined;
  const faithBanner = FAITH_BANNER_OPTIONS.includes(member.faithBanner as FaithBannerMessage)
    ? member.faithBanner as FaithBannerMessage : null;
  let safeStep: MemberNextStepDisplay;
  if (nextStep.status === "ready") {
    const title = text(nextStep.title, 120);
    const description = text(nextStep.description, 420);
    const actionLabel = text(nextStep.actionLabel, 80);
    if (!title || !description || !actionLabel) return null;
    safeStep = {
      status: "ready", title, description, actionLabel,
      ...(text(nextStep.accent, 120) ? { accent: text(nextStep.accent, 120)! } : {}),
      ...(text(nextStep.supportingLabel, 120) ? { supportingLabel: text(nextStep.supportingLabel, 120)! } : {}),
    };
  } else if (typeof nextStep.status === "string" && ["loading", "empty", "denied", "error"].includes(nextStep.status)) {
    safeStep = { status: nextStep.status as "loading" | "empty" | "denied" | "error" };
  } else return null;
  return { member: { displayName, ...(initials ? { initials } : {}),
    ...(locationLabel ? { locationLabel } : {}), faithBanner }, nextStep: safeStep };
}

/** Emits only an allowlisted intent and an opaque synthetic boundary marker. No field values. */
export function emitMemberIntent(identity: unknown, kind: unknown, handler?: MemberIntentHandler): boolean {
  const boundary = readMemberReviewIdentity(identity);
  if (!boundary || typeof kind !== "string" || !["member:continue", "member:review-profile", "member:retry"].includes(kind)
    || typeof handler !== "function") return false;
  try {
    handler(Object.freeze({ kind: kind as MemberIntentKind, boundaryKey: boundary.boundaryKey }));
    return true;
  } catch { return false; }
}
