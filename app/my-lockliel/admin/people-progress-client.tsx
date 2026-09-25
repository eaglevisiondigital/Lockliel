"use client";
import Link from "next/link";
import {useEffect,useMemo,useState} from "react";
import {PlayCircle,Search,UserRound} from "lucide-react";

function formatMinutes(seconds:number){
  const minutes=Math.round((Number(seconds)||0)/60);
  return minutes<60?minutes+" min":Math.floor(minutes/60)+"h "+(minutes%60)+"m";
}

export default function PeopleProgressClient(){
  const [data,setData]=useState<any>(null);
  const [error,setError]=useState("");
  const [query,setQuery]=useState("");

  useEffect(()=>{
    fetch("/api/lockliel/admin/people",{cache:"no-store"}).then(async r=>{
      const d=await r.json();
      if(!r.ok){
        setError(r.status===403?"Your role does not include people/progress access.":d.error||"Unable to load people.");
        return;
      }
      setData(d);
    });
  },[]);

  const people=useMemo(()=>{
    const all=data?.people||[];
    const q=query.trim().toLowerCase();
    if(!q)return all;
    return all.filter((p:any)=>{
      const haystack=[
        p.name,
        p.email||"",
        p.location||"",
        p.inviter?.name||"",
        p.progress?.currentLesson?.title||"",
        ...(p.tags||[]).map((t:any)=>t.label)
      ].join(" ").toLowerCase();
      return haystack.includes(q);
    });
  },[data,query]);

  if(error)return <p className="ml-privacy-note">{error}</p>;
  if(!data)return <div className="ml-loading">Loading people and progress…</div>;

  return <section className="ml-panel ml-people-panel">
    <div className="ml-people-head">
      <div><div className="ml-kicker">People & progress</div><h2>Know who is here and help them move forward.</h2></div>
      <label className="ml-admin-search"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search people, city, lesson, tag…"/></label>
    </div>

    <div className="ml-people-table">
      <div className="ml-people-header"><span>Person</span><span>Invited by</span><span>Journey</span><span>Tags</span></div>

      {people.map((p:any)=>{
        const pct=p.progress.total?Math.round(p.progress.completed/p.progress.total*100):0;
        const current=p.progress.currentLesson;
        const media=p.progress.latestMedia;

        return <article className="ml-person-row" key={p.id}>
          <div className="ml-person-main">
            <div className="ml-avatar"><UserRound size={16}/></div>
            <div>
              <b>{p.name}</b>
              {p.email&&<small>{p.email}</small>}
              <small>{p.location||"Location not completed"}</small>
              <Link className="ml-person-record-link" href={"/my-lockliel/admin/person?profileId="+encodeURIComponent(p.id)}>Open person record →</Link>
            </div>
          </div>

          <div>
            <b>{p.inviter?.name||"Direct / unknown"}</b>
            <small>{p.founder_status?"Founders 50: "+p.founder_status.replaceAll("_"," "):p.faith?.faith_stage?"Faith: "+p.faith.faith_stage.replaceAll("-"," "):""}</small>
          </div>

          <div className="ml-person-progress">
            <b>{pct}% • {p.progress.completed}/{p.progress.total}</b>
            <span><i style={{width:pct+"%"}}/></span>
            {current&&<small>Lesson {current.position}: {current.title}</small>}
            {media&&<small className="ml-media-watch"><PlayCircle size={10}/> {Math.round(media.percent)}% of latest video • {formatMinutes(p.progress.totalPlayedSeconds)} watched</small>}
            {!current&&!media&&<small>No course activity yet</small>}
          </div>

          <div className="ml-tag-wrap">
            {p.tags.slice(0,4).map((t:any)=><span key={t.slug}>{t.label}</span>)}
            {p.tags.length>4&&<small>+{p.tags.length-4}</small>}
          </div>
        </article>;
      })}

      {people.length===0&&<p>No people match this search.</p>}
    </div>

    {data.privacyMode==="discipleship_limited"&&<p className="ml-privacy-note" style={{marginTop:14}}>Discipleship administrators receive a limited ministry view. Full email and phone information is not exposed here.</p>}
  </section>;
}