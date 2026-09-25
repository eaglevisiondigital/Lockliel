"use client";
import {useEffect,useState} from "react";
import {CheckCircle2,Clock3,ShieldCheck} from "lucide-react";

export default function FounderOrientationAdminClient(){
  const [data,setData]=useState<any>(null);
  const [hidden,setHidden]=useState(false);

  useEffect(()=>{
    fetch("/api/lockliel/admin/founder-orientation",{cache:"no-store"}).then(async r=>{
      const d=await r.json().catch(()=>({}));
      if(r.status===403){setHidden(true);return;}
      if(r.ok)setData(d);
    });
  },[]);

  if(hidden)return null;
  if(!data)return <div className="ml-loading">Loading Founder orientation progress…</div>;

  if(!data.founders.length){
    return <section className="ml-card"><ShieldCheck size={20}/><h2>Founder orientation</h2><p>No accepted or active Founder accounts are in orientation yet.</p></section>;
  }

  return <section className="ml-panel ml-founder-admin-progress">
    <div className="ml-kicker">Founder readiness</div>
    <h2>Orientation progress</h2>
    <p>Orientation completion prepares someone for review. It does not automatically grant active-host status.</p>

    <div className="ml-founder-admin-list">
      {data.founders.map((founder:any)=>{
        const person=founder.person||{};
        return <article key={founder.id}>
          <div className="ml-founder-admin-person">
            <div className="ml-avatar">{(person.first_name||founder.first_name||"?").slice(0,1).toUpperCase()}</div>
            <div>
              <b>{person.first_name||founder.first_name}{person.last_initial?" "+person.last_initial+".":founder.last_name?" "+founder.last_name:""}</b>
              <span>{[person.city||founder.city,person.region||founder.region,person.country||founder.country].filter(Boolean).join(", ")}</span>
            </div>
          </div>

          <div className="ml-founder-admin-meter">
            <div><strong>{founder.percent}%</strong><span>{founder.completed}/{founder.total} steps</span></div>
            <div className="ml-course-progress"><span style={{width:founder.percent+"%"}}/></div>
          </div>

          <div className="ml-founder-admin-state">
            {founder.percent===100?<CheckCircle2 size={15}/>:<Clock3 size={15}/>}
            <span>{founder.status.replaceAll("_"," ")}</span>
            {founder.percent===100&&founder.status!=="active_host"&&<b>Ready for review</b>}
          </div>
        </article>;
      })}
    </div>
  </section>;
}
