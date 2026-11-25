import test from 'node:test';
import assert from 'node:assert/strict';
import { parseScriptureReference, formatScriptureReference, referencePositions } from '../lib/faith-journey/index.ts';
import { createSyntheticBibleProvider, readPassage } from '../lib/faith-journey/index.ts';
import { createPrivatePrayerDraft, createScriptureAnchorDraft, createSharingReviewDraft, assessSharingReview, FAITH_PRIVACY_CONTRACT } from '../lib/faith-journey/index.ts';

const at = '2026-11-01T12:00:00Z';
const reference = parseScriptureReference('John 3:1-3').reference;
const identity = { providerId: 'synthetic', versionId: 'fixture-only', edition: 'synthetic-v1' };
const request = (overrides = {}) => ({ version: identity, reference, use: 'display', territory: 'US', at, ...overrides });
const changeRights = (changes) => {
  const source = createSyntheticBibleProvider();
  return { ...source, versions: [{ ...source.versions[0], rights: { ...source.versions[0].rights, ...changes } }] };
};
const privatePrayer = () => createPrivatePrayerDraft({ id: 'fixture-prayer', ownerId: 'synthetic-a', body: 'Synthetic private reflection.' });
const reviewDraft = (entry) => ({ ...createSharingReviewDraft(entry), recipientIds: ['synthetic-b'], selectedFields: ['body'], expiresAt: '2026-11-02T12:00:00Z' });

