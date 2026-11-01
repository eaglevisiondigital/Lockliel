import test from 'node:test';
import assert from 'node:assert/strict';
import { initialFaithPreviewState, reduceFaithPreview, SYNTHETIC_OWNER } from '../components/faith-journey-preview/preview-model.ts';
import { createPrivatePrayerDraft, createScriptureAnchorDraft, parseScriptureReference } from '../lib/faith-journey/index.ts';
import { readFileSync } from 'node:fs';
import {isFaithIdPrefix, isSyntheticOwnerView, preferredEditionIntent, selectedSyntheticEdition} from '../components/faith-journey-preview/workspace-contract.ts';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
const base = (id) => ({id, ownerId: SYNTHETIC_OWNER, revision: 0, visibility: 'private', audience: [], persistence: 'not-implemented'});
const prayer = (id = 'synthetic-prayer') => createPrivatePrayerDraft({...base(id), body: 'Invented private example.'});
const grow = {...base('synthetic-area'), kind: 'growth-area', title: 'Synthetic patience example', reflection: 'Invented situation.', progressMeaning: 'member-self-report-only'};
const plan = {...base('synthetic-plan'), kind: 'action-plan', title: 'One synthetic step', growthAreaId: 'synthetic-area', steps: [{id: 'synthetic-step', text: 'Practice a pause.', state: 'planned'}], progressMeaning: 'member-self-report-only'};
const add = (state, entry) => reduceFaithPreview(state, {type: 'add', entry});

