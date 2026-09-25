// Planning estimates for the public demo. These are not Volvo test results.
export const ASSUMPTION_DEFAULTS = [
  ['diesel_price', 'Diesel price', 3.9, 'USD/gal', 'Demo placeholder', '', 'Not an official Volvo price. Used only for estimates.'],
  ['electricity_price', 'Depot electricity', 0.11, 'USD/kWh', 'Demo placeholder', '', 'Not a utility tariff and not a Volvo figure.'],
  ['cng_price', 'CNG price', 2.6, 'USD/GGE', 'Demo placeholder', '', 'Not an official fuel contract.'],
  ['annual_distance_km', 'Annual distance', 110000, 'km', 'Demo placeholder', '', 'Planning distance for the sample fleet, not measured utilization.'],
  ['diesel_mpg', 'Diesel fuel economy', 6.5, 'mi/gal', 'Demo placeholder', '', 'Placeholder economy for a heavy truck. Not a Volvo certification.'],
  ['cng_mpge', 'CNG fuel economy', 6, 'mi/GGE', 'Demo placeholder', '', 'Placeholder gasoline-gallon equivalent economy.'],
  ['cng_g_per_km', 'CNG CO₂ factor', 760, 'g/km', 'Demo placeholder', '', 'Placeholder factor, not a measured tailpipe result.'],
  ['ev_kwh_per_km', 'Electric energy use', 1.15, 'kWh/km', 'Demo placeholder', '', 'Placeholder energy use before charging losses.'],
  ['charging_efficiency', 'Charging efficiency', 0.9, 'ratio', 'Demo placeholder', '', 'Share of grid energy that reaches the battery in this model.'],
  ['grid_g_per_kwh', 'Grid emissions factor', 350, 'g/kWh', 'Demo placeholder', '', 'Placeholder grid intensity. Not a measured North Carolina grid factor.'],
  ['diesel_kg_co2_per_gal', 'Diesel combustion CO₂', 10.2, 'kg/gal', 'Demo placeholder', '', 'Common combustion factor used only as an estimate input.'],
  ['demo_battery_kwh', 'Planning battery size', 540, 'kWh', 'Demo placeholder', '', 'Not a published Volvo pack size. Range math is an estimate.'],
  ['payload_heavy', 'Heavy payload factor', 1.15, 'ratio', 'Demo placeholder', '', 'Multiplies energy use. Not a measured payload curve.'],
  ['payload_light', 'Light payload factor', 0.9, 'ratio', 'Demo placeholder', '', 'Multiplies energy use. Not a measured payload curve.'],
];

export function assumptionMap(rows) {
  const map = {};
  for (const row of ASSUMPTION_DEFAULTS) map[row[0]] = row[2];
  for (const row of rows || []) {
    const n = Number(row.value);
    if (row.key && Number.isFinite(n)) map[row.key] = n;
  }
  return map;
}

const KM_PER_MI = 1.60934;

export function payloadFactor(map, category) {
  if (category === 'Heavy') return map.payload_heavy;
  if (category === 'Light') return map.payload_light;
  return 1;
}

export function tripEstimate(powertrain, miles, map, payload = 'Medium', roundTrip = false) {
  const trips = roundTrip ? 2 : 1;
  const distanceMi = Math.max(0, Number(miles) || 0) * trips;
  const distanceKm = distanceMi * KM_PER_MI;
  const factor = payloadFactor(map, payload);
  if (powertrain === 'Electric') {
    const kwh = distanceKm * map.ev_kwh_per_km * factor / map.charging_efficiency;
    return {
      powertrain,
      estimate: true,
      distanceKm,
      energyKwh: round(kwh),
      costUsd: round(kwh * map.electricity_price),
      co2Kg: round(kwh * map.grid_g_per_kwh / 1000),
    };
  }
  if (powertrain === 'Natural Gas') {
    const gge = distanceMi / map.cng_mpge * factor;
    return {
      powertrain,
      estimate: true,
      distanceKm,
      fuelGge: round(gge),
      costUsd: round(gge * map.cng_price),
      co2Kg: round(distanceKm * map.cng_g_per_km / 1000),
    };
  }
  const gallons = distanceMi / map.diesel_mpg * factor;
  return {
    powertrain,
    estimate: true,
    distanceKm,
    fuelGal: round(gallons),
    costUsd: round(gallons * map.diesel_price),
    co2Kg: round(gallons * map.diesel_kg_co2_per_gal),
  };
}

export function annualEstimate(powertrain, map) {
  const miles = map.annual_distance_km / KM_PER_MI;
  return tripEstimate(powertrain, miles, map, 'Medium', false);
}

export function remainingRangeKm(powertrain, levelPercent, map) {
  if (powertrain !== 'Electric') return null;
  const level = Math.max(0, Math.min(100, Number(levelPercent) || 0)) / 100;
  return round(level * map.demo_battery_kwh / map.ev_kwh_per_km);
}

function round(n) {
  return Math.round(n * 10) / 10;
}
