import {SUPABASE_URL,json,dbHeaders,requireSession,sessionCookies} from "../lib/lockliel-core.mjs";
export default async(request)=>{
 if(request.method!=="GET")return json({error:"Method not allowed"},405);
 const s=await requireSession(request);if(!s.user||!s.access)return json({error:"Unauthorized"},401);
 const h=dbHeaders(s.access),uid=encodeURIComponent(s.user.id);
 const rr=await fetch(SUPABASE_URL+"/rest/v1/staff_roles?profile_id=eq."+uid+"&select=role",{headers:h}),roles=rr.ok?(await rr.json()).map(r=>r.role):[];
 const elevated=roles.some(r=>["super_admin","admin"].includes(r));
 const discipleship=roles.includes("discipleship_admin");
 if(!elevated&&!discipleship)return json({error:"People and progress access required"},403);

 const personUrl=elevated
  ? SUPABASE_URL+"/rest/v1/profiles?select=id,first_name,last_name,email,phone,city,region,country,original_inviter_id,onboarding_status,created_at&order=created_at.desc&limit=200"
  : SUPABASE_URL+"/rest/v1/profile_connection_cards?select=profile_id,first_name,last_initial,city,region,country,updated_at&order=updated_at.desc&limit=200";

 const requests=[
  fetch(personUrl,{headers:h}),
  fetch(SUPABASE_URL+"/rest/v1/tags?select=id,slug,label,category",{headers:h}),
  fetch(SUPABASE_URL+"/rest/v1/profile_tags?select=profile_id,tag_id,source&limit=10000",{headers:h}),
  fetch(SUPABASE_URL+"/rest/v1/lesson_progress?select=profile_id,lesson_id,status,last_activity_at,completed_at&limit=20000",{headers:h}),
  fetch(SUPABASE_URL+"/rest/v1/faith_profiles?select=profile_id,faith_stage,growth_interests,wants_group,wants_host,preferred_connection,updated_at&limit=2000",{headers:h}),
  fetch(SUPABASE_URL+"/rest/v1/lessons?select=id,course_id&limit=2000",{headers:h})
 ];
 if(elevated)requests.push(fetch(SUPABASE_URL+"/rest/v1/founders50_applications?select=profile_id,status&profile_id=not.is.null&order=created_at.desc&limit=2000",{headers:h}));
 const results=await Promise.all(requests);
 const rawPeople=results[0].ok?await results[0].json():[],tags=results[1].ok?await results[1].json():[],profileTags=results[2].ok?await results[2].json():[],progress=results[3].ok?await results[3].json():[],faith=results[4].ok?await results[4].json():[],lessons=results[5].ok?await results[5].json():[],founders=elevated&&results[6]?.ok?await results[6].json():[];

 const people=elevated?rawPeople:rawPeople.map(p=>({id:p.profile_id,first_name:p.first_name,last_name:p.last_initial?String(p.last_initial)+".":"",email:null,phone:null,city:p.city,region:p.region,country:p.country,original_inviter_id:null,onboarding_status:null,created_at:p.updated_at}));
 const tagMap=Object.fromEntries(tags.map(t=>[t.id,t])),profileMap=Object.fromEntries(people.map(p=>[p.id,p])),faithMap=Object.fromEntries(faith.map(x=>[x.profile_id,x]));
 const founderMap={};for(const row of founders)if(!founderMap[row.profile_id])founderMap[row.profile_id]=row.status;
 const output=people.map(p=>{
   const pp=progress.filter(x=>x.profile_id===p.id),completed=pp.filter(x=>x.status==="completed").length,inProgress=pp.filter(x=>x.status==="in_progress").length;
   const pt=profileTags.filter(x=>x.profile_id===p.id).map(x=>tagMap[x.tag_id]).filter(Boolean).map(t=>({slug:t.slug,label:t.label,category:t.category}));
   const inviter=p.original_inviter_id?profileMap[p.original_inviter_id]:null;
   return {id:p.id,name:[p.first_name,p.last_name].filter(Boolean).join(" ").trim()||p.email||"Member",email:elevated?p.email:null,phone:elevated?p.phone:null,location:[p.city,p.region,p.country].filter(Boolean).join(", "),onboarding_status:p.onboarding_status,created_at:p.created_at,inviter:inviter?{id:inviter.id,name:[inviter.first_name,inviter.last_name].filter(Boolean).join(" ").trim()||inviter.email}:null,tags:pt,faith:faithMap[p.id]||null,founder_status:elevated?(founderMap[p.id]||null):null,progress:{completed,inProgress,total:lessons.length,last_activity:pp.map(x=>x.last_activity_at).filter(Boolean).sort().at(-1)||null}};
 });
 return json({people:output,totalLessons:lessons.length,privacyMode:elevated?"full_admin":"discipleship_limited"},200,s.refreshed?sessionCookies(s.refreshed):[]);
};
export const config={path:"/api/lockliel/admin/people"};