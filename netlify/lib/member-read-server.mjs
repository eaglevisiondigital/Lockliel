import { createHash } from 'node:crypto';
import { ACCESS_COOKIE, parseCookies, jwtClaims } from './lockliel-core.mjs';
import { ISOLATED_MEMBER_URL, ISOLATED_MEMBER_PROJECT, MEMBER_READ_PATH, MEMBER_SERVER_READ_VERSION, pinMemberBinding, memberRuntimeMatches, pinMemberOrigin } from './member-read-binding.mjs';
import { PROFILE_SELECT, PREFERENCES_SELECT, projectMemberProfile, projectMemberPreferences } from './member-read-projection.mjs';

const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
const headers = Object.freeze({ 'Content-Type': 'application/json', 'Cache-Control': 'private, no-store', 'CDN-Cache-Control': 'no-store', 'Netlify-CDN-Cache-Control': 'no-store', Vary: 'Cookie', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer' });
const reply = (data, status = 200) => new Response(JSON.stringify(data), { status, headers });
export const unavailableMemberRead = () => reply({ error: 'Member read unavailable.' }, 503);
class Denied extends Error { constructor(status = 401) { super('Denied'); this.status = status; } }
function validClaims(claims, nowMs) {
  return claims && uuid.test(claims.sub || '') && uuid.test(claims.session_id || '') && claims.role === 'authenticated' &&
    claims.aud === 'authenticated' && claims.iss === `${ISOLATED_MEMBER_URL}/auth/v1` &&
    (claims.ref === undefined || claims.ref === ISOLATED_MEMBER_PROJECT) &&
    (claims.aal === 'aal1' || claims.aal === 'aal2') && Number.isSafeInteger(claims.exp) && claims.exp * 1000 > nowMs &&
    (claims.nbf === undefined || (Number.isSafeInteger(claims.nbf) && claims.nbf * 1000 <= nowMs));
}
async function boundedJson(response) {
  if (!response || !response.ok || response.redirected || !/^application\/json\b/i.test(response.headers.get('content-type') || '')) throw new Error('Upstream unavailable');
  const reader = response.body?.getReader();
  if (!reader) throw new Error('Upstream unavailable');
  let size = 0;
  const chunks = [];
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 65536) { await reader.cancel(); throw new Error('Upstream unavailable'); }
      chunks.push(Buffer.from(value));
    }
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } finally { reader.releaseLock(); }
}

/** Candidate composition seam, not a deployment switch. The exported route remains closed.
 * An authorized future artifact must pin a new deploy + source, supply its publishable key
 * privately, and attest runtime context. Tests supply only synthetic tokens and mock fetch.
 */
