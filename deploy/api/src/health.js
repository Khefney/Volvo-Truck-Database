// Rule-based fleet health. The score is the sum of these penalties, not a prediction.
const OPEN_REPAIR = 20;
const OVERDUE = 15;
const HIGH_MILEAGE = 10;
const WORKSHOP = 10;
const LOW_LEVEL = 5;
const MILEAGE_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;
const MILEAGE_LIMIT_KM = 12000;
const STALE_MS = 90 * 24 * 60 * 60 * 1000;

export function scoreVehicle(vehicleId, readings, serviceRows, now = Date.now()) {
  const reasons = [];
  let score = 100;
  const mine = (serviceRows || []).filter(row => row.truck_id === vehicleId || row.vehicle_id === vehicleId);
  const openRepair = mine.filter(row => row.kind === 'Repair' && row.status === 'Open');
  if (openRepair.length) {
    score -= OPEN_REPAIR;
    reasons.push({ delta: -OPEN_REPAIR, text: `Open repair: ${openRepair[0].descr}` });
  }
  const openScheduled = mine.filter(row => row.kind === 'Scheduled' && row.status === 'Open');
  if (openScheduled.length) {
    score -= OVERDUE;
    reasons.push({ delta: -OVERDUE, text: `Open scheduled work: ${openScheduled[0].descr}` });
  } else {
    const closed = mine.filter(row => row.status === 'Closed' && row.date);
    const newest = closed.map(row => Date.parse(row.date)).filter(n => Number.isFinite(n)).sort((a, b) => b - a)[0];
    if (!newest || now - newest > STALE_MS) {
      score -= OVERDUE;
      reasons.push({ delta: -OVERDUE, text: newest ? 'No completed service in the last 90 days' : 'No service record on file' });
    }
  }
  const history = (readings || []).filter(row => row.vehicle_id === vehicleId).sort((a, b) => String(b.timestamp).localeCompare(String(a.timestamp)));
  const latest = history[0];
  const level = latest ? (latest.energy_level_percent ?? latest.fuel_level_percent) : null;
  if (level != null && level < 25) {
    score -= LOW_LEVEL;
    reasons.push({ delta: -LOW_LEVEL, text: `Low energy or fuel state (${level}%)` });
  }
  if (latest && latest.operational_status === 'In service') {
    score -= WORKSHOP;
    reasons.push({ delta: -WORKSHOP, text: 'Unit is in the workshop' });
  }
  if (history.length > 1 && latest?.odometer_km != null) {
    const cutoff = Date.parse(latest.timestamp) - MILEAGE_WINDOW_MS;
    const older = history.find(row => Date.parse(row.timestamp) <= cutoff) || history[history.length - 1];
    const delta = Number(latest.odometer_km) - Number(older.odometer_km);
    if (Number.isFinite(delta) && delta > MILEAGE_LIMIT_KM) {
      score -= HIGH_MILEAGE;
      reasons.push({ delta: -HIGH_MILEAGE, text: `${Math.round(delta).toLocaleString('en-US')} km in the recent reading window` });
    }
  }
  score = Math.max(0, Math.min(100, score));
  const band = score >= 80 ? 'Healthy' : score >= 60 ? 'Attention' : 'Service Required';
  return {
    vehicleId,
    score,
    band,
    reasons,
    rules: [
      { delta: -OPEN_REPAIR, text: 'Open repair' },
      { delta: -OVERDUE, text: 'Open scheduled work, or no completed service in 90 days' },
      { delta: -HIGH_MILEAGE, text: `More than ${MILEAGE_LIMIT_KM.toLocaleString('en-US')} km across the recent reading window` },
      { delta: -WORKSHOP, text: 'Operational status is In service' },
      { delta: -LOW_LEVEL, text: 'Energy or fuel below 25%' },
    ],
  };
}

export function scoreFleet(ids, readings, serviceRows) {
  return ids.map(id => scoreVehicle(id, readings, serviceRows));
}
