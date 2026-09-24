import {SUPABASE_URL,SUPABASE_KEY,json,sessionCookies} from "../lib/lockliel-core.mjs";
export default async(request)=>{
 if(request.method!=="POST")return json({error:"Method not allowed"},405);
 const b=await request.json().catch(()=>({}));const email=String(b.email||"").trim().toLowerCase(),password=String(b.password||"");
 if(!email||!password)return json({error:"Email and password are required."},400);
 const r=await fetch(SUPABASE_URL+"/auth/v1/token?grant_type=password",{method:"POST",headers:{apikey:SUPABASE_KEY,"Content-Type":"application/json"},body:JSON.stringify({email,password})});
 const d=await r.json().catch(()=>({}));if(!r.ok||!d.access_token)return json({error:d.msg||d.error_description||"We couldn't sign you in with those details."},401);
 return json({ok:true},200,sessionCookies(d));
};
export const config={path:"/api/lockliel-auth/login",rateLimit:{windowLimit:30,windowSize:60,aggregateBy:["ip"]}};