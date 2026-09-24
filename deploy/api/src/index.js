// Volvo Truck DB — Cloudflare Worker + D1
const CORS = {
  'Access-Control-Allow-Origin': '*', // lock to your Pages URL for production
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};
const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', ...CORS } });
const TRUCK_COLS = ['id', 'model_key', 'make', 'model', 'engine', 'horsepower', 'torque', 'type', 'status', 'loc', 'x', 'y', 'odo', 'level'];
const TYPES = ['Electric', 'Diesel', 'Natural Gas'];

async function upsertTruck(env, b) {
  if (!b.id) return json({ error: 'id is required' }, 400);
  if (b.type && !TYPES.includes(b.type)) return json({ error: 'Invalid information type' }, 400);
  const row = { make: 'Volvo', status: 'Active', odo: 0, level: 100, x: null, y: null, ...b };
  const vals = TRUCK_COLS.map(c => row[c] ?? null);
  await env.DB.prepare(`INSERT OR REPLACE INTO trucks (${TRUCK_COLS.join(',')}) VALUES (${TRUCK_COLS.map(() => '?').join(',')})`).bind(...vals).run();
  return json(row, 201);
}

export default {
  async fetch(req, env) {
    if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
    const url = new URL(req.url);
    const path = url.pathname.replace(/\/+$/, '');
    try {
      if (path === '/api' || path === '') return json({ ok: true, routes: ['/api/trucks', '/api/trucks/:id', '/api/trucks/:id/:field', '/api/service', '/api/parts'] });

      if (path === '/api/trucks') {
        if (req.method === 'POST') return upsertTruck(env, await req.json());
        const type = url.searchParams.get('type');
        const stmt = type ? env.DB.prepare('SELECT * FROM trucks WHERE type = ? ORDER BY id').bind(type) : env.DB.prepare('SELECT * FROM trucks ORDER BY id');
        return json((await stmt.all()).results);
      }

      let m = path.match(/^\/api\/trucks\/([^/]+)(?:\/([a-z_]+))?$/);
      if (m) {
        const id = decodeURIComponent(m[1]);
        if (req.method === 'PUT') return upsertTruck(env, { ...(await req.json()), id });
        if (req.method === 'DELETE') { await env.DB.prepare('DELETE FROM trucks WHERE id = ?').bind(id).run(); return json({ deleted: id }); }
        const t = await env.DB.prepare('SELECT * FROM trucks WHERE id = ?').bind(id).first();
        if (!t) return json({ error: `No data found for ${id}` }, 404);
        // Same lookup as the original Tkinter app: truck ID + information type
        if (m[2]) return m[2] in t ? json({ id, [m[2]]: t[m[2]] }) : json({ error: 'Invalid information type' }, 400);
        const history = (await env.DB.prepare('SELECT * FROM service WHERE truck_id = ? ORDER BY date DESC').bind(id).all()).results;
        return json({ ...t, history });
      }

      if (path === '/api/service') {
        if (req.method === 'POST') {
          const b = await req.json();
          await env.DB.prepare('INSERT INTO service (date, truck_id, kind, descr, cost, status) VALUES (?,?,?,?,?,?)')
            .bind(b.date, b.truck_id, b.kind, b.descr, b.cost ?? 0, b.status ?? 'Open').run();
          return json(b, 201);
        }
        return json((await env.DB.prepare('SELECT * FROM service ORDER BY date DESC').all()).results);
      }

      if (path === '/api/parts') {
        const q = url.searchParams.get('q');
        const stmt = q ? env.DB.prepare('SELECT * FROM parts WHERE pn LIKE ?1 OR name LIKE ?1 OR fits LIKE ?1').bind(`%${q}%`) : env.DB.prepare('SELECT * FROM parts');
        return json((await stmt.all()).results);
      }

      return json({ error: 'Not found' }, 404);
    } catch (e) {
      return json({ error: String(e.message || e) }, 500);
    }
  },
};
