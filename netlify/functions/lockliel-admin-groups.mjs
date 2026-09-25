import {SUPABASE_URL,json,dbHeaders,requireSession,sessionCookies,sessionAal} from "../lib/lockliel-core.mjs";

function inFilter(ids){
  return "in.("+ids.join(",")+")";
}

export default async(request)=>{
  const s=await requireSession(request);
  if(!s.user||!s.access)return json({error:"Unauthorized"},401);
  if(sessionAal(s.access)!=="aal2")return json({error:"Multi-factor authentication required.",code:"mfa_required"},403);

  const h=dbHeaders(s.access);
  const uid=encodeURIComponent(s.user.id);
  const rr=await fetch(
    SUPABASE_URL+"/rest/v1/staff_roles?profile_id=eq."+uid+"&select=role",
    {headers:h}
  );
  const roles=rr.ok?(await rr.json()).map(r=>r.role):[];
  if(!roles.some(r=>["super_admin","admin","discipleship_admin"].includes(r))){
    return json({error:"Group administration access required"},403);
  }

  if(request.method==="POST"){
    const b=await request.json().catch(()=>({}));

    if(b.action==="createGroup"){
      const name=String(b.name||"").trim();
      const leaderId=String(b.leaderId||"").trim();
      const city=String(b.city||"").trim();
      const region=String(b.region||"").trim();
      const country=String(b.country||"United States").trim();

      if(!name||!leaderId)return json({error:"Group name and leader are required."},400);

      const leaderRes=await fetch(
        SUPABASE_URL+"/rest/v1/leader_profiles?profile_id=eq."+encodeURIComponent(leaderId)+
        "&active=eq.true&leader_type=in.(group_leader,regional_leader)"+
        "&select=profile_id,leader_type,language_code&limit=1",
        {headers:h}
      );
      const approvedLeader=(leaderRes.ok?await leaderRes.json():[])?.[0]||null;
      if(!approvedLeader){
        return json({error:"Choose an active approved group leader or regional leader."},400);
      }

      const gr=await fetch(SUPABASE_URL+"/rest/v1/groups",{
        method:"POST",
        headers:{...h,Prefer:"return=representation"},
        body:JSON.stringify({
          name,
          leader_id:leaderId,
          city:city||null,
          region:region||null,
          country:country||null,
          language_code:String(b.languageCode||approvedLeader.language_code||"en").trim().toLowerCase().slice(0,12)||"en",
          status:"forming"
        })
      });
      if(!gr.ok)return json({error:"Unable to create group."},gr.status);

      const group=(await gr.json())?.[0];
      return json({ok:true,group},200,s.refreshed?sessionCookies(s.refreshed):[]);
    }

    if(b.action==="addMember"){
      const groupId=String(b.groupId||"").trim();
      const profileId=String(b.profileId||"").trim();
      const requestId=String(b.requestId||"").trim();

      if(!groupId||!profileId)return json({error:"Group and member are required."},400);

      const r=await fetch(
        SUPABASE_URL+"/rest/v1/rpc/lockliel_assign_member_to_group",
        {
          method:"POST",
          headers:{...h,"Content-Type":"application/json"},
          body:JSON.stringify({
            member_uuid:profileId,
            group_uuid:groupId,
            request_uuid:requestId||null
          })
        }
      );

      const result=await r.json().catch(()=>null);
      if(!r.ok){
        const detail=Array.isArray(result)?result?.[0]?.message:result?.message;
        return json({error:detail||"Unable to add member to group."},r.status===400?400:409);
      }

      return json(
        result||{ok:true,group_id:groupId,member_id:profileId,request_id:requestId||null},
        200,
        s.refreshed?sessionCookies(s.refreshed):[]
      );
    }

    if(b.action==="resolveGroupChange"){
      const requestId=String(b.requestId||"").trim();
      const targetGroupId=String(b.targetGroupId||"").trim();

      if(!requestId)return json({error:"Group transition request required."},400);

      const r=await fetch(
        SUPABASE_URL+"/rest/v1/rpc/lockliel_resolve_group_transition",
        {
          method:"POST",
          headers:{...h,"Content-Type":"application/json"},
          body:JSON.stringify({
            request_uuid:requestId,
            target_group_uuid:targetGroupId||null
          })
        }
      );

      const result=await r.json().catch(()=>null);
      if(!r.ok){
        const detail=Array.isArray(result)?result?.[0]?.message:result?.message;
        return json({error:detail||"Unable to resolve group transition."},r.status===400?400:409);
      }

      return json(
        result||{ok:true,outcome:targetGroupId?"transferred":"ended",target_group_id:targetGroupId||null},
        200,
        s.refreshed?sessionCookies(s.refreshed):[]
      );
    }

    return json({error:"Unknown action"},400);
  }

  if(request.method!=="GET")return json({error:"Method not allowed"},405);

  const cutoff=new Date(Date.now()-56*24*60*60*1000).toISOString().slice(0,10);
  const [groupsRes,peopleRes,requestsRes,checkinsRes,approvedLeadersRes]=await Promise.all([
    fetch(
      SUPABASE_URL+"/rest/v1/groups?select=id,name,leader_id,city,region,country,language_code,status,created_at&order=created_at.desc&limit=200",
      {headers:h}
    ),
    fetch(
      SUPABASE_URL+"/rest/v1/profile_connection_cards?select=profile_id,first_name,last_initial,city,region,country,language_code&order=first_name.asc&limit=2000",
      {headers:h}
    ),
    fetch(
      SUPABASE_URL+"/rest/v1/connection_requests?status=eq.open&request_type=in.(find_local_group,explore_hosting,leave_or_change_group)&select=id,requester_id,requested_group_id,request_type,message,created_at&order=created_at.asc&limit=100",
      {headers:h}
    ),
    fetch(
      SUPABASE_URL+"/rest/v1/group_weekly_checkins?week_start=gte."+cutoff+"&select=id,group_id,submitted_by,week_start,gathered,attendance_count,faith_boosts_used,people_shared_with,new_people_count,next_leader_identified,testimony,needs_support,created_at&order=week_start.desc&limit=1000",
      {headers:h}
    ),
    fetch(
      SUPABASE_URL+"/rest/v1/leader_profiles?active=eq.true&leader_type=in.(group_leader,regional_leader)&select=profile_id,leader_type,language_code",
      {headers:h}
    )
  ]);

  const groups=groupsRes.ok?await groupsRes.json():[];
  const people=peopleRes.ok?await peopleRes.json():[];
  const requests=requestsRes.ok?await requestsRes.json():[];
  const checkins=checkinsRes.ok?await checkinsRes.json():[];
  const approvedLeaders=approvedLeadersRes.ok?await approvedLeadersRes.json():[];
  const groupIds=groups.map(g=>g.id);

  let memberships=[];
  if(groupIds.length){
    const mr=await fetch(
      SUPABASE_URL+"/rest/v1/group_members?group_id="+encodeURIComponent(inFilter(groupIds))+"&select=group_id,profile_id,role,status,joined_at,left_at",
      {headers:h}
    );
    memberships=mr.ok?await mr.json():[];
  }

  const pulse={
    checkins:checkins.length,
    gatherings:checkins.filter(c=>c.gathered).length,
    attendance:checkins.reduce((n,c)=>n+Number(c.attendance_count||0),0),
    faithBoosts:checkins.reduce((n,c)=>n+Number(c.faith_boosts_used||0),0),
    peopleSharedWith:checkins.reduce((n,c)=>n+Number(c.people_shared_with||0),0),
    newPeople:checkins.reduce((n,c)=>n+Number(c.new_people_count||0),0),
    nextLeaders:checkins.filter(c=>c.next_leader_identified).length
  };

  return json({
    roles,
    groups,
    people,
    approvedGroupLeaderIds:approvedLeaders.map(leader=>leader.profile_id),
    requests,
    memberships,
    checkins,
    pulse
  },200,s.refreshed?sessionCookies(s.refreshed):[]);
};

export const config={path:"/api/lockliel/admin/groups"};