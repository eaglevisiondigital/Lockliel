import { NextRequest, NextResponse } from "next/server";
import { LOCKLIEL_SUPABASE_URL } from "@/lib/lockliel-supabase";

export async function GET(request: NextRequest,{params}:{params:Promise<{code:string}>}) {
  const {code}=await params;
  const visitorKey=request.cookies.get("lockliel_visitor")?.value || crypto.randomUUID();
  let destination="/my-lockliel/sign-up";
  try{
    const tracked=await fetch(LOCKLIEL_SUPABASE_URL+"/functions/v1/track-referral",{
      method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({code,visitor_key:visitorKey}),cache:"no-store"
    });
    if(tracked.ok){const data=await tracked.json();if(data.destination)destination=data.destination;}
  }catch{}
  const url=new URL(destination,request.nextUrl.origin);
  url.searchParams.set("ref",code);
  const response=NextResponse.redirect(url);
  if(!request.cookies.get("lockliel_visitor")) response.cookies.set("lockliel_visitor",visitorKey,{httpOnly:true,sameSite:"lax",secure:process.env.NODE_ENV==="production",path:"/",maxAge:60*60*24*90});\n  response.cookies.set("lockliel_ref",code,{httpOnly:true,sameSite:"lax",secure:process.env.NODE_ENV==="production",path:"/",maxAge:60*60*24*30});
  return response;
}