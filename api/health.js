import { redis, envStatus, safe } from '../lib/util.js';

// Public, shows only true/false for each setting (never the values)
export default safe(async (req, res) => {
  const out = { api: 'ok', env: envStatus(), redis: 'untested' };
  try { await redis('PING'); out.redis = 'ok'; } catch (e) { out.redis = String(e.message); }
  res.json(out);
});