for (const [input, normalized] of [
  [' John 3:1 ', 'John 3:1'], ['Jn 3:1-3', 'John 3:1-3'], ['JHN 3:2-4:2', 'John 3:2-4:2'],
  ['1John 1:1–2', '1 John 1:1-2'], ['Song of Solomon 1:1', 'Song of Songs 1:1'],
]) test(`reference normalization: ${input.trim()}`, () => {
  const result = parseScriptureReference(input);
  assert.equal(result.ok, true);
  assert.equal(formatScriptureReference(result.reference), normalized);
});
for (const input of [null, {}, '', 'John', 'John 3', 'John 3:0', 'John 0:1', 'John 3:3-1',
  'John 4:1-3:2', 'John 3:1; Romans 1:1', 'John 3:1-Matthew 1:1', 'John 3:1a',
  '<script>John 3:1</script>', 'John 9999:1', 'Unknown 1:1', 'x'.repeat(121)]) {
  test(`malformed or unsupported reference rejected: ${JSON.stringify(input)}`, () => assert.equal(parseScriptureReference(input).ok, false));
}
test('syntax success is not edition validation; unknown chapter or verse stays unavailable', () => {
  const map = { JHN: { 3: 3, 4: 2 } };
  assert.equal(referencePositions(parseScriptureReference('John 3:4').reference, map, 5), null);
  assert.equal(referencePositions(parseScriptureReference('John 2:1').reference, map, 5), null);
  assert.equal(referencePositions(parseScriptureReference('John 3:1-4:2').reference, map, 4), null);
  assert.equal(referencePositions(reference, map, 0), null);
  assert.equal(referencePositions(parseScriptureReference('John 3:1-5:1').reference, map, 100), null);
  assert.deepEqual(referencePositions(parseScriptureReference('John 3:3-4:2').reference, map, 3), [
    {chapter: 3, verse: 3}, {chapter: 4, verse: 1}, {chapter: 4, verse: 2},
  ]);
});
test('synthetic adapter produces visibly synthetic placeholders with attribution, disabled cache, no default choice', async () => {
  const result = await readPassage(createSyntheticBibleProvider(), request());
  assert.equal(result.status, 'available');
  assert.equal(result.contentKind, 'synthetic-placeholder');
  assert.equal(result.verses.length, 3);
  assert.ok(result.verses.every(verse => verse.text.includes('Not Scripture.')));
  assert.ok(result.attribution[0].label.includes('Synthetic'));
  assert.deepEqual(result.cache, {mode: 'disabled'});
});
for (const field of ['providerId', 'versionId', 'edition']) {
  test(`no silent fallback when ${field} is unavailable`, async () => {
    assert.deepEqual(await readPassage(createSyntheticBibleProvider(), request({version: {...identity, [field]: 'other'}})), {status: 'unavailable', code: 'version-unavailable'});
  });
}
test('a missing selected version is an invalid request, not an implicit default', async () => {
  assert.deepEqual(await readPassage(createSyntheticBibleProvider(), request({version: null})), {status: 'unavailable', code: 'invalid-request'});
});
for (const [label, changes] of [
  ['unreviewed license', {status: 'review-required'}], ['missing decision', {decisionRecord: null}],
  ['expired review', {expiresAt: at}], ['future review', {reviewedAt: '2026-11-02T00:00:00Z'}],
  ['missing attribution', {attribution: []}], ['unreviewed telemetry', {telemetry: 'review-required'}],
  ['wrong territory', {territories: ['CA']}], ['display not permitted', {permittedUses: []}],
]) test(`rights fail closed before adapter access: ${label}`, async () => {
  let reads = 0;
  const provider = { ...changeRights(changes), async read() { reads++; throw new Error('must not read'); } };
  assert.equal((await readPassage(provider, request())).status, 'unavailable');
  assert.equal(reads, 0);
});
test('synthetic-only review cannot license real Scripture', async () => {
  const provider = createSyntheticBibleProvider();
  assert.equal((await readPassage({...provider, versions: [{...provider.versions[0], contentKind: 'scripture'}]}, request())).code, 'rights-denied');
});
for (const use of ['cache', 'export', 'share']) test(`display right does not permit ${use}`, async () => {
  assert.equal((await readPassage(createSyntheticBibleProvider(), request({use}))).code, 'rights-denied');
});
test('cache requires both its use permission and explicit bounded policy', async () => {
  assert.equal((await readPassage(changeRights({permittedUses: ['display', 'cache']}), request({use: 'cache'}))).code, 'rights-denied');
  const result = await readPassage(changeRights({permittedUses: ['display', 'cache'], cache: {mode: 'bounded', maxAgeSeconds: 60}}), request({use: 'cache'}));
  assert.deepEqual(result.cache, {mode: 'bounded', maxAgeSeconds: 60});
});
test('invalid time, territory and operation never reach provider', async () => {
  for (const patch of [{at: 'yesterday'}, {territory: 'worldwide'}, {use: 'train-ai'}]) {
    assert.equal((await readPassage(createSyntheticBibleProvider(), request(patch))).code, 'invalid-request');
  }
});
test('reference must be edition-valid and inside its rights budget', async () => {
  assert.equal((await readPassage(createSyntheticBibleProvider(), request({reference: parseScriptureReference('John 3:4').reference}))).code, 'invalid-reference');
  assert.equal((await readPassage(changeRights({maxVersesPerRequest: 2}), request())).code, 'invalid-reference');
});
test('provider failure is sanitized without fallback or raw error disclosure', async () => {
  const provider = {...createSyntheticBibleProvider(), async read() {throw new Error('private provider diagnostic');}};
  const result = await readPassage(provider, request());
  assert.deepEqual(result, {status: 'unavailable', code: 'provider-unavailable'});
  assert.equal(JSON.stringify(result).includes('private provider diagnostic'), false);
  assert.deepEqual(await readPassage({...provider, async read() {return {status: 'unavailable'};}}, request()), result);
});
for (const [label, change] of [
  ['wrong edition', result => ({...result, version: {...result.version, edition: 'other'}})],
  ['wrong reference', result => ({...result, reference: {...result.reference, book: 'ROM'}})],
  ['missing verse', result => ({...result, verses: result.verses.slice(1)})],
  ['duplicate verse', result => ({...result, verses: [result.verses[0], result.verses[0], result.verses[2]]})],
  ['HTML payload', result => ({...result, verses: result.verses.map(verse => ({...verse, text: '<script>bad</script>'}))})],
  ['real content mislabeled', result => ({...result, contentKind: 'scripture'})],
]) test(`provider response denied: ${label}`, async () => {
  const source = createSyntheticBibleProvider();
  const provider = {...source, async read(...args) {return change(await source.read(...args));}};
  assert.equal((await readPassage(provider, request())).code, 'invalid-provider-response');
});
test('provider-only tracking data is omitted from result projection', async () => {
  const source = createSyntheticBibleProvider();
  const provider = {...source, versions: [{...source.versions[0], tracking: 'private', rights: {...source.versions[0].rights, tracking: 'private'}}], async read(...args) {
    const result = await source.read(...args);
    return {...result, tracking: 'private', verses: result.verses.map(verse => ({...verse, tracking: 'private'}))};
  }};
  assert.equal(JSON.stringify(await readPassage(provider, request())).includes('tracking'), false);
});
test('private prayer draft cannot be made public through extra input fields', () => {
  const input = {id: 'fixture-prayer', ownerId: 'synthetic-a', body: 'Synthetic private reflection.', visibility: 'public', audience: ['leader']};
  assert.deepEqual(privatePrayer(), createPrivatePrayerDraft(input));
  assert.deepEqual(privatePrayer().audience, []);
  assert.equal(privatePrayer().persistence, 'not-implemented');
  assert.throws(() => createPrivatePrayerDraft({...input, body: 'x'.repeat(4001)}));
});
test('anchor stores versioned reference and private reflection, not verse bytes or shared field extras', () => {
  const anchor = createScriptureAnchorDraft({id: 'fixture-anchor', ownerId: 'synthetic-a', reference, version: identity, reflection: 'Synthetic reflection.', verseText: 'must not carry', audience: ['leader']});
  assert.equal(anchor.verseTextStorage, 'none');
  assert.equal(Object.hasOwn(anchor, 'verseText'), false);
  assert.deepEqual(anchor.audience, []);
});
test('share review starts with no recipients, selected fields, consent or delivery', () => {
  const entry = privatePrayer(), draft = createSharingReviewDraft(entry);
  assert.deepEqual(draft.recipientIds, []);
  assert.deepEqual(draft.selectedFields, []);
  assert.equal(draft.confirmation, 'not-confirmed');
  assert.equal(assessSharingReview(entry, draft, entry.ownerId, at).reviewable, false);
  assert.equal(JSON.stringify(draft).includes(entry.body), false);
});
test('complete synthetic sharing review remains a held proposal, not a grant', () => {
  const entry = privatePrayer();
  assert.deepEqual(assessSharingReview(entry, reviewDraft(entry), entry.ownerId, at), {reviewable: true, delivery: 'held', code: 'ready-for-review'});
  assert.equal(entry.visibility, 'private');
});
for (const [label, patch, actor] of [
  ['other member', {}, 'synthetic-b'], ['stale revision', {sourceRevision: 2}, 'synthetic-a'],
  ['different owner', {ownerId: 'synthetic-b'}, 'synthetic-a'], ['no fields', {selectedFields: []}, 'synthetic-a'],
  ['unrelated fields', {selectedFields: ['financialInformation']}, 'synthetic-a'],
  ['duplicate recipient', {recipientIds: ['synthetic-b', 'synthetic-b']}, 'synthetic-a'],
  ['implicit leader audience', {recipientIds: ['all leaders']}, 'synthetic-a'],
  ['expired review', {expiresAt: at}, 'synthetic-a'], ['attempted send', {delivery: 'sent'}, 'synthetic-a'],
]) test(`sharing proposal rejected: ${label}`, () => {
  const entry = privatePrayer();
  assert.equal(assessSharingReview(entry, {...reviewDraft(entry), ...patch}, actor, at).reviewable, false);
});
test('privacy and crisis boundaries describe held work without monitoring or automatic disclosure', () => {
  assert.equal(FAITH_PRIVACY_CONTRACT.privateByDefault, true);
  assert.equal(FAITH_PRIVACY_CONTRACT.inviterOrLeaderAccess, 'none');
  assert.equal(FAITH_PRIVACY_CONTRACT.crisisRuntime, 'held-for-safety-review');
  assert.equal(FAITH_PRIVACY_CONTRACT.crisisMonitoringPromise, 'none');
  assert.equal(FAITH_PRIVACY_CONTRACT.automaticLeaderOrEmergencyDisclosure, 'not-authorized');
});

