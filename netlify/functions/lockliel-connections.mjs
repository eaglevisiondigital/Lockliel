import {SUPABASE_URL,json,dbHeaders,requireSession,sessionCookies} from "../lib/lockliel-core.mjs";

function inFilter(ids){
  return "in.("+ids.join(",")+")";
}

export default async(request)=>{
  const s=await requireSession(request);
  if(!s.user||!s.access)return json({error:"Unauthorized"},401);

  const h=dbHeaders(s.access);
  const uid=s.user.id;

  const flagRes=await fetch(
    SUPABASE_URL+"/rest/v1/feature_flags?key=eq.internal_messaging&select=enabled&limit=1",
    {headers:h}
  );
  const flagRows=flagRes.ok?await flagRes.json():[];
  const messagingEnabled=flagRows?.[0]?.enabled!==false;

  if(request.method==="POST"){
    const b=await request.json().catch(()=>({}));

    if(b.action==="addReachContact"){
      const displayName=String(b.displayName||"").trim();
      const relationshipContext=String(b.relationshipContext||"").trim().slice(0,500)||null;
      const privateNotes=String(b.privateNotes||"").trim().slice(0,3000)||null;
      const nextRaw=String(b.nextFollowUpAt||"").trim();
      const nextFollowUpAt=nextRaw&&!Number.isNaN(Date.parse(nextRaw))?new Date(nextRaw).toISOString():null;

      if(!displayName)return json({error:"Enter the person's first name or a name you will recognize."},400);

      const activeRes=await fetch(
        SUPABASE_URL+"/rest/v1/reach_contacts?owner_id=eq."+encodeURIComponent(uid)+"&status=in.(praying,invited,connected,growing)&select=id",
        {headers:h}
      );
      const active=activeRes.ok?await activeRes.json():[];
      if(active.length>=5){
        return json({error:"Your active My Five list already has five people. Pause or complete one before adding another."},409);
      }

      const r=await fetch(SUPABASE_URL+"/rest/v1/reach_contacts",{
        method:"POST",
        headers:{...h,Prefer:"return=representation"},
        body:JSON.stringify({
          owner_id:uid,
          display_name:displayName,
          relationship_context:relationshipContext,
          status:"praying",
          next_follow_up_at:nextFollowUpAt,
          private_notes:privateNotes
        })
      });
      if(!r.ok)return json({error:"Unable to add this person to My Five."},r.status);
      return json({ok:true,reachContact:(await r.json())?.[0]||null},200,s.refreshed?sessionCookies(s.refreshed):[]);
    }

    if(b.action==="updateReachContact"){
      const id=String(b.id||"");
      const status=String(b.status||"");
      if(!id||!["praying","invited","connected","growing","paused","completed"].includes(status)){
        return json({error:"Choose a valid My Five status."},400);
      }

      const r=await fetch(
        SUPABASE_URL+"/rest/v1/reach_contacts?id=eq."+encodeURIComponent(id)+"&owner_id=eq."+encodeURIComponent(uid),
        {
          method:"PATCH",
          headers:{...h,Prefer:"return=representation"},
          body:JSON.stringify({status,updated_at:new Date().toISOString()})
        }
      );
      if(!r.ok)return json({error:"Unable to update My Five."},r.status);
      return json({ok:true,reachContact:(await r.json())?.[0]||null},200,s.refreshed?sessionCookies(s.refreshed):[]);
    }

    if(b.action==="markReachActivity"){
      const id=String(b.id||"");
      const activity=String(b.activity||"");
      if(!id||!["shared","followed_up"].includes(activity))return json({error:"Invalid outreach activity."},400);

      const now=new Date();
      const patch=activity==="shared"
        ? {last_shared_at:now.toISOString(),status:"invited",updated_at:now.toISOString()}
        : {last_follow_up_at:now.toISOString(),next_follow_up_at:new Date(now.getTime()+7*24*60*60*1000).toISOString(),updated_at:now.toISOString()};

      const r=await fetch(
        SUPABASE_URL+"/rest/v1/reach_contacts?id=eq."+encodeURIComponent(id)+"&owner_id=eq."+encodeURIComponent(uid),
        {
          method:"PATCH",
          headers:{...h,Prefer:"return=representation"},
          body:JSON.stringify(patch)
        }
      );
      if(!r.ok)return json({error:"Unable to save outreach activity."},r.status);
      return json({ok:true,reachContact:(await r.json())?.[0]||null},200,s.refreshed?sessionCookies(s.refreshed):[]);
    }

    if(b.action==="sendMessage"){
      if(!messagingEnabled)return json({error:"Internal messaging is temporarily unavailable."},403);
      const conversationId=String(b.conversationId||"");
      const body=String(b.body||"").trim();
      if(!conversationId||!body||body.length>5000)return json({error:"Enter a message."},400);

      const r=await fetch(SUPABASE_URL+"/rest/v1/messages",{
        method:"POST",
        headers:{...h,Prefer:"return=representation"},
        body:JSON.stringify({conversation_id:conversationId,sender_id:uid,body})
      });
      if(!r.ok)return json({error:"We couldn't send that message."},r.status);
      return json({ok:true,message:(await r.json())?.[0]||null},200,s.refreshed?sessionCookies(s.refreshed):[]);
    }

    if(b.action==="completeTask"){
      const taskId=String(b.taskId||"");
      if(!taskId)return json({error:"Task required"},400);

      const r=await fetch(
        SUPABASE_URL+"/rest/v1/follow_up_tasks?id=eq."+encodeURIComponent(taskId)+"&assigned_to=eq."+encodeURIComponent(uid),
        {
          method:"PATCH",
          headers:{...h,Prefer:"return=minimal"},
          body:JSON.stringify({status:"completed",completed_at:new Date().toISOString()})
        }
      );
      return r.ok
        ? json({ok:true},200,s.refreshed?sessionCookies(s.refreshed):[])
        : json({error:"Unable to complete follow-up."},r.status);
    }

    return json({error:"Unknown action"},400);
  }

  if(request.method!=="GET")return json({error:"Method not allowed"},405);

  const [mine,reachRes,tr]=await Promise.all([
    fetch(
      SUPABASE_URL+"/rest/v1/conversation_members?profile_id=eq."+encodeURIComponent(uid)+"&left_at=is.null&select=conversation_id,member_role,joined_at",
      {headers:h}
    ),
    fetch(
      SUPABASE_URL+"/rest/v1/reach_contacts?owner_id=eq."+encodeURIComponent(uid)+"&select=id,display_name,relationship_context,status,linked_profile_id,last_shared_at,last_follow_up_at,next_follow_up_at,private_notes,created_at,updated_at&order=updated_at.desc",
      {headers:h}
    ),
    fetch(
      SUPABASE_URL+"/rest/v1/follow_up_tasks?assigned_to=eq."+encodeURIComponent(uid)+"&status=eq.open&select=id,subject_profile_id,task_type,due_at,notes,created_at&order=due_at.asc",
      {headers:h}
    )
  ]);

  const selfMemberships=mine.ok?await mine.json():[];
  const reachContacts=reachRes.ok?await reachRes.json():[];
  const tasks=tr.ok?await tr.json():[];
  const ids=selfMemberships.map(x=>x.conversation_id);
  let conversations=[];

  if(ids.length){
    const [allMembersRes,messagesRes]=await Promise.all([
      fetch(
        SUPABASE_URL+"/rest/v1/conversation_members?conversation_id="+encodeURIComponent(inFilter(ids))+"&left_at=is.null&select=conversation_id,profile_id,member_role,joined_at",
        {headers:h}
      ),
      fetch(
        SUPABASE_URL+"/rest/v1/messages?conversation_id="+encodeURIComponent(inFilter(ids))+"&select=id,conversation_id,sender_id,body,created_at&order=created_at.asc&limit=200",
        {headers:h}
      )
    ]);

    const allMembers=allMembersRes.ok?await allMembersRes.json():[];
    const messages=messagesRes.ok?await messagesRes.json():[];
    const otherIds=[...new Set(allMembers.filter(m=>m.profile_id!==uid).map(m=>m.profile_id))];

    let cards=[];
    if(otherIds.length){
      const cr=await fetch(
        SUPABASE_URL+"/rest/v1/profile_connection_cards?profile_id="+encodeURIComponent(inFilter(otherIds))+"&select=profile_id,first_name,last_initial,city,region,country",
        {headers:h}
      );
      cards=cr.ok?await cr.json():[];
    }

    const cardMap=Object.fromEntries(cards.map(c=>[c.profile_id,c]));
    conversations=ids.map(id=>{
      const others=allMembers
        .filter(m=>m.conversation_id===id&&m.profile_id!==uid)
        .map(m=>cardMap[m.profile_id])
        .filter(Boolean);
      return {
        id,
        other:others[0]||null,
        messages:messages.filter(m=>m.conversation_id===id)
      };
    });
  }

  return json({
    conversations,
    tasks,
    reachContacts,
    messagingEnabled
  },200,s.refreshed?sessionCookies(s.refreshed):[]);
};

export const config={path:"/api/lockliel/connections"};