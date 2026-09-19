// Only consult this policy after Cloudflare Access has verified the JWT.
const DEFAULT_AUTHORIZED_EMAILS = [
  'jetsullivan1@gmail.com',
  'benstapleton06@gmail.com',
];

const configuredEmails = (value) => typeof value === 'string'
  ? value.split(',').map((email) => email.trim().toLowerCase()).filter(Boolean)
  : [];

export const isAuthorizedAdmin = (email, configured = '') => {
  if (typeof email !== 'string') return false;
  const authorizedEmails = new Set([
    ...DEFAULT_AUTHORIZED_EMAILS,
    ...configuredEmails(configured),
  ]);
  return authorizedEmails.has(email.toLowerCase());
};
