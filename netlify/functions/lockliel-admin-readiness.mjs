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
    const verified=Boolean(b.verified);
    const allowed=["auth_url_configuration","custom_smtp"];

    if(!allowed.includes(key)){
      return json({error:"Unknown launch verification."},400);
    }

    const r=await fetch(
      SUPABASE_URL+"/rest/v1/launch_verifications?key=eq."+encodeURIComponent(key),
      {
        method:"PATCH",
        headers:{...h,Prefer:"return=representation"},
        body:JSON.stringify({
          verified,
          note:String(b.note||"").trim().slice(0,3000)||null
        })
      }
    );

    if(!r.ok)return json({error:"Unable to update launch verification."},r.status);

    return json(
      {ok:true,verification:(await r.json())?.[0]||null},
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
    coursesRes,
    lessonsRes,
    assetsRes,
    productsRes,
    rolesRes,
    verificationRes
  ]=await Promise.all([
    fetch(
      SUPABASE_URL+"/rest/v1/feature_flags?select=key,enabled,description&order=key.asc",
      {headers:h}
    ),
    fetch(
      SUPABASE_URL+"/rest/v1/payment_provider_connections?select=provider,label,status,supports_one_time,supports_recurring&order=label.asc",
      {headers:h}
    ),
    fetch(
      SUPABASE_URL+"/rest/v1/courses?select=id,slug,title,status&order=created_at.asc",
      {headers:h}
    ),
    fetch(
      SUPABASE_URL+"/rest/v1/lessons?select=id,course_id,position,worksheet_schema&order=position.asc&limit=5000",
      {headers:h}
    ),
    fetch(
      SUPABASE_URL+"/rest/v1/lesson_assets?select=id,lesson_id,asset_type,status,provider,storage_path&limit=5000",
      {headers:h}
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
    )
  ]);

  const flags=flagsRes.ok?await flagsRes.json():[];
  const providers=providersRes.ok?await providersRes.json():[];
  const courses=coursesRes.ok?await coursesRes.json():[];
  const lessons=lessonsRes.ok?await lessonsRes.json():[];
  const assets=assetsRes.ok?await assetsRes.json():[];
  const products=productsRes.ok?await productsRes.json():[];
  const staffRoles=rolesRes.ok?await rolesRes.json():[];
  const verifications=verificationRes.ok?await verificationRes.json():[];

  const flagMap=Object.fromEntries(flags.map(f=>[f.key,f.enabled]));
  const verificationMap=Object.fromEntries(verifications.map(v=>[v.key,v]));

  const activeProvider=providers.find(p=>p.status==="active")||null;
  const gripCourse=courses.find(c=>c.slug==="getting-a-grip-on-the-basics")||null;
  const gripLessons=gripCourse?lessons.filter(l=>l.course_id===gripCourse.id):[];
  const gripLessonIds=new Set(gripLessons.map(l=>l.id));
  const gripAssets=assets.filter(a=>gripLessonIds.has(a.lesson_id));

  const gripVideos=gripAssets.filter(
    a=>a.asset_type==="video"&&a.status==="active"
  ).length;

  const gripPrivatePdfs=gripAssets.filter(
    a=>a.asset_type==="pdf"&&a.status==="active"&&a.storage_path
  ).length;

  const gripStructuredLessons=gripLessons.filter(lesson=>{
    const questions=lesson.worksheet_schema?.questions;
    return Array.isArray(questions)&&questions.length>0;
  }).length;

  const gripEngineReady=
    Boolean(gripCourse) &&
    gripLessons.length===13 &&
    gripStructuredLessons===13 &&
    gripVideos>=10;

  const gripWorkbooksReady=gripPrivatePdfs===13;
  const gripPublished=gripCourse?.status==="published";

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
      ready:Boolean(verificationMap.auth_url_configuration?.verified),
      manual:true,
      manualKey:"auth_url_configuration",
      detail:"Verify Site URL = https://lockliel.com. Allow exact production redirects for https://lockliel.com/my-lockliel/sign-in and https://lockliel.com/my-lockliel/reset-password. For Netlify previews, allow https://**--lockliel.netlify.app/**."
    },
    {
      key:"custom_smtp",
      label:"Production Auth email delivery",
      ready:Boolean(verificationMap.custom_smtp?.verified),
      manual:true,
      manualKey:"custom_smtp",
      detail:"Verify custom SMTP is configured for production confirmation and password-recovery email delivery."
    },
    {
      key:"super_admin",
      label:"Initial super administrator",
      ready:hasSuperAdmin,
      manual:false,
      detail:hasSuperAdmin
        ?"A super administrator account is assigned."
        :"Create the first real member account, then assign its staff role to super_admin directly in Supabase."
    },
    {
      key:"grip_engine",
      label:"Getting a Grip course engine",
      ready:gripEngineReady,
      manual:false,
      detail:gripLessons.length+" of 13 lessons • "+gripStructuredLessons+" structured worksheet/note experiences • "+gripVideos+" active video assets"
    },
    {
      key:"grip_workbooks",
      label:"Getting a Grip private workbook library",
      ready:gripWorkbooksReady,
      manual:false,
      detail:gripPrivatePdfs+" of 13 private lesson PDFs are active in Lockliel storage."
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
      key:"digital_book",
      label:"A Heart for the Lost digital delivery",
      ready:Boolean(digitalBook?.storage_path),
      manual:false,
      detail:digitalBook?.storage_path
        ?"Protected PDF is uploaded."
        :"Digital product exists, but the final corrected protected PDF still needs to be uploaded."
    },
    {
      key:"giving_provider",
      label:"Live giving processor",
      ready:Boolean(activeProvider),
      manual:false,
      detail:activeProvider
        ?activeProvider.label+" is active."
        :"No payment provider is active yet. Authorize.Net, Stripe, PayPal and Square are modeled but not connected."
    },
    {
      key:"partner_checkout",
      label:"Live partner checkout switch",
      ready:Boolean(flagMap.partner_checkout)&&Boolean(activeProvider),
      manual:false,
      detail:flagMap.partner_checkout
        ?"Feature flag is on."
        :"Feature flag remains off until the processor is connected and tested."
    },
    {
      key:"book_benefit",
      label:"$20 book benefit",
      ready:Boolean(flagMap.heart_book_gift_benefit)&&Boolean(digitalBook?.storage_path),
      manual:false,
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

  return json({
    checks,
    verifications,
    readyCount:checks.filter(c=>c.ready).length,
    totalCount:checks.length
  },200,s.refreshed?sessionCookies(s.refreshed):[]);
};

export const config={path:"/api/lockliel/admin/readiness"};