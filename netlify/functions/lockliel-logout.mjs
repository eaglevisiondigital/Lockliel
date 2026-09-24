import {SUPABASE_URL,SUPABASE_KEY,json,parseCookies,clearCookie,ACCESS_COOKIE,REFRESH_COOKIE} from "../lib/lockliel-core.mjs";
export default async(request)=>{
 const c=parseCookies(request),access=c[ACCESS_COOKIE];
 if(access)await fetch(SUPABASE_URL+"/auth/v1/logout",{method:"POST",headers:{apikey:SUPABASE_KEY,Authorization:"Bearer "+access}}).catch(()=>{});
 return json({ok:true},200,[clearCookie(ACCESS_COOKIE),clearCookie(REFRESH_COOKIE)]);
};
export const config={path:"/api/lockliel-auth/logout"};