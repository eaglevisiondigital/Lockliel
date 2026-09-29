"use client";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  CircleUserRound,
  ClipboardCheck,
  HeartHandshake,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Tag,
  UsersRound
} from "lucide-react";
import {useEffect,useMemo,useState} from "react";

function money(cents:number){
  return "$"+(Number(cents||0)/100).toFixed(2);
}

export default function PersonRecordClient(){
  const [data,setData]=useState<any>(null);
  const [error,setError]=useState("");

  useEffect(()=>{
    const params=new URLSearchParams(location.search);
    const profileId=params.get("profileId")||"";
    if(!profileId){
      setError("Choose a person from People & Progress.");
      return;
    }

    fetch("/api/lockliel/admin/person?profileId="+encodeURIComponent(profileId),{cache:"no-store"})
      .then(async r=>{
        const d=await r.json().catch(()=>({}));
        if(r.status===401){location.assign("/my-lockliel/sign-in");return;}
        if(!r.ok){setError(d.error||"Unable to load person record.");return;}
        setData(d);
      })
      .catch(()=>setError("Unable to load person record."));
  },[]);

  const name=useMemo(()=>{
    if(!data?.profile)return "";
    return [data.profile.first_name,data.profile.last_name].filter(Boolean).join(" ").trim()||data.profile.email||"Member";
  },[data]);

  if(error)return <section className="ml-card"><CircleUserRound size={22}/><h2>Person record</h2><p>{error}</p><Link href="/my-lockliel/admin">Return to Admin →</Link></section>;
  if(!data)return <div className="ml-loading">Opening person record…</div>;

  const p=data.profile;
  const currentLeader=data.leaderAssignments?.find((a:any)=>a.status==="active");
  const activeGroups=(data.groups||[]).filter((g:any)=>g.status==="active");
  const founder=data.founders?.[0]||null;

  return <section className="ml-person-record">
    <div className="ml-person-record-top">
      <Link href="/my-lockliel/admin" className="ml-auth-home"><ArrowLeft size={16}/> Lockliel Admin</Link>
      <div className="ml-person-privacy-mode">{data.privacyMode.replaceAll("_"," ")}</div>
    </div>

    <section className="ml-panel ml-person-hero">
      <div className="ml-avatar large">{(p.first_name||p.email||"?").slice(0,1).toUpperCase()}</div>
      <div>
        <div className="ml-kicker">Person record</div>
        <h1>{name}</h1>
        <div className="ml-person-contact-line">
          {p.email&&<span>{p.email}</span>}
          {p.phone&&<span>{p.phone}</span>}
          {(p.city||p.region||p.country)&&<span><MapPin size={12}/>{[p.city,p.region,p.country].filter(Boolean).join(", ")}</span>}
        </div>
      </div>
    </section>

    <section className="ml-person-record-grid">
      <article className="ml-panel ml-record-card">
        <div className="ml-icon"><UsersRound size={19}/></div>
        <h2>Relationships</h2>
        <RecordLine label="Original inviter" value={data.inviter?data.inviter.first_name+(data.inviter.last_initial?" "+data.inviter.last_initial+".":""):"Direct / unknown"}/>
        <RecordLine label="Assigned leader" value={currentLeader?.leader?currentLeader.leader.first_name+(currentLeader.leader.last_initial?" "+currentLeader.leader.last_initial+".":"")+" • "+currentLeader.assignment_type.replaceAll("_"," "):"None assigned"}/>
        <RecordLine label="Groups" value={activeGroups.length?activeGroups.map((g:any)=>g.group?.name||"Group").join(", "):"No active group"}/>
      </article>

      <article className="ml-panel ml-record-card">
        <div className="ml-icon"><Tag size={19}/></div>
        <h2>Source & interests</h2>
        <div className="ml-record-tags">
          {(data.tags||[]).map((item:any)=><span key={item.tag.id}>{item.tag.label}</span>)}
          {!data.tags?.length&&<small>No tags yet</small>}
        </div>
        {data.faith&&<>
          <RecordLine label="Faith stage" value={data.faith.faith_stage?data.faith.faith_stage.replaceAll("-"," "):"Not answered"}/>
          <RecordLine label="Connection preference" value={data.faith.preferred_connection?data.faith.preferred_connection.replaceAll("-"," "):"Not answered"}/>
        </>}
      </article>

      <article className="ml-panel ml-record-card">
        <div className="ml-icon"><ShieldCheck size={19}/></div>
        <h2>Founders 50</h2>
        {founder
          ? <>
              <RecordLine label="Status" value={founder.status.replaceAll("_"," ")}/>
              <RecordLine label="Gathering place" value={founder.gathering_place||"Not answered"}/>
              <RecordLine label="Share With Five" value={founder.share_with_five||"Not answered"}/>
            </>
          : <p className="ml-record-empty">No Founders 50 application linked.</p>}
      </article>

      <article className="ml-panel ml-record-card">
        <div className="ml-icon"><HeartHandshake size={19}/></div>
        <h2>Resources</h2>
        {(data.entitlements||[]).length
          ? data.entitlements.map((e:any)=><RecordLine key={e.id} label={e.product?.title||"Resource"} value={e.reason.replaceAll("_"," ")} />)
          : <p className="ml-record-empty">No resource entitlements yet.</p>}
      </article>
    </section>

    {(data.courses||[]).length>0&&<section className="ml-panel ml-person-courses">
      <div className="ml-kicker">Discipleship progress</div>
      <h2>Course journey</h2>
      {data.courses.map((course:any)=><article key={course.id||course.course_id} className="ml-person-course">
        <div className="ml-person-course-head">
          <div><BookOpen size={18}/><div><b>{course.course?.title||"Course"}</b><span>{course.status}</span></div></div>
          <strong>{course.lessons.filter((l:any)=>l.status==="completed").length}/{course.lessons.length||13}</strong>
        </div>
        <div className="ml-person-lesson-list">
          {course.lessons.map((lesson:any)=><div key={lesson.lesson_id}>
            <span>{lesson.status==="completed"?<CheckCircle2 size={13}/>:<BookOpen size={13}/>}</span>
            <div><b>Lesson {lesson.lesson?.position}: {lesson.lesson?.title||"Lesson"}</b><small>{lesson.status.replaceAll("_"," ")} • worksheet {lesson.worksheet_status.replaceAll("_"," ")}</small></div>
            <span>{lesson.last_activity_at?new Date(lesson.last_activity_at).toLocaleDateString():""}</span>
          </div>)}
        </div>
        {course.media?.length>0&&<div className="ml-person-media-summary">
          <MessageCircle size={14}/>
          <span>{course.media.length} tracked media record{course.media.length===1?"":"s"} • latest {Math.round(Number(course.media[0]?.percent_watched||0))}% watched</span>
        </div>}
      </article>)}
    </section>}

    {(data.tasks||[]).length>0&&<section className="ml-panel ml-record-list">
      <div className="ml-kicker">Follow-up</div>
      <h2>Tasks & ministry actions</h2>
      {data.tasks.slice(0,20).map((task:any)=><div key={task.id}>
        <ClipboardCheck size={15}/>
        <div><b>{task.task_type.replaceAll("_"," ")}</b><span>{task.notes||task.status}</span></div>
        <small>{task.status}{task.due_at?" • "+new Date(task.due_at).toLocaleDateString():""}</small>
      </div>)}
    </section>}

    {(data.notes||[]).length>0&&<section className="ml-panel ml-record-list">
      <div className="ml-kicker">Private staff notes</div>
      <h2>Role-permitted notes</h2>
      {data.notes.slice(0,20).map((note:any)=><div key={note.id}>
        <ShieldCheck size={15}/>
        <div><b>{note.note_type.replaceAll("_"," ")}</b><span>{note.body}</span></div>
        <small>{note.visibility.replaceAll("_"," ")} • {new Date(note.created_at).toLocaleDateString()}</small>
      </div>)}
    </section>}

    {(data.gifts||[]).length>0&&<section className="ml-panel ml-record-list">
      <div className="ml-kicker">Permissioned finance view</div>
      <h2>Giving history</h2>
      {data.gifts.slice(0,20).map((gift:any)=><div key={gift.id}>
        <HeartHandshake size={15}/>
        <div><b>{money(gift.amount_cents)}</b><span>{gift.designation} • {gift.provider}</span></div>
        <small>{gift.status} • {new Date(gift.received_at||gift.created_at).toLocaleDateString()}</small>
      </div>)}
    </section>}
  </section>;
}

function RecordLine({label,value}:{label:string;value:string}){
  return <div className="ml-record-line"><span>{label}</span><b>{value}</b></div>;
}
