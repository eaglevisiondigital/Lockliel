import {SUPABASE_URL,json,dbHeaders,requireSession,sessionCookies} from "../lib/lockliel-core.mjs";
function inFilter(ids){return "in.("+ids.join(",")+")";}
export default async(request)=>{
 if(request.method!=="GET")return json({error:"Method not allowed"},405);
 const s=await requireSession(request);if(!s.user||!s.access)return json({error:"Unauthorized"},401);
 const h=dbHeaders(s.access),uid=encodeURIComponent(s.user.id);
 const lr=await fetch(SUPABASE_URL+"/rest/v1/referral_links?owner_id=eq."+uid+"&active=eq.true&select=id,content_id,content_type,campaign,code",{headers:h});
 const links=lr.ok?await lr.json():[],ids=links.map(x=>x.id);
 let events=[];if(ids.length){const er=await fetch(SUPABASE_URL+"/rest/v1/referral_events?referral_link_id="+encodeURIComponent(inFilter(ids))+"&select=referral_link_id,event_type,member_id,occurred_at",{headers:h});events=er.ok?await er.json():[];}
 const totals={share_initiated:0,visit:0,signup:0,course_started:0,lesson_completed:0};
 for(const e of events)if(Object.prototype.hasOwnProperty.call(totals,e.event_type))totals[e.event_type]++;
 const uniqueJoined=new Set(events.filter(e=>e.event_type==="signup"&&e.member_id).map(e=>e.member_id)).size;
 return json({totals:{...totals,unique_joined:uniqueJoined},links:links.map(l=>({...l,events:events.filter(e=>e.referral_link_id===l.id).length}))},200,s.refreshed?sessionCookies(s.refreshed):[]);
};
export const config={path:"/api/lockliel/share-stats"};