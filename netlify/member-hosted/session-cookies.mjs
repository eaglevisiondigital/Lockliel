import { sessionCookies, clearCookie, ACCESS_COOKIE, REFRESH_COOKIE } from '../lib/lockliel-core.mjs';

/** Reuse the existing serializer without changing process-wide deployment settings. */
export function secureSessionCookie(value) {
  if(typeof value!=='string')throw Error('Invalid isolated cookie.');
  const parts=value.split(';').map(part=>part.trim());
  const pair=parts.shift();
  if(!/^(lockliel_access|lockliel_refresh)=[^;\s]*$/.test(pair || ''))throw Error('Invalid isolated cookie.');
  const allowed=new Set(['path','httponly','samesite','max-age','secure']);
  const entries=parts.map(part=>[part.split('=')[0].toLowerCase(),part]);
  if(entries.some(([name])=>!allowed.has(name))||new Set(entries.map(([name])=>name)).size!==entries.length)throw Error('Invalid isolated cookie.');
  const attrs=new Map(entries);
  if(attrs.get('path')!=='Path=/'||attrs.get('httponly')!=='HttpOnly'||attrs.get('samesite')!=='SameSite=Lax'||!/^Max-Age=\d+$/.test(attrs.get('max-age')||'')||attrs.has('secure')&&attrs.get('secure')!=='Secure')throw Error('Invalid isolated cookie.');
  return attrs.has('secure')?value:value+'; Secure';
}
export function isolatedSessionCookies(session){return sessionCookies(session).map(secureSessionCookie);}
export function isolatedClearCookie(name){if(![ACCESS_COOKIE,REFRESH_COOKIE].includes(name))throw Error('Invalid isolated cookie.');return secureSessionCookie(clearCookie(name));}
export function isolatedClearCookies(){return [isolatedClearCookie(ACCESS_COOKIE),isolatedClearCookie(REFRESH_COOKIE)];}
