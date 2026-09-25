import {SUPABASE_URL,json,dbHeaders,requireSession,sessionCookies} from "../lib/lockliel-core.mjs";

export default async(request)=>{
  const s=await requireSession(request);
  if(!s.user||!s.access)return json({error:"Unauthorized"},401);

  const h=dbHeaders(s.access);
  const uid=s.user.id;

  if(request.method==="GET"){
    const r=await fetch(
      SUPABASE_URL+"/rest/v1/reach_contacts?owner_id=eq."+encodeURIComponent(uid)+
      "&status=in.(praying,invited,connected,growing)&select=id,display_name,status&order=updated_at.desc",
      {headers:h}
    );
    const reachContacts=r.ok?await r.json():[];
    return json({reachContacts},200,s.refreshed?sessionCookies(s.refreshed):[]);
  }

  if(request.method!=="POST")return json({error:"Method not allowed"},405);

  const b=await request.json().catch(()=>({}));
  const slug=String(b.slug||"").trim();
  const channel=String(b.channel||"native").trim().slice(0,40);
  const reachContactId=String(b.reachContactId||"").trim();

  let reachContact=null;
  if(reachContactId){
    const cr=await fetch(
      SUPABASE_URL+"/rest/v1/reach_contacts?id=eq."+encodeURIComponent(reachContactId)+
      "&owner_id=eq."+encodeURIComponent(uid)+
      "&status=in.(praying,invited,connected,growing)&select=id,display_name,status&limit=1",
      {headers:h}
    );
    const rows=cr.ok?await cr.json():[];
    reachContact=rows?.[0]||null;
    if(!reachContact)return json({error:"Choose an active person from your My Five list."},400);
  }

  const a=await fetch(
    SUPABASE_URL+"/rest/v1/share_assets?slug=eq."+encodeURIComponent(slug)+
    "&status=eq.active&select=id,slug,title,asset_type,destination_path,share_text&limit=1",
    {headers:h}
  );
  const assets=a.ok?await a.json():[];
  const asset=assets?.[0];
  if(!asset)return json({error:"Share resource not found"},404);

  const reachFilter=reachContact
    ? "&reach_contact_id=eq."+encodeURIComponent(reachContact.id)
    : "&reach_contact_id=is.null";

  const existing=await fetch(
    SUPABASE_URL+"/rest/v1/referral_links?owner_id=eq."+encodeURIComponent(uid)+
    "&content_id=eq."+encodeURIComponent(asset.id)+
    reachFilter+
    "&active=eq.true&select=id,code&limit=1",
    {headers:h}
  );

  const rows=existing.ok?await existing.json():[];
  let code=rows?.[0]?.code;
  let linkId=rows?.[0]?.id;

  if(!code){
    code=crypto.randomUUID().replaceAll("-","").slice(0,10).toLowerCase();
    const created=await fetch(SUPABASE_URL+"/rest/v1/referral_links",{
      method:"POST",
      headers:{...h,Prefer:"return=representation"},
      body:JSON.stringify({
        owner_id:uid,
        code,
        campaign:reachContact?"share-center-my-five":"share-center",
        content_type:asset.asset_type,
        content_id:asset.id,
        destination_path:asset.destination_path,
        reach_contact_id:reachContact?.id||null
      })
    });
    if(!created.ok)return json({error:"We couldn't create your share link."},500);
    const createdRows=await created.json();
    linkId=createdRows?.[0]?.id;
  }

  if(linkId){
    await fetch(SUPABASE_URL+"/rest/v1/referral_events",{
      method:"POST",
      headers:{...h,Prefer:"return=minimal"},
      body:JSON.stringify({
        referral_link_id:linkId,
        event_type:"share_initiated",
        member_id:uid,
        metadata:{
          source:"share-center",
          asset:slug,
          channel,
          ...(reachContact?{reach_contact_id:reachContact.id}:{})
        }
      })
    });
  }

  const origin=new URL(request.url).origin;
  return json({
    code,
    url:origin+"/r/"+code,
    title:asset.title,
    shareText:asset.share_text||"I thought this might encourage you.",
    reachContact:reachContact?{id:reachContact.id,displayName:reachContact.display_name}:null
  },200,s.refreshed?sessionCookies(s.refreshed):[]);
};

export const config={path:"/api/lockliel/share-link"};
