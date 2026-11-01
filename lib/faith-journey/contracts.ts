/** Proposed W4 contracts only. No provider, Bible version, persistence or release is approved here. */
export type ChapterVerse = Readonly<{ chapter: number; verse: number }>;
export type ScriptureReference = Readonly<{
  book: string;
  start: ChapterVerse;
  end: ChapterVerse;
}>;
/** Chapter counts must come from the selected, reviewed edition/versification, never an inferred canon. */
export type Versification = Readonly<Record<string, Readonly<Record<number, number>>>>;
export type ScriptureUse = 'display' | 'cache' | 'export' | 'share';
export type ContentKind = 'synthetic-placeholder' | 'scripture';
export type VersionIdentity = Readonly<{ providerId: string; versionId: string; edition: string }>;
export type Attribution = Readonly<{ label: string; url: string }>;
export type RightsReview = Readonly<{
  status: 'review-required' | 'approved' | 'synthetic-only';
  decisionRecord: string | null;
  reviewedAt: string | null;
  expiresAt: string | null;
  territories: 'worldwide' | readonly string[];
  permittedUses: readonly ScriptureUse[];
  maxVersesPerRequest: number;
  /** No cache/offline permission is inferred from display permission. */
  cache: Readonly<{ mode: 'disabled' }> | Readonly<{ mode: 'bounded'; maxAgeSeconds: number }>;
  attribution: readonly Attribution[];
  /** Provider-required usage telemetry needs independent privacy review. */
  telemetry: 'none' | 'review-required' | 'approved';
}>;
export type BibleVersion = VersionIdentity & Readonly<{
  name: string;
  language: string;
  contentKind: ContentKind;
  rights: RightsReview;
}>;
export type PassageRequest = Readonly<{
  version: VersionIdentity;
  reference: unknown;
  use: ScriptureUse;
  territory: string;
  /** Explicit clock input makes expiry decisions deterministic. */
  at: string;
}>;
export type Verse = Readonly<{ chapter: number; verse: number; text: string }>;
export type ProviderPassage = Readonly<{
  status: 'available';
  version: VersionIdentity;
  reference: ScriptureReference;
  contentKind: ContentKind;
  verses: readonly Verse[];
}> | Readonly<{ status: 'unavailable' }>;
export type BibleProvider = Readonly<{
  id: string;
  versions: readonly BibleVersion[];
  versification(version: VersionIdentity): Versification | null;
  /** Future live adapters require separate approval. The included adapter has no I/O. */
  read(version: VersionIdentity, reference: ScriptureReference): Promise<ProviderPassage>;
}>;
export type UnavailableCode = 'invalid-request' | 'invalid-reference' | 'version-unavailable' |
  'rights-not-reviewed' | 'rights-denied' | 'provider-unavailable' | 'invalid-provider-response';
export type PassageResult = Readonly<{ status: 'unavailable'; code: UnavailableCode }> | Readonly<{
  status: 'available';
  version: BibleVersion;
  reference: ScriptureReference;
  contentKind: ContentKind;
  verses: readonly Verse[];
  attribution: readonly Attribution[];
  cache: RightsReview['cache'];
}>;

export type FaithEntryKind = 'scripture-anchor' | 'prayer' | 'growth-area' | 'action-plan';
export type OwnerPrivateDraft = Readonly<{
  id: string;
  ownerId: string;
  revision: number;
  visibility: 'private';
  audience: readonly [];
  persistence: 'not-implemented';
}>;
export type ScriptureAnchor = OwnerPrivateDraft & Readonly<{
  kind: 'scripture-anchor';
  reference: ScriptureReference;
  version: VersionIdentity;
  reflection: string;
  /** A reference may persist in future; licensed verse bytes never enter this draft. */
  verseTextStorage: 'none';
}>;
export type PrivatePrayer = OwnerPrivateDraft & Readonly<{
  kind: 'prayer';
  body: string;
  status: 'open' | 'archived';
}>;
export type GrowthArea = OwnerPrivateDraft & Readonly<{
  kind: 'growth-area';
  title: string;
  reflection: string;
  progressMeaning: 'member-self-report-only';
}>;
export type ActionPlan = OwnerPrivateDraft & Readonly<{
  kind: 'action-plan';
  growthAreaId: string | null;
  title: string;
  steps: readonly Readonly<{ id: string; text: string; state: 'planned' | 'done' | 'skipped' }>[];
  progressMeaning: 'member-self-report-only';
}>;
export type FaithEntryDraft = ScriptureAnchor | PrivatePrayer | GrowthArea | ActionPlan;

export type ShareField = 'reference' | 'reflection' | 'body' | 'title' | 'steps';
/** Review artifact only. It is deliberately not a delivery token, public URL or durable authorization. */
export type SharingReviewDraft = Readonly<{
  status: 'proposal-only';
  entryId: string;
  sourceRevision: number;
  ownerId: string;
  recipientIds: readonly string[];
  selectedFields: readonly ShareField[];
  expiresAt: string | null;
  confirmation: 'not-confirmed';
  delivery: 'held';
  revocation: 'required-before-implementation';
}>;
