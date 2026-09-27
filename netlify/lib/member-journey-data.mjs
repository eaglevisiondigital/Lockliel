import {SUPABASE_URL,dbHeaders} from './lockliel-core.mjs';
import {loadCourseJourney} from './course-journey.mjs';

export function memberRows(access,fetcher=globalThis.fetch) {
  return async function rows(path,options={}) {
    const response=await fetcher(SUPABASE_URL+'/rest/v1/'+path,{...options,headers:{...dbHeaders(access),...options.headers}});
    if(!response.ok)throw new Error('Member data unavailable');
    const value=await response.json();
    if(!Array.isArray(value))throw new Error('Member data unavailable');
    return value;
  };
}
export function weekStart(now) {
  const date=new Date(now);
  const day=date.getUTCDay();
  date.setUTCDate(date.getUTCDate()+(day===0?-6:1-day));
  return date.toISOString().slice(0,10);
}
export async function loadMemberJourney(session,{fetcher=globalThis.fetch,now=new Date()}={}) {
  const rows=memberRows(session.access,fetcher),uid=encodeURIComponent(session.user.id);
  const [profiles,faith,reach,memberships,requests,founders,resources,course]=await Promise.all([
    rows('profiles?id=eq.'+uid+'&select=onboarding_status,locale&limit=1'),
    rows('faith_profiles?profile_id=eq.'+uid+'&select=growth_interests,wants_group,preferred_connection&limit=1'),
    rows('reach_contacts?owner_id=eq.'+uid+'&status=in.(praying,invited,connected,growing)&select=status,next_follow_up_at,last_shared_at&limit=6'),
    rows('group_members?profile_id=eq.'+uid+'&status=eq.active&select=group_id,role&limit=100'),
    rows('connection_requests?requester_id=eq.'+uid+'&status=eq.open&request_type=in.(find_local_group,join_group)&select=request_type,status&limit=100'),
    rows('founders50_applications?profile_id=eq.'+uid+'&select=status&order=created_at.desc&limit=1'),
    rows('share_assets?status=eq.active&select=id,slug,title,description,destination_path,status,category,featured,sort_order,language_code,translation_key&order=featured.desc,sort_order.asc,slug.asc&limit=500'),
    loadCourseJourney(session.access,session.user.id,{fetcher,summary:true})
  ]);
  if(!profiles[0])throw new Error('Member profile unavailable');
  const ids=memberships.map(row=>row.group_id);
  const groups=ids.length?await rows('groups?id='+encodeURIComponent('in.('+ids.join(',')+')')+'&select=id,status'):[];
  const operational=groups.filter(group=>['forming','active'].includes(group.status)).map(group=>({...group,myRole:memberships.find(row=>row.group_id===group.id)?.role}));
  const hostIds=operational.filter(group=>['host','leader'].includes(group.myRole)).map(group=>group.id);
  const checkins=hostIds.length?await rows('group_weekly_checkins?group_id='+encodeURIComponent('in.('+hostIds.join(',')+')')+'&week_start=eq.'+weekStart(now)+'&select=group_id'):[];
  const founderStatus=founders[0]?.status || null;
  let orientationPending=false;
  if(['accepted','orientation','active_host'].includes(founderStatus)) {
    const [steps,progress]=await Promise.all([
      rows('founder_orientation_steps?active=eq.true&required=eq.true&select=id'),
      rows('founder_orientation_progress?profile_id=eq.'+uid+'&select=step_id,completed_at')
    ]);
    orientationPending=steps.some(step=>!progress.some(row=>row.step_id===step.id&&row.completed_at));
  }
  return {profile:profiles[0],faith:faith[0]||null,reach,groups:operational,requests,founderStatus,orientationPending,resources,course,groupCheckinDue:hostIds.some(id=>!checkins.some(row=>row.group_id===id))};
}
