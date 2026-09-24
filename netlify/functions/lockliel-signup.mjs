import {SUPABASE_URL,SUPABASE_KEY,json,parseCookies,sessionCookies} from "../lib/lockliel-core.mjs";

export default async(request)=>{
  if(request.method!=="POST")return json({error:"Method not allowed"},405);

  const b=await request.json().catch(()=>({}));
  const c=parseCookies(request);
  const firstName=String(b.firstName||"").trim();
  const lastName=String(b.lastName||"").trim();
  const email=String(b.email||"").trim().toLowerCase();
  const password=String(b.password||"");
  const referralCode=String(b.referralCode||c.lockliel_ref||"").trim();

  if(!firstName||!lastName||!email||password.length<8){
    return json({error:"Please enter your name, a valid email, and a password of at least 8 characters."},400);
  }

  const redirectTo=new URL("/my-lockliel/sign-in?confirmed=1",request.url).toString();
  const r=await fetch(
    SUPABASE_URL+"/auth/v1/signup?redirect_to="+encodeURIComponent(redirectTo),
    {
      method:"POST",
      headers:{apikey:SUPABASE_KEY,"Content-Type":"application/json"},
      body:JSON.stringify({
        email,
        password,
        data:{
          first_name:firstName,
          last_name:lastName,
          referral_code:referralCode||null,
          source:"my-lockliel"
        }
      })
    }
  );

  const d=await r.json().catch(()=>({}));
  if(!r.ok)return json({error:d.msg||d.error_description||"We couldn't create your account."},r.status);

  return json(
    {ok:true,needsConfirmation:!d.access_token},
    200,
    d.access_token?sessionCookies(d):[]
  );
};

export const config={
  path:"/api/lockliel-auth/signup",
  rateLimit:{windowLimit:15,windowSize:60,aggregateBy:["ip"]}
};