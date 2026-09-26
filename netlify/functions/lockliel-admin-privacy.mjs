import {SUPABASE_URL,json,dbHeaders,requireSession,sessionCookies,sessionAal} from "../lib/lockliel-core.mjs";

function confirmedRequest(rows,id,status,handler){
  return Array.isArray(rows)&&rows.length===1&&rows[0]?.id===id
    &&rows[0]?.status===status&&rows[0]?.handled_by===handler;
}

async function loadRequest(id,h){
  const r=await fetch(
    SUPABASE_URL+"/rest/v1/privacy_requests?id=eq."+encodeURIComponent(id)+
      "&select=id,profile_id,request_type,status,handled_by&limit=1",
    {headers:h}
  );
  if(!r.ok)throw new Error("Privacy request lookup unavailable");
  const rows=await r.json();
  if(!Array.isArray(rows)||rows.length>1||
     (rows.length===1&&(!rows[0]||rows[0].id!==id||
       !["account_deletion","data_export"].includes(rows[0].request_type)||
       typeof rows[0].status!=="string"))){
    throw new Error("Invalid privacy request lookup");
  }
  return rows[0]||null;
}

async function handleRequest(request){
  const s=await requireSession(request);
  if(!s.user||!s.access)return json({error:"Unauthorized"},401);
  if(sessionAal(s.access)!=="aal2")return json({error:"Multi-factor authentication required.",code:"mfa_required"},403);

  const h=dbHeaders(s.access);
  const rr=await fetch(
    SUPABASE_URL+"/rest/v1/staff_roles?profile_id=eq."+encodeURIComponent(s.user.id)+"&select=role",
    {headers:h}
  );
  if(!rr.ok)throw new Error("Staff role lookup unavailable");
  const roleRows=await rr.json();
  if(!Array.isArray(roleRows)||roleRows.some(r=>!r||typeof r.role!=="string"))throw new Error("Invalid staff roles");
  const roles=roleRows.map(r=>r.role);
  if(!roles.some(r=>["super_admin","admin"].includes(r))){
    return json({error:"Administrator access required"},403);
  }

  if(request.method==="POST"){
    const b=await request.json().catch(()=>({}));
    if(!b||typeof b!=="object"||Array.isArray(b))return json({error:"Invalid privacy request."},400);
    const id=String(b.id||"").toLowerCase();
    const action=String(b.action||"");
    if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(id))return json({error:"Invalid privacy request."},400);

    if(action==="reclaimDeletion"){
      if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)){
        return json({error:"Invalid privacy request."},400);
      }
      const r=await fetch(SUPABASE_URL+"/rest/v1/rpc/lockliel_reclaim_account_deletion",{
        method:"POST",headers:h,body:JSON.stringify({request_id_input:id})
      }).catch(()=>null);
      if(!r?.ok)return json({error:"Unable to recover this request. Its current handler may still have administrator access. Refresh readiness and try again."},r?409:503);
      const result=await r.json().catch(()=>null);
      if(result?.ok!==true||result.request_id!==id.toLowerCase())return json({error:"Request recovery could not be verified."},502);
      return json({ok:true},200,s.refreshed?sessionCookies(s.refreshed):[]);
    }

    if(action==="claim"){
      const r=await fetch(
        SUPABASE_URL+"/rest/v1/privacy_requests?id=eq."+encodeURIComponent(id)+"&status=eq.submitted",
        {
          method:"PATCH",
          headers:{...h,Prefer:"return=representation"},
          body:JSON.stringify({status:"in_review"})
        }
      );
      if(!r.ok)return json({error:"Unable to claim privacy request."},r.status);
      const rows=await r.json().catch(()=>[]);
      if(!confirmedRequest(rows,id,"in_review",s.user.id))return json({error:"Privacy request claim could not be confirmed. Refresh the queue."},409);
      return json({ok:true},200,s.refreshed?sessionCookies(s.refreshed):[]);
    }

    if(action==="executeDeletion"){
      const current=await loadRequest(id,h);
      if(!current)return json({error:"Privacy request not found."},404);
      if(current.request_type!=="account_deletion"){
        return json({error:"This action only processes account-deletion requests."},400);
      }
      if(current.status!=="in_review"){
        return json({error:"Account deletion request must be in review before processing."},409);
      }
      if(current.handled_by!==s.user.id){
        return json({error:"Claim this deletion request before processing it."},409);
      }

      const adminNote=String(b.adminNote||"").trim().slice(0,5000);
      if(adminNote.length<20){
        return json({
          error:"Document the deletion processing and any retained financial or legal records before continuing."
        },400);
      }

      const controller=new AbortController();
      const timeout=setTimeout(()=>controller.abort(),45000);
      let deletionResponse;
      try{
        deletionResponse=await fetch(
          SUPABASE_URL+"/functions/v1/process-account-deletion",
          {
            method:"POST",
            headers:{
              "Content-Type":"application/json",
              Authorization:"Bearer "+s.access
            },
            body:JSON.stringify({request_id:id}),
            signal:controller.signal
          }
        );
      }catch{
        clearTimeout(timeout);
        return json({error:"Account deletion processing could not be confirmed. Please retry."},503);
      }
      clearTimeout(timeout);

      const deletion=(await deletionResponse.json().catch(()=>null))||{};
      if(!deletionResponse.ok){
        const blockerText=Array.isArray(deletion.blockers)&&deletion.blockers.length
          ?" Resolve: "+deletion.blockers.join(", ")+"."
          :"";
        return json({
          error:(deletion.error||"Account deletion could not be completed.")+blockerText
        },deletionResponse.status);
      }

      if(deletion.ok!==true||deletion.sessionsRevoked!==true||
         deletion.authAccountProcessed!==true||deletion.personalDataProcessed!==true){
        return json({
          error:"Account deletion processing returned incomplete verification. The request remains open; retry processing."
        },502);
      }

      const finalize=await fetch(
        SUPABASE_URL+"/rest/v1/privacy_requests?id=eq."+encodeURIComponent(id)+
          "&status=eq.in_review&request_type=eq.account_deletion&handled_by=eq."+encodeURIComponent(s.user.id),
        {
          method:"PATCH",
          headers:{...h,Prefer:"return=representation"},
          body:JSON.stringify({
            status:"completed",
            admin_note:adminNote,
            deletion_sessions_revoked:true,
            deletion_auth_account_processed:true,
            deletion_personal_data_processed:true
          })
        }
      ).catch(()=>null);
      if(!finalize){
        return json({error:"Account deletion was verified, but saving the processing record could not be confirmed. Refresh the request history before retrying.",code:"finalization_unconfirmed"},503);
      }
      if(!finalize.ok){
        return json({
          error:"Account deletion completed, but the privacy processing record still needs finalization. Retry this request."
        },500);
      }
      const finalized=await finalize.json().catch(()=>[]);
      if(!confirmedRequest(finalized,id,"completed",s.user.id)){
        return json({
          error:"Account deletion completed, but the privacy request changed before finalization. Review the request history."
        },409);
      }

      return json(
        {ok:true,deletion},
        200,
        s.refreshed?sessionCookies(s.refreshed):[]
      );
    }

    if(action==="resolve"){
      const status=String(b.status||"");
      if(!["completed","declined"].includes(status))return json({error:"Invalid resolution."},400);

      const current=await loadRequest(id,h);
      if(!current)return json({error:"Privacy request not found."},404);
      if(current.status!=="in_review")return json({error:"Privacy request must be in review before resolution."},409);
      if(current.handled_by!==s.user.id)return json({error:"Only the assigned administrator can resolve this request."},409);

      const adminNote=String(b.adminNote||"").trim().slice(0,5000);

      if(current.request_type==="account_deletion"&&status==="completed"){
        return json({
          error:"Use verified account-deletion processing instead of manually marking this request completed."
        },409);
      }

      const r=await fetch(
        SUPABASE_URL+"/rest/v1/privacy_requests?id=eq."+encodeURIComponent(id)+"&status=eq.in_review&handled_by=eq."+encodeURIComponent(s.user.id),
        {
          method:"PATCH",
          headers:{...h,Prefer:"return=representation"},
          body:JSON.stringify({
            status,
            admin_note:adminNote||null
          })
        }
      );
      if(!r.ok)return json({error:"Unable to resolve privacy request."},r.status);
      const rows=await r.json().catch(()=>[]);
      if(!confirmedRequest(rows,id,status,s.user.id))return json({error:"Privacy request changed before resolution."},409);
      return json({ok:true},200,s.refreshed?sessionCookies(s.refreshed):[]);
    }

    return json({error:"Unknown action"},400);
  }

  if(request.method!=="GET")return json({error:"Method not allowed"},405);

  const requestId=new URL(request.url).searchParams.get("request_id");
  if(requestId!==null){
    if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestId)){
      return json({error:"Invalid privacy request."},400);
    }
    const r=await fetch(SUPABASE_URL+"/rest/v1/rpc/lockliel_admin_deletion_readiness",{
      method:"POST",headers:h,body:JSON.stringify({request_id_input:requestId})
    }).catch(()=>null);
    if(!r?.ok)return json({error:"Unable to verify deletion readiness. Refresh and try again."},503);
    const readiness=await r.json().catch(()=>null);
    if(readiness?.request_id!==requestId.toLowerCase()||typeof readiness.terminal!=="boolean"){
      return json({error:"Deletion readiness returned incomplete information."},502);
    }
    return json({readiness},200,s.refreshed?sessionCookies(s.refreshed):[]);
  }

  const [requestsRes,peopleRes]=await Promise.all([
    fetch(
      SUPABASE_URL+"/rest/v1/privacy_requests?select=id,profile_id,request_type,status,member_note,admin_note,requested_at,updated_at,resolved_at,handled_by,deletion_sessions_revoked,deletion_auth_account_processed,deletion_personal_data_processed&order=requested_at.asc&limit=500",
      {headers:h}
    ),
    fetch(
      SUPABASE_URL+"/rest/v1/profile_finance_cards?select=profile_id,display_name,email,city,region,country&limit=5000",
      {headers:h}
    ).catch(()=>null)
  ]);

  if(!requestsRes.ok)return json({error:"Unable to load privacy requests. Please retry."},503);
  const requests=await requestsRes.json().catch(()=>null);
  if(!Array.isArray(requests))return json({error:"Unable to load privacy requests. Please retry."},503);
  const peoplePayload=peopleRes?.ok?await peopleRes.json().catch(()=>null):null;
  const peopleAvailable=Array.isArray(peoplePayload)&&peoplePayload.every(p=>p&&typeof p.profile_id==="string");
  const people=peopleAvailable?peoplePayload:[];
  const peopleMap=Object.fromEntries(people.map(p=>[p.profile_id,p]));

  return json({
    currentUserId:s.user.id,
    peopleUnavailable:!peopleAvailable,
    requests:requests.map(r=>({
      ...r,
      person:peopleMap[r.profile_id]||null,
      handler:peopleMap[r.handled_by]||null
    })),
    openCount:requests.filter(r=>["submitted","in_review"].includes(r.status)).length
  },200,s.refreshed?sessionCookies(s.refreshed):[]);
}

export default async(request)=>{
  try{return await handleRequest(request);}
  catch{
    return json({error:"Privacy processing is temporarily unavailable. A submitted change may have been saved. Refresh the request history before retrying.",code:"privacy_upstream_unavailable"},503);
  }
};

export const config={path:"/api/lockliel/admin/privacy"};
