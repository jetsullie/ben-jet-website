// Only consult this policy after Cloudflare Access has verified the JWT.
const AUTHORIZED_EMAILS = new Set([
  'jetsullivan1@gmail.com',
  'benstapleton06@gmail.com',
]);

export const isAuthorizedAdmin = (email) =>
  typeof email === 'string' && AUTHORIZED_EMAILS.has(email.toLowerCase());
