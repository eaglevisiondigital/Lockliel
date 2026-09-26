import {SUPABASE_URL,json,dbHeaders,requireSession,sessionCookies,sessionAal} from "../lib/lockliel-core.mjs";

export default async(request)=>{
  const s=await requireSession(request);
  if(!s.user||!s.access)return json({error:"Unauthorized"},401);
  if(sessionAal(s.access)!=="aal2")return json({error:"Multi-factor authentication required.",code:"mfa_required"},403);

  const h=dbHeaders(s.access);
  const uid=encodeURIComponent(s.user.id);

  const roleRes=await fetch(
    SUPABASE_URL+"/rest/v1/staff_roles?profile_id=eq."+uid+"&select=role",
    {headers:h}
  );
  const roles=roleRes.ok?(await roleRes.json()).map(r=>r.role):[];
  if(!roles.some(r=>["super_admin","admin"].includes(r))){
    return json({error:"Administrator access required"},403);
  }

  if(request.method==="POST"){
    const b=await request.json().catch(()=>({}));
    const key=String(b.key||"");
    if(typeof b.verified!=="boolean")return json({error:"Verification must be true or false."},400);
    const verified=b.verified;
    const note=String(b.note||"").trim().slice(0,3000);
    const allowed=["auth_url_configuration","custom_smtp"];

    if(!allowed.includes(key)){
      return json({error:"Unknown launch verification."},400);
    }

    if(verified&&note.length<20){
      return json({error:"Verified launch checks require a verification note of at least 20 characters."},400);
    }

    const r=await fetch(
      SUPABASE_URL+"/rest/v1/launch_verifications?key=eq."+encodeURIComponent(key),
      {
        method:"PATCH",
        headers:{...h,Prefer:"return=representation"},
        body:JSON.stringify({
          verified,
          note:note||null
        })
      }
    );

    if(!r.ok)return json({error:"Unable to update launch verification."},r.status);

    const rows=await r.json().catch(()=>null);
    if(!Array.isArray(rows)||rows.length!==1||rows[0]?.key!==key||rows[0]?.verified!==verified){
      return json({error:"Launch verification update could not be confirmed."},502);
    }
    return json(
      {ok:true,verification:rows[0]},
      200,
      s.refreshed?sessionCookies(s.refreshed):[]
    );
  }

  if(request.method!=="GET"){
    return json({error:"Method not allowed"},405);
  }

  const [
    flagsRes,
    providersRes,
    gripRes,
    productsRes,
    rolesRes,
    verificationRes,
    integrityRes
  ]=await Promise.all([
    fetch(
      SUPABASE_URL+"/rest/v1/feature_flags?select=key,enabled,description&order=key.asc",
      {headers:h}
    ),
    fetch(
      SUPABASE_URL+"/rest/v1/payment_provider_connections?select=provider,label,status,supports_one_time,supports_recurring,checkout_adapter_ready,webhook_ready,last_verified_at&order=label.asc",
      {headers:h}
    ),
    fetch(
      SUPABASE_URL+"/rest/v1/rpc/lockliel_grip_readiness",
      {
        method:"POST",
        headers:{...h,"Content-Type":"application/json"},
        body:"{}"
      }
    ),
    fetch(
      SUPABASE_URL+"/rest/v1/products?select=id,slug,title,product_type,status,storage_path&order=created_at.asc",
      {headers:h}
    ),
    fetch(
      SUPABASE_URL+"/rest/v1/staff_roles?select=profile_id,role",
      {headers:h}
    ),
    fetch(
      SUPABASE_URL+"/rest/v1/launch_verifications?select=key,label,verified,verified_by,verified_at,note,updated_at&order=key.asc",
      {headers:h}
    ),
    fetch(
      SUPABASE_URL+"/rest/v1/rpc/lockliel_integrity_health",
      {
        method:"POST",
        headers:{...h,"Content-Type":"application/json"},
        body:"{}"
      }
    )
  ]);

  const flags=flagsRes.ok?await flagsRes.json():[];
  const providers=providersRes.ok?await providersRes.json():[];
  const gripReadiness=gripRes.ok?await gripRes.json():null;
  const products=productsRes.ok?await productsRes.json():[];
  const staffRoles=rolesRes.ok?await rolesRes.json():[];
  const verifications=verificationRes.ok?await verificationRes.json():[];
  const integrityPayload=integrityRes.ok?await integrityRes.json().catch(()=>null):null;
  const integrityValid=integrityPayload!==null&&typeof integrityPayload==="object"&&!Array.isArray(integrityPayload)
    &&typeof integrityPayload.healthy==="boolean"
    &&["issue_count","security_issue_count","media_evidence_issue_count"].every(key=>Number.isSafeInteger(integrityPayload[key])&&integrityPayload[key]>=0)
    &&integrityPayload.healthy===(integrityPayload.issue_count===0)
    &&integrityPayload.issue_count>=integrityPayload.security_issue_count+integrityPayload.media_evidence_issue_count
    &&Object.entries(integrityPayload).every(([key,value])=>key==="healthy"||(Number.isSafeInteger(value)&&value>=0&&(integrityPayload.issue_count!==0||value===0)));
  const integrityHealth=integrityValid?integrityPayload:null;

  const integrityIssueLabels=integrityHealth
    ? [
        ["profiles_without_journey","member journey rows"],
        ["reach_count_mismatches","reach counters"],
        ["connection_count_mismatches","connection counters"],
        ["ineligible_primary_group_leaders","primary group leaders"],
        ["ineligible_group_leadership_memberships","group leader/host memberships"],
        ["primary_leader_membership_mismatches","primary leader memberships"],
        ["checkout_state_mismatch","checkout state"],
        ["digital_book_release_mismatch","digital book release state"],
        ["book_benefit_release_mismatch","book benefit release state"],
        ["financial_cross_link_mismatches","financial record links"],
        ["financial_temporal_mismatches","financial lifecycle timestamps"],
        ["media_progress_payload_mismatches","media progress evidence"],
        ["public_tables_without_rls","public tables without RLS"],
        ["public_views_without_security_invoker","public views bypassing caller security"],
        ["anonymous_public_table_grants","anonymous Data API grants"],
        ["unexpected_private_function_execute","private function execute exposure"],
        ["unvalidated_constraints","unvalidated database constraints"],
        ["course_enrollment_mismatches","course enrollment lifecycle"],
        ["referral_identity_mismatches","referral attribution identity"],
        ["duplicate_unreferenced_lead_attribution","duplicate CRM attribution"],
        ["protected_storage_mismatches","protected Storage references"],
        ["verified_media_evidence_mismatches","verified media watch evidence"]
      ].filter(([key])=>Number(integrityHealth?.[key]||0)>0)
       .map(([,label])=>label)
    : [];

  const flagMap=Object.fromEntries(flags.map(f=>[f.key,f.enabled]));
  const verificationMap=Object.fromEntries(verifications.map(v=>[v.key,v]));

  const activeProvider=providers.find(p=>p.status==="active"&&p.checkout_adapter_ready===true&&p.webhook_ready===true)||null;
  const gripEngineReady=gripReadiness?.release_ready===true;
  const gripWorkbooksReady=Number(gripReadiness?.private_workbook_lessons||0)===13;
  const gripPublished=gripReadiness?.published===true;
  const gripVideoDurationTotal=Number(gripReadiness?.video_assets_total||0);
  const gripVideoDurationVerified=Number(gripReadiness?.video_assets_with_verified_duration||0);

  const digitalBook=products.find(
    p=>p.slug==="a-heart-for-the-lost-digital"
  )||null;

  const hasSuperAdmin=staffRoles.some(r=>r.role==="super_admin");

  const checks=[
    {
      key:"database",
      label:"Dedicated Lockliel database",
      ready:true,
      manual:false,
      detail:"Separate Supabase project, RLS, member data, admin data and audit history are in place."
    },
    {
      key:"database_integrity",
      label:"Database integrity health",
      ready:integrityHealth?.healthy===true,
      manual:false,
      detail:integrityHealth?.healthy
        ?"No detected drift in RLS exposure, private-function access, protected Storage, member journey counters, group leadership, referral/CRM attribution, course enrollment, verified media watch evidence, release-control state, financial relationships, lifecycle timestamps, or media-progress payloads."
        :integrityHealth
          ?Number(integrityHealth.issue_count||0)+" integrity issue"+(Number(integrityHealth.issue_count||0)===1?"":"s")+" detected"+(integrityIssueLabels.length?": "+integrityIssueLabels.join(", "):".")
          :"Integrity health check could not be completed."
    },
    {
      key:"auth_code",
      label:"My Lockliel account code",
      ready:true,
      manual:false,
      detail:"Signup, sign-in, session refresh, confirmation handoff and password recovery are built."
    },
    {
      key:"staff_mfa",
      label:"Privileged staff MFA enforcement",
      ready:true,
      manual:false,
      detail:"Admin, finance, content, Founders review, discipleship administration and fulfillment permissions require an AAL2 session. Staff enroll and verify TOTP through My Lockliel Security."
    },
    {
      key:"auth_url_configuration",
      label:"Supabase Auth URL configuration",
      ready:verificationMap.auth_url_configuration?.verified===true,
      manual:true,
      manualKey:"auth_url_configuration",
      note:verificationMap.auth_url_configuration?.note||"",
      detail:"Verify Site URL = https://lockliel.com. Allow exact production redirects for https://lockliel.com/my-lockliel/sign-in and https://lockliel.com/my-lockliel/reset-password. For Netlify previews, allow https://**--lockliel.netlify.app/**."
    },
    {
      key:"custom_smtp",
      label:"Production Auth email delivery",
      ready:verificationMap.custom_smtp?.verified===true,
      manual:true,
      manualKey:"custom_smtp",
      note:verificationMap.custom_smtp?.note||"",
      detail:"Verify custom SMTP is configured for production confirmation and password-recovery email delivery."
    },
    {
      key:"super_admin",
      label:"Initial super administrator",
      ready:hasSuperAdmin,
      manual:false,
      detail:hasSuperAdmin
        ?"A super administrator account is assigned."
        :"Create and confirm the first real member account, then run app_private.bootstrap_first_super_admin(profile_uuid) from the Supabase SQL Editor. The helper refuses to run after a super administrator already exists."
    },
    {
      key:"grip_engine",
      label:"Getting a Grip course engine",
      ready:gripEngineReady,
      manual:false,
      detail:Number(gripReadiness?.lesson_count||0)+" of 13 lessons • "+Number(gripReadiness?.structured_lessons||0)+" structured worksheet/note experiences • "+Number(gripReadiness?.playable_video_lessons||0)+" distinct lessons with playable teaching video"
    },
    {
      key:"grip_workbooks",
      label:"Getting a Grip private workbook library",
      ready:gripWorkbooksReady,
      manual:false,
      detail:Number(gripReadiness?.private_workbook_lessons||0)+" of 13 protected lesson workbooks are present in Lockliel storage."
    },
    {
      key:"grip_published",
      label:"Getting a Grip release status",
      ready:gripPublished,
      manual:false,
      detail:gripPublished
        ?"Course is published."
        :"Course remains in draft until the private workbook library is imported and reviewed."
    },
    {
      key:"grip_video_durations",
      label:"Verified teaching video durations",
      ready:gripVideoDurationTotal>0&&gripVideoDurationVerified===gripVideoDurationTotal,
      manual:false,
      required:false,
      detail:gripVideoDurationVerified+" of "+gripVideoDurationTotal+" active YouTube teaching assets have a verified duration. Verified assets derive watched percent from interval evidence instead of trusting a browser-supplied percentage."
    },
    {
      key:"digital_book",
      label:"A Heart for the Lost digital delivery",
      ready:Boolean(
        digitalBook?.storage_path &&
        digitalBook?.status==="active" &&
        flagMap.digital_book_delivery
      ),
      manual:false,
      detail:!digitalBook?.storage_path
        ?"Digital product exists, but the final corrected protected PDF still needs to be uploaded."
        :digitalBook?.status!=="active"
          ?"Protected PDF is present, but the digital product is not active yet."
          :!flagMap.digital_book_delivery
            ?"Protected PDF and product are ready, but the digital delivery release switch is still off."
            :"Protected PDF, active product, and member delivery switch are all ready."
    },
    {
      key:"giving_provider",
      label:"Live giving processor",
      ready:Boolean(activeProvider),
      manual:false,
      detail:activeProvider
        ?activeProvider.label+" is active with checkout adapter and webhook verification complete."
        :"No payment provider has completed all three launch gates yet: active connection, checkout adapter, and webhook verification."
    },
    {
      key:"partner_checkout",
      label:"Live partner checkout switch",
      ready:Boolean(flagMap.partner_checkout)&&Boolean(activeProvider),
      manual:false,
      detail:Boolean(flagMap.partner_checkout)&&Boolean(activeProvider)
        ?"Feature flag is on and the verified payment path is ready."
        :flagMap.partner_checkout
          ?"Feature flag is on, but checkout remains blocked because the provider has not completed all technical readiness gates."
          :"Feature flag remains off until the processor, checkout adapter, and webhook are connected and tested."
    },
    {
      key:"book_benefit",
      label:"$20 book benefit",
      ready:Boolean(flagMap.heart_book_gift_benefit)&&Boolean(digitalBook?.storage_path),
      manual:false,
      required:false,
      detail:flagMap.heart_book_gift_benefit
        ?"Benefit is active."
        :"Benefit automation is built but intentionally not activated."
    },
    {
      key:"founders50",
      label:"Founders 50 intake",
      ready:Boolean(flagMap.founders50_public_recruiting),
      manual:false,
      detail:flagMap.founders50_public_recruiting
        ?"Applications are operationally open."
        :"Founders 50 recruiting is currently paused."
    },
    {
      key:"messaging",
      label:"Private internal messaging",
      ready:Boolean(flagMap.internal_messaging),
      manual:false,
      detail:flagMap.internal_messaging
        ?"Inviter and assigned-leader messaging is enabled."
        :"Messaging is currently disabled."
    }
  ];

  const requiredChecks=checks.filter(c=>c.required!==false);
  const optionalChecks=checks.filter(c=>c.required===false);
  const blockers=requiredChecks.filter(c=>!c.ready);

  return json({
    checks,
    verifications,
    integrityHealth,
    readyCount:requiredChecks.filter(c=>c.ready).length,
    totalCount:requiredChecks.length,
    blockerCount:blockers.length,
    optionalReadyCount:optionalChecks.filter(c=>c.ready).length,
    optionalCount:optionalChecks.length
  },200,s.refreshed?sessionCookies(s.refreshed):[]);
};

export const config={path:"/api/lockliel/admin/readiness"};