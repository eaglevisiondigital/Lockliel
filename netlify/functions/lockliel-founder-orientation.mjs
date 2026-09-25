import {SUPABASE_URL,json,dbHeaders,requireSession,sessionCookies} from "../lib/lockliel-core.mjs";

export default async(request)=>{
  const s=await requireSession(request);
  if(!s.user||!s.access)return json({error:"Unauthorized"},401);

  const h=dbHeaders(s.access);
  const uid=encodeURIComponent(s.user.id);

  const appRes=await fetch(
    SUPABASE_URL+"/rest/v1/founders50_applications?profile_id=eq."+uid+"&select=id,status,created_at,updated_at&order=created_at.desc&limit=1",
    {headers:h}
  );
  const apps=appRes.ok?await appRes.json():[];
  const application=apps?.[0]||null;

  if(!application||!["accepted","orientation","active_host"].includes(application.status)){
    return json({error:"Founders 50 orientation is not available for this account."},403);
  }

  if(request.method==="POST"){
    const b=await request.json().catch(()=>({}));
    const stepId=String(b.stepId||"");
    const completed=Boolean(b.completed);
    if(!stepId)return json({error:"Orientation step required."},400);

    const r=await fetch(
      SUPABASE_URL+"/rest/v1/founder_orientation_progress?on_conflict=profile_id,step_id",
      {
        method:"POST",
        headers:{...h,Prefer:"resolution=merge-duplicates,return=representation"},
        body:JSON.stringify({
          profile_id:s.user.id,
          step_id:stepId,
          completed_at:completed?new Date().toISOString():null
        })
      }
    );
    if(!r.ok)return json({error:"Unable to save orientation progress."},r.status);

    return json({ok:true},200,s.refreshed?sessionCookies(s.refreshed):[]);
  }

  if(request.method!=="GET")return json({error:"Method not allowed"},405);

  const [stepsRes,progressRes]=await Promise.all([
    fetch(
      SUPABASE_URL+"/rest/v1/founder_orientation_steps?active=eq.true&select=id,slug,position,title,description,href,required&order=position.asc",
      {headers:h}
    ),
    fetch(
      SUPABASE_URL+"/rest/v1/founder_orientation_progress?profile_id=eq."+uid+"&select=step_id,completed_at,notes,updated_at",
      {headers:h}
    )
  ]);

  const steps=stepsRes.ok?await stepsRes.json():[];
  const progress=progressRes.ok?await progressRes.json():[];
  const progressMap=Object.fromEntries(progress.map(p=>[p.step_id,p]));
  const complete=steps.filter(step=>progressMap[step.id]?.completed_at).length;

  return json({
    application,
    steps:steps.map(step=>({...step,progress:progressMap[step.id]||null})),
    completed:complete,
    total:steps.length,
    percent:steps.length?Math.round((complete/steps.length)*100):0
  },200,s.refreshed?sessionCookies(s.refreshed):[]);
};

export const config={path:"/api/lockliel/founder-orientation"};