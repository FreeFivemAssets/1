import { safe, redis, isServer, clean } from '../lib/util.js';

async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  if (!isServer(req)) return res.status(401).json({ error: 'unauthorized' });
  const list = (Array.isArray(req.body?.players) ? req.body.players : []).slice(0, 300).map((p) => ({
    id: Number(p.id) || 0, name: clean(p.name, 60), license: clean(p.license, 80),
    strikes: Number(p.strikes) || 0, ping: Number(p.ping) || 0,
  }));
  await redis('SET', 'players', JSON.stringify(list), 'EX', 60); // disappears if server stops reporting
  res.json({ ok: true });
}

export default safe(handler);
