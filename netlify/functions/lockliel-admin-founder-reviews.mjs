import {SUPABASE_URL,json,dbHeaders,requireSession,sessionCookies,sessionAal} from "../lib/lockliel-core.mjs";

export default async(request)=>{
  const s=await requireSession(request);
  if(!s.user||!s.access)return json({error:"Unauthorized"},401);
  if(sessionAal(s.access)!=="aal2")return json({error:"Multi-factor authentication required.",code:"mfa_required"},403);

  const h=dbHeaders(s.access);
  const rolesRes=await fetch(
    SUPABASE_URL+"/rest/v1/staff_roles?profile_id=eq."+encodeURIComponent(s.user.id)+"&select=role",
    {headers:h}
  );
  const roles=rolesRes.ok?(await rolesRes.json()).map(r=>r.role):[];
  if(!roles.some(r=>["super_admin","admin","founders50_reviewer"].includes(r))){
    return json({error:"Founders 50 review access required"},403);
  }

  if(request.method==="POST"){
    const b=await request.json().catch(()=>({}));
    const applicationId=String(b.applicationId||"");
    const decision=String(b.decision||"note");
    const rationale=String(b.rationale||"").trim().slice(0,5000)||null;
    const allowed=["note","needs_info","accept","decline","pause","activate_host"];

    if(!applicationId||!allowed.includes(decision)){
      return json({error:"Choose a valid application and review action."},400);
    }

    if(decision!=="note"&&(!rationale||rationale.length<20)){
      return json({error:"Record a review rationale of at least 20 characters for this decision."},400);
    }

    const r=await fetch(SUPABASE_URL+"/rest/v1/founders50_reviews",{
      method:"POST",
      headers:{...h,Prefer:"return=representation"},
      body:JSON.stringify({
        application_id:applicationId,
        reviewer_id:s.user.id,
        decision,
        rationale
      })
    });

    if(!r.ok)return json({error:"Unable to save Founders 50 review."},r.status);

    return json({ok:true,review:(await r.json())?.[0]||null},200,s.refreshed?sessionCookies(s.refreshed):[]);
  }

  if(request.method!=="GET")return json({error:"Method not allowed"},405);

  const [appsRes,reviewsRes,cardsRes]=await Promise.all([
    fetch(
      SUPABASE_URL+"/rest/v1/founders50_applications?select=id,profile_id,first_name,last_name,email,phone,city,region,country,church_affiliation,gathering_place,invite_count,why_interested,what_excites_you,share_with_five,gather_weekly,training_willingness,status,faith_stage,faith_background,ministry_experience,interest_path,growth_interests,created_at,updated_at&order=created_at.desc&limit=500",
      {headers:h}
    ),
    fetch(
      SUPABASE_URL+"/rest/v1/founders50_reviews?select=id,application_id,reviewer_id,decision,rationale,created_at&order=created_at.desc&limit=2000",
      {headers:h}
    ),
    fetch(
      SUPABASE_URL+"/rest/v1/profile_connection_cards?select=profile_id,first_name,last_initial,city,region,country&limit=5000",
      {headers:h}
    )
  ]);

  const applications=appsRes.ok?await appsRes.json():[];
  const reviews=reviewsRes.ok?await reviewsRes.json():[];
  const cards=cardsRes.ok?await cardsRes.json():[];
  const cardMap=Object.fromEntries(cards.map(c=>[c.profile_id,c]));

  return json({
    applications:applications.map(app=>({
      ...app,
      reviews:reviews
        .filter(review=>review.application_id===app.id)
        .map(review=>({...review,reviewer:cardMap[review.reviewer_id]||null}))
    }))
  },200,s.refreshed?sessionCookies(s.refreshed):[]);
};

export const config={path:"/api/lockliel/admin/founder-reviews"};