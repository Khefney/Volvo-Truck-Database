// Simulated fleet stored in D1. VINs are prefixed SIM- and are not Volvo VINs.
export function normalizeVehicle(vehicle, reading) {
  const source = vehicle.source || 'simulated';
  return {
    vehicleId: vehicle.id,
    vin: vehicle.vin,
    make: vehicle.make,
    model: vehicle.model,
    modelKey: vehicle.model_key,
    modelYear: vehicle.model_year,
    powertrain: vehicle.powertrain,
    engine: vehicle.engine,
    horsepower: vehicle.horsepower,
    torque: vehicle.torque,
    locationLabel: vehicle.location_label,
    source,
    simulated: source !== 'volvo',
    latestReading: reading ? normalizeReading(reading) : null,
  };
}

export function normalizeReading(reading) {
  return {
    id: reading.id,
    vehicleId: reading.vehicle_id,
    externalReadingId: reading.external_reading_id,
    timestamp: reading.timestamp,
    odometerKm: reading.odometer_km,
    energyLevelPercent: reading.energy_level_percent,
    fuelLevelPercent: reading.fuel_level_percent,
    latitude: reading.latitude,
    longitude: reading.longitude,
    speedKph: reading.speed_kph,
    operationalStatus: reading.operational_status,
    source: reading.source || 'simulated',
    simulated: (reading.source || 'simulated') !== 'volvo',
  };
}

export async function listVehicles(db) {
  const vehicles = (await db.prepare('SELECT * FROM vehicles ORDER BY id').all()).results;
  const readings = (await db.prepare(`SELECT r.* FROM vehicle_readings r
    JOIN (SELECT vehicle_id, MAX(timestamp) AS timestamp FROM vehicle_readings GROUP BY vehicle_id) latest
      ON latest.vehicle_id = r.vehicle_id AND latest.timestamp = r.timestamp`).all()).results;
  const byId = new Map(readings.map(row => [row.vehicle_id, row]));
  return vehicles.map(vehicle => normalizeVehicle(vehicle, byId.get(vehicle.id)));
}

export async function getVehicle(db, id) {
  const vehicle = await db.prepare('SELECT * FROM vehicles WHERE id = ?').bind(id).first();
  if (!vehicle) return null;
  const reading = await db.prepare('SELECT * FROM vehicle_readings WHERE vehicle_id = ? ORDER BY timestamp DESC LIMIT 1').bind(id).first();
  return normalizeVehicle(vehicle, reading);
}

export async function getReadings(db, id, sinceIso) {
  const stmt = sinceIso
    ? db.prepare('SELECT * FROM vehicle_readings WHERE vehicle_id = ? AND timestamp >= ? ORDER BY timestamp ASC').bind(id, sinceIso)
    : db.prepare('SELECT * FROM vehicle_readings WHERE vehicle_id = ? ORDER BY timestamp ASC').bind(id);
  return (await stmt.all()).results.map(normalizeReading);
}

const RANGE_DAYS = { '7d': 7, '14d': 14, '30d': 30, '90d': 90 };

export function sinceForRange(range, now = Date.now()) {
  const days = RANGE_DAYS[String(range || '90d').toLowerCase()] || 90;
  return new Date(now - days * 24 * 60 * 60 * 1000).toISOString();
}
