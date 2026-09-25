const MODELS = {
  'FH-E': { make: 'Volvo', model: 'FH', engine: 'Euro 6 step', horsepower: 500, torque: 2000, type: 'Electric' },
  'FH': { make: 'Volvo', model: 'FH', engine: 'D13TC', horsepower: 660, torque: 1500, type: 'Diesel' },
  'FH-GAS': { make: 'Volvo', model: 'FH', engine: 'D13TC', horsepower: 500, torque: 2000, type: 'Natural Gas' },
  'VNR400': { make: 'Volvo', model: 'VNR400', engine: 'D11 or D13', horsepower: 500, torque: 2000, type: 'Diesel' },
  'VNL': { make: 'Volvo', model: 'VNL', engine: 'Cummins ISX15', horsepower: 425, torque: 2000, type: 'Diesel' },
  'VHD': { make: 'Volvo', model: 'VHD', engine: 'D13', horsepower: 500, torque: 2000, type: 'Diesel' },
  'FL': { make: 'Volvo', model: 'FL', engine: 'D6B', horsepower: 250, torque: 2000, type: 'Diesel' },
  'FE': { make: 'Volvo', model: 'FE', engine: '6-cylinder D8', horsepower: 536, torque: 2000, type: 'Diesel' },
  'FM': { make: 'Volvo', model: 'FM', engine: 'D11K and D13K', horsepower: 460, torque: 2000, type: 'Diesel' },
  'FMX': { make: 'Volvo', model: 'FMX', engine: 'D11 step E', horsepower: 540, torque: 2000, type: 'Diesel' },
};
const FLEET = [
  ['VT-0101','FH-E','Active','I-40 · Winston-Salem',36.099,-80.27,41200,72],
  ['VT-0102','FH-E','Charging','Greensboro depot',36.0726,-79.792,38900,34],
  ['VT-0103','FH-GAS','Active','US-29 · Reidsville',36.355,-79.665,88400,61],
  ['VT-0104','FH','Active','I-85 · Charlotte',35.227,-80.843,132600,48],
  ['VT-0105','VNR400','In service','Greensboro workshop',36.068,-79.812,201300,20],
  ['VT-0106','VNL','Active','I-40 · Durham',35.994,-78.899,176800,66],
  ['VT-0107','VHD','Active','Asheboro quarry',35.708,-79.814,94100,55],
  ['VT-0108','FL','Active','High Point',35.956,-80.005,61500,80],
  ['VT-0109','FE','Active','Burlington',36.096,-79.438,57300,43],
  ['VT-0110','FM','Active','I-85 · Salisbury',35.671,-80.474,143900,58],
  ['VT-0111','FMX','In service','Greensboro workshop',36.075,-79.802,118200,12],
  ['VT-0112','FH','Active','I-40 · Raleigh',35.779,-78.638,158400,39],
  ['VT-0113','FH-GAS','Active','Greensboro depot',36.08,-79.785,72300,88],
  ['VT-0114','VNL','Active','I-77 · Statesville',35.783,-80.887,189500,71],
];
const SERVICE = [
  ['2026-09-19','VT-0105','Repair','Turbocharger replaced (reman unit)',2840,'Open'],
  ['2026-09-18','VT-0111','Scheduled','Brake pads & rotors, axle 2',1260,'Open'],
  ['2026-09-15','VT-0102','Inspection','Battery health check — 96% SoH',180,'Closed'],
  ['2026-09-11','VT-0104','Scheduled','Oil & filter, DPF clean',640,'Closed'],
  ['2026-09-08','VT-0112','Repair','AdBlue injector fault',910,'Closed'],
  ['2026-09-02','VT-0103','Scheduled','CNG tank pressure test',420,'Closed'],
  ['2026-08-28','VT-0101','Inspection','Software update, regen braking tune',0,'Closed'],
  ['2026-08-21','VT-0106','Scheduled','Oil & filter, coolant flush',720,'Closed'],
  ['2026-08-14','VT-0110','Repair','Alternator replaced (reman unit)',560,'Closed'],
  ['2026-08-05','VT-0114','Scheduled','Tyre rotation, alignment',380,'Closed'],
  ['2026-07-30','VT-0101','Scheduled','Cabin filter, wipers',95,'Closed'],
];
const PARTS = [
  ['21707134','Oil filter','FH, FM, FMX, VNL',84,'$38',false],
  ['85013870','Turbocharger','FH, FM, VNR400',3,'$1,940',true],
  ['23443380','Brake pad set','All models',46,'$212',false],
  ['22327063','AdBlue injector','FH, FM, FMX',9,'$486',false],
  ['23836012','Alternator 24V','FL, FE, FM',6,'$410',true],
  ['23456910','HV battery coolant pump','FH-E',4,'$690',false],
  ['24104521','CNG pressure regulator','FH-GAS',5,'$735',false],
  ['85003981','Starter motor','FH, VNL, VHD',7,'$380',true],
  ['21843212','Cabin air filter','All models',120,'$24',false],
  ['23201774','DPF cartridge','FH, VNL, VHD, VNR400',8,'$1,120',true],
];
const CHARGERS = [
  { name: 'Greensboro depot — demo note', kind: 'EV', lat: 36.068, lng: -79.8 },
  { name: 'Winston-Salem — demo note', kind: 'EV', lat: 36.11, lng: -80.24 },
  { name: 'Burlington — demo note', kind: 'CNG', lat: 36.09, lng: -79.45 },
  { name: 'Raleigh — demo note', kind: 'EV', lat: 35.8, lng: -78.65 },
];
const LESSONS = [
  { kicker: 'Electric 101', title: 'Where does an electric truck get its miles?', body: 'An FH-E stores energy in batteries and recovers some of it every time it brakes downhill. Charging overnight at the depot costs about half of a tank of diesel.', meta: '3 min read · for students' },
  { kicker: 'Fuel choices', title: 'Natural gas today, biogas tomorrow', body: 'The FH-GAS runs on the same engine family as the diesel FH. Fill it with biogas from farms and landfills and its CO₂ drops by up to 90%.', meta: '4 min read · for fleet owners' },
  { kicker: 'On the road', title: 'Eco-driving: the free upgrade', body: 'Smooth acceleration, steady speeds and less idling cut fuel use by 5–10% on any truck, no purchase required.', meta: '2 min read · for drivers' },
];
const DEFAULT_ASSUMPTIONS = [
  { key: 'diesel_price', label: 'Diesel price', value: 3.9, unit: 'USD/gal', source_name: 'Demo placeholder', notes: 'Not an official Volvo price.' },
  { key: 'electricity_price', label: 'Depot electricity', value: 0.11, unit: 'USD/kWh', source_name: 'Demo placeholder', notes: 'Not a utility tariff.' },
  { key: 'cng_price', label: 'CNG price', value: 2.6, unit: 'USD/GGE', source_name: 'Demo placeholder', notes: 'Not an official fuel contract.' },
  { key: 'annual_distance_km', label: 'Annual distance', value: 110000, unit: 'km', source_name: 'Demo placeholder', notes: 'Planning distance, not measured utilization.' },
  { key: 'diesel_mpg', label: 'Diesel fuel economy', value: 6.5, unit: 'mi/gal', source_name: 'Demo placeholder', notes: 'Not a Volvo certification.' },
  { key: 'cng_mpge', label: 'CNG fuel economy', value: 6, unit: 'mi/GGE', source_name: 'Demo placeholder', notes: 'Placeholder economy.' },
  { key: 'cng_g_per_km', label: 'CNG CO₂ factor', value: 760, unit: 'g/km', source_name: 'Demo placeholder', notes: 'Not a measured tailpipe result.' },
  { key: 'ev_kwh_per_km', label: 'Electric energy use', value: 1.15, unit: 'kWh/km', source_name: 'Demo placeholder', notes: 'Before charging losses.' },
  { key: 'charging_efficiency', label: 'Charging efficiency', value: 0.9, unit: 'ratio', source_name: 'Demo placeholder', notes: 'Share of grid energy that reaches the battery in this model.' },
  { key: 'grid_g_per_kwh', label: 'Grid emissions factor', value: 350, unit: 'g/kWh', source_name: 'Demo placeholder', notes: 'Not a measured grid factor.' },
  { key: 'diesel_kg_co2_per_gal', label: 'Diesel combustion CO₂', value: 10.2, unit: 'kg/gal', source_name: 'Demo placeholder', notes: 'Estimate input only.' },
  { key: 'demo_battery_kwh', label: 'Planning battery size', value: 540, unit: 'kWh', source_name: 'Demo placeholder', notes: 'Not a published Volvo pack size.' },
  { key: 'payload_heavy', label: 'Heavy payload factor', value: 1.15, unit: 'ratio', source_name: 'Demo placeholder', notes: 'Not a measured payload curve.' },
  { key: 'payload_light', label: 'Light payload factor', value: 0.9, unit: 'ratio', source_name: 'Demo placeholder', notes: 'Not a measured payload curve.' },
];
const DEMO_PARAMS = [
  { parameter_id: 'sim.odometer', name: 'Odometer', parameter_type: 'single', unit: 'km', fits: 'All' },
  { parameter_id: 'sim.energy_level', name: 'Energy level', parameter_type: 'single', unit: 'percent', fits: 'Electric' },
  { parameter_id: 'sim.fuel_level', name: 'Fuel level', parameter_type: 'single', unit: 'percent', fits: 'Fuel' },
  { parameter_id: 'sim.position', name: 'Position', parameter_type: 'struct', unit: 'degrees', fits: 'All' },
];
const TYPE_TAG = { Electric: 'tag-accent', 'Natural Gas': 'tag-outline', Diesel: 'tag-neutral' };
const STATUS_TAG = { Active: 'tag-accent', Charging: 'tag-outline', 'In service': 'tag-neutral' };
const KM_PER_MI = 1.60934;
const EMPTY_FORM = { id: '', key: '', engine: '', horsepower: '', torque: '', loc: '', type: 'Diesel' };
const fromRow = r => ({ id: r.id, key: r.model_key, status: r.status, loc: r.loc, lat: null, lng: null, odo: r.odo, level: r.level, source: 'simulated', vin: 'SIM-' + r.id, modelYear: null, updatedAt: null, spec: { make: r.make, model: r.model, engine: r.engine, horsepower: r.horsepower, torque: r.torque, type: r.type } });
const vehicleToTruck = v => {
  const reading = v.latestReading || {};
  const type = v.powertrain || 'Diesel';
  return { id: v.vehicleId, key: v.modelKey || v.model, status: reading.operationalStatus || 'Active', loc: v.locationLabel || '', lat: reading.latitude, lng: reading.longitude, odo: reading.odometerKm || 0, level: reading.energyLevelPercent ?? reading.fuelLevelPercent ?? 0, source: v.source || 'simulated', vin: v.vin, modelYear: v.modelYear, updatedAt: reading.timestamp, spec: { make: v.make || 'Volvo', model: v.model, engine: v.engine, horsepower: v.horsepower, torque: v.torque, type } };
};
function assumptionValues(rows, overrides) {
  const map = {};
  DEFAULT_ASSUMPTIONS.forEach(row => { map[row.key] = Number(row.value); });
  (rows || []).forEach(row => { const n = Number(row.value); if (row.key && Number.isFinite(n)) map[row.key] = n; });
  Object.entries(overrides || {}).forEach(([key, value]) => { const n = Number(value); if (Number.isFinite(n)) map[key] = n; });
  return map;
}
function payloadFactor(map, category) { return category === 'Heavy' ? map.payload_heavy : category === 'Light' ? map.payload_light : 1; }
function roundEstimate(n) { return Math.round(n * 10) / 10; }
function tripEstimate(powertrain, miles, map, payload, roundTrip) {
  const distanceMi = Math.max(0, Number(miles) || 0) * (roundTrip ? 2 : 1);
  const distanceKm = distanceMi * KM_PER_MI;
  const factor = payloadFactor(map, payload);
  if (powertrain === 'Electric') {
    const kwh = distanceKm * map.ev_kwh_per_km * factor / map.charging_efficiency;
    return { costUsd: roundEstimate(kwh * map.electricity_price), co2Kg: roundEstimate(kwh * map.grid_g_per_kwh / 1000), energyKwh: roundEstimate(kwh), distanceKm };
  }
  if (powertrain === 'Natural Gas') {
    const gge = distanceMi / map.cng_mpge * factor;
    return { costUsd: roundEstimate(gge * map.cng_price), co2Kg: roundEstimate(distanceKm * map.cng_g_per_km / 1000), fuelGge: roundEstimate(gge), distanceKm };
  }
  const gallons = distanceMi / map.diesel_mpg * factor;
  return { costUsd: roundEstimate(gallons * map.diesel_price), co2Kg: roundEstimate(gallons * map.diesel_kg_co2_per_gal), fuelGal: roundEstimate(gallons), distanceKm };
}
function gramsPerKm(type, map) {
  const annual = tripEstimate(type, map.annual_distance_km / KM_PER_MI, map, 'Medium', false);
  return map.annual_distance_km ? (annual.co2Kg * 1000) / map.annual_distance_km : 0;
}
function demoReadings(truck) {
  const days = [90, 75, 60, 45, 30, 21, 14, 7, 0];
  const anchor = Date.parse('2026-09-24T14:00:00Z');
  return days.map((daysAgo, index) => {
    const latest = index === days.length - 1;
    const level = latest ? truck.level : Math.max(8, Math.min(100, truck.level + Math.round(Math.sin(index * 1.3) * 8)));
    const electric = truck.spec.type === 'Electric';
    return { timestamp: new Date(anchor - daysAgo * 86400000).toISOString(), odometerKm: Math.round(truck.odo - daysAgo * (110000 / 365)), energyLevelPercent: electric ? level : null, fuelLevelPercent: electric ? null : level, latitude: truck.lat, longitude: truck.lng, operationalStatus: latest ? truck.status : 'Active', source: 'simulated', vehicle_id: truck.id };
  });
}
function localHealth(truck, readings, serviceRows) {
  const reasons = [];
  let score = 100;
  const mine = serviceRows.filter(row => row[1] === truck.id);
  const openRepair = mine.find(row => row[2] === 'Repair' && row[5] === 'Open');
  if (openRepair) { score -= 20; reasons.push({ delta: -20, text: 'Open repair: ' + openRepair[3] }); }
  const openScheduled = mine.find(row => row[2] === 'Scheduled' && row[5] === 'Open');
  if (openScheduled) { score -= 15; reasons.push({ delta: -15, text: 'Open scheduled work: ' + openScheduled[3] }); }
  else {
    const closed = mine.filter(row => row[5] === 'Closed' && row[0]);
    const newest = closed.map(row => Date.parse(row[0])).filter(n => Number.isFinite(n)).sort((a, b) => b - a)[0];
    if (!newest || Date.now() - newest > 90 * 24 * 60 * 60 * 1000) {
      score -= 15;
      reasons.push({ delta: -15, text: newest ? 'No completed service in the last 90 days' : 'No service record on file' });
    }
  }
  if (truck.level < 25) { score -= 5; reasons.push({ delta: -5, text: 'Low energy or fuel state (' + truck.level + '%)' }); }
  if (truck.status === 'In service') { score -= 10; reasons.push({ delta: -10, text: 'Unit is in the workshop' }); }
  const history = readings || [];
  if (history.length > 1) {
    const newest = history[history.length - 1];
    const cutoff = Date.parse(newest.timestamp) - 30 * 86400000;
    const older = history.slice().reverse().find(reading => Date.parse(reading.timestamp) <= cutoff) || history[0];
    const delta = Number(newest.odometerKm) - Number(older.odometerKm);
    if (delta > 12000) { score -= 10; reasons.push({ delta: -10, text: Math.round(delta).toLocaleString('en-US') + ' km across this reading history' }); }
  }
  score = Math.max(0, Math.min(100, score));
  return { vehicleId: truck.id, score, band: score >= 80 ? 'Healthy' : score >= 60 ? 'Attention' : 'Service Required', reasons };
}
function project(lat, lng) {
  const x = (Number(lng) - (-81.05)) / ((-78.4) - (-81.05)) * 100;
  const y = (36.5 - Number(lat)) / (36.5 - 35.1) * 100;
  return { x: Math.min(96, Math.max(4, x)).toFixed(1) + '%', y: Math.min(94, Math.max(6, y)).toFixed(1) + '%' };
}
function spark(values) {
  const nums = values.map(Number).filter(n => Number.isFinite(n));
  if (!nums.length) return '';
  const min = Math.min.apply(null, nums);
  const max = Math.max.apply(null, nums);
  return nums.map((v, i) => {
    const x = nums.length === 1 ? 0 : (i / (nums.length - 1)) * 320;
    const y = max === min ? 40 : 76 - ((v - min) / (max - min)) * 72;
    return x.toFixed(1) + ',' + y.toFixed(1);
  }).join(' ');
}

