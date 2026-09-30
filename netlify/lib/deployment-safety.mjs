import {backendConfig} from './backend-config.mjs';
// Trust Netlify's invocation context, never request headers, hostname, NODE_ENV,
// or the build-time CONTEXT variable. Unknown/local contexts have no live backend.
export function isProductionDeployment(context) {
  return context?.deploy?.context === 'production';
}

export function backendUnavailable() {
  const message = 'Connected features are disabled in this preview. No information was submitted.';
  return Response.json({ ok: false, code: 'production_backend_disabled', error: message, message }, {
    status: 503,
    headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' },
  });
}

export function withProductionBackend(handler) {
  return withConfiguredBackend(handler,backendConfig);
}

// One explicitly authorized, pinned isolated target. No environment override.
export function withConfiguredBackend(handler,binding) {
  return (request, context) => {
    if(binding.mode==='isolated-course-rehearsal') {
      if(binding.site!=='70b03a42-6329-476e-bf4b-2b1ce30e9567'
        ||binding.url!=='https://qjksggxorghaxvpyslip.supabase.co'
        ||binding.origin!=='https://rehearsal--jade-unicorn-642f40.netlify.app'
        ||!binding.key?.startsWith('sb_publishable_')
        ||context?.site?.id!==binding.site
        ||context?.deploy?.context!=='branch-deploy') return backendUnavailable();
      return handler(request,context);
    }
    if (binding.mode!=='production'||!isProductionDeployment(context)) return backendUnavailable();
    return handler(request, context);
  };
}
