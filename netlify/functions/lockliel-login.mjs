import { withProductionBackend } from "../lib/deployment-safety.mjs";
import {
  SUPABASE_URL,
  SUPABASE_KEY,
  json,
  sessionCookies,
  sessionAal,
  hasVerifiedTotp
} from "../lib/lockliel-core.mjs";

/** Dependency injection preserves the guarded default; isolated composition supplies its own confined dependencies. */
export function createLoginHandler({
  supabaseUrl = SUPABASE_URL, supabaseKey = SUPABASE_KEY,
  fetchImpl = (...args) => fetch(...args), makeJson = json,
  makeSessionCookies = sessionCookies, aalForSession = sessionAal,
  verifiedTotp = hasVerifiedTotp, onMfaRequired, onGrantDenied
} = {}) {
return async(request)=>{
  if(request.method!=="POST")return makeJson({error:"Method not allowed"},405);

  const b=await request.json().catch(()=>({}));
  const email=String(b.email||"").trim().toLowerCase();
  const password=String(b.password||"");

  if(
    !email||
    email.length>254||
    !/^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(email)||
    !password||
    password.length>128
  ){
    return makeJson({error:"Enter a valid email address and password."},400);
  }

  const r=await fetchImpl(
    supabaseUrl+"/auth/v1/token?grant_type=password",
    {
      method:"POST",
      headers:{apikey:supabaseKey,"Content-Type":"application/json"},
      body:JSON.stringify({email,password})
    }
  );

  const d=await r.json().catch(()=>({}));
  if(!r.ok||!d.access_token){
    if(typeof onGrantDenied === "function") return onGrantDenied(d);
    return makeJson({
      error:d.msg||d.error_description||"We couldn't sign you in with those details."
    },401);
  }

  const aal=aalForSession(d.access_token);
  const requiresMfa=verifiedTotp(d.user)&&aal!=="aal2";
  if(requiresMfa && typeof onMfaRequired === "function") return onMfaRequired(d,request);

  return makeJson(
    {ok:true,requiresMfa,aal},
    200,
    makeSessionCookies(d)
  );
};
}

export default /* @__PURE__ */ withProductionBackend(/* @__PURE__ */ createLoginHandler());

export const config={
  path:"/api/lockliel-auth/login",
  rateLimit:{windowLimit:30,windowSize:60,aggregateBy:["ip"]}
};