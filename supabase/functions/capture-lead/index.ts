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

function cleanObject(input:any,maxKeys=20,maxLength=500){
  if(!input||typeof input!=="object"||Array.isArray(input))return {};
  const out:Record<string,any>={};
  for(const [rawKey,rawValue] of Object.entries(input).slice(0,maxKeys)){
    const key=String(rawKey).trim().slice(0,80);
    if(!key)continue;
    if(typeof rawValue==="boolean"||typeof rawValue==="number"||rawValue===null){
      out[key]=rawValue;
    }else{
      out[key]=String(rawValue??"").trim().slice(0,maxLength);
    }
  }
  return out;
}

Deno.serve(async(req:Request)=>{
  if(req.method!=="POST"){
    return new Response(JSON.stringify({error:"Method not allowed"}),{status:405,headers});
  }

  let b:any={};
  try{b=await req.json();}
  catch{return new Response(JSON.stringify({error:"Invalid submission"}),{status:400,headers});}

  const email=String(b.email||"").trim().toLowerCase();
  const firstName=String(b.firstName||"").trim().slice(0,120);
  const lastName=String(b.lastName||"").trim().slice(0,120)||null;
  const phone=String(b.phone||"").trim().slice(0,60)||null;
  const sourceType=String(b.sourceType||"").trim();
  const campaign=String(b.campaign||sourceType).trim().slice(0,120);
  const sourceRef=String(b.sourceRef||"").trim().slice(0,240)||null;
  const allowedSources=["faith_boost","book_interest","website_interest"];

  if(
    !email||
    !firstName||
    !allowedSources.includes(sourceType)||
    email.length>254||
    !/^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(email)
  ){
    return new Response(JSON.stringify({error:"Invalid lead"}),{status:400,headers});
  }

  const attribution=cleanObject(b.attribution,20,300);
  const consent=cleanObject(b.consent,20,1000);

  const url=Deno.env.get("SUPABASE_URL")!;
  const secretKeys=JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS")||"{}");
  const key=secretKeys.default||Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if(!key){
    return new Response(JSON.stringify({error:"Server configuration"}),{status:500,headers});
  }

  const ip=clientIp(req);
  const emailAllowed=await allowed(url,key,"capture_lead_email",email,30);
  const ipAllowed=ip==="unknown"?true:await allowed(url,key,"capture_lead_ip",ip,100);
  if(!emailAllowed||!ipAllowed){
    return new Response(JSON.stringify({error:"Too many submissions. Please try again later."}),{status:429,headers});
  }

  const atomic=await fetch(url+"/rest/v1/rpc/capture_public_lead_atomic",{
    method:"POST",
    headers:{apikey:key,"Content-Type":"application/json"},
    body:JSON.stringify({
      email_input:email,
      first_name_input:firstName,
      last_name_input:lastName,
      phone_input:phone,
      source_type_input:sourceType,
      source_ref_input:sourceRef,
      campaign_input:campaign,
      attribution_input:attribution,
      consent_input:consent
    })
  });

  if(!atomic.ok){
    return new Response(JSON.stringify({error:"Lead capture failed"}),{status:500,headers});
  }

  const rows=await atomic.json().catch(()=>[]);
  const result=(Array.isArray(rows)?rows[0]:rows)||null;
  const leadId=result?.captured_lead_id||null;
  if(!leadId){
    return new Response(JSON.stringify({error:"Lead capture failed"}),{status:500,headers});
  }

  return new Response(
    JSON.stringify({ok:true,leadId,duplicate:Boolean(result?.is_duplicate)}),
    {status:200,headers}
  );
});
