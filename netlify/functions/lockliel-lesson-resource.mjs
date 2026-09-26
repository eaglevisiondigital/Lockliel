import {SUPABASE_URL,SUPABASE_KEY,json,dbHeaders,requireSession} from "../lib/lockliel-core.mjs";

function safeHttpsUrl(value){
  try{
    const url=new URL(String(value||""));
    if(url.protocol!=="https:"||url.username||url.password)return null;
    return url.toString();
  }catch{
    return null;
  }
}

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
    const location=safeHttpsUrl(asset.external_url);
    if(!location)return json({error:"This external lesson resource is not available."},404);
    return new Response(null,{status:302,headers:{Location:location,"Cache-Control":"no-store"}});
  }
  if(!asset.storage_path)return json({error:"This resource has not been uploaded yet."},404);

  const storageUrl=SUPABASE_URL+"/storage/v1/object/authenticated/lesson-assets/"+asset.storage_path.split("/").map(encodeURIComponent).join("/");
  const file=await fetch(storageUrl,{
    headers:{apikey:SUPABASE_KEY,Authorization:"Bearer "+s.access}
  });
  if(!file.ok)return json({error:"Unable to open this lesson resource."},file.status===404?404:502);

  const contentType=(file.headers.get("content-type")||"application/octet-stream")
    .split(";")[0].trim().toLowerCase();

  if(["pdf","worksheet"].includes(asset.asset_type)&&contentType!=="application/pdf"){
    return json({error:"This protected lesson document failed PDF validation."},502);
  }

  const headers=new Headers({
    "Content-Type":contentType,
    "Cache-Control":"private, no-store",
    "X-Content-Type-Options":"nosniff"
  });
  return new Response(file.body,{status:200,headers});
};

export const config={path:"/api/lockliel/lesson-resource"};