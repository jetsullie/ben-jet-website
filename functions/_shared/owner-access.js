import cloudflareAccessPlugin from '@cloudflare/pages-plugin-cloudflare-access';

import { isAuthorizedAdmin } from './admin-identity.js';

const accessDomain = (env) => {
  const configured = env.CF_ACCESS_DOMAIN || env.CF_ACCESS_TEAM_DOMAIN;
  if (typeof configured !== 'string') return '';
  const value = configured.trim().replace(/\/+$/, '');
  return value && !/^https?:\/\//i.test(value) ? `https://${value}` : value;
};

export const requireOwner = async (context) => {
  const domain = accessDomain(context.env);
  const configuredAud = context.env.CF_ACCESS_AUD || context.env.CF_ACCESS_AUDIENCE;
  const aud = typeof configuredAud === 'string' ? configuredAud.trim() : '';
  const missing = [];
  if (!/^https:\/\/[a-z0-9-]+\.cloudflareaccess\.com$/i.test(domain)) missing.push('CF_ACCESS_DOMAIN');
  if (aud.length < 10) missing.push('CF_ACCESS_AUD');
  if (missing.length) {
    return new Response(`Admin authentication is not configured. Missing Pages variable: ${missing.join(', ')}. Set it for the deployed environment, not only Preview.`, {
      status: 503,
      headers: { 'Cache-Control': 'no-store' },
    });
  }
  const validateAccess = cloudflareAccessPlugin({ domain, aud });
  return validateAccess({ ...context, next: async () => {
    const email = context.data.cloudflareAccess?.JWT?.payload?.email;
    if (!isAuthorizedAdmin(email, context.env.CF_ACCESS_ADMIN_EMAILS)) return new Response('Forbidden', { status: 403 });
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
