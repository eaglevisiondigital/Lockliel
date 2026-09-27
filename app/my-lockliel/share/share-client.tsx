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

type Asset={id:string;slug:string;title:string;asset_type:string;category?:string;description?:string;share_text?:string;destination_path:string;featured?:boolean;lanes?:string[]};
type ReachPerson={id:string;display_name:string;status:string};
type Stats={totals?:Record<string,number>;channels?:Record<string,number>;breakdown?:{id:string;asset?:{title?:string;asset_type?:string};contentType:string;campaign:string;counts:{visits:number;joined:number;courseStarts:number;lessonCompletions:number}}[]};
function iconFor(asset:Asset){
  const type=String(asset.category||asset.asset_type||"").toLowerCase();
  if(type.includes("faith"))return <Radio size={21}/>;
  if(type.includes("book"))return <BookOpen size={21}/>;
  if(type.includes("video"))return <Video size={21}/>;
  if(type.includes("graphic")||type.includes("image"))return <FileImage size={21}/>;
  if(type.includes("invitation")||type.includes("founder"))return <Users size={21}/>;
  return <Sparkles size={21}/>;
}

export default function ShareCenter(){
  const [working,setWorking]=useState<string|null>(null);
  const [message,setMessage]=useState("");
  const [stats,setStats]=useState<Stats|null>(null);
  const [library,setLibrary]=useState<Asset[]>([]);
  const [reachContacts,setReachContacts]=useState<ReachPerson[]>([]);
  const [selectedReachId,setSelectedReachId]=useState("");
  const [error,setError]=useState("");
  const [lanes,setLanes]=useState<{id:string;label:string}[]>([]);
  const [lane,setLane]=useState("");
  const [kind,setKind]=useState("");
  const [prepared,setPrepared]=useState<{id:string;name:string}|null>(null);

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
      setLibrary(d.assets||[]);setLanes(d.lanes||[]);
    }else{
      const d=await libraryRes.json().catch(()=>({}));
      setError(d.error||"Unable to load Share Library.");
    }

    if(reachRes.ok){
      const d=await reachRes.json();
      const contacts=d.reachContacts||[];
      setReachContacts(contacts);

    }
  }

  useEffect(()=>{Promise.resolve().then(()=>{const query=new URLSearchParams(location.search);setSelectedReachId(query.get("person")||"");setKind(query.get("kind")==="invitation"?"invitation":"");return load();}).catch(()=>setError("Unable to load sharing. Please try again."));},[]);

  async function getLink(slug:string,channel="native"){
    if(selectedReachId&&!reachContacts.some(person=>person.id===selectedReachId))throw new Error("Choose an active person or select normal sharing.");
    setWorking(slug);setPrepared(null);
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
    if(!r.ok){
      setMessage(d.error||"Unable to create link.");
      throw new Error(d.error);
    }

    await load();
    return d;
  }

  async function markSelectedShared(){
    if(!prepared)return;
    setWorking("confirm");
    try {
    const detail=await fetch("/api/lockliel/my-five?id="+encodeURIComponent(prepared.id),{cache:"no-store"});
    const current=await detail.json();if(!detail.ok)throw new Error(current.error||"Unable to confirm sharing.");
    const response=await fetch("/api/lockliel/my-five",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({action:"shared",id:prepared.id,version:current.person.version})
    });
    const result=await response.json();if(!response.ok)throw new Error(result.error||"Unable to confirm sharing.");
    setMessage("Your share confirmation is saved. Plan a thoughtful follow-up from the person page.");setPrepared(null);
    }catch(error){setMessage(error instanceof Error?error.message:"Unable to confirm sharing.");}finally{setWorking(null);}
  }

  async function copy(slug:string){
    try{
      const d=await getLink(slug,"copy");
      await navigator.clipboard.writeText(d.url);
      setPrepared(d.reachContact?{id:d.reachContact.id,name:d.reachContact.displayName}:null);
      setMessage(d.reachContact
        ?"Personal link copied for "+d.reachContact.displayName+". Confirm below only after you send it."
        :"Personal link copied. Send it to someone you have in mind, then follow up.");
    }catch(error){setMessage(error instanceof Error?error.message:"Sharing was not completed.");}finally{setWorking(null);}
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
        setPrepared(d.reachContact?{id:d.reachContact.id,name:d.reachContact.displayName}:null);
        if(d.reachContact)setMessage("Share prepared for "+d.reachContact.displayName+". Confirm below only after you send it.");
      }else{
        await navigator.clipboard.writeText(d.url);
        setPrepared(d.reachContact?{id:d.reachContact.id,name:d.reachContact.displayName}:null);
        setMessage(d.reachContact?"Personal link copied for "+d.reachContact.displayName+". Confirm below only after you send it.":"Personal link copied.");
      }
    }catch(error){setMessage(error instanceof Error?error.message:"Sharing was not completed.");}finally{setWorking(null);}
  }

  async function text(slug:string){
    try{
      const d=await getLink(slug,"sms");
      const body=encodeURIComponent((d.shareText||"I thought this might encourage you.")+"\n\n"+d.url);
      setPrepared(d.reachContact?{id:d.reachContact.id,name:d.reachContact.displayName}:null);
      window.location.href="sms:?body="+body;
    }catch(error){setMessage(error instanceof Error?error.message:"Sharing was not completed.");}finally{setWorking(null);}
  }

  async function email(slug:string){
    try{
      const d=await getLink(slug,"email");
      const subject=encodeURIComponent(d.title||"Something from Lockliel");
      const body=encodeURIComponent((d.shareText||"I thought this might encourage you.")+"\n\n"+d.url);
      setPrepared(d.reachContact?{id:d.reachContact.id,name:d.reachContact.displayName}:null);
      window.location.href="mailto:?subject="+subject+"&body="+body;
    }catch(error){setMessage(error instanceof Error?error.message:"Sharing was not completed.");}finally{setWorking(null);}
  }

  const totals=stats?.totals||{};
  const impact: [string,number,typeof Share2][]=[
    ["Links prepared",totals.share_initiated||0,Share2],
    ["Unique visits",totals.visit||0,Eye],
    ["People joined",totals.unique_joined||0,UserPlus],
    ["Discipleship starts",totals.course_started||0,Sprout],
    ["Lessons completed",totals.lesson_completed||0,CheckCircle2]
  ];

  const selectedReach=useMemo(
    ()=>reachContacts.find(person=>person.id===selectedReachId)||null,
    [reachContacts,selectedReachId]
  );
  const results=useMemo(()=>library.filter(asset=>(!lane||asset.lanes?.includes(lane))&&(!kind||asset.asset_type===kind)),[library,lane,kind]);
  const featured=results.filter(asset=>asset.featured);
  const standard=results.filter(asset=>!asset.featured);
  const invalidPerson=Boolean(selectedReachId&&!selectedReach);

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
      {impact.map(([label,value,Icon])=><article key={label}>
        <Icon size={18}/>
        <strong>{value}</strong>
        <span>{label}</span>
      </article>)}
    </section>

    {<section className="ml-panel ml-share-person">
      <div>
        <div className="ml-kicker">Share mode</div>
        <h2>Who do you have in mind?</h2>
        <p>Choose someone from My Five to create a private person-specific attribution path. Their name is never placed in the public link.</p>
      </div>
      <label htmlFor="share-person">
        Share with
        <select id="share-person" aria-label="Share with" disabled={Boolean(working)} value={selectedReachId} onChange={e=>{setSelectedReachId(e.target.value);setPrepared(null);}}>
          <option value="">Share normally</option>{invalidPerson&&<option value={selectedReachId}>Selected person unavailable</option>}
          {reachContacts.map(person=><option key={person.id} value={person.id}>
            {person.display_name} • {String(person.status||"").replaceAll("_"," ")}
          </option>)}
        </select>
      </label>
      {selectedReach&&<small>Selected: {selectedReach.display_name}. Preparing a link never marks it delivered. Confirm a share after sending it.</small>}
    </section>}

    <section className="ml-panel ml-share-lanes" style={{marginBottom:20}}><h2>What would help this person right now?</h2><p>Choose a need they have shared with you. These lanes use released library categories; some may not have a resource yet.</p><div className="ml-share-actions"><button aria-pressed={!lane} onClick={()=>setLane("")}>All resources</button>{lanes.map(item=><button key={item.id} aria-pressed={lane===item.id} onClick={()=>setLane(item.id)}>{item.label}</button>)}</div>{kind&&<p>Showing released invitations. <button onClick={()=>setKind("")}>Show all resource types</button></p>}</section>
    {invalidPerson&&<p role="alert">This person is unavailable. Choose an active My Five person or explicitly select “Share normally.”</p>}
    {prepared&&<section className="ml-panel"><p>Did you send the resource to {prepared.name}? Copying or opening a share app does not confirm delivery.</p><button disabled={Boolean(working)} onClick={markSelectedShared}>I shared this</button> <Link href={"/my-lockliel/connections/person?id="+encodeURIComponent(prepared.id)}>Plan follow-up</Link></section>}
    {!results.length&&!error&&<p>No released resources match this selection. Choose another lane or check back later.</p>}
    {message&&<p className="ml-share-message">{message}</p>}
    {error&&<p className="ml-auth-message error">{error}</p>}

    {featured.length>0&&<>
      <h2 className="ml-section-title">Featured to share</h2>
      <section className="ml-grid">
        {featured.map(asset=><ShareAssetCard key={asset.id} asset={asset} working={Boolean(working)||invalidPerson} onShare={share} onCopy={copy} onText={text} onEmail={email}/>)}
      </section>
    </>}

    {standard.length>0&&<>
      <h2 className="ml-section-title">Share Library</h2>
      <section className="ml-grid">
        {standard.map(asset=><ShareAssetCard key={asset.id} asset={asset} working={Boolean(working)||invalidPerson} onShare={share} onCopy={copy} onText={text} onEmail={email}/>)}
      </section>
    </>}

    {!library.length&&!error&&<section className="ml-card">
      <Share2 size={21}/>
      <h2>Share resources are being prepared.</h2>
      <p>Approved Lockliel resources will appear here automatically as they are released.</p>
    </section>}

    {stats?.channels&&Object.values(stats.channels).some(value=>Number(value)>0)&&<section className="ml-panel ml-share-channels">
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

    {Boolean(stats?.breakdown?.length)&&<section className="ml-panel ml-share-breakdown">
      <div className="ml-kicker">What is reaching people?</div>
      <h2>Impact by resource</h2>
      <p>These numbers show activity tied to your personal Lockliel links. They are here to help you follow up and serve people, not to rank you against anyone else.</p>

      <div className="ml-share-breakdown-list">
        {stats?.breakdown?.map(item=><article key={item.id}>
          <div>
            <b>{item.asset?.title||item.contentType||"Shared resource"}</b>
            <span>{item.asset?.asset_type?.replaceAll("_"," ")||item.campaign}</span>
          </div>
          <div><strong>{item.counts.visits}</strong><span>unique visits</span></div>
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
  asset:Asset;
  working:boolean;
  onShare:(slug:string)=>void;
  onCopy:(slug:string)=>void;
  onText:(slug:string)=>void;
  onEmail:(slug:string)=>void;
}){

  return <article className="ml-card">
    <div className="ml-icon">{iconFor(asset)}</div>
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
