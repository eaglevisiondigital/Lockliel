import {SUPABASE_URL,json,dbHeaders,requireSession,sessionCookies,sessionAal} from "../lib/lockliel-core.mjs";
export default async(request)=>{
 const s=await requireSession(request);if(!s.user||!s.access)return json({error:"Unauthorized"},401);
  if(sessionAal(s.access)!=="aal2")return json({error:"Multi-factor authentication required.",code:"mfa_required"},403);
 const h=dbHeaders(s.access),uid=encodeURIComponent(s.user.id);
 const rr=await fetch(SUPABASE_URL+"/rest/v1/staff_roles?profile_id=eq."+uid+"&select=role",{headers:h}),roles=rr.ok?(await rr.json()).map(r=>r.role):[];
 if(!roles.some(r=>["super_admin","admin"].includes(r)))return json({error:"System administration access required"},403);
 if(request.method==="POST"){
   const b=await request.json().catch(()=>({})),key=String(b.key||""),enabled=Boolean(b.enabled);
   const allowed=["partner_checkout","digital_book_delivery","heart_book_gift_benefit","founders50_public_recruiting","internal_messaging"];
   if(!allowed.includes(key))return json({error:"Unknown feature flag"},400);
   const r=await fetch(SUPABASE_URL+"/rest/v1/feature_flags?key=eq."+encodeURIComponent(key),{method:"PATCH",headers:{...h,Prefer:"return=representation"},body:JSON.stringify({enabled})});
   if(!r.ok)return json({error:"Unable to update feature flag."},r.status);
   return json({ok:true,flag:(await r.json())?.[0]||null},200,s.refreshed?sessionCookies(s.refreshed):[]);
 }
 if(request.method!=="GET")return json({error:"Method not allowed"},405);
 const [flagsRes,auditRes,providersRes]=await Promise.all([
   fetch(SUPABASE_URL+"/rest/v1/feature_flags?select=key,enabled,description,updated_at&order=key.asc",{headers:h}),
   fetch(SUPABASE_URL+"/rest/v1/audit_events?select=id,actor_profile_id,event_type,entity_type,entity_id,summary,metadata,created_at&order=created_at.desc&limit=40",{headers:h}),
   fetch(SUPABASE_URL+"/rest/v1/payment_provider_connections?select=provider,label,status,supports_one_time,supports_recurring,checkout_mode&order=label.asc",{headers:h})
 ]);
 return json({roles,flags:flagsRes.ok?await flagsRes.json():[],audit:auditRes.ok?await auditRes.json():[],providers:providersRes.ok?await providersRes.json():[]},200,s.refreshed?sessionCookies(s.refreshed):[]);
};
export const config={path:"/api/lockliel/admin/system"};