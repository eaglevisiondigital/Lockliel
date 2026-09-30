"use client";
import {useEffect,useMemo,useRef,useState} from 'react';
import Link from 'next/link';
import YouTubeProgressPlayer from './youtube-progress-player';
import {createLessonSaver} from '../../../../lib/course/autosave.mjs';
import {learningState,questionKey,worksheetState} from '../../../../netlify/lib/course-engine.mjs';
import './workspace.css';

export default function LessonPlayerClient(){
 const [data,setData]=useState<any>(null),[error,setError]=useState(''),[save,setSave]=useState<any>(null);
 const [minimized,setMinimized]=useState(false),[sticky,setSticky]=useState(true),[message,setMessage]=useState('');
 const saver=useRef<any>(null),mediaPanel=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  let cancelled=false;const slug=new URLSearchParams(location.search).get('lesson');
  async function load(){try{
   const r=await fetch('/api/lockliel/journey',{cache:'no-store'});
   if(r.status===401){location.assign('/my-lockliel/sign-in?next='+encodeURIComponent(location.pathname+location.search));return;}
   const d=await r.json();if(!r.ok)throw Error(d.error||'Course unavailable.');
   const state=learningState(d),lesson=state.lessons.find((l:any)=>l.slug===slug);
   if(!lesson||!lesson.unlocked)throw Error('This lesson is locked or unavailable. Return to the course overview.');
   if(cancelled)return;
   const cloud={...lesson.progress,notes:d.notes?.find((n:any)=>n.lesson_id===lesson.id)?.body||''};
   const instance=createLessonSaver({isOnline:()=>navigator.onLine,user:d.learnerId,lesson:lesson.id,cloud,storage:{getItem:(key:string)=>window.localStorage.getItem(key),setItem:(key:string,value:string)=>window.localStorage.setItem(key,value)},onChange:setSave,
    send:async(payload:any)=>{const response=await fetch('/api/lockliel/journey',{method:'POST',headers:{'Content-Type':'application/json','x-lockliel-course-protocol':'278-v1'},body:JSON.stringify(payload)});const body=await response.json();if(!response.ok)throw Object.assign(Error(body.error),{code:body.code});return body.progress;}});
   saver.current=Object.assign(instance,{identity:d.learnerId});setSave(instance.snapshot());setData({...d,lesson,courseState:state});
  }catch(e){if(!cancelled)setError(e instanceof Error?e.message:'Course unavailable.');}}
  void load();
  const before=(e:BeforeUnloadEvent)=>{if(saver.current?.snapshot().dirty){void saver.current.flush();e.preventDefault();e.returnValue='';}};
  const storage=(e:StorageEvent)=>{if(e.key==='lockliel:auth-change')saver.current?.invalidate();};
  const online=()=>void saver.current?.retry();
  const identity=async()=>{try{const r=await fetch('/api/lockliel/journey',{cache:'no-store'});if(r.status===401){saver.current?.invalidate();return;}if(r.ok){const d=await r.json();const key=saver.current?.identity;if(key&&d.learnerId!==key)saver.current.invalidate();}}catch{/* Offline focus cannot establish a new identity. Saves still verify expected user. */}};
  const offline=()=>saver.current?.offline();
  window.addEventListener('beforeunload',before);window.addEventListener('storage',storage);window.addEventListener('online',online);window.addEventListener('focus',identity);window.addEventListener('offline',offline);
  return()=>{cancelled=true;saver.current?.close();window.removeEventListener('beforeunload',before);window.removeEventListener('storage',storage);window.removeEventListener('online',online);window.removeEventListener('focus',identity);window.removeEventListener('offline',offline);};
 },[]);
 const assets=useMemo(()=>data?.assets.filter((a:any)=>a.lesson_id===data.lesson.id)||[],[data]);
 if(error)return <section className="ml-card"><h1>Lesson Unavailable</h1><p role="alert">{error}</p><Link href="/my-lockliel/journey">Course Overview</Link></section>;
 if(!data||!save)return <p className="ml-loading">Opening your lesson…</p>;
 if(save.state==='Account Changed')return <section className="ml-card"><h1>Account Changed</h1><p>Your private draft remains isolated to its account. Reload to continue.</p><button onClick={()=>location.reload()}>Reload Course</button></section>;
 const lesson=data.lesson,readiness=lesson.readiness,completed=lesson.state==='completed';
 const questions=lesson.progress?.content_snapshot?.questions||lesson.worksheet_schema?.questions||[];
 const worksheet=worksheetState(questions,save.value.answers);
 const videos=assets.filter((a:any)=>a.asset_type==='video'&&a.provider==='youtube');
 const resources=assets.filter((a:any)=>a.asset_type!=='video');
 const next=data.courseState.lessons.find((l:any)=>l.position>lesson.position&&l.unlocked);
 async function navigate(href:string){const ok=await saver.current.flush();if(ok||window.confirm('Cloud sync is pending. Keep your local draft and leave this lesson?'))location.assign(href);}
 async function useCloudWork(){
  try{
   const r=await fetch('/api/lockliel/journey',{cache:'no-store'});if(!r.ok)throw Error();
   const d=await r.json();if(d.learnerId!==data.learnerId){saver.current.invalidate();return;}
   const p=d.progress.find((row:any)=>row.lesson_id===lesson.id);if(!p)throw Error();
   const notes=d.notes.find((row:any)=>row.lesson_id===lesson.id)?.body||'';
   if(saver.current.useCloud({...p,notes}))location.reload();
  }catch{setMessage('Cloud work could not be loaded. Your draft remains on this device.');}
 }
 async function complete(){setMessage('');if(await saver.current.flush(true))location.reload();else setMessage('Completion was not saved. Your answers are retained. Resolve the save status and try again.');}
 async function refreshMedia(){const r=await fetch('/api/lockliel/journey',{cache:'no-store'});if(!r.ok)return;const d=await r.json();if(d.learnerId!==data.learnerId){saver.current.invalidate();return;}const state=learningState(d);setData({...d,lesson:state.lessons.find((l:any)=>l.id===lesson.id),courseState:state});}
 return <section className="course-experience">
  <button className="course-back" onClick={()=>navigate('/my-lockliel/journey')}>← Course Overview</button>
  <header className="course-heading"><p className="ml-kicker">{data.course.title} · Lesson {lesson.position} of {data.lessons.length}</p><h1>{lesson.title}</h1><p>{readiness.mediaReady?"Watch while you work. Your teaching and worksheet stay together.":"Your worksheet, notes and lesson resources stay together."}</p></header>
  {!readiness.ready&&<section className="course-readiness" role="status"><h2>{readiness.label}</h2><p>{readiness.message}</p></section>}
  <div className="course-workspace">
   <aside className={'course-media '+(sticky?'is-sticky ':'')+(minimized?'is-minimized':'')} aria-label="Lesson Media">
    <div ref={mediaPanel} className="course-media-screen">{videos.map((asset:any)=><YouTubeProgressPlayer key={asset.id} asset={{...asset,watch_threshold:data.course.learning_rules?.watch_threshold||95}} saved={data.mediaProgress?.find((p:any)=>p.asset_id===asset.id)} learnerId={data.learnerId} onProgress={()=>void refreshMedia()}/>)}
     {!videos.length&&<p>{['simple','review'].includes(data.course.learning_rules?.model)?'This lesson does not require a video.':'Media Coming Soon. Your lesson resources and worksheet remain here while the teaching video is prepared.'}</p>}
    </div>
    <div className="course-media-content"><h2>Lesson {lesson.position}</h2><p>{lesson.title}</p>
     <p role="status">{lesson.watchMet?'Watch Requirement Met':'Watch Requirement Pending'}</p>
     {videos.some((a:any)=>!a.duration_seconds)&&<p>We are preparing watch progress for this lesson. Your answers and notes can still be saved.</p>}
     {videos.length>0&&<div className="course-tools"><button onClick={()=>setSticky(!sticky)}>{sticky?'Video Stays Visible':'Keep Video Visible'}</button><button onClick={()=>setMinimized(!minimized)}>{minimized?'Expand Video':'Minimize Video'}</button><button onClick={()=>void mediaPanel.current?.requestFullscreen?.().catch(()=>setMessage('Use the video player’s full screen control on this device.'))}>Full Screen</button></div>}
     {videos.map((a:any)=><a key={a.id} href={'https://www.youtube.com/watch?v='+encodeURIComponent(a.provider_ref)} target="_blank" rel="noreferrer">Watch / Cast on TV</a>)}
     {videos.length>0&&<p className="course-helper">Use your device or provider casting controls. Playback outside this page may not report watch progress.</p>}
     <h3>Lesson Resources</h3><div className="course-resources">{resources.map((a:any)=><a key={a.id} href={'/api/lockliel/lesson-resource?assetId='+encodeURIComponent(a.id)} target="_blank" rel="noreferrer">{a.title||'Open Resource'}</a>)}{!resources.length&&<p>No additional resources are configured.</p>}</div>
    </div>
   </aside>
   <section className="course-worksheet" aria-label="Digital Lesson Worksheet">
    <header><p className="course-eyebrow">Digital Lesson Worksheet</p><h2>{lesson.title}</h2><p role="status" aria-live="polite" className="course-save">{save.state}{save.state==='Saved'&&save.lastSaved?' · Last Saved '+new Date(save.lastSaved).toLocaleTimeString([], {hour:'numeric',minute:'2-digit'}):''}</p>
     {(save.state.includes('Failed')||save.state==='Cloud Sync Needed')&&<button disabled={save.blocked} onClick={()=>void saver.current.retry()}>Retry Cloud Save</button>}
     {save.blocked&&!save.conflictDraft&&save.state!=='Account Changed'&&<div role="alert"><p>Getting a Grip is being updated. Keep a copy of your unsaved answers and notes before reloading. Your last saved cloud progress is safe.</p><details><summary>View My Unsaved Draft</summary><pre>{JSON.stringify(save.value,null,2)}</pre></details><button onClick={()=>location.reload()}>Reload Course</button></div>}
     {save.conflictDraft&&<div role="alert"><p>{save.blocked?'Newer cloud work exists. Keep your local draft and continue with the latest cloud work.':'Your earlier local draft is retained below for reference. Cloud saving is available.'}</p><details><summary>View Unsynced Draft</summary><pre>{JSON.stringify(save.conflictDraft,null,2)}</pre></details><button disabled={!save.blocked} onClick={()=>void useCloudWork()}>Keep Draft and Use Cloud Work</button></div>}
     <p>Worksheet: {worksheet.answered} of {worksheet.total} Answered</p><progress value={worksheet.answered} max={Math.max(1,worksheet.total)} aria-label="Worksheet Progress"/>
     <p>Video: {lesson.watchMet?'Watch Requirement Met':'Watch Requirement Pending'}</p>
    </header>
    <fieldset disabled={save.blocked}><legend className="sr-only">Lesson Questions</legend>
     {questions.map((q:any,i:number)=><label className="course-question" key={questionKey(q)}><span className="course-number">{String(i+1).padStart(2,'0')}</span><span className="course-question-body"><span>{q.text||q.prompt}</span>{q.scripture_reference&&<small>{q.scripture_reference}</small>}{q.scripture_text&&<blockquote>{q.scripture_text}</blockquote>}<textarea rows={q.type==='long_text'?5:2} maxLength={4000} readOnly={completed} value={save.value.answers[questionKey(q)]||''} onChange={e=>saver.current.update({...save.value,answers:{...save.value.answers,[questionKey(q)]:e.target.value}})} aria-label={'Question '+(i+1)} required={q.required!==false}/></span></label>)}
     <label className="course-notes"><h3>Personal Notes</h3><p>Optional and private to you. Course managers cannot read these notes.</p><textarea rows={6} maxLength={12000} value={save.value.notes} onChange={e=>saver.current.update({...save.value,notes:e.target.value})} placeholder="Type anything you want to remember from this lesson…"/></label>
    </fieldset>
    <footer className="course-completion"><h3>{completed?'✓ Lesson Complete':data.course.learning_rules?.model==='watch_answer'?'Watch to Advance. Answer to Complete.':'Lesson Completion'}</h3>{completed&&lesson.progress?.completed_at&&<p>Completed {new Date(lesson.progress.completed_at).toLocaleDateString()}</p>}
     {!completed&&<button disabled={!readiness.ready||!lesson.watchMet||!worksheet.complete||save.blocked||save.state==='Saving…'} onClick={()=>void complete()}>Complete Lesson</button>}
     <button onClick={()=>navigate('/my-lockliel/journey')}>Course Overview</button>{next&&<button onClick={()=>navigate('/my-lockliel/journey/lesson?lesson='+encodeURIComponent(next.slug))}>Next Lesson</button>}
     <a href={'/api/lockliel/journey?export='+encodeURIComponent(lesson.id)}>Download My Answers</a><button onClick={()=>window.print()}>Print / Save as PDF</button>
     <a href={'/api/lockliel/journey?export='+encodeURIComponent(lesson.id)+'&notes=1'}>Download Answers With Notes</a><p>Downloads contain your last cloud-saved work. Include notes only when you want them in your personal copy.</p>
     {message&&<p role="alert">{message}</p>}
    </footer>
   </section>
  </div>
 </section>;
}
