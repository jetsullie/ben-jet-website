import { readSettings } from '../_shared/site-settings.js';
export const onRequestGet = async ({env}) => {
  try { return Response.json({settings:await readSettings(env)},{headers:{'Cache-Control':'no-store'}}); }
  catch { return Response.json({error:'Settings are temporarily unavailable.'},{status:503}); }
};
