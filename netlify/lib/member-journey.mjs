import {nextPersonAction} from './my-five.mjs';
// Pure member guidance. This module never writes data or grants authorization.
export const ACTIVE_REACH_STATUSES = ['praying','invited','connected','growing'];
export const JOURNEY_STAGES = ['Starting','Growing','Sharing','Discipling','Leading','Multiplying'];
const paths = { onboarding:'/my-lockliel/onboarding', course:'/my-lockliel/journey', five:'/my-lockliel/connections', group:'/my-lockliel/group', founder:'/my-lockliel/founder', share:'/my-lockliel/share' };

export function onboardingComplete(profile, faith) {
  return profile?.onboarding_status === 'active' && Boolean(faith);
}
export function safeResourcePath(value) {
  if (typeof value !== 'string' || value.length > 500 || !value.startsWith('/') || /[\\\s\u0000-\u001f]/.test(value)) return null;
  try {
    let decoded = value;
    for(let i=0;i<3;i++) {
      const next=decodeURIComponent(decoded);
      if(next===decoded)break;
      decoded=next;
    }
    if(/%(?:25|2f|5c)/i.test(decoded))return null;
    if (decoded.startsWith('//') || /[\\\u0000-\u001f]/.test(decoded)) return null;
    const url = new URL(decoded, 'https://lockliel.invalid');
    if (url.origin !== 'https://lockliel.invalid' || /^\/(api|\.netlify|r)(\/|$)/i.test(url.pathname)) return null;
    return value === '/faith-boost' ? '/#faith-boost' : value;
  } catch { return null; }
}
function resourceCards(rows, faith, locale) {
  const interests = new Set(faith?.growth_interests || []);
  const language = String(locale || 'en').toLowerCase().replaceAll('_','-').split('-')[0];
  const candidates = rows.filter(row => row.status === 'active' && safeResourcePath(row.destination_path) && [language,'en'].includes(row.language_code || 'en'));
  const families = new Map();
  for (const row of candidates) {
    const key = row.translation_key || row.slug;
    const current = families.get(key);
    if (!current || (row.language_code === language && current.language_code !== language)) families.set(key,row);
  }
  return [...families.values()].sort((a,b) =>
    Number(interests.has(b.category)) - Number(interests.has(a.category)) ||
    Number(Boolean(b.featured)) - Number(Boolean(a.featured)) ||
    Number(a.sort_order || 0) - Number(b.sort_order || 0) || String(a.slug).localeCompare(String(b.slug))
  ).slice(0,3).map(row => ({id:row.id,title:row.title,description:row.description || 'Explore a resource and share encouragement.',href:safeResourcePath(row.destination_path)}));
}
export function courseState(journey = {}) {
  const lessons = [...(journey.lessons || [])].sort((a,b) => a.position-b.position || String(a.id).localeCompare(String(b.id)));
  const progress = new Map((journey.progress || []).map(row => [row.lesson_id,row]));
  const media = new Map((journey.mediaProgress || []).map(row => [row.asset_id,row]));
  const available = journey.course?.status === 'published' && lessons.length > 0;
  const completed = lessons.filter(lesson => progress.get(lesson.id)?.status === 'completed').length;
  const complete = Boolean(lessons.length && completed === lessons.length);
  const started = (journey.progress || []).some(row => ['in_progress','completed'].includes(row.status)) || (journey.mediaProgress || []).some(row => Number(row.percent_watched) > 0);
  const unfinished = lessons.filter(lesson => progress.get(lesson.id)?.status !== 'completed');
  const current = unfinished.filter(lesson => progress.get(lesson.id)?.status === 'in_progress').sort((a,b) =>
    String(progress.get(b.id)?.last_activity_at || '').localeCompare(String(progress.get(a.id)?.last_activity_at || '')) || a.position-b.position
  )[0] || unfinished[0];
  const currentProgress = current ? progress.get(current.id) : null;
  const assets = (journey.assets || []).filter(asset => asset.lesson_id === current?.id && asset.asset_type === 'video');
  const videoIncomplete = assets.some(asset => Number(media.get(asset.id)?.percent_watched || 0) < 95);
  const worksheetRequired = Boolean(current?.worksheet_schema?.questions?.length);
  const worksheetIncomplete = worksheetRequired && currentProgress?.worksheet_status !== 'completed';
  const href = current ? paths.course+'/lesson?lesson='+encodeURIComponent(current.slug) : paths.course;
  return {available,started,complete,completed,total:lessons.length,current,videoIncomplete,worksheetIncomplete,href};
}
const step = (type,priority,title,description,label,href,progress) => ({type,priority,title,description,cta:{label,href},...(progress ? {progress} : {})});

