import {SUPABASE_URL,json,dbHeaders,requireSession,sessionCookies,sessionAal} from "../lib/lockliel-core.mjs";
async function count(path,access){const r=await fetch(SUPABASE_URL+"/rest/v1/"+path,{headers:{...dbHeaders(access),Prefer:"count=exact",Range:"0-0"}});if(!r.ok)return 0;const cr=r.headers.get("content-range")||"0-0/0",total=Number(cr.split("/")[1]);return Number.isFinite(total)?total:0;}
export default async(request)=>{
 const s=await requireSession(request);if(!s.user||!s.access)return json({error:"Unauthorized"},401);
  if(sessionAal(s.access)!=="aal2")return json({error:"Multi-factor authentication required.",code:"mfa_required"},403);
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
   if(b.action==="resolveConnectionRequest"){
     if(!roles.some(r=>["super_admin","admin","discipleship_admin","founders50_reviewer"].includes(r)))return json({error:"Connection review access required"},403);
     const requestId=String(b.requestId||""),status=String(b.status||"resolved");
     if(!requestId||!["resolved","closed","in_progress"].includes(status))return json({error:"Invalid connection request update"},400);
     const patch={status,resolved_at:["resolved","closed"].includes(status)?new Date().toISOString():null};
     const r=await fetch(SUPABASE_URL+"/rest/v1/connection_requests?id=eq."+encodeURIComponent(requestId),{method:"PATCH",headers:{...h,Prefer:"return=representation"},body:JSON.stringify(patch)});
     if(!r.ok)return json({error:"Unable to update request."},r.status);
     return json({ok:true,request:(await r.json())?.[0]||null},200,s.refreshed?sessionCookies(s.refreshed):[]);
   }
   return json({error:"Unknown action"},400);
 }
 if(request.method!=="GET")return json({error:"Method not allowed"},405);

 const [people,founders,activeCourses,gifts,leads,followups,connectionRequests,appsRes,refRes,leadSourceRes,requestRes]=await Promise.all([
  count("profiles?select=id",s.access),
  count("founders50_applications?select=id",s.access),
  count("course_enrollments?status=eq.active&select=id",s.access),
  count("gifts?status=eq.succeeded&select=id",s.access),
  count("lead_contacts?select=id",s.access),
  count("follow_up_tasks?status=eq.open&select=id",s.access),
  count("connection_requests?status=eq.open&select=id",s.access),
  fetch(SUPABASE_URL+"/rest/v1/founders50_applications?select=id,profile_id,first_name,last_name,email,phone,city,region,country,status,created_at&order=created_at.desc&limit=12",{headers:h}),
  fetch(SUPABASE_URL+"/rest/v1/referral_events?select=event_type&limit=5000",{headers:h}),
  fetch(SUPABASE_URL+"/rest/v1/lead_sources?select=source_type,campaign&limit=5000",{headers:h}),
  fetch(SUPABASE_URL+"/rest/v1/connection_requests?status=eq.open&select=id,requester_id,request_type,status,message,created_at&order=created_at.asc&limit=20",{headers:h})
 ]);
 const applications=appsRes.ok?await appsRes.json():[];
 const referralRows=refRes.ok?await refRes.json():[];
 const leadSourceRows=leadSourceRes.ok?await leadSourceRes.json():[];
 const requests=requestRes.ok?await requestRes.json():[];
 const requestProfileIds=[...new Set(requests.map(r=>r.requester_id).filter(Boolean))];
 let requestPeople=[];
 if(requestProfileIds.length){
   const cr=await fetch(SUPABASE_URL+"/rest/v1/profile_connection_cards?profile_id=in.("+requestProfileIds.join(",")+")&select=profile_id,first_name,last_initial,city,region,country",{headers:h});
   requestPeople=cr.ok?await cr.json():[];
 }
 const requestPeopleMap=Object.fromEntries(requestPeople.map(p=>[p.profile_id,p]));
 const connectionQueue=requests.map(r=>({...r,person:requestPeopleMap[r.requester_id]||null}));
 const activity={share_initiated:0,visit:0,signup:0,course_started:0,lesson_completed:0};
 for(const row of referralRows)if(Object.prototype.hasOwnProperty.call(activity,row.event_type))activity[row.event_type]++;
 const sourceCounts={};for(const row of leadSourceRows){const key=row.source_type||"other";sourceCounts[key]=(sourceCounts[key]||0)+1;}
 return json({roles,counts:{people,founders,activeCourses,gifts,leads,followups,connectionRequests},activity,sourceCounts,applications,connectionQueue},200,s.refreshed?sessionCookies(s.refreshed):[]);
};
export const config={path:"/api/lockliel/admin/summary"};