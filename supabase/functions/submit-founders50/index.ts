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

async function allowed(url:string,key:string,scope:string,subject:string,maxHits:number){
  const keyHash=await sha256(scope+"|"+subject);
  const r=await fetch(url+"/rest/v1/rpc/consume_public_rate_limit",{
    method:"POST",
    headers:{apikey:key,"Content-Type":"application/json"},
    body:JSON.stringify({
      scope_input:scope,
      key_hash_input:keyHash,
      window_seconds:3600,
      max_hits:maxHits
    })
  });
  if(!r.ok)return false;
  return Boolean(await r.json().catch(()=>false));
}

Deno.serve(async(req:Request)=>{
  if(req.method!=="POST"){
    return new Response(JSON.stringify({error:"Method not allowed"}),{status:405,headers});
  }

  let b:any={};
  try{b=await req.json();}
  catch{return new Response(JSON.stringify({error:"Invalid submission"}),{status:400,headers});}

  const first=String(b["first-name"]||"").trim().slice(0,120);
  const last=String(b["last-name"]||"").trim().slice(0,120);
  const email=String(b.email||"").trim().toLowerCase();
  const faithStage=String(b["faith-stage"]||"").trim();
  const interestPath=String(b["interest-path"]||"").trim();
  const whyInterested=String(b["why-interested"]||"").trim().slice(0,5000);
  const whatExcites=String(b["what-excites-you"]||"").trim().slice(0,5000);

  const allowedFaithStages=[
    "exploring","new-believer","growing","established",
    "serving-leading","prefer-not-to-answer"
  ];
  const allowedInterestPaths=["host","join-group","either","explore"];
  const allowedGrowthInterests=[
    "biblical-foundations","identity-in-christ","prayer","faith-development",
    "evangelism","discipleship","leadership","healing-wholeness",
    "family-relationships"
  ];

  const rawGrowth=Array.isArray(b["growth-interests"])
    ? b["growth-interests"]
    : b["growth-interests"]?[b["growth-interests"]]:[];
  const growthInterests=[...new Set(
    rawGrowth
      .map((value:any)=>String(value))
      .filter((value:string)=>allowedGrowthInterests.includes(value))
  )].slice(0,20);

  if(
    !first||
    !last||
    !email||
    email.length>254||
    !/^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(email)||
    !allowedFaithStages.includes(faithStage)||
    !allowedInterestPaths.includes(interestPath)||
    !whyInterested||
    !whatExcites
  ){
    return new Response(JSON.stringify({error:"Please complete the required fields."}),{status:400,headers});
  }

  const url=Deno.env.get("SUPABASE_URL")!;
  const secretKeys=JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS")||"{}");
  const key=secretKeys.default||Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if(!key){
    return new Response(JSON.stringify({error:"Server configuration"}),{status:500,headers});
  }

  const ip=clientIp(req);
  const emailAllowed=await allowed(url,key,"founders50_email",email,5);
  const ipAllowed=ip==="unknown"?true:await allowed(url,key,"founders50_ip",ip,20);
  if(!emailAllowed||!ipAllowed){
    return new Response(JSON.stringify({error:"Too many application attempts. Please try again later."}),{status:429,headers});
  }

  const h={apikey:key,"Content-Type":"application/json"};

  const flagRes=await fetch(
    url+"/rest/v1/feature_flags?key=eq.founders50_public_recruiting&select=enabled&limit=1",
    {headers:h}
  );
  const flags=flagRes.ok?await flagRes.json():[];
  if(!flagRes.ok||flags?.[0]?.enabled!==true){
    return new Response(
      JSON.stringify({error:"Founders 50 applications are temporarily closed."}),
      {status:403,headers}
    );
  }

  const payload={
    first_name:first,
    last_name:last,
    email,
    phone:String(b["mobile-phone"]||"").trim().slice(0,60)||null,
    city:String(b.city||"").trim().slice(0,160)||null,
    region:String(b.state||"").trim().slice(0,160)||null,
    country:String(b.country||"").trim().slice(0,160)||null,
    church_affiliation:String(b["church-affiliation"]||"").trim().slice(0,500)||null,
    faith_stage:faithStage,
    faith_background:String(b["faith-background"]||"").trim().slice(0,3000)||null,
    ministry_experience:String(b["ministry-experience"]||"").trim().slice(0,3000)||null,
    interest_path:interestPath,
    growth_interests:growthInterests,
    gathering_place:String(b["gathering-place"]||"").trim().slice(0,1000)||null,
    invite_count:String(b["invite-count"]||"").trim().slice(0,100)||null,
    why_interested:whyInterested,
    what_excites_you:whatExcites,
    share_with_five:String(b["share-with-five"]||"").trim().slice(0,500)||null,
    gather_weekly:String(b["gather-weekly"]||"").trim().slice(0,500)||null,
    training_willingness:String(b["training-willingness"]||"").toLowerCase()==="yes"
  };

  const atomic=await fetch(
    url+"/rest/v1/rpc/submit_public_founders50_application_atomic",
    {
      method:"POST",
      headers:h,
      body:JSON.stringify({application_input:payload})
    }
  );

  if(!atomic.ok){
    const detail=await atomic.text().catch(()=>"");
    if(detail.includes("Founders 50 applications are closed")){
      return new Response(
        JSON.stringify({error:"Founders 50 applications are temporarily closed."}),
        {status:403,headers}
      );
    }
    return new Response(
      JSON.stringify({error:"We couldn't save your application."}),
      {status:500,headers}
    );
  }

  const rows=await atomic.json().catch(()=>[]);
  const result=(Array.isArray(rows)?rows[0]:rows)||null;
  const appId=result?.submitted_application_id||null;
  if(!appId){
    return new Response(
      JSON.stringify({error:"We couldn't save your application."}),
      {status:500,headers}
    );
  }

  return new Response(
    JSON.stringify({ok:true,id:appId,duplicate:Boolean(result?.is_duplicate)}),
    {status:200,headers}
  );
});
