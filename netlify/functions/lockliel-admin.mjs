import {SUPABASE_URL,json,dbHeaders,requireSession,sessionCookies} from "../lib/lockliel-core.mjs";
async function count(path,access){const r=await fetch(SUPABASE_URL+"/rest/v1/"+path,{headers:{...dbHeaders(access),Prefer:"count=exact",Range:"0-0"}});if(!r.ok)return 0;const cr=r.headers.get("content-range")||"0-0/0",total=Number(cr.split("/")[1]);return Number.isFinite(total)?total:0;}
export default async(request)=>{
 if(request.method!=="GET")return json({error:"Method not allowed"},405);
 const s=await requireSession(request);if(!s.user||!s.access)return json({error:"Unauthorized"},401);
 const h=dbHeaders(s.access),id=encodeURIComponent(s.user.id);
 const rr=await fetch(SUPABASE_URL+"/rest/v1/staff_roles?profile_id=eq."+id+"&select=role",{headers:h}),roles=rr.ok?(await rr.json()).map(r=>r.role):[];
 if(!roles.length)return json({error:"Staff access required"},403);
 const [people,founders,activeCourses,gifts,apps]=await Promise.all([
  count("profiles?select=id",s.access),count("founders50_applications?select=id",s.access),count("course_enrollments?status=eq.active&select=id",s.access),count("gifts?status=eq.succeeded&select=id",s.access),
  fetch(SUPABASE_URL+"/rest/v1/founders50_applications?select=id,first_name,last_name,city,region,country,status,created_at&order=created_at.desc&limit=8",{headers:h})
 ]);
 return json({roles,counts:{people,founders,activeCourses,gifts},applications:apps.ok?await apps.json():[]},200,s.refreshed?sessionCookies(s.refreshed):[]);
};
export const config={path:"/api/lockliel/admin/summary"};