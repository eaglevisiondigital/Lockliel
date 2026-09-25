import {SUPABASE_URL,json,dbHeaders,requireSession,sessionCookies} from "../lib/lockliel-core.mjs";

export default async(request)=>{
  if(request.method!=="GET")return json({error:"Method not allowed"},405);

  const s=await requireSession(request);
  if(!s.user||!s.access)return json({error:"Unauthorized"},401);

  const h=dbHeaders(s.access);
  const r=await fetch(
    SUPABASE_URL+"/rest/v1/share_assets?status=eq.active&select=id,slug,title,asset_type,description,share_text,category,preview_image_path,destination_path,featured,sort_order&order=featured.desc,sort_order.asc,title.asc",
    {headers:h}
  );

  if(!r.ok)return json({error:"Unable to load Share Library."},r.status);

  return json({assets:await r.json()},200,s.refreshed?sessionCookies(s.refreshed):[]);
};

export const config={path:"/api/lockliel/share-library"};