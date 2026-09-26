import {SUPABASE_URL,json,dbHeaders,requireSession,sessionCookies} from "../lib/lockliel-core.mjs";

function inFilter(ids){
  return "in.("+ids.join(",")+")";
}

export default async(request)=>{
  if(request.method!=="GET")return json({error:"Method not allowed"},405);

  const s=await requireSession(request);
  if(!s.user||!s.access)return json({error:"Unauthorized"},401);

  const h=dbHeaders(s.access);
  const uid=s.user.id;

  const [leaderRes,assignmentRes,groupMemberRes,taskRes]=await Promise.all([
    fetch(
      SUPABASE_URL+"/rest/v1/leader_profiles?profile_id=eq."+encodeURIComponent(uid)+"&active=eq.true&select=profile_id,leader_type,city,region,country,capacity,approved_at&limit=1",
      {headers:h}
    ),
    fetch(
      SUPABASE_URL+"/rest/v1/leader_assignments?leader_id=eq."+encodeURIComponent(uid)+"&status=eq.active&select=member_id,assignment_type,assigned_at,updated_at",
      {headers:h}
    ),
    fetch(
      SUPABASE_URL+"/rest/v1/group_members?profile_id=eq."+encodeURIComponent(uid)+"&status=eq.active&role=in.(leader,host)&select=group_id,role,joined_at",
      {headers:h}
    ),
    fetch(
      SUPABASE_URL+"/rest/v1/follow_up_tasks?assigned_to=eq."+encodeURIComponent(uid)+"&status=in.(open,in_progress)&select=id,subject_profile_id,task_type,status,due_at,notes,created_at&order=due_at.asc.nullslast,created_at.asc&limit=100",
      {headers:h}
    )
  ]);

  const leaderProfile=(leaderRes.ok?await leaderRes.json():[])?.[0]||null;
  const assignments=assignmentRes.ok?await assignmentRes.json():[];
  const groupMemberships=groupMemberRes.ok?await groupMemberRes.json():[];
  const tasks=taskRes.ok?await taskRes.json():[];

  if(!leaderProfile&&!assignments.length&&!groupMemberships.length){
    return json({error:"Leader tools are not available for this account."},403);
  }

  const memberIds=[...new Set(assignments.map(a=>a.member_id).filter(Boolean))];
  let people=[];
  if(memberIds.length){
    const pr=await fetch(
      SUPABASE_URL+"/rest/v1/profile_connection_cards?profile_id="+encodeURIComponent(inFilter(memberIds))+"&select=profile_id,first_name,last_initial,city,region,country",
      {headers:h}
    );
    people=pr.ok?await pr.json():[];
  }
  const peopleMap=Object.fromEntries(people.map(p=>[p.profile_id,p]));

  const groupIds=[...new Set(groupMemberships.map(g=>g.group_id).filter(Boolean))];
  let groups=[];
  if(groupIds.length){
    const gr=await fetch(
      SUPABASE_URL+"/rest/v1/groups?id="+encodeURIComponent(inFilter(groupIds))+"&select=id,name,leader_id,city,region,country,status,created_at",
      {headers:h}
    );
    groups=gr.ok?await gr.json():[];
  }

  const taskSubjectIds=[...new Set(tasks.map(t=>t.subject_profile_id).filter(Boolean))];
  let taskPeople=[];
  if(taskSubjectIds.length){
    const tr=await fetch(
      SUPABASE_URL+"/rest/v1/profile_connection_cards?profile_id="+encodeURIComponent(inFilter(taskSubjectIds))+"&select=profile_id,first_name,last_initial,city,region,country",
      {headers:h}
    );
    taskPeople=tr.ok?await tr.json():[];
  }
  const taskPeopleMap=Object.fromEntries(taskPeople.map(p=>[p.profile_id,p]));

  return json({
    leaderProfile,
    assignments:assignments.map(a=>({...a,person:peopleMap[a.member_id]||null})),
    groups,
    tasks:tasks.map(t=>({...t,person:taskPeopleMap[t.subject_profile_id]||null}))
  },200,s.refreshed?sessionCookies(s.refreshed):[]);
};

export const config={path:"/api/lockliel/leader"};