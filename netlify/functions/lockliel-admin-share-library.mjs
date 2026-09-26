import {SUPABASE_URL,json,dbHeaders,requireSession,sessionCookies,sessionAal} from "../lib/lockliel-core.mjs";

const allowedAssetTypes=["faith_boost","graphic","book","course","invitation"];

export default async(request)=>{
  const s=await requireSession(request);
  if(!s.user||!s.access)return json({error:"Unauthorized"},401);
  if(sessionAal(s.access)!=="aal2"){
    return json({error:"Multi-factor authentication required.",code:"mfa_required"},403);
  }

  const h=dbHeaders(s.access);
  const rr=await fetch(
    SUPABASE_URL+"/rest/v1/staff_roles?profile_id=eq."+encodeURIComponent(s.user.id)+"&select=role",
    {headers:h}
  );
  const roles=rr.ok?(await rr.json()).map(r=>r.role):[];
  if(!roles.some(r=>["super_admin","admin","content_admin"].includes(r))){
    return json({error:"Content administration access required"},403);
  }

  if(request.method==="GET"){
    const r=await fetch(
      SUPABASE_URL+"/rest/v1/share_assets?select=id,slug,title,asset_type,description,share_text,category,preview_image_path,destination_path,status,featured,sort_order,language_code,translation_key,created_at,updated_at&order=featured.desc,sort_order.asc,title.asc",
      {headers:h}
    );
    return json({assets:r.ok?await r.json():[]},200,s.refreshed?sessionCookies(s.refreshed):[]);
  }

  if(request.method!=="POST")return json({error:"Method not allowed"},405);

  const b=await request.json().catch(()=>({}));
  const action=String(b.action||"");

  if(action==="create"){
    const slug=String(b.slug||"").trim().toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"");
    const title=String(b.title||"").trim();
    const destinationPath=String(b.destinationPath||"").trim();
    const assetType=String(b.assetType||"graphic").trim();

    if(!slug||!title||!destinationPath.startsWith("/")){
      return json({error:"Slug, title, and a Lockliel destination path are required."},400);
    }
    if(!allowedAssetTypes.includes(assetType)){
      return json({error:"Choose a valid Share Library asset type."},400);
    }

    const r=await fetch(SUPABASE_URL+"/rest/v1/share_assets",{
      method:"POST",
      headers:{...h,Prefer:"return=representation"},
      body:JSON.stringify({
        slug,
        title,
        asset_type:assetType,
        description:String(b.description||"").trim().slice(0,1000)||null,
        share_text:String(b.shareText||"").trim().slice(0,1200)||null,
        category:String(b.category||"").trim().slice(0,120)||null,
        preview_image_path:String(b.previewImagePath||"").trim().slice(0,500)||null,
        destination_path:destinationPath,
        language_code:String(b.languageCode||"en").trim().toLowerCase().slice(0,12)||"en",
        translation_key:String(b.translationKey||slug).trim().slice(0,200)||slug,
        status:"draft",
        featured:Boolean(b.featured),
        sort_order:Math.max(0,Number.isFinite(Number(b.sortOrder))?Number(b.sortOrder):100)
      })
    });

    if(!r.ok){
      const detail=await r.text().catch(()=>"");
      return json({error:"Unable to create share resource.",detail:detail.slice(0,180)},r.status);
    }

    return json({ok:true,asset:(await r.json())?.[0]||null},200,s.refreshed?sessionCookies(s.refreshed):[]);
  }

  if(action==="update"){
    const id=String(b.id||"");
    const status=String(b.status||"");
    const assetType=String(b.assetType||"").trim();
    const destinationPath=String(b.destinationPath||"").trim();
    if(!id||!["draft","active","archived"].includes(status)){
      return json({error:"Choose a valid resource and status."},400);
    }
    if(!allowedAssetTypes.includes(assetType)){
      return json({error:"Choose a valid Share Library asset type."},400);
    }
    if(!destinationPath.startsWith("/")){
      return json({error:"Share Library destinations must be Lockliel paths beginning with /."},400);
    }

    const r=await fetch(
      SUPABASE_URL+"/rest/v1/share_assets?id=eq."+encodeURIComponent(id),
      {
        method:"PATCH",
        headers:{...h,Prefer:"return=representation"},
        body:JSON.stringify({
          title:String(b.title||"").trim(),
          asset_type:assetType,
          description:String(b.description||"").trim().slice(0,1000)||null,
          share_text:String(b.shareText||"").trim().slice(0,1200)||null,
          category:String(b.category||"").trim().slice(0,120)||null,
          preview_image_path:String(b.previewImagePath||"").trim().slice(0,500)||null,
          destination_path:destinationPath,
          language_code:String(b.languageCode||"en").trim().toLowerCase().slice(0,12)||"en",
          status,
          featured:Boolean(b.featured),
          sort_order:Math.max(0,Number.isFinite(Number(b.sortOrder))?Number(b.sortOrder):100)
        })
      }
    );

    if(!r.ok)return json({error:"Unable to update share resource."},r.status);

    return json({ok:true,asset:(await r.json())?.[0]||null},200,s.refreshed?sessionCookies(s.refreshed):[]);
  }

  return json({error:"Unknown action"},400);
};

export const config={path:"/api/lockliel/admin/share-library"};