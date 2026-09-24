import {SUPABASE_URL,json,dbHeaders,requireSession,sessionCookies} from "../lib/lockliel-core.mjs";
function inFilter(ids){return "in.("+ids.join(",")+")";}
export default async(request)=>{
 if(request.method!=="GET")return json({error:"Method not allowed"},405);
 const s=await requireSession(request);if(!s.user||!s.access)return json({error:"Unauthorized"},401);
 const h=dbHeaders(s.access),uid=encodeURIComponent(s.user.id);
 const mineRes=await fetch(SUPABASE_URL+"/rest/v1/group_members?profile_id=eq."+uid+"&status=eq.active&select=group_id,role,status,joined_at",{headers:h});
 const mine=mineRes.ok?await mineRes.json():[],ids=mine.map(m=>m.group_id);
 if(!ids.length)return json({groups:[]},200,s.refreshed?sessionCookies(s.refreshed):[]);
 const [groupsRes,membersRes]=await Promise.all([
   fetch(SUPABASE_URL+"/rest/v1/groups?id="+encodeURIComponent(inFilter(ids))+"&select=id,name,leader_id,city,region,country,status,created_at",{headers:h}),
   fetch(SUPABASE_URL+"/rest/v1/group_members?group_id="+encodeURIComponent(inFilter(ids))+"&status=eq.active&select=group_id,profile_id,role,joined_at",{headers:h})
 ]);
 const groups=groupsRes.ok?await groupsRes.json():[],members=membersRes.ok?await membersRes.json():[],profileIds=[...new Set(members.map(m=>m.profile_id))];
 let cards=[];if(profileIds.length){const cr=await fetch(SUPABASE_URL+"/rest/v1/profile_connection_cards?profile_id="+encodeURIComponent(inFilter(profileIds))+"&select=profile_id,first_name,last_initial,city,region,country",{headers:h});cards=cr.ok?await cr.json():[];}
 const cardMap=Object.fromEntries(cards.map(c=>[c.profile_id,c]));
 return json({groups:groups.map(g=>({...g,myRole:mine.find(m=>m.group_id===g.id)?.role||"participant",members:members.filter(m=>m.group_id===g.id).map(m=>({...m,person:cardMap[m.profile_id]||null}))}))},200,s.refreshed?sessionCookies(s.refreshed):[]);
};
export const config={path:"/api/lockliel/groups"};