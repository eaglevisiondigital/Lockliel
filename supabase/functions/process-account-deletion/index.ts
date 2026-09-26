// @ts-nocheck
import { createClient } from "npm:@supabase/supabase-js@2.117.1";

const headers={"content-type":"application/json","cache-control":"no-store"};

function namedKey(name:string,legacy:string){
  try{
    const raw=Deno.env.get(name);
    if(raw){
      const parsed=JSON.parse(raw);
      if(parsed?.default)return String(parsed.default);
    }
  }catch{}
  return String(Deno.env.get(legacy)||"");
}

function claims(token:string){
  try{
    const part=token.split(".")[1];
    if(!part)return {};
    const normalized=part.replace(/-/g,"+").replace(/_/g,"/");
    const padded=normalized+"=".repeat((4-normalized.length%4)%4);
    return JSON.parse(atob(padded));
  }catch{
    return {};
  }
}

function blockerMessage(state:any){
  const r=state?.responsibilities||{};
  const blockers:string[]=[];
  if(Number(state?.owned_storage_objects||0)>0)blockers.push("member-owned Storage objects");
  if(Number(r.staff_roles||0)>0)blockers.push("staff roles");
  if(Number(r.primary_groups||0)>0)blockers.push("primary group leadership");
  if(Number(r.active_leader_assignments||0)>0)blockers.push("active leader assignments");
  if(Number(r.active_leader_or_host_memberships||0)>0)blockers.push("active group leader/host memberships");
  if(Number(r.active_founders_host_records||0)>0)blockers.push("active Founders 50 host status");
  if(Number(r.open_assigned_followups||0)>0)blockers.push("open assigned follow-up tasks");
  return blockers;
}

