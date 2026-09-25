import { assumptionMap, annualEstimate, tripEstimate, remainingRangeKm, ASSUMPTION_DEFAULTS } from './estimates.js';
import { scoreFleet, scoreVehicle } from './health.js';
import { listVehicles, getVehicle, getReadings, sinceForRange } from './providers/demo.js';
import * as volvo from './providers/volvo.js';

const CORS = {
  'Access-Control-Allow-Origin': 'https://khefney.github.io',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
};
const TRUCK_COLS = ['id', 'model_key', 'make', 'model', 'engine', 'horsepower', 'torque', 'type', 'status', 'loc', 'x', 'y', 'odo', 'level'];
const TYPES = ['Electric', 'Diesel', 'Natural Gas'];

const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { 'Content-Type': 'application/json', ...CORS },
});
const fail = (code, message, status) => json({ error: { code, message } }, status);

function allowWrite(req, env) {
  const configured = env.ADMIN_TOKEN;
  const sent = req.headers.get('X-Admin-Token') || '';
  if (!configured || sent !== configured) {
    return fail('MUTATIONS_DISABLED', 'This public demo is read-only. Changes require an admin token on the Worker.', 403);
  }
  return null;
}

async function upsertTruck(env, body) {
  if (!body.id) return fail('ID_REQUIRED', 'id is required', 400);
  if (body.type && !TYPES.includes(body.type)) return fail('INVALID_TYPE', 'Invalid information type', 400);
  const row = { make: 'Volvo', status: 'Active', odo: 0, level: 100, x: null, y: null, ...body };
  const vals = TRUCK_COLS.map(col => row[col] ?? null);
  await env.DB.prepare(`INSERT OR REPLACE INTO trucks (${TRUCK_COLS.join(',')}) VALUES (${TRUCK_COLS.map(() => '?').join(',')})`).bind(...vals).run();
  return json(row, 201);
}

async function loadContext(db) {
  const vehicles = (await db.prepare('SELECT id FROM vehicles ORDER BY id').all()).results;
  const readings = (await db.prepare('SELECT * FROM vehicle_readings').all()).results;
  const service = (await db.prepare('SELECT * FROM service').all()).results;
  return { vehicles, readings, service };
}

