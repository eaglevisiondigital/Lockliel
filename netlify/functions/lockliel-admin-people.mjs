import {SUPABASE_URL,json,dbHeaders,requireSession,sessionCookies} from "../lib/lockliel-core.mjs";
export default async(request)=>{
 if(request.method!=="GET")return json({error:"Method not allowed"},405);
 const s=await requireSession(request);if(!s.user||!s.access)return json({error:"Unauthorized"},401);
 const h=dbHeaders(s.access),uid=encodeURIComponent(s.user.id);
 const rr=await fetch(SUPABASE_URL+"/rest/v1/staff_roles?profile_id=eq."+uid+"&select=role",{headers:h}),roles=rr.ok?(await rr.json()).map(r=>r.role):[];
 if(!roles.some(r=>["super_admin","admin","discipleship_admin"].includes(r)))return json({error:"People and progress access required"},403);
 const [profilesRes,tagsRes,profileTagsRes,progressRes,faithRes,foundersRes,lessonsRes]=await Promise.all([
  fetch(SUPABASE_URL+"/rest/v1/profiles?select=id,first_name,last_name,email,phone,city,region,country,original_inviter_id,current_leader_id,onboarding_status,created_at&order=created_at.desc&limit=100",{headers:h}),
  fetch(SUPABASE_URL+"/rest/v1/tags?select=id,slug,label,category",{headers:h}),
  fetch(SUPABASE_URL+"/rest/v1/profile_tags?select=profile_id,tag_id,source&limit=5000",{headers:h}),
  fetch(SUPABASE_URL+"/rest/v1/lesson_progress?select=profile_id,lesson_id,status,last_activity_at,completed_at&limit=10000",{headers:h}),
  fetch(SUPABASE_URL+"/rest/v1/faith_profiles?select=profile_id,faith_stage,growth_interests,wants_group,wants_host,preferred_connection,updated_at&limit=1000",{headers:h}),
  fetch(SUPABASE_URL+"/rest/v1/founders50_applications?select=profile_id,status&profile_id=not.is.null&order=created_at.desc&limit=1000",{headers:h}),
  fetch(SUPABASE_URL+"/rest/v1/lessons?select=id,course_id&limit=1000",{headers:h})
 ]);
 const profiles=profilesRes.ok?await profilesRes.json():[],tags=tagsRes.ok?await tagsRes.json():[],profileTags=profileTagsRes.ok?await profileTagsRes.json():[],progress=progressRes.ok?await progressRes.json():[],faith=faithRes.ok?await faithRes.json():[],founders=foundersRes.ok?await foundersRes.json():[],lessons=lessonsRes.ok?await lessonsRes.json():[];
 const tagMap=Object.fromEntries(tags.map(t=>[t.id,t])),profileMap=Object.fromEntries(profiles.map(p=>[p.id,p])),faithMap=Object.fromEntries(faith.map(x=>[x.profile_id,x]));
 const founderMap={};for(const f of founders)if(!founderMap[f.profile_id])founderMap[f.profile_id]=f.status;
 const people=profiles.map(p=>{
   const pp=progress.filter(x=>x.profile_id===p.id),completed=pp.filter(x=>x.status==="completed").length,inProgress=pp.filter(x=>x.status==="in_progress").length;
   const pt=profileTags.filter(x=>x.profile_id===p.id).map(x=>tagMap[x.tag_id]).filter(Boolean).map(t=>({slug:t.slug,label:t.label,category:t.category}));
   const inviter=p.original_inviter_id?profileMap[p.original_inviter_id]:null;
   return {id:p.id,name:[p.first_name,p.last_name].filter(Boolean).join(" ")||p.email,email:p.email,phone:p.phone,location:[p.city,p.region,p.country].filter(Boolean).join(", "),onboarding_status:p.onboarding_status,created_at:p.created_at,inviter:inviter?{id:inviter.id,name:[inviter.first_name,inviter.last_name].filter(Boolean).join(" ")||inviter.email}:null,tags:pt,faith:faithMap[p.id]||null,founder_status:founderMap[p.id]||null,progress:{completed,inProgress,total:lessons.length,last_activity:pp.map(x=>x.last_activity_at).filter(Boolean).sort().at(-1)||null}};
 });
 return json({people,totalLessons:lessons.length},200,s.refreshed?sessionCookies(s.refreshed):[]);
};
export const config={path:"/api/lockliel/admin/people"};