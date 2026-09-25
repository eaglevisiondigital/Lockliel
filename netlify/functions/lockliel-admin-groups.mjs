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
      const groupId=String(b.groupId||"");
      const profileId=String(b.profileId||"");
      const requestId=String(b.requestId||"");

      if(!groupId||!profileId)return json({error:"Group and member are required."},400);

      const mr=await fetch(
        SUPABASE_URL+"/rest/v1/group_members?on_conflict=group_id,profile_id",
        {
          method:"POST",
          headers:{...h,Prefer:"resolution=merge-duplicates,return=minimal"},
          body:JSON.stringify({
            group_id:groupId,
            profile_id:profileId,
            role:"participant",
            status:"active",
            left_at:null
          })
        }
      );
      if(!mr.ok)return json({error:"Unable to add member to group."},mr.status);

      if(requestId){
        await fetch(
          SUPABASE_URL+"/rest/v1/connection_requests?id=eq."+encodeURIComponent(requestId),
          {
            method:"PATCH",
            headers:{...h,Prefer:"return=minimal"},
            body:JSON.stringify({status:"resolved"})
          }
        );
      }

      return json({ok:true},200,s.refreshed?sessionCookies(s.refreshed):[]);
    }

    if(b.action==="resolveGroupChange"){
      const requestId=String(b.requestId||"");
      const targetGroupId=String(b.targetGroupId||"").trim();

      if(!requestId)return json({error:"Group transition request required."},400);

      const requestRes=await fetch(
        SUPABASE_URL+"/rest/v1/connection_requests?id=eq."+encodeURIComponent(requestId)+
        "&request_type=eq.leave_or_change_group&status=eq.open"+
        "&select=id,requester_id,requested_group_id&limit=1",
        {headers:h}
      );
      const requestRows=requestRes.ok?await requestRes.json():[];
      const transition=requestRows?.[0]||null;
      if(!transition?.requester_id||!transition?.requested_group_id){
        return json({error:"Open group transition request not found."},404);
      }

      const membershipRes=await fetch(
        SUPABASE_URL+"/rest/v1/group_members?group_id=eq."+encodeURIComponent(transition.requested_group_id)+
        "&profile_id=eq."+encodeURIComponent(transition.requester_id)+
        "&status=eq.active&select=group_id,profile_id,role,status&limit=1",
        {headers:h}
      );
      const membership=(membershipRes.ok?await membershipRes.json():[])?.[0]||null;
      if(!membership)return json({error:"Current active group membership not found."},404);

      if(["leader","host"].includes(membership.role)){
        return json({error:"Reassign group leadership before moving or ending this leader/host membership."},409);
      }

      if(targetGroupId&&targetGroupId===transition.requested_group_id){
        return json({error:"Choose a different group or end the current membership."},400);
      }

      let targetAdded=false;
      if(targetGroupId){
        const groupRes=await fetch(
          SUPABASE_URL+"/rest/v1/groups?id=eq."+encodeURIComponent(targetGroupId)+
          "&status=in.(forming,active)&select=id&limit=1",
          {headers:h}
        );
        const target=(groupRes.ok?await groupRes.json():[])?.[0]||null;
        if(!target)return json({error:"Target group is not available for assignment."},404);

        const addRes=await fetch(
          SUPABASE_URL+"/rest/v1/group_members?on_conflict=group_id,profile_id",
          {
            method:"POST",
            headers:{...h,Prefer:"resolution=merge-duplicates,return=minimal"},
            body:JSON.stringify({
              group_id:targetGroupId,
              profile_id:transition.requester_id,
              role:"participant",
              status:"active",
              left_at:null
            })
          }
        );
        if(!addRes.ok)return json({error:"Unable to add member to the new group."},addRes.status);
        targetAdded=true;
      }

      const now=new Date().toISOString();
      const endRes=await fetch(
        SUPABASE_URL+"/rest/v1/group_members?group_id=eq."+encodeURIComponent(transition.requested_group_id)+
        "&profile_id=eq."+encodeURIComponent(transition.requester_id)+
        "&status=eq.active",
        {
          method:"PATCH",
          headers:{...h,Prefer:"return=representation"},
          body:JSON.stringify({status:"inactive",left_at:now})
        }
      );

      if(!endRes.ok){
        if(targetAdded){
          await fetch(
            SUPABASE_URL+"/rest/v1/group_members?group_id=eq."+encodeURIComponent(targetGroupId)+
            "&profile_id=eq."+encodeURIComponent(transition.requester_id),
            {
              method:"PATCH",
              headers:{...h,Prefer:"return=minimal"},
              body:JSON.stringify({status:"inactive",left_at:now})
            }
          ).catch(()=>null);
        }
        return json({error:"Unable to end the current group membership."},endRes.status);
      }

      const endedRows=await endRes.json();
      if(!endedRows.length)return json({error:"Current group membership changed before this request was processed."},409);

      const resolveRes=await fetch(
        SUPABASE_URL+"/rest/v1/connection_requests?id=eq."+encodeURIComponent(requestId)+"&status=eq.open",
        {
          method:"PATCH",
          headers:{...h,Prefer:"return=representation"},
          body:JSON.stringify({status:"resolved"})
        }
      );
      if(!resolveRes.ok)return json({error:"Membership changed, but request status could not be resolved."},500);

      return json({
        ok:true,
        outcome:targetGroupId?"transferred":"ended",
        targetGroupId:targetGroupId||null
      },200,s.refreshed?sessionCookies(s.refreshed):[]);
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