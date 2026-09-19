import { readSettings, validateSettings, SETTINGS_KEY, SettingsError } from '../../_shared/site-settings.js';
const json = (body, status=200) => Response.json(body, {status, headers:{'Cache-Control':'no-store'}});
export const onRequestGet = async ({env}) => {
  if (!env.CONTENT_KV) return json({error:'CONTENT_KV binding is missing.'},503);
  try { return json({settings:await readSettings(env)}); } catch { return json({error:'Settings could not be loaded.'},500); }
};
export const onRequestPut = async ({request,env}) => {
  if (!env.CONTENT_KV) return json({error:'CONTENT_KV binding is missing.'},503);
  let payload; try { payload=await request.json(); } catch { return json({error:'Invalid JSON.'},400); }
  try { const settings=validateSettings(payload);await env.CONTENT_KV.put(SETTINGS_KEY,JSON.stringify(settings));return json({settings}); }
  catch(error){return json({error:error instanceof SettingsError?error.message:'Settings could not be saved.'},error instanceof SettingsError?400:500);}
};
