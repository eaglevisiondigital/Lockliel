import { NextRequest, NextResponse } from "next/server";
import { ACCESS_COOKIE } from "@/lib/lockliel-auth-cookies";
import { LOCKLIEL_SUPABASE_PUBLISHABLE_KEY, LOCKLIEL_SUPABASE_URL, supabaseHeaders } from "@/lib/lockliel-supabase";

async function userId(access:string){
 const r=await fetch(LOCKLIEL_SUPABASE_URL+"/auth/v1/user",{headers:{apikey:LOCKLIEL_SUPABASE_PUBLISHABLE_KEY,Authorization:"Bearer "+access},cache:"no-store"});
 if(!r.ok)return null; const u=await r.json(); return u.id as string;
}
async function count(path:string,access:string){
 const r=await fetch(LOCKLIEL_SUPABASE_URL+"/rest/v1/"+path,{headers:{...supabaseHeaders(access),Prefer:"count=exact",Range:"0-0"},cache:"no-store"});
 if(!r.ok)return 0; const cr=r.headers.get("content-range")||"0-0/0"; const total=Number(cr.split("/")[1]); return Number.isFinite(total)?total:0;
}
export async function GET(request:NextRequest){
 const access=request.cookies.get(ACCESS_COOKIE)?.value||""; if(!access)return NextResponse.json({error:"Unauthorized"},{status:401});
 const id=await userId(access); if(!id)return NextResponse.json({error:"Unauthorized"},{status:401});
 const h=supabaseHeaders(access);
 const roleRes=await fetch(LOCKLIEL_SUPABASE_URL+"/rest/v1/staff_roles?profile_id=eq."+encodeURIComponent(id)+"&select=role",{headers:h,cache:"no-store"});
 const roles=roleRes.ok?(await roleRes.json()).map((r:any)=>r.role):[];
 if(!roles.length)return NextResponse.json({error:"Staff access required"},{status:403});
 const [people,founders,activeCourses,gifts,appsRes]=await Promise.all([
   count("profiles?select=id",access),
   count("founders50_applications?select=id",access),
   count("course_enrollments?status=eq.active&select=id",access),
   count("gifts?status=eq.succeeded&select=id",access),
   fetch(LOCKLIEL_SUPABASE_URL+"/rest/v1/founders50_applications?select=id,first_name,last_name,city,region,country,status,created_at&order=created_at.desc&limit=8",{headers:h,cache:"no-store"})
 ]);
 const applications=appsRes.ok?await appsRes.json():[];
 return NextResponse.json({roles,counts:{people,founders,activeCourses,gifts},applications});
}