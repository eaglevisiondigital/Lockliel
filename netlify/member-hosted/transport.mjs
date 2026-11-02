import { ISOLATED_MEMBER_URL, ISOLATED_MEMBER_PROJECT } from '../lib/member-read-binding.mjs';
import { PROFILE_SELECT, PREFERENCES_SELECT } from '../lib/member-read-projection.mjs';
import { jwtClaims } from '../lib/lockliel-core.mjs';
import { validateHostedPin, privatePublishableKey } from './binding.mjs';

const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
const denied = () => new Response('{"error":"Isolated request unavailable."}', { status: 503, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
export function isolatedTokenClaims(token, now = Date.now()) {
  if (typeof token !== 'string' || token.length > 16000 || token.split('.').length !== 3) return null;
  const c = jwtClaims(token);
  return c && UUID.test(c.sub || '') && UUID.test(c.session_id || '') && c.iss === `${ISOLATED_MEMBER_URL}/auth/v1` &&
    (c.ref === undefined || c.ref === ISOLATED_MEMBER_PROJECT) && c.role === 'authenticated' && c.aud === 'authenticated' &&
    ['aal1','aal2'].includes(c.aal) && Number.isSafeInteger(c.exp) && c.exp * 1000 > now &&
    (c.nbf === undefined || Number.isSafeInteger(c.nbf) && c.nbf * 1000 <= now) ? c : null;
}
function getPathAllowed(url, claims) {
  if (url.pathname === '/auth/v1/user' || ['/rest/v1/rpc/lockliel_current_session_active', '/rest/v1/rpc/lockliel_course_cutover_status'].includes(url.pathname)) return url.search === '';
  const preferences = url.pathname === '/rest/v1/communication_preferences';
  if (!preferences && url.pathname !== '/rest/v1/profiles') return false;
  const params = [...url.searchParams.entries()];
  return params.length === 3 && new Set(params.map(([key]) => key)).size === 3 &&
    url.searchParams.get(preferences ? 'profile_id' : 'id') === `eq.${claims.sub}` && url.searchParams.get('limit') === '1' &&
    url.searchParams.get('select') === (preferences ? PREFERENCES_SELECT : PROFILE_SELECT);
}
async function boundedJson(response) {
  if (!response || response.redirected || !/^application\/json\b/i.test(response.headers.get('content-type') || '')) throw Error('Unavailable');
  let count = 0; const parts = []; const reader = response.body?.getReader();
  if (!reader) throw Error('Unavailable');
  try {
    for (;;) { const {done,value}=await reader.read(); if(done)break; count+=value.byteLength; if(count>65536){await reader.cancel();throw Error('Unavailable');} parts.push(Buffer.from(value)); }
    return JSON.parse(Buffer.concat(parts).toString('utf8'));
  } finally { reader.releaseLock(); }
}
/** Lexical dependency for the reused Auth handlers and read factory. No global fetch mutation.
 * This function is not an authority or an endpoint: callers must first pass the runtime wrapper. */
export function createHostedTransport({ pin: suppliedPin, keyReader, fetchImpl, now = Date.now } = {}) {
  const pin = validateHostedPin(suppliedPin);
  return async function confinedFetch(input, options = {}) {
    try {
      const key = pin && privatePublishableKey(keyReader);
      if (!key || typeof fetchImpl !== 'function') return denied();
      if (typeof input !== 'string' || options.body instanceof ReadableStream) return denied();
      const url = new URL(input);
      if (url.origin !== ISOLATED_MEMBER_URL || url.username || url.password || url.hash || url.port) return denied();
      const method = options.method || 'GET';
      const incoming = new Headers(options.headers);
      if (incoming.get('apikey') !== key) return denied();
      const token = incoming.get('authorization')?.replace(/^Bearer /, '');
      const claims = isolatedTokenClaims(token, now());
      const login = method === 'POST' && url.pathname === '/auth/v1/token' && url.search === '?grant_type=password';
      const logout = method === 'POST' && url.pathname === '/auth/v1/logout' && !url.search && claims;
      const read = method === 'GET' && claims && getPathAllowed(url, claims) && options.body === undefined;
      if (!login && !logout && !read || login && incoming.has('authorization')) return denied();
      const headers = new Headers({ apikey: key, Accept: 'application/json' });
      let body;
      if (login) {
        if (typeof options.body !== 'string' || Buffer.byteLength(options.body) > 4096) return denied();
        const value = JSON.parse(options.body);
        if (!value || Object.keys(value).sort().join() !== 'email,password' || typeof value.email !== 'string' || value.email.length > 254 || typeof value.password !== 'string' || !value.password || value.password.length > 128) return denied();
        headers.set('Content-Type','application/json'); body=JSON.stringify({email:value.email,password:value.password});
      } else { headers.set('Authorization', `Bearer ${token}`); }
      const response = await fetchImpl(url.href, { method, headers, ...(body === undefined ? {} : {body}), redirect: 'error', credentials: 'omit', cache: 'no-store', referrerPolicy: 'no-referrer', signal: options.signal ? AbortSignal.any([options.signal, AbortSignal.timeout(8000)]) : AbortSignal.timeout(8000) });
      if (response.redirected || response.status >= 300 && response.status < 400) return denied();
      if (logout) return new Response(null, {status:response.ok ? 204 : 401});
      if (!response.ok) return new Response('{"error":"Isolated request denied."}', {status: [401,403].includes(response.status) ? response.status : 503, headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
      const data=await boundedJson(response);
      if (login) {
        const auth=isolatedTokenClaims(data?.access_token,now());
        if (!auth || !data.user || data.user.id !== auth.sub || data.user.is_anonymous === true || typeof data.refresh_token !== 'string' || data.refresh_token.length < 8 || data.refresh_token.length > 4096) return denied();
        return Response.json({access_token:data.access_token,refresh_token:data.refresh_token,expires_in:Math.min(3600,Math.max(1,Math.floor((auth.exp*1000-now())/1000))),user:{id:auth.sub,factors:Array.isArray(data.user.factors) ? data.user.factors.filter(f=>f?.factor_type==='totp' && f.status==='verified').map(()=>({factor_type:'totp',status:'verified'})) : []}});
      }
      return Response.json(data);
    } catch { return denied(); }
  };
}

/** The member-read artifact has an additional outer GET-only boundary. Auth helpers
 * are inactive and cannot be reached through this lexical read dependency. */
export function createHostedReadTransport({ pin: suppliedPin, keyReader, fetchImpl, now = Date.now } = {}) {
  const pin = validateHostedPin(suppliedPin);
  return async function readOnlyFetch(input, options = {}) {
    if ((options.method || 'GET') !== 'GET' || options.body !== undefined) return denied();
    try {
      const key = pin && privatePublishableKey(keyReader);
      if (!key || typeof fetchImpl !== 'function' || typeof input !== 'string') return denied();
      const url = new URL(input);
      if (url.origin !== ISOLATED_MEMBER_URL || url.username || url.password || url.hash || url.port) return denied();
      const supplied = new Headers(options.headers);
      const token = supplied.get('authorization')?.replace(/^Bearer /, '');
      const claims = isolatedTokenClaims(token, now());
      if (supplied.get('apikey') !== key || !claims || !getPathAllowed(url, claims)) return denied();
      const headers = new Headers({ apikey: key, Authorization: `Bearer ${token}`, Accept: 'application/json' });
      const result = await fetchImpl(url.href, { method: 'GET', headers, redirect: 'error', credentials: 'omit', cache: 'no-store', referrerPolicy: 'no-referrer', signal: options.signal ? AbortSignal.any([options.signal, AbortSignal.timeout(8000)]) : AbortSignal.timeout(8000) });
      if (result.redirected || result.status >= 300 && result.status < 400) return denied();
      if (!result.ok) return new Response('{"error":"Isolated request denied."}', {status:[401,403].includes(result.status)?result.status:503,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
      return Response.json(await boundedJson(result));
    } catch { return denied(); }
  };
}
