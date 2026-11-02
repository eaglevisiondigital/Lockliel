import { createMemberReadHandler, unavailableMemberRead } from '../lib/member-read-server.mjs';
import { validateHostedPin, hostedContextMatches, privatePublishableKey, HOSTED_LOGIN_PATH, HOSTED_LOGOUT_PATH, HOSTED_READ_PATH } from './binding.mjs';
import { createHostedTransport, createHostedReadTransport, isolatedTokenClaims } from './transport.mjs';
import { parseCookies, ACCESS_COOKIE } from '../lib/lockliel-core.mjs';

const baseHeaders = {'Content-Type':'application/json','Cache-Control':'private, no-store','CDN-Cache-Control':'no-store','Netlify-CDN-Cache-Control':'no-store','Vary':'Cookie','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'};
const response = (status, error) => Response.json({error},{status,headers:baseHeaders});
function requestGate(request, pin, path) {
  const url = new URL(request.url);
  if (url.origin !== pin.origin || url.pathname !== path || url.search || request.headers.has('authorization')) return response(400,'Invalid isolated request.');
  if (request.method !== (path === HOSTED_READ_PATH ? 'GET' : 'POST')) return response(405,'Method not allowed.');
  const site=request.headers.get('sec-fetch-site');
  if (site && site !== 'same-origin' && site !== 'none') return response(403,'Forbidden.');
  const origin=request.headers.get('origin');
  if (path !== HOSTED_READ_PATH && origin !== pin.origin || origin && origin !== pin.origin) return response(403,'Forbidden.');
  if (path !== HOSTED_READ_PATH && !/^application\/json\b/i.test(request.headers.get('content-type') || '')) return response(400,'Invalid isolated request.');
  return null;
}
async function boundedAuthRequest(request) {
  const reader=request.body?.getReader();
  if(!reader)throw Error('Invalid');
  let bytes=0; const parts=[];
  try { for(;;){const {done,value}=await reader.read();if(done)break;bytes+=value.byteLength;if(bytes>4096){await reader.cancel();throw Error('Invalid');}parts.push(Buffer.from(value));} }
  finally{reader.releaseLock();}
  return new Request(request.url,{method:'POST',headers:request.headers,body:Buffer.concat(parts),signal:request.signal});
}
function secureResponse(result) {
  if (!(result instanceof Response)) return unavailableMemberRead();
  const headers=new Headers(result.headers);
  for(const [key,value] of Object.entries(baseHeaders)) headers.set(key,value);
  // Existing sessionCookies is reused unchanged, but this isolated composition requires secure host-only cookies.
  for (const cookie of headers.getSetCookie()) {
    if (!/^(lockliel_access|lockliel_refresh)=/.test(cookie) || !/; Secure(?:;|$)/i.test(cookie) || !/; HttpOnly(?:;|$)/i.test(cookie) || !/; SameSite=Lax(?:;|$)/i.test(cookie) || /; Domain=/i.test(cookie)) return unavailableMemberRead();
  }
  headers.delete('Access-Control-Allow-Origin');
  return new Response(result.body,{status:result.status,headers});
}

/** Runtime authority comes from provider Context and compiled source, never request headers.
 * compose receives the key only after all gates. It must close over the unchanged reviewed Auth handler. */
export function createHostedAuthHandler({ pin: value, runtimeSource, enabled = false, keyReader, fetchImpl, compose, path, now = Date.now } = {}) {
  const pin=validateHostedPin(value);
  const configured=enabled===true && pin && [HOSTED_LOGIN_PATH,HOSTED_LOGOUT_PATH].includes(path) && typeof compose==='function';
  return async function hostedAuth(request,context) {
    if(!configured || !hostedContextMatches(pin,context,runtimeSource))return unavailableMemberRead();
    try {
      const blocked=requestGate(request,pin,path);if(blocked)return blocked;
      const key=privatePublishableKey(keyReader);if(!key)return unavailableMemberRead();
      const confined=createHostedTransport({pin,keyReader,fetchImpl,now});
      // Foreign bearer cookies must never reach even the confined logout transport.
      if(path===HOSTED_LOGOUT_PATH){const access=parseCookies(request)[ACCESS_COOKIE];if(access && !isolatedTokenClaims(access,now()))return response(401,'Unauthorized.');}
      const safeRequest=await boundedAuthRequest(request);
      const handler=compose({key,fetchImpl:confined});
      if(typeof handler!=='function')return unavailableMemberRead();
      return secureResponse(await handler(safeRequest,context));
    }catch{return unavailableMemberRead();}
  };
}

/** Full read projection composed into the exact isolated runtime; production export stays closed. */
export function createHostedMemberRead({pin:value,runtimeSource,enabled=false,keyReader,fetchImpl,now=Date.now}={}){
  const pin=validateHostedPin(value);
  return async function hostedMemberRead(request,context){
    if(enabled!==true || !hostedContextMatches(pin,context,runtimeSource))return unavailableMemberRead();
    try{
      const blocked=requestGate(request,pin,HOSTED_READ_PATH);if(blocked)return blocked;
      const key=privatePublishableKey(keyReader);if(!key)return unavailableMemberRead();
      const read=createMemberReadHandler({enabled:true,expectedBinding:pin.binding,runtimeSource,expectedOrigin:pin.origin,publishableKey:key,
        fetchImpl:createHostedReadTransport({pin,keyReader,fetchImpl,now}),now,runtimeContext:'deploy-preview',runtimePublished:false,
        expectedReadiness:{schema:280,protocol:pin.protocol,paused:pin.paused}});
      return await read(request,context);
    }catch{return unavailableMemberRead();}
  };
}