Deno.serve(async(req:Request)=>{
  if(req.method!=="POST"){
    return new Response(JSON.stringify({error:"Method not allowed"}),{status:405,headers});
  }

  const url=String(Deno.env.get("SUPABASE_URL")||"");
  const publishable=namedKey("SUPABASE_PUBLISHABLE_KEYS","SUPABASE_ANON_KEY");
  const secret=namedKey("SUPABASE_SECRET_KEYS","SUPABASE_SERVICE_ROLE_KEY");
  const authorization=String(req.headers.get("authorization")||"");
  const token=authorization.startsWith("Bearer ")?authorization.slice(7).trim():"";

  if(!url||!publishable||!secret){
    return new Response(JSON.stringify({error:"Server configuration"}),{status:500,headers});
  }
  if(!token){
    return new Response(JSON.stringify({error:"Unauthorized"}),{status:401,headers});
  }

  const userRes=await fetch(url+"/auth/v1/user",{
    headers:{apikey:publishable,Authorization:"Bearer "+token}
  }).catch(()=>null);
  if(!userRes?.ok){
    return new Response(JSON.stringify({error:"Unauthorized"}),{status:401,headers});
  }
  const user=await userRes.json().catch(()=>null);
  if(!user?.id){
    return new Response(JSON.stringify({error:"Unauthorized"}),{status:401,headers});
  }

  const tokenClaims=claims(token);
  if(tokenClaims?.aal!=="aal2"){
    return new Response(
      JSON.stringify({error:"Multi-factor authentication required.",code:"mfa_required"}),
      {status:403,headers}
    );
  }

  const userHeaders={
    apikey:publishable,
    Authorization:"Bearer "+token,
    "Content-Type":"application/json"
  };

  const activeRes=await fetch(url+"/rest/v1/rpc/lockliel_current_session_active",{
    method:"POST",
    headers:userHeaders,
    body:"{}"
  }).catch(()=>null);
  const active=activeRes?.ok?await activeRes.json().catch(()=>false):false;
  if(active!==true){
    return new Response(JSON.stringify({error:"Session is no longer active."}),{status:401,headers});
  }

  const rolesRes=await fetch(
    url+"/rest/v1/staff_roles?profile_id=eq."+encodeURIComponent(user.id)+"&select=role",
    {headers:userHeaders}
  );
  const roles=rolesRes.ok?(await rolesRes.json()).map((row:any)=>row.role):[];
  if(!roles.some((role:string)=>["super_admin","admin"].includes(role))){
    return new Response(JSON.stringify({error:"Administrator access required."}),{status:403,headers});
  }

  let body:any={};
  try{body=await req.json();}
  catch{return new Response(JSON.stringify({error:"Invalid request"}),{status:400,headers});}

  const requestId=String(body.request_id||"").trim().toLowerCase();
  if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(requestId)){
    return new Response(JSON.stringify({error:"Invalid privacy request."}),{status:400,headers});
  }

  const requestRes=await fetch(
    url+"/rest/v1/privacy_requests?id=eq."+encodeURIComponent(requestId)+
      "&select=id,request_type,status,handled_by&limit=1",
    {headers:userHeaders}
  );
  const requestRows=requestRes.ok?await requestRes.json():[];
  const privacyRequest=Array.isArray(requestRows)?requestRows[0]:null;
  if(!privacyRequest){
    return new Response(JSON.stringify({error:"Privacy request not found."}),{status:404,headers});
  }
  if(privacyRequest.request_type!=="account_deletion"||privacyRequest.status!=="in_review"){
    return new Response(
      JSON.stringify({error:"Account deletion request must be in review before processing."}),
      {status:409,headers}
    );
  }
  if(privacyRequest.handled_by!==user.id){
    return new Response(
      JSON.stringify({error:"Claim this deletion request before processing it."}),
      {status:409,headers}
    );
  }

  const admin=createClient(url,secret,{
    auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}
  });

  const {data:before,error:beforeError}=await admin.rpc(
    "lockliel_account_deletion_state",
    {request_id_input:requestId}
  );
  if(beforeError||!before?.target_profile_id){
    return new Response(
      JSON.stringify({error:"Unable to verify account deletion readiness."}),
      {status:500,headers}
    );
  }

  const targetId=String(before.target_profile_id);
  if(targetId===user.id){
    return new Response(
      JSON.stringify({error:"Another administrator must process your own account-deletion request."}),
      {status:409,headers}
    );
  }

  const blockers=blockerMessage(before);
  if(Number(before.blocker_count||0)>0||blockers.length){
    return new Response(
      JSON.stringify({
        error:"Resolve the member's operational responsibilities before deleting the account.",
        blockers
      }),
      {status:409,headers}
    );
  }

  const executionArgs={
    request_id_input:requestId,
    actor_id_input:user.id,
    actor_session_id_input:tokenClaims.session_id
  };
  const {data:prepared,error:prepareError}=await admin.rpc(
    "lockliel_prepare_account_deletion",
    {...executionArgs,revoke_sessions_input:false}
  );
  if(prepareError||prepared?.target_profile_id!==targetId||
     prepared?.request_status!=="in_review"||prepared?.handled_by!==user.id||
     prepared?.blocker_count!==0||typeof prepared?.auth_user_exists!=="boolean"){
    return new Response(JSON.stringify({error:"Account deletion execution could not be claimed. Refresh and retry."}),{status:409,headers});
  }

  if(prepared.auth_user_exists===true){
    const {error:suspendError}=await admin.auth.admin.updateUserById(targetId,{ban_duration:"876000h"});
    if(suspendError){
      return new Response(JSON.stringify({error:"Unable to suspend account sign-in before deletion. Retry processing."}),{status:409,headers});
    }
  }
  const {data:revoked,error:revokeError}=await admin.rpc(
    "lockliel_prepare_account_deletion",
    {...executionArgs,revoke_sessions_input:true}
  );
  if(revokeError||revoked?.target_profile_id!==targetId||revoked?.session_count!==0||
     revoked?.blocker_count!==0||revoked?.request_status!=="in_review"||
     revoked?.handled_by!==user.id||typeof revoked?.auth_user_exists!=="boolean"){
    return new Response(JSON.stringify({error:"Session revocation could not be verified. Account deletion was not attempted; retry processing."}),{status:409,headers});
  }

  if(revoked.auth_user_exists===true){
    const {error:deleteError}=await admin.auth.admin.deleteUser(targetId);
    if(deleteError){
      return new Response(
        JSON.stringify({error:"Supabase Auth account deletion did not complete. Sign-in remains suspended; retry processing."}),
        {status:409,headers}
      );
    }
  }

  const {data:after,error:afterError}=await admin.rpc(
    "lockliel_account_deletion_state",
    {request_id_input:requestId}
  );
  if(
    afterError||
    after?.target_profile_id!==targetId||
    after?.request_status!=="in_review"||
    after?.handled_by!==user.id||
    after?.auth_user_exists!==false||
    after?.session_count!==0||
    after?.profile_exists!==false||
    after?.owned_storage_objects!==0||
    after?.blocker_count!==0
  ){
    return new Response(
      JSON.stringify({error:"Account deletion could not be verified after Auth processing."}),
      {status:500,headers}
    );
  }

  const {data:scrub,error:scrubError}=await admin.rpc(
    "lockliel_scrub_deleted_nonfinancial_records",
    {request_id_input:requestId}
  );
  if(scrubError||!scrub||!["lead_contacts_deleted","founders50_applications_anonymized","founders50_review_rationales_cleared"].every(key=>Number.isInteger(scrub[key])&&scrub[key]>=0)){
    return new Response(
      JSON.stringify({error:"The Auth account was removed, but personal-data scrubbing still needs to complete. Retry this request."}),
      {status:500,headers}
    );
  }

  return new Response(
    JSON.stringify({
      ok:true,
      sessionsRevoked:true,
      authAccountProcessed:true,
      personalDataProcessed:true,
      scrub:{
        leadContactsDeleted:Number(scrub?.lead_contacts_deleted||0),
        foundersApplicationsAnonymized:Number(scrub?.founders50_applications_anonymized||0),
        founderReviewRationalesCleared:Number(scrub?.founders50_review_rationales_cleared||0)
      }
    }),
    {status:200,headers}
  );
});
