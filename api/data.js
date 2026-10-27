import { redis, isAdmin } from '../lib/util.js';

export default async function handler(req, res) {
  if (!isAdmin(req)) return res.status(401).json({ error: 'unauthorized' });
  const [events, bansFlat] = await Promise.all([redis('LRANGE', 'events', 0, 199), redis('HGETALL', 'bans')]);
  const bans = [];
  for (let i = 1; i < (bansFlat || []).length; i += 2) bans.push(JSON.parse(bansFlat[i]));
  res.json({ events: (events || []).map((e) => JSON.parse(e)), bans: bans.sort((a, b) => b.t - a.t) });
}
