import {SUPABASE_URL,json,dbHeaders,requireSession,sessionCookies} from "../lib/lockliel-core.mjs";

function inFilter(ids){
  return "in.("+ids.join(",")+")";
}

function clampInt(value,max){
  const n=Math.round(Number(value)||0);
  return Math.min(max,Math.max(0,n));
}

export default async(request)=>{
  const s=await requireSession(request);
  if(!s.user||!s.access)return json({error:"Unauthorized"},401);

  const h=dbHeaders(s.access);
  const uid=s.user.id;

  if(request.method==="POST"){
    const b=await request.json().catch(()=>({}));
    const groupId=String(b.groupId||"");
    const weekStart=String(b.weekStart||"");

    if(!groupId||!/^\d{4}-\d{2}-\d{2}$/.test(weekStart)){
      return json({error:"Group and week are required."},400);
    }

    const payload={
      group_id:groupId,
      week_start:weekStart,
      gathered:Boolean(b.gathered),
      attendance_count:clampInt(b.attendanceCount,10000),
      faith_boosts_used:clampInt(b.faithBoostsUsed,50),
      people_shared_with:clampInt(b.peopleSharedWith,10000),
      new_people_count:clampInt(b.newPeopleCount,10000),
      next_leader_identified:Boolean(b.nextLeaderIdentified),
      testimony:String(b.testimony||"").trim().slice(0,5000)||null,
      needs_support:String(b.needsSupport||"").trim().slice(0,5000)||null
    };

    const r=await fetch(
      SUPABASE_URL+"/rest/v1/group_weekly_checkins?on_conflict=group_id,week_start",
      {
        method:"POST",
        headers:{...h,Prefer:"resolution=merge-duplicates,return=representation"},
        body:JSON.stringify(payload)
      }
    );

    if(!r.ok)return json({error:"Unable to save weekly check-in."},r.status);
    return json({ok:true,checkin:(await r.json())?.[0]||null},200,s.refreshed?sessionCookies(s.refreshed):[]);
  }

  if(request.method!=="GET")return json({error:"Method not allowed"},405);

  const membershipsRes=await fetch(
    SUPABASE_URL+"/rest/v1/group_members?profile_id=eq."+encodeURIComponent(uid)+"&status=eq.active&role=in.(leader,host)&select=group_id,role",
    {headers:h}
  );
  const memberships=membershipsRes.ok?await membershipsRes.json():[];
  const ids=memberships.map(m=>m.group_id);

  if(!ids.length){
    return json({groups:[],checkins:[]},200,s.refreshed?sessionCookies(s.refreshed):[]);
  }

  const [groupsRes,checkinsRes]=await Promise.all([
    fetch(
      SUPABASE_URL+"/rest/v1/groups?id="+encodeURIComponent(inFilter(ids))+"&select=id,name,city,region,country,status",
      {headers:h}
    ),
    fetch(
      SUPABASE_URL+"/rest/v1/group_weekly_checkins?group_id="+encodeURIComponent(inFilter(ids))+"&select=id,group_id,week_start,gathered,attendance_count,faith_boosts_used,people_shared_with,new_people_count,next_leader_identified,testimony,needs_support,created_at,updated_at&order=week_start.desc&limit=100",
      {headers:h}
    )
  ]);

  return json({
    groups:groupsRes.ok?await groupsRes.json():[],
    checkins:checkinsRes.ok?await checkinsRes.json():[]
  },200,s.refreshed?sessionCookies(s.refreshed):[]);
};

export const config={path:"/api/lockliel/group-checkin"};