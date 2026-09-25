import {SUPABASE_URL,json,dbHeaders,requireSession,sessionCookies} from "../lib/lockliel-core.mjs";

export default async(request)=>{
  const s=await requireSession(request);
  if(!s.user||!s.access)return json({error:"Unauthorized"},401);

  const h=dbHeaders(s.access);
  const uid=encodeURIComponent(s.user.id);

  if(request.method==="GET"){
    const r=await fetch(
      SUPABASE_URL+"/rest/v1/notifications?profile_id=eq."+uid+"&select=id,notification_type,title,body,href,read_at,created_at&order=created_at.desc&limit=50",
      {headers:h}
    );
    const notifications=r.ok?await r.json():[];
    return json({
      unread:notifications.filter(n=>!n.read_at).length,
      notifications
    },200,s.refreshed?sessionCookies(s.refreshed):[]);
  }

  if(request.method==="POST"){
    const b=await request.json().catch(()=>({}));
    if(b.action==="markAllRead"){
      const r=await fetch(
        SUPABASE_URL+"/rest/v1/notifications?profile_id=eq."+uid+"&read_at=is.null",
        {
          method:"PATCH",
          headers:{...h,Prefer:"return=minimal"},
          body:JSON.stringify({read_at:new Date().toISOString()})
        }
      );
      return r.ok
        ? json({ok:true},200,s.refreshed?sessionCookies(s.refreshed):[])
        : json({error:"Unable to update notifications."},r.status);
    }

    const id=String(b.id||"");
    if(!id)return json({error:"Notification required"},400);
    const r=await fetch(
      SUPABASE_URL+"/rest/v1/notifications?id=eq."+encodeURIComponent(id)+"&profile_id=eq."+uid,
      {
        method:"PATCH",
        headers:{...h,Prefer:"return=minimal"},
        body:JSON.stringify({read_at:new Date().toISOString()})
      }
    );
    return r.ok
      ? json({ok:true},200,s.refreshed?sessionCookies(s.refreshed):[])
      : json({error:"Unable to update notification."},r.status);
  }

  return json({error:"Method not allowed"},405);
};

export const config={path:"/api/lockliel/notifications"};