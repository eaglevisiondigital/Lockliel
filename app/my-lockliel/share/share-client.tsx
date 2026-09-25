"use client";
import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  Copy,
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
  const [error,setError]=useState("");

  async function load(){
    const [statsRes,libraryRes]=await Promise.all([
      fetch("/api/lockliel/share-stats",{cache:"no-store"}),
      fetch("/api/lockliel/share-library",{cache:"no-store"})
    ]);

    if(statsRes.status===401||libraryRes.status===401){
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
  }

  useEffect(()=>{load();},[]);

  async function getLink(slug:string){
    setWorking(slug);
    setMessage("");

    const r=await fetch("/api/lockliel/share-link",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({slug})
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

  async function copy(slug:string){
    try{
      const d=await getLink(slug);
      await navigator.clipboard.writeText(d.url);
      setMessage("Personal link copied. Send it to someone you have in mind, then follow up.");
    }catch{}
  }

  async function share(slug:string){
    try{
      const d=await getLink(slug);

      if(navigator.share){
        await navigator.share({
          title:d.title,
          text:d.shareText||"I thought this might encourage you.",
          url:d.url
        });
      }else{
        await navigator.clipboard.writeText(d.url);
        setMessage("Personal link copied.");
      }
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

    {message&&<p className="ml-share-message">{message}</p>}
    {error&&<p className="ml-auth-message error">{error}</p>}

    {featured.length>0&&<>
      <h2 className="ml-section-title">Featured to share</h2>
      <section className="ml-grid">
        {featured.map(asset=><ShareAssetCard key={asset.id} asset={asset} working={working===asset.slug} onShare={share} onCopy={copy}/>)}
      </section>
    </>}

    {standard.length>0&&<>
      <h2 className="ml-section-title">Share Library</h2>
      <section className="ml-grid">
        {standard.map(asset=><ShareAssetCard key={asset.id} asset={asset} working={working===asset.slug} onShare={share} onCopy={copy}/>)}
      </section>
    </>}

    {!library.length&&!error&&<section className="ml-card">
      <Share2 size={21}/>
      <h2>Share resources are being prepared.</h2>
      <p>Approved Lockliel resources will appear here automatically as they are released.</p>
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
  onCopy
}:{
  asset:any;
  working:boolean;
  onShare:(slug:string)=>void;
  onCopy:(slug:string)=>void;
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
      <button onClick={()=>onCopy(asset.slug)} disabled={working}>
        <Copy size={15}/> Copy link
      </button>
    </div>

    <Link href={asset.destination_path}>Preview resource →</Link>
  </article>;
}
