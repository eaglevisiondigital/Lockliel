export type NextStep = {
  type:string;
  priority:number;
  title:string;
  description:string;
  cta:{label:string;href:string};
  progress?:{completed:number;total:number};
};
export type MemberJourney = {
  onboardingComplete:boolean;
  nextStep:NextStep;
  continueGrowing:{currentLesson?:string|null;latestActivity?:string|null;title:string;available:boolean;complete:boolean;progress:{completed:number;total:number};href:string};
  myFive:{activeCount:number;dueCount:number;maximum:number;href:string};
  community:{state:'none'|'forming'|'active';href:string};
  resources:{id:string;title:string;description:string;href:string}[];
  journey:{stage:string;stages:string[];description:string};
};
