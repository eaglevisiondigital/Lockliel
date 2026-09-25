"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  HeartHandshake,
  LogOut,
  Radio,
  Share2,
  ShieldCheck,
  Sparkles,
  Sprout,
  Users,
  UsersRound
} from "lucide-react";
import {useEffect,useMemo,useState} from "react";
import NotificationsClient from "./notifications/notifications-client";

type SessionData={
  authenticated:boolean;
  profile?:{first_name?:string|null;onboarding_status?:string|null};
  journey?:{
    next_step_title?:string|null;
    next_step_path?:string|null;
    reach_one_count?:number;
    active_connections_count?:number;
  };
  roles?:string[];
  founderStatus?:string|null;
  groupMemberships?:{group_id:string;role:string;joined_at:string}[];
};

const baseCards=[
  {
    icon:Sprout,
    title:"My Journey",
    text:"Continue growing in the Word and pick up exactly where you left off.",
    href:"/my-lockliel/journey",
    cta:"Continue my journey"
  },
  {
    icon:Users,
    title:"My Five",
    text:"Keep the people you are intentionally encouraging in front of you. Reach one. Follow up. Help them grow.",
    href:"/my-lockliel/connections",
    cta:"View my connections"
  },
  {
    icon:Radio,
    title:"Faith Boost",
    text:"Watch, grow, and personally share a Faith Boost with someone who needs encouragement today.",
    href:"/#faith-boost",
    cta:"Go to Faith Boost"
  },
  {
    icon:Share2,
    title:"Share & Invite",
    text:"Use approved Lockliel resources and personal invitation links to reach people intentionally.",
    href:"/my-lockliel/share",
    cta:"Open Share Center"
  },
  {
    icon:UsersRound,
    title:"My Group",
    text:"Connect with your Lockliel gathering, leader, and the people growing alongside you.",
    href:"/my-lockliel/group",
    cta:"Open my group"
  },
  {
    icon:HeartHandshake,
    title:"Partner With Us",
    text:"Help advance the mission through one-time or monthly partnership as giving comes online.",
    href:"/my-lockliel/partner",
    cta:"Partnership"
  },
  {
    icon:BookOpen,
    title:"Books & Resources",
    text:"Your Lockliel digital books, discipleship resources, and future physical orders will live here.",
    href:"/my-lockliel/resources",
    cta:"Open my library"
  }
];

export default function MyLocklielDashboard(){
  const [data,setData]=useState<SessionData|null>(null);

  useEffect(()=>{
    fetch("/api/lockliel-auth/session",{cache:"no-store"})
      .then(async r=>{
        if(r.status===401){
          location.replace("/my-lockliel/sign-in");
          return;
        }
        setData(await r.json());
      })
      .catch(()=>location.replace("/my-lockliel/sign-in"));
  },[]);

  async function signOut(){
    await fetch("/api/lockliel-auth/logout",{method:"POST"});
    location.assign("/");
  }

  const cards=useMemo(()=>{
    if(!data)return baseCards;

    const extra:any[]=[];
    const roles=data.roles||[];
    const founderStatus=String(data.founderStatus||"");
    const founderActive=["accepted","orientation","active_host"].includes(founderStatus);
    const isHost=(data.groupMemberships||[]).some(g=>["leader","host"].includes(g.role));

    if(data.founderStatus){
      extra.push({
        icon:ShieldCheck,
        title:"Founders 50",
        text:"Your Founders 50 application is "+founderStatus.replaceAll("_"," ")+". Follow your next steps and stay connected.",
        href:"/founders-50",
        cta:"View Founders 50"
      });
    }

    if(founderActive||isHost){
      extra.push({
        icon:Sparkles,
        title:"Founder / Host Tools",
        text:"Lead your gathering, submit weekly multiplication check-ins, and keep reaching people intentionally.",
        href:"/my-lockliel/group",
        cta:"Open host tools"
      });
    }

    if(roles.length){
      extra.push({
        icon:ShieldCheck,
        title:"Lockliel Admin",
        text:"Authorized staff tools for people, progress, follow-up, Founders 50, groups, content, giving, and system operations.",
        href:"/my-lockliel/admin",
        cta:"Open admin"
      });
    }

    return [...baseCards,...extra];
  },[data]);

  if(!data){
    return <main className="my-lockliel"><div className="ml-loading">Opening My Lockliel…</div></main>;
  }

  const name=data.profile?.first_name?.trim();
  const nextTitle=data.journey?.next_step_title||"Continue Getting a Grip on the Basics";
  const nextPath=data.journey?.next_step_path||"/my-lockliel/journey";

  return <main className="my-lockliel"><div className="ml-shell">
    <header className="ml-member-bar">
      <div>
        <div className="ml-kicker">My Lockliel</div>
        <span>{name?"Welcome, "+name:"Welcome"}</span>
      </div>
      <div className="ml-member-actions">
        <Link href="/my-lockliel/notifications">Notifications</Link>
        <Link href="/my-lockliel/profile">Profile</Link>
        <button onClick={signOut}><LogOut size={15}/> Sign out</button>
      </div>
    </header>

    <section className="ml-hero">
      <div className="ml-panel">
        <div className="ml-kicker">Your next step matters</div>
        <h1>Grow. Reach one.<br/>Help them grow.</h1>
        <p>Grow in Jesus, live from who God says you are, reach people personally, and help somebody else begin doing the same.</p>
        <div className="ml-path">
          <span>KNOW JESUS</span>
          <span>GROW</span>
          <span>REACH ONE</span>
          <span>SHARE</span>
          <span>FOLLOW UP</span>
          <span>MULTIPLY</span>
        </div>
      </div>

      <aside className="ml-panel ml-next">
        <div>
          <div className="ml-kicker">Your next step</div>
          <strong>{nextTitle}</strong>
          <p>Your journey is personal and trackable. Continue where you left off and keep moving forward.</p>
          <div className="ml-mini-stats">
            <span><b>{data.journey?.reach_one_count||0}</b> reached</span>
            <span><b>{data.journey?.active_connections_count||0}</b> connections</span>
          </div>
        </div>
        <Link href={nextPath}>
          {data.profile?.onboarding_status==="new"?"Get started":"Continue"} <ArrowUpRight size={17}/>
        </Link>
      </aside>
    </section>

    {(data.founderStatus||data.groupMemberships?.length)&&<section className="ml-member-context">
      {data.founderStatus&&<span>Founders 50: {data.founderStatus.replaceAll("_"," ")}</span>}
      {(data.groupMemberships||[]).map((g,index)=><span key={g.group_id+"-"+index}>Group role: {g.role.replaceAll("_"," ")}</span>)}
    </section>}

    <NotificationsClient compact/>

    <h2 className="ml-section-title">What will you do next?</h2>
    <section className="ml-grid">
      {cards.map(({icon:Icon,...card})=><article className="ml-card" key={card.title}>
        <div className="ml-icon"><Icon size={21}/></div>
        <h2>{card.title}</h2>
        <p>{card.text}</p>
        <Link href={card.href}>{card.cta} →</Link>
      </article>)}
    </section>

    <p className="ml-footer-note">Reach. Teach. Train. Disciple. Multiply.</p>
  </div></main>;
}
