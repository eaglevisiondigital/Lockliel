import { NextRequest, NextResponse } from "next/server";
import { ACCESS_COOKIE } from "@/lib/lockliel-auth-cookies";
import { LOCKLIEL_SUPABASE_PUBLISHABLE_KEY, LOCKLIEL_SUPABASE_URL, supabaseHeaders } from "@/lib/lockliel-supabase";

async function getUser(access:string){
 const r=await fetch(LOCKLIEL_SUPABASE_URL+"/auth/v1/user",{headers:{apikey:LOCKLIEL_SUPABASE_PUBLISHABLE_KEY,Authorization:"Bearer "+access},cache:"no-store"});
 if(!r.ok)return null; return r.json();
}
export async function PATCH(request:NextRequest){
 const access=request.cookies.get(ACCESS_COOKIE)?.value||""; if(!access)return NextResponse.json({error:"Unauthorized"},{status:401});
 const user=await getUser(access); if(!user)return NextResponse.json({error:"Unauthorized"},{status:401});
 const body=await request.json().catch(()=>({}));
 const patch={first_name:String(body.firstName||"").trim(),last_name:String(body.lastName||"").trim(),phone:String(body.phone||"").trim()||null,city:String(body.city||"").trim(),region:String(body.region||"").trim(),country:String(body.country||"United States").trim(),onboarding_status:"active",updated_at:new Date().toISOString()};
 if(!patch.first_name||!patch.last_name||!patch.city||!patch.region||!patch.country)return NextResponse.json({error:"Please complete your name, city, state/region, and country."},{status:400});
 const headers={...supabaseHeaders(access),Prefer:"return=representation"};
 const p=await fetch(LOCKLIEL_SUPABASE_URL+"/rest/v1/profiles?id=eq."+encodeURIComponent(user.id),{method:"PATCH",headers,body:JSON.stringify(patch),cache:"no-store"});
 if(!p.ok)return NextResponse.json({error:"We couldn't save your profile."},{status:500});
 await fetch(LOCKLIEL_SUPABASE_URL+"/rest/v1/member_journey?profile_id=eq."+encodeURIComponent(user.id),{method:"PATCH",headers,body:JSON.stringify({next_step_type:"course",next_step_title:"Begin Getting a Grip on the Basics",next_step_path:"/my-lockliel/journey",updated_at:new Date().toISOString()}),cache:"no-store"});
 return NextResponse.json({ok:true});
}