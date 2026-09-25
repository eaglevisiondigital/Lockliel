import {SUPABASE_URL,json,dbHeaders,requireSession,sessionCookies} from "../lib/lockliel-core.mjs";

export default async(request)=>{
  const s=await requireSession(request);
  if(!s.user||!s.access)return json({error:"Unauthorized"},401);

  const h=dbHeaders(s.access);
  const uid=encodeURIComponent(s.user.id);

  if(request.method==="GET"){
    const r=await fetch(
      SUPABASE_URL+"/rest/v1/communication_preferences?profile_id=eq."+uid+"&select=ministry_email,faith_boost_email,book_release_email,partner_email,sms_updates,email_consent_at,sms_consent_at,updated_at&limit=1",
      {headers:h}
    );
    const rows=r.ok?await r.json():[];
    return json({preferences:rows?.[0]||null},200,s.refreshed?sessionCookies(s.refreshed):[]);
  }

  if(request.method==="POST"){
    const b=await request.json().catch(()=>({}));
    const payload={
      ministry_email:Boolean(b.ministryEmail),
      faith_boost_email:Boolean(b.faithBoostEmail),
      book_release_email:Boolean(b.bookReleaseEmail),
      partner_email:Boolean(b.partnerEmail),
      sms_updates:Boolean(b.smsUpdates)
    };

    const r=await fetch(
      SUPABASE_URL+"/rest/v1/communication_preferences?profile_id=eq."+uid,
      {
        method:"PATCH",
        headers:{...h,Prefer:"return=representation"},
        body:JSON.stringify(payload)
      }
    );
    if(!r.ok)return json({error:"Unable to save communication preferences."},r.status);

    const rows=await r.json();
    if(!rows.length)return json({error:"Communication preferences are not initialized for this account."},409);

    return json({ok:true,preferences:rows[0]},200,s.refreshed?sessionCookies(s.refreshed):[]);
  }

  return json({error:"Method not allowed"},405);
};

export const config={path:"/api/lockliel/preferences"};