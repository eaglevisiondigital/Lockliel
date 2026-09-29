"use client";
import {useEffect,useRef,useState} from "react";

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

function mergeIntervals(input:number[][]){
  const sorted=input
    .map(v=>[Math.max(0,Number(v[0])||0),Math.max(0,Number(v[1])||0)])
    .filter(v=>v[1]>v[0])
    .sort((a,b)=>a[0]-b[0]);
  const merged:number[][]=[];
  for(const interval of sorted){
    const last=merged[merged.length-1];
    if(!last||interval[0]>last[1]+1)merged.push([...interval]);
    else last[1]=Math.max(last[1],interval[1]);
  }
  return merged.slice(-250);
}

export default function YouTubeProgressPlayer({
  asset,
  saved,
  onProgress
}:{
  asset:any;
  saved:any;
  onProgress:(assetId:string,percent:number)=>void;
}){
  const hostId=useRef("yt-"+asset.id.replaceAll("-",""));
  const playerRef=useRef<any>(null);
  const playingRef=useRef(false);
  const lastSampleRef=useRef<number|null>(null);
  const intervalsRef=useRef<number[][]>(Array.isArray(saved?.covered_intervals)?saved.covered_intervals:[]);
  const lastSaveRef=useRef(0);
  const [percent,setPercent]=useState(Number(saved?.percent_watched)||0);

  async function persist(current:number,duration:number,force=false){
    const merged=mergeIntervals(intervalsRef.current);
    intervalsRef.current=merged;
    const played=merged.reduce((sum,v)=>sum+Math.max(0,v[1]-v[0]),0);
    const pct=duration>0?Math.min(100,Math.round((played/duration)*1000)/10):0;
    setPercent(pct);
    onProgress(asset.id,pct);

    const now=Date.now();
    if(!force&&now-lastSaveRef.current<12000)return;
    lastSaveRef.current=now;

    await fetch("/api/lockliel/journey",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        assetId:asset.id,
        lastPositionSeconds:current,
        playedSeconds:played,
        percentWatched:pct,
        coveredIntervals:merged,
        firstStartedAt:saved?.first_started_at||new Date().toISOString()
      })
    }).catch(()=>{});
  }

  useEffect(()=>{
    let timer:number|undefined;
    let cancelled=false;

    ensureYouTube().then(()=>{
      if(cancelled||!window.YT?.Player)return;
      playerRef.current=new window.YT.Player(hostId.current,{
        videoId:asset.provider_ref,
        playerVars:{playsinline:1,rel:0},
        events:{
          onReady:(event:any)=>{
            const resume=Number(saved?.last_position_seconds)||0;
            if(resume>5)event.target.seekTo(resume,true);
          },
          onStateChange:(event:any)=>{
            playingRef.current=event.data===1;
            if(event.data===1){
              lastSampleRef.current=Number(event.target.getCurrentTime())||0;
            }else{
              const current=Number(event.target.getCurrentTime())||0;
              const duration=Number(event.target.getDuration())||0;
              const last=lastSampleRef.current;
              if(last!==null){
                const delta=current-last;
                if(delta>0&&delta<15)intervalsRef.current.push([last,current]);
              }
              lastSampleRef.current=current;
              persist(current,duration,true);
            }
          }
        }
      });

      timer=window.setInterval(()=>{
        const player=playerRef.current;
        if(!player||!playingRef.current||document.visibilityState!=="visible")return;
        const current=Number(player.getCurrentTime?.())||0;
        const duration=Number(player.getDuration?.())||0;
        const last=lastSampleRef.current;
        if(last!==null){
          const delta=current-last;
          if(delta>0&&delta<15)intervalsRef.current.push([last,current]);
        }
        lastSampleRef.current=current;
        persist(current,duration,false);
      },5000);
    });

    return ()=>{
      cancelled=true;
      if(timer)window.clearInterval(timer);
      try{playerRef.current?.destroy?.();}catch{}
    };
  },[asset.id,asset.provider_ref]);

  return <div className="ml-video-progress-card">
    <div className="ml-video-frame"><div id={hostId.current}/></div>
    <div className="ml-video-progress-meta"><span>Watched</span><strong>{Math.round(percent)}%</strong></div>
    <div className="ml-course-progress"><span style={{width:Math.min(100,percent)+"%"}}/></div>
  </div>;
}
