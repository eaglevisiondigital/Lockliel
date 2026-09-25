import {SUPABASE_URL,json,dbHeaders,requireSession,sessionCookies} from "../lib/lockliel-core.mjs";

export default async(request)=>{
  if(request.method!=="GET")return json({error:"Method not allowed"},405);

  const s=await requireSession(request);
  if(!s.user||!s.access)return json({error:"Unauthorized"},401);

  const h=dbHeaders(s.access);
  const rr=await fetch(
    SUPABASE_URL+"/rest/v1/staff_roles?profile_id=eq."+encodeURIComponent(s.user.id)+"&select=role",
    {headers:h}
  );
  const roles=rr.ok?(await rr.json()).map(r=>r.role):[];
  if(!roles.some(r=>["super_admin","admin","founders50_reviewer"].includes(r))){
    return json({error:"Founders 50 review access required"},403);
  }

  const [appsRes,stepsRes,progressRes,cardsRes]=await Promise.all([
    fetch(
      SUPABASE_URL+"/rest/v1/founders50_applications?profile_id=not.is.null&status=in.(accepted,orientation,active_host)&select=id,profile_id,status,first_name,last_name,city,region,country,created_at,updated_at&order=updated_at.desc&limit=500",
      {headers:h}
    ),
    fetch(
      SUPABASE_URL+"/rest/v1/founder_orientation_steps?active=eq.true&required=eq.true&select=id,position,title&order=position.asc",
      {headers:h}
    ),
    fetch(
      SUPABASE_URL+"/rest/v1/founder_orientation_progress?select=profile_id,step_id,completed_at,updated_at&limit=10000",
      {headers:h}
    ),
    fetch(
      SUPABASE_URL+"/rest/v1/profile_connection_cards?select=profile_id,first_name,last_initial,city,region,country&limit=5000",
      {headers:h}
    )
  ]);

  const applications=appsRes.ok?await appsRes.json():[];
  const steps=stepsRes.ok?await stepsRes.json():[];
  const progress=progressRes.ok?await progressRes.json():[];
  const cards=cardsRes.ok?await cardsRes.json():[];
  const cardMap=Object.fromEntries(cards.map(c=>[c.profile_id,c]));

  const founders=applications.map(app=>{
    const rows=progress.filter(p=>p.profile_id===app.profile_id);
    const completed=steps.filter(step=>rows.find(r=>r.step_id===step.id&&r.completed_at)).length;
    return {
      ...app,
      person:cardMap[app.profile_id]||null,
      completed,
      total:steps.length,
      percent:steps.length?Math.round((completed/steps.length)*100):0,
      lastProgressAt:rows.map(r=>r.updated_at).filter(Boolean).sort().at(-1)||null
    };
  });

  return json({founders,steps},200,s.refreshed?sessionCookies(s.refreshed):[]);
};

export const config={path:"/api/lockliel/admin/founder-orientation"};