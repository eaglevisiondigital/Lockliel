import {
  SUPABASE_URL,
  SUPABASE_KEY,
  json,
  sessionCookies,
  validatedTokenPair
} from "../lib/lockliel-core.mjs";

export default async(request)=>{
 if(request.method!=="POST")return json({error:"Method not allowed"},405);

 const b=await request.json().catch(()=>({}));
 const access=String(b.accessToken||"");
 const refresh=String(b.refreshToken||"");
 const password=String(b.password||"");

 if(!access||!refresh||password.length<8||password.length>128){
  return json({error:"Use a valid recovery link and a password between 8 and 128 characters."},400);
 }

 const pair=await validatedTokenPair(access,refresh);
 if(!pair)return json({error:"This recovery link is invalid or expired."},401);

 const r=await fetch(SUPABASE_URL+"/auth/v1/user",{
  method:"PUT",
  headers:{
   apikey:SUPABASE_KEY,
   Authorization:"Bearer "+pair.session.access_token,
   "Content-Type":"application/json"
  },
  body:JSON.stringify({password})
 });

 if(!r.ok){
  const d=await r.json().catch(()=>({}));
  return json({error:d.msg||d.error_description||"Unable to update password."},r.status);
 }

 const finalPair=await validatedTokenPair(
  pair.session.access_token,
  pair.session.refresh_token
 );

 if(!finalPair){
  return json({
   ok:true,
   requiresSignIn:true,
   message:"Your password was updated. Sign in again with your new password."
  });
 }

 return json({
  ok:true,
  requiresSignIn:false
 },200,sessionCookies(finalPair.session));
};

export const config={
 path:"/api/lockliel-auth/reset-password",
 rateLimit:{windowLimit:10,windowSize:60,aggregateBy:["ip"]}
};
