"use client";
import {useEffect,useEffectEvent,useRef,useState} from "react";

declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
    __locklielYouTubePromise?: Promise<void>;
  }
}

function ensureYouTube(){
  if(typeof window==="undefined")return Promise.resolve();
  if(window.YT?.Player)return Promise.resolve();
  if(window.__locklielYouTubePromise)return window.__locklielYouTubePromise;

  window.__locklielYouTubePromise=new Promise<void>(resolve=>{
    const previous=window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady=()=>{
      previous?.();
      resolve();
    };
    if(!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')){
      const script=document.createElement("script");
      script.src="https://www.youtube.com/iframe_api";
      script.async=true;
      document.head.appendChild(script);
    }
  });
  return window.__locklielYouTubePromise;
}

export default function YouTubeProgressPlayer({asset,saved,learnerId,onProgress}:{asset:any;saved:any;learnerId:string;onProgress:(assetId:string,percent:number)=>void}){
 const hostId="yt-"+asset.id.replaceAll("-","");
 const initialPosition=useRef(Number(saved?.last_position_seconds)||0);
 const notify=useEffectEvent((pct:number)=>onProgress(asset.id,pct));
 const playerRef=useRef<any>(null),playingRef=useRef(false),busy=useRef(false);
 const [percent,setPercent]=useState(Number(saved?.percent_watched)||0),[error,setError]=useState(''),[reloadRequired,setReloadRequired]=useState(false);
 useEffect(()=>{
  let cancelled=false,stopped=false,failures=0,timer:number|undefined;const abort=new AbortController();
  async function sample(playing:boolean){
   if(cancelled||stopped||busy.current||!playerRef.current)return;
   busy.current=true;
   try{
    const response=await fetch('/api/lockliel/journey',{method:'POST',signal:abort.signal,headers:{'Content-Type':'application/json','x-lockliel-course-protocol':'278-v1'},body:JSON.stringify({expectedUserId:learnerId,assetId:asset.id,positionSeconds:Number(playerRef.current.getCurrentTime())||0,playing})});
    const body=await response.json();
    if([401,403,426,503].includes(response.status)){stopped=true;if(timer)clearInterval(timer);setReloadRequired(true);playerRef.current?.pauseVideo?.();setError(body.error||'Watch progress is paused. Reload the course before continuing.');return;}
    if(!response.ok)throw Error(body.error||'Watch progress could not be saved.');
    failures=0;
    if(!cancelled){const pct=Number(body.mediaProgress?.percent_watched)||0;setPercent(pct);setError('');if(pct>=(asset.watch_threshold||95))notify(pct);}
   }catch(e){if(!cancelled){failures++;if(failures>=5){stopped=true;if(timer)clearInterval(timer);setReloadRequired(true);}setError(e instanceof Error?e.message:'Watch progress could not be saved.');}}finally{busy.current=false;}
  }
  ensureYouTube().then(()=>{
   if(cancelled||!window.YT?.Player)return;
   playerRef.current=new window.YT.Player(hostId,{videoId:asset.provider_ref,playerVars:{playsinline:1,rel:0},events:{
    onReady:(event:any)=>{if(initialPosition.current>5)event.target.seekTo(initialPosition.current,true);},
    onStateChange:(event:any)=>{playingRef.current=event.data===1;void sample(false);},
    onError:()=>setError('This video could not be loaded. Your worksheet is retained.')
   }});
   timer=window.setInterval(()=>{if(playingRef.current&&document.visibilityState==='visible')void sample(true);},5000);
  });
  const visibility=()=>{if(document.visibilityState==='visible')void sample(false);};document.addEventListener('visibilitychange',visibility);
  return()=>{cancelled=true;abort.abort();if(timer)clearInterval(timer);document.removeEventListener('visibilitychange',visibility);try{playerRef.current?.destroy?.();}catch{}};
 },[asset.id,asset.provider_ref,asset.watch_threshold,learnerId,hostId]);
 return <div className="ml-video-progress-card"><div className="ml-video-frame"><div id={hostId}/></div><div className="ml-video-progress-meta"><span>Video Progress</span><strong>{Math.floor(percent)}% Watched</strong></div><progress value={percent} max={100} aria-label="Video Watch Progress"/>{error&&<p role="alert">{error}</p>}{reloadRequired&&<button onClick={()=>location.reload()}>Reload Course</button>}</div>;
}
