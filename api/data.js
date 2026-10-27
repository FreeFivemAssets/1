import { safe, redis, isAdmin } from '../lib/util.js';

async function handler(req, res) {
  if (!isAdmin(req)) return res.status(401).json({ error: 'unauthorized' });
  const [events, bansFlat, players, shots] = await Promise.all([
    redis('LRANGE', 'events', 0, 199), redis('HGETALL', 'bans'), redis('GET', 'players'), redis('LRANGE', 'shots', 0, 49),
  ]);
  const bans = [];
  for (let i = 1; i < (bansFlat || []).length; i += 2) bans.push(JSON.parse(bansFlat[i]));
  res.json({
    events: (events || []).map((e) => JSON.parse(e)),
    bans: bans.sort((a, b) => b.t - a.t),
    players: players ? JSON.parse(players) : [],
    shots: (shots || []).map((s) => JSON.parse(s)),
  });
}

export default safe(handler);
