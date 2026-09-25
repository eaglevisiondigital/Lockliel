import {SUPABASE_URL,SUPABASE_KEY,json,dbHeaders,requireSession} from "../lib/lockliel-core.mjs";

export default async(request)=>{
  if(request.method!=="GET")return json({error:"Method not allowed"},405);

  const s=await requireSession(request);
  if(!s.user||!s.access)return json({error:"Unauthorized"},401);

  const url=new URL(request.url);
  const assetId=String(url.searchParams.get("assetId")||"");
  if(!assetId)return json({error:"Resource required"},400);

  const h=dbHeaders(s.access);
  const ar=await fetch(
    SUPABASE_URL+"/rest/v1/lesson_assets?id=eq."+encodeURIComponent(assetId)+"&status=eq.active&select=id,title,asset_type,storage_path,external_url&limit=1",
    {headers:h}
  );
  const assets=ar.ok?await ar.json():[];
  const asset=assets?.[0];
  if(!asset)return json({error:"Resource unavailable"},404);
  if(asset.asset_type==="external_link"&&asset.external_url){
    return new Response(null,{status:302,headers:{Location:asset.external_url,"Cache-Control":"no-store"}});
  }
  if(!asset.storage_path)return json({error:"This resource has not been uploaded yet."},404);

  const storageUrl=SUPABASE_URL+"/storage/v1/object/authenticated/lesson-assets/"+asset.storage_path.split("/").map(encodeURIComponent).join("/");
  const file=await fetch(storageUrl,{
    headers:{apikey:SUPABASE_KEY,Authorization:"Bearer "+s.access}
  });
  if(!file.ok)return json({error:"Unable to open this lesson resource."},file.status===404?404:502);

  const headers=new Headers({
    "Content-Type":file.headers.get("content-type")||"application/octet-stream",
    "Cache-Control":"private, no-store"
  });
  return new Response(file.body,{status:200,headers});
};

export const config={path:"/api/lockliel/lesson-resource"};