// Pure presentation of trusted course gates. These labels never grant permission.
export function questionKey(q) { return String(q.number ?? q.id); }
export function worksheetState(questions=[],answers={}) {
 const required=questions.filter(q=>q.required!==false);
 const answered=questions.filter(q=>String(answers[questionKey(q)]||'').trim()).length;
 return {answered,total:questions.length,complete:required.every(q=>String(answers[questionKey(q)]||'').trim())};
}
export function learningState(data={}) {
 const progress=new Map((data.progress||[]).map(p=>[p.lesson_id,p]));
 const gates=new Map((data.gates||[]).map(g=>[g.lesson_id,g]));
 const configured=Boolean(data.course?.learning_rules?.model);
 const lessons=[...(data.lessons||[])].sort((a,b)=>a.position-b.position).map(l=>{
  const p=progress.get(l.id),g=gates.get(l.id);
  const completed=p?.status==='completed';
  const unlocked=completed||(!configured?true:g?.unlocked===true);
  const watchMet=g?.watch_met===true;
  return {...l,readiness:lessonReadiness(data.course,l,data.assets||[]),progress:p,unlocked,watchMet,state:completed?'completed':!unlocked?'locked':watchMet?'watch_requirement_met':p?'in_progress':'not_started'};
 });
 const completed=lessons.filter(l=>l.state==='completed').length;
 const complete=lessons.length>0&&completed===lessons.length;
 const current=lessons.find(l=>l.unlocked&&l.state!=='completed')||null;
 return {lessons,completed,complete,total:lessons.length,percent:lessons.length?Math.round(100*completed/lessons.length):0,current,
 href:current?'/my-lockliel/journey/lesson?lesson='+encodeURIComponent(current.slug):'/my-lockliel/journey'};
}
export function lessonExport(data,lessonId,{includeNotes=false}={}) {
 const lesson=data.lessons?.find(l=>l.id===lessonId);
 if(!lesson)throw new Error('Lesson unavailable');
 const p=data.progress?.find(p=>p.lesson_id===lessonId);
 const qs=p?.content_snapshot?.questions||lesson.worksheet_schema?.questions||[];
 return [data.course.title,`Lesson ${lesson.position}: ${lesson.title}`,'',...qs.flatMap(q=>[`${q.number||''} ${q.text||q.prompt||''}`,String(p?.worksheet_answers?.[questionKey(q)]||''),'']),
 ...(includeNotes?['Personal Notes',data.notes?.find(n=>n.lesson_id===lessonId)?.body||'','']:[]),...(p?.completed_at?['Completed: '+p.completed_at]:[])].join('\n');
}

// Configuration readiness is distinct from a learner's permission/progress gate.
export function lessonReadiness(course,lesson,assets=[]) {
 const rules=course?.learning_rules||{},grip=course?.translation_key==='getting-a-grip-on-the-basics';
 const requiredMedia=['watch_answer','watch_score'].includes(rules.model)||grip;
 const active=assets.filter(a=>a.lesson_id===lesson.id&&(!a.status||a.status==='active'));
 const videos=active.filter(a=>a.asset_type==='video');
 const playable=videos.filter(a=>a.provider==='youtube'&&typeof a.provider_ref==='string'&&a.provider_ref.trim());
 const mediaReady=!requiredMedia||(videos.length>0&&playable.length===videos.length);
 const missingDuration=playable.filter(a=>!Number.isFinite(Number(a.duration_seconds))||Number(a.duration_seconds)<=0||!a.duration_verified_at||!a.duration_verification_source);
 const durationReady=!requiredMedia||(mediaReady&&missingDuration.length===0);
 const questions=lesson.worksheet_schema?.questions;
 const worksheetRequired=grip||(rules.worksheet_required??['watch_answer','watch_score','review'].includes(rules.model));
 const worksheetReady=!worksheetRequired||(Array.isArray(questions)&&questions.length>0&&questions.length<=100&&questions.every(q=>q&&(q.number!=null||q.id)&&typeof(q.text||q.prompt)==='string'&&(q.text||q.prompt).trim()));
 const resourceRequired=grip||rules.resource_required===true;
 const resourceReady=!resourceRequired||active.some(a=>a.asset_type==='pdf'&&(a.resource_mapped===true||Boolean(a.storage_path)));
 const state=!mediaReady?'media_pending':!durationReady?'duration_pending':!worksheetReady||!resourceReady?'content_pending':'ready';
 return {state,ready:state==='ready',requiredMedia,mediaReady,durationReady,worksheetReady,resourceReady,
  missingDurationIds:missingDuration.map(a=>a.id),publishedBlocked:course?.status==='published'&&state!=='ready',
  label:state==='media_pending'?'Media Coming Soon':state==='ready'?'Available':'Lesson Being Prepared',
  message:state==='media_pending'?'The teaching video is coming soon. This lesson will open for completion once it is ready.':state!=='ready'?'We are preparing this lesson. Your saved work is safe, and completion will be available when it is ready.':''};
}
export function courseReadiness(course,lessons=[],assets=[]) {
 const rows=lessons.map(lesson=>({lesson_id:lesson.id,position:lesson.position,title:lesson.title,...lessonReadiness(course,lesson,assets)}));
 return {ready:rows.length>0&&rows.every(r=>r.ready),lessons:rows};
}
