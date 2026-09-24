import {SUPABASE_URL,json,dbHeaders,requireSession,sessionCookies} from "../lib/lockliel-core.mjs";
function inFilter(ids){return "in.("+ids.join(",")+")";}
export default async(request)=>{
 const s=await requireSession(request);if(!s.user||!s.access)return json({error:"Unauthorized"},401);
 const h=dbHeaders(s.access),uid=s.user.id;\n const flagRes=await fetch(SUPABASE_URL+"/rest/v1/feature_flags?key=eq.internal_messaging&select=enabled&limit=1",{headers:h});\n const flagRows=flagRes.ok?await flagRes.json():[];const messagingEnabled=flagRows?.[0]?.enabled!==false;
 if(request.method==="POST"){
  const b=await request.json().catch(()=>({}));
  if(b.action==="sendMessage"){\n   if(!messagingEnabled)return json({error:"Internal messaging is temporarily unavailable."},403);
   const conversationId=String(b.conversationId||""),body=String(b.body||"").trim();
   if(!conversationId||!body||body.length>5000)return json({error:"Enter a message."},400);
   const r=await fetch(SUPABASE_URL+"/rest/v1/messages",{method:"POST",headers:{...h,Prefer:"return=representation"},body:JSON.stringify({conversation_id:conversationId,sender_id:uid,body})});
   if(!r.ok)return json({error:"We couldn't send that message."},r.status);
   return json({ok:true,message:(await r.json())?.[0]||null},200,s.refreshed?sessionCookies(s.refreshed):[]);
  }
  if(b.action==="completeTask"){
   const taskId=String(b.taskId||"");if(!taskId)return json({error:"Task required"},400);
   const r=await fetch(SUPABASE_URL+"/rest/v1/follow_up_tasks?id=eq."+encodeURIComponent(taskId)+"&assigned_to=eq."+encodeURIComponent(uid),{method:"PATCH",headers:{...h,Prefer:"return=minimal"},body:JSON.stringify({status:"completed",completed_at:new Date().toISOString()})});
   return r.ok?json({ok:true},200,s.refreshed?sessionCookies(s.refreshed):[]):json({error:"Unable to complete follow-up."},r.status);
  }
  return json({error:"Unknown action"},400);
 }
 if(request.method!=="GET")return json({error:"Method not allowed"},405);
 const mine=await fetch(SUPABASE_URL+"/rest/v1/conversation_members?profile_id=eq."+encodeURIComponent(uid)+"&left_at=is.null&select=conversation_id,member_role,joined_at",{headers:h});
 const selfMemberships=mine.ok?await mine.json():[],ids=selfMemberships.map(x=>x.conversation_id);
 let conversations=[];
 if(ids.length){
  const [allMembersRes,messagesRes]=await Promise.all([
   fetch(SUPABASE_URL+"/rest/v1/conversation_members?conversation_id="+encodeURIComponent(inFilter(ids))+"&left_at=is.null&select=conversation_id,profile_id,member_role,joined_at",{headers:h}),
   fetch(SUPABASE_URL+"/rest/v1/messages?conversation_id="+encodeURIComponent(inFilter(ids))+"&select=id,conversation_id,sender_id,body,created_at&order=created_at.asc&limit=200",{headers:h})
  ]);
  const allMembers=allMembersRes.ok?await allMembersRes.json():[],messages=messagesRes.ok?await messagesRes.json():[];
  const otherIds=[...new Set(allMembers.filter(m=>m.profile_id!==uid).map(m=>m.profile_id))];
  let cards=[];if(otherIds.length){const cr=await fetch(SUPABASE_URL+"/rest/v1/profile_connection_cards?profile_id="+encodeURIComponent(inFilter(otherIds))+"&select=profile_id,first_name,last_initial,city,region,country",{headers:h});cards=cr.ok?await cr.json():[];}
  const cardMap=Object.fromEntries(cards.map(c=>[c.profile_id,c]));
  conversations=ids.map(id=>{const others=allMembers.filter(m=>m.conversation_id===id&&m.profile_id!==uid).map(m=>cardMap[m.profile_id]).filter(Boolean);return {id,other:others[0]||null,messages:messages.filter(m=>m.conversation_id===id)};});
 }
 const tr=await fetch(SUPABASE_URL+"/rest/v1/follow_up_tasks?assigned_to=eq."+encodeURIComponent(uid)+"&status=eq.open&select=id,subject_profile_id,task_type,due_at,notes,created_at&order=due_at.asc",{headers:h});
 const tasks=tr.ok?await tr.json():[];
 return json({conversations,tasks,messagingEnabled},200,s.refreshed?sessionCookies(s.refreshed):[]);
};
export const config={path:"/api/lockliel/connections"};