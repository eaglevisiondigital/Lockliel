import {SUPABASE_URL,SUPABASE_KEY,json,sessionCookies,authUser,refreshSession} from "../lib/lockliel-core.mjs";
export default async(request)=>{
 if(request.method!=="POST")return json({error:"Method not allowed"},405);
 const b=await request.json().catch(()=>({})),access=String(b.accessToken||""),refresh=String(b.refreshToken||""),password=String(b.password||"");
 if(!access||!refresh||password.length<8||password.length>128)return json({error:"Use a valid recovery link and a password between 8 and 128 characters."},400);
 const user=await authUser(access);if(!user)return json({error:"This recovery link is invalid or expired."},401);
 const r=await fetch(SUPABASE_URL+"/auth/v1/user",{method:"PUT",headers:{apikey:SUPABASE_KEY,Authorization:"Bearer "+access,"Content-Type":"application/json"},body:JSON.stringify({password})});
 if(!r.ok){const d=await r.json().catch(()=>({}));return json({error:d.msg||d.error_description||"Unable to update password."},r.status);}
 const refreshed=await refreshSession(refresh).catch(()=>null);
 const session=refreshed?.access_token?refreshed:{access_token:access,refresh_token:refresh,expires_in:3600};
 return json({ok:true},200,sessionCookies(session));
};
export const config={path:"/api/lockliel-auth/reset-password",rateLimit:{windowLimit:10,windowSize:60,aggregateBy:["ip"]}};