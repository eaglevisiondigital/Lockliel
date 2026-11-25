import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import route, { config } from '../netlify/functions/lockliel-member-read.mjs';
import { createMemberReadHandler } from '../netlify/lib/member-read-server.mjs';
import { ISOLATED_MEMBER_PROJECT, ISOLATED_MEMBER_SITE, ISOLATED_MEMBER_URL, MEMBER_READ_PATH, pinMemberOrigin } from '../netlify/lib/member-read-binding.mjs';
import { projectMemberProfile, projectMemberPreferences } from '../netlify/lib/member-read-projection.mjs';

const NOW = 1793552400000;
const A = '00000000-0000-4000-8000-000000000001';
const B = '00000000-0000-4000-8000-000000000002';
const SESSION_A = '10000000-0000-4000-8000-000000000001';
const SESSION_B = '10000000-0000-4000-8000-000000000002';
const binding = { project: ISOLATED_MEMBER_PROJECT, site: ISOLATED_MEMBER_SITE, deploy: 'a'.repeat(24), source: 'b'.repeat(40) };
const origin = `https://${binding.deploy}--jade-unicorn-642f40.netlify.app`;
const context = () => ({ site: { id: binding.site }, deploy: { id: binding.deploy, context: 'branch-deploy' } });
const baseClaims = (owner = A) => ({ sub: owner, session_id: owner === A ? SESSION_A : SESSION_B, role: 'authenticated', aud: 'authenticated', iss: `${ISOLATED_MEMBER_URL}/auth/v1`, exp: NOW / 1000 + 3600, aal: 'aal1' });
const token = claims => `eyJhbGciOiJFUzI1NiJ9.${Buffer.from(JSON.stringify(claims)).toString('base64url')}.synthetic-signature`;
const profileRow = (owner = A) => ({ id: owner, first_name: owner === A ? 'Synthetic' : 'Second', last_name: 'Member', onboarding_status: 'active' });
const preferenceRow = (owner = A) => ({ profile_id: owner, ministry_email: true, faith_boost_email: false, book_release_email: true, partner_email: false, sms_updates: false, updated_at: '2026-11-01T12:00:00.000Z' });
const jsonResponse = (value, status = 200) => Response.json(value, { status });
function request({ claims = baseClaims(), headers = {}, suffix = '', method = 'GET', cookie } = {}) {
  return new Request(origin + MEMBER_READ_PATH + suffix, { method, headers: {
    cookie: cookie ?? `lockliel_access=${token(claims)}; lockliel_refresh=never-used-synthetic`,
    'x-lockliel-read-nonce': 'c'.repeat(32), 'x-lockliel-read-generation': '7', ...headers,
  } });
}
function harness(overrides = {}) {
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url, options });
    if (overrides.fetchImpl) return overrides.fetchImpl(url, options, calls.length);
    const claims = JSON.parse(Buffer.from(options.headers.Authorization.split('.')[1], 'base64url').toString());
    if (url.endsWith('/auth/v1/user')) return jsonResponse({ id: claims.sub, email: 'synthetic@example.invalid', user_metadata: { staff: true } });
    if (url.endsWith('/rpc/lockliel_current_session_active')) return jsonResponse(true);
    if (url.includes('/profiles?')) return jsonResponse([profileRow(claims.sub)]);
    if (url.includes('/communication_preferences?')) return jsonResponse([preferenceRow(claims.sub)]);
    throw new Error('Unexpected transport');
  };
  const handler = createMemberReadHandler({ enabled: true, expectedBinding: binding, runtimeSource: binding.source, expectedOrigin: origin, publishableKey: 'sb_publishable_synthetic_only_not_a_real_key', fetchImpl, now: () => NOW, ...overrides, fetchImpl });
  return { handler, calls };
}
async function body(response) { return response.json(); }

