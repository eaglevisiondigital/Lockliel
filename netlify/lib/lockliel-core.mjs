export const SUPABASE_URL="https://bsndfhbemstyrrglajat.supabase.co";
export const SUPABASE_KEY="sb_publishable_NSyTQx-izQeHisrQm7G4FA_ROG7N_u8";
export const ACCESS_COOKIE="lockliel_access",REFRESH_COOKIE="lockliel_refresh";

export function json(data,status=200,cookies=[]){
 const headers=new Headers({"Content-Type":"application/json","Cache-Control":"no-store"});
 for(const c of cookies) headers.append("Set-Cookie",c);
 return new Response(JSON.stringify(data),{status,headers});
}
export function parseCookies(request){
 const raw=request.headers.get("cookie")||""; const out={};
 for(const item of raw.split(";")){const i=item.indexOf("=");if(i>0)out[item.slice(0,i).trim()]=decodeURIComponent(item.slice(i+1).trim());}
 return out;
}
export function cookie(name,value,maxAge){
 const secure=process.env.NODE_ENV==="production"||process.env.CONTEXT==="production"||process.env.CONTEXT==="deploy-preview";
 return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure?"; Secure":""}`;
}
export function clearCookie(name){return `${name}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;}
export function sessionCookies(session){return [cookie(ACCESS_COOKIE,session.access_token,session.expires_in||3600),cookie(REFRESH_COOKIE,session.refresh_token,60*60*24*30)];}
export function dbHeaders(access){return {apikey:SUPABASE_KEY,Authorization:"Bearer "+(access||SUPABASE_KEY),"Content-Type":"application/json"};}
export async function authUser(access){
 if(!access)return null;
 const r=await fetch(SUPABASE_URL+"/auth/v1/user",{headers:{apikey:SUPABASE_KEY,Authorization:"Bearer "+access}});
 return r.ok?r.json():null;
}
export async function refreshSession(refresh){
 if(!refresh)return null;
 const r=await fetch(SUPABASE_URL+"/auth/v1/token?grant_type=refresh_token",{method:"POST",headers:{apikey:SUPABASE_KEY,"Content-Type":"application/json"},body:JSON.stringify({refresh_token:refresh})});
 return r.ok?r.json():null;
}
export async function activeSession(access){
 if(!access)return false;
 const r=await fetch(SUPABASE_URL+"/rest/v1/rpc/lockliel_current_session_active",{
  method:"POST",
  headers:dbHeaders(access),
  body:"{}"
 }).catch(()=>null);
 if(!r?.ok)return false;
 const value=await r.json().catch(()=>false);
 return value===true;
}
export async function requireSession(request){
 const c=parseCookies(request); let access=c[ACCESS_COOKIE]||""; let user=await authUser(access); let refreshed=null;
 if(user&&!(await activeSession(access))){user=null;access="";}
 if(!user&&c[REFRESH_COOKIE]){
  refreshed=await refreshSession(c[REFRESH_COOKIE]);
  if(refreshed?.access_token){
   access=refreshed.access_token;
   user=await authUser(access);
   if(user&&!(await activeSession(access))){user=null;access="";refreshed=null;}
  }
 }
 return {user,access,refreshed,cookies:c};
}


export function jwtClaims(access){
  if(!access||typeof access!=="string")return {};
  try{
    const payload=access.split(".")[1];
    if(!payload)return {};
    const normalized=payload.replace(/-/g,"+").replace(/_/g,"/");
    const padded=normalized+"=".repeat((4-normalized.length%4)%4);
    return JSON.parse(Buffer.from(padded,"base64").toString("utf8"));
  }catch{
    return {};
  }
}

export function sessionAal(access){
  const claims=jwtClaims(access);
  return typeof claims.aal==="string"?claims.aal:"aal1";
}

export function hasVerifiedTotp(user){
  return Array.isArray(user?.factors)&&user.factors.some(
    factor=>factor?.factor_type==="totp"&&factor?.status==="verified"
  );
}
