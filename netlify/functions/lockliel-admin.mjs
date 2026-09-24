import {SUPABASE_URL,json,dbHeaders,requireSession,sessionCookies} from "../lib/lockliel-core.mjs";
async function count(path,access){const r=await fetch(SUPABASE_URL+"/rest/v1/"+path,{headers:{...dbHeaders(access),Prefer:"count=exact",Range:"0-0"}});if(!r.ok)return 0;const cr=r.headers.get("content-range")||"0-0/0",total=Number(cr.split("/")[1]);return Number.isFinite(total)?total:0;}
export default async(request)=>{
 const s=await requireSession(request);if(!s.user||!s.access)return json({error:"Unauthorized"},401);
 const h=dbHeaders(s.access),id=encodeURIComponent(s.user.id);
 const rr=await fetch(SUPABASE_URL+"/rest/v1/staff_roles?profile_id=eq."+id+"&select=role",{headers:h}),roles=rr.ok?(await rr.json()).map(r=>r.role):[];
 if(!roles.length)return json({error:"Staff access required"},403);

 if(request.method==="POST"){
   const b=await request.json().catch(()=>({}));
   if(b.action==="updateFounderStatus"){
     if(!roles.some(r=>["super_admin","admin","founders50_reviewer"].includes(r)))return json({error:"Founder review access required"},403);
     const applicationId=String(b.applicationId||""),status=String(b.status||"");
     const allowed=["applied","under_review","needs_info","accepted","orientation","active_host","paused","withdrawn","declined"];
     if(!applicationId||!allowed.includes(status))return json({error:"Invalid application update"},400);
     const r=await fetch(SUPABASE_URL+"/rest/v1/founders50_applications?id=eq."+encodeURIComponent(applicationId),{method:"PATCH",headers:{...h,Prefer:"return=representation"},body:JSON.stringify({status,updated_at:new Date().toISOString()})});
     if(!r.ok)return json({error:"Unable to update application."},r.status);
     return json({ok:true,application:(await r.json())?.[0]||null},200,s.refreshed?sessionCookies(s.refreshed):[]);
   }
   return json({error:"Unknown action"},400);
 }
 if(request.method!=="GET")return json({error:"Method not allowed"},405);

 const [people,founders,activeCourses,gifts,leads,followups,apps]=await Promise.all([
  count("profiles?select=id",s.access),
  count("founders50_applications?select=id",s.access),
  count("course_enrollments?status=eq.active&select=id",s.access),
  count("gifts?status=eq.succeeded&select=id",s.access),
  count("lead_contacts?select=id",s.access),
  count("follow_up_tasks?status=eq.open&select=id",s.access),
  fetch(SUPABASE_URL+"/rest/v1/founders50_applications?select=id,profile_id,first_name,last_name,email,phone,city,region,country,status,created_at&order=created_at.desc&limit=12",{headers:h})
 ]);
 return json({roles,counts:{people,founders,activeCourses,gifts,leads,followups},applications:apps.ok?await apps.json():[]},200,s.refreshed?sessionCookies(s.refreshed):[]);
};
export const config={path:"/api/lockliel/admin/summary"};