"use client";
import {useEffect,useMemo,useRef,useState} from "react";
import Link from "next/link";
import {ArrowLeft,CheckCircle2,FileText,LockKeyhole} from "lucide-react";
import YouTubeProgressPlayer from "./youtube-progress-player";

export default function LessonPlayerClient(){
  const [data,setData]=useState<any>(null);
  const [slug,setSlug]=useState("");
  const [error,setError]=useState("");
  const [message,setMessage]=useState("");
  const [answers,setAnswers]=useState<Record<string,string>>({});
  const [localMedia,setLocalMedia]=useState<Record<string,number>>({});
  const [saving,setSaving]=useState(false);
  const hydrated=useRef(false);

  async function load(){
    const params=new URLSearchParams(window.location.search);
    const lessonSlug=params.get("lesson")||"";
    setSlug(lessonSlug);
    if(!lessonSlug){setError("Choose a lesson from My Journey.");return;}

    const r=await fetch("/api/lockliel/journey",{cache:"no-store"});
    if(r.status===401){location.assign("/my-lockliel/sign-in");return;}
    const d=await r.json();
    if(!r.ok){setError(d.error||"Unable to load lesson.");return;}

    const lesson=d.lessons.find((l:any)=>l.slug===lessonSlug);
    if(!lesson){setError("This lesson is not available in your journey.");return;}

    const progress=d.progress.find((p:any)=>p.lesson_id===lesson.id);
    setAnswers(progress?.worksheet_answers||{});
    const media:Record<string,number>={};
    for(const p of d.mediaProgress||[])media[p.asset_id]=Number(p.percent_watched)||0;
    setLocalMedia(media);
    setData({...d,lesson,lessonProgress:progress});
    hydrated.current=true;

    if(!progress||progress.status==="not_started"){
      await fetch("/api/lockliel/journey",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({lessonId:lesson.id,status:"in_progress",worksheetStatus:"not_started",worksheetAnswers:{}})
      }).catch(()=>{});
    }
  }

  useEffect(()=>{load();},[]);

  const assets=useMemo(()=>data?.assets.filter((a:any)=>a.lesson_id===data.lesson.id)||[],[data]);
  const videos=useMemo(()=>assets.filter((a:any)=>a.asset_type==="video"&&a.provider==="youtube"),[assets]);
  const documents=useMemo(()=>assets.filter((a:any)=>["pdf","worksheet","external_link"].includes(a.asset_type)),[assets]);
  const questions=useMemo(()=>data?.lesson?.worksheet_schema?.questions||[],[data]);
  const mediaSaved=useMemo(()=>Object.fromEntries((data?.mediaProgress||[]).map((p:any)=>[p.asset_id,p])),[data]);
  const notesMode=questions.length===1&&String(questions[0]?.text||"").startsWith("After working through this lesson");

  useEffect(()=>{
    if(!hydrated.current||!data?.lesson||!questions.length)return;
    const timer=window.setTimeout(()=>{
      const complete=questions.every((q:any)=>String(answers[String(q.number)]||"").trim().length>0);
      fetch("/api/lockliel/journey",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          lessonId:data.lesson.id,
          status:"in_progress",
          worksheetStatus:complete?"completed":"in_progress",
          worksheetAnswers:answers
        })
      }).catch(()=>{});
    },800);
    return ()=>window.clearTimeout(timer);
  },[answers,data?.lesson?.id,questions.length]);

  function onMediaProgress(assetId:string,percent:number){
    setLocalMedia(v=>({...v,[assetId]:Math.max(v[assetId]||0,percent)}));
  }

  async function completeLesson(){
    if(!data?.lesson)return;
    setSaving(true);
    setMessage("");
    const r=await fetch("/api/lockliel/journey",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        lessonId:data.lesson.id,
        status:"completed",
        worksheetStatus:questions.length?"completed":"not_required",
        worksheetAnswers:answers
      })
    });
    const d=await r.json().catch(()=>({}));
    setSaving(false);
    if(!r.ok){setMessage(d.error||"Unable to complete lesson.");return;}
    setMessage("Lesson completed. Your progress has been saved.");
    await load();
  }

  if(error)return <section className="ml-card"><LockKeyhole size={21}/><h2>Lesson unavailable</h2><p>{error}</p><Link href="/my-lockliel/journey">Return to My Journey →</Link></section>;
  if(!data)return <div className="ml-loading">Opening your lesson…</div>;

  const worksheetDone=!questions.length||questions.every((q:any)=>String(answers[String(q.number)]||"").trim().length>0);
  const videoDone=videos.length>0&&videos.every((a:any)=>(localMedia[a.id]||0)>=95);
  const hasReadyContent=videos.length>0||questions.length>0;
  const canComplete=hasReadyContent&&worksheetDone&&(videos.length===0||videoDone);
  const completed=data.lessonProgress?.status==="completed";

  return <section className="ml-lesson-experience">
    <Link href="/my-lockliel/journey" className="ml-auth-home"><ArrowLeft size={16}/> My Journey</Link>

    <section className="ml-panel ml-lesson-hero">
      <div className="ml-kicker">Lesson {data.lesson.position}</div>
      <h1>{data.lesson.title}</h1>
      <p>Watch. Learn. Work through the lesson. Your progress saves to My Lockliel.</p>
      {completed&&<div className="ml-completed-pill"><CheckCircle2 size={16}/> Completed</div>}
    </section>

    {videos.length>0&&<section className="ml-lesson-block">
      <div className="ml-kicker">Watch</div>
      <h2>{videos.length>1?"Lesson videos":"Lesson video"}</h2>
      <div className="ml-lesson-videos">
        {videos.map((asset:any)=><YouTubeProgressPlayer key={asset.id} asset={asset} saved={mediaSaved[asset.id]} onProgress={onMediaProgress}/>)}
      </div>
      <p className="ml-privacy-note">Playback completion is based on the portions actually watched. Skipping directly to the end does not count as watching the full lesson.</p>
    </section>}

    {questions.length>0&&<section className="ml-panel ml-worksheet">
      <div className="ml-kicker">{notesMode?"Reflect":"Work it out"}</div>
      <h2>{notesMode?"Lesson notes":"Lesson worksheet"}</h2>
      <p>{notesMode?"Capture what stood out, what you learned, and what you want to put into practice. Your notes save automatically.":"Answer each question as you work through the teaching. Your answers save automatically."}</p>
      <div className="ml-worksheet-list">
        {questions.map((q:any)=><label key={q.number}>
          <span>{notesMode?q.text:q.number+". "+q.text}</span>
          {notesMode
            ? <textarea rows={6} value={answers[String(q.number)]||""} onChange={e=>setAnswers(v=>({...v,[String(q.number)]:e.target.value}))} placeholder="Write your notes and key takeaways…"/>
            : <input value={answers[String(q.number)]||""} onChange={e=>setAnswers(v=>({...v,[String(q.number)]:e.target.value}))} placeholder="Your answer"/>}
        </label>)}
      </div>
      <div className="ml-worksheet-status">{notesMode?(worksheetDone?"Notes saved":"Add your notes to complete this lesson"):questions.filter((q:any)=>String(answers[String(q.number)]||"").trim()).length+" of "+questions.length+" answered"}</div>
    </section>}

    {documents.length>0&&<section className="ml-panel ml-lesson-resources">
      <div className="ml-kicker">Lesson resources</div>
      <h2>Downloads & resources</h2>
      {documents.map((asset:any)=><a key={asset.id} href={asset.asset_type==="external_link"?asset.external_url:"/api/lockliel/lesson-resource?assetId="+asset.id} target="_blank" rel="noreferrer"><FileText size={17}/>{asset.title||"Open resource"}</a>)}
    </section>}

    {!hasReadyContent&&<section className="ml-card"><h2>This lesson is being prepared.</h2><p>The course framework is ready, but the teaching media and worksheet for this lesson have not been released inside Lockliel yet.</p></section>}

    <section className="ml-complete-lesson">
      <div>
        <b>{completed?"Lesson complete":canComplete?"You’re ready to complete this lesson.":"Finish the lesson to continue."}</b>
        <span>{videos.length&&!videoDone?"Watch each video to at least 95%. ":""}{questions.length&&!worksheetDone?(notesMode?"Add your lesson notes.":"Complete all worksheet questions."):""}</span>
      </div>
      {!completed&&<button className="ml-action" disabled={!canComplete||saving} onClick={completeLesson}>{saving?"Saving…":"Complete lesson"}</button>}
    </section>

    {message&&<p className="ml-share-message">{message}</p>}
  </section>;
}
