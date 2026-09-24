"use client";
import Link from "next/link";
import { BookOpen, CheckCircle2, ClipboardCheck, Eye, HeartHandshake, MapPinned, Share2, ShieldCheck, Sprout, UserPlus, Users } from "lucide-react";
import { useEffect,useState } from "react";

type AdminData={
 roles:string[];
 counts:{people:number;founders:number;activeCourses:number;gifts:number;leads:number;followups:number;connectionRequests:number};
 activity:{share_initiated:number;visit:number;signup:number;course_started:number;lesson_completed:number};
 sourceCounts:Record<string,number>;
 applications:any[];
 connectionQueue:any[];
};
const founderStatuses=["applied","under_review","needs_info","accepted","orientation","active_host","paused","declined"];
export default function AdminClient(){
 const [data,setData]=useState<AdminData|null>(null),[error,setError]=useState(""),[working,setWorking]=useState<string|null>(null);
 async function load(){const r=await fetch("/api/lockliel/admin/summary",{cache:"no-store"});const d=await r.json();if(!r.ok){setError(r.status===403?"Your account does not have staff access.":d.error||"Unable to load admin.");return;}setData(d);}
 useEffect(()=>{load();},[]);
 async function updateStatus(applicationId:string,status:string){setWorking(applicationId);const r=await fetch("/api/lockliel/admin/summary",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"updateFounderStatus",applicationId,status})});setWorking(null);if(r.ok)await load();}
 async function resolveRequest(requestId:string,status="resolved"){setWorking(requestId);const r=await fetch("/api/lockliel/admin/summary",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"resolveConnectionRequest",requestId,status})});setWorking(null);if(r.ok)await load();}
 if(error)return <section className="ml-panel"><h2>Admin access</h2><p>{error}</p><Link href="/my-lockliel">Return to My Lockliel →</Link></section>;
 if(!data)return <div className="ml-loading">Opening Lockliel Admin…</div>;
 const stats=[["People",data.counts.people,Users],["Pre-account leads",data.counts.leads,UserPlus],["Founders 50",data.counts.founders,ShieldCheck],["Active courses",data.counts.activeCourses,BookOpen],["Open follow-ups",data.counts.followups,ClipboardCheck],["Connection requests",data.counts.connectionRequests,MapPinned],["Recorded gifts",data.counts.gifts,HeartHandshake]];
 const impact=[["Shares",data.activity.share_initiated,Share2],["Visits",data.activity.visit,Eye],["Joined",data.activity.signup,UserPlus],["Started discipleship",data.activity.course_started,Sprout],["Lessons completed",data.activity.lesson_completed,CheckCircle2]];
 return <><section className="ml-admin-stats">{stats.map(([label,value,Icon]:any)=><article className="ml-card" key={label}><div className="ml-icon"><Icon size={20}/></div><strong>{value}</strong><span>{label}</span></article>)}</section>
 <section className="ml-panel ml-admin-impact"><div className="ml-kicker">Multiplication activity</div><h2>From sharing to discipleship</h2><div className="ml-impact-grid">{impact.map(([label,value,Icon]:any)=><article key={label}><Icon size={18}/><strong>{value}</strong><span>{label}</span></article>)}</div></section>
 {data.connectionQueue?.length>0&&<section className="ml-panel ml-admin-list"><div className="ml-kicker">Connection queue</div><h2>People asking for a next step</h2>{data.connectionQueue.map(r=>{const p=r.person||{};return <div className="ml-admin-row ml-connection-request" key={r.id}><div><b>{p.first_name||"Member"}{p.last_initial?" "+p.last_initial+".":""}</b><span>{[p.city,p.region,p.country].filter(Boolean).join(", ")}</span><small>{r.request_type==="find_local_group"?"Looking for a local group":"Interested in hosting or helping lead"}</small></div><div className="ml-request-actions"><span className="ml-status">{String(r.request_type).replaceAll("_"," ")}</span><button disabled={working===r.id} onClick={()=>resolveRequest(r.id)}><CheckCircle2 size={14}/> Resolved</button></div></div>})}</section>}
 <section className="ml-panel ml-admin-list"><div className="ml-kicker">Founders 50 pipeline</div><h2>People raising their hand</h2>{data.applications.length?data.applications.map(a=><div className="ml-admin-row ml-founder-row" key={a.id}><div className="ml-founder-person"><b>{a.first_name} {a.last_name}</b><span>{[a.city,a.region,a.country].filter(Boolean).join(", ")}</span><small>{a.email}{a.phone?" • "+a.phone:""}</small></div><div className="ml-founder-controls"><select value={a.status} disabled={working===a.id} onChange={e=>updateStatus(a.id,e.target.value)}>{founderStatuses.map(s=><option value={s} key={s}>{s.replaceAll("_"," ")}</option>)}</select>{a.profile_id?<span className="ml-linked-account">My Lockliel linked</span>:<span className="ml-awaiting-account">No account yet</span>}</div></div>):<p>No applications yet.</p>}</section></>;
}