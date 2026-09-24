import {SUPABASE_URL,SUPABASE_KEY,json} from "../lib/lockliel-core.mjs";
export default async(request)=>{
 if(request.method!=="POST")return json({error:"Method not allowed"},405);
 const b=await request.json().catch(()=>({})),email=String(b.email||"").trim().toLowerCase();
 if(!email)return json({error:"Enter your email address."},400);
 const redirectTo=new URL("/my-lockliel/reset-password",request.url).toString();
 const r=await fetch(SUPABASE_URL+"/auth/v1/recover?redirect_to="+encodeURIComponent(redirectTo),{
  method:"POST",headers:{apikey:SUPABASE_KEY,"Content-Type":"application/json"},body:JSON.stringify({email})
 });
 if(!r.ok){const d=await r.json().catch(()=>({}));return json({error:d.msg||d.error_description||"Unable to send reset email."},r.status);}
 return json({ok:true,message:"If an account exists for that email, a password reset link has been sent."});
};
export const config={path:"/api/lockliel-auth/recover",rateLimit:{windowLimit:8,windowSize:60,aggregateBy:["ip"]}};