"use client";
import {useEffect,useState} from "react";
import {BellRing,Mail,MessageSquareText} from "lucide-react";
export default function PreferencesClient(){
 const [prefs,setPrefs]=useState<any>(null),[message,setMessage]=useState(""),[saving,setSaving]=useState(false);
 useEffect(()=>{fetch("/api/lockliel/preferences",{cache:"no-store"}).then(async r=>{if(r.status===401){location.assign("/my-lockliel/sign-in");return;}const d=await r.json();setPrefs(d.preferences||{ministry_email:false,faith_boost_email:false,book_release_email:false,partner_email:false,sms_updates:false});});},[]);
 async function submit(e:React.FormEvent<HTMLFormElement>){e.preventDefault();setSaving(true);setMessage("");const f=new FormData(e.currentTarget);const r=await fetch("/api/lockliel/preferences",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({ministryEmail:f.get("ministryEmail")==="yes",faithBoostEmail:f.get("faithBoostEmail")==="yes",bookReleaseEmail:f.get("bookReleaseEmail")==="yes",partnerEmail:f.get("partnerEmail")==="yes",smsUpdates:f.get("smsUpdates")==="yes"})});const d=await r.json().catch(()=>({}));setSaving(false);if(!r.ok){setMessage(d.error||"Unable to save preferences.");return;}setPrefs(d.preferences);setMessage("Your communication preferences have been saved.");}
 if(!prefs)return <div className="ml-loading">Loading your preferences…</div>;
 const choices=[
  ["ministryEmail","ministry_email",Mail,"Lockliel ministry updates","Important ministry news, resources, and major Lockliel updates by email."],
  ["faithBoostEmail","faith_boost_email",BellRing,"Faith Boost email reminders","Faith Boost resources and reminders by email."],
  ["bookReleaseEmail","book_release_email",Mail,"Book release notifications","Release updates for books and resources you specifically asked to hear about."],
  ["partnerEmail","partner_email",Mail,"Partner updates","Ministry impact and partnership-related updates by email."],
  ["smsUpdates","sms_updates",MessageSquareText,"Text message updates","Future Lockliel reminders and updates by text. Message/data rates may apply."]
 ];
 return <form className="ml-panel ml-preferences-form" onSubmit={submit}><div className="ml-kicker">Communication preferences</div><h2>You choose how Lockliel contacts you.</h2><p>Transactional account, security, receipt, or requested follow-up messages are separate from these optional ministry communications.</p><div className="ml-preference-list">{choices.map(([name,key,Icon,title,text]:any)=><label className="ml-preference-row" key={name}><div className="ml-icon"><Icon size={17}/></div><div><b>{title}</b><span>{text}</span></div><input type="checkbox" name={name} value="yes" defaultChecked={Boolean(prefs[key])}/></label>)}</div>{message&&<p className="ml-share-message">{message}</p>}<button className="ml-action" disabled={saving}>{saving?"Saving…":"Save preferences"}</button><p className="ml-privacy-note">Changes are recorded with a consent history so your choices can be honored over time.</p></form>;
}