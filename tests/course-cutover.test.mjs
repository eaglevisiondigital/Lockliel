import test from 'node:test';
import assert from 'node:assert/strict';
import {courseCutover,staleCourseClient} from '../netlify/lib/course-cutover.mjs';
import {createJourneyHandler} from '../netlify/functions/lockliel-journey.mjs';
import {createLessonSaver} from '../lib/course/autosave.mjs';
const request=protocol=>new Request('https://synthetic.invalid/api/lockliel/journey',{method:'POST',headers:protocol?{'x-lockliel-course-protocol':protocol}:{},body:'{}'});
test('cutover gate fails closed on missing state, network error and protocol mismatch',async()=>{
 for(const fetcher of [async()=>{throw Error();},async()=>Response.json({}, {status:404}),async()=>Response.json({paused:false,protocol:'old'}),async()=>Response.json({paused:true,protocol:'278-v1'})])assert.equal((await courseCutover('synthetic',{fetcher})).status,503);
 assert.equal(await courseCutover('synthetic',{fetcher:async()=>Response.json({paused:false,protocol:'278-v1'})}),null);
});
test('stale clients get explicit reload response; protocol is compatibility, not authentication',()=>{
 for(const version of [null,'old'])assert.equal(staleCourseClient(request(version)).status,426);
 assert.equal(staleCourseClient(request('278-v1')),null);
});
test('maintenance and old client deny before lesson loader or write transport',async()=>{
 let accesses=0;const sessionFor=async()=>({user:{id:'synthetic'},access:'synthetic'});
 const h=createJourneyHandler({sessionFor,cutoverFor:async()=>Response.json({code:'course_maintenance'},{status:503}),loader:()=>{accesses++;},fetcher:()=>{accesses++;}});
 assert.equal((await h(request('278-v1'))).status,503);assert.equal(accesses,0);
 const stale=createJourneyHandler({sessionFor,cutoverFor:async()=>null,fetcher:()=>{accesses++;}});assert.equal((await stale(request())).status,426);assert.equal(accesses,0);
});
for(const code of ['course_maintenance','course_reload_required'])test(code+' retains private draft, blocks retry and restores it on reload',async()=>{
 const data=new Map(),storage={getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v)};let writes=0;
 const options={user:'a',lesson:'one',cloud:{revision:0},storage,delay:100000,send:async()=>{writes++;throw Object.assign(Error(),{code});}};
 const saver=createLessonSaver(options);saver.update({answers:{1:'Synthetic draft'},notes:'Synthetic private note'});assert.equal(await saver.flush(),false);assert.equal(saver.snapshot().blocked,true);assert.match(saver.snapshot().state,/Draft Saved/);assert.equal(await saver.retry(),false);assert.equal(writes,1);saver.close();
 const reloaded=createLessonSaver(options);assert.equal(reloaded.snapshot().value.answers[1],'Synthetic draft');reloaded.close();
 const other=createLessonSaver({...options,user:'b'});assert.equal(other.snapshot().value.notes,'');other.close();
});
test('maintenance with unavailable local storage tells learner to copy draft',async()=>{
 const saver=createLessonSaver({user:'a',lesson:'one',cloud:{},delay:100000,storage:{getItem:()=>null,setItem:()=>{throw Error();}},send:async()=>{throw Object.assign(Error(),{code:'course_maintenance'});}});saver.update({answers:{1:'Keep me'},notes:''});await saver.flush();assert.match(saver.snapshot().state,/Copy Your Draft/);assert.equal(saver.snapshot().value.answers[1],'Keep me');saver.close();
});
