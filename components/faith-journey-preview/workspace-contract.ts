/** Host view contracts for the synthetic integrated candidate. These are not Auth/RLS. */
export type FaithWorkspaceIdentity = Readonly<{status: 'synthetic-owner'; boundaryKey: string}> | Readonly<{status: 'unknown'}>;
export type FaithEditionPreference = Readonly<{status: 'unselected'}> | Readonly<{status: 'selected'; editionId: string}> | Readonly<{status: 'unknown'}>;
export type FaithWorkspaceIntent = Readonly<{type: 'preferred-edition-change-requested'; editionId: string | null}> | Readonly<{type: 'reset-requested'}>;
export type FaithProviderPreviewMode = 'ready' | 'unavailable' | 'unknown';
export type FaithWorkspaceProps = Readonly<{
  identity: FaithWorkspaceIdentity;
  editionPreference: FaithEditionPreference;
  onIntent: (intent: FaithWorkspaceIntent) => void;
  idPrefix: string;
  providerMode?: FaithProviderPreviewMode;
  resetKey?: string | number;
}>;
export function isSyntheticOwnerView(identity: unknown): identity is Extract<FaithWorkspaceIdentity, {status: 'synthetic-owner'}> {
  if (!identity || typeof identity !== 'object') return false;
  const value = identity as Record<string, unknown>;
  return value.status === 'synthetic-owner' && typeof value.boundaryKey === 'string' && /^[A-Za-z0-9_-]{1,120}$/.test(value.boundaryKey);
}
export function isFaithIdPrefix(value: unknown): value is string {
  return typeof value === 'string' && /^[A-Za-z][A-Za-z0-9_-]{0,47}$/.test(value);
}
/** Unknown or malformed preference remains unavailable; no default is selected. */
export function selectedSyntheticEdition(preference: unknown): string {
  if (!preference || typeof preference !== 'object') return 'unavailable-selection';
  const value = preference as Record<string, unknown>;
  if (value.status === 'unselected') return '';
  if (value.status === 'selected' && typeof value.editionId === 'string' && ['fixture-only', 'fixture-alternative', 'unavailable-edition'].includes(value.editionId)) return value.editionId;
  return 'unavailable-selection';
}
/** Intent allowlist never carries private draft content, identities or a save/delivery claim. */
export function preferredEditionIntent(editionId: unknown): FaithWorkspaceIntent | null {
  if (editionId === '') return {type: 'preferred-edition-change-requested', editionId: null};
  return typeof editionId === 'string' && ['fixture-only', 'fixture-alternative', 'unavailable-edition'].includes(editionId)
    ? {type: 'preferred-edition-change-requested', editionId} : null;
}
