import cloudflareAccessPlugin from '@cloudflare/pages-plugin-cloudflare-access';

import { isAuthorizedAdmin } from './admin-identity.js';

export const requireOwner = async (context) => {
  const domain = typeof context.env.CF_ACCESS_DOMAIN === 'string' ? context.env.CF_ACCESS_DOMAIN.trim().replace(/\/+$/, '') : '';
  const aud = typeof context.env.CF_ACCESS_AUD === 'string' ? context.env.CF_ACCESS_AUD.trim() : '';
  if (!/^https:\/\/[a-z0-9-]+\.cloudflareaccess\.com$/i.test(domain) || aud.length < 10) {
    return new Response('Admin authentication is not configured.', { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
  const validateAccess = cloudflareAccessPlugin({ domain, aud });
  return validateAccess({ ...context, next: async () => {
    const email = context.data.cloudflareAccess?.JWT?.payload?.email;
    if (!isAuthorizedAdmin(email)) return new Response('Forbidden', { status: 403 });
    if (!['GET', 'HEAD', 'OPTIONS'].includes(context.request.method)) {
      const origin = context.request.headers.get('Origin');
      if (origin !== new URL(context.request.url).origin) return new Response('Forbidden', { status: 403 });
    }
    const response = await context.next();
    const secured = new Response(response.body, response);
    secured.headers.set('Cache-Control', 'no-store');
    secured.headers.set('Content-Security-Policy', "default-src 'self'; base-uri 'self'; connect-src 'self'; form-action 'self'; frame-ancestors 'none'; img-src 'self' blob: data:; object-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'");
    secured.headers.set('X-Content-Type-Options', 'nosniff');
    secured.headers.set('X-Frame-Options', 'DENY');
    return secured;
  }});
};
