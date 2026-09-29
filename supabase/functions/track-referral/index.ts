// @ts-nocheck
const headers={"content-type":"application/json","cache-control":"no-store"};

function clientIp(req:Request){
  const raw=req.headers.get("cf-connecting-ip")
    ||req.headers.get("x-forwarded-for")
    ||req.headers.get("x-real-ip")
    ||"unknown";
  return String(raw).split(",")[0].trim().slice(0,100)||"unknown";
}

async function sha256(value:string){
  const digest=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest)).map(v=>v.toString(16).padStart(2,"0")).join("");
}

async function rateAllowed(url:string,key:string,subject:string){
  const keyHash=await sha256("referral_visit_ip|"+subject);
  const r=await fetch(url+"/rest/v1/rpc/consume_public_rate_limit",{
    method:"POST",
    headers:{apikey:key,"Content-Type":"application/json"},
    body:JSON.stringify({
      scope_input:"referral_visit_ip",
      key_hash_input:keyHash,
      window_seconds:3600,
      max_hits:600
    })
  });
  if(!r.ok)return false;
  return Boolean(await r.json().catch(()=>false));
}

function safeDestination(value:any){
  const raw=String(value||"").trim();
  if(!raw.startsWith("/")||raw.startsWith("//"))return "/my-lockliel/sign-up";
  try{
    const parsed=new URL(raw,"https://lockliel.com");
    if(parsed.origin!=="https://lockliel.com")return "/my-lockliel/sign-up";
    return parsed.pathname+parsed.search+parsed.hash;
  }catch{
    return "/my-lockliel/sign-up";
  }
}

Deno.serve(async(req:Request)=>{
  if(req.method!=="POST"){
    return new Response(JSON.stringify({error:"Method not allowed"}),{status:405,headers});
  }

  let body:any={};
  try{body=await req.json();}catch{}

  const code=String(body.code||"").trim().toLowerCase();
  const visitorKey=String(body.visitor_key||"").trim().toLowerCase();

  if(!/^[a-z0-9]{6,20}$/.test(code)){
    return new Response(JSON.stringify({error:"Invalid referral"}),{status:400,headers});
  }

  if(!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(visitorKey)){
    return new Response(JSON.stringify({error:"Invalid visitor"}),{status:400,headers});
  }

  const url=Deno.env.get("SUPABASE_URL")!;
  const secretKeys=JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS")||"{}");
  const key=secretKeys.default||Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if(!key){
    return new Response(JSON.stringify({error:"Server configuration"}),{status:500,headers});
  }

  const serverHeaders={apikey:key};
  const ip=clientIp(req);

  if(ip!=="unknown"&&!await rateAllowed(url,key,ip)){
    return new Response(
      JSON.stringify({error:"Too many referral requests. Please try again later."}),
      {status:429,headers}
    );
  }

  const linkRes=await fetch(
    url+"/rest/v1/referral_links?code=eq."+encodeURIComponent(code)+
    "&active=eq.true&select=id,destination_path&limit=1",
    {headers:serverHeaders}
  );

  const links=await linkRes.json().catch(()=>[]);
  const link=Array.isArray(links)?links[0]:null;

  if(!link){
    return new Response(JSON.stringify({error:"Referral not found"}),{status:404,headers});
  }

  await fetch(url+"/rest/v1/referral_events",{
    method:"POST",
    headers:{
      ...serverHeaders,
      "Content-Type":"application/json",
      "Prefer":"return=minimal"
    },
    body:JSON.stringify({
      referral_link_id:link.id,
      event_type:"visit",
      visitor_key:visitorKey,
      metadata:{source:"lockliel_redirect"}
    })
  }).catch(()=>null);

  return new Response(
    JSON.stringify({destination:safeDestination(link.destination_path)}),
    {status:200,headers}
  );
});
