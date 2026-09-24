import { NextRequest, NextResponse } from "next/server";
import { ACCESS_COOKIE } from "@/lib/lockliel-auth-cookies";
import { LOCKLIEL_SUPABASE_PUBLISHABLE_KEY, LOCKLIEL_SUPABASE_URL, supabaseHeaders } from "@/lib/lockliel-supabase";

async function getUser(access:string){
 const r=await fetch(LOCKLIEL_SUPABASE_URL+"/auth/v1/user",{headers:{apikey:LOCKLIEL_SUPABASE_PUBLISHABLE_KEY,Authorization:"Bearer "+access},cache:"no-store"});
 if(!r.ok)return null; return r.json();
}
export async function POST(request:NextRequest){
 const access=request.cookies.get(ACCESS_COOKIE)?.value||""; if(!access)return NextResponse.json({error:"Unauthorized"},{status:401});
 const user=await getUser(access); if(!user)return NextResponse.json({error:"Unauthorized"},{status:401});
 const body=await request.json().catch(()=>({})); const slug=String(body.slug||"").trim();
 const headers=supabaseHeaders(access);
 const a=await fetch(LOCKLIEL_SUPABASE_URL+"/rest/v1/share_assets?slug=eq."+encodeURIComponent(slug)+"&status=eq.active&select=id,slug,title,asset_type,destination_path&limit=1",{headers,cache:"no-store"});
 const assets=a.ok?await a.json():[]; const asset=assets?.[0]; if(!asset)return NextResponse.json({error:"Share resource not found"},{status:404});
 const existing=await fetch(LOCKLIEL_SUPABASE_URL+"/rest/v1/referral_links?owner_id=eq."+encodeURIComponent(user.id)+"&content_id=eq."+encodeURIComponent(asset.id)+"&active=eq.true&select=code&limit=1",{headers,cache:"no-store"});
 const rows=existing.ok?await existing.json():[]; let code=rows?.[0]?.code;
 if(!code){
   code=crypto.randomUUID().replaceAll("-","").slice(0,10).toLowerCase();
   const created=await fetch(LOCKLIEL_SUPABASE_URL+"/rest/v1/referral_links",{method:"POST",headers:{...headers,Prefer:"return=representation"},body:JSON.stringify({owner_id:user.id,code,campaign:"share-center",content_type:asset.asset_type,content_id:asset.id,destination_path:asset.destination_path})});
   if(!created.ok)return NextResponse.json({error:"We couldn't create your share link."},{status:500});
 }
 return NextResponse.json({code,url:request.nextUrl.origin+"/r/"+code,title:asset.title});
}