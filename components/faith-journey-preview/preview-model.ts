import type { ActionPlan, FaithEntryDraft, GrowthArea, PrivatePrayer, ScriptureAnchor } from '../../lib/faith-journey/contracts';

export const SYNTHETIC_OWNER = 'synthetic-preview-owner';
export const PREVIEW_EDITIONS = [
  { id: 'fixture-only', label: 'Synthetic edition A' },
  { id: 'fixture-alternative', label: 'Synthetic edition B' },
  { id: 'unavailable-edition', label: 'Synthetic edition unavailable' },
] as const;
export type FaithPreviewState = Readonly<{
  context: 'owner' | 'unknown';
  preferredEdition: string;
  anchors: readonly ScriptureAnchor[];
  prayers: readonly PrivatePrayer[];
  growthAreas: readonly GrowthArea[];
  plans: readonly ActionPlan[];
}>;
export function initialFaithPreviewState(): FaithPreviewState {
  return { context: 'owner', preferredEdition: '', anchors: [], prayers: [], growthAreas: [], plans: [] };
}
export type FaithPreviewAction = Readonly<{ type: 'reset' }> | Readonly<{ type: 'context'; value: unknown }> |
  Readonly<{ type: 'edition'; value: unknown }> | Readonly<{ type: 'add'; entry: FaithEntryDraft }> |
  Readonly<{ type: 'archive-prayer'; id: string }> | Readonly<{ type: 'remove'; kind: FaithEntryDraft['kind']; id: string }> |
  Readonly<{ type: 'step'; planId: string; stepId: string; done: boolean }>;
const text = (value: unknown, max: number) => typeof value === 'string' && value.trim().length > 0 && value.length <= max;
/** UI state only. Not Auth/RLS. Unknown context clears private state rather than exposing old drafts. */
export function reduceFaithPreview(state: FaithPreviewState, action: FaithPreviewAction): FaithPreviewState {
  if (action.type === 'reset') return initialFaithPreviewState();
  if (action.type === 'context') return { ...initialFaithPreviewState(), context: action.value === 'owner' ? 'owner' : 'unknown' };
  if (state.context !== 'owner') return state;
  if (action.type === 'edition') return { ...state, preferredEdition: typeof action.value === 'string' && PREVIEW_EDITIONS.some(item => item.id === action.value) ? action.value : 'unavailable-selection' };
  if (action.type === 'add') {
    const entry = action.entry;
    if (!entry || entry.ownerId !== SYNTHETIC_OWNER || entry.visibility !== 'private' || entry.persistence !== 'not-implemented' ||
        !Array.isArray(entry.audience) || entry.audience.length || entry.revision !== 0 || !text(entry.id, 120)) return state;
    const privateFields = { id: entry.id, ownerId: SYNTHETIC_OWNER, revision: 0, visibility: 'private' as const, audience: [] as const, persistence: 'not-implemented' as const };
    if (entry.kind === 'prayer' && text(entry.body, 4000) && state.prayers.length < 12) {
      return { ...state, prayers: [...state.prayers, { ...privateFields, kind: 'prayer', body: entry.body, status: 'open' }] };
    }
    if (entry.kind === 'scripture-anchor' && typeof entry.reflection === 'string' && entry.reflection.length <= 4000 && entry.verseTextStorage === 'none' &&
        entry.version?.providerId === 'synthetic' && ['fixture-only', 'fixture-alternative'].includes(entry.version.versionId) &&
        entry.version.edition === 'synthetic-v1' && entry.reference?.book === 'JHN' && state.anchors.length < 12) {
      return { ...state, anchors: [...state.anchors, { ...privateFields, kind: 'scripture-anchor',
        reference: { book: entry.reference.book, start: { chapter: entry.reference.start.chapter, verse: entry.reference.start.verse }, end: { chapter: entry.reference.end.chapter, verse: entry.reference.end.verse } },
        version: { providerId: entry.version.providerId, versionId: entry.version.versionId, edition: entry.version.edition }, reflection: entry.reflection, verseTextStorage: 'none' }] };
    }
    if (entry.kind === 'growth-area' && text(entry.title, 120) && typeof entry.reflection === 'string' && entry.reflection.length <= 4000 && state.growthAreas.length < 12) {
      return { ...state, growthAreas: [...state.growthAreas, { ...privateFields, kind: 'growth-area', title: entry.title, reflection: entry.reflection, progressMeaning: 'member-self-report-only' }] };
    }
    if (entry.kind === 'action-plan' && text(entry.title, 120) && entry.steps.length > 0 && entry.steps.length <= 8 &&
        entry.steps.every(step => text(step.id, 120) && text(step.text, 240) && step.state === 'planned') &&
        new Set(entry.steps.map(step => step.id)).size === entry.steps.length && state.plans.length < 12 &&
        (entry.growthAreaId === null || state.growthAreas.some(area => area.id === entry.growthAreaId))) {
      return { ...state, plans: [...state.plans, { ...privateFields, kind: 'action-plan', title: entry.title, growthAreaId: entry.growthAreaId,
        steps: entry.steps.map(step => ({ id: step.id, text: step.text, state: 'planned' })), progressMeaning: 'member-self-report-only' }] };
    }
    return state;
  }
  if (action.type === 'archive-prayer') return { ...state, prayers: state.prayers.map(prayer => prayer.id === action.id ? { ...prayer, status: prayer.status === 'open' ? 'archived' : 'open' } : prayer) };
  if (action.type === 'step') return { ...state, plans: state.plans.map(plan => plan.id === action.planId ? { ...plan, steps: plan.steps.map(step => step.id === action.stepId ? { ...step, state: action.done ? 'done' : 'planned' } : step) } : plan) };
  if (action.type === 'remove') {
    if (action.kind === 'prayer') return { ...state, prayers: state.prayers.filter(entry => entry.id !== action.id) };
    if (action.kind === 'scripture-anchor') return { ...state, anchors: state.anchors.filter(entry => entry.id !== action.id) };
    if (action.kind === 'growth-area') return { ...state, growthAreas: state.growthAreas.filter(entry => entry.id !== action.id), plans: state.plans.map(plan => plan.growthAreaId === action.id ? { ...plan, growthAreaId: null } : plan) };
    if (action.kind === 'action-plan') return { ...state, plans: state.plans.filter(entry => entry.id !== action.id) };
  }
  return state;
}
