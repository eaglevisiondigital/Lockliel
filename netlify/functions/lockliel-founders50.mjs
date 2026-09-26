import {SUPABASE_URL,LOCKLIEL_APP_ORIGIN,json} from "../lib/lockliel-core.mjs";

export default async(request)=>{
  if(request.method!=="POST")return json({error:"Method not allowed"},405);

  const origin=request.headers.get("origin");
  if(origin&&origin!==LOCKLIEL_APP_ORIGIN){
    return json({error:"Please apply through the Lockliel website."},403);
  }

  const body=await request.json().catch(()=>null);
  if(!body)return json({error:"Invalid submission"},400);

  if(String(body["bot-field"]||"").trim()){
    return json({ok:true},200);
  }

  const r=await fetch(SUPABASE_URL+"/functions/v1/submit-founders50",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(body)
  });
  const d=await r.json().catch(()=>({error:"Submission failed"}));
  return json(d,r.status);
};

export const config={
  path:"/api/lockliel/founders50",
  rateLimit:{windowLimit:12,windowSize:60,aggregateBy:["ip"]}
};
