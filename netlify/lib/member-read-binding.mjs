/** Trusted server inputs only. This module never reads browser binding claims or env fallbacks. */
export const ISOLATED_MEMBER_PROJECT = 'qjksggxorghaxvpyslip';
export const ISOLATED_MEMBER_SITE = '70b03a42-6329-476e-bf4b-2b1ce30e9567';
export const MEMBER_READ_PATH = '/api/lockliel/member-read';
export const MEMBER_SERVER_READ_VERSION = 'lockliel-member-server-read-v1';
export const ISOLATED_MEMBER_URL = `https://${ISOLATED_MEMBER_PROJECT}.supabase.co`;

export function pinMemberBinding(expected, runtimeSource) {
  if (!expected || expected.project !== ISOLATED_MEMBER_PROJECT || expected.site !== ISOLATED_MEMBER_SITE ||
      !/^[a-f0-9]{24}$/.test(expected.deploy || '') || !/^[a-f0-9]{40}$/.test(expected.source || '') ||
      runtimeSource !== expected.source) return null;
  return Object.freeze({ project: expected.project, site: expected.site, deploy: expected.deploy, source: expected.source });
}

export function memberRuntimeMatches(binding, context) {
  return Boolean(binding && context?.site?.id === binding.site && context?.deploy?.id === binding.deploy &&
    context?.deploy?.context === 'branch-deploy');
}

/** Pin the current provider permalink separately. Site names are mutable and an old
 * historical alias is not binding evidence. Only server-owned config supplies this. */
export function pinMemberOrigin(binding, expectedOrigin) {
  if (!binding || typeof expectedOrigin !== 'string') return null;
  try {
    const url = new URL(expectedOrigin);
    const suffix = url.hostname.slice(`${binding.deploy}--`.length);
    return url.protocol === 'https:' && !url.username && !url.password && !url.port &&
      url.origin === expectedOrigin && url.hostname.startsWith(`${binding.deploy}--`) &&
      /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.netlify\.app$/.test(suffix) ? url.origin : null;
  } catch { return null; }
}
