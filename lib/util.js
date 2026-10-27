const env = (...names) => names.map((n) => (process.env[n] || '').trim()).find(Boolean) || '';
const URL_ = () => env('UPSTASH_REDIS_REST_URL', 'KV_REST_API_URL');
const TOKEN = () => env('UPSTASH_REDIS_REST_TOKEN', 'KV_REST_API_TOKEN');

export async function redis(...cmd) {
  if (!URL_() || !TOKEN()) throw new Error('Redis env vars missing (UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN)');
  const r = await fetch(URL_(), {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN()}` },
    body: JSON.stringify(cmd),
  });
  const j = await r.json();
  if (!r.ok || j.error) throw new Error('Redis error: ' + (j.error || r.status));
  return j.result;
}

export const envStatus = () => ({
  API_KEY: !!env('API_KEY'),
  DASHBOARD_PASSWORD: !!env('DASHBOARD_PASSWORD'),
  REDIS_URL: !!URL_(),
  REDIS_TOKEN: !!TOKEN(),
});
export const isServer = (req) => !!env('API_KEY') && (req.headers['x-api-key'] || '').trim() === env('API_KEY');
export const isAdmin = (req) =>
  !!env('DASHBOARD_PASSWORD') && (req.headers['x-dash-pass'] || '').trim() === env('DASHBOARD_PASSWORD');
export const clean = (v, n = 200) => String(v ?? '').slice(0, n);

// Always answer with JSON, even on errors, so the dashboard can show what went wrong
export const safe = (fn) => async (req, res) => {
  try { await fn(req, res); }
  catch (e) { res.status(500).json({ error: String(e.message || e) }); }
};
