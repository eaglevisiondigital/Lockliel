"use client";
import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  Copy,
  Mail,
  MessageSquareText,
  Eye,
  FileImage,
  Radio,
  Share2,
  Sparkles,
  Sprout,
  UserPlus,
  Users,
  Video
} from "lucide-react";
import {useEffect,useMemo,useState} from "react";

function iconFor(asset:any){
  const type=String(asset.category||asset.asset_type||"").toLowerCase();
  if(type.includes("faith"))return Radio;
  if(type.includes("book"))return BookOpen;
  if(type.includes("video"))return Video;
  if(type.includes("graphic")||type.includes("image"))return FileImage;
  if(type.includes("invitation")||type.includes("founder"))return Users;
  return Sparkles;
}

export default function ShareCenter(){
  const [working,setWorking]=useState<string|null>(null);
  const [message,setMessage]=useState("");
  const [stats,setStats]=useState<any>(null);
  const [library,setLibrary]=useState<any[]>([]);
  const [reachContacts,setReachContacts]=useState<any[]>([]);
  const [selectedReachId,setSelectedReachId]=useState("");
  const [error,setError]=useState("");

  async function load(){
    const [statsRes,libraryRes,reachRes]=await Promise.all([
      fetch("/api/lockliel/share-stats",{cache:"no-store"}),
      fetch("/api/lockliel/share-library",{cache:"no-store"}),
      fetch("/api/lockliel/share-link",{cache:"no-store"})
    ]);

    if(statsRes.status===401||libraryRes.status===401||reachRes.status===401){
      location.assign("/my-lockliel/sign-in");
      return;
    }

    if(statsRes.ok)setStats(await statsRes.json());

    if(libraryRes.ok){
      const d=await libraryRes.json();
      setLibrary(d.assets||[]);
    }else{
      const d=await libraryRes.json().catch(()=>({}));
      setError(d.error||"Unable to load Share Library.");
    }

    if(reachRes.ok){
      const d=await reachRes.json();
      const contacts=d.reachContacts||[];
      setReachContacts(contacts);
      setSelectedReachId(current=>current&&contacts.some((person:any)=>person.id===current)?current:"");
    }
  }

  useEffect(()=>{load();},[]);

  async function getLink(slug:string,channel="native"){
    setWorking(slug);
    setMessage("");

    const r=await fetch("/api/lockliel/share-link",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({slug,channel,reachContactId:selectedReachId||null})
    });

    if(r.status===401){
      location.assign("/my-lockliel/sign-in");
      throw new Error("Sign in required");
    }

    const d=await r.json();
    setWorking(null);

    if(!r.ok){
      setMessage(d.error||"Unable to create link.");
      throw new Error(d.error);
    }

    await load();
    return d;
  }

  async function markSelectedShared(){
    if(!selectedReachId)return;
    await fetch("/api/lockliel/connections",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({action:"markReachActivity",id:selectedReachId,activity:"shared"})
    }).catch(()=>null);
  }

  async function copy(slug:string){
    try{
      const d=await getLink(slug,"copy");
      await navigator.clipboard.writeText(d.url);
      await markSelectedShared();
      setMessage(d.reachContact
        ?"Personal link copied for "+d.reachContact.displayName+". My Five has been updated so you can follow up."
        :"Personal link copied. Send it to someone you have in mind, then follow up.");
    }catch{}
  }

  async function share(slug:string){
    try{
      const d=await getLink(slug,"native");

      if(navigator.share){
        await navigator.share({
          title:d.title,
          text:d.shareText||"I thought this might encourage you.",
          url:d.url
        });
        await markSelectedShared();
        if(d.reachContact)setMessage("Share completed for "+d.reachContact.displayName+". My Five has been updated.");
      }else{
        await navigator.clipboard.writeText(d.url);
        await markSelectedShared();
        setMessage(d.reachContact?"Personal link copied for "+d.reachContact.displayName+". My Five has been updated.":"Personal link copied.");
      }
    }catch{}
  }

  async function text(slug:string){
    try{
      const d=await getLink(slug,"sms");
      const body=encodeURIComponent((d.shareText||"I thought this might encourage you.")+"\n\n"+d.url);
      window.location.href="sms:?body="+body;
    }catch{}
  }

  async function email(slug:string){
    try{
      const d=await getLink(slug,"email");
      const subject=encodeURIComponent(d.title||"Something from Lockliel");
      const body=encodeURIComponent((d.shareText||"I thought this might encourage you.")+"\n\n"+d.url);
      window.location.href="mailto:?subject="+subject+"&body="+body;
    }catch{}
  }

  const totals=stats?.totals||{};
  const impact=[
    ["Shares",totals.share_initiated||0,Share2],
    ["Visits",totals.visit||0,Eye],
    ["People joined",totals.unique_joined||0,UserPlus],
    ["Discipleship starts",totals.course_started||0,Sprout],
    ["Lessons completed",totals.lesson_completed||0,CheckCircle2]
  ];

  const selectedReach=useMemo(
    ()=>reachContacts.find(person=>person.id===selectedReachId)||null,
    [reachContacts,selectedReachId]
  );
  const featured=useMemo(()=>library.filter(asset=>asset.featured),[library]);
  const standard=useMemo(()=>library.filter(asset=>!asset.featured),[library]);

  return <>
    <section className="ml-share-callout">
      <div>
        <div className="ml-kicker">Reach one personally</div>
        <h2>Think of a person, not a number.</h2>
        <p>Your personal share links help Lockliel understand what is reaching people while preserving who first invited them.</p>
      </div>
      <Share2 size={30}/>
    </section>

    <section className="ml-impact-grid">
      {impact.map(([label,value,Icon]:any)=><article key={label}>
        <Icon size={18}/>
        <strong>{value}</strong>
        <span>{label}</span>
      </article>)}
    </section>

    {reachContacts.length>0&&<section className="ml-panel ml-share-person">
      <div>
        <div className="ml-kicker">Optional My Five connection</div>
        <h2>Who do you have in mind?</h2>
        <p>Choose someone from My Five to create a private person-specific attribution path. Their name is never placed in the public link.</p>
      </div>
      <label>
        Share with
        <select value={selectedReachId} onChange={e=>setSelectedReachId(e.target.value)}>
          <option value="">General personal link</option>
          {reachContacts.map(person=><option key={person.id} value={person.id}>
            {person.display_name} • {String(person.status||"").replaceAll("_"," ")}
          </option>)}
        </select>
      </label>
      {selectedReach&&<small>Selected: {selectedReach.display_name}. Confirmed native or copied shares will update this My Five person automatically.</small>}
    </section>}

    {message&&<p className="ml-share-message">{message}</p>}
    {error&&<p className="ml-auth-message error">{error}</p>}

    {featured.length>0&&<>
      <h2 className="ml-section-title">Featured to share</h2>
      <section className="ml-grid">
        {featured.map(asset=><ShareAssetCard key={asset.id} asset={asset} working={working===asset.slug} onShare={share} onCopy={copy} onText={text} onEmail={email}/>)}
      </section>
    </>}

    {standard.length>0&&<>
      <h2 className="ml-section-title">Share Library</h2>
      <section className="ml-grid">
        {standard.map(asset=><ShareAssetCard key={asset.id} asset={asset} working={working===asset.slug} onShare={share} onCopy={copy} onText={text} onEmail={email}/>)}
      </section>
    </>}

    {!library.length&&!error&&<section className="ml-card">
      <Share2 size={21}/>
      <h2>Share resources are being prepared.</h2>
      <p>Approved Lockliel resources will appear here automatically as they are released.</p>
    </section>}

    {stats?.channels&&Object.values(stats.channels).some((value:any)=>Number(value)>0)&&<section className="ml-panel ml-share-channels">
      <div className="ml-kicker">How you’re sharing</div>
      <h2>Share actions by channel</h2>
      <p>These counts show the channel you chose from My Lockliel. They do not prove a message was delivered or opened.</p>
      <div className="ml-share-channel-grid">
        <article><Share2 size={16}/><strong>{stats.channels.native||0}</strong><span>Native / social</span></article>
        <article><MessageSquareText size={16}/><strong>{stats.channels.sms||0}</strong><span>Text</span></article>
        <article><Mail size={16}/><strong>{stats.channels.email||0}</strong><span>Email</span></article>
        <article><Copy size={16}/><strong>{stats.channels.copy||0}</strong><span>Copied link</span></article>
      </div>
    </section>}

    {stats?.breakdown?.length>0&&<section className="ml-panel ml-share-breakdown">
      <div className="ml-kicker">What is reaching people?</div>
      <h2>Impact by resource</h2>
      <p>These numbers show activity tied to your personal Lockliel links. They are here to help you follow up and serve people, not to rank you against anyone else.</p>

      <div className="ml-share-breakdown-list">
        {stats.breakdown.map((item:any)=><article key={item.id}>
          <div>
            <b>{item.asset?.title||item.contentType||"Shared resource"}</b>
            <span>{item.asset?.asset_type?.replaceAll("_"," ")||item.campaign}</span>
          </div>
          <div><strong>{item.counts.visits}</strong><span>visits</span></div>
          <div><strong>{item.counts.joined}</strong><span>joined</span></div>
          <div><strong>{item.counts.courseStarts}</strong><span>started</span></div>
          <div><strong>{item.counts.lessonCompletions}</strong><span>lessons</span></div>
        </article>)}
      </div>
    </section>}

    {stats&&<p className="ml-privacy-note" style={{marginTop:18}}>
      A visit is anonymous activity, not a known person. Someone becomes a member connection only after they create an account through your personal invitation.
    </p>}
  </>;
}

