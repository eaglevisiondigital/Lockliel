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

    if(b.action==="requestLeader"){
      const existing=await fetch(
        SUPABASE_URL+"/rest/v1/connection_requests?requester_id=eq."+encodeURIComponent(uid)+"&request_type=eq.connect_with_leader&status=eq.open&select=id&limit=1",
        {headers:h}
      );
      const rows=existing.ok?await existing.json():[];
      if(rows.length)return json({error:"You already have an open leader request."},409);

      const r=await fetch(SUPABASE_URL+"/rest/v1/connection_requests",{
        method:"POST",
        headers:{...h,Prefer:"return=representation"},
        body:JSON.stringify({
          requester_id:uid,
          request_type:"connect_with_leader",
          status:"open",
          message:"Member requested help connecting with an appropriate Lockliel leader or mentor."
        })
      });
      if(!r.ok)return json({error:"Unable to submit leader request."},r.status);
      return json({ok:true,request:(await r.json())?.[0]||null},200,s.refreshed?sessionCookies(s.refreshed):[]);
    }

    if(b.action==="cancelLeaderRequest"){
      const requestId=String(b.requestId||"");
      if(!requestId)return json({error:"Request required."},400);

      const r=await fetch(
        SUPABASE_URL+"/rest/v1/connection_requests?id=eq."+encodeURIComponent(requestId)+"&requester_id=eq."+encodeURIComponent(uid)+"&request_type=eq.connect_with_leader&status=eq.open",
        {
          method:"PATCH",
          headers:{...h,Prefer:"return=representation"},
          body:JSON.stringify({status:"closed"})
        }
      );
      if(!r.ok)return json({error:"Unable to cancel leader request."},r.status);
      return json({ok:true},200,s.refreshed?sessionCookies(s.refreshed):[]);
    }

    if(b.action==="addReachContact"){
      const displayName=String(b.displayName||"").trim().slice(0,120);
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

    if(b.action==="updateReachDetails"){
      const id=String(b.id||"");
      const displayName=String(b.displayName||"").trim().slice(0,120);
      const relationshipContext=String(b.relationshipContext||"").trim().slice(0,500)||null;
      const privateNotes=String(b.privateNotes||"").trim().slice(0,3000)||null;
      const nextRaw=String(b.nextFollowUpAt||"").trim();

      if(!id||!displayName)return json({error:"Enter the person's first name or a name you will recognize."},400);

      let nextFollowUpAt=null;
      if(nextRaw){
        const parsed=Date.parse(nextRaw);
        if(Number.isNaN(parsed))return json({error:"Choose a valid follow-up date."},400);
        nextFollowUpAt=new Date(parsed).toISOString();
      }

      const r=await fetch(
        SUPABASE_URL+"/rest/v1/reach_contacts?id=eq."+encodeURIComponent(id)+"&owner_id=eq."+encodeURIComponent(uid),
        {
          method:"PATCH",
          headers:{...h,Prefer:"return=representation"},
          body:JSON.stringify({
            display_name:displayName,
            relationship_context:relationshipContext,
            private_notes:privateNotes,
            next_follow_up_at:nextFollowUpAt
          })
        }
      );
      if(!r.ok)return json({error:"Unable to update this My Five person."},r.status);
      const rows=await r.json();
      if(!rows.length)return json({error:"My Five person not found."},404);
      return json({ok:true,reachContact:rows[0]},200,s.refreshed?sessionCookies(s.refreshed):[]);
    }

    if(b.action==="updateReachContact"){
      const id=String(b.id||"");
      const status=String(b.status||"");
      const activeStatuses=["praying","invited","connected","growing"];
      if(!id||![...activeStatuses,"paused","completed"].includes(status)){
        return json({error:"Choose a valid My Five status."},400);
      }

      const currentRes=await fetch(
        SUPABASE_URL+"/rest/v1/reach_contacts?id=eq."+encodeURIComponent(id)+
        "&owner_id=eq."+encodeURIComponent(uid)+
        "&select=id,status&limit=1",
        {headers:h}
      );
      const current=(currentRes.ok?await currentRes.json():[])?.[0]||null;
      if(!current)return json({error:"My Five person not found."},404);

      if(activeStatuses.includes(status)&&!activeStatuses.includes(current.status)){
        const countRes=await fetch(
          SUPABASE_URL+"/rest/v1/reach_contacts?owner_id=eq."+encodeURIComponent(uid)+
          "&status=in.(praying,invited,connected,growing)&select=id",
          {headers:h}
        );
        const active=countRes.ok?await countRes.json():[];
        if(active.length>=5){
          return json({error:"Your active My Five list already has five people. Pause or complete one before reactivating another."},409);
        }
      }

      const r=await fetch(
        SUPABASE_URL+"/rest/v1/reach_contacts?id=eq."+encodeURIComponent(id)+"&owner_id=eq."+encodeURIComponent(uid),
        {
          method:"PATCH",
          headers:{...h,Prefer:"return=representation"},
          body:JSON.stringify({status})
        }
      );
      if(!r.ok)return json({error:"Unable to update My Five."},r.status);
      return json({ok:true,reachContact:(await r.json())?.[0]||null},200,s.refreshed?sessionCookies(s.refreshed):[]);
    }

    if(b.action==="markReachActivity"){
      const id=String(b.id||"");
      const activity=String(b.activity||"");
      if(!id||!["shared","followed_up"].includes(activity))return json({error:"Invalid outreach activity."},400);

      const currentRes=await fetch(
        SUPABASE_URL+"/rest/v1/reach_contacts?id=eq."+encodeURIComponent(id)+
        "&owner_id=eq."+encodeURIComponent(uid)+
        "&select=id,status&limit=1",
        {headers:h}
      );
      const current=(currentRes.ok?await currentRes.json():[])?.[0]||null;
      if(!current)return json({error:"My Five person not found."},404);

      const now=new Date();
      const patch=activity==="shared"
        ? {
            last_shared_at:now.toISOString(),
            ...(current.status==="praying"?{status:"invited"}:{})
          }
        : {
            last_follow_up_at:now.toISOString(),
            next_follow_up_at:new Date(now.getTime()+7*24*60*60*1000).toISOString()
          };

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

    if(b.action==="setContactPermission"){
      const otherProfileId=String(b.otherProfileId||"").trim();
      const permissionType=String(b.permissionType||"").trim();
      const allow=b.allow===true;

      if(!otherProfileId||!["inviter_followup","leader_followup"].includes(permissionType)){
        return json({error:"Invalid contact permission."},400);
      }

      if(allow){
        if(permissionType==="inviter_followup"){
          const rel=await fetch(
            SUPABASE_URL+"/rest/v1/profiles?id=eq."+encodeURIComponent(uid)+
            "&original_inviter_id=eq."+encodeURIComponent(otherProfileId)+
            "&select=id&limit=1",
            {headers:h}
          );
          const rows=rel.ok?await rel.json():[];
          if(!rows.length)return json({error:"That inviter relationship is no longer available."},409);
        }else{
          const rel=await fetch(
            SUPABASE_URL+"/rest/v1/leader_assignments?member_id=eq."+encodeURIComponent(uid)+
            "&leader_id=eq."+encodeURIComponent(otherProfileId)+
            "&status=eq.active&select=member_id&limit=1",
            {headers:h}
          );
          const rows=rel.ok?await rel.json():[];
          if(!rows.length)return json({error:"That leader is no longer your active Lockliel assignment."},409);
        }
      }

      const r=await fetch(
        SUPABASE_URL+"/rest/v1/contact_permissions?profile_id=eq."+encodeURIComponent(uid)+
        "&other_profile_id=eq."+encodeURIComponent(otherProfileId)+
        "&permission_type=eq."+encodeURIComponent(permissionType),
        {
          method:"PATCH",
          headers:{...h,Prefer:"return=representation"},
          body:JSON.stringify({revoked_at:allow?null:new Date().toISOString()})
        }
      );
      if(!r.ok)return json({error:"Unable to update contact preference."},r.status);
      const rows=await r.json();
      if(!rows.length)return json({error:"Contact preference not found."},404);
      return json({ok:true,permission:rows[0]},200,s.refreshed?sessionCookies(s.refreshed):[]);
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

  const [mine,reachRes,tr,leaderRes,requestRes,permissionRes]=await Promise.all([
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
    ),
    fetch(
      SUPABASE_URL+"/rest/v1/leader_assignments?member_id=eq."+encodeURIComponent(uid)+"&status=eq.active&select=leader_id,assignment_type,assigned_at&limit=1",
      {headers:h}
    ),
    fetch(
      SUPABASE_URL+"/rest/v1/connection_requests?requester_id=eq."+encodeURIComponent(uid)+"&request_type=eq.connect_with_leader&status=eq.open&select=id,request_type,status,message,created_at&limit=1",
      {headers:h}
    ),
    fetch(
      SUPABASE_URL+"/rest/v1/contact_permissions?profile_id=eq."+encodeURIComponent(uid)+"&permission_type=in.(inviter_followup,leader_followup)&select=other_profile_id,permission_type,granted_at,revoked_at",
      {headers:h}
    )
  ]);

  const selfMemberships=mine.ok?await mine.json():[];
  const reachContacts=reachRes.ok?await reachRes.json():[];
  const tasks=tr.ok?await tr.json():[];
  const leaderRows=leaderRes.ok?await leaderRes.json():[];
  const leaderAssignment=leaderRows?.[0]||null;
  const leaderRequests=requestRes.ok?await requestRes.json():[];
  const leaderRequest=leaderRequests?.[0]||null;
  const permissionRows=permissionRes.ok?await permissionRes.json():[];
  const ids=selfMemberships.map(x=>x.conversation_id);
  let conversations=[];

  if(ids.length){
    const [allMembersRes,messagesRes,conversationRes]=await Promise.all([
      fetch(
        SUPABASE_URL+"/rest/v1/conversation_members?conversation_id="+encodeURIComponent(inFilter(ids))+"&left_at=is.null&select=conversation_id,profile_id,member_role,joined_at",
        {headers:h}
      ),
      fetch(
        SUPABASE_URL+"/rest/v1/messages?conversation_id="+encodeURIComponent(inFilter(ids))+"&select=id,conversation_id,sender_id,body,created_at&order=created_at.asc&limit=200",
        {headers:h}
      ),
      fetch(
        SUPABASE_URL+"/rest/v1/conversations?id="+encodeURIComponent(inFilter(ids))+"&select=id,conversation_type,created_at",
        {headers:h}
      )
    ]);

    const allMembers=allMembersRes.ok?await allMembersRes.json():[];
    const messages=messagesRes.ok?await messagesRes.json():[];
    const conversationRows=conversationRes.ok?await conversationRes.json():[];
    const conversationMap=Object.fromEntries(conversationRows.map(row=>[row.id,row]));
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
        type:conversationMap[id]?.conversation_type||"direct",
        selfRole:selfMemberships.find(m=>m.conversation_id===id)?.member_role||"member",
        other:others[0]||null,
        messages:messages.filter(m=>m.conversation_id===id)
      };
    });
  }

  const permissionIds=[...new Set(permissionRows.map(p=>p.other_profile_id).filter(Boolean))];
  let permissionCards=[];
  if(permissionIds.length){
    const pr=await fetch(
      SUPABASE_URL+"/rest/v1/profile_connection_cards?profile_id="+encodeURIComponent(inFilter(permissionIds))+"&select=profile_id,first_name,last_initial,city,region,country",
      {headers:h}
    );
    permissionCards=pr.ok?await pr.json():[];
  }
  const permissionCardMap=Object.fromEntries(permissionCards.map(card=>[card.profile_id,card]));
  const contactPermissions=permissionRows.map(permission=>({
    ...permission,
    person:permissionCardMap[permission.other_profile_id]||null
  }));

  let leader=null;
  if(leaderAssignment?.leader_id){
    const lr=await fetch(
      SUPABASE_URL+"/rest/v1/profile_connection_cards?profile_id=eq."+encodeURIComponent(leaderAssignment.leader_id)+"&select=profile_id,first_name,last_initial,city,region,country&limit=1",
      {headers:h}
    );
    const rows=lr.ok?await lr.json():[];
    leader=rows?.[0]||null;
  }

  return json({
    conversations,
    tasks,
    reachContacts,
    messagingEnabled,
    leaderAssignment:leaderAssignment?{...leaderAssignment,person:leader}:null,
    leaderRequest,
    contactPermissions
  },200,s.refreshed?sessionCookies(s.refreshed):[]);
};

export const config={path:"/api/lockliel/connections"};