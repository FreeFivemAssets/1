const URL_ = process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

export async function redis(...cmd) {
  const r = await fetch(URL_, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}` },
    body: JSON.stringify(cmd),
  });
  return (await r.json()).result;
}

export const isServer = (req) => !!process.env.API_KEY && req.headers['x-api-key'] === process.env.API_KEY;
export const isAdmin = (req) =>
  !!process.env.DASHBOARD_PASSWORD && req.headers['x-dash-pass'] === process.env.DASHBOARD_PASSWORD;
export const clean = (v, n = 200) => String(v ?? '').slice(0, n);
