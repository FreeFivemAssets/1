import { redis, isAdmin } from '../lib/util.js';

export default async function handler(req, res) {
  if (!isAdmin(req)) return res.status(401).json({ error: 'unauthorized' });
  const sid = String(req.query.sid || '');
  if (!/^[a-z0-9]+$/.test(sid)) return res.status(400).json({ error: 'bad id' });
  const image = await redis('GET', `shot:${sid}`);
  if (!image) return res.status(404).json({ error: 'expired' });
  res.json({ image });
}
