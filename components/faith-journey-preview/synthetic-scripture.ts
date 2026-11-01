import type { PassageResult, VersionIdentity } from '../../lib/faith-journey/contracts';
import { createSyntheticBibleProvider, parseScriptureReference, readPassage } from '../../lib/faith-journey/index';
import type { FaithProviderPreviewMode } from './workspace-contract';

/** Same reviewed synthetic fixture for every viewer; no private reflection or preference is sent anywhere. */
export async function readSyntheticPreviewPassage(edition: string, providerMode: FaithProviderPreviewMode): Promise<PassageResult> {
  if (providerMode !== 'ready') return {status: 'unavailable', code: 'provider-unavailable'};
  const source = createSyntheticBibleProvider();
  const provider = edition === 'fixture-alternative' ? {
    ...source,
    versions: [{...source.versions[0], versionId: 'fixture-alternative', name: 'Synthetic edition B'}],
    versification: () => source.versification(source.versions[0]),
    async read(identity: VersionIdentity, reference: Parameters<typeof source.read>[1]) {
      const result = await source.read(source.versions[0], reference);
      if (result.status !== 'available') return result;
      return {...result, version: identity, verses: result.verses.map(verse => ({...verse, text: `[Synthetic edition B placeholder ${verse.chapter}:${verse.verse}. Not Scripture.]`}))};
    },
  } : source;
  const parsed = parseScriptureReference('John 3:1-3');
  return readPassage(provider, {version: {providerId: 'synthetic', versionId: edition, edition: 'synthetic-v1'},
    reference: parsed.ok ? parsed.reference : null, use: 'display', territory: 'US', at: '2026-11-01T12:00:00Z'});
}
