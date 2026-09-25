import {SUPABASE_URL,json,dbHeaders,requireSession,sessionCookies} from "../lib/lockliel-core.mjs";

export default async(request)=>{
  const s=await requireSession(request);
  if(!s.user||!s.access)return json({error:"Unauthorized"},401);

  const h=dbHeaders(s.access);
  const uid=encodeURIComponent(s.user.id);

  if(request.method==="GET"){
    const r=await fetch(
      SUPABASE_URL+"/rest/v1/faith_profiles?profile_id=eq."+uid+"&select=faith_stage,church_background,ministry_experience,growth_interests,wants_group,wants_host,preferred_connection,updated_at&limit=1",
      {headers:h}
    );
    if(!r.ok)return json({error:"Unable to load your faith profile."},r.status);
    const rows=await r.json();
    return json({profile:rows?.[0]||null},200,s.refreshed?sessionCookies(s.refreshed):[]);
  }

  if(request.method!=="POST")return json({error:"Method not allowed"},405);

  const b=await request.json().catch(()=>({}));
  const payload={
    profile_id:s.user.id,
    faith_stage:String(b.faithStage||"").trim()||null,
    church_background:String(b.churchBackground||"").trim()||null,
    ministry_experience:String(b.ministryExperience||"").trim()||null,
    growth_interests:Array.isArray(b.growthInterests)?b.growthInterests.map(String).slice(0,20):[],
    wants_group:Boolean(b.wantsGroup),
    wants_host:Boolean(b.wantsHost),
    preferred_connection:String(b.preferredConnection||"").trim()||null,
    notes:{},
    updated_at:new Date().toISOString()
  };

  const r=await fetch(
    SUPABASE_URL+"/rest/v1/faith_profiles?on_conflict=profile_id",
    {
      method:"POST",
      headers:{...h,Prefer:"resolution=merge-duplicates,return=representation"},
      body:JSON.stringify(payload)
    }
  );

  if(!r.ok)return json({error:"We couldn't save your faith profile."},500);

  return json({ok:true},200,s.refreshed?sessionCookies(s.refreshed):[]);
};

export const config={path:"/api/lockliel/faith-profile"};