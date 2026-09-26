import {SUPABASE_URL,json,dbHeaders,requireSession,sessionCookies} from "../lib/lockliel-core.mjs";

function mondayIso(){
  const d=new Date();
  const day=d.getUTCDay();
  const diff=day===0?-6:1-day;
  d.setUTCDate(d.getUTCDate()+diff);
  return d.toISOString().slice(0,10);
}

export default async(request)=>{
  if(request.method!=="GET")return json({error:"Method not allowed"},405);

  const s=await requireSession(request);
  if(!s.user||!s.access)return json({error:"Unauthorized"},401);

  const h=dbHeaders(s.access);
  const uid=encodeURIComponent(s.user.id);
  const now=new Date().toISOString();

  const [reachRes,notesRes,groupRes]=await Promise.all([
    fetch(
      SUPABASE_URL+"/rest/v1/reach_contacts?owner_id=eq."+uid+"&status=in.(praying,invited,connected,growing)&select=id,display_name,status,next_follow_up_at,last_follow_up_at,updated_at&order=next_follow_up_at.asc.nullslast,updated_at.asc",
      {headers:h}
    ),
    fetch(
      SUPABASE_URL+"/rest/v1/notifications?profile_id=eq."+uid+"&read_at=is.null&select=id&limit=100",
      {headers:h}
    ),
    fetch(
      SUPABASE_URL+"/rest/v1/group_members?profile_id=eq."+uid+"&status=eq.active&role=in.(leader,host)&select=group_id,role",
      {headers:h}
    )
  ]);

  const reach=reachRes.ok?await reachRes.json():[];
  const notifications=notesRes.ok?await notesRes.json():[];
  const hostMemberships=groupRes.ok?await groupRes.json():[];

  const due=reach.filter(item=>item.next_follow_up_at&&item.next_follow_up_at<=now);
  const upcoming=reach.filter(item=>item.next_follow_up_at&&item.next_follow_up_at>now);

  let checkinDue=false;
  let hostGroups=0;
  if(hostMemberships.length){
    hostGroups=hostMemberships.length;
    const groupIds=hostMemberships.map(g=>g.group_id);
    const currentWeek=mondayIso();
    const checkinRes=await fetch(
      SUPABASE_URL+"/rest/v1/group_weekly_checkins?group_id=in.("+groupIds.join(",")+")&week_start=eq."+currentWeek+"&select=group_id",
      {headers:h}
    );
    const currentCheckins=checkinRes.ok?await checkinRes.json():[];
    const checked=new Set(currentCheckins.map(c=>c.group_id));
    checkinDue=groupIds.some(id=>!checked.has(id));
  }

  const items=[];
  if(due.length){
    items.push({
      key:"my_five_due",
      priority:"high",
      title:due.length===1
        ?"Follow up with "+due[0].display_name
        :due.length+" My Five follow-ups are due",
      detail:"A personal follow-up can turn a shared resource into a real conversation.",
      href:"/my-lockliel/connections",
      count:due.length
    });
  }

  if(checkinDue){
    items.push({
      key:"group_checkin",
      priority:"medium",
      title:"Your weekly group check-in is ready",
      detail:"Capture the gathering, people reached, wins, support needs, and multiplication signals.",
      href:"/my-lockliel/group",
      count:hostGroups
    });
  }

  if(notifications.length){
    items.push({
      key:"notifications",
      priority:"low",
      title:notifications.length===1
        ?"You have 1 unread notification"
        :"You have "+notifications.length+" unread notifications",
      detail:"See messages, assignments, resources, and ministry updates waiting for you.",
      href:"/my-lockliel/notifications",
      count:notifications.length
    });
  }

  return json({
    items,
    activeMyFive:reach.length,
    dueMyFive:due.length,
    nextFollowUp:upcoming?.[0]||null,
    unreadNotifications:notifications.length,
    groupCheckinDue:checkinDue
  },200,s.refreshed?sessionCookies(s.refreshed):[]);
};

export const config={path:"/api/lockliel/dashboard-attention"};