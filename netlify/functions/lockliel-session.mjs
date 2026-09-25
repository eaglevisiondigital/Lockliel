import {
  SUPABASE_URL,
  json,
  dbHeaders,
  requireSession,
  sessionCookies,
  clearCookie,
  ACCESS_COOKIE,
  REFRESH_COOKIE
} from "../lib/lockliel-core.mjs";

export default async(request)=>{
  if(request.method!=="GET")return json({error:"Method not allowed"},405);

  const s=await requireSession(request);
  if(!s.user||!s.access){
    return json(
      {authenticated:false},
      401,
      [clearCookie(ACCESS_COOKIE),clearCookie(REFRESH_COOKIE)]
    );
  }

  const h=dbHeaders(s.access);
  const id=encodeURIComponent(s.user.id);

  const [p,j,r,f,g,lp,la]=await Promise.all([
    fetch(
      SUPABASE_URL+"/rest/v1/profiles?id=eq."+id+"&select=id,first_name,last_name,email,phone,city,region,country,onboarding_status,original_inviter_id,current_leader_id",
      {headers:h}
    ),
    fetch(
      SUPABASE_URL+"/rest/v1/member_journey?profile_id=eq."+id+"&select=next_step_type,next_step_title,next_step_path,reach_one_count,active_connections_count,last_faith_boost_at",
      {headers:h}
    ),
    fetch(
      SUPABASE_URL+"/rest/v1/staff_roles?profile_id=eq."+id+"&select=role",
      {headers:h}
    ),
    fetch(
      SUPABASE_URL+"/rest/v1/founders50_applications?profile_id=eq."+id+"&select=status,created_at&order=created_at.desc&limit=1",
      {headers:h}
    ),
    fetch(
      SUPABASE_URL+"/rest/v1/group_members?profile_id=eq."+id+"&status=eq.active&select=group_id,role,joined_at",
      {headers:h}
    ),
    fetch(
      SUPABASE_URL+"/rest/v1/leader_profiles?profile_id=eq."+id+"&active=eq.true&select=leader_type,city,region,country,capacity,approved_at&limit=1",
      {headers:h}
    ),
    fetch(
      SUPABASE_URL+"/rest/v1/leader_assignments?leader_id=eq."+id+"&status=eq.active&select=member_id",
      {headers:h}
    )
  ]);

  const profiles=p.ok?await p.json():[];
  const journeys=j.ok?await j.json():[];
  const roles=r.ok?(await r.json()).map(x=>x.role):[];
  const founders=f.ok?await f.json():[];
  const groups=g.ok?await g.json():[];
  const leaderProfiles=lp.ok?await lp.json():[];
  const leaderAssignments=la.ok?await la.json():[];

  return json({
    authenticated:true,
    user:{id:s.user.id,email:s.user.email},
    profile:profiles[0]||null,
    journey:journeys[0]||null,
    roles,
    founderStatus:founders?.[0]?.status||null,
    groupMemberships:groups,
    leaderProfile:leaderProfiles?.[0]||null,
    peopleAssignedCount:leaderAssignments.length
  },200,s.refreshed?sessionCookies(s.refreshed):[]);
};

export const config={path:"/api/lockliel-auth/session"};