export function buildMemberJourney(state, now = new Date()) {
  const complete = onboardingComplete(state.profile,state.faith);
  const course = courseState(state.course);
  const active = (state.reach || []).filter(row => ACTIVE_REACH_STATUSES.includes(row.status));
  const personal=nextPersonAction(active,now);
  const due = active.filter(row => row.followupAllowed!==false && row.next_follow_up_at && Date.parse(row.next_follow_up_at) <= Number(now));
  const operational = (state.groups || []).filter(group => ['forming','active'].includes(group.status));
  const pendingGroup = (state.requests || []).some(row => row.status === 'open' && ['find_local_group','join_group'].includes(row.request_type));
  const communityState = operational.some(group => group.status === 'active') ? 'active' : operational.length || pendingGroup ? 'forming' : 'none';
  const resources = resourceCards(state.resources || [],state.faith,state.profile?.locale);
  const progress = {completed:course.completed,total:course.total};
  let nextStep;
  if (!complete) nextStep = step('onboarding',1,'Make yourself at home','Confirm your profile and choose what would help you grow. Your answers are private.','Continue welcome',paths.onboarding);
  else if (course.available && course.started && !course.complete && course.current) {
    // Active-course priority includes its unfinished requirements, not a competing rule in the UI.
    const type = course.videoIncomplete ? 'lesson_video' : course.worksheetIncomplete ? 'lesson_worksheet' : 'course_continue';
    const description = course.videoIncomplete ? 'Continue the teaching. Watch each required video to at least 95%.' : course.worksheetIncomplete ? 'Complete the worksheet or lesson notes, then finish your lesson.' : 'Pick up your next lesson and keep growing in the Word.';
    nextStep = step(type,2,'Continue: '+course.current.title,description,course.videoIncomplete?'Continue video':course.worksheetIncomplete?'Open worksheet':'Continue lesson',course.href,progress);
  } else if (course.available && !course.complete && course.current && (course.videoIncomplete || course.worksheetIncomplete) && state.course?.progress?.some(row => row.lesson_id === course.current.id)) {
    nextStep = step('lesson_requirement',3,'Finish your lesson','Return to the teaching and worksheet to complete the lesson requirements.','Open lesson',course.href,progress);
  } else if (course.available && !course.started && !course.complete) nextStep = step('grip_start',4,'Start Getting a Grip on the Basics','Build a foundation through 13 lessons, teaching videos and worksheets.','Start my first lesson',course.href,progress);
  else if (!active.length) nextStep = step('my_five_empty',5,'Begin your My Five','Choose one person to pray for and encourage. You can keep up to five active people here.','Add my first person',paths.five);
  else if (personal) nextStep = step('my_five_followup',6,personal.action.label+' with '+personal.person.display_name,personal.action.description,'Open person',personal.action.href);
  else if (due.length) nextStep = step('my_five_followup',6,'Make a thoughtful follow-up','A follow-up you planned is ready. Review your private My Five list and choose an appropriate next action.','Review my follow-ups',paths.five);
  else if (state.groupCheckinDue) nextStep = step('group_checkin',7,'Check in with your group','Record this week’s gathering and any support your group needs.','Open my group',paths.group);
  else if (communityState === 'none' && state.faith?.wants_group && state.faith?.preferred_connection !== 'not-now') nextStep = step('community',7,'Explore Christian community','Review your connection options. You decide whether to request help finding a group.','Explore my community',paths.group);
  else if (state.orientationPending && ['accepted','orientation','active_host'].includes(state.founderStatus)) nextStep = step('founder_orientation',8,'Continue your host orientation','Work through the approved orientation steps at your own pace.','Open orientation',paths.founder);
  else if (resources.length) nextStep = step('resource',9,'Find encouragement for today','Explore a resource and consider who else it could encourage.','Open resource',resources[0].href);
  else nextStep = step('healthy_growth',10,'Keep growing and helping others','You have room to reflect, revisit a lesson or encourage someone in your My Five.','Review my journey',paths.course);

  // These labels never leave this projection as roles, grants or eligibility flags.
  const hasHostMembership = operational.some(group => ['host','leader'].includes(group.myRole));
  const shared = active.some(row => row.last_shared_at || ['invited','connected','growing'].includes(row.status));
  const stage = !complete ? 'Starting' : hasHostMembership ? 'Leading' : active.some(row => row.status === 'growing') ? 'Discipling' : shared ? 'Sharing' : 'Growing';
  return {
    onboardingComplete:complete,nextStep,
    continueGrowing:{title:state.course?.course?.title || 'Getting a Grip on the Basics',available:course.available,complete:course.complete,progress,href:course.href},
    myFive:{activeCount:active.length,dueCount:due.length,maximum:5,href:paths.five},
    community:{state:communityState,href:paths.group},
    resources,
    journey:{stage,stages:JOURNEY_STAGES,description:'A guide for growth, not a role or permission. Multiplying is a continuing goal, not an inferred achievement.'}
  };
}
