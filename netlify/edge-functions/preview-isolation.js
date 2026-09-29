import { backendUnavailable, isProductionDeployment } from '../lib/deployment-safety.mjs';

export default function previewIsolation(request, context) {
  if (isProductionDeployment(context)) return;
  // All non-read methods are blocked, including native Netlify Forms POSTs to
  // static pages. GET is also unsafe for referral tracking and session refresh.
  const path = decodeURIComponent(new URL(request.url).pathname).toLowerCase();
  const connectedPath = /^(?:\/api(?:\/|$)|\/\.netlify\/functions(?:\/|$)|\/r(?:\/|$)|\/who-god-says-you-are\/reader(?:\/|$))/.test(path);
  if (!['GET', 'HEAD'].includes(request.method) || connectedPath) return backendUnavailable();
  // Returning undefined continues to the static page without changing its HTML.
}

export const config = { path: '/*', onError: 'fail' };
