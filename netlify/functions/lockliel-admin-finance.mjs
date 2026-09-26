import {SUPABASE_URL,json,dbHeaders,requireSession,sessionCookies,sessionAal} from "../lib/lockliel-core.mjs";
function cents(value){const n=Number(value);return Number.isFinite(n)?Math.round(n*100):0;}
export default async(request)=>{
 const s=await requireSession(request);if(!s.user||!s.access)return json({error:"Unauthorized"},401);
  if(sessionAal(s.access)!=="aal2")return json({error:"Multi-factor authentication required.",code:"mfa_required"},403);
 const h=dbHeaders(s.access),uid=encodeURIComponent(s.user.id);
 const rr=await fetch(SUPABASE_URL+"/rest/v1/staff_roles?profile_id=eq."+uid+"&select=role",{headers:h}),roles=rr.ok?(await rr.json()).map(r=>r.role):[];
 if(!roles.some(r=>["super_admin","admin","finance_admin","content_admin"].includes(r)))return json({error:"Finance or resource access required"},403);

 if(request.method==="POST"){
   const b=await request.json().catch(()=>({}));
   if(b.action==="recordGift"){
     if(!roles.some(r=>["super_admin","admin","finance_admin"].includes(r)))return json({error:"Finance access required"},403);
     const amount=cents(b.amount),profileId=String(b.profileId||"").trim()||null,donorEmail=String(b.donorEmail||"").trim().toLowerCase()||null,donorName=String(b.donorName||"").trim()||null;
     if(amount<=0)return json({error:"Enter a valid gift amount."},400);
     const tx="manual-"+crypto.randomUUID();
     const payload={profile_id:profileId,provider:"manual",provider_transaction_ref:tx,amount_cents:amount,currency:"USD",status:"succeeded",designation:String(b.designation||"general"),campaign:String(b.campaign||"manual-entry")||null,donor_email:donorEmail,donor_name:donorName,received_at:new Date().toISOString()};
     const r=await fetch(SUPABASE_URL+"/rest/v1/gifts",{method:"POST",headers:{...h,Prefer:"return=representation"},body:JSON.stringify(payload)});
     if(!r.ok)return json({error:"Unable to record gift."},r.status);
     return json({ok:true,gift:(await r.json())?.[0]||null},200,s.refreshed?sessionCookies(s.refreshed):[]);
   }
   if(b.action==="grantResource"){
     if(!roles.some(r=>["super_admin","admin","finance_admin","content_admin"].includes(r)))return json({error:"Resource access required"},403);
     const profileId=String(b.profileId||""),productId=String(b.productId||"");
     if(!profileId||!productId)return json({error:"Choose a member and resource."},400);
     const r=await fetch(SUPABASE_URL+"/rest/v1/entitlements",{method:"POST",headers:{...h,Prefer:"return=representation"},body:JSON.stringify({profile_id:profileId,product_id:productId,reason:"manual-grant",source_ref:"admin:"+s.user.id})});
     if(!r.ok)return json({error:"Unable to grant resource."},r.status===409?409:500);
     return json({ok:true},200,s.refreshed?sessionCookies(s.refreshed):[]);
   }
   if(b.action==="setBenefitStatus"){
     if(!roles.some(r=>["super_admin","admin","finance_admin"].includes(r)))return json({error:"Finance access required"},403);
     const ruleId=String(b.ruleId||""),status=String(b.status||"");
     if(!ruleId||!["draft","active","paused","ended"].includes(status))return json({error:"Invalid benefit status."},400);
     const r=await fetch(SUPABASE_URL+"/rest/v1/benefit_rules?id=eq."+encodeURIComponent(ruleId),{method:"PATCH",headers:{...h,Prefer:"return=representation"},body:JSON.stringify({status})});
     if(!r.ok)return json({error:"Unable to update benefit rule."},r.status);
     return json({ok:true},200,s.refreshed?sessionCookies(s.refreshed):[]);
   }
   return json({error:"Unknown action"},400);
 }
 if(request.method!=="GET")return json({error:"Method not allowed"},405);

 const [peopleRes,productsRes,giftsRes,benefitsRes,providersRes]=await Promise.all([
  fetch(SUPABASE_URL+"/rest/v1/profile_finance_cards?select=profile_id,display_name,email,city,region,country&order=display_name.asc&limit=1000",{headers:h}),
  fetch(SUPABASE_URL+"/rest/v1/products?select=id,slug,title,product_type,status,price_cents,currency,storage_path&order=title.asc",{headers:h}),
  fetch(SUPABASE_URL+"/rest/v1/gifts?select=id,profile_id,donor_name,donor_email,provider,amount_cents,currency,status,designation,received_at,created_at&order=created_at.desc&limit=30",{headers:h}),
  fetch(SUPABASE_URL+"/rest/v1/benefit_rules?select=id,slug,title,status,minimum_gift_cents,product_id,fulfillment_type,starts_at,ends_at&order=created_at.asc",{headers:h}),
  fetch(SUPABASE_URL+"/rest/v1/payment_provider_connections?select=provider,label,status,supports_one_time,supports_recurring,checkout_mode&order=label.asc",{headers:h})
 ]);
 return json({
  roles,
  people:peopleRes.ok?await peopleRes.json():[],
  products:productsRes.ok?await productsRes.json():[],
  gifts:giftsRes.ok?await giftsRes.json():[],
  benefits:benefitsRes.ok?await benefitsRes.json():[],
  providers:providersRes.ok?await providersRes.json():[]
 },200,s.refreshed?sessionCookies(s.refreshed):[]);
};
export const config={path:"/api/lockliel/admin/finance"};