import { NextRequest, NextResponse } from "next/server";
import { ACCESS_COOKIE } from "@/lib/lockliel-auth-cookies";
import { LOCKLIEL_SUPABASE_PUBLISHABLE_KEY, LOCKLIEL_SUPABASE_URL, supabaseHeaders } from "@/lib/lockliel-supabase";

async function userId(access:string){
 const r=await fetch(LOCKLIEL_SUPABASE_URL+"/auth/v1/user",{headers:{apikey:LOCKLIEL_SUPABASE_PUBLISHABLE_KEY,Authorization:"Bearer "+access},cache:"no-store"});
 if(!r.ok)return null; const u=await r.json(); return u.id as string;
}
export async function GET(request:NextRequest){
 const access=request.cookies.get(ACCESS_COOKIE)?.value||""; if(!access)return NextResponse.json({error:"Unauthorized"},{status:401});
 const id=await userId(access); if(!id)return NextResponse.json({error:"Unauthorized"},{status:401});
 const r=await fetch(LOCKLIEL_SUPABASE_URL+"/rest/v1/referral_links?owner_id=eq."+encodeURIComponent(id)+"&campaign=eq.member-invite&active=eq.true&select=code&limit=1",{headers:supabaseHeaders(access),cache:"no-store"});
 const rows=r.ok?await r.json():[]; const code=rows?.[0]?.code;
 if(!code)return NextResponse.json({error:"Invite link unavailable"},{status:404});
 return NextResponse.json({code,url:request.nextUrl.origin+"/r/"+code});
}