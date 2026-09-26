"use client";
import Link from "next/link";
import {useEffect,useMemo,useState} from "react";
import {BookOpen,CheckCircle2,Circle,Clock3,PlayCircle} from "lucide-react";

export default function JourneyClient(){
  const [data,setData]=useState<any>(null);
  const [error,setError]=useState("");

  async function load(){
    const r=await fetch("/api/lockliel/journey",{cache:"no-store"});
    if(r.status===401){location.assign("/my-lockliel/sign-in");return;}
    const d=await r.json();
    if(!r.ok){setError(d.error||"Unable to load your journey.");return;}
    setData(d);
  }

  useEffect(()=>{load();},[]);

  const progressMap=useMemo(
    ()=>Object.fromEntries((data?.progress||[]).map((p:any)=>[p.lesson_id,p])),
    [data]
  );

  const assetMap=useMemo(()=>{
    const out:Record<string,any[]>={};
    for(const asset of data?.assets||[]){
      if(!out[asset.lesson_id])out[asset.lesson_id]=[];
      out[asset.lesson_id].push(asset);
    }
    return out;
  },[data]);

  if(error)return <p className="ml-auth-message error">{error}</p>;
  if(!data)return <div className="ml-loading">Loading your journey…</div>;

  if(!data.course)return <section className="ml-card">
    <BookOpen/>
    <h2>Your first course will appear here.</h2>
    <p>Complete your profile and faith journey so we can open your foundational discipleship path.</p>
  </section>;

  const completed=(data.progress||[]).filter((p:any)=>p.status==="completed").length;
  const total=data.lessons.length;
  const percent=total?Math.round(completed/total*100):0;

  return <>
    <section className="ml-course-overview">
      <div>
        <div className="ml-kicker">Foundational discipleship</div>
        <h2>{data.course.title}</h2>
        <p>{data.course.description}</p>
      </div>
      <div className="ml-course-percent">
        <strong>{percent}%</strong>
        <span>{completed} of {total} complete</span>
      </div>
    </section>

    <div className="ml-course-progress"><span style={{width:percent+"%"}}/></div>

    <section className="ml-lesson-list">
      {data.lessons.map((lesson:any)=>{
        const p=progressMap[lesson.id];
        const status=p?.status||"not_started";
        const assets=assetMap[lesson.id]||[];
        const questions=lesson.worksheet_schema?.questions||[];
        const ready=assets.length>0||questions.length>0;

        return <article className={"ml-lesson-row "+status} key={lesson.id}>
          <div className="ml-lesson-number">
            {status==="completed"
              ? <CheckCircle2 size={20}/>
              : status==="in_progress"
                ? <PlayCircle size={20}/>
                : ready
                  ? <Circle size={20}/>
                  : <Clock3 size={20}/>}
          </div>
          <div className="ml-lesson-copy">
            <span>Lesson {lesson.position}</span>
            <h3>{lesson.title}</h3>
            <small>
              {status==="completed"
                ? "Completed"
                : status==="in_progress"
                  ? "In progress"
                  : ready
                    ? "Ready"
                    : "Content being prepared"}
            </small>
          </div>
          {ready
            ? <Link className="ml-lesson-open" href={"/my-lockliel/journey/lesson?lesson="+encodeURIComponent(lesson.slug)}>
                {status==="completed"?"Review":status==="in_progress"?"Continue":"Start"}
              </Link>
            : <span className="ml-lesson-coming">Coming soon</span>}
        </article>;
      })}
    </section>

    <p className="ml-privacy-note" style={{marginTop:18}}>
      Your course records lesson status, worksheet completion, resume position, and watched portions of supported lesson media.
    </p>
  </>;
}