export default {
  async scheduled(_event, env, ctx) {
    ctx.waitUntil((async () => {
      try {
        const result = await volvo.ingest(env);
        if (result.skipped) console.log('Volvo ingest skipped:', result.reason);
      } catch (error) {
        console.error('Volvo ingest failed:', error && error.message ? error.message : 'unknown error');
      }
    })());
  },

  async fetch(req, env) {
    if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
    const url = new URL(req.url);
    const path = url.pathname.replace(/\/+$/, '');
    try {
      if (path === '/api' || path === '') {
        return json({
          ok: true,
          product: 'Volvo Fleet Intelligence',
          independentDemo: true,
          source: 'simulated',
          volvo: { available: volvo.available(env) },
          routes: [
            '/api/trucks', '/api/trucks/:id', '/api/trucks/:id/:field', '/api/service', '/api/parts',
            '/api/vehicles', '/api/vehicles/:id', '/api/vehicles/:id/readings', '/api/vehicles/:id/health', '/api/vehicles/:id/service',
            '/api/fleet/health', '/api/fleet/analytics', '/api/assumptions',
          ],
        });
      }

      if (path === '/api/trucks') {
        if (req.method === 'POST') {
          const denied = allowWrite(req, env);
          if (denied) return denied;
          return upsertTruck(env, await req.json());
        }
        if (req.method !== 'GET') return fail('METHOD_NOT_ALLOWED', 'Method not allowed', 405);
        const type = url.searchParams.get('type');
        const stmt = type
          ? env.DB.prepare('SELECT * FROM trucks WHERE type = ? ORDER BY id').bind(type)
          : env.DB.prepare('SELECT * FROM trucks ORDER BY id');
        return json((await stmt.all()).results);
      }

      let trucks = path.match(/^\/api\/trucks\/([^/]+)(?:\/([a-z_]+))?$/);
      if (trucks) {
        const id = decodeURIComponent(trucks[1]);
        if (req.method === 'PUT' || req.method === 'DELETE') {
          const denied = allowWrite(req, env);
          if (denied) return denied;
          if (req.method === 'DELETE') {
            await env.DB.prepare('DELETE FROM trucks WHERE id = ?').bind(id).run();
            return json({ deleted: id });
          }
          return upsertTruck(env, { ...(await req.json()), id });
        }
        if (req.method !== 'GET') return fail('METHOD_NOT_ALLOWED', 'Method not allowed', 405);
        const truck = await env.DB.prepare('SELECT * FROM trucks WHERE id = ?').bind(id).first();
        if (!truck) return fail('VEHICLE_NOT_FOUND', `No data found for ${id}`, 404);
        if (trucks[2]) {
          if (!(trucks[2] in truck)) return fail('INVALID_FIELD', 'Invalid information type', 400);
          return json({ id, [trucks[2]]: truck[trucks[2]] });
        }
        const history = (await env.DB.prepare('SELECT * FROM service WHERE truck_id = ? ORDER BY date DESC').bind(id).all()).results;
        return json({ ...truck, history });
      }

      if (path === '/api/service') {
        if (req.method === 'POST') {
          const denied = allowWrite(req, env);
          if (denied) return denied;
          const body = await req.json();
          await env.DB.prepare('INSERT INTO service (date, truck_id, kind, descr, cost, status) VALUES (?,?,?,?,?,?)')
            .bind(body.date, body.truck_id, body.kind, body.descr, body.cost ?? 0, body.status ?? 'Open').run();
          return json(body, 201);
        }
        if (req.method !== 'GET') return fail('METHOD_NOT_ALLOWED', 'Method not allowed', 405);
        return json((await env.DB.prepare('SELECT * FROM service ORDER BY date DESC').all()).results);
      }

      if (path === '/api/parts') {
        if (req.method !== 'GET') return fail('METHOD_NOT_ALLOWED', 'Method not allowed', 405);
        const q = url.searchParams.get('q');
        const stmt = q
          ? env.DB.prepare('SELECT * FROM parts WHERE pn LIKE ?1 OR name LIKE ?1 OR fits LIKE ?1').bind(`%${q}%`)
          : env.DB.prepare('SELECT * FROM parts');
        const rows = (await stmt.all()).results.map(row => ({ ...row, priceNote: 'Placeholder price, not official Volvo pricing' }));
        return json(rows);
      }

      if (path === '/api/vehicles') {
        if (req.method !== 'GET') return fail('METHOD_NOT_ALLOWED', 'Method not allowed', 405);
        return json(await listVehicles(env.DB));
      }

      if (path === '/api/fleet/health') {
        if (req.method !== 'GET') return fail('METHOD_NOT_ALLOWED', 'Method not allowed', 405);
        const { vehicles, readings, service } = await loadContext(env.DB);
        const scores = scoreFleet(vehicles.map(row => row.id), readings, service);
        return json({ estimate: false, ruleBased: true, vehicles: scores });
      }

      if (path === '/api/fleet/analytics') {
        if (req.method !== 'GET') return fail('METHOD_NOT_ALLOWED', 'Method not allowed', 405);
        const assumptions = (await env.DB.prepare('SELECT * FROM assumptions ORDER BY key').all()).results;
        const map = assumptionMap(assumptions);
        const vehicles = await listVehicles(env.DB);
        const byType = ['Electric', 'Diesel', 'Natural Gas'].map(powertrain => ({
          powertrain,
          count: vehicles.filter(vehicle => vehicle.powertrain === powertrain).length,
          annual: annualEstimate(powertrain, map),
        }));
        const trend = (await env.DB.prepare(`SELECT substr(timestamp, 1, 10) AS day,
            AVG(COALESCE(energy_level_percent, fuel_level_percent)) AS level
          FROM vehicle_readings
          WHERE timestamp >= ?
          GROUP BY day ORDER BY day`).bind(sinceForRange('30d')).all()).results;
        return json({
          estimate: true,
          label: 'ESTIMATE',
          disclaimer: 'Planning figures from demo assumptions. Not measured fleet performance and not official Volvo data.',
          assumptions,
          byType,
          energyTrend: trend,
          volvo: { available: volvo.available(env) },
        });
      }

      if (path === '/api/assumptions') {
        if (req.method !== 'GET') return fail('METHOD_NOT_ALLOWED', 'Method not allowed', 405);
        return json((await env.DB.prepare('SELECT * FROM assumptions ORDER BY key').all()).results);
      }

      const assumptionKey = path.match(/^\/api\/assumptions\/([^/]+)$/);
      if (assumptionKey) {
        if (req.method !== 'PUT') return fail('METHOD_NOT_ALLOWED', 'Method not allowed', 405);
        const denied = allowWrite(req, env);
        if (denied) return denied;
        const key = decodeURIComponent(assumptionKey[1]);
        const known = ASSUMPTION_DEFAULTS.some(row => row[0] === key);
        const current = await env.DB.prepare('SELECT key FROM assumptions WHERE key = ?').bind(key).first();
        if (!known && !current) return fail('ASSUMPTION_NOT_FOUND', `Assumption ${key} was not found.`, 404);
        const body = await req.json();
        const value = Number(body.value);
        if (!Number.isFinite(value)) return fail('INVALID_VALUE', 'value must be a number', 400);
        await env.DB.prepare(`INSERT INTO assumptions (key, label, value, unit, source_name, source_url, notes, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at, notes = COALESCE(excluded.notes, assumptions.notes)`).bind(
          key, body.label || key, value, body.unit || '', body.source_name || 'Operator edit', body.source_url || '', body.notes || 'Edited through the admin API.', new Date().toISOString(),
        ).run();
        return json(await env.DB.prepare('SELECT * FROM assumptions WHERE key = ?').bind(key).first());
      }

      const vehiclePath = path.match(/^\/api\/vehicles\/([^/]+)(?:\/(readings|health|service))?$/);
      if (vehiclePath) {
        if (req.method !== 'GET') return fail('METHOD_NOT_ALLOWED', 'Method not allowed', 405);
        const id = decodeURIComponent(vehiclePath[1]);
        const vehicle = await getVehicle(env.DB, id);
        if (!vehicle) return fail('VEHICLE_NOT_FOUND', `Vehicle ${id} was not found.`, 404);
        const kind = vehiclePath[2];
        if (kind === 'readings') {
          const readings = await getReadings(env.DB, id, sinceForRange(url.searchParams.get('range')));
          return json({ vehicleId: id, simulated: vehicle.simulated, readings });
        }
        if (kind === 'health') {
          const readings = (await env.DB.prepare('SELECT * FROM vehicle_readings WHERE vehicle_id = ?').bind(id).all()).results;
          const service = (await env.DB.prepare('SELECT * FROM service WHERE truck_id = ?').bind(id).all()).results;
          return json(scoreVehicle(id, readings, service));
        }
        if (kind === 'service') {
          const service = (await env.DB.prepare('SELECT * FROM service WHERE truck_id = ? ORDER BY date DESC').bind(id).all()).results;
          return json({ vehicleId: id, service });
        }
        const parameters = (await env.DB.prepare('SELECT * FROM parameter_metadata ORDER BY parameter_id').all()).results;
        const readings = await getReadings(env.DB, id, sinceForRange('90d'));
        const health = scoreVehicle(id, (await env.DB.prepare('SELECT * FROM vehicle_readings WHERE vehicle_id = ?').bind(id).all()).results, (await env.DB.prepare('SELECT * FROM service WHERE truck_id = ?').bind(id).all()).results);
        return json({ ...vehicle, readings, health, parameters, dataLabel: vehicle.simulated ? 'SIMULATED DATA' : 'VOLVO BASIC VEHICLE INFORMATION API' });
      }

      if (path === '/api/fleet/mission') {
        if (req.method !== 'GET') return fail('METHOD_NOT_ALLOWED', 'Method not allowed', 405);
        const body = {
          distanceMiles: url.searchParams.get('distanceMiles'),
          origin: url.searchParams.get('origin') || '',
          destination: url.searchParams.get('destination') || '',
          payload: url.searchParams.get('payload') || 'Medium',
          roundTrip: url.searchParams.get('roundTrip') === 'true',
          chargingAvailable: url.searchParams.get('chargingAvailable') === 'true',
        };
        const miles = Number(body.distanceMiles);
        if (!Number.isFinite(miles) || miles <= 0) return fail('INVALID_DISTANCE', 'distanceMiles must be a positive number. This planner does not calculate a route.', 400);
        const assumptions = (await env.DB.prepare('SELECT * FROM assumptions').all()).results;
        const map = assumptionMap(assumptions);
        const vehicles = await listVehicles(env.DB);
        const comparisons = vehicles.map(vehicle => {
          const level = vehicle.latestReading?.energyLevelPercent ?? vehicle.latestReading?.fuelLevelPercent;
          const estimate = tripEstimate(vehicle.powertrain, miles, map, body.payload || 'Medium', Boolean(body.roundTrip));
          const rangeKm = remainingRangeKm(vehicle.powertrain, level, map);
          const chargingRequired = vehicle.powertrain === 'Electric' && rangeKm != null && estimate.distanceKm > rangeKm;
          return {
            vehicleId: vehicle.vehicleId,
            model: vehicle.model,
            powertrain: vehicle.powertrain,
            estimate,
            remainingRangeKm: rangeKm,
            chargingRequired,
            chargingAvailable: Boolean(body.chargingAvailable),
            note: chargingRequired
              ? (body.chargingAvailable ? 'Estimated trip exceeds the planning range. Destination charging is assumed, not verified.' : 'Estimated trip exceeds the planning range with the demo battery assumption.')
              : 'Estimate only. No vehicle is recommended as best.',
          };
        });
        return json({
          estimate: true,
          label: 'ESTIMATE',
          routed: false,
          mission: {
            origin: body.origin || '',
            destination: body.destination || '',
            distanceMiles: miles,
            payload: body.payload || 'Medium',
            roundTrip: Boolean(body.roundTrip),
            chargingAvailable: Boolean(body.chargingAvailable),
          },
          comparisons,
        });
      }

      return fail('NOT_FOUND', 'Not found', 404);
    } catch (error) {
      console.error(error && error.message ? error.message : 'request failed');
      return fail('SERVER_ERROR', 'The request could not be completed.', 500);
    }
  },
};
