import {safeSharePath} from '../lib/share-guidance.mjs';
import {isContactId,followupAllowed} from '../lib/my-five-data.mjs';
import {memberRows} from '../lib/member-journey-data.mjs';
import { withProductionBackend } from "../lib/deployment-safety.mjs";
import {SUPABASE_URL,json,dbHeaders,requireSession,sessionCookies} from "../lib/lockliel-core.mjs";

export function createShareLinkHandler({sessionFor=requireSession,fetcher=globalThis.fetch}={}) { return async(request)=>{
  if(!['GET','POST'].includes(request.method))return json({error:'Method not allowed'},405);
  if(request.method==='POST'&&request.headers.get('origin')&&request.headers.get('origin')!==new URL(request.url).origin)return json({error:'Request not allowed'},403);
  try {
  const s=await sessionFor(request);
  if(!s.user||!s.access)return json({error:"Unauthorized"},401);

  const h=dbHeaders(s.access);
  const uid=s.user.id;

  if(request.method==="GET"){
    const r=await fetcher(
      SUPABASE_URL+"/rest/v1/reach_contacts?owner_id=eq."+encodeURIComponent(uid)+
      "&status=in.(praying,invited,connected,growing)&select=id,display_name,status&order=updated_at.desc",
      {headers:h}
    );
    if(!r.ok)throw new Error("Contacts unavailable");
    const reachContacts=await r.json();
    return json({reachContacts},200,s.refreshed?sessionCookies(s.refreshed):[]);
  }

  if(request.method!=="POST")return json({error:"Method not allowed"},405);

  const raw=await request.text();
  if(raw.length>2048)return json({error:'Request too large'},413);
  let b;try{b=JSON.parse(raw);}catch{return json({error:'Invalid request'},400);}
  if(!b||typeof b!=='object'||Array.isArray(b))return json({error:'Invalid request'},400);
  const slug=String(b.slug||"").trim();
  const channel=String(b.channel||"native").trim().slice(0,40);
  const reachContactId=String(b.reachContactId||"").trim();

  if(!/^[a-z0-9][a-z0-9-]{0,119}$/.test(slug)||!['native','copy','sms','email'].includes(channel)||(reachContactId&&!isContactId(reachContactId)))return json({error:'Choose a valid resource and person.'},400);
  let reachContact=null;
  if(reachContactId){
    const cr=await fetcher(
      SUPABASE_URL+"/rest/v1/reach_contacts?id=eq."+encodeURIComponent(reachContactId)+
      "&owner_id=eq."+encodeURIComponent(uid)+
      "&status=in.(praying,invited,connected,growing)&select=id,display_name,status,linked_profile_id&limit=1",
      {headers:h}
    );
    if(!cr.ok)throw new Error("Contact unavailable");
    const rows=await cr.json();
    reachContact=rows?.[0]||null;
    if(!reachContact)return json({error:"Choose an active person from your My Five list."},400);
    if(!await followupAllowed(memberRows(s.access,fetcher),uid,reachContact))return json({error:"Follow-up permission is not active for this person."},403);
  }

  const a=await fetcher(
    SUPABASE_URL+"/rest/v1/share_assets?slug=eq."+encodeURIComponent(slug)+
    "&status=eq.active&select=id,slug,title,asset_type,destination_path,share_text&limit=1",
    {headers:h}
  );
  if(!a.ok)throw new Error("Assets unavailable");
  const assets=await a.json();
  const asset=assets?.[0];
  if(!asset||!safeSharePath(asset.destination_path))return json({error:"Share resource not found"},404);

  const reachFilter=reachContact
    ? "&reach_contact_id=eq."+encodeURIComponent(reachContact.id)
    : "&reach_contact_id=is.null";

  const existing=await fetcher(
    SUPABASE_URL+"/rest/v1/referral_links?owner_id=eq."+encodeURIComponent(uid)+
    "&content_id=eq."+encodeURIComponent(asset.id)+
    reachFilter+
    "&active=eq.true&select=id,code&limit=1",
    {headers:h}
  );

  if(!existing.ok)throw new Error("Links unavailable");
  const rows=await existing.json();
  let code=rows?.[0]?.code;
  let linkId=rows?.[0]?.id;

  if(!code){
    code=crypto.randomUUID().replaceAll("-","").slice(0,10).toLowerCase();
    const created=await fetcher(SUPABASE_URL+"/rest/v1/referral_links",{
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

  if(!linkId)throw new Error("Link creation not confirmed");
  if(linkId){
    const event=await fetcher(SUPABASE_URL+"/rest/v1/referral_events",{
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
    if(!event.ok)return json({error:"Unable to record link preparation. Please try again."},503);
  }

  const origin=new URL(request.url).origin;
  return json({
    code,
    url:origin+"/r/"+code,
    title:asset.title,
    shareText:asset.share_text||"I thought this might encourage you.",
    reachContact:reachContact?{id:reachContact.id,displayName:reachContact.display_name}:null
  },200,s.refreshed?sessionCookies(s.refreshed):[]);
} catch {return json({error:"Unable to prepare sharing. Please try again."},503);}
};}
export default withProductionBackend(createShareLinkHandler());
export const config={path:"/api/lockliel/share-link",rateLimit:{windowLimit:30,windowSize:60,aggregateBy:["ip","domain"]}};
