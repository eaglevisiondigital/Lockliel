import {SUPABASE_URL,json,dbHeaders,requireSession,sessionCookies} from "../lib/lockliel-core.mjs";
export default async(request)=>{
 if(request.method!=="POST")return json({error:"Method not allowed"},405);
 const s=await requireSession(request);if(!s.user||!s.access)return json({error:"Unauthorized"},401);
 const b=await request.json().catch(()=>({})),slug=String(b.slug||"").trim(),channel=String(b.channel||"native").trim().slice(0,40),h=dbHeaders(s.access);
 const a=await fetch(SUPABASE_URL+"/rest/v1/share_assets?slug=eq."+encodeURIComponent(slug)+"&status=eq.active&select=id,slug,title,asset_type,destination_path,share_text&limit=1",{headers:h});
 const assets=a.ok?await a.json():[],asset=assets?.[0];if(!asset)return json({error:"Share resource not found"},404);
 const existing=await fetch(SUPABASE_URL+"/rest/v1/referral_links?owner_id=eq."+encodeURIComponent(s.user.id)+"&content_id=eq."+encodeURIComponent(asset.id)+"&active=eq.true&select=id,code&limit=1",{headers:h});
 const rows=existing.ok?await existing.json():[];let code=rows?.[0]?.code,linkId=rows?.[0]?.id;
 if(!code){
   code=crypto.randomUUID().replaceAll("-","").slice(0,10).toLowerCase();
   const created=await fetch(SUPABASE_URL+"/rest/v1/referral_links",{method:"POST",headers:{...h,Prefer:"return=representation"},body:JSON.stringify({owner_id:s.user.id,code,campaign:"share-center",content_type:asset.asset_type,content_id:asset.id,destination_path:asset.destination_path})});
   if(!created.ok)return json({error:"We couldn't create your share link."},500);
   const createdRows=await created.json();linkId=createdRows?.[0]?.id;
 }
 if(linkId)await fetch(SUPABASE_URL+"/rest/v1/referral_events",{method:"POST",headers:{...h,Prefer:"return=minimal"},body:JSON.stringify({referral_link_id:linkId,event_type:"share_initiated",member_id:s.user.id,metadata:{source:"share-center",asset:slug,channel}})});
 const origin=new URL(request.url).origin;
 return json({code,url:origin+"/r/"+code,title:asset.title,shareText:asset.share_text||"I thought this might encourage you."},200,s.refreshed?sessionCookies(s.refreshed):[]);
};
export const config={path:"/api/lockliel/share-link"};