import {SUPABASE_URL,cookie,parseCookies} from "../lib/lockliel-core.mjs";

const visitorPattern=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async(request)=>{
  const u=new URL(request.url);
  const code=String(u.searchParams.get("code")||"").trim().toLowerCase();
  const cookies=parseCookies(request);

  if(!/^[a-z0-9]{6,20}$/.test(code)){
    return new Response(null,{status:302,headers:{Location:"/my-lockliel/sign-up"}});
  }

  const existingVisitor=String(cookies.lockliel_visitor||"").trim();
  const visitor=visitorPattern.test(existingVisitor)?existingVisitor:crypto.randomUUID();
  let destination="/my-lockliel/sign-up";

  try{
    const r=await fetch(SUPABASE_URL+"/functions/v1/track-referral",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({code,visitor_key:visitor})
    });
    if(r.ok){
      const d=await r.json();
      if(d.destination)destination=d.destination;
    }
  }catch{}

  const dest=new URL(destination,u.origin);
  dest.searchParams.set("ref",code);

  const h=new Headers({Location:dest.toString(),"Cache-Control":"no-store"});
  h.append("Set-Cookie",cookie("lockliel_visitor",visitor,60*60*24*90));
  h.append("Set-Cookie",cookie("lockliel_ref",code,60*60*24*30));
  return new Response(null,{status:302,headers:h});
};

export const config={
  rateLimit:{windowLimit:240,windowSize:60,aggregateBy:["ip"]}
};
