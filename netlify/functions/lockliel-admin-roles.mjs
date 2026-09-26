import {SUPABASE_URL,json,dbHeaders,requireSession,sessionCookies,sessionAal} from "../lib/lockliel-core.mjs";

const allowedRoles=[
  "super_admin",
  "admin",
  "discipleship_admin",
  "founders50_reviewer",
  "group_leader",
  "finance_admin",
  "content_admin",
  "fulfillment_admin"
];

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
  if(!roles.includes("super_admin"))return json({error:"Super administrator access required"},403);

  if(request.method==="POST"){
    const b=await request.json().catch(()=>({}));
    const profileId=String(b.profileId||"");
    const role=String(b.role||"");
    const action=String(b.action||"");

    if(!profileId||!allowedRoles.includes(role))return json({error:"Choose a valid member and role."},400);
    if(profileId===s.user.id&&role==="super_admin"&&action==="remove"){
      return json({error:"You cannot remove your own super administrator role here."},400);
    }

    if(action==="grant"){
      const r=await fetch(SUPABASE_URL+"/rest/v1/staff_roles",{
        method:"POST",
        headers:{...h,Prefer:"resolution=ignore-duplicates,return=minimal"},
        body:JSON.stringify({profile_id:profileId,role})
      });
      if(!r.ok)return json({error:"Unable to grant role."},r.status);
      return json({ok:true},200,s.refreshed?sessionCookies(s.refreshed):[]);
    }

    if(action==="remove"){
      const r=await fetch(
        SUPABASE_URL+"/rest/v1/staff_roles?profile_id=eq."+encodeURIComponent(profileId)+"&role=eq."+encodeURIComponent(role),
        {method:"DELETE",headers:{...h,Prefer:"return=minimal"}}
      );
      if(!r.ok)return json({error:"Unable to remove role."},r.status);
      return json({ok:true},200,s.refreshed?sessionCookies(s.refreshed):[]);
    }

    return json({error:"Unknown action"},400);
  }

  if(request.method!=="GET")return json({error:"Method not allowed"},405);

  const [peopleRes,staffRes]=await Promise.all([
    fetch(
      SUPABASE_URL+"/rest/v1/profile_finance_cards?select=profile_id,display_name,email,city,region,country&order=display_name.asc&limit=2000",
      {headers:h}
    ),
    fetch(
      SUPABASE_URL+"/rest/v1/staff_roles?select=profile_id,role,granted_at&order=granted_at.asc",
      {headers:h}
    )
  ]);

  const staff=staffRes.ok?await staffRes.json():[];
  return json({
    people:peopleRes.ok?await peopleRes.json():[],
    staff,
    allowedRoles,
    currentProfileId:s.user.id,
    superAdminCount:staff.filter(item=>item.role==="super_admin").length
  },200,s.refreshed?sessionCookies(s.refreshed):[]);
};

export const config={path:"/api/lockliel/admin/roles"};