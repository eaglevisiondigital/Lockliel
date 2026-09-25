import {SUPABASE_URL,json,dbHeaders,requireSession,sessionCookies} from "../lib/lockliel-core.mjs";

export default async(request)=>{
  const s=await requireSession(request);
  if(!s.user||!s.access)return json({error:"Unauthorized"},401);

  const h=dbHeaders(s.access);
  const rr=await fetch(
    SUPABASE_URL+"/rest/v1/staff_roles?profile_id=eq."+encodeURIComponent(s.user.id)+"&select=role",
    {headers:h}
  );
  const roles=rr.ok?(await rr.json()).map(r=>r.role):[];
  const allowed=roles.some(r=>["super_admin","admin","discipleship_admin","founders50_reviewer","finance_admin"].includes(r));
  if(!allowed)return json({error:"Staff notes access required"},403);

  if(request.method==="POST"){
    const b=await request.json().catch(()=>({}));
    const profileId=String(b.profileId||"");
    const visibility=String(b.visibility||"ministry_staff");
    const noteType=String(b.noteType||"general");
    const body=String(b.body||"").trim();

    const visibilities=["admin_only","ministry_staff","finance_only"];
    const noteTypes=["general","follow_up","discipleship","founders50","group","finance"];

    if(!profileId||!body||body.length>5000||!visibilities.includes(visibility)||!noteTypes.includes(noteType)){
      return json({error:"Choose a member, note type, visibility, and enter a note."},400);
    }

    if(visibility==="admin_only"&&!roles.some(r=>["super_admin","admin"].includes(r))){
      return json({error:"Admin-only notes require administrator access."},403);
    }
    if(visibility==="finance_only"&&!roles.some(r=>["super_admin","admin","finance_admin"].includes(r))){
      return json({error:"Finance-only notes require finance access."},403);
    }

    const r=await fetch(SUPABASE_URL+"/rest/v1/member_staff_notes",{
      method:"POST",
      headers:{...h,Prefer:"return=representation"},
      body:JSON.stringify({
        profile_id:profileId,
        author_id:s.user.id,
        visibility,
        note_type:noteType,
        body
      })
    });
    if(!r.ok)return json({error:"Unable to save staff note."},r.status);

    return json({ok:true,note:(await r.json())?.[0]||null},200,s.refreshed?sessionCookies(s.refreshed):[]);
  }

  if(request.method!=="GET")return json({error:"Method not allowed"},405);

  const [peopleRes,notesRes]=await Promise.all([
    fetch(
      SUPABASE_URL+"/rest/v1/profile_connection_cards?select=profile_id,first_name,last_initial,city,region,country&order=first_name.asc&limit=5000",
      {headers:h}
    ),
    fetch(
      SUPABASE_URL+"/rest/v1/member_staff_notes?select=id,profile_id,author_id,visibility,note_type,body,created_at,updated_at&order=created_at.desc&limit=250",
      {headers:h}
    )
  ]);

  const people=peopleRes.ok?await peopleRes.json():[];
  const notes=notesRes.ok?await notesRes.json():[];
  const peopleMap=Object.fromEntries(people.map(p=>[p.profile_id,p]));

  return json({
    roles,
    people,
    notes:notes.map(n=>({
      ...n,
      person:peopleMap[n.profile_id]||null,
      author:peopleMap[n.author_id]||null
    }))
  },200,s.refreshed?sessionCookies(s.refreshed):[]);
};

export const config={path:"/api/lockliel/admin/notes"};