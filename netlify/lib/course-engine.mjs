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
  return {...l,progress:p,unlocked,watchMet,state:completed?'completed':!unlocked?'locked':watchMet?'watch_requirement_met':p?'in_progress':'not_started'};
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
