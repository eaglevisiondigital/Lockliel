"use client";

import Link from "next/link";
import {
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
import {useEffect,useMemo,useRef,useState} from "react";
import NotificationsClient from "./notifications/notifications-client";
import DashboardAttention from "./dashboard-attention";
import MemberJourneyPanels,{NextStepCard} from "./member-journey-panels";
import type {MemberJourney} from "@/lib/member-journey-types";
import {journeyEvent} from "@/lib/member-journey-events.mjs";

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
  leaderProfile?:{leader_type:string;city?:string|null;region?:string|null;country?:string|null;capacity?:number|null}|null;
  peopleAssignedCount?:number;
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

function PausedCourseCard(){
 const [course,setCourse]=useState<any>(null);
 useEffect(()=>{let active=true;void fetch('/api/lockliel/journey',{cache:'no-store'}).then(async r=>{if(!r.ok)return;const d=await r.json();if(active&&d.maintenance?.paused&&d.course)setCourse(d);}).catch(()=>{});return()=>{active=false;};},[]);
 if(!course)return null;
 return <section className="ml-card"><div className="ml-kicker">Continue growing</div><h2>{course.course.title}</h2><p>{course.lessons.length} lessons. Course maintenance is on. You can read lessons and view saved progress; saving is paused.</p><Link href="/my-lockliel/journey">View Course →</Link></section>;
}
export default function MyLocklielDashboard(){
  const [data,setData]=useState<SessionData|null>(null);
  const [journey,setJourney]=useState<MemberJourney|null>(null);
  const [error,setError]=useState("");
  const viewed=useRef(false);

  useEffect(()=>{
    let active=true;
    Promise.all([
      fetch("/api/lockliel-auth/session",{cache:"no-store"}),
      fetch("/api/lockliel/next-step",{cache:"no-store"})
    ]).then(async([sessionResponse,nextResponse])=>{
      if(sessionResponse.status===401||nextResponse.status===401){location.replace("/my-lockliel/sign-in");return;}
      if(!sessionResponse.ok)throw new Error("Member features are temporarily unavailable.");
      const session=await sessionResponse.json();
      if(!active)return;
      setData(session);
      if(!nextResponse.ok)throw new Error("Your next step is temporarily unavailable. Your existing tools are still below.");
      const result=await nextResponse.json();
      if(!active)return;
      setJourney(result);
      if(!viewed.current){journeyEvent("next_step_viewed");viewed.current=true;}
    }).catch(reason=>{if(active)setError(reason instanceof Error?reason.message:"Unable to load My Lockliel.");});
    return ()=>{active=false;};
  },[]);

  async function signOut(){
    await fetch("/api/lockliel-auth/logout",{method:"POST"});
    try{localStorage.setItem("lockliel:auth-change",String(Date.now()));}catch{}
    location.assign("/");
  }

  const cards=useMemo(()=>{
    if(!data)return baseCards;

    const extra:typeof baseCards=[];
    const roles=data.roles||[];
    const adminCapableRoles=["super_admin","admin","discipleship_admin","founders50_reviewer","finance_admin","content_admin"];
    const hasAdminAccess=roles.some(role=>adminCapableRoles.includes(role));
    const isRoleLeader=roles.includes("group_leader");
    const hasLeaderTools=Boolean(data.leaderProfile)||Number(data.peopleAssignedCount||0)>0||isRoleLeader;
    const hasFulfillmentAccess=roles.includes("fulfillment_admin");
    const founderStatus=String(data.founderStatus||"");
    const isHost=(data.groupMemberships||[]).some(g=>["leader","host"].includes(g.role));

    if(["accepted","orientation"].includes(founderStatus)){
      extra.push({
        icon:Sparkles,
        title:"Founders 50 Orientation",
        text:"Prepare to host well: catch the vision, learn the group rhythm, practice Share With Five, and complete your readiness steps.",
        href:"/my-lockliel/founder",
        cta:"Continue orientation"
      });
    } else if(data.founderStatus){
      extra.push({
        icon:ShieldCheck,
        title:"Founders 50",
        text:"Your Founders 50 status is "+founderStatus.replaceAll("_"," ")+". Stay connected to your next steps.",
        href:"/founders-50",
        cta:"View Founders 50"
      });
    }

    if(founderStatus==="active_host"||isHost){
      extra.push({
        icon:Sparkles,
        title:"Founder / Host Tools",
        text:"Lead your gathering, submit weekly multiplication check-ins, and keep reaching people intentionally.",
        href:"/my-lockliel/group",
        cta:"Open host tools"
      });
    }

    if(hasLeaderTools){
      extra.push({
        icon:UsersRound,
        title:"Leader Tools",
        text:"See the people and groups you are responsible for, follow up intentionally, and keep private member information protected.",
        href:"/my-lockliel/leader",
        cta:"Open leader tools"
      });
    }

    if(hasFulfillmentAccess){
      extra.push({
        icon:BookOpen,
        title:"Fulfillment Tools",
        text:"Process paid orders, record shipping updates, and keep physical book delivery moving without access to finance or private ministry data.",
        href:"/my-lockliel/fulfillment",
        cta:"Open fulfillment"
      });
    }

    if(hasAdminAccess){
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
    return <main className="my-lockliel"><div className="ml-loading" role="status">{error||"Opening My Lockliel…"}{error&&<p><button className="ml-action" onClick={()=>location.reload()}>Try again</button></p>}</div></main>;
  }

  const name=data.profile?.first_name?.trim();

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

    {error&&<p className="ml-auth-message error" role="alert">{error} <button onClick={()=>location.reload()}>Try again</button></p>}
    <section className="ml-hero ml-member-hero">
      {journey?<NextStepCard step={journey.nextStep}/>:<section className="ml-panel"><h1>What should I do next?</h1><p>Your personal guidance is unavailable right now. You can still explore your member tools below.</p></section>}
      <aside className="ml-panel ml-member-mission"><div className="ml-kicker">Reach. Teach. Train. Disciple.</div><h2>Grow. Reach one.<br/>Help them grow.</h2><p>Grow in Jesus, live from who God says you are, and help somebody else take their next step.</p><Link href="/my-lockliel/faith-profile">My growth preferences →</Link></aside>
    </section>
    {journey?<MemberJourneyPanels data={journey}/>:<PausedCourseCard/>}

    {Boolean(data.founderStatus||data.groupMemberships?.length)&&<section className="ml-member-context">
      {data.founderStatus&&<span>Founders 50: {data.founderStatus.replaceAll("_"," ")}</span>}
      {(data.groupMemberships||[]).map((g,index)=><span key={g.group_id+"-"+index}>Group role: {g.role.replaceAll("_"," ")}</span>)}
    </section>}

    <DashboardAttention/>

    <NotificationsClient compact/>

    <h2 className="ml-section-title">Explore your member tools</h2>
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