for (const [label, runtime] of [['anonymous', context()], ['production-context', { ...context(), deploy: { ...context().deploy, context: 'production' } }], ['test-context', { ...context(), deploy: { ...context().deploy, context: 'dev' } }], ['unknown-context', undefined]]) {
  test(`default route always closed: ${label}`, async () => {
    const response = await route(request(), runtime);
    assert.equal(response.status, 503);
    assert.equal(response.headers.has('set-cookie'), false);
    assert.deepEqual(await body(response), { error: 'Member read unavailable.' });
  });
}
test('trusted current permalink is explicit, historical name is not inferred', () => {
  assert.equal(pinMemberOrigin(binding, origin), origin);
  assert.equal(pinMemberOrigin(binding, 'https://acceptance--lockliel-course-acceptance-jxtgtfff.netlify.app'), null);
});
test('only reviewed route configured, no scheduler or deployment hook', () => assert.deepEqual(config, { path: MEMBER_READ_PATH }));
for (const [label, overrides] of [
  ['default disabled', { enabled: false }], ['missing binding', { expectedBinding: undefined }],
  ['production project', { expectedBinding: { ...binding, project: 'bsndfhbemstyrrglajat' } }],
  ['wrong site', { expectedBinding: { ...binding, site: 'production-site' } }],
  ['missing deploy', { expectedBinding: { ...binding, deploy: '' } }],
  ['missing source', { expectedBinding: { ...binding, source: '' } }],
  ['source mismatch', { runtimeSource: 'f'.repeat(40) }],
  ['service key', { publishableKey: 'sb_secret_synthetic_only' }],
  ['legacy service JWT', { publishableKey: token({ role: 'service_role' }) }],
  ['missing key', { publishableKey: undefined }],
  ['missing origin', { expectedOrigin: undefined }],
  ['production origin', { expectedOrigin: 'https://lockliel.com' }],
  ['nonpermalink alias', { expectedOrigin: 'https://jade-unicorn-642f40.netlify.app' }],
  ['wrong deploy permalink', { expectedOrigin: `https://${'f'.repeat(24)}--jade-unicorn-642f40.netlify.app` }],
  ['origin path', { expectedOrigin: `${origin}/my-lockliel` }],
]) {
  test(`configuration fails before transport: ${label}`, async () => {
    const { handler, calls } = harness(overrides);
    assert.equal((await handler(request(), context())).status, 503);
    assert.equal(calls.length, 0);
  });
}
for (const [label, changed] of [
  ['missing context', undefined], ['unknown', {}],
  ['production context', { site: { id: binding.site }, deploy: { id: binding.deploy, context: 'production' } }],
  ['preview context', { site: { id: binding.site }, deploy: { id: binding.deploy, context: 'deploy-preview' } }],
  ['wrong site', { site: { id: 'wrong' }, deploy: context().deploy }],
  ['wrong deploy', { site: context().site, deploy: { id: 'f'.repeat(24), context: 'branch-deploy' } }],
]) {
  test(`runtime rejects: ${label}`, async () => {
    const { handler, calls } = harness();
    assert.equal((await handler(request(), changed)).status, 503);
    assert.equal(calls.length, 0);
  });
}
for (const [label, options, expectedStatus] of [
  ['owner query', { suffix: `?owner=${B}` }, 400], ['nonce query', { suffix: '?nonce=abc' }, 400],
  ['post body route', { method: 'POST' }, 405], ['browser bearer', { headers: { Authorization: `Bearer ${token(baseClaims(B))}` } }, 400],
  ['foreign origin', { headers: { origin: 'https://lockliel.com' } }, 403],
  ['cross-site', { headers: { 'sec-fetch-site': 'cross-site' } }, 403],
  ['sibling site', { headers: { 'sec-fetch-site': 'same-site' } }, 403],
  ['bad nonce', { headers: { 'x-lockliel-read-nonce': 'short' } }, 400],
  ['bad generation', { headers: { 'x-lockliel-read-generation': '0' } }, 400],
  ['absent access', { cookie: 'lockliel_refresh=never-used' }, 401],
  ['duplicate access', { cookie: `lockliel_access=${token(baseClaims())}; lockliel_access=${token(baseClaims(B))}` }, 401],
]) {
  test(`request authority rejected: ${label}`, async () => {
    const { handler, calls } = harness();
    assert.equal((await handler(request(options), context())).status, expectedStatus);
    assert.equal(calls.length, 0);
  });
}
for (const [label, patch] of [
  ['expired', { exp: NOW / 1000 }], ['future not-before', { nbf: NOW / 1000 + 1 }],
  ['production issuer', { iss: 'https://bsndfhbemstyrrglajat.supabase.co/auth/v1' }],
  ['wrong ref', { ref: 'bsndfhbemstyrrglajat' }], ['service role', { role: 'service_role' }],
  ['anon role', { role: 'anon' }], ['wrong audience', { aud: 'service_role' }],
  ['missing session', { session_id: '' }], ['malformed subject', { sub: 'owner-a' }], ['unknown assurance', { aal: 'super-admin' }],
]) {
  test(`untrusted token filtered before network: ${label}`, async () => {
    const { handler, calls } = harness();
    assert.equal((await handler(request({ claims: { ...baseClaims(), ...patch } }), context())).status, 401);
    assert.equal(calls.length, 0);
  });
}
test('valid owner read, exact private display projection and correlation', async () => {
  const { handler, calls } = harness();
  const response = await handler(request(), context());
  assert.equal(response.status, 200);
  const envelope = await body(response);
  assert.deepEqual(Object.keys(envelope).sort(), ['version', 'nonce', 'generation', 'boundary', 'validUntil', 'binding', 'identity', 'profile', 'preferences', 'dashboard'].sort());
  assert.equal(envelope.version, 'lockliel-member-server-read-v1');
  assert.equal(envelope.nonce, 'c'.repeat(32));
  assert.equal(envelope.generation, 7);
  assert.match(envelope.boundary, /^[a-f0-9]{64}$/);
  assert.equal(envelope.validUntil, NOW + 60000);
  assert.deepEqual(envelope.binding, binding);
  assert.deepEqual(envelope.profile, { status: 'ready', value: { displayName: 'Synthetic Member', initials: 'SM', onboardingStatus: 'active' } });
  assert.deepEqual(envelope.preferences, { status: 'ready', value: { ministryEmail: true, faithBoostEmail: false, bookReleaseEmail: true, partnerEmail: false, smsUpdates: false, revision: '2026-11-01T12:00:00.000Z' } });
  assert.deepEqual(envelope.dashboard, { status: 'ready', value: { courseAvailability: 'unavailable' } });
  assert.equal(calls.length, 5);
  assert.equal(response.headers.get('cache-control'), 'private, no-store');
  assert.equal(response.headers.get('netlify-cdn-cache-control'), 'no-store');
  assert.equal(response.headers.get('vary'), 'Cookie');
  assert.equal(response.headers.has('set-cookie'), false);
  assert.equal(response.headers.has('access-control-allow-origin'), false);
  for (const call of calls) {
    assert.equal(new URL(call.url).origin, ISOLATED_MEMBER_URL);
    assert.equal(call.options.method, 'GET');
    assert.equal(call.options.redirect, 'error');
    assert.equal(call.options.credentials, 'omit');
    assert.equal(Object.hasOwn(call.options, 'body'), false);
    assert.equal(Object.hasOwn(call.options.headers, 'cookie'), false);
  }
  const encoded = JSON.stringify(envelope);
  for (const secret of [A, SESSION_A, 'synthetic@example.invalid', 'staff', 'user_metadata', 'never-used-synthetic']) assert.equal(encoded.includes(secret), false);
});
test('A/B bearer filters and opaque boundaries never contaminate each other', async () => {
  const { handler, calls } = harness();
  const a = await body(await handler(request(), context()));
  const b = await body(await handler(request({ claims: baseClaims(B) }), context()));
  assert.equal(a.profile.value.displayName, 'Synthetic Member');
  assert.equal(b.profile.value.displayName, 'Second Member');
  assert.notEqual(a.boundary, b.boundary);
  for (const call of calls.filter(c => c.url.includes('/profiles?') || c.url.includes('/communication_preferences?'))) {
    const uid = JSON.parse(Buffer.from(call.options.headers.Authorization.split('.')[1], 'base64url').toString()).sub;
    assert.equal(new URL(call.url).searchParams.get(call.url.includes('/profiles?') ? 'id' : 'profile_id'), `eq.${uid}`);
  }
});
test('staff-like metadata never confers other-member authority or grants', async () => {
  const { handler, calls } = harness();
  const claims = { ...baseClaims(), aal: 'aal2', user_metadata: { staff: true, owner: B }, app_metadata: { role: 'admin' } };
  const envelope = await body(await handler(request({ claims }), context()));
  assert.equal(envelope.identity.value.assurance, 'aal2');
  assert.equal(envelope.profile.value.displayName, 'Synthetic Member');
  assert.equal(calls.some(c => /staff_roles|role|group|prayer|notes|faith_profiles/u.test(c.url)), false);
  assert.equal(JSON.stringify(envelope).includes('admin'), false);
});
for (const [label, authValue, authStatus] of [
  ['provider denies token', {}, 401], ['provider failure', {}, 503], ['provider identity mismatch', { id: B }, 200], ['anonymous identity', { id: A, is_anonymous: true }, 200],
]) {
  test(`provider authentication fails closed: ${label}`, async () => {
    const { handler, calls } = harness({ fetchImpl: async () => jsonResponse(authValue, authStatus) });
    const response = await handler(request(), context());
    assert.equal(response.status, authStatus === 503 ? 503 : 401);
    assert.equal(calls.length, 1);
  });
}
for (const active of [false, null, 'true', [], { active: true }]) {
  test(`active RPC requires exact true: ${JSON.stringify(active)}`, async () => {
    const { handler, calls } = harness({ fetchImpl: async url => jsonResponse(url.endsWith('/auth/v1/user') ? { id: A } : active) });
    assert.equal((await handler(request(), context())).status, 401);
    assert.equal(calls.length, 2);
  });
}
test('revocation during read denies the final snapshot', async () => {
  let activeCalls = 0;
  const { handler } = harness({ fetchImpl: async url => {
    if (url.endsWith('/auth/v1/user')) return jsonResponse({ id: A });
    if (url.endsWith('/rpc/lockliel_current_session_active')) return jsonResponse(++activeCalls === 1);
    return jsonResponse(url.includes('/profiles?') ? [profileRow()] : [preferenceRow()]);
  } });
  assert.equal((await handler(request(), context())).status, 401);
});
test('expiry during read denies and never refreshes', async () => {
  let clock = NOW;
  const { handler, calls } = harness({ now: () => clock, fetchImpl: async url => {
    if (url.endsWith('/auth/v1/user')) return jsonResponse({ id: A });
    if (url.endsWith('/rpc/lockliel_current_session_active')) return jsonResponse(true);
    clock = NOW + 2000;
    return jsonResponse(url.includes('/profiles?') ? [profileRow()] : [preferenceRow()]);
  } });
  assert.equal((await handler(request({ claims: { ...baseClaims(), exp: NOW / 1000 + 1 } }), context())).status, 401);
  assert.equal(calls.some(c => c.url.includes('/token')), false);
});
test('validity never extends token expiry', async () => {
  const { handler } = harness();
  const envelope = await body(await handler(request({ claims: { ...baseClaims(), exp: NOW / 1000 + 3 } }), context()));
  assert.equal(envelope.validUntil, NOW + 3000);
});
test('network exception does not expose exception details', async () => {
  const { handler } = harness({ fetchImpl: async () => { throw new Error('secret token and private host'); } });
  const response = await handler(request(), context());
  assert.equal(response.status, 503);
  assert.deepEqual(await body(response), { error: 'Member read unavailable.' });
});
for (const [label, rows, expected] of [
  ['missing profile', [], 'missing'], ['foreign profile', [profileRow(B)], 'unavailable'], ['duplicate profile', [profileRow(), profileRow()], 'unavailable'],
  ['malformed profile', [{ ...profileRow(), first_name: 7 }], 'unavailable'], ['malformed status', [{ ...profileRow(), onboarding_status: null }], 'unavailable'],
]) {
  test(`profile state remains distinct: ${label}`, () => assert.equal(projectMemberProfile(rows, A).status, expected));
}
for (const [label, rows, expected] of [
  ['missing preferences', [], 'missing'], ['foreign preferences', [preferenceRow(B)], 'unavailable'], ['duplicate preferences', [preferenceRow(), preferenceRow()], 'unavailable'],
  ['string bool denied', [{ ...preferenceRow(), ministry_email: 'false' }], 'unavailable'], ['null bool denied', [{ ...preferenceRow(), sms_updates: null }], 'unavailable'],
  ['missing revision', [{ ...preferenceRow(), updated_at: null }], 'unavailable'], ['bad revision', [{ ...preferenceRow(), updated_at: 'yesterday' }], 'unavailable'],
]) {
  test(`preferences state remains distinct: ${label}`, () => assert.equal(projectMemberPreferences(rows, A).status, expected));
}
test('private fields and unrelated joins are stripped from projections', () => {
  const profile = projectMemberProfile([{ ...profileRow(), email: 'private@example.invalid', phone: 'private', notes: 'PRIVATE', role: 'admin' }], A);
  const preferences = projectMemberPreferences([{ ...preferenceRow(), email_consent_at: 'PRIVATE', sms_consent_at: 'PRIVATE', private_notes: 'PRIVATE' }], A);
  assert.equal(JSON.stringify([profile, preferences]).includes('PRIVATE'), false);
  assert.deepEqual(Object.keys(profile.value), ['displayName', 'initials', 'onboardingStatus']);
  assert.deepEqual(Object.keys(preferences.value), ['ministryEmail', 'faithBoostEmail', 'bookReleaseEmail', 'partnerEmail', 'smsUpdates', 'revision']);
});
test('profile upstream failure remains unavailable while preference read succeeds', async () => {
  const { handler } = harness({ fetchImpl: async url => {
    if (url.endsWith('/auth/v1/user')) return jsonResponse({ id: A });
    if (url.endsWith('/rpc/lockliel_current_session_active')) return jsonResponse(true);
    if (url.includes('/profiles?')) return jsonResponse({ error: 'private database failure' }, 500);
    return jsonResponse([preferenceRow()]);
  } });
  const envelope = await body(await handler(request(), context()));
  assert.deepEqual(envelope.profile, { status: 'unavailable' });
  assert.equal(envelope.preferences.status, 'ready');
  assert.equal(envelope.identity.value.displayName, 'Member');
  assert.equal(JSON.stringify(envelope).includes('private database failure'), false);
});
test('upstream permission failure returns forbidden, never null profile success', async () => {
  const { handler } = harness({ fetchImpl: async url => {
    if (url.endsWith('/auth/v1/user')) return jsonResponse({ id: A });
    if (url.endsWith('/rpc/lockliel_current_session_active')) return jsonResponse(true);
    return jsonResponse({}, 403);
  } });
  assert.equal((await handler(request(), context())).status, 403);
});
test('malformed or oversized provider response is unavailable', async () => {
  for (const value of ['not-json', 'x'.repeat(65537)]) {
    const { handler } = harness({ fetchImpl: async () => new Response(value, { headers: { 'content-type': 'application/json' } }) });
    assert.equal((await handler(request(), context())).status, 503);
  }
});
test('already aborted request performs no transport', async () => {
  const controller = new AbortController();
  controller.abort();
  const original = request();
  const aborted = new Request(original, { signal: controller.signal });
  const { handler, calls } = harness();
  assert.equal((await handler(aborted, context())).status, 401);
  assert.equal(calls.length, 0);
});
test('current stable active-session SQL is read-only and no new SQL is introduced', () => {
  const sql = readFileSync(new URL('../supabase/migrations/20260925175229_lockliel_require_active_session_for_staff_access.sql', import.meta.url), 'utf8');
  assert.match(sql, /public\.lockliel_current_session_active\(\)[\s\S]*?language sql\s+stable\s+security invoker/u);
  const implementation = readFileSync(new URL('../netlify/lib/member-read-server.mjs', import.meta.url), 'utf8');
  assert.doesNotMatch(implementation, /console\.|refreshSession\(|sessionCookies\(|service_role|method:\s*['"](?:POST|PATCH|DELETE|PUT)/u);
});

test('legitimate nullable profile names use a generic label, not metadata fallback', () => {
  assert.deepEqual(projectMemberProfile([{ ...profileRow(), first_name: null, last_name: null }], A), { status: 'ready', value: { displayName: 'Member', initials: 'M', onboardingStatus: 'active' } });
});
test('largest valid profile names and onboarding status remain supported', () => {
  const projected = projectMemberProfile([{ ...profileRow(), first_name: 'A'.repeat(120), last_name: 'B'.repeat(120), onboarding_status: 'n'.repeat(80) }], A);
  assert.equal(projected.status, 'ready');
  assert.equal(projected.value.displayName.length, 241);
  assert.equal(projected.value.onboardingStatus.length, 80);
});
test('assurance changes clear opaque account boundary', async () => {
  const { handler } = harness();
  const a = await body(await handler(request(), context()));
  const b = await body(await handler(request({ claims: { ...baseClaims(), aal: 'aal2' } }), context()));
  assert.notEqual(a.boundary, b.boundary);
});
