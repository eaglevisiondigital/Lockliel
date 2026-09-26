import {SUPABASE_URL,json,dbHeaders,requireSession,sessionCookies} from "../lib/lockliel-core.mjs";

async function handleRequest(request){
  const s=await requireSession(request);
  if(!s.user||!s.access)return json({error:"Unauthorized"},401);

  const h=dbHeaders(s.access);
  const uid=encodeURIComponent(s.user.id);

  if(request.method==="GET"){
    const r=await fetch(
      SUPABASE_URL+"/rest/v1/privacy_requests?profile_id=eq."+uid+"&select=id,request_type,status,member_note,requested_at,updated_at,resolved_at&order=requested_at.desc",
      {headers:h}
    );
    if(!r.ok)throw new Error("Privacy history unavailable");
    const requests=await r.json();
    if(!Array.isArray(requests))throw new Error("Invalid privacy history");
    return json({requests},200,s.refreshed?sessionCookies(s.refreshed):[]);
  }

  if(request.method==="POST"){
    const b=await request.json().catch(()=>({}));
    if(!b||typeof b!=="object"||Array.isArray(b))return json({error:"Invalid privacy request."},400);
    if(b.action==="create"){
      const requestType=String(b.requestType||"");
      if(!["data_export","account_deletion"].includes(requestType)){
        return json({error:"Choose a valid privacy request."},400);
      }

      const existing=await fetch(
        SUPABASE_URL+"/rest/v1/privacy_requests?profile_id=eq."+uid+"&request_type=eq."+encodeURIComponent(requestType)+"&status=in.(submitted,in_review)&select=id&limit=1",
        {headers:h}
      );
      if(!existing.ok)throw new Error("Open request lookup unavailable");
      const rows=await existing.json();
      if(!Array.isArray(rows))throw new Error("Invalid open request lookup");
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
      if(!r.ok)return json({
        error:r.status===409
          ?"You already have an open request of this type."
          :"Unable to submit privacy request."
      },r.status);

      const created=await r.json().catch(()=>null);
      if(!Array.isArray(created)||created.length!==1||!created[0]?.id||created[0].profile_id!==s.user.id||created[0].request_type!==requestType||created[0].status!=="submitted"){
        return json({error:"Submission could not be confirmed. Refresh your request history before retrying."},502);
      }
      return json({ok:true,request:created[0]},200,s.refreshed?sessionCookies(s.refreshed):[]);
    }

    if(b.action==="cancel"){
      const id=String(b.id||"").toLowerCase();
      if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(id))return json({error:"Valid request required."},400);

      const r=await fetch(
        SUPABASE_URL+"/rest/v1/privacy_requests?id=eq."+encodeURIComponent(id)+"&profile_id=eq."+uid+"&status=eq.submitted",
        {
          method:"PATCH",
          headers:{...h,Prefer:"return=representation"},
          body:JSON.stringify({status:"cancelled"})
        }
      );
      if(!r.ok)return json({error:"Unable to cancel request."},r.status);
      const cancelled=await r.json().catch(()=>null);
      if(!Array.isArray(cancelled)||cancelled.length!==1||cancelled[0]?.id!==id||cancelled[0]?.profile_id!==s.user.id||cancelled[0]?.status!=="cancelled"){
        return json({error:"Cancellation could not be confirmed. The request may have entered review. Refresh your request history."},409);
      }

      return json({ok:true},200,s.refreshed?sessionCookies(s.refreshed):[]);
    }

    return json({error:"Unknown action"},400);
  }

  return json({error:"Method not allowed"},405);
}

export default async(request)=>{
  try{return await handleRequest(request);}
  catch{return json({error:"Privacy requests are temporarily unavailable. Refresh your request history before retrying.",code:"privacy_upstream_unavailable"},503);}
};

export const config={path:"/api/lockliel/privacy"};
