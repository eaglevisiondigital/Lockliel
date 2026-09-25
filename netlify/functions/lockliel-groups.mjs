import {SUPABASE_URL,json,dbHeaders,requireSession,sessionCookies} from "../lib/lockliel-core.mjs";

function inFilter(ids){
  return "in.("+ids.join(",")+")";
}

async function createRequest({h,uid,requestType,message,requestedGroupId=null}){
  const existing=await fetch(
    SUPABASE_URL+"/rest/v1/connection_requests?requester_id=eq."+encodeURIComponent(uid)+"&request_type=eq."+encodeURIComponent(requestType)+"&status=eq.open&select=id&limit=1",
    {headers:h}
  );
  const rows=existing.ok?await existing.json():[];
  if(rows.length)return {ok:false,status:409,error:"You already have an open request of this type."};

  const r=await fetch(SUPABASE_URL+"/rest/v1/connection_requests",{
    method:"POST",
    headers:{...h,Prefer:"return=representation"},
    body:JSON.stringify({
      requester_id:uid,
      requested_group_id:requestedGroupId||null,
      request_type:requestType,
      status:"open",
      message
    })
  });

  if(!r.ok)return {
    ok:false,
    status:r.status,
    error:r.status===409
      ?"You already have an open request of this type."
      :"Unable to submit your request."
  };
  return {ok:true,request:(await r.json())?.[0]||null};
}

