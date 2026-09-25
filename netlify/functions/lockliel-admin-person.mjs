import {SUPABASE_URL,json,dbHeaders,requireSession,sessionCookies,sessionAal} from "../lib/lockliel-core.mjs";

export default async(request)=>{
  const s=await requireSession(request);
  if(!s.user||!s.access)return json({error:"Unauthorized"},401);
  if(sessionAal(s.access)!=="aal2")return json({error:"Multi-factor authentication required.",code:"mfa_required"},403);

  const h=dbHeaders(s.access);
  const uid=encodeURIComponent(s.user.id);
  const rr=await fetch(
    SUPABASE_URL+"/rest/v1/staff_roles?profile_id=eq."+uid+"&select=role",
    {headers:h}
  );
  const roles=rr.ok?(await rr.json()).map(r=>r.role):[];
  const elevated=roles.some(r=>["super_admin","admin"].includes(r));
  const ministry=roles.some(r=>["super_admin","admin","discipleship_admin","founders50_reviewer"].includes(r));
  const finance=roles.some(r=>["super_admin","admin","finance_admin"].includes(r));
  if(!ministry&&!finance)return json({error:"Person record access required"},403);

  const url=new URL(request.url);
  const profileId=String(url.searchParams.get("profileId")||"");
  if(!profileId)return json({error:"Profile required"},400);

  const safeId=encodeURIComponent(profileId);

  const requests=[
    fetch(
      elevated
        ? SUPABASE_URL+"/rest/v1/profiles?id=eq."+safeId+"&select=id,first_name,last_name,email,phone,city,region,country,original_inviter_id,current_leader_id,onboarding_status,created_at,updated_at&limit=1"
        : SUPABASE_URL+"/rest/v1/profile_connection_cards?profile_id=eq."+safeId+"&select=profile_id,first_name,last_initial,city,region,country,updated_at&limit=1",
      {headers:h}
    ),
    fetch(SUPABASE_URL+"/rest/v1/profile_tags?profile_id=eq."+safeId+"&select=tag_id,source,created_at",{headers:h}),
    fetch(SUPABASE_URL+"/rest/v1/tags?select=id,slug,label,category",{headers:h}),
    ministry
      ? fetch(SUPABASE_URL+"/rest/v1/faith_profiles?profile_id=eq."+safeId+"&select=faith_stage,church_background,ministry_experience,growth_interests,wants_group,wants_host,preferred_connection,updated_at&limit=1",{headers:h})
      : Promise.resolve(null),
    ministry
      ? fetch(SUPABASE_URL+"/rest/v1/course_enrollments?profile_id=eq."+safeId+"&select=id,course_id,status,enrolled_at,completed_at&order=enrolled_at.desc",{headers:h})
      : Promise.resolve(null),
    ministry
      ? fetch(SUPABASE_URL+"/rest/v1/lesson_progress?profile_id=eq."+safeId+"&select=lesson_id,status,worksheet_status,last_position_seconds,watched_seconds,started_at,last_activity_at,completed_at&order=last_activity_at.desc",{headers:h})
      : Promise.resolve(null),
    ministry
      ? fetch(SUPABASE_URL+"/rest/v1/media_progress?profile_id=eq."+safeId+"&select=asset_id,last_position_seconds,played_seconds,percent_watched,last_activity_at,completed_at&order=last_activity_at.desc&limit=1000",{headers:h})
      : Promise.resolve(null),
    fetch(SUPABASE_URL+"/rest/v1/leader_assignments?member_id=eq."+safeId+"&select=leader_id,assignment_type,status,assigned_at,ended_at,updated_at&order=assigned_at.desc",{headers:h}),
    fetch(SUPABASE_URL+"/rest/v1/group_members?profile_id=eq."+safeId+"&select=group_id,role,status,joined_at",{headers:h}),
    ministry
      ? fetch(SUPABASE_URL+"/rest/v1/founders50_applications?profile_id=eq."+safeId+"&select=id,status,city,region,country,church_affiliation,gathering_place,invite_count,why_interested,what_excites_you,share_with_five,gather_weekly,training_willingness,created_at,updated_at&order=created_at.desc",{headers:h})
      : Promise.resolve(null),
    ministry
      ? fetch(SUPABASE_URL+"/rest/v1/follow_up_tasks?subject_profile_id=eq."+safeId+"&select=id,assigned_to,task_type,status,due_at,notes,context_type,context_id,created_at,completed_at&order=created_at.desc&limit=100",{headers:h})
      : Promise.resolve(null),
    fetch(SUPABASE_URL+"/rest/v1/member_staff_notes?profile_id=eq."+safeId+"&select=id,author_id,visibility,note_type,body,created_at,updated_at&order=created_at.desc&limit=100",{headers:h}),
    finance
      ? fetch(SUPABASE_URL+"/rest/v1/gifts?profile_id=eq."+safeId+"&select=id,provider,amount_cents,currency,status,designation,campaign,received_at,created_at&order=created_at.desc&limit=100",{headers:h})
      : Promise.resolve(null),
    fetch(SUPABASE_URL+"/rest/v1/entitlements?profile_id=eq."+safeId+"&select=id,product_id,reason,source_ref,granted_at&order=granted_at.desc",{headers:h})
  ];

  const [
    profileRes,
    profileTagsRes,
    tagsRes,
    faithRes,
    enrollmentRes,
    progressRes,
    mediaRes,
    leaderRes,
    groupMembershipRes,
    foundersRes,
    tasksRes,
    notesRes,
    giftsRes,
    entitlementsRes
  ]=await Promise.all(requests);

  const rawProfile=profileRes.ok?(await profileRes.json())?.[0]||null:null;
  if(!rawProfile)return json({error:"Person not found or not available to your role."},404);

  const profile=elevated
    ? rawProfile
    : {
        id:rawProfile.profile_id,
        first_name:rawProfile.first_name,
        last_name:rawProfile.last_initial?String(rawProfile.last_initial)+".":"",
        email:null,
        phone:null,
        city:rawProfile.city,
        region:rawProfile.region,
        country:rawProfile.country,
        original_inviter_id:null,
        current_leader_id:null,
        onboarding_status:null,
        created_at:null,
        updated_at:rawProfile.updated_at
      };

  const tags=tagsRes.ok?await tagsRes.json():[];
  const profileTags=profileTagsRes.ok?await profileTagsRes.json():[];
  const tagMap=Object.fromEntries(tags.map(t=>[t.id,t]));

  const leaderAssignments=leaderRes.ok?await leaderRes.json():[];
  const groupMemberships=groupMembershipRes.ok?await groupMembershipRes.json():[];
  const relatedIds=[
    profile.original_inviter_id,
    ...leaderAssignments.map(x=>x.leader_id)
  ].filter(Boolean);

  let relatedPeople=[];
  if(relatedIds.length){
    const rp=await fetch(
      SUPABASE_URL+"/rest/v1/profile_connection_cards?profile_id=in.("+[...new Set(relatedIds)].join(",")+")&select=profile_id,first_name,last_initial,city,region,country",
      {headers:h}
    );
    relatedPeople=rp.ok?await rp.json():[];
  }
  const relatedMap=Object.fromEntries(relatedPeople.map(p=>[p.profile_id,p]));

  let groups=[];
  const groupIds=groupMemberships.map(g=>g.group_id);
  if(groupIds.length){
    const gr=await fetch(
      SUPABASE_URL+"/rest/v1/groups?id=in.("+groupIds.join(",")+")&select=id,name,leader_id,city,region,country,status",
      {headers:h}
    );
    groups=gr.ok?await gr.json():[];
  }
  const groupMap=Object.fromEntries(groups.map(g=>[g.id,g]));

  let lessons=[],assets=[],courses=[],products=[];
  if(ministry){
    const enrollments=enrollmentRes?.ok?await enrollmentRes.json():[];
    const courseIds=[...new Set(enrollments.map(e=>e.course_id))];
    if(courseIds.length){
      const cr=await fetch(
        SUPABASE_URL+"/rest/v1/courses?id=in.("+courseIds.join(",")+")&select=id,slug,title,status",
        {headers:h}
      );
      courses=cr.ok?await cr.json():[];
      const lr=await fetch(
        SUPABASE_URL+"/rest/v1/lessons?course_id=in.("+courseIds.join(",")+")&select=id,course_id,position,slug,title",
        {headers:h}
      );
      lessons=lr.ok?await lr.json():[];
      const lessonIds=lessons.map(l=>l.id);
      if(lessonIds.length){
        const ar=await fetch(
          SUPABASE_URL+"/rest/v1/lesson_assets?lesson_id=in.("+lessonIds.join(",")+")&select=id,lesson_id,asset_type,title,provider,status",
          {headers:h}
        );
        assets=ar.ok?await ar.json():[];
      }
    }
  }

  const entitlements=entitlementsRes.ok?await entitlementsRes.json():[];
  const productIds=[...new Set(entitlements.map(e=>e.product_id))];
  if(productIds.length){
    const pr=await fetch(
      SUPABASE_URL+"/rest/v1/products?id=in.("+productIds.join(",")+")&select=id,slug,title,product_type,status",
      {headers:h}
    );
    products=pr.ok?await pr.json():[];
  }

  const enrollmentRows=ministry&&enrollmentRes?.ok?await enrollmentRes.json():[];
  const progressRows=ministry&&progressRes?.ok?await progressRes.json():[];
  const mediaRows=ministry&&mediaRes?.ok?await mediaRes.json():[];
  const lessonMap=Object.fromEntries(lessons.map(l=>[l.id,l]));
  const assetMap=Object.fromEntries(assets.map(a=>[a.id,a]));
  const courseMap=Object.fromEntries(courses.map(c=>[c.id,c]));
  const productMap=Object.fromEntries(products.map(p=>[p.id,p]));

  return json({
    roles,
    privacyMode:elevated?"full_admin":finance&&!ministry?"finance_limited":"ministry_limited",
    profile,
    inviter:profile.original_inviter_id?relatedMap[profile.original_inviter_id]||null:null,
    tags:profileTags.map(pt=>({...pt,tag:tagMap[pt.tag_id]||null})).filter(x=>x.tag),
    faith:ministry&&faithRes?.ok?(await faithRes.json())?.[0]||null:null,
    leaderAssignments:leaderAssignments.map(a=>({...a,leader:relatedMap[a.leader_id]||null})),
    groups:groupMemberships.map(m=>({...m,group:groupMap[m.group_id]||null})),
    founders:ministry&&foundersRes?.ok?await foundersRes.json():[],
    tasks:ministry&&tasksRes?.ok?await tasksRes.json():[],
    notes:notesRes.ok?await notesRes.json():[],
    gifts:finance&&giftsRes?.ok?await giftsRes.json():[],
    entitlements:entitlements.map(e=>({...e,product:productMap[e.product_id]||null})),
    courses:enrollmentRows.map(e=>({
      ...e,
      course:courseMap[e.course_id]||null,
      lessons:progressRows.filter(p=>lessonMap[p.lesson_id]?.course_id===e.course_id).map(p=>({...p,lesson:lessonMap[p.lesson_id]||null})),
      media:mediaRows.filter(mp=>lessonMap[assetMap[mp.asset_id]?.lesson_id]?.course_id===e.course_id).map(mp=>({...mp,asset:assetMap[mp.asset_id]||null,lesson:lessonMap[assetMap[mp.asset_id]?.lesson_id]||null}))
    }))
  },200,s.refreshed?sessionCookies(s.refreshed):[]);
};

export const config={path:"/api/lockliel/admin/person"};