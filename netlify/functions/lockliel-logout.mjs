import { withProductionBackend } from "../lib/deployment-safety.mjs";
import {SUPABASE_URL,SUPABASE_KEY,json,parseCookies,clearCookie,ACCESS_COOKIE,REFRESH_COOKIE} from "../lib/lockliel-core.mjs";

/** Default behavior remains the existing production logout. Explicit local policy belongs to the isolated composition. */
export function createLogoutHandler({
 supabaseUrl=SUPABASE_URL,supabaseKey=SUPABASE_KEY,fetchImpl=(...args)=>fetch(...args),
 makeJson=json,readCookies=parseCookies,makeClearCookie=clearCookie,
 logoutScope,formatResult
}={}) {
 return async(request)=>{
  if(request.method!=="POST")return makeJson({error:"Method not allowed"},405);
  const c=readCookies(request),access=c[ACCESS_COOKIE];
  let result=null;
  if(access)result=await fetchImpl(supabaseUrl+"/auth/v1/logout"+(logoutScope===undefined?"":"?scope="+encodeURIComponent(logoutScope)),{method:"POST",headers:{apikey:supabaseKey,Authorization:"Bearer "+access}}).catch(()=>null);
  const cookies=[makeClearCookie(ACCESS_COOKIE),makeClearCookie(REFRESH_COOKIE)];
  return formatResult?formatResult({attempted:Boolean(access),result,cookies}):makeJson({ok:true},200,cookies);
 };
}

export default /* @__PURE__ */ withProductionBackend(/* @__PURE__ */ createLogoutHandler());

export const config={
 path:"/api/lockliel-auth/logout",
 rateLimit:{windowLimit:30,windowSize:60,aggregateBy:["ip"]}
};
