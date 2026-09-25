// Optional adapter for the Volvo Basic Vehicle Information API.
// The browser never calls Volvo. Credentials stay in Worker secrets.
// This is not second-by-second telemetry. Readings are ingested on a schedule.

export function available(env) {
  return Boolean(env && env.VOLVO_CLIENT_ID && env.VOLVO_CLIENT_SECRET && env.VOLVO_API_BASE_URL && env.VOLVO_TOKEN_URL);
}

function base(env) {
  return String(env.VOLVO_API_BASE_URL).replace(/\/$/, '');
}

async function token(env) {
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: env.VOLVO_CLIENT_ID,
    client_secret: env.VOLVO_CLIENT_SECRET,
  });
  const res = await fetch(env.VOLVO_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!res.ok) throw new Error('Volvo token request failed');
  const json = await res.json();
  if (!json.access_token) throw new Error('Volvo token response had no access_token');
  return json.access_token;
}

async function volvoGet(env, accessToken, path) {
  const res = await fetch(base(env) + path, { headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' } });
  if (!res.ok) throw new Error(`Volvo request failed for ${path}`);
  return res.json();
}

export async function getVehicles(env) {
  if (!available(env)) return [];
  const accessToken = await token(env);
  const products = await volvoGet(env, accessToken, '/products');
  const list = Array.isArray(products) ? products : (products.products || products.items || []);
  return list.map(item => ({
    vehicleId: item.vin || item.vehicleId || item.id,
    vin: item.vin || null,
    make: 'Volvo',
    model: item.model || item.productName || null,
    modelYear: item.modelYear || null,
    powertrain: item.powertrain || null,
    source: 'volvo',
    simulated: false,
    latestReading: null,
  }));
}

export async function getReadings(env, vin, range) {
  if (!available(env)) return [];
  const accessToken = await token(env);
  const path = `/products/getreadings?vin=${encodeURIComponent(vin)}${range ? `&range=${encodeURIComponent(range)}` : ''}`;
  const payload = await volvoGet(env, accessToken, path);
  const rows = Array.isArray(payload) ? payload : (payload.readings || payload.items || []);
  return rows.map(row => ({
    externalReadingId: row.id || row.readingId || null,
    timestamp: row.timestamp || row.readTime || null,
    source: 'volvo',
    simulated: false,
    raw: row,
  }));
}

export async function getAvailableParameters(env, vin) {
  if (!available(env)) return [];
  const accessToken = await token(env);
  const payload = await volvoGet(env, accessToken, `/parameters?vin=${encodeURIComponent(vin)}`);
  const rows = Array.isArray(payload) ? payload : (payload.parameters || payload.items || []);
  return rows.map(row => ({
    parameterId: String(row.id || row.parameterId),
    name: row.name || row.parameterName || String(row.id || ''),
    parameterType: row.type || row.parameterType || 'single',
    unit: row.unit || null,
    description: row.description || null,
    source: 'volvo',
  }));
}

async function parameterValues(env, accessToken, parameter, vin) {
  const type = parameter.parameterType || 'single';
  const endpoint = type === 'array' ? 'getparameterarrayvalues' : type === 'struct' ? 'getparameterstructvalues' : 'getparametersinglevalues';
  return volvoGet(env, accessToken, `/${endpoint}?vin=${encodeURIComponent(vin)}&parameterId=${encodeURIComponent(parameter.parameterId)}`);
}

export async function ingest(env) {
  if (!available(env)) return { skipped: true, reason: 'VOLVO_CREDENTIALS_NOT_CONFIGURED' };
  const accessToken = await token(env);
  const configured = (await env.DB.prepare("SELECT id, vin FROM vehicles WHERE source = 'volvo' AND vin IS NOT NULL").all()).results;
  let stored = 0;
  for (const vehicle of configured) {
    const readings = await getReadings(env, vehicle.vin);
    const parameters = await getAvailableParameters(env, vehicle.vin);
    for (const parameter of parameters) {
      await env.DB.prepare(`INSERT OR IGNORE INTO parameter_metadata
        (parameter_id, name, parameter_type, unit, description, source, updated_at)
        VALUES (?, ?, ?, ?, ?, 'volvo', ?)`).bind(
        parameter.parameterId, parameter.name, parameter.parameterType, parameter.unit, parameter.description, new Date().toISOString(),
      ).run();
    }
    for (const reading of readings) {
      if (!reading.externalReadingId || !reading.timestamp) continue;
      const inserted = await env.DB.prepare(`INSERT OR IGNORE INTO vehicle_readings
        (vehicle_id, external_reading_id, timestamp, source, created_at)
        VALUES (?, ?, ?, 'volvo', ?)`).bind(vehicle.id, reading.externalReadingId, reading.timestamp, new Date().toISOString()).run();
      if (!inserted.meta || inserted.meta.changes !== 1) continue;
      stored += 1;
      const readingRow = await env.DB.prepare('SELECT id FROM vehicle_readings WHERE vehicle_id = ? AND external_reading_id = ?')
        .bind(vehicle.id, reading.externalReadingId).first();
      for (const parameter of parameters) {
        const values = await parameterValues(env, accessToken, parameter, vehicle.vin);
        await env.DB.prepare(`INSERT INTO raw_parameter_values
          (vehicle_id, reading_id, parameter_id, value_json, timestamp, source)
          VALUES (?, ?, ?, ?, ?, 'volvo')`).bind(
          vehicle.id, readingRow?.id ?? null, parameter.parameterId, JSON.stringify(values), reading.timestamp,
        ).run();
      }
    }
  }
  return { skipped: false, stored };
}
