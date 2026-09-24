import {SUPABASE_URL,json,dbHeaders,requireSession,sessionCookies,clearCookie,ACCESS_COOKIE,REFRESH_COOKIE} from "../lib/lockliel-core.mjs";
export default async(request)=>{
 if(request.method!=="GET")return json({error:"Method not allowed"},405);
 const s=await requireSession(request);if(!s.user||!s.access)return json({authenticated:false},401,[clearCookie(ACCESS_COOKIE),clearCookie(REFRESH_COOKIE)]);
 const h=dbHeaders(s.access),id=encodeURIComponent(s.user.id);
 const [p,j]=await Promise.all([
  fetch(SUPABASE_URL+"/rest/v1/profiles?id=eq."+id+"&select=id,first_name,last_name,email,phone,city,region,country,onboarding_status,original_inviter_id,current_leader_id",{headers:h}),
  fetch(SUPABASE_URL+"/rest/v1/member_journey?profile_id=eq."+id+"&select=next_step_type,next_step_title,next_step_path,reach_one_count,active_connections_count,last_faith_boost_at",{headers:h})
 ]);
 const ps=p.ok?await p.json():[],js=j.ok?await j.json():[];
 return json({authenticated:true,user:{id:s.user.id,email:s.user.email},profile:ps[0]||null,journey:js[0]||null},200,s.refreshed?sessionCookies(s.refreshed):[]);
};
export const config={path:"/api/lockliel-auth/session"};