class Component extends DCLogic {
  state = {
    screen: this.props.startScreen ?? 'dashboard',
    sel: 'VT-0101', mapSel: 'VT-0101',
    query: '', typeFilter: 'All', svcFilter: 'All',
    partQuery: '', remanOnly: false, sim: 4,
    extra: [], form: { ...EMPTY_FORM }, editing: false,
    lab: {}, mission: { origin: 'Greensboro', destination: 'Charlotte', miles: '94', payload: 'Medium', roundTrip: true, charging: false },
    rangeDays: 30, healthSort: 'score', showAssumptions: false, readOnlyNote: '', loading: false,
  };
  api() { try { return (this.props.apiBase || window.VTDB_API || new URLSearchParams(location.search).get('api') || '').replace(/\/$/, ''); } catch (e) { return ''; } }
  async loadDetail(id) {
    const api = this.api();
    if (!api || !id) return;
    try {
      const [readingsRes, healthRes] = await Promise.all([
        fetch(api + '/api/vehicles/' + encodeURIComponent(id) + '/readings?range=90d'),
        fetch(api + '/api/vehicles/' + encodeURIComponent(id) + '/health'),
      ]);
      if (!readingsRes.ok) return;
      const readingsJson = await readingsRes.json();
      const healthJson = healthRes.ok ? await healthRes.json() : null;
      this.setState({ readingsById: { ...(this.state.readingsById || {}), [id]: readingsJson.readings || [] }, healthById: { ...(this.state.healthById || {}), [id]: healthJson } });
    } catch (e) { console.warn(e); }
  }
  async componentDidMount() {
    const api = this.api();
    if (!api) return;
    this.setState({ loading: true });
    const get = async (p) => { const res = await fetch(api + p); if (!res.ok) throw new Error(String(res.status)); return res.json(); };
    try {
      let vehicles = null;
      try { vehicles = await get('/api/vehicles'); } catch (e) { vehicles = null; }
      const [sv, pt] = await Promise.all([get('/api/service'), get('/api/parts')]);
      const svc = sv.map(x => [x.date, x.truck_id, x.kind, x.descr, x.cost, x.status]);
      const parts = pt.map(p => [p.pn, p.name, p.fits, p.stock, p.price, !!p.reman]);
      if (!vehicles) {
        const trucks = await get('/api/trucks');
        this.setState({ remote: trucks.map(fromRow), svc, parts, online: true, loading: false, sourceMode: 'simulated' });
        return;
      }
      const [assumptions, health, analytics] = await Promise.all([
        get('/api/assumptions').catch(() => null),
        get('/api/fleet/health').catch(() => null),
        get('/api/fleet/analytics').catch(() => null),
      ]);
      this.setState({
        vehicles, remote: vehicles.map(vehicleToTruck), extra: [], svc, parts,
        assumptions, healthFleet: health && health.vehicles, energyTrend: analytics && analytics.energyTrend,
        online: true, loading: false, sourceMode: vehicles.some(v => v.source === 'volvo') ? 'volvo' : 'simulated',
      });
      this.loadDetail(this.state.sel);
    } catch (e) {
      console.warn('VTDB API unreachable — using demo data', e);
      this.setState({ loading: false, online: false });
    }
  }
  trucks() {
    const demo = FLEET.map(([id, key, status, loc, lat, lng, odo, level]) => ({ id, key, status, loc, lat, lng, odo, level, source: 'simulated', vin: 'SIM-' + id, modelYear: 2026, updatedAt: '2026-09-24T14:00:00Z', spec: MODELS[key] }));
    return (this.state.remote || demo).concat(this.state.extra);
  }
  renderVals() {
    const s = this.state, set = p => this.setState(p);
    const SV = s.svc || SERVICE, PT = s.parts || PARTS;
    const mi = (this.props.units ?? 'mi') === 'mi';
    const unit = mi ? 'mi' : 'km';
    const perD = v => mi ? v * KM_PER_MI : v;
    const dist = v => Math.round(mi ? v / KM_PER_MI : v);
    const fmt = n => Math.round(n).toLocaleString('en-US');
    const money = n => '$' + Math.round(n).toLocaleString('en-US');
    const trucks = this.trucks();
    const map = assumptionValues(s.assumptions, s.lab);
    const open = id => () => { set({ sel: id, screen: 'detail' }); this.loadDetail(id); };
    const screens = ['dashboard', 'fleet', 'health', 'map', 'service', 'parts', 'analytics', 'mission'];
    const navKey = s.screen === 'detail' || s.screen === 'form' ? 'fleet' : s.screen;
    const nav = {}; const go = {};
    screens.forEach(k => { nav[k] = { bg: navKey === k ? 'var(--color-accent-100)' : 'transparent', fg: navKey === k ? 'var(--color-accent-800)' : 'var(--color-text)' }; go[k] = () => set({ screen: k }); });
    go.add = () => set({ screen: 'form', editing: false, form: { ...EMPTY_FORM }, readOnlyNote: '' });
    go.edit = () => { const t = trucks.find(x => x.id === s.sel); if (!t) return; set({ screen: 'form', editing: true, readOnlyNote: '', form: { id: t.id, key: t.key, engine: t.spec.engine, horsepower: String(t.spec.horsepower), torque: String(t.spec.torque), loc: t.loc, type: t.spec.type } }); };
    const is = { dashboard: s.screen === 'dashboard', fleet: s.screen === 'fleet', detail: s.screen === 'detail', map: s.screen === 'map', service: s.screen === 'service', parts: s.screen === 'parts', analytics: s.screen === 'analytics', form: s.screen === 'form', health: s.screen === 'health', mission: s.screen === 'mission' };
    const row = t => ({ ...t, ...t.spec, model: t.key, type: t.spec.type, typeTag: TYPE_TAG[t.spec.type] || 'tag-neutral', statusTag: STATUS_TAG[t.status] || 'tag-neutral', co2: fmt(Math.round(perD(gramsPerKm(t.spec.type, map)))), open: open(t.id) });
    const fills = { Electric: 'var(--color-accent)', 'Natural Gas': 'var(--color-accent-300)', Diesel: 'var(--color-neutral-700)' };
    const byType = ['Electric', 'Natural Gas', 'Diesel'].map(ty => { const g = trucks.filter(t => t.spec.type === ty); return { ty, g, avg: gramsPerKm(ty, map) }; });
    const maxAvg = Math.max.apply(null, byType.map(b => b.avg).concat(1));
    const powerBars = byType.map(b => ({ label: b.ty, count: b.g.length, w: (b.avg / maxAvg * 100) + '%', fill: fills[b.ty], value: fmt(Math.round(perD(b.avg))) }));
    const clean = trucks.filter(t => t.spec.type !== 'Diesel').length;
    const readingsFor = t => {
      const live = s.readingsById && s.readingsById[t.id];
      return (live && live.length) ? live : demoReadings(t);
    };
    const healthFor = t => {
      const live = s.healthById && s.healthById[t.id];
      if (live && live.reasons) return live;
      const fleetScore = (s.healthFleet || []).find(h => h.vehicleId === t.id);
      if (fleetScore) return fleetScore;
      return localHealth(t, readingsFor(t), SV);
    };
    let healthRows = trucks.map(t => ({ ...healthFor(t), id: t.id, model: t.key, status: t.status, open: open(t.id), bandTag: healthFor(t).band === 'Healthy' ? 'tag-accent' : healthFor(t).band === 'Attention' ? 'tag-outline' : 'tag-neutral' }));
    healthRows = healthRows.slice().sort((a, b) => s.healthSort === 'id' ? a.id.localeCompare(b.id) : a.score - b.score);
    const bandCount = name => healthRows.filter(h => h.band === name).length;
    const avgHealth = healthRows.length ? Math.round(healthRows.reduce((sum, h) => sum + h.score, 0) / healthRows.length) : 0;
    const operational = trucks.filter(t => t.status === 'Active' || t.status === 'Charging').length;
    const inService = trucks.filter(t => t.status === 'In service').length;
    const openOrders = SV.filter(r => r[5] === 'Open').length;
    const annualFleetCost = trucks.reduce((sum, t) => sum + tripEstimate(t.spec.type, map.annual_distance_km / KM_PER_MI, map, 'Medium', false).costUsd, 0);
    const kpis = [
      { label: 'Total fleet', value: trucks.length, unit: '', note: 'Demo units in this portfolio' },
      { label: 'Operational', value: operational, unit: '', note: 'Active or charging' },
      { label: 'Needs attention', value: healthRows.filter(h => h.band !== 'Healthy').length, unit: '', note: 'Rule score below Healthy' },
      { label: 'In service', value: inService, unit: '', note: 'In the workshop' },
      { label: 'Low-carbon fleet', value: Math.round(clean / trucks.length * 100), unit: '%', note: clean + ' electric or gas units' },
      { label: 'Est. annual energy', value: money(annualFleetCost), unit: '', note: 'ESTIMATE · not a bill' },
      { label: 'Open work orders', value: openOrders, unit: '', note: 'From the service log' },
      { label: 'Average fleet health', value: avgHealth, unit: '', note: 'Explained on Fleet Health' },
    ];
    const alerts = [
      { title: 'Turbo repair in progress', sub: 'Greensboro workshop · open repair', unitId: 'VT-0105', dot: 'var(--color-neutral-800)', open: open('VT-0105') },
      { title: 'Battery at 34% — charging', sub: 'Demo state of charge, not a live charger', unitId: 'VT-0102', dot: 'var(--color-accent)', open: open('VT-0102') },
      { title: 'Brake service open', sub: 'Scheduled work still open', unitId: 'VT-0111', dot: 'var(--color-neutral-800)', open: open('VT-0111') },
      { title: 'Highest diesel CO₂ estimate', sub: 'ESTIMATE · see Electrification Lab', unitId: 'VT-0104', dot: 'var(--color-accent-300)', open: open('VT-0104') },
    ];
    const q = s.query.trim().toLowerCase();
    const fleetRows = trucks.filter(t => (s.typeFilter === 'All' || t.spec.type === s.typeFilter) && (!q || [t.id, t.key, t.spec.engine, t.loc, t.spec.type, t.vin].join(' ').toLowerCase().includes(q))).map(row);
    const seg = (opts, cur, key) => opts.map(o => ({ label: o, bg: cur === o ? 'var(--color-accent)' : 'transparent', fg: cur === o ? 'var(--color-bg)' : 'var(--color-text)', pick: () => set({ [key]: o }) }));
    const st = trucks.find(t => t.id === s.sel) || trucks[0];
    const sr = row(st);
    const svc = r => ({ date: r[0], unit: r[1], kind: r[2], desc: r[3], cost: r[4] ? '$' + fmt(r[4]) : '—', status: r[5], tag: r[5] === 'Open' ? 'tag-outline' : 'tag-neutral', model: (trucks.find(t => t.id === r[1]) || {}).key || '—', open: open(r[1]), impact: r[5] === 'Open' && r[2] === 'Repair' ? '−20 health' : r[5] === 'Open' && r[2] === 'Scheduled' ? '−15 health' : 'Recorded' });
    const hist = SV.filter(r => r[1] === st.id).map(svc);
    const selectedHealth = healthFor(st);
    const selectedReadings = readingsFor(st).filter(reading => Date.parse('2026-09-24T14:00:00Z') - Date.parse(reading.timestamp) <= s.rangeDays * 86400000);
    const levelSeries = selectedReadings.map(reading => reading.energyLevelPercent ?? reading.fuelLevelPercent);
    const grams = gramsPerKm(st.spec.type, map);
    const annual = tripEstimate(st.spec.type, map.annual_distance_km / KM_PER_MI, map, 'Medium', false);
    const dieselAnnual = tripEstimate('Diesel', map.annual_distance_km / KM_PER_MI, map, 'Medium', false);
    const sel = {
      ...sr, odo: fmt(dist(st.odo)), vin: st.vin || ('SIM-' + st.id),
      sourceLabel: (st.source === 'volvo') ? 'VOLVO BASIC VEHICLE INFORMATION API' : 'SIMULATED DATA',
      updatedLabel: (st.source === 'volvo') ? 'Last synchronized ' + (st.updatedAt || '—') : 'Last simulated update ' + (st.updatedAt || '2026-09-24'),
      healthScore: selectedHealth.score, healthBand: selectedHealth.band,
      healthReasons: selectedHealth.reasons.length ? selectedHealth.reasons : [{ delta: 0, text: 'No penalties. Score stays at 100.' }],
      specs: [['Make', st.spec.make], ['Model', st.spec.model], ['Year', st.modelYear || '—'], ['VIN', st.vin || ('SIM-' + st.id)], ['Engine', st.spec.engine], ['Horsepower', st.spec.horsepower + ' hp'], ['Torque', fmt(st.spec.torque) + ' Nm'], ['Source', st.source || 'simulated']].map(([k, v]) => ({ k, v })),
      eco: [
        { label: 'ESTIMATE · CO₂ per ' + unit, value: fmt(Math.round(perD(grams))) + ' g', note: 'From the assumptions panel, not a certified test' },
        { label: 'ESTIMATE · energy cost / yr', value: money(annual.costUsd), note: st.spec.type === 'Electric' ? 'Uses the demo electricity price' : 'Uses the demo fuel price' },
        st.spec.type === 'Diesel'
          ? { label: 'ESTIMATE · vs electric', value: money(annual.costUsd - tripEstimate('Electric', map.annual_distance_km / KM_PER_MI, map, 'Medium', false).costUsd) + '/yr', note: 'Operating-cost difference only' }
          : { label: 'ESTIMATE · vs diesel', value: fmt((dieselAnnual.co2Kg - annual.co2Kg) / 1000) + ' t/yr', note: 'CO₂ difference under the demo factors' },
      ],
      history: hist.length ? hist : [{ date: '—', kind: '—', desc: 'No records yet', cost: '', status: '—', tag: 'tag-neutral', impact: '' }],
      odoPoints: spark(selectedReadings.map(reading => reading.odometerKm)),
      levelPoints: spark(levelSeries),
      levelName: st.spec.type === 'Electric' ? 'Energy %' : 'Fuel %',
      hasChart: selectedReadings.length > 1,
      parameters: (s.parameters || DEMO_PARAMS).filter(p => p.fits === 'All' || (p.fits === 'Electric' && st.spec.type === 'Electric') || (p.fits === 'Fuel' && st.spec.type !== 'Electric') || !p.fits).map(p => ({ id: p.parameter_id || p.parameterId, name: p.name, type: p.parameter_type || p.parameterType, unit: p.unit || '' })),
    };
    const placed = trucks.filter(t => t.lat != null && t.lng != null);
    const mapDots = placed.map(t => { const pos = project(t.lat, t.lng); return { id: t.id, x: pos.x, y: pos.y, size: t.id === s.mapSel ? '18px' : '12px', fill: fills[t.spec.type], ring: t.id === s.mapSel ? 'var(--color-accent-800)' : 'var(--color-bg)', pick: () => set({ mapSel: t.id }) }; });
    const ms = trucks.find(t => t.id === s.mapSel) || trucks[0];
    const mapSel = { ...row(ms), levelLabel: ms.spec.type === 'Electric' ? 'Battery' : 'Fuel', open: open(ms.id), odoText: fmt(dist(ms.odo)) + ' ' + unit, updated: ms.updatedAt ? String(ms.updatedAt).slice(0, 16).replace('T', ' ') : 'simulated', coords: ms.lat != null ? Number(ms.lat).toFixed(3) + ', ' + Number(ms.lng).toFixed(3) : 'No coordinates' };
    const chargers = CHARGERS.map(c => ({ ...c, ...project(c.lat, c.lng) }));
    const svcRows = SV.filter(r => s.svcFilter === 'All' || r[2] === s.svcFilter).map(svc);
    const spend = SV.reduce((sum, r) => sum + Number(r[4] || 0), 0);
    const svcStats = [
      { label: 'Open work orders', value: openOrders, note: inService + ' units in the workshop' },
      { label: 'Scheduled still open', value: SV.filter(r => r[2] === 'Scheduled' && r[5] === 'Open').length, note: 'Counts as −15 health' },
      { label: 'Logged cost', value: '$' + fmt(spend), note: 'Placeholder workshop costs' },
    ];
    const pq = s.partQuery.trim().toLowerCase();
    const partRows = PT.filter(p => (!s.remanOnly || p[5]) && (!pq || (p[0] + ' ' + p[1] + ' ' + p[2]).toLowerCase().includes(pq))).map(p => ({ pn: p[0], name: p[1], fits: p[2], stock: p[3], price: p[4], source: p[5] ? 'Remanufactured' : 'New', tag: p[5] ? 'tag-accent' : 'tag-neutral', catalog: 'Placeholder' }));
    const dieselTrucks = trucks.filter(t => t.spec.type === 'Diesel');
    const n = Math.min(s.sim, dieselTrucks.length);
    const switched = dieselTrucks.slice(0, n);
    const dieselCost = switched.reduce((sum, t) => sum + tripEstimate('Diesel', map.annual_distance_km / KM_PER_MI, map, 'Medium', false).costUsd, 0);
    const electricCost = switched.reduce((sum, t) => sum + tripEstimate('Electric', map.annual_distance_km / KM_PER_MI, map, 'Medium', false).costUsd, 0);
    const dieselCo2 = switched.reduce((sum, t) => sum + tripEstimate('Diesel', map.annual_distance_km / KM_PER_MI, map, 'Medium', false).co2Kg, 0);
    const electricCo2 = switched.reduce((sum, t) => sum + tripEstimate('Electric', map.annual_distance_km / KM_PER_MI, map, 'Medium', false).co2Kg, 0);
    const sim = { n, max: dieselTrucks.length, out: [
      { label: 'ESTIMATE · diesel cost / yr', value: money(dieselCost), note: 'Fuel only, for the units being replaced' },
      { label: 'ESTIMATE · electric cost / yr', value: money(electricCost), note: 'Energy only, after charging efficiency' },
      { label: 'ESTIMATE · cost difference', value: money(dieselCost - electricCost), note: 'Diesel minus electric. Not a purchase case.' },
      { label: 'ESTIMATE · CO₂ difference', value: fmt((dieselCo2 - electricCo2) / 1000) + ' t', note: 'Positive means the estimate is lower on electric' },
    ] };
    const modelRanks = Object.keys(MODELS).map(k => ({ k, v: gramsPerKm(MODELS[k].type, map), t: MODELS[k].type })).sort((a, b) => b.v - a.v);
    const mMax = modelRanks[0].v || 1;
    const modelBars = modelRanks.map(m => ({ label: m.k, w: (m.v / mMax * 100) + '%', fill: fills[m.t], value: fmt(Math.round(perD(m.v))) }));
    const costCols = [['Diesel', tripEstimate('Diesel', map.annual_distance_km / KM_PER_MI, map, 'Medium', false).costUsd, fills.Diesel], ['Natural gas', tripEstimate('Natural Gas', map.annual_distance_km / KM_PER_MI, map, 'Medium', false).costUsd, fills['Natural Gas']], ['Electric', tripEstimate('Electric', map.annual_distance_km / KM_PER_MI, map, 'Medium', false).costUsd, fills.Electric]];
    const costMax = Math.max.apply(null, costCols.map(c => c[1]));
    const costColsView = costCols.map(([label, v, fill]) => ({ label, fill, value: money(v), h: (v / costMax * 85) + '%' }));
    const f = s.form;
    const upd = k => e => set({ form: { ...s.form, [k]: e.target.value } });
    const formFields = [['Truck ID', 'id', 'VT-0115'], ['Model', 'key', 'e.g. FH-E'], ['Engine', 'engine', 'e.g. D13TC'], ['Horsepower', 'horsepower', '500'], ['Torque (Nm)', 'torque', '2000'], ['Home location', 'loc', 'Greensboro depot']].map(([label, k, ph]) => ({ label, ph, value: f[k], onChange: upd(k) }));
    const formTypes = seg(['Diesel', 'Natural Gas', 'Electric'], f.type, '_').map(o => ({ ...o, pick: () => set({ form: { ...s.form, type: o.label } }) }));
    const formAnnual = tripEstimate(f.type, map.annual_distance_km / KM_PER_MI, map, 'Medium', false);
    const formEst = { co2: fmt(Math.round(perD(gramsPerKm(f.type, map)))), cost: money(formAnnual.costUsd), tip: 'ESTIMATE from the demo assumptions. The public site does not treat this as measured performance.' };
    const saveForm = () => {
      const id = (f.id || '').trim() || ('VT-' + String(115 + s.extra.length).padStart(4, '0'));
      const spec = { make: 'Volvo', model: f.key || 'FH', engine: f.engine || '—', horsepower: +f.horsepower || 0, torque: +f.torque || 0, type: f.type };
      const api = this.api();
      const note = 'The public demo is read-only, so this record stays in this browser session.';
      if (api) {
        fetch(api + '/api/trucks' + (s.editing ? '/' + encodeURIComponent(id) : ''), { method: s.editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, model_key: f.key || 'FH', ...spec, status: 'Active', loc: f.loc || 'Greensboro depot' }) })
          .then(res => { if (res.status === 403) this.setState({ readOnlyNote: note }); else if (res.ok) this.componentDidMount(); })
          .catch(e => console.warn(e));
      }
      if (s.editing) { set({ screen: 'detail', readOnlyNote: note }); return; }
      set({ extra: [...s.extra, { id, key: f.key || 'FH', status: 'Active', loc: f.loc || 'Greensboro depot', lat: 36.07, lng: -79.79, odo: 0, level: 100, source: 'simulated', vin: 'SIM-' + id, modelYear: 2026, updatedAt: new Date().toISOString(), spec }], sel: id, screen: 'detail', readOnlyNote: note });
    };
    const labFields = ['diesel_price', 'electricity_price', 'annual_distance_km', 'charging_efficiency', 'grid_g_per_kwh'].map(key => {
      const found = DEFAULT_ASSUMPTIONS.find(row => row.key === key);
      return { key, label: found.label, unit: found.unit, value: map[key], onChange: e => set({ lab: { ...s.lab, [key]: e.target.value } }) };
    });
    const assumptionRows = DEFAULT_ASSUMPTIONS.map(row => ({ ...row, value: map[row.key], source: row.source_name }));
    const mission = s.mission;
    const setMission = (key, value) => set({ mission: { ...s.mission, [key]: value } });
    const missionRows = trucks.map(t => {
      const estimate = tripEstimate(t.spec.type, mission.miles, map, mission.payload, mission.roundTrip);
      const rangeKm = t.spec.type === 'Electric' ? (t.level / 100) * map.demo_battery_kwh / map.ev_kwh_per_km : null;
      const chargingRequired = t.spec.type === 'Electric' && rangeKm != null && estimate.distanceKm > rangeKm;
      return { id: t.id, model: t.key, type: t.spec.type, cost: money(estimate.costUsd), co2: fmt(estimate.co2Kg) + ' kg', range: rangeKm == null ? 'Fuel stop assumed' : fmt(rangeKm / KM_PER_MI) + ' ' + unit + ' planning range', charging: t.spec.type !== 'Electric' ? 'Not electric' : chargingRequired ? (mission.charging ? 'Destination charge assumed' : 'Exceeds planning range') : 'Within planning range', open: open(t.id) };
    });
    const trendSource = (s.energyTrend && s.energyTrend.length) ? s.energyTrend.map(row => row.level) : (trucks[0] ? readingsFor(trucks[0]).map(reading => reading.energyLevelPercent ?? reading.fuelLevelPercent) : []);
    const recentService = SV.slice().sort((a, b) => String(b[0]).localeCompare(String(a[0]))).slice(0, 4).map(svc);
    const sourceVolvo = s.sourceMode === 'volvo';
    const sourceTitle = sourceVolvo ? 'Volvo Connected' : 'Demo Fleet';
    const dataSource = s.loading ? 'Checking the live API…' : sourceVolvo ? 'Authorized Basic Vehicle Information API data' : (s.online ? 'Simulated connected-vehicle data · ' + trucks.length + ' units' : 'Simulated connected-vehicle data · offline demo');
    return {
      dataSource, sourceTitle, sourceDot: sourceVolvo ? 'var(--color-accent-800)' : 'var(--color-accent)',
      is, nav, go, unit, showLearn: this.props.showLearn ?? true,
      kpis, powerBars, alerts, lessons: LESSONS, healthBands: [
        { label: 'Healthy', value: bandCount('Healthy') },
        { label: 'Attention', value: bandCount('Attention') },
        { label: 'Service Required', value: bandCount('Service Required') },
      ],
      recentService, energyPoints: spark(trendSource), energyNote: 'ESTIMATE of stored demo levels. Not a live sensor feed.',
      elexSnapshot: sim.out[2].value + ' cost difference if ' + n + ' diesel units are replaced',
      query: s.query, onQuery: e => set({ query: e.target.value }), typeFilters: seg(['All', 'Electric', 'Natural Gas', 'Diesel'], s.typeFilter, 'typeFilter'),
      fleetRows, fleetEmpty: fleetRows.length === 0, fleetCount: fleetRows.length, totalCount: trucks.length,
      sel, chargers, mapDots, mapSel, mapEmpty: mapDots.length === 0,
      svcFilters: seg(['All', 'Scheduled', 'Repair', 'Inspection'], s.svcFilter, 'svcFilter'), svcRows, svcStats,
      partQuery: s.partQuery, onPartQuery: e => set({ partQuery: e.target.value }), partRows, partsCount: PT.length, partsEmpty: partRows.length === 0,
      toggleReman: () => set({ remanOnly: !s.remanOnly }), remanBg: s.remanOnly ? 'var(--color-accent)' : 'transparent', remanFg: s.remanOnly ? 'var(--color-bg)' : 'var(--color-text)',
      sim, onSim: e => set({ sim: +e.target.value }), modelBars, costCols: costColsView, annualDist: fmt(dist(map.annual_distance_km)),
      formFields, formTypes, formEst, saveForm, formMode: s.editing ? 'Edit ' + f.id : 'New record', formTitle: s.editing ? 'Edit truck' : 'Add a truck', readOnlyNote: s.readOnlyNote,
      healthRows, healthEmpty: healthRows.length === 0, sortScore: () => set({ healthSort: 'score' }), sortId: () => set({ healthSort: 'id' }),
      scoreBg: s.healthSort === 'score' ? 'var(--color-accent)' : 'transparent', scoreFg: s.healthSort === 'score' ? 'var(--color-bg)' : 'var(--color-text)',
      idBg: s.healthSort === 'id' ? 'var(--color-accent)' : 'transparent', idFg: s.healthSort === 'id' ? 'var(--color-bg)' : 'var(--color-text)',
      ranges: [7, 14, 30, 90].map(days => ({ label: days + 'D', bg: s.rangeDays === days ? 'var(--color-accent)' : 'transparent', fg: s.rangeDays === days ? 'var(--color-bg)' : 'var(--color-text)', pick: () => set({ rangeDays: days }) })),
      labFields, assumptionRows, showAssumptions: s.showAssumptions, toggleAssumptions: () => set({ showAssumptions: !s.showAssumptions }),
      mission, missionRows, onOrigin: e => setMission('origin', e.target.value), onDestination: e => setMission('destination', e.target.value), onMiles: e => setMission('miles', e.target.value),
      payloadFilters: ['Light', 'Medium', 'Heavy'].map(label => ({ label, bg: mission.payload === label ? 'var(--color-accent)' : 'transparent', fg: mission.payload === label ? 'var(--color-bg)' : 'var(--color-text)', pick: () => setMission('payload', label) })),
      roundBg: mission.roundTrip ? 'var(--color-accent)' : 'transparent', roundFg: mission.roundTrip ? 'var(--color-bg)' : 'var(--color-text)', toggleRound: () => setMission('roundTrip', !mission.roundTrip),
      chargeBg: mission.charging ? 'var(--color-accent)' : 'transparent', chargeFg: mission.charging ? 'var(--color-bg)' : 'var(--color-text)', toggleCharge: () => setMission('charging', !mission.charging),
    };
  }
}
