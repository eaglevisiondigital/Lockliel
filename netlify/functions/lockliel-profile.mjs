import {SUPABASE_URL,json,dbHeaders,requireSession,sessionCookies} from "../lib/lockliel-core.mjs";

export default async(request)=>{
  if(request.method!=="PATCH")return json({error:"Method not allowed"},405);

  const s=await requireSession(request);
  if(!s.user||!s.access)return json({error:"Unauthorized"},401);

  const b=await request.json().catch(()=>({}));
  const firstName=String(b.firstName||"").trim();
  const lastName=String(b.lastName||"").trim();
  const phone=String(b.phone||"").trim();
  const city=String(b.city||"").trim();
  const region=String(b.region||"").trim();
  const country=String(b.country||"United States").trim();
  const locale=String(b.locale||"en-US").trim()||"en-US";
  const timezone=String(b.timezone||"").trim();

  if(!firstName||!lastName||!city||!region||!country){
    return json({error:"Please complete your name, city, state/region, and country."},400);
  }

  if(firstName.length>120||lastName.length>120){
    return json({error:"First and last names must be 120 characters or fewer."},400);
  }
  if(phone.length>60){
    return json({error:"Phone number must be 60 characters or fewer."},400);
  }
  if(city.length>160||region.length>160||country.length>160){
    return json({error:"City, state/region, and country must each be 160 characters or fewer."},400);
  }
  if(locale.length<2||locale.length>35){
    return json({error:"Choose a valid language/locale preference."},400);
  }
  if(timezone.length>100){
    return json({error:"Timezone must be 100 characters or fewer."},400);
  }

  const patch={
    first_name:firstName,
    last_name:lastName,
    phone:phone||null,
    city,
    region,
    country,
    locale,
    timezone:timezone||null
  };

  const h={...dbHeaders(s.access),Prefer:"return=representation"};
  const id=encodeURIComponent(s.user.id);
  const p=await fetch(
    SUPABASE_URL+"/rest/v1/profiles?id=eq."+id,
    {method:"PATCH",headers:h,body:JSON.stringify(patch)}
  );
  if(!p.ok)return json({error:"We couldn't save your profile."},500);

  return json({ok:true},200,s.refreshed?sessionCookies(s.refreshed):[]);
};

export const config={path:"/api/lockliel/profile"};