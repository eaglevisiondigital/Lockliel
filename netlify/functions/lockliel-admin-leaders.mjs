import {SUPABASE_URL,json,dbHeaders,requireSession,sessionCookies,sessionAal} from "../lib/lockliel-core.mjs";

export default async(request)=>{
  const s=await requireSession(request);
  if(!s.user||!s.access)return json({error:"Unauthorized"},401);
  if(sessionAal(s.access)!=="aal2")return json({error:"Multi-factor authentication required.",code:"mfa_required"},403);

  const h=dbHeaders(s.access);
  const uid=s.user.id;
  const rr=await fetch(
    SUPABASE_URL+"/rest/v1/staff_roles?profile_id=eq."+encodeURIComponent(uid)+"&select=role",
    {headers:h}
  );
  const roles=rr.ok?(await rr.json()).map(r=>r.role):[];
  if(!roles.some(r=>["super_admin","admin","discipleship_admin","founders50_reviewer"].includes(r))){
    return json({error:"Leader administration access required"},403);
  }

  if(request.method==="POST"){
    const b=await request.json().catch(()=>({}));

    if(b.action==="approveLeader"){
      const profileId=String(b.profileId||"");
      const leaderType=String(b.leaderType||"mentor");
      const allowed=["mentor","group_leader","founders_coach","discipleship_leader","regional_leader"];
      if(!profileId||!allowed.includes(leaderType))return json({error:"Choose a valid person and leader type."},400);

      const cardRes=await fetch(
        SUPABASE_URL+"/rest/v1/profile_connection_cards?profile_id=eq."+encodeURIComponent(profileId)+"&select=language_code&limit=1",
        {headers:h}
      );
      const card=(cardRes.ok?await cardRes.json():[])?.[0]||null;

      const payload={
        profile_id:profileId,
        leader_type:leaderType,
        active:true,
        city:String(b.city||"").trim()||null,
        region:String(b.region||"").trim()||null,
        country:String(b.country||"").trim()||null,
        language_code:String(b.languageCode||card?.language_code||"en").trim().toLowerCase().slice(0,12)||"en",
        capacity:Number(b.capacity)>0?Math.min(10000,Number(b.capacity)):null,
        approved_by:uid,
        updated_at:new Date().toISOString()
      };

      const r=await fetch(
        SUPABASE_URL+"/rest/v1/leader_profiles?on_conflict=profile_id",
        {
          method:"POST",
          headers:{...h,Prefer:"resolution=merge-duplicates,return=representation"},
          body:JSON.stringify(payload)
        }
      );
      if(!r.ok)return json({error:"Unable to approve leader."},r.status);
      return json({ok:true,leader:(await r.json())?.[0]||null},200,s.refreshed?sessionCookies(s.refreshed):[]);
    }

    if(b.action==="assignLeader"){
      const memberId=String(b.memberId||"");
      const leaderId=String(b.leaderId||"");
      const assignmentType=String(b.assignmentType||"mentor");
      const allowedAssignments=["mentor","group_leader","founders_coach","discipleship_leader","regional_leader"];
      if(!memberId||!leaderId||memberId===leaderId)return json({error:"Choose a member and a different leader."},400);
      if(!allowedAssignments.includes(assignmentType))return json({error:"Choose a valid assignment type."},400);

      const lr=await fetch(
        SUPABASE_URL+"/rest/v1/leader_profiles?profile_id=eq."+encodeURIComponent(leaderId)+"&active=eq.true&select=profile_id,leader_type,language_code&limit=1",
        {headers:h}
      );
      const leaders=lr.ok?await lr.json():[];
      if(!leaders.length)return json({error:"That person is not an active approved leader."},400);

      const approvedType=leaders[0].leader_type;
      const compatible={
        mentor:["mentor","discipleship_leader","regional_leader"],
        group_leader:["group_leader","regional_leader"],
        founders_coach:["founders_coach","regional_leader"],
        discipleship_leader:["discipleship_leader","regional_leader"],
        regional_leader:["regional_leader"]
      };
      if(!compatible[assignmentType]?.includes(approvedType)){
        return json({error:"That approved leader role does not support this assignment type."},400);
      }

      const r=await fetch(
        SUPABASE_URL+"/rest/v1/leader_assignments?on_conflict=member_id",
        {
          method:"POST",
          headers:{...h,Prefer:"resolution=merge-duplicates,return=representation"},
          body:JSON.stringify({
            member_id:memberId,
            leader_id:leaderId,
            assignment_type:assignmentType,
            status:"active",
            assigned_by:uid,
            ended_at:null,
            updated_at:new Date().toISOString()
          })
        }
      );
      if(!r.ok)return json({error:"Unable to assign leader."},r.status);
      return json({ok:true,assignment:(await r.json())?.[0]||null},200,s.refreshed?sessionCookies(s.refreshed):[]);
    }

    if(b.action==="endAssignment"){
      const memberId=String(b.memberId||"");
      if(!memberId)return json({error:"Member required."},400);

      const r=await fetch(
        SUPABASE_URL+"/rest/v1/leader_assignments?member_id=eq."+encodeURIComponent(memberId),
        {
          method:"PATCH",
          headers:{...h,Prefer:"return=representation"},
          body:JSON.stringify({status:"ended",ended_at:new Date().toISOString(),updated_at:new Date().toISOString()})
        }
      );
      if(!r.ok)return json({error:"Unable to end leader assignment."},r.status);
      return json({ok:true},200,s.refreshed?sessionCookies(s.refreshed):[]);
    }

    return json({error:"Unknown action"},400);
  }

  if(request.method!=="GET")return json({error:"Method not allowed"},405);

  const [peopleRes,leadersRes,assignmentsRes,requestsRes]=await Promise.all([
    fetch(
      SUPABASE_URL+"/rest/v1/profile_connection_cards?select=profile_id,first_name,last_initial,city,region,country,language_code&order=first_name.asc&limit=5000",
      {headers:h}
    ),
    fetch(
      SUPABASE_URL+"/rest/v1/leader_profiles?select=profile_id,leader_type,active,city,region,country,language_code,capacity,approved_at,updated_at&order=active.desc,approved_at.asc",
      {headers:h}
    ),
    fetch(
      SUPABASE_URL+"/rest/v1/leader_assignments?select=member_id,leader_id,assignment_type,status,assigned_at,ended_at,updated_at&order=assigned_at.desc&limit=5000",
      {headers:h}
    ),
    fetch(
      SUPABASE_URL+"/rest/v1/connection_requests?request_type=eq.connect_with_leader&status=eq.open&select=id,requester_id,request_type,status,message,created_at&order=created_at.asc&limit=500",
      {headers:h}
    )
  ]);

  const people=peopleRes.ok?await peopleRes.json():[];
  const leaders=leadersRes.ok?await leadersRes.json():[];
  const assignments=assignmentsRes.ok?await assignmentsRes.json():[];
  const requests=requestsRes.ok?await requestsRes.json():[];

  return json({roles,people,leaders,assignments,requests},200,s.refreshed?sessionCookies(s.refreshed):[]);
};

export const config={path:"/api/lockliel/admin/leaders"};