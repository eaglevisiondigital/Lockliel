"use client";
import Link from "next/link";
import { ArrowUpRight, BookOpen, HeartHandshake, LogOut, Radio, Share2, Sprout, Users } from "lucide-react";
import { useEffect, useState } from "react";

type SessionData={authenticated:boolean;profile?:{first_name?:string|null;onboarding_status?:string|null};journey?:{next_step_title?:string|null;next_step_path?:string|null;reach_one_count?:number;active_connections_count?:number}};
const cards=[
{icon:Sprout,title:"My Journey",text:"Continue growing in the Word and pick up exactly where you left off.",href:"/my-lockliel/journey",cta:"Continue my journey"},
{icon:Users,title:"My Five",text:"Keep the people you are intentionally encouraging in front of you. Reach one. Follow up. Help them grow.",href:"/my-lockliel/connections",cta:"View my connections"},
{icon:Radio,title:"Faith Boost",text:"Watch, grow, and personally share a Faith Boost with someone who needs encouragement today.",href:"/#faith-boost",cta:"Go to Faith Boost"},
{icon:Share2,title:"Share & Invite",text:"Use approved Lockliel resources and personal invitation links to reach people intentionally.",href:"/my-lockliel/share",cta:"Open Share Center"},
{icon:HeartHandshake,title:"Partner With Us",text:"Help advance the mission through one-time or monthly partnership as giving comes online.",href:"/my-lockliel/partner",cta:"Partnership"},
{icon:BookOpen,title:"Books & Resources",text:"Your Lockliel digital books, discipleship resources, and future physical orders will live here.",href:"/my-lockliel/resources",cta:"Open my library"}
];

export default function MyLocklielDashboard(){
 const [data,setData]=useState<SessionData|null>(null);
 useEffect(()=>{fetch("/api/lockliel-auth/session",{cache:"no-store"}).then(async r=>{if(r.status===401){location.replace("/my-lockliel/sign-in");return;}setData(await r.json());}).catch(()=>location.replace("/my-lockliel/sign-in"));},[]);
 async function signOut(){await fetch("/api/lockliel-auth/logout",{method:"POST"});location.assign("/");}
 if(!data)return <main className="my-lockliel"><div className="ml-loading">Opening My Lockliel…</div></main>;
 const name=data.profile?.first_name?.trim();
 const nextTitle=data.journey?.next_step_title||"Continue Getting a Grip on the Basics";
 const nextPath=data.journey?.next_step_path||"/my-lockliel/journey";
 return <main className="my-lockliel"><div className="ml-shell">
  <header className="ml-member-bar"><div><div className="ml-kicker">My Lockliel</div><span>{name ? "Welcome, "+name : "Welcome"}</span></div><button onClick={signOut}><LogOut size={15}/> Sign out</button></header>
  <section className="ml-hero"><div className="ml-panel"><div className="ml-kicker">Your next step matters</div><h1>Grow. Reach one.<br/>Help them grow.</h1><p>Grow in Jesus, live from who God says you are, reach people personally, and help somebody else begin doing the same.</p><div className="ml-path"><span>KNOW JESUS</span><span>GROW</span><span>REACH ONE</span><span>SHARE</span><span>FOLLOW UP</span><span>MULTIPLY</span></div></div>
  <aside className="ml-panel ml-next"><div><div className="ml-kicker">Your next step</div><strong>{nextTitle}</strong><p>Your journey is personal and trackable. Continue where you left off and keep moving forward.</p><div className="ml-mini-stats"><span><b>{data.journey?.reach_one_count||0}</b> reached</span><span><b>{data.journey?.active_connections_count||0}</b> connections</span></div></div><Link href={nextPath}>{data.profile?.onboarding_status==="new"?"Get started":"Continue"} <ArrowUpRight size={17}/></Link></aside></section>
  <h2 className="ml-section-title">What will you do next?</h2><section className="ml-grid">{cards.map(({icon:Icon,...c})=><article className="ml-card" key={c.title}><div className="ml-icon"><Icon size={21}/></div><h2>{c.title}</h2><p>{c.text}</p><Link href={c.href}>{c.cta} →</Link></article>)}</section>
  <p className="ml-footer-note">Reach. Teach. Train. Disciple. Multiply.</p>
 </div></main>;
}
