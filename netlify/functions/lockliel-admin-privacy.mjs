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
    return json({error:"Administrator access required"},403);
  }

  if(request.method==="POST"){
    const b=await request.json().catch(()=>({}));
    const id=String(b.id||"");
    const action=String(b.action||"");
    if(!id)return json({error:"Privacy request required."},400);

    if(action==="claim"){
      const r=await fetch(
        SUPABASE_URL+"/rest/v1/privacy_requests?id=eq."+encodeURIComponent(id)+"&status=eq.submitted",
        {
          method:"PATCH",
          headers:{...h,Prefer:"return=representation"},
          body:JSON.stringify({
            status:"in_review",
            handled_by:s.user.id
          })
        }
      );
      if(!r.ok)return json({error:"Unable to claim privacy request."},r.status);
      return json({ok:true},200,s.refreshed?sessionCookies(s.refreshed):[]);
    }

    if(action==="resolve"){
      const status=String(b.status||"");
      if(!["completed","declined"].includes(status))return json({error:"Invalid resolution."},400);

      const currentRes=await fetch(
        SUPABASE_URL+"/rest/v1/privacy_requests?id=eq."+encodeURIComponent(id)+"&select=id,request_type,status&limit=1",
        {headers:h}
      );
      const current=(currentRes.ok?await currentRes.json():[])?.[0]||null;
      if(!current)return json({error:"Privacy request not found."},404);
      if(current.status!=="in_review")return json({error:"Privacy request must be in review before resolution."},409);

      const adminNote=String(b.adminNote||"").trim().slice(0,5000);
      if(
        current.request_type==="account_deletion" &&
        status==="completed" &&
        adminNote.length<20
      ){
        return json({
          error:"Document the account and personal-data processing steps before marking a deletion request completed."
        },400);
      }

      const r=await fetch(
        SUPABASE_URL+"/rest/v1/privacy_requests?id=eq."+encodeURIComponent(id),
        {
          method:"PATCH",
          headers:{...h,Prefer:"return=representation"},
          body:JSON.stringify({
            status,
            handled_by:s.user.id,
            admin_note:adminNote||null,
            resolved_at:new Date().toISOString()
          })
        }
      );
      if(!r.ok)return json({error:"Unable to resolve privacy request."},r.status);
      return json({ok:true},200,s.refreshed?sessionCookies(s.refreshed):[]);
    }

    return json({error:"Unknown action"},400);
  }

  if(request.method!=="GET")return json({error:"Method not allowed"},405);

  const [requestsRes,peopleRes]=await Promise.all([
    fetch(
      SUPABASE_URL+"/rest/v1/privacy_requests?select=id,profile_id,request_type,status,member_note,admin_note,requested_at,updated_at,resolved_at,handled_by&order=requested_at.asc&limit=500",
      {headers:h}
    ),
    fetch(
      SUPABASE_URL+"/rest/v1/profile_finance_cards?select=profile_id,display_name,email,city,region,country&limit=5000",
      {headers:h}
    )
  ]);

  const requests=requestsRes.ok?await requestsRes.json():[];
  const people=peopleRes.ok?await peopleRes.json():[];
  const peopleMap=Object.fromEntries(people.map(p=>[p.profile_id,p]));

  return json({
    currentUserId:s.user.id,
    requests:requests.map(r=>({
      ...r,
      person:peopleMap[r.profile_id]||null,
      handler:peopleMap[r.handled_by]||null
    })),
    openCount:requests.filter(r=>["submitted","in_review"].includes(r.status)).length
  },200,s.refreshed?sessionCookies(s.refreshed):[]);
};

export const config={path:"/api/lockliel/admin/privacy"};