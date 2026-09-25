import {
  SUPABASE_URL,
  SUPABASE_KEY,
  json,
  requireSession,
  sessionCookies,
  sessionAal,
  hasVerifiedTotp
} from "../lib/lockliel-core.mjs";

function authHeaders(access){
  return {
    apikey:SUPABASE_KEY,
    Authorization:"Bearer "+access,
    "Content-Type":"application/json"
  };
}

async function authJson(path,access,options={}){
  const response=await fetch(SUPABASE_URL+"/auth/v1"+path,{
    ...options,
    headers:{...authHeaders(access),...(options.headers||{})}
  });
  const data=await response.json().catch(()=>({}));
  return {response,data};
}

export default async(request)=>{
  const s=await requireSession(request);
  if(!s.user||!s.access)return json({error:"Unauthorized"},401);

  if(request.method==="GET"){
    const factors=Array.isArray(s.user.factors)?s.user.factors:[];
    const safeFactors=factors
      .filter(f=>["totp","phone"].includes(f.factor_type))
      .map(f=>({
        id:f.id,
        status:f.status,
        factorType:f.factor_type,
        friendlyName:f.friendly_name||null,
        createdAt:f.created_at||null,
        updatedAt:f.updated_at||null,
        lastChallengedAt:f.last_challenged_at||null
      }));

    return json({
      aal:sessionAal(s.access),
      hasVerifiedTotp:hasVerifiedTotp(s.user),
      factors:safeFactors
    },200,s.refreshed?sessionCookies(s.refreshed):[]);
  }

  if(request.method!=="POST")return json({error:"Method not allowed"},405);

  const body=await request.json().catch(()=>({}));
  const action=String(body.action||"");

  if(action==="enroll"){
    if(hasVerifiedTotp(s.user)){
      return json({error:"A verified authenticator is already enrolled."},409);
    }

    const {response,data}=await authJson("/factors",s.access,{
      method:"POST",
      body:JSON.stringify({
        factor_type:"totp",
        friendly_name:"Lockliel Authenticator"
      })
    });

    if(!response.ok){
      return json({error:data.msg||data.message||data.error_description||"Unable to start MFA enrollment."},response.status);
    }

    return json({
      ok:true,
      factor:{
        id:data.id,
        type:data.type,
        qrCode:data.totp?.qr_code||null,
        secret:data.totp?.secret||null,
        uri:data.totp?.uri||null
      }
    });
  }

  if(action==="verify"){
    const factorId=String(body.factorId||"");
    const code=String(body.code||"").replace(/\s+/g,"");
    if(!factorId||!/^[0-9]{6,8}$/.test(code)){
      return json({error:"Enter a valid authenticator code."},400);
    }

    const challenge=await authJson("/factors/"+encodeURIComponent(factorId)+"/challenge",s.access,{
      method:"POST",
      body:JSON.stringify({})
    });
    if(!challenge.response.ok){
      return json({error:challenge.data.msg||challenge.data.message||"Unable to create MFA challenge."},challenge.response.status);
    }

    const challengeId=challenge.data.id;
    if(!challengeId)return json({error:"MFA challenge was not created."},502);

    const verified=await authJson("/factors/"+encodeURIComponent(factorId)+"/verify",s.access,{
      method:"POST",
      body:JSON.stringify({challenge_id:challengeId,code})
    });

    if(!verified.response.ok||!verified.data.access_token||!verified.data.refresh_token){
      return json({error:verified.data.msg||verified.data.message||"Authenticator code was not accepted."},verified.response.status||400);
    }

    return json({
      ok:true,
      aal:sessionAal(verified.data.access_token)
    },200,sessionCookies(verified.data));
  }

  if(action==="unenroll"){
    const factorId=String(body.factorId||"");
    if(!factorId)return json({error:"MFA factor required."},400);

    const removed=await authJson("/factors/"+encodeURIComponent(factorId),s.access,{method:"DELETE"});
    if(!removed.response.ok){
      return json({error:removed.data.msg||removed.data.message||"Unable to remove MFA factor."},removed.response.status);
    }

    return json({ok:true});
  }

  return json({error:"Unknown MFA action."},400);
};

export const config={
  path:"/api/lockliel-auth/mfa",
  rateLimit:{windowLimit:30,windowSize:60,aggregateBy:["ip"]}
};