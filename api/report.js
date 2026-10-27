import { redis, isServer, clean } from '../lib/util.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  if (!isServer(req)) return res.status(401).json({ error: 'unauthorized' });

  const b = req.body || {};
  const type = ['flag', 'ban', 'unban'].includes(b.type) ? b.type : 'flag';
  const ev = {
    t: Date.now(), type,
    server: clean(b.server, 60), player: clean(b.player, 60),
    id: clean(b.id, 80), reason: clean(b.reason), strikes: Number(b.strikes) || 0,
  };
  await redis('LPUSH', 'events', JSON.stringify(ev));
  await redis('LTRIM', 'events', 0, 499);
  if (type === 'ban' && ev.id) await redis('HSET', 'bans', ev.id, JSON.stringify(ev));
  if (type === 'unban' && ev.id) await redis('HDEL', 'bans', ev.id);
  res.json({ ok: true });
}
