import { safe, redis, isServer, isAdmin, clean } from '../lib/util.js';

async function handler(req, res) {
  // FiveM server polls and drains the queue
  if (req.method === 'GET') {
    if (!isServer(req)) return res.status(401).json({ error: 'unauthorized' });
    const list = (await redis('LRANGE', 'commands', 0, -1)) || [];
    if (list.length) await redis('DEL', 'commands');
    return res.json(list.map((c) => JSON.parse(c)));
  }
  // Dashboard queues a command
  if (req.method === 'POST') {
    if (!isAdmin(req)) return res.status(401).json({ error: 'unauthorized' });
    const b = req.body || {};
    if (!['ban', 'unban', 'kick', 'screenshot'].includes(b.action) || !b.id) return res.status(400).json({ error: 'bad request' });
    await redis('RPUSH', 'commands', JSON.stringify({ action: b.action, id: clean(b.id, 80), reason: clean(b.reason) }));
    return res.json({ ok: true });
  }
  res.status(405).end();
}

export default safe(handler);