function ShareAssetCard({
  asset,
  working,
  onShare,
  onCopy,
  onText,
  onEmail
}:{
  asset:any;
  working:boolean;
  onShare:(slug:string)=>void;
  onCopy:(slug:string)=>void;
  onText:(slug:string)=>void;
  onEmail:(slug:string)=>void;
}){
  const Icon=iconFor(asset);

  return <article className="ml-card">
    <div className="ml-icon"><Icon size={21}/></div>
    <h2>{asset.title}</h2>
    <p>{asset.description||"Share this Lockliel resource with someone you have in mind."}</p>

    {asset.share_text&&<p className="ml-approved-share-copy">
      <span>Approved share copy</span>
      {asset.share_text}
    </p>}

    <div className="ml-share-actions">
      <button onClick={()=>onShare(asset.slug)} disabled={working}>
        <Share2 size={15}/> {working?"Preparing…":"Share"}
      </button>
      <button onClick={()=>onText(asset.slug)} disabled={working}>
        <MessageSquareText size={15}/> Text
      </button>
      <button onClick={()=>onEmail(asset.slug)} disabled={working}>
        <Mail size={15}/> Email
      </button>
      <button onClick={()=>onCopy(asset.slug)} disabled={working}>
        <Copy size={15}/> Copy
      </button>
    </div>

    <Link href={asset.destination_path}>Preview resource →</Link>
  </article>;
}
