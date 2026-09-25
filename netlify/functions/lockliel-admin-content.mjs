import {
  SUPABASE_URL,
  SUPABASE_KEY,
  json,
  dbHeaders,
  requireSession,
  sessionCookies,sessionAal} from "../lib/lockliel-core.mjs";

function safeHttpsUrl(value){
  if(!value)return null;
  try{
    const url=new URL(String(value));
    if(url.protocol!=="https:"||url.username||url.password)return null;
    return url.toString();
  }catch{
    return null;
  }
}

const GRIP_PDFS={
  "getting-a-grip/lesson-01.pdf":"getting-a-grip-lesson-1-how-to-become-a-christian.pdf",
  "getting-a-grip/lesson-02.pdf":"getting-a-grip-lesson-2-how-to-be-sure-you-are-a-christian.pdf",
  "getting-a-grip/lesson-03.pdf":"getting-a-grip-lesson-3-how-to-develop-your-relationship-with-god.pdf",
  "getting-a-grip/lesson-04.pdf":"getting-a-grip-lesson-4-how-to-talk-to-god.pdf",
  "getting-a-grip/lesson-05.pdf":"getting-a-grip-lesson-5-how-to-hear-from-god.pdf",
  "getting-a-grip/lesson-06.pdf":"getting-a-grip-lesson-6-how-to-obey-god.pdf",
  "getting-a-grip/lesson-07.pdf":"getting-a-grip-lesson-7-how-to-experience-gods-love-and-forgiveness.pdf",
  "getting-a-grip/lesson-08.pdf":"getting-a-grip-lesson-8-how-to-be-filled-with-the-holy-spirit.pdf",
  "getting-a-grip/lesson-09.pdf":"getting-a-grip-lesson-9-how-to-be-sure-you-are-filled-with-the-spirit.pdf",
  "getting-a-grip/lesson-10.pdf":"getting-a-grip-lesson-10-how-to-grow-and-develop-your-faith.pdf",
  "getting-a-grip/lesson-11.pdf":"getting-a-grip-lesson-11-how-to-experience-the-abundant-life.pdf",
  "getting-a-grip/lesson-12.pdf":"getting-a-grip-lesson-12-how-to-be-an-overcomer.pdf",
  "getting-a-grip/lesson-13.pdf":"getting-a-grip-lesson-13-how-to-serve-god.pdf"
};

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
  if(!roles.some(r=>["super_admin","admin","discipleship_admin","content_admin"].includes(r))){
    return json({error:"Content administration access required"},403);
  }

  if(request.method==="POST"){
    const b=await request.json().catch(()=>({}));

    if(b.action==="createAsset"){
      const lessonId=String(b.lessonId||"");
      const assetType=String(b.assetType||"");
      const title=String(b.title||"").trim();
      const provider=String(b.provider||"").trim()||null;
      const providerRef=String(b.providerRef||"").trim()||null;
      const rawExternalUrl=String(b.externalUrl||"").trim()||null;
      const externalUrl=rawExternalUrl?safeHttpsUrl(rawExternalUrl):null;
      const storagePath=String(b.storagePath||"").trim()||null;
      const duration=Number(b.durationSeconds)||null;

      if(!lessonId||!["video","audio","pdf","worksheet","external_link"].includes(assetType)){
        return json({error:"Lesson and asset type are required."},400);
      }
      if(rawExternalUrl&&!externalUrl){
        return json({error:"External lesson URLs must use HTTPS without embedded credentials."},400);
      }
      if(!providerRef&&!externalUrl&&!storagePath){
        return json({error:"Add a provider reference, external URL, or storage path."},400);
      }

      const r=await fetch(SUPABASE_URL+"/rest/v1/lesson_assets",{
        method:"POST",
        headers:{...h,Prefer:"return=representation"},
        body:JSON.stringify({
          lesson_id:lessonId,
          asset_type:assetType,
          title:title||null,
          provider,
          provider_ref:providerRef,
          external_url:externalUrl,
          storage_path:storagePath,
          duration_seconds:duration,
          status:"active"
        })
      });
      if(!r.ok)return json({error:"Unable to add lesson asset."},r.status);
      return json({ok:true,asset:(await r.json())?.[0]||null},200,s.refreshed?sessionCookies(s.refreshed):[]);
    }

    if(b.action==="setCourseStatus"){
      const courseId=String(b.courseId||"");
      const status=String(b.status||"");
      if(!courseId||!["draft","published","archived"].includes(status)){
        return json({error:"Invalid course status."},400);
      }

      const r=await fetch(
        SUPABASE_URL+"/rest/v1/courses?id=eq."+encodeURIComponent(courseId),
        {
          method:"PATCH",
          headers:{...h,Prefer:"return=representation"},
          body:JSON.stringify({status})
        }
      );
      if(!r.ok)return json({error:"Unable to update course."},r.status);
      return json({ok:true},200,s.refreshed?sessionCookies(s.refreshed):[]);
    }

    if(b.action==="importGripPdfs"){
      const results=[];

      for(const [storagePath,fileName] of Object.entries(GRIP_PDFS)){
        try{
          const sourceUrl="https://raw.githubusercontent.com/eaglevisiondigital/championlife/main/assets/downloads/grip/"+fileName;
          const source=await fetch(sourceUrl);
          if(!source.ok)throw new Error("Source returned "+source.status);

          const bytes=await source.arrayBuffer();
          const uploadPath=storagePath.split("/").map(encodeURIComponent).join("/");
          const upload=await fetch(
            SUPABASE_URL+"/storage/v1/object/lesson-assets/"+uploadPath,
            {
              method:"POST",
              headers:{
                apikey:SUPABASE_KEY,
                Authorization:"Bearer "+s.access,
                "Content-Type":"application/pdf",
                "x-upsert":"true"
              },
              body:bytes
            }
          );

          if(!upload.ok){
            const detail=await upload.text().catch(()=>"");
            throw new Error("Storage returned "+upload.status+" "+detail.slice(0,140));
          }

          const patch=await fetch(
            SUPABASE_URL+"/rest/v1/lesson_assets?storage_path=eq."+encodeURIComponent(storagePath),
            {
              method:"PATCH",
              headers:{...h,Prefer:"return=minimal"},
              body:JSON.stringify({status:"active"})
            }
          );
          if(!patch.ok)throw new Error("Uploaded but could not activate asset");

          results.push({storagePath,ok:true,size:bytes.byteLength});
        }catch(error){
          results.push({storagePath,ok:false,error:error instanceof Error?error.message:String(error)});
        }
      }

      return json({
        ok:results.every(r=>r.ok),
        imported:results.filter(r=>r.ok).length,
        total:results.length,
        results
      },results.every(r=>r.ok)?200:207,s.refreshed?sessionCookies(s.refreshed):[]);
    }

    return json({error:"Unknown action"},400);
  }

  if(request.method!=="GET")return json({error:"Method not allowed"},405);

  const [cr,lr,ar]=await Promise.all([
    fetch(
      SUPABASE_URL+"/rest/v1/courses?select=id,slug,title,description,status,created_at&order=created_at.asc",
      {headers:h}
    ),
    fetch(
      SUPABASE_URL+"/rest/v1/lessons?select=id,course_id,position,slug,title,video_provider,video_ref,worksheet_schema&order=course_id.asc,position.asc",
      {headers:h}
    ),
    fetch(
      SUPABASE_URL+"/rest/v1/lesson_assets?select=id,lesson_id,asset_type,title,provider,provider_ref,storage_path,external_url,duration_seconds,sort_order,status,created_at&order=lesson_id.asc,sort_order.asc",
      {headers:h}
    )
  ]);

  return json({
    roles,
    courses:cr.ok?await cr.json():[],
    lessons:lr.ok?await lr.json():[],
    assets:ar.ok?await ar.json():[]
  },200,s.refreshed?sessionCookies(s.refreshed):[]);
};

export const config={path:"/api/lockliel/admin/content"};