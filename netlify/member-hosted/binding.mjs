import { pinMemberBinding, ISOLATED_MEMBER_SITE, ISOLATED_MEMBER_PROJECT } from '../lib/member-read-binding.mjs';

export const HOSTED_VERSION = 'lockliel-member-hosted-v1';
export const HOSTED_CONTEXT = 'deploy-preview';
export const HOSTED_SITE_NAME = 'jade-unicorn-642f40';
export const HOSTED_KEY_NAME = 'LOCKLIEL_MEMBER_READ_PUBLISHABLE_KEY';
export const HOSTED_READ_PATH = '/api/lockliel/member-read';
export const HOSTED_LOGIN_PATH = '/api/lockliel-auth/login';
export const HOSTED_LOGOUT_PATH = '/api/lockliel-auth/logout';
const fields = ['version', 'binding', 'origin', 'context', 'schema', 'protocol', 'paused'];

export function validateHostedPin(value) {
  try {
    if (!value || Object.getPrototypeOf(value) !== Object.prototype || Object.keys(value).sort().join() !== [...fields].sort().join()) return null;
    const binding = pinMemberBinding(value.binding, value.binding?.source);
    if (!binding || Object.keys(value.binding).sort().join() !== ['deploy','project','site','source'].join() ||
        value.version !== HOSTED_VERSION || value.context !== HOSTED_CONTEXT || value.schema !== 280 ||
        value.protocol !== '278-v1' || value.paused !== true ||
        value.origin !== `https://${binding.deploy}--${HOSTED_SITE_NAME}.netlify.app`) return null;
    return Object.freeze({ version: HOSTED_VERSION, binding, origin: value.origin, context: HOSTED_CONTEXT, schema: 280, protocol: '278-v1', paused: true });
  } catch { return null; }
}

export function hostedContextMatches(pin, context, runtimeSource) {
  return Boolean(pin && runtimeSource === pin.binding.source && context?.site?.id === ISOLATED_MEMBER_SITE &&
    context?.deploy?.id === pin.binding.deploy && context?.deploy?.context === HOSTED_CONTEXT && context?.deploy?.published === false);
}

export function privatePublishableKey(keyReader) {
  try {
    const key = keyReader?.(HOSTED_KEY_NAME);
    return typeof key === 'string' && /^sb_publishable_[A-Za-z0-9_-]{12,200}$/.test(key) ? key : null;
  } catch { return null; }
}
export { ISOLATED_MEMBER_PROJECT, ISOLATED_MEMBER_SITE };
