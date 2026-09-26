"use client";

import {useEffect,useState} from "react";
import {useRouter} from "next/navigation";

const interests=[
  ["biblical-foundations","Biblical foundations"],
  ["identity-in-christ","Identity in Christ"],
  ["prayer","Prayer"],
  ["faith-development","Growing in faith"],
  ["evangelism","Reaching people"],
  ["discipleship","Discipleship"],
  ["leadership","Leadership"],
  ["healing-wholeness","Healing & wholeness"],
  ["family-relationships","Family & relationships"]
];

export default function FaithProfileForm(){
  const router=useRouter();
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  const [message,setMessage]=useState("");
  const [existing,setExisting]=useState(false);

  const [faithStage,setFaithStage]=useState("");
  const [churchBackground,setChurchBackground]=useState("");
  const [ministryExperience,setMinistryExperience]=useState("");
  const [growthInterests,setGrowthInterests]=useState<string[]>([]);
  const [wantsGroup,setWantsGroup]=useState(false);
  const [wantsHost,setWantsHost]=useState(false);
  const [preferredConnection,setPreferredConnection]=useState("either");

  useEffect(()=>{
    fetch("/api/lockliel/faith-profile",{cache:"no-store"}).then(async r=>{
      if(r.status===401){
        location.assign("/my-lockliel/sign-in");
        return;
      }

      const d=await r.json().catch(()=>({}));
      if(r.ok&&d.profile){
        setExisting(true);
        setFaithStage(d.profile.faith_stage||"");
        setChurchBackground(d.profile.church_background||"");
        setMinistryExperience(d.profile.ministry_experience||"");
        setGrowthInterests(Array.isArray(d.profile.growth_interests)?d.profile.growth_interests:[]);
        setWantsGroup(Boolean(d.profile.wants_group));
        setWantsHost(Boolean(d.profile.wants_host));
        setPreferredConnection(d.profile.preferred_connection||"either");
      }

      setLoading(false);
    }).catch(()=>{
      setMessage("Unable to load your current faith profile.");
      setLoading(false);
    });
  },[]);

  function toggleInterest(slug:string,checked:boolean){
    setGrowthInterests(current=>
      checked
        ? [...new Set([...current,slug])]
        : current.filter(item=>item!==slug)
    );
  }

  async function submit(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const r=await fetch("/api/lockliel/faith-profile",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        faithStage,
        churchBackground,
        ministryExperience,
        growthInterests,
        wantsGroup,
        wantsHost,
        preferredConnection
      })
    });

    const d=await r.json().catch(()=>({}));
    setSaving(false);

    if(r.status===401){
      location.assign("/my-lockliel/sign-in");
      return;
    }

    if(!r.ok){
      setMessage(d.error||"Unable to save.");
      return;
    }

    router.push(existing?"/my-lockliel":"/my-lockliel/journey");
    router.refresh();
  }

  if(loading)return <div className="ml-loading">Loading your faith journey…</div>;

  return <form className="ml-auth-card ml-faith-form" onSubmit={submit}>
    <label>
      Where would you say you are right now in your faith journey?
      <select value={faithStage} onChange={e=>setFaithStage(e.target.value)}>
        <option value="">Choose an option</option>
        <option value="exploring">Exploring faith</option>
        <option value="new-believer">New believer</option>
        <option value="growing">Growing in my faith</option>
        <option value="established">Established believer</option>
        <option value="serving-leading">Serving or leading</option>
        <option value="prefer-not-to-answer">Prefer not to answer</option>
      </select>
    </label>

    <label>
      Church or faith background <span>Optional</span>
      <textarea
        rows={3}
        value={churchBackground}
        onChange={e=>setChurchBackground(e.target.value)}
        placeholder="For example: Baptist, Methodist, Pentecostal, Word of Faith, nondenominational, new to church, or anything else you want us to know."
      />
    </label>

    <label>
      Ministry or serving experience <span>Optional</span>
      <textarea
        rows={3}
        value={ministryExperience}
        onChange={e=>setMinistryExperience(e.target.value)}
        placeholder="Tell us only what you are comfortable sharing."
      />
    </label>

    <fieldset className="ml-interest-field">
      <legend>What would you most like to grow in?</legend>
      <div className="ml-interest-grid">
        {interests.map(([slug,label])=><label key={slug}>
          <input
            type="checkbox"
            checked={growthInterests.includes(slug)}
            onChange={e=>toggleInterest(slug,e.target.checked)}
          />
          <span>{label}</span>
        </label>)}
      </div>
    </fieldset>

    <fieldset className="ml-interest-field">
      <legend>How would you like to connect?</legend>
      <label className="ml-check-line">
        <input type="checkbox" checked={wantsGroup} onChange={e=>setWantsGroup(e.target.checked)}/>
        I'd like help finding a Lockliel group or gathering.
      </label>
      <label className="ml-check-line">
        <input type="checkbox" checked={wantsHost} onChange={e=>setWantsHost(e.target.checked)}/>
        I'm interested in possibly hosting or helping lead.
      </label>
    </fieldset>

    <label>
      Connection preference
      <select value={preferredConnection} onChange={e=>setPreferredConnection(e.target.value)}>
        <option value="either">Online or local</option>
        <option value="local">Local connection if available</option>
        <option value="online">Online connection</option>
        <option value="not-now">Not right now</option>
      </select>
    </label>

    <p className="ml-privacy-note">
      This information is private and is used to personalize discipleship and appropriate ministry follow-up. It is not a public profile.
    </p>

    {message&&<p className="ml-auth-message error">{message}</p>}

    <button className="ml-action" disabled={saving}>
      {saving?"Saving…":existing?"Save changes":"Save and begin my journey"}
    </button>
  </form>;
}