export default async(request)=>{
  const s=await requireSession(request);
  if(!s.user||!s.access)return json({error:"Unauthorized"},401);

  const h=dbHeaders(s.access);
  const uid=s.user.id;

  if(request.method==="POST"){
    const b=await request.json().catch(()=>({}));
    const action=String(b.action||"");

    if(action==="requestGroup"){
      const result=await createRequest({
        h,
        uid,
        requestType:"find_local_group",
        message:"Member requested help finding a local Lockliel group or gathering."
      });
      if(!result.ok)return json({error:result.error},result.status);
      return json({ok:true,request:result.request},200,s.refreshed?sessionCookies(s.refreshed):[]);
    }

    if(action==="requestHosting"){
      const result=await createRequest({
        h,
        uid,
        requestType:"explore_hosting",
        message:"Member requested a conversation about hosting or helping lead a Lockliel gathering."
      });
      if(!result.ok)return json({error:result.error},result.status);
      return json({ok:true,request:result.request},200,s.refreshed?sessionCookies(s.refreshed):[]);
    }

    if(action==="requestGroupChange"){
      const groupId=String(b.groupId||"");
      const reason=String(b.reason||"").trim().slice(0,1500);
      if(!groupId)return json({error:"Current group required."},400);

      const membershipRes=await fetch(
        SUPABASE_URL+"/rest/v1/group_members?group_id=eq."+encodeURIComponent(groupId)+
        "&profile_id=eq."+encodeURIComponent(uid)+
        "&status=eq.active&select=group_id,role&limit=1",
        {headers:h}
      );
      const memberships=membershipRes.ok?await membershipRes.json():[];
      if(!memberships.length)return json({error:"Active group membership not found."},404);

      const result=await createRequest({
        h,
        uid,
        requestType:"leave_or_change_group",
        requestedGroupId:groupId,
        message:reason||"Member requested help leaving or changing their current Lockliel group."
      });
      if(!result.ok)return json({error:result.error},result.status);
      return json({ok:true,request:result.request},200,s.refreshed?sessionCookies(s.refreshed):[]);
    }

    if(action==="cancelRequest"){
      const requestId=String(b.requestId||"");
      if(!requestId)return json({error:"Request required."},400);

      const r=await fetch(
        SUPABASE_URL+"/rest/v1/connection_requests?id=eq."+encodeURIComponent(requestId)+"&requester_id=eq."+encodeURIComponent(uid)+"&status=eq.open",
        {
          method:"PATCH",
          headers:{...h,Prefer:"return=representation"},
          body:JSON.stringify({status:"closed"})
        }
      );
      if(!r.ok)return json({error:"Unable to cancel request."},r.status);
      return json({ok:true},200,s.refreshed?sessionCookies(s.refreshed):[]);
    }

    if(action==="weeklyCheckin"){
      const groupId=String(b.groupId||"");
      const weekStart=String(b.weekStart||"");
      if(!groupId||!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(weekStart)){
        return json({error:"Group and week are required."},400);
      }

      const payload={
        group_id:groupId,
        submitted_by:uid,
        week_start:weekStart,
        gathered:Boolean(b.gathered),
        attendance_count:Math.max(0,Math.min(10000,Number(b.attendanceCount)||0)),
        faith_boosts_used:Math.max(0,Math.min(50,Number(b.faithBoostsUsed)||0)),
        people_shared_with:Math.max(0,Math.min(10000,Number(b.peopleSharedWith)||0)),
        new_people_count:Math.max(0,Math.min(10000,Number(b.newPeopleCount)||0)),
        next_leader_identified:Boolean(b.nextLeaderIdentified),
        testimony:String(b.testimony||"").trim().slice(0,5000)||null,
        needs_support:String(b.needsSupport||"").trim().slice(0,5000)||null,
};

      const r=await fetch(
        SUPABASE_URL+"/rest/v1/group_weekly_checkins?on_conflict=group_id,week_start",
        {
          method:"POST",
          headers:{...h,Prefer:"resolution=merge-duplicates,return=representation"},
          body:JSON.stringify(payload)
        }
      );
      if(!r.ok){
        const detail=await r.text().catch(()=>"");
        return json({error:"Unable to save weekly check-in.",detail:detail.slice(0,250)},r.status);
      }

      return json({ok:true,checkin:(await r.json())?.[0]||null},200,s.refreshed?sessionCookies(s.refreshed):[]);
    }

    return json({error:"Unknown action"},400);
  }

  if(request.method!=="GET")return json({error:"Method not allowed"},405);

  const [mineRes,requestRes]=await Promise.all([
    fetch(
      SUPABASE_URL+"/rest/v1/group_members?profile_id=eq."+encodeURIComponent(uid)+"&status=eq.active&select=group_id,role,status,joined_at",
      {headers:h}
    ),
    fetch(
      SUPABASE_URL+"/rest/v1/connection_requests?requester_id=eq."+encodeURIComponent(uid)+"&request_type=in.(find_local_group,explore_hosting,leave_or_change_group)&status=eq.open&select=id,requested_group_id,request_type,status,message,created_at",
      {headers:h}
    )
  ]);

  const mine=mineRes.ok?await mineRes.json():[];
  const requests=requestRes.ok?await requestRes.json():[];
  const ids=mine.map(m=>m.group_id);

  if(!ids.length){
    return json({groups:[],requests},200,s.refreshed?sessionCookies(s.refreshed):[]);
  }

  const [groupsRes,membersRes,checkinsRes]=await Promise.all([
    fetch(
      SUPABASE_URL+"/rest/v1/groups?id="+encodeURIComponent(inFilter(ids))+"&select=id,name,leader_id,city,region,country,status,created_at",
      {headers:h}
    ),
    fetch(
      SUPABASE_URL+"/rest/v1/group_members?group_id="+encodeURIComponent(inFilter(ids))+"&status=eq.active&select=group_id,profile_id,role,joined_at",
      {headers:h}
    ),
    fetch(
      SUPABASE_URL+"/rest/v1/group_weekly_checkins?group_id="+encodeURIComponent(inFilter(ids))+"&select=id,group_id,submitted_by,week_start,gathered,attendance_count,faith_boosts_used,people_shared_with,new_people_count,next_leader_identified,testimony,needs_support,created_at,updated_at&order=week_start.desc&limit=50",
      {headers:h}
    )
  ]);

  const groups=groupsRes.ok?await groupsRes.json():[];
  const members=membersRes.ok?await membersRes.json():[];
  const checkins=checkinsRes.ok?await checkinsRes.json():[];
  const profileIds=[...new Set(members.map(m=>m.profile_id))];

  let cards=[];
  if(profileIds.length){
    const cr=await fetch(
      SUPABASE_URL+"/rest/v1/profile_connection_cards?profile_id="+encodeURIComponent(inFilter(profileIds))+"&select=profile_id,first_name,last_initial,city,region,country",
      {headers:h}
    );
    cards=cr.ok?await cr.json():[];
  }

  const cardMap=Object.fromEntries(cards.map(c=>[c.profile_id,c]));

  return json({
    requests,
    groups:groups.map(g=>({
      ...g,
      myRole:mine.find(m=>m.group_id===g.id)?.role||"participant",
      members:members
        .filter(m=>m.group_id===g.id)
        .map(m=>({...m,person:cardMap[m.profile_id]||null})),
      checkins:checkins.filter(c=>c.group_id===g.id)
    }))
  },200,s.refreshed?sessionCookies(s.refreshed):[]);
};

export const config={path:"/api/lockliel/groups"};