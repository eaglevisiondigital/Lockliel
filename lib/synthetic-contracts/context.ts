/** Synthetic contract vocabulary only. These caller-supplied fixtures are never live authentication or authorization. */
export const SYNTHETIC_SCHEMA = 'lockliel-synthetic-v1' as const;
export const LOCKLIEL_ORG = 'synthetic-lockliel' as const;
export type SyntheticOrganization = 'synthetic-lockliel' | 'synthetic-champion-life' | 'synthetic-sowgo';
export type SyntheticContext = Readonly<{
  schemaVersion: typeof SYNTHETIC_SCHEMA;
  mode: 'synthetic';
  organizationId: SyntheticOrganization;
  actorId: string;
  aal: 1 | 2;
  sessionActive: true;
  grants: readonly string[];
}>;
export const NO_EFFECTS = Object.freeze({save:false,send:false,schedule:false,grant:false,publish:false,pay:false,execute:false});
export const isRecord = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype;
export const isSyntheticId = (value: unknown): value is string => typeof value === 'string' && /^synthetic-[a-z0-9][a-z0-9-]{0,62}$/.test(value);
export const isRevision = (value: unknown): value is number => Number.isSafeInteger(value) && Number(value) >= 0;
export const isPlainText = (value: unknown, max=240): value is string => typeof value === 'string' && value.trim().length>0 && value.length<=max && !/[<>\u0000-\u001f\u007f]/.test(value);
const organizations:readonly string[]=['synthetic-lockliel','synthetic-champion-life','synthetic-sowgo'];
const contextKeys=['schemaVersion','mode','organizationId','actorId','aal','sessionActive','grants'];
export function isSyntheticContext(value: unknown, organizationId: SyntheticOrganization = LOCKLIEL_ORG): value is SyntheticContext {
  if(!isRecord(value)||Object.keys(value).length!==contextKeys.length||contextKeys.some(key=>!Object.hasOwn(value,key)))return false;
  return value.schemaVersion===SYNTHETIC_SCHEMA && value.mode==='synthetic' && organizations.includes(organizationId) && value.organizationId===organizationId && isSyntheticId(value.actorId) && (value.aal===1||value.aal===2) && value.sessionActive===true && Array.isArray(value.grants) && value.grants.length<=32 && new Set(value.grants).size===value.grants.length && value.grants.every(grant=>typeof grant==='string'&&/^[a-z][a-z0-9:-]{0,63}$/.test(grant));
}
export function hasSyntheticGrant(value:unknown, grant:string, organizationId:SyntheticOrganization=LOCKLIEL_ORG, minimumAal:1|2=1): value is SyntheticContext {
  return (minimumAal===1||minimumAal===2)&&isSyntheticContext(value,organizationId)&&value.aal>=minimumAal&&value.grants.includes(grant);
}
export function isSyntheticOwner(value:unknown, ownerId:unknown, organizationId:SyntheticOrganization=LOCKLIEL_ORG): value is SyntheticContext {
  return isSyntheticId(ownerId)&&isSyntheticContext(value,organizationId)&&value.actorId===ownerId;
}
/** L6 owns projection/eligibility semantics; coordinator freezes this minimal consumer shape. No content/locator/recipient fields. */
export type SyntheticCatalogItemV1 = Readonly<{
 schemaVersion:'lockliel-catalog-preview-v1'; mode:'synthetic'; organizationId:typeof LOCKLIEL_ORG;
 resourceId:string; revision:number; label:string; language:string;
 kind:'course-invitation'|'resource-invitation'|'training'|'book';
 publication:'inactive'|'active'; availability:'available'|'unavailable';
 visibility:'public'|'member'|'entitled'; shareable:boolean;
}>;
