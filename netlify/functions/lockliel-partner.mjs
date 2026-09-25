import {SUPABASE_URL,json,dbHeaders,requireSession,sessionCookies} from "../lib/lockliel-core.mjs";

export default async(request)=>{
  if(request.method!=="GET")return json({error:"Method not allowed"},405);

  const s=await requireSession(request);
  if(!s.user||!s.access)return json({error:"Unauthorized"},401);

  const h=dbHeaders(s.access);
  const uid=encodeURIComponent(s.user.id);

  const [sr,cr,gr,br,fr]=await Promise.all([
    fetch(
      SUPABASE_URL+"/rest/v1/partner_checkout_state?select=checkout_ready,supports_one_time,supports_recurring&limit=1",
      {headers:h}
    ),
    fetch(
      SUPABASE_URL+"/rest/v1/partner_commitments?profile_id=eq."+uid+"&select=id,provider,cadence,amount_cents,currency,status,designation,started_at,cancelled_at,created_at&order=created_at.desc",
      {headers:h}
    ),
    fetch(
      SUPABASE_URL+"/rest/v1/gifts?profile_id=eq."+uid+"&select=id,provider,amount_cents,currency,status,designation,received_at,created_at&order=created_at.desc&limit=50",
      {headers:h}
    ),
    fetch(
      SUPABASE_URL+"/rest/v1/benefit_rules?status=eq.active&select=slug,title,minimum_gift_cents,fulfillment_type",
      {headers:h}
    ),
    fetch(
      SUPABASE_URL+"/rest/v1/feature_flags?key=eq.heart_book_gift_benefit&select=key,enabled",
      {headers:h}
    )
  ]);

  const checkoutRows=sr.ok?await sr.json():[];
  const checkoutState=checkoutRows?.[0]||null;
  const commitments=cr.ok?await cr.json():[];
  const gifts=gr.ok?await gr.json():[];
  const benefits=br.ok?await br.json():[];
  const flags=fr.ok?await fr.json():[];
  const flagMap=Object.fromEntries(flags.map(x=>[x.key,x.enabled]));

  const totalGiven=gifts
    .filter(g=>["succeeded","paid","completed"].includes(g.status))
    .reduce((sum,g)=>sum+Number(g.amount_cents||0),0);

  return json({
    commitments,
    gifts,
    benefits,
    totalGiven,
    flags:flagMap,
    checkoutReady:Boolean(checkoutState?.checkout_ready),
    checkoutCapabilities:{
      supportsOneTime:Boolean(checkoutState?.supports_one_time),
      supportsRecurring:Boolean(checkoutState?.supports_recurring)
    }
  },200,s.refreshed?sessionCookies(s.refreshed):[]);
};

export const config={path:"/api/lockliel/partner"};