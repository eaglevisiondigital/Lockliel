import {SUPABASE_URL,json,dbHeaders,requireSession,sessionCookies} from "../lib/lockliel-core.mjs";

export default async(request)=>{
  if(request.method!=="PATCH")return json({error:"Method not allowed"},405);

  const s=await requireSession(request);
  if(!s.user||!s.access)return json({error:"Unauthorized"},401);

  const b=await request.json().catch(()=>({}));
  const patch={
    first_name:String(b.firstName||"").trim(),
    last_name:String(b.lastName||"").trim(),
    phone:String(b.phone||"").trim()||null,
    city:String(b.city||"").trim(),
    region:String(b.region||"").trim(),
    country:String(b.country||"United States").trim(),
    locale:String(b.locale||"en-US").trim().slice(0,35)||"en-US",
    timezone:String(b.timezone||"").trim().slice(0,100)||null,
    onboarding_status:"active",
    updated_at:new Date().toISOString()
  };

  if(!patch.first_name||!patch.last_name||!patch.city||!patch.region||!patch.country){
    return json({error:"Please complete your name, city, state/region, and country."},400);
  }

  const h={...dbHeaders(s.access),Prefer:"return=representation"};
  const id=encodeURIComponent(s.user.id);
  const p=await fetch(
    SUPABASE_URL+"/rest/v1/profiles?id=eq."+id,
    {method:"PATCH",headers:h,body:JSON.stringify(patch)}
  );
  if(!p.ok)return json({error:"We couldn't save your profile."},500);

  return json({ok:true},200,s.refreshed?sessionCookies(s.refreshed):[]);
};

export const config={path:"/api/lockliel/profile"};