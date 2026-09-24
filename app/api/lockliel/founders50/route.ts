import { NextRequest, NextResponse } from "next/server";
import { LOCKLIEL_SUPABASE_URL } from "@/lib/lockliel-supabase";
export async function POST(request:NextRequest){
 const body=await request.json().catch(()=>null); if(!body)return NextResponse.json({error:"Invalid submission"},{status:400});
 const r=await fetch(LOCKLIEL_SUPABASE_URL+"/functions/v1/submit-founders50",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body),cache:"no-store"});
 const data=await r.json().catch(()=>({error:"Submission failed"}));
 return NextResponse.json(data,{status:r.status});
}