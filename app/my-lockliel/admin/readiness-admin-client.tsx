"use client";
import {useEffect,useState} from "react";
import {AlertCircle,CheckCircle2,ClipboardList,ShieldCheck} from "lucide-react";

export default function ReadinessAdminClient(){
  const [data,setData]=useState<any>(null);
  const [hidden,setHidden]=useState(false);
  const [working,setWorking]=useState<string|null>(null);
  const [message,setMessage]=useState("");

  async function load(){
    const r=await fetch("/api/lockliel/admin/readiness",{cache:"no-store"});
    const d=await r.json().catch(()=>({}));
    if(r.status===403){setHidden(true);return;}
    if(r.ok)setData(d);
  }

  useEffect(()=>{load();},[]);

  async function verify(key:string,verified:boolean,note:string){
    setWorking(key);
    setMessage("");
    const r=await fetch("/api/lockliel/admin/readiness",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({key,verified,note})
    });
    const d=await r.json().catch(()=>({}));
    setWorking(null);
    if(!r.ok){setMessage(d.error||"Unable to update verification.");return;}
    setMessage(verified?"Launch item marked verified.":"Launch verification cleared.");
    await load();
  }

  if(hidden)return null;
  if(!data)return <div className="ml-loading">Checking launch readiness…</div>;

  const percent=data.totalCount?Math.round((data.readyCount/data.totalCount)*100):0;

  return <section className="ml-panel ml-readiness">
    <div className="ml-system-head">
      <div>
        <div className="ml-kicker">1.0 launch readiness</div>
        <h2>What is ready right now?</h2>
      </div>
      <ClipboardList size={28}/>
    </div>

    <div className="ml-readiness-meter">
      <div><strong>{percent}%</strong><span>{data.readyCount} of {data.totalCount} required launch checks ready{data.blockerCount? " • "+data.blockerCount+" blocker"+(data.blockerCount===1?"":"s")+" remaining":" • no required blockers"}</span></div>
      <div className="ml-course-progress"><span style={{width:percent+"%"}}/></div>
    </div>

    {message&&<p className="ml-share-message">{message}</p>}

    <div className="ml-readiness-list">
      {data.checks.map((check:any)=><article className={check.ready?"ready":"pending"} key={check.key}>
        <div className="ml-readiness-icon">{check.ready?<CheckCircle2 size={17}/>:<AlertCircle size={17}/>}</div>
        <div>
          <div className="ml-readiness-title-row">
            <b>{check.label}</b>
            {check.required===false&&<em className="ml-optional-pill">Optional</em>}
          </div>
          <span>{check.detail}</span>
          {check.manual&&<small><ShieldCheck size={11}/> Manual verification required because this setting lives in the Supabase dashboard rather than the connected build tools.</small>}
        </div>
        {check.manual&&<ManualVerificationControl
          check={check}
          working={working===check.manualKey}
          onVerify={verify}
        />}
      </article>)}
    </div>
  </section>;
}


function ManualVerificationControl({
  check,
  working,
  onVerify
}:{
  check:any;
  working:boolean;
  onVerify:(key:string,verified:boolean,note:string)=>void;
}){
  const [note,setNote]=useState(check.note||"");

  useEffect(()=>{
    setNote(check.note||"");
  },[check.note]);

  const trimmed=note.trim();
  const canVerify=check.ready||trimmed.length>=20;

  return <div className="ml-manual-verification">
    <label>
      Verification evidence
      <textarea
        value={note}
        onChange={e=>setNote(e.target.value.slice(0,3000))}
        rows={3}
        maxLength={3000}
        placeholder="Record what was checked, where it was verified, and the production result."
      />
    </label>
    <small>{check.ready
      ?"Keep the evidence current. Clear verification if this production setting changes."
      :"At least 20 characters are required before this launch check can be marked verified."}</small>
    <button
      className={check.ready?"ml-verified-button verified":"ml-verified-button"}
      disabled={working||!canVerify}
      onClick={()=>onVerify(check.manualKey,!check.ready,note)}
    >{working?"Saving…":check.ready?"Clear verification":"Mark verified"}</button>
  </div>;
}
