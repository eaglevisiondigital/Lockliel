"use client";
import Link from 'next/link';
import {ArrowUpRight,BookOpen,Users,UsersRound} from 'lucide-react';
import type {MemberJourney,NextStep} from '@/lib/member-journey-types';
import {journeyEvent} from '@/lib/member-journey-events.mjs';

export function NextStepCard({step}:{step:NextStep}) {
  return <section className="ml-panel ml-primary-next" aria-labelledby="next-step-heading">
    <div className="ml-kicker">Your next step</div>
    <h1 id="next-step-heading">{step.title}</h1>
    <p>{step.description}</p>
    {step.progress&&step.progress.total>0&&<div className="ml-step-progress">
      <label htmlFor="next-step-progress">{step.progress.completed} of {step.progress.total} lessons complete</label>
      <progress id="next-step-progress" max={step.progress.total} value={step.progress.completed}/>
    </div>}
    <Link className="ml-action" href={step.cta.href} onClick={()=>journeyEvent('next_step_started')}>{step.cta.label} <ArrowUpRight size={18} aria-hidden="true"/></Link>
  </section>;
}
export default function MemberJourneyPanels({data}:{data:MemberJourney}) {
  const communityCopy={none:'You do not have an active group yet. Explore your options when you are ready.',forming:'Your community connection is taking shape. View your group or the request you already made.',active:'Your group is here to grow alongside you. Open it for gathering details and connection options.'};
  return <>
    <section className="ml-journey-grid" aria-label="Your member journey">
      <article className="ml-card"><BookOpen aria-hidden="true"/><div className="ml-kicker">Continue growing</div><h2>{data.continueGrowing.title}</h2>
        <p>{data.continueGrowing.complete?'You completed this course. Revisit a lesson or help someone else begin.':data.continueGrowing.available?`${data.continueGrowing.progress.completed} of ${data.continueGrowing.progress.total} lessons complete. Your progress is saved.`:'Your course will appear when your enrollment and released content are available. You can explore Faith Boost now.'}</p>
        <Link href={data.continueGrowing.available?data.continueGrowing.href:'/#faith-boost'}>{data.continueGrowing.available?'Open my journey':'Explore Faith Boost'} →</Link>
      </article>
      <article className="ml-card"><Users aria-hidden="true"/><div className="ml-kicker">My Five</div><h2>{data.myFive.activeCount?`${data.myFive.activeCount} of ${data.myFive.maximum} people`:'Start with one person'}</h2>
        <p>{data.myFive.activeCount?`${data.myFive.dueCount} planned follow-ups are ready. Your names, notes and next actions stay private.`:'Who could you pray for and encourage? Add one person now and build your list at your own pace.'}</p>
        <p className="ml-privacy-note">Pray. Connect. Share. Engage. Grow. Disciple.</p><Link href={data.myFive.href}>{data.myFive.activeCount?'Open My Five':'Add my first person'} →</Link>
      </article>
      <article className="ml-card"><UsersRound aria-hidden="true"/><div className="ml-kicker">My community</div><h2>{data.community.state==='active'?'Growing together':data.community.state==='forming'?'A connection is forming':'Find your community'}</h2><p>{communityCopy[data.community.state]}</p><Link href={data.community.href}>View community options →</Link></article>
    </section>
    <section aria-labelledby="for-you-heading"><h2 className="ml-section-title" id="for-you-heading">For you</h2>
      <div className="ml-grid">{data.resources.length?data.resources.map(resource=><article className="ml-card" key={resource.id}><h3>{resource.title}</h3><p>{resource.description}</p><Link href={resource.href}>Explore resource →</Link></article>):<article className="ml-card"><h3>Keep growing in the Word</h3><p>Explore Faith Boost or revisit your resource library while more resources are being prepared.</p><Link href="/#faith-boost">Explore Faith Boost →</Link></article>}</div>
      <p className="ml-privacy-note">Your preferences stay private. <Link href="/my-lockliel/faith-profile">Update what helps you grow</Link>.</p>
    </section>
    <section className="ml-panel ml-growth-progress" aria-labelledby="growth-heading"><div className="ml-kicker">My progress</div><h2 id="growth-heading">{data.journey.stage}</h2><ol className="ml-growth-stages">{data.journey.stages.map(stage=><li key={stage} aria-current={stage===data.journey.stage?'step':undefined}>{stage}</li>)}</ol><p className="ml-privacy-note">{data.journey.description}</p></section>
  </>;
}
