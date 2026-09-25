const headers={"content-type":"application/json","cache-control":"no-store"};

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
    JSON.stringify({destination:link.destination_path||"/my-lockliel/sign-up"}),
    {status:200,headers}
  );
});
