"use client";
import Link from 'next/link';
import {useEffect,useRef,useState} from 'react';
import {NextStepCard} from '../member-journey-panels';
import type {MemberJourney} from '@/lib/member-journey-types';
import {journeyEvent} from '@/lib/member-journey-events.mjs';

type Profile={first_name?:string;last_name?:string;phone?:string;city?:string;region?:string;country?:string;locale?:string;timezone?:string;onboarding_status?:string};
type Preferences={growthInterests:string[];newBeliever:boolean};
const choices=[['faith-development','Grow in my faith'],['biblical-foundations','Understand the Bible better'],['identity-in-christ','Learn who I am in Christ'],['prayer','Strengthen my prayer life'],['healing-wholeness','Find healing and encouragement'],['family-relationships','Strengthen family and relationships'],['evangelism','Reach and help other people'],['discipleship','Help someone else grow']] as const;

export default function OnboardingClient(){
  const [profile,setProfile]=useState<Profile|null>(null);
  const [preferences,setPreferences]=useState<Preferences>({growthInterests:[],newBeliever:false});
  const [step,setStep]=useState(1),[saving,setSaving]=useState(false),[error,setError]=useState('');
  const [journey,setJourney]=useState<MemberJourney|null>(null);
  const started=useRef(false);
  useEffect(()=>{
    let active=true;
    fetch('/api/lockliel/onboarding',{cache:'no-store'}).then(async response=>{
      if(response.status===401){location.replace('/my-lockliel/sign-in');return;}
      if(!response.ok)throw new Error('Welcome steps are unavailable. Please try again.');
      const data=await response.json();
      if(!active)return;
      setProfile(data.profile);setPreferences(data.preferences);
      if(!started.current){journeyEvent('onboarding_started');started.current=true;}
    }).catch(()=>{if(active)setError('Welcome steps are unavailable. Please try again.');});
    return ()=>{active=false;};
  },[]);
  async function confirmProfile(event:React.FormEvent<HTMLFormElement>){
    event.preventDefault();if(!profile||saving)return;
    setSaving(true);setError('');
    try{
      const response=await fetch('/api/lockliel/profile',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({firstName:profile.first_name,lastName:profile.last_name,phone:profile.phone||'',city:profile.city,region:profile.region,country:profile.country,locale:profile.locale||'en-US',timezone:profile.timezone||''})});
      if(response.status===401){location.replace('/my-lockliel/sign-in');return;}
      const result=await response.json();if(!response.ok)throw new Error(result.error||'Please try again.');
      setStep(2);
    }catch(reason){setError(reason instanceof Error?reason.message:'We could not confirm your profile.');}
    finally{setSaving(false);}
  }
  async function finish(){
    if(saving)return;setSaving(true);setError('');
    try{
      const response=await fetch('/api/lockliel/onboarding',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...preferences,privacyAcknowledged:true})});
      if(response.status===401){location.replace('/my-lockliel/sign-in');return;}
      const result=await response.json();if(!response.ok||!result.complete)throw new Error(result.error||'We could not save your preferences.');
      journeyEvent('onboarding_completed');journeyEvent('next_step_completed');setStep(4);
      await loadNextStep();
    }catch(reason){setError(reason instanceof Error?reason.message:'We could not complete your welcome steps.');}
    finally{setSaving(false);}
  }
  async function loadNextStep(){
    const response=await fetch('/api/lockliel/next-step',{cache:'no-store'});
    if(response.status===401){location.replace('/my-lockliel/sign-in');return;}
    if(!response.ok)throw new Error('Your preferences are saved. Open My Lockliel or retry loading your next step.');
    const result=await response.json();setJourney(result);journeyEvent('next_step_viewed');
  }
  function toggle(value:string){setPreferences(current=>({...current,growthInterests:current.growthInterests.includes(value)?current.growthInterests.filter(item=>item!==value):[...current.growthInterests,value]}));}
  if(!profile)return <section className="ml-auth-card"><h1>Welcome to Lockliel</h1><p role="status">{error||'Loading your welcome steps…'}</p>{error&&<button className="ml-action" onClick={()=>location.reload()}>Try again</button>}</section>;
  return <>
    <div className="ml-kicker">Welcome to Lockliel</div><p className="ml-onboarding-progress" aria-live="polite">Step {step} of 4</p>
    {step<4&&<h1>{step===1?'Let’s start with you.':step===2?'What would help you most right now?':'Your answers are private.'}</h1>}
    {error&&<p className="ml-auth-message error" role="alert">{error}</p>}
    {step===1&&<form className="ml-auth-card" onSubmit={confirmProfile}><p>Confirm what you have already shared. Your location helps you explore relevant community options.</p>
      <div className="ml-auth-row">{(['first_name','last_name'] as const).map((field,index)=><label key={field}>{index?'Last name':'First name'}<input autoComplete={index?'family-name':'given-name'} required maxLength={120} value={profile[field]||''} onChange={event=>setProfile({...profile,[field]:event.target.value})}/></label>)}</div>
      <div className="ml-auth-row"><label>City<input autoComplete="address-level2" required maxLength={160} value={profile.city||''} onChange={event=>setProfile({...profile,city:event.target.value})}/></label><label>State / region<input autoComplete="address-level1" required maxLength={160} value={profile.region||''} onChange={event=>setProfile({...profile,region:event.target.value})}/></label></div>
      <label>Country<input autoComplete="country-name" required maxLength={160} value={profile.country||''} onChange={event=>setProfile({...profile,country:event.target.value})}/></label><button className="ml-action" disabled={saving}>{saving?'Saving…':'Confirm and continue'}</button>
    </form>}
    {step===2&&<section className="ml-auth-card"><p>Choose any that would help. You can also continue without selecting anything.</p><fieldset className="ml-interest-field"><legend>My growth interests</legend><div className="ml-interest-grid">{choices.map(([value,label])=><label key={value}><input type="checkbox" checked={preferences.growthInterests.includes(value)} onChange={()=>toggle(value)}/><span>{label}</span></label>)}<label><input type="checkbox" checked={preferences.newBeliever} onChange={event=>setPreferences({...preferences,newBeliever:event.target.checked})}/><span>I am new to following Jesus</span></label></div></fieldset><p>Looking for Christian community? You can explore My Community from your dashboard and choose whether to request help.</p><div className="ml-onboarding-actions"><button onClick={()=>setStep(1)}>Back</button><button className="ml-action" onClick={()=>setStep(3)}>Continue</button></div></section>}
    {step===3&&<section className="ml-auth-card"><p>Lockliel uses these answers to recommend useful next steps. They are not a public profile, and you can change them later in your faith and connection preferences.</p><p>These growth selections do not submit group or hosting requests, change existing requests, or give anyone permission to contact you. You remain in control of those choices.</p><p>We welcome people across Christian backgrounds and those exploring faith. Our teaching starts with Scripture and invites you to grow at your own pace.</p><div className="ml-onboarding-actions"><button disabled={saving} onClick={()=>setStep(2)}>Back</button><button className="ml-action" disabled={saving} onClick={finish}>{saving?'Saving…':'Save and see my next step'}</button></div></section>}
    {step===4&&<><p className="ml-privacy-note">Your preferences are saved. You can change them whenever you need.</p>{journey?<NextStepCard step={journey.nextStep}/>:<button className="ml-action" disabled={saving} onClick={()=>{setError('');void loadNextStep().catch(()=>setError('Your next step is unavailable. You can still open My Lockliel.'));}}>Retry next step</button>}<Link className="ml-onboarding-dashboard" href="/my-lockliel">Open My Lockliel →</Link></>}
  </>;
}
