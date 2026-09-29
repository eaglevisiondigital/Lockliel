"use client";
import Link from "next/link";
import {CheckCircle2,Circle,ExternalLink,ShieldCheck,Sparkles} from "lucide-react";
import {useEffect,useState} from "react";

export default function FounderOrientationClient(){
  const [data,setData]=useState<any>(null);
  const [error,setError]=useState("");
  const [working,setWorking]=useState<string|null>(null);

  async function load(){
    const r=await fetch("/api/lockliel/founder-orientation",{cache:"no-store"});
    const d=await r.json().catch(()=>({}));
    if(r.status===401){location.assign("/my-lockliel/sign-in");return;}
    if(!r.ok){setError(d.error||"Unable to load Founders 50 orientation.");return;}
    setData(d);
  }

  useEffect(()=>{load();},[]);

  async function toggle(stepId:string,completed:boolean){
    setWorking(stepId);
    const r=await fetch("/api/lockliel/founder-orientation",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({stepId,completed})
    });
    setWorking(null);
    if(r.ok)await load();
  }

  if(error)return <section className="ml-card"><ShieldCheck size={22}/><h2>Founders 50 orientation</h2><p>{error}</p><Link href="/my-lockliel">Return to My Lockliel →</Link></section>;
  if(!data)return <div className="ml-loading">Opening Founders 50 orientation…</div>;

  const complete=data.percent===100;
  const locked=data.application?.status==="active_host";

  return <section className="ml-founder-orientation">
    <section className="ml-panel ml-founder-orientation-hero">
      <div>
        <div className="ml-kicker">Founders 50 orientation</div>
        <h1>Grow yourself. Gather a few. Reach one.</h1>
        <p>This is your preparation path for serving as an early Lockliel Founder or host. Keep it simple, relational, biblical and reproducible.</p>
      </div>
      <div className="ml-founder-percent"><strong>{data.percent}%</strong><span>{data.completed} of {data.total} complete</span></div>
    </section>

    <div className="ml-course-progress"><span style={{width:data.percent+"%"}}/></div>

    {locked&&<p className="ml-privacy-note">Orientation history is locked after active-host approval so the completed review record stays intact.</p>}

    <div className="ml-founder-steps">
      {data.steps.map((step:any)=>{
        const done=Boolean(step.progress?.completed_at);
        return <article className={done?"done":""} key={step.id}>
          <button className="ml-founder-step-check" disabled={locked||working===step.id} onClick={()=>toggle(step.id,!done)} aria-label={locked?"Orientation locked after active-host approval":done?"Mark incomplete":"Mark complete"}>
            {done?<CheckCircle2 size={21}/>:<Circle size={21}/>}
          </button>
          <div>
            <span>Step {step.position}</span>
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </div>
          {step.href&&<Link href={step.href}>Open <ExternalLink size={13}/></Link>}
        </article>;
      })}
    </div>

    {complete&&<section className="ml-founder-ready">
      <Sparkles size={22}/>
      <div><b>Orientation complete.</b><span>Your completion has been sent into the Lockliel follow-up queue for human review before active-host status is granted.</span></div>
    </section>}
  </section>;
}
