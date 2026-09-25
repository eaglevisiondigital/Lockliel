import {SUPABASE_URL,json,dbHeaders,requireSession,sessionCookies} from "../lib/lockliel-core.mjs";

function inFilter(ids){return "in.("+ids.join(",")+")";}

export default async(request)=>{
  if(request.method!=="GET")return json({error:"Method not allowed"},405);

  const s=await requireSession(request);
  if(!s.user||!s.access)return json({error:"Unauthorized"},401);

  const h=dbHeaders(s.access);
  const uid=encodeURIComponent(s.user.id);

  const lr=await fetch(
    SUPABASE_URL+"/rest/v1/referral_links?owner_id=eq."+uid+"&active=eq.true&select=id,content_id,content_type,campaign,code,destination_path,created_at",
    {headers:h}
  );
  const links=lr.ok?await lr.json():[];
  const ids=links.map(x=>x.id);

  let events=[];
  if(ids.length){
    const er=await fetch(
      SUPABASE_URL+"/rest/v1/referral_events?referral_link_id="+encodeURIComponent(inFilter(ids))+"&select=referral_link_id,event_type,member_id,occurred_at",
      {headers:h}
    );
    events=er.ok?await er.json():[];
  }

  const assetIds=[...new Set(links.map(l=>l.content_id).filter(Boolean))];
  let assets=[];
  if(assetIds.length){
    const ar=await fetch(
      SUPABASE_URL+"/rest/v1/share_assets?id="+encodeURIComponent(inFilter(assetIds))+"&select=id,slug,title,asset_type,destination_path",
      {headers:h}
    );
    assets=ar.ok?await ar.json():[];
  }
  const assetMap=Object.fromEntries(assets.map(a=>[a.id,a]));

  const totals={
    share_initiated:0,
    visit:0,
    signup:0,
    course_started:0,
    lesson_completed:0
  };

  for(const event of events){
    if(Object.prototype.hasOwnProperty.call(totals,event.event_type)){
      totals[event.event_type]++;
    }
  }

  const uniqueJoined=new Set(
    events
      .filter(e=>e.event_type==="signup"&&e.member_id)
      .map(e=>e.member_id)
  ).size;

  const breakdown=links.map(link=>{
    const rows=events.filter(e=>e.referral_link_id===link.id);
    const counts={
      shares:rows.filter(e=>e.event_type==="share_initiated").length,
      visits:rows.filter(e=>e.event_type==="visit").length,
      joined:new Set(
        rows.filter(e=>e.event_type==="signup"&&e.member_id).map(e=>e.member_id)
      ).size,
      courseStarts:rows.filter(e=>e.event_type==="course_started").length,
      lessonCompletions:rows.filter(e=>e.event_type==="lesson_completed").length
    };
    return {
      id:link.id,
      code:link.code,
      contentType:link.content_type,
      campaign:link.campaign,
      destinationPath:link.destination_path,
      createdAt:link.created_at,
      asset:assetMap[link.content_id]||null,
      counts
    };
  });

  return json({
    totals:{...totals,unique_joined:uniqueJoined},
    breakdown
  },200,s.refreshed?sessionCookies(s.refreshed):[]);
};

export const config={path:"/api/lockliel/share-stats"};