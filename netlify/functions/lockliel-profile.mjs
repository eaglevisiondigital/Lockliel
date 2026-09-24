import {SUPABASE_URL,json,dbHeaders,requireSession,sessionCookies} from "../lib/lockliel-core.mjs";
export default async(request)=>{
 if(request.method!=="PATCH")return json({error:"Method not allowed"},405);
 const s=await requireSession(request);if(!s.user||!s.access)return json({error:"Unauthorized"},401);
 const b=await request.json().catch(()=>({}));
 const patch={first_name:String(b.firstName||"").trim(),last_name:String(b.lastName||"").trim(),phone:String(b.phone||"").trim()||null,city:String(b.city||"").trim(),region:String(b.region||"").trim(),country:String(b.country||"United States").trim(),onboarding_status:"active",updated_at:new Date().toISOString()};
 if(!patch.first_name||!patch.last_name||!patch.city||!patch.region||!patch.country)return json({error:"Please complete your name, city, state/region, and country."},400);
 const h={...dbHeaders(s.access),Prefer:"return=representation"},id=encodeURIComponent(s.user.id);
 const p=await fetch(SUPABASE_URL+"/rest/v1/profiles?id=eq."+id,{method:"PATCH",headers:h,body:JSON.stringify(patch)});
 if(!p.ok)return json({error:"We couldn't save your profile."},500);
 await fetch(SUPABASE_URL+"/rest/v1/member_journey?profile_id=eq."+id,{method:"PATCH",headers:h,body:JSON.stringify({next_step_type:"course",next_step_title:"Begin Getting a Grip on the Basics",next_step_path:"/my-lockliel/journey",updated_at:new Date().toISOString()})});
 return json({ok:true},200,s.refreshed?sessionCookies(s.refreshed):[]);
};
export const config={path:"/api/lockliel/profile"};