test('adapter catalog failures are sanitized', async () => {
  const provider = {...createSyntheticBibleProvider(), versification() {throw new Error('private metadata diagnostic');}};
  assert.deepEqual(await readPassage(provider, request()), {status: 'unavailable', code: 'provider-unavailable'});
});
test('adapter mutations cannot change expected version or reference', async () => {
  const source = createSyntheticBibleProvider();
  const provider = {...source, async read(version, ref) {
    version.edition = 'changed';
    ref.end.verse = 1;
    return {status: 'available', version, reference: ref, contentKind: 'synthetic-placeholder', verses: [{chapter: 3, verse: 1, text: 'Synthetic placeholder.'}]};
  }};
  const input = request();
  assert.equal((await readPassage(provider, input)).code, 'invalid-provider-response');
  assert.equal(input.version.edition, 'synthetic-v1');
  assert.equal(input.reference.end.verse, 3);
});

test('reference coordinate projection excludes unreviewed extra fields', async () => {
  const extraReference = {...reference, tracking: 'private', start: {...reference.start, tracking: 'private'}};
  const result = await readPassage(createSyntheticBibleProvider(), request({reference: extraReference}));
  assert.equal(JSON.stringify(result).includes('tracking'), false);
  const anchor = createScriptureAnchorDraft({id: 'fixture-anchor', ownerId: 'synthetic-a', reference: extraReference, version: identity, reflection: ''});
  assert.equal(JSON.stringify(anchor).includes('tracking'), false);
});
