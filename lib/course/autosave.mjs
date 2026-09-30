export const draftKey=(user,lesson)=>'lockliel:course:v1:'+user+':'+lesson;
// Transport/storage injection makes failure, account switches and racing edits testable.
export function createLessonSaver({user,lesson,cloud,storage,send,onChange=(_state)=>{void _state;},delay=800,isOnline=()=>true}) {
 let value={answers:cloud.worksheet_answers||{},notes:cloud.notes||''};
 let revision=cloud.revision||0,dirty=false,blocked=false,closed=false,timer,inflight=null,edit=0,retries=0;
 let state=cloud.last_activity_at?'Saved':'Ready',lastSaved=cloud.last_activity_at||null,conflictDraft=null;
 const key=draftKey(user,lesson);
 const archiveKey=key+':conflict';
 const emit=()=>onChange({value,revision,dirty,state,lastSaved,conflictDraft,blocked});
 function persist(){if(conflictDraft&&blocked)return true;try{storage.setItem(key,JSON.stringify({user,lesson,revision,value:dirty?value:undefined,dirty}));return true;}catch{return false;}}
 try{
  const archive=JSON.parse(storage.getItem(archiveKey)||'null');
  if(archive?.user===user&&archive?.lesson===lesson)conflictDraft=archive.value||null;
  const d=JSON.parse(storage.getItem(key)||'null');
  if(d?.user===user&&d?.lesson===lesson&&d.dirty&&typeof d.value?.notes==='string'&&d.value?.answers&&Object.values(d.value.answers).every(v=>typeof v==='string')){
   if(d.revision===revision){value=cloud.status==='completed'?{answers:value.answers,notes:d.value.notes}:d.value;dirty=true;state='Cloud Sync Needed';}
   else {conflictDraft=d.value;blocked=true;state='Cloud Sync Needed';}
  }
 }catch{/* Invalid local drafts never replace cloud state. */}
 function schedule(){clearTimeout(timer);if(!closed&&!blocked&&dirty)timer=setTimeout(()=>void flush(),delay);}
 async function flush(complete=false){
  clearTimeout(timer);
  if(closed||blocked)return false;
  if(inflight){await inflight;if(complete||dirty)return flush(complete);return true;}
  if(!dirty&&!complete)return true;
  const sentEdit=edit,sentValue=value;
  state='Saving…';emit();
  inflight=(async()=>{
   try{
    const result=await send({expectedUserId:user,lessonId:lesson,expectedRevision:revision,answers:sentValue.answers,notes:sentValue.notes,complete});
    if(closed||blocked)return false;
    if(!Number.isSafeInteger(result?.revision)||result.revision!==revision+1)throw new Error('Save acknowledgement unavailable');
    revision=result.revision;lastSaved=result.last_activity_at;retries=0;
    dirty=edit!==sentEdit;state=dirty?'Cloud Sync Needed':'Saved';
    persist();return true;
   }catch(error){
    if(closed)return false;
    if(error.code==='account_changed'){blocked=true;value={answers:{},notes:''};state='Account Changed';}
    else if(error.code==='revision_conflict'){blocked=true;conflictDraft=value;state='Cloud Sync Needed';}
    else {retries++;state=persist()?(!isOnline()?'Offline Draft Saved':retries<5?'Save Failed, Retrying':'Save Failed; Retry Needed'):'Save Failed; Device Storage Unavailable';}
    return false;
   }finally{inflight=null;clearTimeout(timer);emit();if(dirty&&!blocked&&!closed&&retries<5)timer=setTimeout(()=>void flush(),Math.min(30000,delay*2**retries));}
  })();
  return inflight;
 }
 schedule();
 return {
  snapshot:()=>({value,revision,dirty,state,lastSaved,conflictDraft,blocked}),
  update(next){if(closed||blocked)return;value=next;dirty=true;edit++;state=persist()?(isOnline()?'Cloud Sync Needed':'Offline Draft Saved'):'Device Storage Unavailable';emit();schedule();},
  flush,
  useCloud(nextCloud){
   if(closed||!Number.isSafeInteger(nextCloud?.revision)||nextCloud.revision<revision)return false;
   try{
    storage.setItem(archiveKey,JSON.stringify({user,lesson,value:conflictDraft||value}));
    storage.setItem(key,JSON.stringify({user,lesson,revision:nextCloud.revision,dirty:false}));
   }catch{state='Device Storage Unavailable';emit();return false;}
   value={answers:nextCloud.worksheet_answers||{},notes:nextCloud.notes||''};
   revision=nextCloud.revision;lastSaved=nextCloud.last_activity_at||null;dirty=false;blocked=false;state='Saved';retries=0;emit();return true;
  },
  offline(){if(dirty){state=persist()?'Offline Draft Saved':'Device Storage Unavailable';emit();}},
  retry(){if(!blocked){retries=0;return flush();}return Promise.resolve(false);},
  invalidate(){persist();blocked=true;closed=true;clearTimeout(timer);value={answers:{},notes:''};conflictDraft=null;state='Account Changed';emit();},
  close(){persist();closed=true;clearTimeout(timer);},
 };
}
