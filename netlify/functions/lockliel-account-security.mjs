import {
  SUPABASE_URL,
  SUPABASE_KEY,
  json,
  requireSession,
  sessionCookies,
  sessionAal,
  hasVerifiedTotp
} from "../lib/lockliel-core.mjs";

function validEmail(value){
  return /^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(value);
}

export default async(request)=>{
  if(request.method!=="POST")return json({error:"Method not allowed"},405);

  const s=await requireSession(request);
  if(!s.user||!s.access)return json({error:"Unauthorized"},401);

  if(hasVerifiedTotp(s.user)&&sessionAal(s.access)!=="aal2"){
    return json({
      error:"Complete your MFA challenge before changing sign-in credentials.",
      code:"mfa_required"
    },403,s.refreshed?sessionCookies(s.refreshed):[]);
  }

  const b=await request.json().catch(()=>({}));
  const action=String(b.action||"");

  if(action==="changeEmail"){
    const email=String(b.email||"").trim().toLowerCase();

    if(!email||email.length>254||!validEmail(email)){
      return json({error:"Enter a valid email address."},400);
    }

    if(email===String(s.user.email||"").trim().toLowerCase()){
      return json({error:"That is already your sign-in email."},400);
    }

    const r=await fetch(SUPABASE_URL+"/auth/v1/user",{
      method:"PUT",
      headers:{
        apikey:SUPABASE_KEY,
        Authorization:"Bearer "+s.access,
        "Content-Type":"application/json"
      },
      body:JSON.stringify({email})
    });

    if(!r.ok){
      const d=await r.json().catch(()=>({}));
      return json({
        error:d.msg||d.error_description||d.message||"Unable to request the email change."
      },r.status);
    }

    return json({
      ok:true,
      pendingEmail:email,
      message:"Email change requested. Follow the confirmation instructions sent by Lockliel before the new sign-in email becomes active."
    },200,s.refreshed?sessionCookies(s.refreshed):[]);
  }

  if(action==="changePassword"){
    const password=String(b.password||"");

    if(password.length<8||password.length>128){
      return json({error:"Use a password between 8 and 128 characters."},400);
    }

    const r=await fetch(SUPABASE_URL+"/auth/v1/user",{
      method:"PUT",
      headers:{
        apikey:SUPABASE_KEY,
        Authorization:"Bearer "+s.access,
        "Content-Type":"application/json"
      },
      body:JSON.stringify({password})
    });

    if(!r.ok){
      const d=await r.json().catch(()=>({}));
      return json({
        error:d.msg||d.error_description||d.message||"Unable to update your password."
      },r.status);
    }

    return json({
      ok:true,
      message:"Password updated."
    },200,s.refreshed?sessionCookies(s.refreshed):[]);
  }

  return json({error:"Unknown account-security action."},400);
};

export const config={
  path:"/api/lockliel-auth/account-security",
  rateLimit:{windowLimit:10,windowSize:600,aggregateBy:["ip"]}
};
