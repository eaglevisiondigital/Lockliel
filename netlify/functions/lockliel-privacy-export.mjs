import {SUPABASE_URL,json,dbHeaders,requireSession} from "../lib/lockliel-core.mjs";

async function rows(url,headers){
  const response=await fetch(url,{headers});
  return response.ok?await response.json():[];
}

export default async(request)=>{
  if(request.method!=="GET")return json({error:"Method not allowed"},405);

  const s=await requireSession(request);
  if(!s.user||!s.access)return json({error:"Unauthorized"},401);

  const h=dbHeaders(s.access);
  const uid=encodeURIComponent(s.user.id);

  const [
    profiles,
    faithProfiles,
    preferences,
    tags,
    profileTags,
    enrollments,
    lessonProgress,
    mediaProgress,
    reachContacts,
    referrals,
    referralEvents,
    groupMemberships,
    leaderAssignments,
    founderApps,
    founderProgress,
    notifications,
    gifts,
    commitments,
    orders,
    entitlements,
    privacyRequests
  ]=await Promise.all([
    rows(SUPABASE_URL+"/rest/v1/profiles?id=eq."+uid+"&select=*",h),
    rows(SUPABASE_URL+"/rest/v1/faith_profiles?profile_id=eq."+uid+"&select=*",h),
    rows(SUPABASE_URL+"/rest/v1/communication_preferences?profile_id=eq."+uid+"&select=*",h),
    rows(SUPABASE_URL+"/rest/v1/tags?select=id,slug,label,category",h),
    rows(SUPABASE_URL+"/rest/v1/profile_tags?profile_id=eq."+uid+"&select=tag_id,source,created_at",h),
    rows(SUPABASE_URL+"/rest/v1/course_enrollments?profile_id=eq."+uid+"&select=*",h),
    rows(SUPABASE_URL+"/rest/v1/lesson_progress?profile_id=eq."+uid+"&select=*",h),
    rows(SUPABASE_URL+"/rest/v1/media_progress?profile_id=eq."+uid+"&select=*",h),
    rows(SUPABASE_URL+"/rest/v1/reach_contacts?owner_id=eq."+uid+"&select=*",h),
    rows(SUPABASE_URL+"/rest/v1/referral_links?owner_id=eq."+uid+"&select=id,code,campaign,content_type,content_id,destination_path,created_at,active",h),
    rows(SUPABASE_URL+"/rest/v1/referral_events?member_id=eq."+uid+"&select=event_type,occurred_at,metadata",h),
    rows(SUPABASE_URL+"/rest/v1/group_members?profile_id=eq."+uid+"&select=group_id,role,status,joined_at",h),
    rows(SUPABASE_URL+"/rest/v1/leader_assignments?member_id=eq."+uid+"&select=leader_id,assignment_type,status,assigned_at,ended_at",h),
    rows(SUPABASE_URL+"/rest/v1/founders50_applications?profile_id=eq."+uid+"&select=*",h),
    rows(SUPABASE_URL+"/rest/v1/founder_orientation_progress?profile_id=eq."+uid+"&select=step_id,completed_at,notes,updated_at",h),
    rows(SUPABASE_URL+"/rest/v1/notifications?profile_id=eq."+uid+"&select=notification_type,title,body,href,read_at,created_at",h),
    rows(SUPABASE_URL+"/rest/v1/gifts?profile_id=eq."+uid+"&select=provider,amount_cents,currency,status,designation,campaign,received_at,created_at",h),
    rows(SUPABASE_URL+"/rest/v1/partner_commitments?profile_id=eq."+uid+"&select=provider,cadence,amount_cents,currency,status,designation,campaign,started_at,cancelled_at,created_at",h),
    rows(SUPABASE_URL+"/rest/v1/orders?profile_id=eq."+uid+"&select=id,status,currency,subtotal_cents,shipping_cents,tax_cents,total_cents,delivery_method,created_at,paid_at,fulfilled_at",h),
    rows(SUPABASE_URL+"/rest/v1/entitlements?profile_id=eq."+uid+"&select=product_id,reason,source_ref,granted_at",h),
    rows(SUPABASE_URL+"/rest/v1/privacy_requests?profile_id=eq."+uid+"&select=request_type,status,member_note,requested_at,updated_at,resolved_at",h)
  ]);

  const tagMap=Object.fromEntries(tags.map(tag=>[tag.id,tag]));

  const payload={
    generated_at:new Date().toISOString(),
    account:{
      user_id:s.user.id,
      email:s.user.email,
      profile:profiles[0]||null
    },
    faith_profile:faithProfiles[0]||null,
    communication_preferences:preferences[0]||null,
    tags:profileTags.map(item=>({
      source:item.source,
      created_at:item.created_at,
      tag:tagMap[item.tag_id]||{id:item.tag_id}
    })),
    discipleship:{
      enrollments,
      lesson_progress:lessonProgress,
      media_progress:mediaProgress
    },
    my_five:reachContacts,
    invitation_activity:{
      links:referrals,
      signup_or_member_events:referralEvents
    },
    ministry_relationships:{
      groups:groupMemberships,
      leader_assignments:leaderAssignments
    },
    founders50:{
      applications:founderApps,
      orientation_progress:founderProgress
    },
    notifications,
    giving:{
      gifts,
      partner_commitments:commitments
    },
    orders,
    resource_entitlements:entitlements,
    privacy_requests:privacyRequests,
    exclusions:[
      "Private staff-only notes are not part of the member-facing export.",
      "Security secrets, password hashes, authenticator secrets and server credentials are never included.",
      "Internal anti-abuse and infrastructure logs are not included in this self-service export."
    ]
  };

  const filename="lockliel-data-"+new Date().toISOString().slice(0,10)+".json";
  return new Response(JSON.stringify(payload,null,2),{
    status:200,
    headers:{
      "Content-Type":"application/json; charset=utf-8",
      "Content-Disposition":'attachment; filename="'+filename+'"',
      "Cache-Control":"private, no-store",
      "X-Content-Type-Options":"nosniff"
    }
  });
};

export const config={
  path:"/api/lockliel/privacy-export",
  rateLimit:{windowLimit:10,windowSize:60,aggregateBy:["ip"]}
};