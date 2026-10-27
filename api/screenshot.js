import { redis, isServer, clean } from '../lib/util.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  if (!isServer(req)) return res.status(401).json({ error: 'unauthorized' });
  const b = req.body || {};
  if (typeof b.image !== 'string' || b.image.length > 800000 || !/^data:image\/jpe?g;base64,[A-Za-z0-9+/=]+$/.test(b.image))
    return res.status(400).json({ error: 'bad image' });
  const sid = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const meta = { sid, t: Date.now(), player: clean(b.player, 60), id: clean(b.id, 80), reason: clean(b.reason), server: clean(b.server, 60) };
  await redis('SET', `shot:${sid}`, b.image, 'EX', 604800); // kept 7 days
  await redis('LPUSH', 'shots', JSON.stringify(meta));
  await redis('LTRIM', 'shots', 0, 49);
  res.json({ ok: true });
}
