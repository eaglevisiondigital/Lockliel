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
  return (request, context) => {
    if (!isProductionDeployment(context)) return backendUnavailable();
    return handler(request, context);
  };
}
