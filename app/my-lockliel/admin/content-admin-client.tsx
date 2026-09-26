"use client";
import {useEffect,useMemo,useState} from "react";
import {BookOpen,DownloadCloud,FileText,Link2,PlayCircle,Plus} from "lucide-react";
export default function ContentAdminClient(){
 const [data,setData]=useState<any>(null),[hidden,setHidden]=useState(false),[message,setMessage]=useState(""),[working,setWorking]=useState(false);
 async function load(){const r=await fetch("/api/lockliel/admin/content",{cache:"no-store"});const d=await r.json().catch(()=>({}));if(r.status===403){setHidden(true);return;}if(r.ok)setData(d);}
 useEffect(()=>{load();},[]);
 async function addAsset(e:React.FormEvent<HTMLFormElement>){e.preventDefault();setWorking(true);setMessage("");const f=new FormData(e.currentTarget);const r=await fetch("/api/lockliel/admin/content",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"createAsset",lessonId:f.get("lessonId"),assetType:f.get("assetType"),title:f.get("title"),provider:f.get("provider"),providerRef:f.get("providerRef"),externalUrl:f.get("externalUrl"),storagePath:f.get("storagePath"),durationSeconds:f.get("durationSeconds")})});const d=await r.json().catch(()=>({}));setWorking(false);if(!r.ok){setMessage(d.error||"Unable to add asset.");return;}setMessage("Lesson asset added.");e.currentTarget.reset();await load();}
 async function verifyDuration(e:React.FormEvent<HTMLFormElement>){e.preventDefault();setWorking(true);setMessage("");const f=new FormData(e.currentTarget);const r=await fetch("/api/lockliel/admin/content",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"updateAssetDuration",assetId:f.get("assetId"),durationSeconds:f.get("durationSeconds")})});const d=await r.json().catch(()=>({}));setWorking(false);if(!r.ok){setMessage(d.error||"Unable to verify video duration.");return;}setMessage("Video duration verified. Playback percent will now be derived from interval evidence.");e.currentTarget.reset();await load();}
 async function setStatus(courseId:string,status:string){setWorking(true);const r=await fetch("/api/lockliel/admin/content",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"setCourseStatus",courseId,status})});setWorking(false);if(r.ok)await load();}
 async function importGripPdfs(){setWorking(true);setMessage("Importing the 13 existing workbook PDFs into private Lockliel storage…");const r=await fetch("/api/lockliel/admin/content",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"importGripPdfs"})});const d=await r.json().catch(()=>({}));setWorking(false);if(!r.ok&&r.status!==207){setMessage(d.error||"Unable to import workbook PDFs.");return;}setMessage((d.imported||0)+" of "+(d.total||13)+" workbook PDFs imported into private storage.");await load();}
 const lessonMap=useMemo(()=>Object.fromEntries((data?.lessons||[]).map((l:any)=>[l.id,l])),[data]);
 if(hidden)return null;if(!data)return <div className="ml-loading">Loading content tools…</div>;
 return <section className="ml-content-admin">
  {message&&<p className="ml-share-message">{message}</p>}
  <div className="ml-content-import">
   <div><div className="ml-kicker">Existing course assets</div><b>Champion Life Getting a Grip workbooks</b><span>Copy the 13 existing lesson PDFs into Lockliel’s private lesson storage and activate them for enrolled members.</span></div>
   <button disabled={working} onClick={importGripPdfs}><DownloadCloud size={16}/>{working?"Working…":"Import 13 private PDFs"}</button>
  </div>
  <form className="ml-panel ml-admin-form" onSubmit={verifyDuration}><div className="ml-icon"><PlayCircle size={19}/></div><h3>Verify existing video duration</h3><p>Backfill an authoritative duration for an existing YouTube asset. Once verified, watched percent is derived from interval evidence in the database.</p>
   <label>Video asset<select name="assetId" required defaultValue=""><option value="" disabled>Choose active video</option>{data.assets.filter((a:any)=>a.asset_type==="video"&&a.status==="active").map((a:any)=>{const lesson=lessonMap[a.lesson_id];return <option key={a.id} value={a.id}>Lesson {lesson?.position||"?"}: {lesson?.title||a.title||a.provider_ref}{a.duration_seconds?" • "+Math.round(Number(a.duration_seconds))+"s verified":""}</option>})}</select></label>
   <label>Verified duration in seconds<input name="durationSeconds" type="number" min="1" max="86400" step="1" required/></label>
   <button className="ml-action" disabled={working}>Verify duration</button>
  </form>
  <div className="ml-finance-grid">
   <form className="ml-panel ml-admin-form" onSubmit={addAsset}><div className="ml-icon"><Plus size={19}/></div><h3>Add lesson media</h3><p>Attach a video, audio item, PDF, worksheet, or external resource to any lesson.</p>
    <label>Lesson<select name="lessonId" required defaultValue=""><option value="" disabled>Choose lesson</option>{data.lessons.map((l:any)=><option key={l.id} value={l.id}>Lesson {l.position}: {l.title}</option>)}</select></label>
    <label>Asset type<select name="assetType" required defaultValue="video"><option value="video">Video</option><option value="audio">Audio</option><option value="pdf">PDF</option><option value="worksheet">Worksheet</option><option value="external_link">External link</option></select></label>
    <label>Title<input name="title" placeholder="Optional display title"/></label>
    <div className="ml-auth-row"><label>Provider<input name="provider" placeholder="YouTube, Vimeo, Supabase"/></label><label>Provider reference<input name="providerRef" placeholder="Video ID"/></label></div>
    <label>External URL<input name="externalUrl" type="url" placeholder="Optional https://…"/></label>
    <label>Private storage path<input name="storagePath" placeholder="course/lesson-1/resource.pdf"/></label>
    <label>Duration in seconds<input name="durationSeconds" type="number" min="1" max="86400" step="1"/></label>
    <button className="ml-action" disabled={working}>Add asset</button>
   </form>
   <section className="ml-panel ml-admin-list"><div className="ml-icon"><BookOpen size={19}/></div><h3>Courses</h3>{data.courses.map((c:any)=><div className="ml-content-course" key={c.id}><div><b>{c.title}</b><span>{data.lessons.filter((l:any)=>l.course_id===c.id).length} lessons • {data.assets.filter((a:any)=>lessonMap[a.lesson_id]?.course_id===c.id).length} assets</span></div><select value={c.status} disabled={working} onChange={e=>setStatus(c.id,e.target.value)}><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></div>)}</section>
  </div>
  <section className="ml-panel ml-admin-list"><div className="ml-kicker">Getting a Grip content map</div><h3>Lessons & attached assets</h3>{data.lessons.map((l:any)=>{const assets=data.assets.filter((a:any)=>a.lesson_id===l.id);return <div className="ml-content-lesson" key={l.id}><div><span>Lesson {l.position}</span><b>{l.title}</b></div><div className="ml-content-assets">{assets.length?assets.map((a:any)=><span key={a.id}>{a.asset_type==="video"?<PlayCircle size={12}/>:a.asset_type==="pdf"?<FileText size={12}/>:<Link2 size={12}/>} {a.title||a.provider||a.asset_type}{a.status!=="active"?" • "+a.status:""}{a.asset_type==="video"?(a.duration_seconds?" • "+Math.round(Number(a.duration_seconds))+"s verified":" • duration pending"):""}</span>):<small>No media attached yet</small>}</div></div>})}</section>
 </section>;
}