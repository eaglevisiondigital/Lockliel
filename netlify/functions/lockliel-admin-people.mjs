import {SUPABASE_URL,json,dbHeaders,requireSession,sessionCookies} from "../lib/lockliel-core.mjs";

export default async(request)=>{
  if(request.method!=="GET")return json({error:"Method not allowed"},405);

  const s=await requireSession(request);
  if(!s.user||!s.access)return json({error:"Unauthorized"},401);

  const h=dbHeaders(s.access);
  const uid=encodeURIComponent(s.user.id);
  const rr=await fetch(
    SUPABASE_URL+"/rest/v1/staff_roles?profile_id=eq."+uid+"&select=role",
    {headers:h}
  );
  const roles=rr.ok?(await rr.json()).map(r=>r.role):[];
  const elevated=roles.some(r=>["super_admin","admin"].includes(r));
  const discipleship=roles.includes("discipleship_admin");
  if(!elevated&&!discipleship)return json({error:"People and progress access required"},403);

  const personUrl=elevated
    ? SUPABASE_URL+"/rest/v1/profiles?select=id,first_name,last_name,email,phone,city,region,country,original_inviter_id,onboarding_status,created_at&order=created_at.desc&limit=500"
    : SUPABASE_URL+"/rest/v1/profile_connection_cards?select=profile_id,first_name,last_initial,city,region,country,updated_at&order=updated_at.desc&limit=500";

  const [
    peopleRes,
    tagsRes,
    profileTagsRes,
    progressRes,
    faithRes,
    lessonsRes,
    mediaRes,
    assetsRes,
    foundersRes
  ]=await Promise.all([
    fetch(personUrl,{headers:h}),
    fetch(SUPABASE_URL+"/rest/v1/tags?select=id,slug,label,category",{headers:h}),
    fetch(SUPABASE_URL+"/rest/v1/profile_tags?select=profile_id,tag_id,source&limit=20000",{headers:h}),
    fetch(SUPABASE_URL+"/rest/v1/lesson_progress?select=profile_id,lesson_id,status,worksheet_status,last_activity_at,completed_at&limit=40000",{headers:h}),
    fetch(SUPABASE_URL+"/rest/v1/faith_profiles?select=profile_id,faith_stage,growth_interests,wants_group,wants_host,preferred_connection,updated_at&limit=5000",{headers:h}),
    fetch(SUPABASE_URL+"/rest/v1/lessons?select=id,course_id,position,slug,title&limit=5000",{headers:h}),
    fetch(SUPABASE_URL+"/rest/v1/media_progress?select=profile_id,asset_id,last_position_seconds,played_seconds,percent_watched,last_activity_at,completed_at&limit=50000",{headers:h}),
    fetch(SUPABASE_URL+"/rest/v1/lesson_assets?select=id,lesson_id,asset_type,title,provider,status&limit=10000",{headers:h}),
    elevated
      ? fetch(SUPABASE_URL+"/rest/v1/founders50_applications?select=profile_id,status&profile_id=not.is.null&order=created_at.desc&limit=5000",{headers:h})
      : Promise.resolve(null)
  ]);

  const rawPeople=peopleRes.ok?await peopleRes.json():[];
  const tags=tagsRes.ok?await tagsRes.json():[];
  const profileTags=profileTagsRes.ok?await profileTagsRes.json():[];
  const progress=progressRes.ok?await progressRes.json():[];
  const faith=faithRes.ok?await faithRes.json():[];
  const lessons=lessonsRes.ok?await lessonsRes.json():[];
  const media=mediaRes.ok?await mediaRes.json():[];
  const assets=assetsRes.ok?await assetsRes.json():[];
  const founders=elevated&&foundersRes?.ok?await foundersRes.json():[];

  const people=elevated
    ? rawPeople
    : rawPeople.map(p=>({
        id:p.profile_id,
        first_name:p.first_name,
        last_name:p.last_initial?String(p.last_initial)+".":"",
        email:null,
        phone:null,
        city:p.city,
        region:p.region,
        country:p.country,
        original_inviter_id:null,
        onboarding_status:null,
        created_at:p.updated_at
      }));

  const tagMap=Object.fromEntries(tags.map(t=>[t.id,t]));
  const profileMap=Object.fromEntries(people.map(p=>[p.id,p]));
  const faithMap=Object.fromEntries(faith.map(x=>[x.profile_id,x]));
  const lessonMap=Object.fromEntries(lessons.map(l=>[l.id,l]));
  const assetMap=Object.fromEntries(assets.map(a=>[a.id,a]));
  const founderMap={};
  for(const row of founders){
    if(!founderMap[row.profile_id])founderMap[row.profile_id]=row.status;
  }

  const output=people.map(p=>{
    const pp=progress.filter(x=>x.profile_id===p.id);
    const completed=pp.filter(x=>x.status==="completed").length;
    const inProgress=pp.filter(x=>x.status==="in_progress").length;

    const sortedProgress=[...pp]
      .filter(x=>x.last_activity_at)
      .sort((a,b)=>String(b.last_activity_at).localeCompare(String(a.last_activity_at)));
    const currentProgress=sortedProgress.find(x=>x.status!=="completed")||sortedProgress[0]||null;
    const currentLesson=currentProgress?lessonMap[currentProgress.lesson_id]||null:null;

    const pm=media
      .filter(x=>x.profile_id===p.id)
      .sort((a,b)=>String(b.last_activity_at||"").localeCompare(String(a.last_activity_at||"")));
    const latestMediaRow=pm[0]||null;
    const latestAsset=latestMediaRow?assetMap[latestMediaRow.asset_id]||null:null;
    const latestMediaLesson=latestAsset?lessonMap[latestAsset.lesson_id]||null:null;
    const totalPlayedSeconds=pm.reduce((sum,x)=>sum+Number(x.played_seconds||0),0);

    const pt=profileTags
      .filter(x=>x.profile_id===p.id)
      .map(x=>tagMap[x.tag_id])
      .filter(Boolean)
      .map(t=>({slug:t.slug,label:t.label,category:t.category}));

    const inviter=p.original_inviter_id?profileMap[p.original_inviter_id]:null;

    return {
      id:p.id,
      name:[p.first_name,p.last_name].filter(Boolean).join(" ").trim()||p.email||"Member",
      email:elevated?p.email:null,
      phone:elevated?p.phone:null,
      location:[p.city,p.region,p.country].filter(Boolean).join(", "),
      onboarding_status:p.onboarding_status,
      created_at:p.created_at,
      inviter:inviter
        ? {id:inviter.id,name:[inviter.first_name,inviter.last_name].filter(Boolean).join(" ").trim()||inviter.email}
        : null,
      tags:pt,
      faith:faithMap[p.id]||null,
      founder_status:elevated?(founderMap[p.id]||null):null,
      progress:{
        completed,
        inProgress,
        total:lessons.length,
        last_activity:sortedProgress[0]?.last_activity_at||latestMediaRow?.last_activity_at||null,
        currentLesson:currentLesson
          ? {
              id:currentLesson.id,
              position:currentLesson.position,
              title:currentLesson.title,
              status:currentProgress.status,
              worksheetStatus:currentProgress.worksheet_status
            }
          : null,
        latestMedia:latestMediaRow
          ? {
              assetId:latestMediaRow.asset_id,
              title:latestAsset?.title||latestAsset?.asset_type||"Lesson media",
              percent:Number(latestMediaRow.percent_watched)||0,
              lessonPosition:latestMediaLesson?.position||null,
              lessonTitle:latestMediaLesson?.title||null,
              lastActivity:latestMediaRow.last_activity_at
            }
          : null,
        totalPlayedSeconds
      }
    };
  });

  return json({
    people:output,
    totalLessons:lessons.length,
    privacyMode:elevated?"full_admin":"discipleship_limited"
  },200,s.refreshed?sessionCookies(s.refreshed):[]);
};

export const config={path:"/api/lockliel/admin/people"};