test('preview starts private, empty, and without a selected translation', () => {
  const state = initialFaithPreviewState();
  assert.equal(state.context, 'owner');
  assert.equal(state.preferredEdition, '');
  assert.deepEqual([state.anchors, state.prayers, state.growthAreas, state.plans], [[], [], [], []]);
});
test('edition selection is explicit and unavailable selections do not silently fall back', () => {
  let state = reduceFaithPreview(initialFaithPreviewState(), {type: 'edition', value: 'fixture-alternative'});
  assert.equal(state.preferredEdition, 'fixture-alternative');
  state = reduceFaithPreview(state, {type: 'edition', value: 'unavailable-edition'});
  assert.equal(state.preferredEdition, 'unavailable-edition');
  assert.equal(reduceFaithPreview(state, {type: 'edition', value: 'unapproved-real-version'}).preferredEdition, 'unavailable-selection');
});
test('unknown identity discards prior private data and rejects subsequent mutations', () => {
  const populated = add(initialFaithPreviewState(), prayer());
  const unknown = reduceFaithPreview(populated, {type: 'context', value: 'unknown'});
  assert.deepEqual(unknown.prayers, []);
  assert.equal(add(unknown, prayer()), unknown);
  assert.equal(reduceFaithPreview(unknown, {type: 'edition', value: 'fixture-only'}), unknown);
  assert.equal(reduceFaithPreview(populated, {type: 'context', value: 'unexpected'}).context, 'unknown');
  assert.deepEqual(reduceFaithPreview(unknown, {type: 'context', value: 'owner'}), initialFaithPreviewState());
});
test('public/foreign-owner/stored payloads are rejected and hidden extra fields omitted', () => {
  const state = initialFaithPreviewState();
  for (const patch of [{ownerId: 'other'}, {visibility: 'public'}, {audience: ['leader']}, {persistence: 'cloud'}, {revision: 1}]) assert.equal(add(state, {...prayer(), ...patch}), state);
  const result = add(state, {...prayer(), staffNote: 'not allowed', tracking: 'not allowed'});
  assert.equal(Object.hasOwn(result.prayers[0], 'staffNote'), false);
  assert.equal(Object.hasOwn(result.prayers[0], 'tracking'), false);
});
test('prayer archive/reopen/remove changes memory only without prayer-event claims', () => {
  let state = add(initialFaithPreviewState(), prayer());
  state = reduceFaithPreview(state, {type: 'archive-prayer', id: 'synthetic-prayer'});
  assert.equal(state.prayers[0].status, 'archived');
  state = reduceFaithPreview(state, {type: 'archive-prayer', id: 'synthetic-prayer'});
  assert.equal(state.prayers[0].status, 'open');
  assert.deepEqual(reduceFaithPreview(state, {type: 'remove', kind: 'prayer', id: 'synthetic-prayer'}).prayers, []);
});
test('synthetic anchor retains chosen edition and no verse text or implicit audience', () => {
  const anchor = createScriptureAnchorDraft({...base('synthetic-anchor'), reference: parseScriptureReference('John 3:1-3').reference,
    version: {providerId: 'synthetic', versionId: 'fixture-alternative', edition: 'synthetic-v1'}, reflection: ''});
  const state = add(initialFaithPreviewState(), {...anchor, verseText: 'must not carry'});
  assert.equal(state.anchors.length, 1);
  assert.equal(state.anchors[0].version.versionId, 'fixture-alternative');
  assert.equal(Object.hasOwn(state.anchors[0], 'verseText'), false);
  assert.deepEqual(state.anchors[0].audience, []);
  assert.equal(add(initialFaithPreviewState(), {...anchor, version: {...anchor.version, providerId: 'real'}}).anchors.length, 0);
});
test('growth area and practical plan stay private; step is self-reported, not a score', () => {
  let state = add(initialFaithPreviewState(), grow);
  state = add(state, plan);
  assert.equal(state.plans[0].growthAreaId, grow.id);
  state = reduceFaithPreview(state, {type: 'step', planId: plan.id, stepId: 'synthetic-step', done: true});
  assert.equal(state.plans[0].steps[0].state, 'done');
  assert.equal(state.plans[0].progressMeaning, 'member-self-report-only');
  assert.equal(Object.hasOwn(state.plans[0], 'score'), false);
});
test('a removed growth area does not leave a dangling plan reference', () => {
  const state = add(add(initialFaithPreviewState(), grow), plan);
  const result = reduceFaithPreview(state, {type: 'remove', kind: 'growth-area', id: grow.id});
  assert.deepEqual(result.growthAreas, []);
  assert.equal(result.plans[0].growthAreaId, null);
});
test('unknown growth links, empty steps and oversized step content fail closed', () => {
  const state = add(initialFaithPreviewState(), grow);
  for (const patch of [{growthAreaId: 'unknown'}, {steps: []}, {steps: [{id: 'step', text: 'x'.repeat(241), state: 'planned'}]}]) assert.equal(add(state, {...plan, ...patch}), state);
});
test('bounded fixture collections and reset prevent accumulation or retained preference', () => {
  let state = initialFaithPreviewState();
  for (let index = 0; index < 13; index++) state = add(state, prayer(`prayer-${index}`));
  assert.equal(state.prayers.length, 12);
  state = reduceFaithPreview(state, {type: 'edition', value: 'fixture-only'});
  assert.deepEqual(reduceFaithPreview(state, {type: 'reset'}), initialFaithPreviewState());
});
test('prototype source has no transport, persistence, secret, HTML execution or real crisis integration', () => {
  for (const file of ['faith-journey-preview.tsx', 'scripture-drawer.tsx', 'preview-model.ts', 'faith-journey-workspace.tsx', 'scripture-encouragement.tsx', 'synthetic-scripture.ts', 'workspace-contract.ts']) {
    const source = readFileSync(new URL(`../components/faith-journey-preview/${file}`, import.meta.url), 'utf8');
    assert.doesNotMatch(source, /\b(?:fetch|XMLHttpRequest|WebSocket|EventSource)\s*\(|localStorage|sessionStorage|indexedDB|document\.cookie|dangerouslySetInnerHTML|SUPABASE|TURNSTILE|process\.env/);
  }
});
test('drawer declares modal lifecycle, Escape close, Tab containment and focus return', () => {
  const source = readFileSync(new URL('../components/faith-journey-preview/scripture-drawer.tsx', import.meta.url), 'utf8');
  assert.match(source, /showModal\(\)/);
  assert.match(source, /returnTo\.focus\(\)/);
  assert.match(source, /onCancel=/);
  assert.match(source, /event\.key !== 'Tab'/);
  assert.match(source, /aria-labelledby=\{`\$\{idPrefix\}-scripture-title`\}/);
  assert.match(source, /aria-describedby=\{`\$\{idPrefix\}-scripture-description`\}/);
});

test('actual React SSR gives every select a stable explicit label without option text', async () => {
  const root = fileURLToPath(new URL('../', import.meta.url));
  const output = await build({
    stdin: {contents: `import React from 'react'; import {renderToStaticMarkup} from 'react-dom/server'; import Preview from './components/faith-journey-preview/faith-journey-preview.tsx'; export const markup=renderToStaticMarkup(React.createElement(Preview));`, resolveDir: root},
    bundle: true, write: false, format: 'cjs', platform: 'node', jsx: 'automatic',
    external: ['react', 'react/*', 'react-dom', 'react-dom/*'],
    plugins: [{name: 'css-module-markup-test', setup(api) {api.onLoad({filter: /\.module\.css$/}, () => ({contents: 'export default {}', loader: 'js'}));}}],
  });
  const compiled = {exports: {}};
  const execute = new Function('module', 'exports', 'require', output.outputFiles[0].text);
  execute(compiled, compiled.exports, createRequire(import.meta.url));
  const html = compiled.exports.markup;
  for (const [id, label] of [
    ['faith-preview-context', 'Identity context'], ['faith-preview-provider', 'Synthetic provider state'],
    ['standalone-faith-preferred-edition', 'Preferred translation preview'], ['standalone-faith-related-growth-area', 'Related growth area'],
  ]) {
    assert.ok(html.includes(`<label for="${id}">${label}</label>`), `Explicit exact label: ${label}`);
    assert.match(html, new RegExp(`<select[^>]* id="${id}"`));
  }
  assert.equal((html.match(/<select/g) || []).length, 4);
});

test('workspace view contract denies absent/unknown/malformed identities and invalid prefixes', () => {
  for (const identity of [null, undefined, {}, {status:'unknown'}, {status:'owner',boundaryKey:'x'}, {status:'synthetic-owner'}, {status:'synthetic-owner',boundaryKey:'invalid key'}]) assert.equal(isSyntheticOwnerView(identity),false);
  assert.equal(isSyntheticOwnerView({status:'synthetic-owner',boundaryKey:'synthetic-case-a'}),true);
  assert.equal(isFaithIdPrefix('integrated-faith'),true);
  for(const prefix of ['', 'x y', '1start', '<script>']) assert.equal(isFaithIdPrefix(prefix),false);
});
test('controlled preference contract never infers a default or coerces unknown values', () => {
  assert.equal(selectedSyntheticEdition({status:'unselected'}),'');
  assert.equal(selectedSyntheticEdition({status:'selected',editionId:'fixture-alternative'}),'fixture-alternative');
  for(const preference of [null, {status:'unknown'}, {status:'selected',editionId:'real-version'}, {status:'selected',editionId:{toString(){throw new Error('must not coerce');}}}]) assert.equal(selectedSyntheticEdition(preference),'unavailable-selection');
});
test('workspace intent allowlist contains no private draft values or permission grants', () => {
  assert.deepEqual(preferredEditionIntent(''),{type:'preferred-edition-change-requested',editionId:null});
  assert.deepEqual(preferredEditionIntent('fixture-only'),{type:'preferred-edition-change-requested',editionId:'fixture-only'});
  assert.equal(preferredEditionIntent({editionId:'fixture-only',body:'private'}),null);
  assert.equal(preferredEditionIntent('unapproved-real-version'),null);
});

async function renderWorkspace(propsExpression) {
  const root=fileURLToPath(new URL('../',import.meta.url));
  const output=await build({stdin:{contents:`import React from 'react';import {renderToStaticMarkup} from 'react-dom/server';import {FaithJourneyWorkspace as Workspace} from './components/faith-journey-preview/faith-journey-workspace.tsx';export const markup=renderToStaticMarkup(React.createElement(Workspace,${propsExpression}));`,resolveDir:root},bundle:true,write:false,format:'cjs',platform:'node',jsx:'automatic',external:['react','react/*','react-dom','react-dom/*'],plugins:[{name:'css-module-workspace-test',setup(api){api.onLoad({filter:/\.module\.css$/},()=>({contents:'export default {}',loader:'js'}));}}]});
  const compiled={exports:{}};new Function('module','exports','require',output.outputFiles[0].text)(compiled,compiled.exports,createRequire(import.meta.url));return compiled.exports.markup;
}
test('actual integrated workspace renders one reusable region and no app landmarks', async()=>{
  const html=await renderWorkspace(`{identity:{status:'synthetic-owner',boundaryKey:'case-a'},editionPreference:{status:'unselected'},onIntent:()=>{},idPrefix:'integrated-faith',providerMode:'ready',resetKey:0}`);
  assert.doesNotMatch(html,/<(?:header|main|nav|footer|h1)(?:\s|>)/);
  assert.ok(html.includes('id="integrated-faith-workspace-title"'));
  assert.ok(html.includes('Scripture-based encouragement preview'));
  assert.ok(html.includes('invented placeholders'));
  assert.ok(html.includes('<label for="integrated-faith-preferred-edition">Preferred translation preview</label>'));
  assert.ok(html.includes('id="integrated-faith-synthetic-prayer"'));
});
test('actual integrated workspace default unknown view exposes no private inputs or drafts',async()=>{
  for(const props of ['{}',`{identity:{status:'unknown'},editionPreference:{status:'selected',editionId:'fixture-only'},onIntent:()=>{},idPrefix:'integrated-faith'}`]){
    const html=await renderWorkspace(props);assert.ok(html.includes('Private faith workspace unavailable'));assert.doesNotMatch(html,/<(?:input|textarea|select|form|dialog)(?:\s|>)/);
  }
});
test('actual unknown preferred edition is explicit and is not rendered as selected A',async()=>{
  const html=await renderWorkspace(`{identity:{status:'synthetic-owner',boundaryKey:'case-a'},editionPreference:{status:'unknown'},onIntent:()=>{},idPrefix:'integrated-faith'}`);
  assert.ok(html.includes('Edition preference unavailable'));assert.ok(html.includes('No default or fallback was chosen.'));
  assert.doesNotMatch(html,/value="fixture-only" selected/);
});
