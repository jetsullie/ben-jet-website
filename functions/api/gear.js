import { listItems, responseItem } from '../_shared/gear.js';
import { gearValueSummary } from '../_shared/gear-value.js';

export const onRequestGet = async ({ env }) => {
  try {
    const items = env.CONTENT_KV ? await listItems(env.CONTENT_KV) : [];
    return Response.json({
      items: items.map(item => responseItem(item)),
      summary: gearValueSummary(items),
    }, { headers: { 'Cache-Control': 'public, max-age=60' } });
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Gear is temporarily unavailable.', items: [] }, { status: 500 });
  }
};
