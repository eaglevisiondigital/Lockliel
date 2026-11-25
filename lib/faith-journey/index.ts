/** Pure W4 contract entry point. No network, storage, Auth or UI integration. */
import type {
  BibleProvider, BibleVersion, ChapterVerse, FaithEntryDraft, FaithEntryKind,
  PassageRequest, PassageResult, PrivatePrayer, RightsReview, ScriptureAnchor,
  ScriptureReference, ScriptureUse, ShareField, SharingReviewDraft, Versification, VersionIdentity,
} from './contracts';


// Parsing vocabulary, not a decision about approved translations or the product's canon.
const books = [
  ['GEN', 'Genesis', 'Gen'], ['EXO', 'Exodus', 'Ex'], ['LEV', 'Leviticus', 'Lev'],
  ['NUM', 'Numbers', 'Num'], ['DEU', 'Deuteronomy', 'Deut'], ['JOS', 'Joshua', 'Josh'],
  ['JDG', 'Judges', 'Judg'], ['RUT', 'Ruth'], ['1SA', '1 Samuel', '1 Sam'],
  ['2SA', '2 Samuel', '2 Sam'], ['1KI', '1 Kings', '1 Kgs'], ['2KI', '2 Kings', '2 Kgs'],
  ['1CH', '1 Chronicles', '1 Chr'], ['2CH', '2 Chronicles', '2 Chr'], ['EZR', 'Ezra'],
  ['NEH', 'Nehemiah', 'Neh'], ['EST', 'Esther'], ['JOB', 'Job'], ['PSA', 'Psalms', 'Psalm', 'Ps'],
  ['PRO', 'Proverbs', 'Prov'], ['ECC', 'Ecclesiastes', 'Eccl'],
  ['SNG', 'Song of Songs', 'Song of Solomon'], ['ISA', 'Isaiah', 'Isa'],
  ['JER', 'Jeremiah', 'Jer'], ['LAM', 'Lamentations', 'Lam'], ['EZK', 'Ezekiel', 'Ezek'],
  ['DAN', 'Daniel', 'Dan'], ['HOS', 'Hosea', 'Hos'], ['JOL', 'Joel'], ['AMO', 'Amos'],
  ['OBA', 'Obadiah', 'Obad'], ['JON', 'Jonah'], ['MIC', 'Micah'], ['NAM', 'Nahum'],
  ['HAB', 'Habakkuk', 'Hab'], ['ZEP', 'Zephaniah', 'Zeph'], ['HAG', 'Haggai', 'Hag'],
  ['ZEC', 'Zechariah', 'Zech'], ['MAL', 'Malachi', 'Mal'], ['MAT', 'Matthew', 'Matt'],
  ['MRK', 'Mark', 'Mk'], ['LUK', 'Luke', 'Lk'], ['JHN', 'John', 'Jn'], ['ACT', 'Acts'],
  ['ROM', 'Romans', 'Rom'], ['1CO', '1 Corinthians', '1 Cor'], ['2CO', '2 Corinthians', '2 Cor'],
  ['GAL', 'Galatians', 'Gal'], ['EPH', 'Ephesians', 'Eph'], ['PHP', 'Philippians', 'Phil'],
  ['COL', 'Colossians', 'Col'], ['1TH', '1 Thessalonians', '1 Thess'],
  ['2TH', '2 Thessalonians', '2 Thess'], ['1TI', '1 Timothy', '1 Tim'],
  ['2TI', '2 Timothy', '2 Tim'], ['TIT', 'Titus'], ['PHM', 'Philemon', 'Phlm'],
  ['HEB', 'Hebrews', 'Heb'], ['JAS', 'James', 'Jas'], ['1PE', '1 Peter', '1 Pet'],
  ['2PE', '2 Peter', '2 Pet'], ['1JN', '1 John', '1 Jn'], ['2JN', '2 John', '2 Jn'],
  ['3JN', '3 John', '3 Jn'], ['JUD', 'Jude'], ['REV', 'Revelation', 'Rev'],
] as const;
const names = new Map<string, string>();
for (const row of books) for (const name of row) names.set(name.toLowerCase().replace(/\s/g, ''), row[0]);
const labels = new Map<string, string>(books.map(row => [row[0], row[1]]));
const integer = (value: unknown): value is number => Number.isSafeInteger(value) && Number(value) > 0 && Number(value) <= 999;
const object = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
const position = (value: unknown): value is ChapterVerse => object(value) && integer(value.chapter) && integer(value.verse);
const ordered = (start: ChapterVerse, end: ChapterVerse) => end.chapter > start.chapter || (end.chapter === start.chapter && end.verse >= start.verse);
export function isScriptureReference(value: unknown): value is ScriptureReference {
  return object(value) && typeof value.book === 'string' && labels.has(value.book) &&
    position(value.start) && position(value.end) && ordered(value.start, value.end);
}
export type ReferenceParse = Readonly<{ ok: true; reference: ScriptureReference }> | Readonly<{ ok: false; code: 'invalid-reference' }>;
export function parseScriptureReference(input: unknown): ReferenceParse {
  if (typeof input !== 'string' || input.length > 120) return { ok: false, code: 'invalid-reference' };
  // One explicit verse or range only; no chapter-only, multi-passage, suffix or cross-book inference.
  const match = input.trim().match(/^([1-3]?\s*[A-Za-z]+(?:\s+[A-Za-z]+)*)\s+(\d{1,3}):(\d{1,3})(?:\s*[-–]\s*(?:(\d{1,3}):)?(\d{1,3}))?$/);
  if (!match) return { ok: false, code: 'invalid-reference' };
  const book = names.get(match[1].toLowerCase().replace(/\s/g, ''));
  const start = { chapter: Number(match[2]), verse: Number(match[3]) };
  const end = { chapter: Number(match[4] || match[2]), verse: Number(match[5] || match[3]) };
  const reference = { book, start, end };
  return isScriptureReference(reference) ? { ok: true, reference } : { ok: false, code: 'invalid-reference' };
}
/** Returns exact positions only when every chapter/verse is supported and within the request budget. */
export function referencePositions(reference: unknown, versification: Versification, limit: number): readonly ChapterVerse[] | null {
  if (!isScriptureReference(reference) || !Number.isSafeInteger(limit) || limit < 1 || limit > 1000) return null;
  const chapters = versification[reference.book];
  if (!chapters) return null;
  const positions: ChapterVerse[] = [];
  for (let chapter = reference.start.chapter; chapter <= reference.end.chapter; chapter++) {
    const count = chapters[chapter];
    if (!integer(count)) return null;
    const first = chapter === reference.start.chapter ? reference.start.verse : 1;
    const last = chapter === reference.end.chapter ? reference.end.verse : count;
    if (first > count || last > count) return null;
    for (let verse = first; verse <= last; verse++) {
      if (positions.length === limit) return null;
      positions.push({ chapter, verse });
    }
  }
  return positions.length ? positions : null;
}
export function formatScriptureReference(reference: ScriptureReference): string {
  if (!isScriptureReference(reference)) throw new Error('Invalid Scripture reference.');
  const start = `${labels.get(reference.book)} ${reference.start.chapter}:${reference.start.verse}`;
  if (reference.start.chapter === reference.end.chapter && reference.start.verse === reference.end.verse) return start;
  return `${start}-${reference.start.chapter === reference.end.chapter ? '' : reference.end.chapter + ':'}${reference.end.verse}`;
}


