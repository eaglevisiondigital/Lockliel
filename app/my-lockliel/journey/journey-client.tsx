"use client";
import Link from "next/link";
import {useEffect,useMemo,useState} from "react";
import {learningState} from "../../../netlify/lib/course-engine.mjs";
import "./lesson/workspace.css";
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

  const learning=learningState(data);
  const completed=learning.completed;
  const total=data.lessons.length;
  const percent=total?Math.round(completed/total*100):0;

  return <>
    {data.maintenance?.paused&&<section className="course-readiness" role="status"><h2>Course maintenance</h2><p>You can read your lessons and view saved progress. Answers, Personal Notes, video progress and completion are paused.</p></section>}
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

    <div className="course-overview-actions">{learning.current&&<Link href={learning.href}>{data.maintenance?.paused?'View Course':'Continue Course'} →</Link>}{learning.complete&&<div><h2>Course Completed</h2><p>You have completed all {total} lessons. Your answers remain available for review.</p></div>}</div>
    <section className="ml-lesson-list">
      {learning.lessons.map((lesson:any)=>{
        const status=lesson.state;
        const assets=assetMap[lesson.id]||[];
        const questions=lesson.worksheet_schema?.questions||[];
        const ready=lesson.unlocked&&(assets.length>0||questions.length>0);
        const readiness=lesson.readiness;

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
                : !readiness.ready
                  ? readiness.label
                  : status==="in_progress"
                  ? "In Progress"
                  : ready
                    ? "Available"
                    : lesson.unlocked?"Content Being Prepared":"Locked"}
            </small>{!lesson.unlocked&&!readiness.ready&&<small>Locked</small>}{!readiness.ready&&<p>{readiness.message}</p>}
            <p>{readiness.requiredMedia?(readiness.mediaReady?'Teaching Video':'Media Coming Soon'):'No Video Required'} · {questions.length} Worksheet Questions · {assets.filter((a:any)=>a.asset_type!=='video').length} Resources</p>
          </div>
          {ready
            ? <Link className="ml-lesson-open" href={"/my-lockliel/journey/lesson?lesson="+encodeURIComponent(lesson.slug)}>
                {data.maintenance?.paused?"View Lesson":status==="completed"?"Review":!readiness.ready?"View Lesson":status==="in_progress"?"Continue":"Start"}
              </Link>
            : <span className="ml-lesson-coming">Locked</span>}
        </article>;
      })}
    </section>

    <p className="ml-privacy-note" style={{marginTop:18}}>
      Your course records lesson status, worksheet completion, resume position, and watched portions of supported lesson media.
    </p>
  </>;
}