/** Caller-owned read projections. No browser identity or permission authority. */
export const SERVER_READ_VERSION='lockliel-member-server-read-v1' as const;
export const ISOLATED_PROJECT='qjksggxorghaxvpyslip' as const;
export const ISOLATED_SITE='70b03a42-6329-476e-bf4b-2b1ce30e9567' as const;
export type IsolatedReadBinding=Readonly<{project:typeof ISOLATED_PROJECT;site:typeof ISOLATED_SITE;deploy:string;source:string}>;
export type ReadSection<T>=Readonly<{status:'ready';value:T}|{status:'missing'|'unavailable'}>;
export type ServerProfile=Readonly<{displayName:string;initials:string;onboardingStatus:string}>;
export type ServerPreferences=Readonly<{ministryEmail:boolean;faithBoostEmail:boolean;bookReleaseEmail:boolean;partnerEmail:boolean;smsUpdates:boolean;revision:string}>;
export type ServerMemberSnapshot=Readonly<{
 version:typeof SERVER_READ_VERSION;nonce:string;generation:number;boundary:string;validUntil:number;binding:IsolatedReadBinding;
 identity:Readonly<{status:'ready';value:Readonly<{displayName:string;initials:string;assurance:'aal1'|'aal2'}>}>;
 profile:ReadSection<ServerProfile>;preferences:ReadSection<ServerPreferences>;
 dashboard:Readonly<{status:'ready';value:Readonly<{courseAvailability:'unavailable'}>}>;
}>;
export type ServerReadState=Readonly<{status:'idle'|'loading'|'unavailable'|'anonymous'|'forbidden'|'expired'|'error';generation:number}|{status:'ready';generation:number;data:ServerMemberSnapshot}>;
export type ServerReadResult=Readonly<{status:'ready';data:ServerMemberSnapshot}|{status:'unavailable'|'anonymous'|'forbidden'|'error'}>;
export interface ServerMemberReadPort {read(input:Readonly<{nonce:string;generation:number;signal:AbortSignal}>):Promise<ServerReadResult>}
