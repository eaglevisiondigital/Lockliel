import {SUPABASE_URL,json,dbHeaders,requireSession,sessionCookies} from "../lib/lockliel-core.mjs";
export default async(request)=>{
 if(request.method!=="GET")return json({error:"Method not allowed"},405);
 const s=await requireSession(request);if(!s.user||!s.access)return json({error:"Unauthorized"},401);
 const h=dbHeaders(s.access),uid=encodeURIComponent(s.user.id);
 const [pr,cr,gr,br]=await Promise.all([
  fetch(SUPABASE_URL+"/rest/v1/payment_provider_connections?select=provider,label,status,supports_one_time,supports_recurring,checkout_mode&order=label.asc",{headers:h}),
  fetch(SUPABASE_URL+"/rest/v1/partner_commitments?profile_id=eq."+uid+"&select=id,provider,cadence,amount_cents,currency,status,designation,started_at,cancelled_at,created_at&order=created_at.desc",{headers:h}),
  fetch(SUPABASE_URL+"/rest/v1/gifts?profile_id=eq."+uid+"&select=id,provider,amount_cents,currency,status,designation,received_at,created_at&order=created_at.desc&limit=50",{headers:h}),
  fetch(SUPABASE_URL+"/rest/v1/benefit_rules?status=eq.active&select=slug,title,minimum_gift_cents,fulfillment_type",{headers:h})
 ]);
 const providers=pr.ok?await pr.json():[],commitments=cr.ok?await cr.json():[],gifts=gr.ok?await gr.json():[],benefits=br.ok?await br.json():[];
 const totalGiven=gifts.filter(g=>["succeeded","paid","completed"].includes(g.status)).reduce((sum,g)=>sum+Number(g.amount_cents||0),0);
 return json({providers,commitments,gifts,benefits,totalGiven,checkoutReady:providers.some(p=>p.status==="active")},200,s.refreshed?sessionCookies(s.refreshed):[]);
};
export const config={path:"/api/lockliel/partner"};