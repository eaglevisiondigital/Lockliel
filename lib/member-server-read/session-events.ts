/** Existing Auth uses this storage key to notify other tabs. Values are never read. */
export const AUTH_CHANGE_STORAGE_KEY='lockliel:auth-change';
type WindowEvents=Pick<Window,'addEventListener'|'removeEventListener'>;
type DocumentEvents=Pick<Document,'addEventListener'|'removeEventListener'|'visibilityState'>;
/** Notifications only invalidate local display; none creates or changes an Auth session. */
export function bindServerReadInvalidation(target:WindowEvents,doc:DocumentEvents,clear:()=>void):()=>void{
 const storage=(event:Event)=>{if((event as StorageEvent).key===AUTH_CHANGE_STORAGE_KEY)clear();};
 const visibility=()=>{if(doc.visibilityState!=='visible')clear();};
 target.addEventListener('storage',storage);
 // Optional future same-window notification. Existing Auth does not dispatch it yet.
 target.addEventListener('lockliel:session-changed',clear);
 target.addEventListener('pagehide',clear);target.addEventListener('blur',clear);
 doc.addEventListener('visibilitychange',visibility);
 return()=>{target.removeEventListener('storage',storage);target.removeEventListener('lockliel:session-changed',clear);target.removeEventListener('pagehide',clear);target.removeEventListener('blur',clear);doc.removeEventListener('visibilitychange',visibility);};
}
