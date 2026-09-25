import {SUPABASE_URL,json,dbHeaders,requireSession,sessionCookies} from "../lib/lockliel-core.mjs";

export default async(request)=>{
  const s=await requireSession(request);
  if(!s.user||!s.access)return json({error:"Unauthorized"},401);

  const h=dbHeaders(s.access);
  const uid=encodeURIComponent(s.user.id);

  if(request.method==="GET"){
    const r=await fetch(
      SUPABASE_URL+"/rest/v1/privacy_requests?profile_id=eq."+uid+"&select=id,request_type,status,member_note,requested_at,updated_at,resolved_at&order=requested_at.desc",
      {headers:h}
    );
    return json({requests:r.ok?await r.json():[]},200,s.refreshed?sessionCookies(s.refreshed):[]);
  }

  if(request.method==="POST"){
    const b=await request.json().catch(()=>({}));
    if(b.action==="create"){
      const requestType=String(b.requestType||"");
      if(!["data_export","account_deletion"].includes(requestType)){
        return json({error:"Choose a valid privacy request."},400);
      }

      const existing=await fetch(
        SUPABASE_URL+"/rest/v1/privacy_requests?profile_id=eq."+uid+"&request_type=eq."+encodeURIComponent(requestType)+"&status=in.(submitted,in_review)&select=id&limit=1",
        {headers:h}
      );
      const rows=existing.ok?await existing.json():[];
      if(rows.length)return json({error:"You already have an open request of this type."},409);

      const r=await fetch(SUPABASE_URL+"/rest/v1/privacy_requests",{
        method:"POST",
        headers:{...h,Prefer:"return=representation"},
        body:JSON.stringify({
          profile_id:s.user.id,
          request_type:requestType,
          status:"submitted",
          member_note:String(b.memberNote||"").trim().slice(0,3000)||null
        })
      });
      if(!r.ok)return json({error:"Unable to submit privacy request."},r.status);

      return json({ok:true,request:(await r.json())?.[0]||null},200,s.refreshed?sessionCookies(s.refreshed):[]);
    }

    if(b.action==="cancel"){
      const id=String(b.id||"");
      if(!id)return json({error:"Request required."},400);

      const r=await fetch(
        SUPABASE_URL+"/rest/v1/privacy_requests?id=eq."+encodeURIComponent(id)+"&profile_id=eq."+uid+"&status=eq.submitted",
        {
          method:"PATCH",
          headers:{...h,Prefer:"return=representation"},
          body:JSON.stringify({status:"cancelled",updated_at:new Date().toISOString(),resolved_at:new Date().toISOString()})
        }
      );
      if(!r.ok)return json({error:"Unable to cancel request."},r.status);

      return json({ok:true},200,s.refreshed?sessionCookies(s.refreshed):[]);
    }

    return json({error:"Unknown action"},400);
  }

  return json({error:"Method not allowed"},405);
};

export const config={path:"/api/lockliel/privacy"};