import {SUPABASE_URL,json,dbHeaders,requireSession,sessionCookies} from "../lib/lockliel-core.mjs";

export default async(request)=>{
  if(request.method!=="GET")return json({error:"Method not allowed"},405);

  const s=await requireSession(request);
  if(!s.user||!s.access)return json({error:"Unauthorized"},401);

  const h=dbHeaders(s.access);
  const uid=encodeURIComponent(s.user.id);

  const profileRes=await fetch(
    SUPABASE_URL+"/rest/v1/profiles?id=eq."+uid+"&select=locale&limit=1",
    {headers:h}
  );
  const profile=(profileRes.ok?await profileRes.json():[])?.[0]||null;
  const preferred=String(profile?.locale||"en-US").split("-")[0].toLowerCase()||"en";
  const languages=preferred==="en"?"en":preferred+",en";

  const r=await fetch(
    SUPABASE_URL+"/rest/v1/share_assets?status=eq.active&language_code=in.("+languages+")&select=id,slug,title,asset_type,description,share_text,category,preview_image_path,destination_path,featured,sort_order,language_code,translation_key&order=featured.desc,sort_order.asc,title.asc",
    {headers:h}
  );

  if(!r.ok)return json({error:"Unable to load Share Library."},r.status);

  const rows=await r.json();
  const selected=[];
  const seen=new Set();

  for(const asset of rows){
    const key=asset.translation_key||asset.slug;
    if(seen.has(key))continue;

    const variants=rows.filter(item=>(item.translation_key||item.slug)===key);
    const preferredVariant=variants.find(item=>item.language_code===preferred)
      ||variants.find(item=>item.language_code==="en")
      ||variants[0];

    if(preferredVariant){
      selected.push(preferredVariant);
      seen.add(key);
    }
  }

  selected.sort((a,b)=>{
    if(Boolean(a.featured)!==Boolean(b.featured))return a.featured?-1:1;
    if(Number(a.sort_order)!==Number(b.sort_order))return Number(a.sort_order)-Number(b.sort_order);
    return String(a.title).localeCompare(String(b.title));
  });

  return json({
    preferredLanguage:preferred,
    assets:selected
  },200,s.refreshed?sessionCookies(s.refreshed):[]);
};

export const config={path:"/api/lockliel/share-library"};