import {SUPABASE_URL,json,dbHeaders,requireSession,sessionCookies} from "../lib/lockliel-core.mjs";

export default async(request)=>{
  if(request.method!=="GET")return json({error:"Method not allowed"},405);

  const s=await requireSession(request);
  if(!s.user||!s.access)return json({error:"Unauthorized"},401);

  const url=new URL(request.url);
  const giftId=String(url.searchParams.get("giftId")||"");
  if(!giftId)return json({error:"Gift required"},400);

  const h=dbHeaders(s.access);
  const uid=encodeURIComponent(s.user.id);

  const [giftRes,profileRes]=await Promise.all([
    fetch(
      SUPABASE_URL+"/rest/v1/gifts?id=eq."+encodeURIComponent(giftId)+"&profile_id=eq."+uid+"&status=in.(succeeded,paid,completed)&select=id,provider,provider_transaction_ref,amount_cents,currency,status,designation,campaign,received_at,created_at,donor_name,donor_email&limit=1",
      {headers:h}
    ),
    fetch(
      SUPABASE_URL+"/rest/v1/profiles?id=eq."+uid+"&select=first_name,last_name,email,city,region,country&limit=1",
      {headers:h}
    )
  ]);

  const gift=(giftRes.ok?await giftRes.json():[])?.[0]||null;
  if(!gift)return json({error:"Gift acknowledgment is not available for this record."},404);

  const profile=(profileRes.ok?await profileRes.json():[])?.[0]||null;

  return json({
    acknowledgment:{
      giftId:gift.id,
      donorName:gift.donor_name||[profile?.first_name,profile?.last_name].filter(Boolean).join(" ")||"Lockliel Partner",
      donorEmail:gift.donor_email||profile?.email||s.user.email||null,
      amountCents:Number(gift.amount_cents)||0,
      currency:gift.currency||"USD",
      designation:gift.designation||"general",
      campaign:gift.campaign||null,
      provider:gift.provider,
      providerReference:gift.provider_transaction_ref,
      receivedAt:gift.received_at||gift.created_at,
      status:gift.status
    }
  },200,s.refreshed?sessionCookies(s.refreshed):[]);
};

export const config={path:"/api/lockliel/gift-acknowledgment"};