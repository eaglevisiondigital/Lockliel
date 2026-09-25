import {SUPABASE_URL,json,dbHeaders,requireSession,sessionCookies} from "../lib/lockliel-core.mjs";

function buildTree(people,progressByPerson){
  const map=Object.fromEntries(people.map(p=>[p.id,{...p,children:[]}]));
  const roots=[];

  for(const person of people){
    const node=map[person.id];
    if(person.original_inviter_id&&map[person.original_inviter_id]){
      map[person.original_inviter_id].children.push(node);
    }else{
      roots.push(node);
    }
  }

  function decorate(node,depth=0){
    const progress=progressByPerson[node.id]||{completed:0,total:0};
    const children=node.children.map(child=>decorate(child,depth+1));
    const descendantCount=children.reduce((sum,c)=>sum+1+c.descendantCount,0);
    const activeDisciples=children.reduce((sum,c)=>sum+(c.courseStarted?1:0)+c.activeDisciples,0);
    return {
      id:node.id,
      name:[node.first_name,node.last_name].filter(Boolean).join(" ").trim()||node.email||"Member",
      city:node.city,
      region:node.region,
      country:node.country,
      created_at:node.created_at,
      onboarding_status:node.onboarding_status,
      depth,
      directInvites:children.length,
      descendantCount,
      courseStarted:progress.started,
      courseCompleted:progress.courseCompleted,
      lessonsCompleted:progress.completed,
      lessonsTotal:progress.total,
      activeDisciples,
      children
    };
  }

  return roots.map(root=>decorate(root,0));
}

export default async(request)=>{
  if(request.method!=="GET")return json({error:"Method not allowed"},405);

  const s=await requireSession(request);
  if(!s.user||!s.access)return json({error:"Unauthorized"},401);

  const h=dbHeaders(s.access);
  const rr=await fetch(
    SUPABASE_URL+"/rest/v1/staff_roles?profile_id=eq."+encodeURIComponent(s.user.id)+"&select=role",
    {headers:h}
  );
  const roles=rr.ok?(await rr.json()).map(r=>r.role):[];
  if(!roles.some(r=>["super_admin","admin","discipleship_admin"].includes(r))){
    return json({error:"Lineage visibility requires administrator or discipleship access."},403);
  }

  const [peopleRes,progressRes,enrollmentRes,lessonsRes]=await Promise.all([
    fetch(
      SUPABASE_URL+"/rest/v1/profiles?select=id,first_name,last_name,email,city,region,country,original_inviter_id,onboarding_status,created_at&order=created_at.asc&limit=10000",
      {headers:h}
    ),
    fetch(
      SUPABASE_URL+"/rest/v1/lesson_progress?select=profile_id,lesson_id,status,last_activity_at&limit=50000",
      {headers:h}
    ),
    fetch(
      SUPABASE_URL+"/rest/v1/course_enrollments?select=profile_id,status,completed_at&limit=10000",
      {headers:h}
    ),
    fetch(
      SUPABASE_URL+"/rest/v1/lessons?select=id&limit=5000",
      {headers:h}
    )
  ]);

  const people=peopleRes.ok?await peopleRes.json():[];
  const progressRows=progressRes.ok?await progressRes.json():[];
  const enrollments=enrollmentRes.ok?await enrollmentRes.json():[];
  const lessons=lessonsRes.ok?await lessonsRes.json():[];
  const totalLessons=lessons.length;

  const progressByPerson={};
  for(const person of people){
    const pp=progressRows.filter(p=>p.profile_id===person.id);
    const enrollment=enrollments.find(e=>e.profile_id===person.id);
    progressByPerson[person.id]={
      started:pp.some(p=>["in_progress","completed"].includes(p.status)),
      completed:pp.filter(p=>p.status==="completed").length,
      total:totalLessons,
      courseCompleted:Boolean(enrollment?.completed_at||enrollment?.status==="completed")
    };
  }

  const tree=buildTree(people,progressByPerson);
  const maxDepth=Math.max(0,...people.map(person=>{
    let depth=0,current=person,seen=new Set();
    while(current?.original_inviter_id&&depth<50&&!seen.has(current.id)){
      seen.add(current.id);
      current=people.find(p=>p.id===current.original_inviter_id);
      if(current)depth++;
      else break;
    }
    return depth;
  }));

  const referred=people.filter(p=>p.original_inviter_id).length;
  const directRoots=people.length-referred;
  const withCourseStart=Object.values(progressByPerson).filter(p=>p.started).length;
  const withCourseComplete=Object.values(progressByPerson).filter(p=>p.courseCompleted).length;

  const leaders=people
    .map(person=>{
      const nodeById=(nodes,id)=>{
        for(const node of nodes){
          if(node.id===id)return node;
          const found=nodeById(node.children,id);
          if(found)return found;
        }
        return null;
      };
      const node=nodeById(tree,person.id);
      return node;
    })
    .filter(Boolean)
    .sort((a,b)=>b.descendantCount-a.descendantCount)
    .slice(0,20);

  return json({
    summary:{
      people:people.length,
      referred,
      directRoots,
      maxDepth,
      courseStarted:withCourseStart,
      courseCompleted:withCourseComplete
    },
    tree,
    leaders
  },200,s.refreshed?sessionCookies(s.refreshed):[]);
};

export const config={path:"/api/lockliel/admin/lineage"};