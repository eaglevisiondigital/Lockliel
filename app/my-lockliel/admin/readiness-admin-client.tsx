"use client";
import {useEffect,useState} from "react";
import {AlertCircle,CheckCircle2,ClipboardList} from "lucide-react";

export default function ReadinessAdminClient(){
  const [data,setData]=useState<any>(null);
  const [hidden,setHidden]=useState(false);

  useEffect(()=>{
    fetch("/api/lockliel/admin/readiness",{cache:"no-store"}).then(async r=>{
      const d=await r.json().catch(()=>({}));
      if(r.status===403){setHidden(true);return;}
      if(r.ok)setData(d);
    });
  },[]);

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
      <div><strong>{percent}%</strong><span>{data.readyCount} of {data.totalCount} foundation checks ready</span></div>
      <div className="ml-course-progress"><span style={{width:percent+"%"}}/></div>
    </div>

    <div className="ml-readiness-list">
      {data.checks.map((check:any)=><article className={check.ready?"ready":"pending"} key={check.key}>
        <div className="ml-readiness-icon">{check.ready?<CheckCircle2 size={17}/>:<AlertCircle size={17}/>}</div>
        <div><b>{check.label}</b><span>{check.detail}</span></div>
      </article>)}
    </div>
  </section>;
}