export function createMemberReadHandler({ enabled = false, expectedBinding, runtimeSource, expectedOrigin, publishableKey, fetchImpl, now = Date.now, runtimeContext = 'branch-deploy', runtimePublished, expectedReadiness } = {}) {
  const binding = pinMemberBinding(expectedBinding, runtimeSource);
  const origin = pinMemberOrigin(binding, expectedOrigin);
  const configured = enabled === true && binding && origin && typeof fetchImpl === 'function' && typeof now === 'function' && /^sb_publishable_[A-Za-z0-9_-]{12,200}$/.test(publishableKey || '');
  return async function memberRead(request, context) {
    if (!configured || !memberRuntimeMatches(binding, context, runtimeContext, runtimePublished)) return unavailableMemberRead();
    try {
      const url = new URL(request.url);
      if (request.method !== 'GET') return reply({ error: 'Method not allowed.' }, 405);
      if (url.origin !== origin || url.pathname !== MEMBER_READ_PATH || url.search ||
          request.headers.has('authorization') || request.headers.get('content-length') && request.headers.get('content-length') !== '0') return reply({ error: 'Invalid read request.' }, 400);
      if (request.headers.get('origin') && request.headers.get('origin') !== url.origin ||
          ['cross-site', 'same-site'].includes(request.headers.get('sec-fetch-site'))) return reply({ error: 'Forbidden.' }, 403);
      const nonce = request.headers.get('x-lockliel-read-nonce');
      const generationRaw = request.headers.get('x-lockliel-read-generation');
      if (!/^[a-f0-9]{32}$/.test(nonce || '') || !/^[1-9]\d{0,8}$/.test(generationRaw || '')) return reply({ error: 'Invalid read request.' }, 400);
      const rawCookies = request.headers.get('cookie') || '';
      const accessCount = rawCookies.split(';').filter(item => item.trim().startsWith(`${ACCESS_COOKIE}=`)).length;
      const access = parseCookies(request)[ACCESS_COOKIE];
      if (accessCount !== 1 || !access || access.length > 16000 || access.split('.').length !== 3) throw new Denied();
      const claims = jwtClaims(access);
      if (!validClaims(claims, now())) throw new Denied();
      const outboundHeaders = { apikey: publishableKey, Authorization: `Bearer ${access}`, Accept: 'application/json' };
      const get = async path => {
        if (!validClaims(claims, now()) || request.signal.aborted) throw new Denied();
        return fetchImpl(`${ISOLATED_MEMBER_URL}${path}`, { method: 'GET', headers: outboundHeaders, redirect: 'error', cache: 'no-store', credentials: 'omit', referrerPolicy: 'no-referrer', signal: AbortSignal.any([request.signal, AbortSignal.timeout(8000)]) });
      };
      const authResponse = await get('/auth/v1/user');
      if (authResponse.status === 401 || authResponse.status === 403) throw new Denied();
      const user = await boundedJson(authResponse);
      if (!user || user.id !== claims.sub || user.is_anonymous === true) throw new Denied();
      const checkActive = async () => {
        const response = await get('/rest/v1/rpc/lockliel_current_session_active');
        if (response.status === 401 || response.status === 403) throw new Denied();
        if (await boundedJson(response) !== true) throw new Denied();
      };
      await checkActive();
      if (expectedReadiness !== undefined) {
        if (expectedReadiness?.schema !== 280 || expectedReadiness?.paused !== true || expectedReadiness?.protocol !== '278-v1') return unavailableMemberRead();
        const readiness = await boundedJson(await get('/rest/v1/rpc/lockliel_course_cutover_status'));
        if (readiness?.paused !== true || readiness?.schemaReady !== true || readiness?.protocol !== expectedReadiness.protocol) return unavailableMemberRead();
      }
      const owner = encodeURIComponent(user.id);
      const safeProjection = async (path, project) => {
        try {
          const response = await get(path);
          if (response.status === 401 || response.status === 403) throw new Denied(response.status);
          return project(await boundedJson(response), user.id);
        } catch (error) {
          if (error instanceof Denied) throw error;
          return { status: 'unavailable' };
        }
      };
      const [profile, preferences] = await Promise.all([
        safeProjection(`/rest/v1/profiles?id=eq.${owner}&select=${PROFILE_SELECT}&limit=1`, projectMemberProfile),
        safeProjection(`/rest/v1/communication_preferences?profile_id=eq.${owner}&select=${PREFERENCES_SELECT}&limit=1`, projectMemberPreferences),
      ]);
      await checkActive();
      const validUntil = Math.min(now() + 60000, claims.exp * 1000);
      if (!validClaims(claims, now()) || validUntil <= now() || request.signal.aborted) throw new Denied();
      const displayName = profile.status === 'ready' ? profile.value.displayName : 'Member';
      const initials = profile.status === 'ready' ? profile.value.initials : 'M';
      const boundary = createHash('sha256').update(JSON.stringify([binding.project, binding.site, binding.deploy, binding.source, claims.sub, claims.session_id, claims.aal])).digest('hex');
      return reply({ version: MEMBER_SERVER_READ_VERSION, nonce, generation: Number(generationRaw), boundary, validUntil, binding,
        identity: { status: 'ready', value: { displayName, initials, assurance: claims.aal } }, profile, preferences,
        dashboard: { status: 'ready', value: { courseAvailability: 'unavailable' } } });
    } catch (error) {
      if (error instanceof Denied) return reply({ error: error.status === 403 ? 'Forbidden.' : 'Unauthorized.' }, error.status);
      return unavailableMemberRead();
    }
  };
}