const uses: readonly ScriptureUse[] = ['display', 'cache', 'export', 'share'];
const sameVersion = (left: VersionIdentity, right: VersionIdentity) => left.providerId === right.providerId && left.versionId === right.versionId && left.edition === right.edition;
const nonblank = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;
const time = (value: unknown): number => typeof value === 'string' && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{3})?Z$/.test(value) ? Date.parse(value) : NaN;
const copyReference = (reference: ScriptureReference): ScriptureReference => ({ book: reference.book,
  start: { chapter: reference.start.chapter, verse: reference.start.verse },
  end: { chapter: reference.end.chapter, verse: reference.end.verse } });
const copyIdentity = (identity: VersionIdentity): VersionIdentity => ({ providerId: identity.providerId, versionId: identity.versionId, edition: identity.edition });
function copyVersion(version: BibleVersion): BibleVersion {
  const rights = version.rights;
  return { ...copyIdentity(version), name: version.name, language: version.language, contentKind: version.contentKind,
    rights: { status: rights.status, decisionRecord: rights.decisionRecord, reviewedAt: rights.reviewedAt, expiresAt: rights.expiresAt,
      territories: rights.territories === 'worldwide' ? 'worldwide' : [...rights.territories],
      permittedUses: [...rights.permittedUses], maxVersesPerRequest: rights.maxVersesPerRequest,
      cache: rights.cache.mode === 'bounded' ? { mode: 'bounded', maxAgeSeconds: rights.cache.maxAgeSeconds } : { mode: 'disabled' },
      attribution: rights.attribution.map(item => ({ label: item.label, url: item.url })), telemetry: rights.telemetry },
  };
}
const unavailable = (code: Extract<PassageResult, {status: 'unavailable'}>['code']): PassageResult => ({ status: 'unavailable', code });
function reviewAllows(rights: RightsReview, version: BibleVersion, request: PassageRequest): boolean {
  const at = time(request.at), reviewed = time(rights.reviewedAt), expires = time(rights.expiresAt);
  return (rights.status === 'approved' || (rights.status === 'synthetic-only' && version.contentKind === 'synthetic-placeholder')) &&
    nonblank(rights.decisionRecord) && Number.isFinite(at) && Number.isFinite(reviewed) && reviewed <= at &&
    Number.isFinite(expires) && expires > at &&
    (rights.telemetry === 'none' || rights.telemetry === 'approved') &&
    (rights.territories === 'worldwide' || rights.territories.includes(request.territory)) &&
    rights.permittedUses.includes(request.use) && rights.attribution.length > 0 &&
    rights.attribution.every(item => nonblank(item.label) && /^https:\/\/[A-Za-z0-9.-]+(?:\/[^\s]*)?$/.test(item.url)) &&
    (request.use !== 'cache' || (rights.cache.mode === 'bounded' && Number.isSafeInteger(rights.cache.maxAgeSeconds) && rights.cache.maxAgeSeconds > 0));
}
/** Fail-closed reference/version/rights boundary. It never chooses an alternative version. */
async function readReviewedPassage(provider: BibleProvider, request: PassageRequest): Promise<PassageResult> {
  if (!request || !request.version || !nonblank(request.version.versionId) || !nonblank(request.version.edition) ||
      !uses.includes(request.use) || !/^[A-Z]{2}$/.test(request.territory) || !Number.isFinite(time(request.at))) return unavailable('invalid-request');
  if (request.version.providerId !== provider.id) return unavailable('version-unavailable');
  const selected = provider.versions.find(candidate => sameVersion(candidate, request.version));
  if (!selected) return unavailable('version-unavailable');
  const version = copyVersion(selected);
  if (version.rights.status === 'review-required') return unavailable('rights-not-reviewed');
  if (!reviewAllows(version.rights, version, request)) return unavailable('rights-denied');
  if (!isScriptureReference(request.reference)) return unavailable('invalid-reference');
  // Snapshot identity/reference so adapter mutations cannot change the expected response.
  const expectedIdentity = copyIdentity(request.version);
  const expectedReference = copyReference(request.reference);
  const versification = provider.versification(copyIdentity(expectedIdentity));
  if (!versification) return unavailable('version-unavailable');
  const positions = referencePositions(expectedReference, versification, version.rights.maxVersesPerRequest);
  if (!positions) return unavailable('invalid-reference');
  try {
    const result = await provider.read(copyIdentity(expectedIdentity), copyReference(expectedReference));
    if (result.status === 'unavailable') return unavailable('provider-unavailable');
    if (!result.version || !sameVersion(result.version, expectedIdentity) || result.contentKind !== version.contentKind ||
        !isScriptureReference(result.reference) || result.reference.book !== expectedReference.book ||
        result.reference.start.chapter !== expectedReference.start.chapter || result.reference.start.verse !== expectedReference.start.verse ||
        result.reference.end.chapter !== expectedReference.end.chapter || result.reference.end.verse !== expectedReference.end.verse ||
        !Array.isArray(result.verses) || result.verses.length !== positions.length ||
        result.verses.some((verse, index) => verse.chapter !== positions[index].chapter || verse.verse !== positions[index].verse ||
          !nonblank(verse.text) || verse.text.length > 10000 || /[<>\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(verse.text))) return unavailable('invalid-provider-response');
    // Copy reviewed fields. No raw provider error, identity, tracking field or HTML is forwarded.
    return {
      status: 'available', version, contentKind: version.contentKind,
      reference: copyReference(result.reference),
      verses: result.verses.map(({chapter, verse, text}) => ({chapter, verse, text})),
      attribution: version.rights.attribution.map(item => ({ ...item })),
      cache: version.rights.cache.mode === 'bounded' && version.rights.permittedUses.includes('cache') ? { ...version.rights.cache } : { mode: 'disabled' },
    };
  } catch {
    return unavailable('provider-unavailable');
  }
}

/** All adapter failures, including catalog/versification errors, stay unavailable without raw diagnostics. */
export async function readPassage(provider: BibleProvider, request: PassageRequest): Promise<PassageResult> {
  try { return await readReviewedPassage(provider, request); } catch { return unavailable('provider-unavailable'); }
}

/** Deliberately invented verse coordinates/text, not a real Bible edition or selected default. */
export function createSyntheticBibleProvider(): BibleProvider {
  const version: BibleVersion = {
    providerId: 'synthetic', versionId: 'fixture-only', edition: 'synthetic-v1',
    name: 'Synthetic test placeholders', language: 'en', contentKind: 'synthetic-placeholder',
    rights: {
      status: 'synthetic-only', decisionRecord: 'w4-synthetic-fixture-not-a-license',
      reviewedAt: '2026-11-01T00:00:00Z', expiresAt: '2026-12-01T00:00:00Z',
      territories: 'worldwide', permittedUses: ['display'], maxVersesPerRequest: 5,
      cache: { mode: 'disabled' }, telemetry: 'none',
      attribution: [{ label: 'Synthetic placeholders. Not Scripture.', url: 'https://example.invalid/synthetic' }],
    },
  };
  const versification = { JHN: { 3: 3, 4: 2 }, '1JN': { 1: 2 } };
  return {
    id: 'synthetic', versions: [version],
    versification: identity => sameVersion(identity, version) ? versification : null,
    async read(identity, reference) {
      const positions = sameVersion(identity, version) && referencePositions(reference, versification, 5);
      if (!positions) return { status: 'unavailable' };
      return { status: 'available', version: identity, reference, contentKind: 'synthetic-placeholder',
        verses: positions.map(point => ({ ...point, text: `[Synthetic placeholder ${point.chapter}:${point.verse}. Not Scripture.]` })) };
    },
  };
}

const idValid = (id: unknown): id is string => typeof id === 'string' && /^[A-Za-z0-9][A-Za-z0-9_-]{0,119}$/.test(id);
const cleanText = (text: unknown, max: number): text is string => typeof text === 'string' && text.length <= max && !/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(text);

/** A memory-only draft, not an authenticated object or permission grant. Identity must come from L1 later. */
export function createPrivatePrayerDraft(input: Readonly<{ id: string; ownerId: string; body: string }>): PrivatePrayer {
  if (!input || !idValid(input.id) || !idValid(input.ownerId) || !cleanText(input.body, 4000)) throw new Error('Invalid private draft.');
  return { id: input.id, ownerId: input.ownerId, revision: 0, kind: 'prayer', body: input.body,
    visibility: 'private', audience: [], persistence: 'not-implemented', status: 'open' };
}
export function createScriptureAnchorDraft(input: Readonly<{
  id: string; ownerId: string; reference: ScriptureReference; version: VersionIdentity; reflection: string;
}>): ScriptureAnchor {
  if (!input || !idValid(input.id) || !idValid(input.ownerId) || !isScriptureReference(input.reference) ||
      !input.version || !idValid(input.version.providerId) || !idValid(input.version.versionId) || !idValid(input.version.edition) ||
      !cleanText(input.reflection, 4000)) throw new Error('Invalid Scripture anchor draft.');
  return { id: input.id, ownerId: input.ownerId, revision: 0, kind: 'scripture-anchor',
    reference: { book: input.reference.book,
      start: { chapter: input.reference.start.chapter, verse: input.reference.start.verse },
      end: { chapter: input.reference.end.chapter, verse: input.reference.end.verse } },
    version: { providerId: input.version.providerId, versionId: input.version.versionId, edition: input.version.edition },
    reflection: input.reflection, verseTextStorage: 'none', visibility: 'private', audience: [], persistence: 'not-implemented' };
}

export function createSharingReviewDraft(entry: FaithEntryDraft): SharingReviewDraft {
  return { status: 'proposal-only', entryId: entry.id, sourceRevision: entry.revision, ownerId: entry.ownerId,
    recipientIds: [], selectedFields: [], expiresAt: null, confirmation: 'not-confirmed',
    delivery: 'held', revocation: 'required-before-implementation' };
}
/** Checks whether a synthetic review form is complete; success never authorizes sharing or writes. */
export function assessSharingReview(entry: FaithEntryDraft, draft: SharingReviewDraft, actorId: string, at: string):
  Readonly<{ reviewable: boolean; delivery: 'held'; code: 'ready-for-review' | 'invalid-review' }> {
  const fields: Readonly<Record<FaithEntryKind, readonly ShareField[]>> = {
    'scripture-anchor': ['reference', 'reflection'], prayer: ['body'],
    'growth-area': ['title', 'reflection'], 'action-plan': ['title', 'steps'],
  };
  const now = Date.parse(at), expires = Date.parse(draft.expiresAt || '');
  const reviewable = idValid(actorId) && actorId === entry.ownerId && draft.ownerId === entry.ownerId &&
    entry.visibility === 'private' && entry.persistence === 'not-implemented' &&
    draft.entryId === entry.id && draft.sourceRevision === entry.revision &&
    draft.status === 'proposal-only' && draft.confirmation === 'not-confirmed' && draft.delivery === 'held' &&
    draft.revocation === 'required-before-implementation' && Number.isFinite(now) && Number.isFinite(expires) && expires > now &&
    draft.recipientIds.length > 0 && draft.recipientIds.length <= 5 &&
    new Set(draft.recipientIds).size === draft.recipientIds.length &&
    draft.recipientIds.every(id => idValid(id) && id !== entry.ownerId) &&
    draft.selectedFields.length > 0 && new Set(draft.selectedFields).size === draft.selectedFields.length &&
    draft.selectedFields.every(field => fields[entry.kind].includes(field));
  return { reviewable, delivery: 'held', code: reviewable ? 'ready-for-review' : 'invalid-review' };
}

/** Policy boundaries, not claims that retention, export, deletion or crisis runtime exists. */
export const FAITH_PRIVACY_CONTRACT = Object.freeze({
  version: 'proposal-v1', privateByDefault: true, inviterOrLeaderAccess: 'none',
  staffAccess: 'none-by-default', analyticsBodyContent: 'prohibited', urlsBodyContent: 'prohibited',
  logBodyContent: 'prohibited', spiritualScores: 'prohibited',
  persistence: 'held-for-reviewed-schema-and-rls',
  retention: 'owner-policy-required', export: 'owner-authenticated-design-required',
  deletion: 'cascade-and-backup-retention-review-required', sharing: 'held-for-explicit-consent-and-revocation',
  recommendations: 'held-for-content-and-privacy-review',
  crisisRuntime: 'held-for-safety-review', crisisMonitoringPromise: 'none',
  automaticLeaderOrEmergencyDisclosure: 'not-authorized',
  minorAndJurisdictionPolicy: 'owner-review-required',
} as const);
