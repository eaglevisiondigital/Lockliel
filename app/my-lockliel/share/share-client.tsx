"use client";
import Link from "next/link";
import { BookOpen, Copy, Eye, Radio, Share2, Sprout, UserPlus, Users } from "lucide-react";
import { useEffect, useState } from "react";

const assets=[{slug:"faith-boost",icon:Radio,title:"Faith Boost",text:"Encourage someone with a Faith Boost broadcast.",href:"/#faith-boost"},{slug:"founders-50",icon:Users,title:"The Founders 50",text:"Invite someone to discover the Founders 50 vision.",href:"/founders-50"},{slug:"heart-for-the-lost",icon:BookOpen,title:"A Heart for the Lost",text:"Share the upcoming book and its heart to reach one.",href:"/a-heart-for-the-lost"}];
export default function ShareCenter(){
 const [working,setWorking]=useState<string|null>(null),[message,setMessage]=useState(""),[stats,setStats]=useState<any>(null);
 async function loadStats(){const r=await fetch("/api/lockliel/share-stats",{cache:"no-store"});if(r.status===401){location.assign("/my-lockliel/sign-in");return;}if(r.ok)setStats(await r.json());}
 useEffect(()=>{loadStats();},[]);
 async function getLink(slug:string){setWorking(slug);setMessage("");const r=await fetch("/api/lockliel/share-link",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({slug})});if(r.status===401){location.assign("/my-lockliel/sign-in");throw new Error("Sign in required");}const d=await r.json();setWorking(null);if(!r.ok){setMessage(d.error||"Unable to create link.");throw new Error(d.error);}await loadStats();return d;}
 async function copy(slug:string){try{const d=await getLink(slug);await navigator.clipboard.writeText(d.url);setMessage("Personal link copied. Send it to someone you have in mind, then follow up.");}catch{}}
 async function share(slug:string){try{const d=await getLink(slug);if(navigator.share)await navigator.share({title:d.title,text:"I thought this might encourage you.",url:d.url});else{await navigator.clipboard.writeText(d.url);setMessage("Personal link copied.");}}catch{}}
 const t=stats?.totals||{};
 const impact=[["Shares",t.share_initiated||0,Share2],["Visits",t.visit||0,Eye],["People joined",t.unique_joined||0,UserPlus],["Discipleship starts",t.course_started||0,Sprout]];
 return <><section className="ml-share-callout"><div><div className="ml-kicker">Reach one personally</div><h2>Think of a person, not a number.</h2><p>Your personal share links help Lockliel understand what is reaching people while preserving who first invited them.</p></div><Share2 size={30}/></section>
 <section className="ml-impact-grid">{impact.map(([label,value,Icon]:any)=><article key={label}><Icon size={18}/><strong>{value}</strong><span>{label}</span></article>)}</section>
 {message&&<p className="ml-share-message">{message}</p>}<section className="ml-grid">{assets.map(({slug,icon:Icon,...a})=><article className="ml-card" key={slug}><div className="ml-icon"><Icon size={21}/></div><h2>{a.title}</h2><p>{a.text}</p><div className="ml-share-actions"><button onClick={()=>share(slug)} disabled={working===slug}><Share2 size={15}/> {working===slug?"Preparing…":"Share"}</button><button onClick={()=>copy(slug)} disabled={working===slug}><Copy size={15}/> Copy link</button></div><Link href={a.href}>Preview resource →</Link></article>)}</section>
 {stats&&<p className="ml-privacy-note" style={{marginTop:18}}>Impact shows activity tied to your personal Lockliel links. A visit is not treated as a person until someone creates an account.</p>}</>;
}