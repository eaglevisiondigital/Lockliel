import {SUPABASE_URL,json,dbHeaders,requireSession,sessionCookies} from "../lib/lockliel-core.mjs";
function inFilter(ids){return "in.("+ids.join(",")+")";}
export default async(request)=>{
 const s=await requireSession(request);if(!s.user||!s.access)return json({error:"Unauthorized"},401);
 const h=dbHeaders(s.access),uid=encodeURIComponent(s.user.id);
 const rr=await fetch(SUPABASE_URL+"/rest/v1/staff_roles?profile_id=eq."+uid+"&select=role",{headers:h}),roles=rr.ok?(await rr.json()).map(r=>r.role):[];
 if(!roles.some(r=>["super_admin","admin","discipleship_admin","founders50_reviewer"].includes(r)))return json({error:"Group administration access required"},403);

 if(request.method==="POST"){
   const b=await request.json().catch(()=>({}));
   if(b.action==="createGroup"){
     const name=String(b.name||"").trim(),leaderId=String(b.leaderId||"").trim(),city=String(b.city||"").trim(),region=String(b.region||"").trim(),country=String(b.country||"United States").trim();
     if(!name||!leaderId)return json({error:"Group name and leader are required."},400);
     const gr=await fetch(SUPABASE_URL+"/rest/v1/groups",{method:"POST",headers:{...h,Prefer:"return=representation"},body:JSON.stringify({name,leader_id:leaderId,city:city||null,region:region||null,country:country||null,status:"forming"})});
     if(!gr.ok)return json({error:"Unable to create group."},gr.status);
     const group=(await gr.json())?.[0];
     if(group?.id)await fetch(SUPABASE_URL+"/rest/v1/group_members?on_conflict=group_id,profile_id",{method:"POST",headers:{...h,Prefer:"resolution=merge-duplicates,return=minimal"},body:JSON.stringify({group_id:group.id,profile_id:leaderId,role:"leader",status:"active"})});
     return json({ok:true,group},200,s.refreshed?sessionCookies(s.refreshed):[]);
   }
   if(b.action==="addMember"){
     const groupId=String(b.groupId||""),profileId=String(b.profileId||""),requestId=String(b.requestId||"");
     if(!groupId||!profileId)return json({error:"Group and member are required."},400);
     const mr=await fetch(SUPABASE_URL+"/rest/v1/group_members?on_conflict=group_id,profile_id",{method:"POST",headers:{...h,Prefer:"resolution=merge-duplicates,return=minimal"},body:JSON.stringify({group_id:groupId,profile_id:profileId,role:"participant",status:"active"})});
     if(!mr.ok)return json({error:"Unable to add member to group."},mr.status);
     if(requestId)await fetch(SUPABASE_URL+"/rest/v1/connection_requests?id=eq."+encodeURIComponent(requestId),{method:"PATCH",headers:{...h,Prefer:"return=minimal"},body:JSON.stringify({status:"resolved",resolved_at:new Date().toISOString()})});
     return json({ok:true},200,s.refreshed?sessionCookies(s.refreshed):[]);
   }
   return json({error:"Unknown action"},400);
 }
 if(request.method!=="GET")return json({error:"Method not allowed"},405);

 const [groupsRes,peopleRes,requestsRes]=await Promise.all([
   fetch(SUPABASE_URL+"/rest/v1/groups?select=id,name,leader_id,city,region,country,status,created_at&order=created_at.desc&limit=200",{headers:h}),
   fetch(SUPABASE_URL+"/rest/v1/profile_connection_cards?select=profile_id,first_name,last_initial,city,region,country&order=first_name.asc&limit=2000",{headers:h}),
   fetch(SUPABASE_URL+"/rest/v1/connection_requests?status=eq.open&request_type=in.(find_local_group,explore_hosting)&select=id,requester_id,request_type,message,created_at&order=created_at.asc&limit=100",{headers:h})
 ]);
 const groups=groupsRes.ok?await groupsRes.json():[],people=peopleRes.ok?await peopleRes.json():[],requests=requestsRes.ok?await requestsRes.json():[];
 const groupIds=groups.map(g=>g.id);let memberships=[];
 if(groupIds.length){const mr=await fetch(SUPABASE_URL+"/rest/v1/group_members?group_id="+encodeURIComponent(inFilter(groupIds))+"&select=group_id,profile_id,role,status,joined_at",{headers:h});memberships=mr.ok?await mr.json():[];}
 return json({roles,groups,people,requests,memberships},200,s.refreshed?sessionCookies(s.refreshed):[]);
};
export const config={path:"/api/lockliel/admin/groups"};