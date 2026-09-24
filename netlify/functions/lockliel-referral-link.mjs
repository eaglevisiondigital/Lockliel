import {SUPABASE_URL,json,dbHeaders,requireSession,sessionCookies} from "../lib/lockliel-core.mjs";
export default async(request)=>{
 if(request.method!=="GET")return json({error:"Method not allowed"},405);
 const s=await requireSession(request);if(!s.user||!s.access)return json({error:"Unauthorized"},401);
 const h=dbHeaders(s.access),id=encodeURIComponent(s.user.id);
 const r=await fetch(SUPABASE_URL+"/rest/v1/referral_links?owner_id=eq."+id+"&campaign=eq.member-invite&active=eq.true&select=code&limit=1",{headers:h});
 const rows=r.ok?await r.json():[],code=rows?.[0]?.code;if(!code)return json({error:"Invite link unavailable"},404);
 const origin=new URL(request.url).origin;
 return json({code,url:origin+"/r/"+code},200,s.refreshed?sessionCookies(s.refreshed):[]);
};
export const config={path:"/api/lockliel/referral-link"};