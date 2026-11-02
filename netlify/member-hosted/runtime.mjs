import { createMemberReadHandler, unavailableMemberRead } from '../lib/member-read-server.mjs';
import { validateHostedPin, hostedContextMatches, privatePublishableKey, HOSTED_LOGIN_PATH, HOSTED_LOGOUT_PATH, HOSTED_READ_PATH } from './binding.mjs';
import { createHostedTransport, createHostedReadTransport, isolatedTokenClaims } from './transport.mjs';
import { parseCookies, ACCESS_COOKIE, json } from '../lib/lockliel-core.mjs';
import { ISOLATED_MEMBER_URL } from '../lib/member-read-binding.mjs';
import { createLoginHandler } from '../functions/lockliel-login.mjs';
import { createLogoutHandler } from '../functions/lockliel-logout.mjs';
import { isolatedSessionCookies, isolatedClearCookie, isolatedClearCookies } from './session-cookies.mjs';

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
  const bytesBody=Buffer.concat(parts);
  const value=JSON.parse(bytesBody.toString('utf8'));
  if(!value||typeof value!=='object'||Array.isArray(value))throw Error('Invalid');
  return new Request(request.url,{method:'POST',headers:request.headers,body:bytesBody,signal:request.signal});
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


function withClearedCookies(result) {
  const headers=new Headers(result.headers);
  headers.delete('Set-Cookie');
  for(const cookie of isolatedClearCookies())headers.append('Set-Cookie',cookie);
  return new Response(result.body,{status:result.status,headers});
}
function authBodyAllowed(value,path){
  if(path===HOSTED_LOGOUT_PATH)return Object.keys(value).length===0;
  return Object.keys(value).sort().join()==='email,password' && typeof value.email==='string' && typeof value.password==='string' &&
    value.email.length<=254 && value.password.length>0 && value.password.length<=128 && /^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(value.email.trim());
}
/** New ordinary-member Auth slice: both independent flags must be explicitly ON.
 * Only provider Context and the compiled pin confer runtime identity. */
function createActualHostedAuth({pin:value,runtimeSource,enabled=false,authEnabled=false,keyReader,fetchImpl,now=Date.now}={},path){
  const pin=validateHostedPin(value);
  return async function actualHostedAuth(request,context){
    if(enabled!==true||authEnabled!==true||!hostedContextMatches(pin,context,runtimeSource))return unavailableMemberRead();
    try{
      const blocked=requestGate(request,pin,path);if(blocked)return blocked;
      const safe=await boundedAuthRequest(request);
      if(!authBodyAllowed(await safe.clone().json(),path))return secureResponse(withClearedCookies(response(400,'Invalid isolated request.')));
      const access=parseCookies(safe)[ACCESS_COOKIE];
      if(path===HOSTED_LOGOUT_PATH&&!isolatedTokenClaims(access,now())){
        // Local cleanup remains possible without any private key or upstream call.
        const local=createLogoutHandler({supabaseUrl:ISOLATED_MEMBER_URL,supabaseKey:'',readCookies:()=>({}),makeClearCookie:isolatedClearCookie,
          formatResult:({cookies})=>json({ok:true,localCleared:true,revocation:'not-attempted'},200,cookies)});
        return secureResponse(await local(safe));
      }
      const key=privatePublishableKey(keyReader);
      if(!key){
        if(path===HOSTED_LOGOUT_PATH)return secureResponse(json({ok:true,localCleared:true,revocation:'unverified'},200,isolatedClearCookies()));
        return secureResponse(withClearedCookies(response(503,'Isolated authentication unavailable.')));
      }
      const confined=createHostedTransport({pin,keyReader,fetchImpl,now});
      let handler;
      if(path===HOSTED_LOGIN_PATH){
        handler=createLoginHandler({supabaseUrl:ISOLATED_MEMBER_URL,supabaseKey:key,fetchImpl:confined,makeSessionCookies:isolatedSessionCookies,
          verifiedTotp:user=>Array.isArray(user?.factors)&&user.factors.some(f=>f.status==='verified'),
          onGrantDenied:data=>data?.code==='isolated_mfa_unavailable'&&['verified','unverified'].includes(data.revocation)
            ?json({error:'Additional verification is unavailable in this review.',requiresMfa:true,revocation:data.revocation},403,isolatedClearCookies())
            :json({error:"We couldn't sign you in with those details."},401,isolatedClearCookies()),
          onMfaRequired:async session=>{
            const revoke=await confined(ISOLATED_MEMBER_URL+'/auth/v1/logout?scope=local',{method:'POST',headers:{apikey:key,Authorization:'Bearer '+session.access_token}});
            return json({error:'Additional verification is unavailable in this review.',requiresMfa:true,revocation:revoke.ok?'verified':'unverified'},403,isolatedClearCookies());
          }});
      }else{
        handler=createLogoutHandler({supabaseUrl:ISOLATED_MEMBER_URL,supabaseKey:key,fetchImpl:confined,makeClearCookie:isolatedClearCookie,logoutScope:'local',
          formatResult:({result,cookies})=>json({ok:true,localCleared:true,revocation:result?.ok?'verified':'unverified'},200,cookies)});
      }
      const result=await handler(safe);
      // Failed login never leaves the previous account's browser cookies intact.
      return secureResponse(path===HOSTED_LOGIN_PATH&&!result.ok?withClearedCookies(result):result);
    }catch{
      return secureResponse(withClearedCookies(response(503,'Isolated authentication unavailable.')));
    }
  };
}
export function createHostedLogin(options={}){return createActualHostedAuth(options,HOSTED_LOGIN_PATH);}
export function createHostedLogout(options={}){return createActualHostedAuth(options,HOSTED_LOGOUT_PATH);}

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
