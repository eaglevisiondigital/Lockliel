import {SUPABASE_URL,json,dbHeaders,requireSession,sessionCookies,sessionAal} from "../lib/lockliel-core.mjs";

export default async(request)=>{
  const s=await requireSession(request);
  if(!s.user||!s.access)return json({error:"Unauthorized"},401);
  if(sessionAal(s.access)!=="aal2")return json({error:"Multi-factor authentication required.",code:"mfa_required"},403);

  const h=dbHeaders(s.access);
  const uid=s.user.id;
  const rr=await fetch(
    SUPABASE_URL+"/rest/v1/staff_roles?profile_id=eq."+encodeURIComponent(uid)+"&select=role",
    {headers:h}
  );
  const roles=rr.ok?(await rr.json()).map(r=>r.role):[];
  if(!roles.some(r=>["super_admin","admin","discipleship_admin","founders50_reviewer"].includes(r))){
    return json({error:"Follow-up administration access required"},403);
  }

  if(request.method==="POST"){
    const b=await request.json().catch(()=>({}));
    const taskId=String(b.taskId||"");
    if(!taskId)return json({error:"Task required"},400);

    if(b.action==="claim"){
      const r=await fetch(
        SUPABASE_URL+"/rest/v1/follow_up_tasks?id=eq."+encodeURIComponent(taskId)+"&status=eq.open",
        {
          method:"PATCH",
          headers:{...h,Prefer:"return=representation"},
          body:JSON.stringify({assigned_to:uid,status:"in_progress"})
        }
      );
      if(!r.ok)return json({error:"Unable to claim task."},r.status);
      return json({ok:true,task:(await r.json())?.[0]||null},200,s.refreshed?sessionCookies(s.refreshed):[]);
    }

    if(b.action==="complete"){
      const r=await fetch(
        SUPABASE_URL+"/rest/v1/follow_up_tasks?id=eq."+encodeURIComponent(taskId),
        {
          method:"PATCH",
          headers:{...h,Prefer:"return=representation"},
          body:JSON.stringify({status:"completed",completed_at:new Date().toISOString()})
        }
      );
      if(!r.ok)return json({error:"Unable to complete task."},r.status);
      return json({ok:true,task:(await r.json())?.[0]||null},200,s.refreshed?sessionCookies(s.refreshed):[]);
    }

    return json({error:"Unknown action"},400);
  }

  if(request.method!=="GET")return json({error:"Method not allowed"},405);

  const tr=await fetch(
    SUPABASE_URL+"/rest/v1/follow_up_tasks?status=in.(open,in_progress)&select=id,subject_profile_id,assigned_to,task_type,status,due_at,notes,context_type,context_id,created_at&order=due_at.asc.nullslast,created_at.asc&limit=100",
    {headers:h}
  );
  const tasks=tr.ok?await tr.json():[];
  const profileIds=[...new Set(tasks.flatMap(t=>[t.subject_profile_id,t.assigned_to]).filter(Boolean))];
  const leadIds=[...new Set(tasks.filter(t=>t.context_type==="lead"&&t.context_id).map(t=>t.context_id))];

  let cards=[];
  if(profileIds.length){
    const cr=await fetch(
      SUPABASE_URL+"/rest/v1/profile_connection_cards?profile_id=in.("+profileIds.join(",")+")&select=profile_id,first_name,last_initial,city,region,country",
      {headers:h}
    );
    cards=cr.ok?await cr.json():[];
  }

  let leads=[];
  if(leadIds.length&&roles.some(r=>["super_admin","admin"].includes(r))){
    const lr=await fetch(
      SUPABASE_URL+"/rest/v1/lead_contacts?id=in.("+leadIds.join(",")+")&select=id,first_name,last_name,email,phone,status",
      {headers:h}
    );
    leads=lr.ok?await lr.json():[];
  }

  const cardMap=Object.fromEntries(cards.map(c=>[c.profile_id,c]));
  const leadMap=Object.fromEntries(leads.map(l=>[l.id,l]));

  return json({
    currentUserId:uid,
    tasks:tasks.map(t=>({
      ...t,
      subject:cardMap[t.subject_profile_id]||null,
      assignee:cardMap[t.assigned_to]||null,
      lead:t.context_type==="lead"?leadMap[t.context_id]||null:null
    }))
  },200,s.refreshed?sessionCookies(s.refreshed):[]);
};

export const config={path:"/api/lockliel/admin/tasks"};