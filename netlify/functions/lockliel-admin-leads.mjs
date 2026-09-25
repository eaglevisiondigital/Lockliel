import {SUPABASE_URL,json,dbHeaders,requireSession,sessionCookies,sessionAal} from "../lib/lockliel-core.mjs";

export default async(request)=>{
  const s=await requireSession(request);
  if(!s.user||!s.access)return json({error:"Unauthorized"},401);
  if(sessionAal(s.access)!=="aal2")return json({error:"Multi-factor authentication required.",code:"mfa_required"},403);

  const h=dbHeaders(s.access);
  const rr=await fetch(
    SUPABASE_URL+"/rest/v1/staff_roles?profile_id=eq."+encodeURIComponent(s.user.id)+"&select=role",
    {headers:h}
  );
  const roles=rr.ok?(await rr.json()).map(r=>r.role):[];
  if(!roles.some(r=>["super_admin","admin"].includes(r))){
    return json({error:"Lead administration access required"},403);
  }

  if(request.method==="POST"){
    const b=await request.json().catch(()=>({}));
    const leadId=String(b.leadId||"");
    if(!leadId)return json({error:"Lead required"},400);

    if(b.action==="claim"){
      const r=await fetch(
        SUPABASE_URL+"/rest/v1/lead_contacts?id=eq."+encodeURIComponent(leadId),
        {
          method:"PATCH",
          headers:{...h,Prefer:"return=representation"},
          body:JSON.stringify({
            assigned_to:s.user.id,
            next_follow_up_at:b.nextFollowUpAt||new Date(Date.now()+24*60*60*1000).toISOString(),
            updated_at:new Date().toISOString()
          })
        }
      );
      if(!r.ok)return json({error:"Unable to claim lead."},r.status);
      return json({ok:true,lead:(await r.json())?.[0]||null},200,s.refreshed?sessionCookies(s.refreshed):[]);
    }

    if(b.action==="update"){
      const status=String(b.status||"");
      const allowed=["new","contacted","nurture","converted","closed"];
      if(!allowed.includes(status))return json({error:"Invalid lead status."},400);

      const nextRaw=String(b.nextFollowUpAt||"").trim();
      const nextFollowUpAt=nextRaw&&!Number.isNaN(Date.parse(nextRaw))
        ? new Date(nextRaw).toISOString()
        : null;

      const patch={
        status,
        assigned_to:b.assignToMe?s.user.id:(b.keepAssignment?undefined:null),
        next_follow_up_at:nextFollowUpAt,
        admin_notes:String(b.adminNotes||"").trim().slice(0,5000)||null,
        last_contacted_at:status==="contacted"?new Date().toISOString():undefined,
        updated_at:new Date().toISOString()
      };
      Object.keys(patch).forEach(k=>patch[k]===undefined&&delete patch[k]);

      const r=await fetch(
        SUPABASE_URL+"/rest/v1/lead_contacts?id=eq."+encodeURIComponent(leadId),
        {
          method:"PATCH",
          headers:{...h,Prefer:"return=representation"},
          body:JSON.stringify(patch)
        }
      );
      if(!r.ok)return json({error:"Unable to update lead."},r.status);
      return json({ok:true,lead:(await r.json())?.[0]||null},200,s.refreshed?sessionCookies(s.refreshed):[]);
    }

    return json({error:"Unknown action"},400);
  }

  if(request.method!=="GET")return json({error:"Method not allowed"},405);

  const [leadsRes,sourcesRes,peopleRes]=await Promise.all([
    fetch(
      SUPABASE_URL+"/rest/v1/lead_contacts?select=id,email,first_name,last_name,phone,linked_profile_id,status,assigned_to,next_follow_up_at,last_contacted_at,admin_notes,created_at,updated_at&order=created_at.desc&limit=1000",
      {headers:h}
    ),
    fetch(
      SUPABASE_URL+"/rest/v1/lead_sources?select=id,lead_id,source_type,source_ref,campaign,attribution,consent,created_at&order=created_at.asc&limit=10000",
      {headers:h}
    ),
    fetch(
      SUPABASE_URL+"/rest/v1/profile_connection_cards?select=profile_id,first_name,last_initial,city,region,country&limit=5000",
      {headers:h}
    )
  ]);

  const leads=leadsRes.ok?await leadsRes.json():[];
  const sources=sourcesRes.ok?await sourcesRes.json():[];
  const people=peopleRes.ok?await peopleRes.json():[];
  const peopleMap=Object.fromEntries(people.map(p=>[p.profile_id,p]));

  const now=Date.now();
  const summary={
    total:leads.length,
    new:leads.filter(l=>l.status==="new").length,
    contacted:leads.filter(l=>l.status==="contacted").length,
    nurture:leads.filter(l=>l.status==="nurture").length,
    converted:leads.filter(l=>l.status==="converted"||l.linked_profile_id).length,
    due:leads.filter(l=>l.next_follow_up_at&&new Date(l.next_follow_up_at).getTime()<=now&&!["converted","closed"].includes(l.status)).length
  };

  const enriched=leads.map(lead=>({
    ...lead,
    sources:sources.filter(src=>src.lead_id===lead.id),
    assignedPerson:lead.assigned_to?peopleMap[lead.assigned_to]||null:null,
    linkedPerson:lead.linked_profile_id?peopleMap[lead.linked_profile_id]||null:null
  }));

  return json({
    currentUserId:s.user.id,
    summary,
    leads:enriched
  },200,s.refreshed?sessionCookies(s.refreshed):[]);
};

export const config={path:"/api/lockliel/admin/leads"};