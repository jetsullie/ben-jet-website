export const SETTINGS_KEY = 'team-site:settings';
export const defaultSettings = {
  location: 'Austin, Texas',
  contacts: {
    jet: { name: 'Jet Sullivan', description: 'Talk with Jet about your project.', email: 'contact@jetsullivan.com', phone: '', website: '', buttonLabel: 'Email Jet', color: '#93e9f9' },
    ben: { name: 'Ben Stapleton', description: 'To reach Ben, get in touch through Jet for now.', email: 'contact@jetsullivan.com', phone: '', website: '', buttonLabel: 'Connect with Ben via Jet', color: '#93e9f9' },
  },
};
export class SettingsError extends Error {}
const text = (value, label, max, required = false) => {
  if (typeof value !== 'string') throw new SettingsError(`${label} must be text.`);
  const clean = value.trim();
  if ((required && !clean) || clean.length > max || /[\u0000-\u001f\u007f]/.test(clean)) throw new SettingsError(`Enter a valid ${label.toLowerCase()} (${max} characters maximum).`);
  return clean;
};
export const validateSettings = value => {
  if (!value || typeof value !== 'object') throw new SettingsError('Invalid settings.');
  const result = { location: text(value.location, 'Location', 100, true), contacts: {} };
  for (const id of ['jet', 'ben']) {
    const source = value.contacts?.[id];
    if (!source || typeof source !== 'object') throw new SettingsError(`Missing ${id} contact details.`);
    const contact = {
      name: text(source.name, 'Name', 80, true), description: text(source.description, 'Description', 350),
      email: text(source.email, 'Email', 254), phone: text(source.phone, 'Phone', 40),
      website: text(source.website, 'Website', 2048), buttonLabel: text(source.buttonLabel, 'Button label', 60, true),
      color: text(source.color, 'Panel color', 7, true),
    };
    if (contact.email && !/^[^\s@?&#]+@[^\s@?&#]+\.[^\s@?&#]+$/.test(contact.email)) throw new SettingsError('Enter a valid email address.');
    if (contact.phone && (!/^[+\d\s().-]+$/.test(contact.phone) || !/\d/.test(contact.phone))) throw new SettingsError('Enter a valid phone number.');
    if (!/^#[0-9a-f]{6}$/i.test(contact.color)) throw new SettingsError('Choose a valid panel color.');
    if (contact.website) {
      let url; try { url = new URL(contact.website); } catch { throw new SettingsError('Enter a valid HTTPS website.'); }
      if (url.protocol !== 'https:' || url.username || url.password) throw new SettingsError('Website links must use HTTPS without embedded credentials.');
      contact.website = url.href;
    }
    if (!contact.email && !contact.phone && !contact.website) throw new SettingsError(`Add an email, phone number, or website for ${contact.name}.`);
    result.contacts[id] = contact;
  }
  return result;
};
export const readSettings = async env => {
  const stored = env.CONTENT_KV ? await env.CONTENT_KV.get(SETTINGS_KEY, 'json') : null;
  return stored ? validateSettings(stored) : structuredClone(defaultSettings);
};
