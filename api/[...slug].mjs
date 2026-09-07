// lib/data.ts
var STATION_BASELINES = {
  maitri: {
    outdoor: -38,
    indoor: 20.5,
    rpm: 1490,
    fuel: 12800,
    vibration: 2.5,
    hvac: 1.01,
    water: 17,
    battery: 68,
    burn_rate: 155,
    solar_max: 5,
    wind_max: 10
  },
  bharati: {
    outdoor: -34,
    indoor: 21,
    rpm: 1500,
    fuel: 14200,
    vibration: 2.2,
    hvac: 1.02,
    water: 18.5,
    battery: 75,
    burn_rate: 145,
    solar_max: 5,
    wind_max: 10
  },
  maitri_ii: {
    outdoor: -38,
    indoor: 21,
    rpm: 1500,
    fuel: 9e3,
    vibration: 2,
    hvac: 1.03,
    water: 17.5,
    battery: 80,
    burn_rate: 90,
    solar_max: 8,
    wind_max: 15
  }
};
var STATION_PARAMS = {
  maitri: {
    latitude: -70.7668,
    diesel_kw: 40,
    fuel_efficiency_kwh_per_gal: 12,
    baseline_burn_rate_lph: 155,
    solar_max_kw: 5,
    wind_max_kw: 10,
    wind_cut_in: 10,
    wind_cut_out: 90,
    annual_fuel_gallons: 12e4,
    fuel_cost_usd_per_gal: 42
  },
  bharati: {
    latitude: -69.4068,
    diesel_kw: 40,
    fuel_efficiency_kwh_per_gal: 12,
    baseline_burn_rate_lph: 145,
    solar_max_kw: 5,
    wind_max_kw: 10,
    wind_cut_in: 10,
    wind_cut_out: 90,
    annual_fuel_gallons: 115e3,
    fuel_cost_usd_per_gal: 42
  },
  maitri_ii: {
    latitude: -70.76,
    diesel_kw: 40,
    fuel_efficiency_kwh_per_gal: 12,
    baseline_burn_rate_lph: 90,
    solar_max_kw: 8,
    wind_max_kw: 15,
    wind_cut_in: 10,
    wind_cut_out: 90,
    annual_fuel_gallons: 8e4,
    fuel_cost_usd_per_gal: 42
  }
};
var STATION_INVENTORY = {
  maitri: { fuel: 12800, food_days: 45, medical_days: 60, spare_parts: 24, battery_soc: 68, burn_rate: 155 },
  bharati: { fuel: 14200, food_days: 52, medical_days: 65, spare_parts: 18, battery_soc: 75, burn_rate: 145 },
  maitri_ii: { fuel: 9e3, food_days: 38, medical_days: 50, spare_parts: 12, battery_soc: 80, burn_rate: 90 }
};
var WAYPOINTS = {
  goa: { lat: 15.4909, lon: 73.8278, label: "NCPOR Goa HQ" },
  cape_town: { lat: -33.9249, lon: 18.4241, label: "Cape Town (resupply port)" },
  maitri: { lat: -70.7668, lon: 11.7308, label: "Maitri" },
  bharati: { lat: -69.4068, lon: 76.19525, label: "Bharati" }
};
var ROUTE_EDGES = [
  ["goa", "cape_town", 7800],
  ["cape_town", "maitri", 4200],
  ["cape_town", "bharati", 4800],
  ["maitri", "bharati", 3e3],
  ["goa", "bharati", 11500],
  ["goa", "maitri", 10600]
];
var HQ = { name: "NCPOR Goa HQ", lat: 15.4909, lon: 73.8278 };
var SHIP_SPEED_KNOTS = 14;
var INVENTORY_SEED = [
  { stationId: "maitri", name: "Diesel", category: "fuel", quantity: 12800, unit: "L", reorderThreshold: 2500 },
  { stationId: "maitri", name: "Food rations", category: "food", quantity: 4600, unit: "kg", reorderThreshold: 2e3 },
  { stationId: "maitri", name: "Medical kits", category: "medical", quantity: 22, unit: "units", reorderThreshold: 10 },
  { stationId: "maitri", name: "Spare parts", category: "spare_part", quantity: 85, unit: "units", reorderThreshold: 40 },
  { stationId: "bharati", name: "Diesel", category: "fuel", quantity: 14200, unit: "L", reorderThreshold: 2500 },
  { stationId: "bharati", name: "Food rations", category: "food", quantity: 5200, unit: "kg", reorderThreshold: 2200 },
  { stationId: "bharati", name: "Medical kits", category: "medical", quantity: 26, unit: "units", reorderThreshold: 10 },
  { stationId: "bharati", name: "Spare parts", category: "spare_part", quantity: 95, unit: "units", reorderThreshold: 45 },
  { stationId: "maitri_ii", name: "Diesel", category: "fuel", quantity: 9e3, unit: "L", reorderThreshold: 2e3 },
  { stationId: "maitri_ii", name: "Food rations", category: "food", quantity: 1800, unit: "kg", reorderThreshold: 900 },
  { stationId: "maitri_ii", name: "Medical kits", category: "medical", quantity: 12, unit: "units", reorderThreshold: 6 },
  { stationId: "maitri_ii", name: "Spare parts", category: "spare_part", quantity: 40, unit: "units", reorderThreshold: 20 }
];
var METRICS = [
  "outdoor_temp",
  "indoor_temp",
  "generator_rpm",
  "fuel_level_liters",
  "vibration_level",
  "hvac_pressure",
  "water_temp",
  "solar_output_kw",
  "wind_output_kw",
  "battery_soc",
  "wind_speed_kmh"
];
var FUEL_CAPACITY = {
  maitri: 25600,
  bharati: 25e3,
  maitri_ii: 2e4
};
var MONTHLY_CLIMATOLOGY = {
  // [Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec] — monthly mean outdoor °C
  maitri: [-3, -8, -12, -16, -19, -22, -24, -23, -19, -13, -7, -2],
  bharati: [-2, -6, -10, -14, -17, -20, -22, -21, -17, -11, -5, -1],
  maitri_ii: [-3, -8, -12, -16, -19, -22, -24, -23, -19, -13, -7, -2]
};
function monthlyOutdoor(stationId, date = /* @__PURE__ */ new Date()) {
  const month = date.getMonth();
  const climo = MONTHLY_CLIMATOLOGY[stationId] || MONTHLY_CLIMATOLOGY.maitri;
  return climo[month];
}
var UNITS = {
  outdoor_temp: "\xB0C",
  indoor_temp: "\xB0C",
  generator_rpm: "RPM",
  fuel_level_liters: "L",
  vibration_level: "mm/s",
  hvac_pressure: "bar",
  water_temp: "\xB0C",
  solar_output_kw: "kW",
  wind_output_kw: "kW",
  battery_soc: "%",
  wind_speed_kmh: "km/h"
};
var FEATURES = [
  "generator_rpm",
  "vibration_level",
  "outdoor_temp",
  "indoor_temp",
  "fuel_level_liters",
  "hvac_pressure",
  "battery_soc",
  "wind_speed_kmh"
];

// lib/store.ts
var alertId = 100;
var store = {
  faultModes: {},
  alerts: [],
  shipments: [],
  inventory: [],
  // Telemetry history buffer (ring buffer per station per metric)
  telemetry: /* @__PURE__ */ new Map(),
  initialized: false,
  init() {
    if (this.initialized) return;
    this.initialized = true;
    this.inventory = INVENTORY_SEED.map((item, i) => ({
      id: `INV-${i + 1}`,
      stationId: item.stationId,
      itemName: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      reorderThreshold: item.reorderThreshold
    }));
    this.alerts = [
      { id: "ALT-001", stationId: "bharati", metric: "fuel_level_liters", severity: "critical", message: "Fuel below critical threshold \u2014 immediate resupply required", value: 2100, threshold: 2500, status: "open", triggeredAt: new Date(Date.now() - 36e5).toISOString() },
      { id: "ALT-002", stationId: "maitri", metric: "outdoor_temp", severity: "advisory", message: "Temperature dropping below seasonal average \u2014 monitor heating systems", value: -24, threshold: -55, status: "acknowledged", triggeredAt: new Date(Date.now() - 72e5).toISOString() },
      { id: "ALT-003", stationId: "maitri", metric: "generator_rpm", severity: "warning", message: "Generator RPM fluctuation detected \u2014 vibration check recommended", value: 1350, threshold: 800, status: "open", triggeredAt: new Date(Date.now() - 18e5).toISOString() },
      { id: "ALT-004", stationId: "bharati", metric: "general", severity: "info", message: "Resupply vessel MV Sagar Nidhi departed Goa \u2014 ETA 15 days", value: 0, threshold: 0, status: "open", triggeredAt: new Date(Date.now() - 864e5).toISOString() }
    ];
    this.shipments = [
      { id: "SUP-204", stationId: "maitri", itemName: "Diesel fuel & food rations", quantity: 45e3, unit: "kg", plannedDate: "2026-11-15", status: "planned" },
      { id: "SUP-203", stationId: "bharati", itemName: "Medical supplies & spare parts", quantity: 12e3, unit: "kg", plannedDate: "2026-11-20", status: "planned" },
      { id: "SUP-205", stationId: "maitri_ii", itemName: "Construction materials", quantity: 8e4, unit: "kg", plannedDate: "2026-12-01", status: "planned" }
    ];
  },
  pushTelemetry(stationId, metricName, value, unit) {
    const key = `${stationId}:${metricName}`;
    if (!this.telemetry.has(key)) this.telemetry.set(key, []);
    const arr = this.telemetry.get(key);
    arr.push({ stationId, metricName, value, unit, timestamp: (/* @__PURE__ */ new Date()).toISOString() });
    if (arr.length > 1e4) arr.splice(0, arr.length - 1e4);
  },
  getTelemetryHistory(stationId, metricName, maxEntries = 5e3) {
    const key = `${stationId}:${metricName}`;
    return (this.telemetry.get(key) || []).slice(-maxEntries);
  },
  getTelemetryPairs(stationId, metricName, maxEntries = 5e3) {
    const rows = this.getTelemetryHistory(stationId, metricName, maxEntries);
    const timestamps = rows.map((r) => new Date(r.timestamp).getTime() / 1e3);
    const values = rows.map((r) => r.value);
    return [timestamps, values];
  },
  addAlert(alert) {
    const a = {
      ...alert,
      id: `ALT-${++alertId}`,
      triggeredAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.alerts.push(a);
    return a;
  }
};

// lib/stations.ts
var STATIONS_DB = [
  {
    id: "bharati",
    stationName: "Bharati",
    officialName: "Bharati Station",
    countryName: "India",
    instituteName: "National Centre for Antarctic and Ocean Research",
    yearEstablished: 2012,
    operationalPeriod: "Year-Round",
    status: "Open",
    latitude: -69.4068,
    longitude: 76.19525,
    latitudeDDM: "69\xB0 24.408' S",
    longitudeDDM: "76\xB0 11.715' E",
    elevation: 35,
    peakPopulation: 47,
    powerSupply: "Fossil Fuel",
    location: "Bharati station is located in Larsemann Hills, Princess Elizabeth Land, East Antarctica.",
    history: "Bharati station was inaugurated in 2012. It is India's third Antarctic research station.",
    scienceDisciplines: "Atmospheric chemistry and physics, Climate change, Environmental sciences, Geology, Geomorphology, Geophysics, Glaciology.",
    features: "Bird colonies, Bluff, Clear air zone, Coast, Fjord, Hill, Lake, Other Biological, Rock, Sea, Sea ice, Shoreline, Snow.",
    biodiversity: "The station is located in an ice-free area. Vegetation is scarce with mosses and lichens. Fauna includes a few bird species and seals.",
    generalResearch: "Research campaigns in glaciology, marine biology, atmospheric sciences, and environmental sciences.",
    imageUrl: "https://comnap.quickbase.com/up/bibrbwkpg/a/r48/e56/v0/5N7A3386.jpg",
    webcamUrl: ""
  },
  {
    id: "maitri",
    stationName: "Maitri",
    officialName: "Maitri Station",
    countryName: "India",
    instituteName: "National Centre for Antarctic & Ocean Research",
    yearEstablished: 1989,
    operationalPeriod: "Year-Round",
    status: "Open",
    latitude: -70.766834,
    longitude: 11.730783,
    latitudeDDM: "70\xB0 46.01' S",
    longitudeDDM: "11\xB0 43.847' E",
    elevation: 117,
    peakPopulation: 65,
    powerSupply: "Fossil Fuel",
    location: "Maitri station is situated on an ice free, rocky area on the Schirmacher Oasis in central Dronning Maud Land, East Antarctica.",
    history: "Since 1983 the Indian scientific endeavors in Antarctica have been sustained on a year round basis. 'Maitri' has been operational since 1989.",
    scienceDisciplines: "Atmospheric chemistry and physics, Climate change, Environmental sciences, Geodesy, Geology, Geomorphology, Geophysics, Glaciology.",
    features: "Bird colonies, Clear air zone, Hill, Ice cap or glacier, Ice shelf, Ice tongue, Lake, Melt streams, Moraine, Mountain, Rock, Snow, Valley.",
    biodiversity: "Ice-free ground: petrels, skua and penguins are occasionally seen.",
    generalResearch: "Research in Atmospheric Sciences, Earth Sciences, Glaciology, Human Biology, Medicine, Biology and Environmental Sciences.",
    imageUrl: "https://comnap.quickbase.com/up/bibrbwkpg/a/r50/e56/v0/Maitri4_National%20Centre%20for%20Antarctic%20and%20Ocean%20Research.jpg",
    webcamUrl: ""
  },
  {
    id: "maitri_ii",
    stationName: "Maitri II",
    officialName: "Maitri II Station",
    countryName: "India",
    instituteName: "National Centre for Polar and Ocean Research (NCPOR)",
    yearEstablished: null,
    operationalPeriod: "Under Construction",
    status: "Under Construction",
    latitude: -70.76,
    longitude: 11.73,
    latitudeDDM: "70\xB0 45' S (approx)",
    longitudeDDM: "11\xB0 44' E (approx)",
    elevation: null,
    peakPopulation: null,
    powerSupply: "Renewable, Fossil Fuel",
    location: "Maitri II is India's upcoming fourth Antarctic research station, planned in the Schirmacher Oasis region near the existing Maitri station.",
    history: "Announced to replace the aging Maitri station. Will run on solar power in summer and wind energy, with automated instruments.",
    scienceDisciplines: "",
    features: "",
    biodiversity: "",
    generalResearch: "",
    imageUrl: "",
    webcamUrl: ""
  }
];

// lib/utils.ts
function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const p1 = lat1 * Math.PI / 180;
  const p2 = lat2 * Math.PI / 180;
  const dp = (lat2 - lat1) * Math.PI / 180;
  const dl = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}
function sigmoid(x) {
  return x >= 0 ? 1 / (1 + Math.exp(-x)) : Math.exp(x) / (1 + Math.exp(x));
}
function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}
function mean(arr) {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}
function std(arr) {
  if (arr.length === 0) return 0;
  const m = mean(arr);
  const variance = arr.reduce((sum, v) => sum + (v - m) ** 2, 0) / arr.length;
  return Math.sqrt(variance);
}
function polyfit(xs, ys, degree) {
  if (degree !== 1 || xs.length < 2) return [0, mean(ys)];
  const n = xs.length;
  const sumX = xs.reduce((a, b) => a + b, 0);
  const sumY = ys.reduce((a, b) => a + b, 0);
  const sumXY = xs.reduce((a, x, i) => a + x * ys[i], 0);
  const sumX2 = xs.reduce((a, x) => a + x * x, 0);
  const denom = n * sumX2 - sumX * sumX;
  if (Math.abs(denom) < 1e-12) return [0, mean(ys)];
  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;
  return [slope, intercept];
}
function rSquared(actual, predicted) {
  const m = mean(actual);
  const ssRes = actual.reduce((sum, v, i) => sum + (v - predicted[i]) ** 2, 0);
  const ssTot = actual.reduce((sum, v) => sum + (v - m) ** 2, 0);
  return ssTot > 0 ? Math.max(0, 1 - ssRes / ssTot) : 0;
}
function mape(actual, predicted) {
  let sum = 0;
  let count = 0;
  for (let i = 0; i < actual.length; i++) {
    if (Math.abs(actual[i]) > 0.1) {
      sum += Math.abs((actual[i] - predicted[i]) / actual[i]);
      count++;
    }
  }
  return count > 0 ? sum / count * 100 : 0;
}

// lib/simulator.ts
function seasonSolar(now) {
  return 0.5 * (1 + Math.cos(2 * Math.PI * (now.getMonth() + 1 - 12) / 12));
}
function daily(now) {
  const hour = now.getHours() + now.getMinutes() / 60;
  return 0.5 * (1 + Math.cos(2 * Math.PI * (hour - 12) / 24));
}
function windKw(spec, speed) {
  if (speed < 10 || speed > 90) return 0;
  const frac = (speed - 10) / 80;
  return Math.max(0, Math.min(spec.wind_max, spec.wind_max * frac ** 2));
}
function seededRand(seed) {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}
function gauss(mean2, stddev, seed) {
  const u1 = seededRand(seed);
  const u2 = seededRand(seed + 0.5);
  const z = Math.sqrt(-2 * Math.log(Math.max(u1, 1e-10))) * Math.cos(2 * Math.PI * u2);
  return mean2 + z * stddev;
}
function computeReading(t, baseline, stationId, fault) {
  const ts = new Date(t * 1e3);
  const seed = t + stationId.charCodeAt(0) * 1e3;
  const solar = baseline.solar_max * seasonSolar(ts) * daily(ts);
  const windSpeed = Math.abs(gauss(22, 12, seed));
  const wind = windKw(baseline, windSpeed);
  const outdoorBase = monthlyOutdoor(stationId, ts);
  const outdoor = outdoorBase + Math.sin(t / 3600) * 0.8 + Math.sin(2 * Math.PI * t / 86400) * 3 + gauss(0, 0.3, seed + 1);
  const indoor = baseline.indoor + gauss(0, 0.15, seed + 2);
  const rpm = baseline.rpm + gauss(0, 8, seed + 3);
  const vibration = baseline.vibration + Math.abs(gauss(0, 0.1, seed + 4));
  const hvac = baseline.hvac + gauss(0, 0.015, seed + 5);
  const water = baseline.water + gauss(0, 0.2, seed + 6);
  const battery = Math.max(5, Math.min(100, baseline.battery + gauss(0, 0.2, seed + 7)));
  const capacity = FUEL_CAPACITY[stationId] || 25600;
  const fuel = Math.min(capacity, Math.max(0, baseline.fuel + baseline.burn_rate / 3600 * (Date.now() / 1e3 - t)));
  let out = { outdoor, indoor, rpm, vibration, hvac, fuel, battery };
  if (fault === "storm") {
    out.outdoor -= 15;
    out.vibration += 1.2;
  } else if (fault === "gen_failure") {
    out.rpm = gauss(400, 100, seed + 8);
    out.vibration += 4.5;
  } else if (fault === "fuel_low") {
    out.fuel = Math.max(0, out.fuel - 50);
  } else if (fault === "hvac_fault") {
    out.hvac = 0.25 + gauss(0, 0.05, seed + 9);
    out.indoor = Math.max(-5, out.indoor - 0.1);
  }
  return {
    outdoor_temp: Math.round(Math.max(-65, out.outdoor) * 100) / 100,
    indoor_temp: Math.round(out.indoor * 100) / 100,
    generator_rpm: Math.round(Math.max(0, out.rpm) * 10) / 10,
    fuel_level_liters: Math.round(out.fuel * 10) / 10,
    vibration_level: Math.round(Math.max(0, out.vibration) * 1e3) / 1e3,
    hvac_pressure: Math.round(out.hvac * 1e3) / 1e3,
    water_temp: Math.round(water * 100) / 100,
    solar_output_kw: Math.round(Math.max(0, solar) * 1e3) / 1e3,
    wind_output_kw: Math.round(Math.max(0, wind) * 1e3) / 1e3,
    battery_soc: Math.round(battery * 10) / 10,
    wind_speed_kmh: Math.round(windSpeed * 10) / 10
  };
}
function generateTelemetry(stationId, opts) {
  const baseline = STATION_BASELINES[stationId];
  if (!baseline) throw new Error(`Unknown station: ${stationId}`);
  const fault = store.faultModes[stationId] || null;
  const values = computeReading(Date.now() / 1e3, baseline, stationId, fault);
  if (opts?.outdoorOverride !== void 0) {
    values.outdoor_temp = opts.outdoorOverride;
  }
  return values;
}
var historyCache = /* @__PURE__ */ new Set();
function generateHistoryBuffer(stationId, hours = 48, metric) {
  const baseline = STATION_BASELINES[stationId];
  if (!baseline) return;
  const metricsToGenerate = metric ? [metric] : METRICS;
  const uncached = metricsToGenerate.filter((m) => !historyCache.has(`${stationId}:${m}`));
  if (uncached.length === 0) return;
  const now = Date.now() / 1e3;
  const intervalSec = 60;
  const totalSamples = Math.floor(hours * 3600 / intervalSec);
  const fault = store.faultModes[stationId] || null;
  for (let i = totalSamples; i > 0; i--) {
    const t = now - i * intervalSec;
    const values = computeReading(t, baseline, stationId, fault);
    for (const m of uncached) {
      if (m in values) {
        const key = `${stationId}:${m}`;
        if (!store.telemetry.has(key)) store.telemetry.set(key, []);
        const arr = store.telemetry.get(key);
        arr.push({
          stationId,
          metricName: m,
          value: values[m],
          unit: UNITS[m] || "",
          timestamp: new Date(t * 1e3).toISOString()
        });
        if (arr.length > 1e4) arr.splice(0, arr.length - 1e4);
      }
    }
  }
  for (const m of uncached) {
    historyCache.add(`${stationId}:${m}`);
  }
}

// lib/predictor.ts
function predictFuel(timestamps, fuelLevels) {
  const modelName = "Linear Regression (Fuel)";
  if (timestamps.length < 3) {
    return { predicted: null, confidenceLow: null, confidenceHigh: null, accuracyR2: null, accuracyMape: null, modelName, sampleCount: timestamps.length, details: {} };
  }
  const timeSpanHours = (timestamps[timestamps.length - 1] - timestamps[0]) / 3600;
  if (timeSpanHours < 2 / 60) {
    return { predicted: null, confidenceLow: null, confidenceHigh: null, accuracyR2: null, accuracyMape: null, modelName, sampleCount: timestamps.length, details: { reason: "Insufficient time spread" } };
  }
  const hours = timestamps.map((t) => (t - timestamps[0]) / 3600);
  const [slope, intercept] = polyfit(hours, fuelLevels, 1);
  const predictedVals = hours.map((h) => slope * h + intercept);
  const r2 = rSquared(fuelLevels, predictedVals);
  const mapeVal = mape(fuelLevels, predictedVals);
  const currentFuel = fuelLevels[fuelLevels.length - 1];
  const daysToDepletion = slope >= 0 ? null : Math.round(-currentFuel / slope / 24 * 10) / 10;
  const residualStd = Math.sqrt(
    fuelLevels.reduce((sum, v, i) => sum + (v - predictedVals[i]) ** 2, 0) / Math.max(fuelLevels.length - 2, 1)
  );
  const ciHalf = 1.96 * residualStd;
  return {
    predicted: daysToDepletion,
    confidenceLow: daysToDepletion && slope !== 0 ? Math.round((daysToDepletion - ciHalf / Math.abs(slope) / 24) * 10) / 10 : null,
    confidenceHigh: daysToDepletion && slope !== 0 ? Math.round((daysToDepletion + ciHalf / Math.abs(slope) / 24) * 10) / 10 : null,
    accuracyR2: Math.round(Math.max(0, r2) * 1e4) / 1e4,
    accuracyMape: Math.round(mapeVal * 100) / 100,
    modelName,
    sampleCount: timestamps.length,
    details: {
      burn_rate_L_per_hour: Math.round(-slope * 100) / 100,
      current_fuel_L: Math.round(currentFuel * 10) / 10,
      time_span_hours: Math.round(timeSpanHours * 100) / 100,
      residual_std: Math.round(residualStd * 1e3) / 1e3
    }
  };
}
function sinusoidalModel(t, amplitude, phase, offset) {
  return amplitude * Math.sin(2 * Math.PI * t / 86400 + phase) + offset;
}
function fitSinusoidal(times, temps) {
  const meanT = mean(temps);
  let bestAmp = 10, bestPhase = 0, bestOffset = meanT;
  let bestErr = Infinity;
  for (let amp = 2; amp <= 20; amp += 2) {
    for (let phase = 0; phase < 2 * Math.PI; phase += Math.PI / 6) {
      for (let offset = meanT - 10; offset <= meanT + 10; offset += 2) {
        let err = 0;
        for (let i = 0; i < times.length; i++) {
          const pred = sinusoidalModel(times[i], amp, phase, offset);
          err += (temps[i] - pred) ** 2;
        }
        if (err < bestErr) {
          bestErr = err;
          bestAmp = amp;
          bestPhase = phase;
          bestOffset = offset;
        }
      }
    }
  }
  return { amp: bestAmp, phase: bestPhase, offset: bestOffset };
}
function predictTemperature(timestamps, temps, forecastHours = 24) {
  const modelName = "Sinusoidal Fit (Temperature)";
  if (timestamps.length < 48) {
    return { predicted: null, confidenceLow: null, confidenceHigh: null, accuracyR2: null, accuracyMape: null, modelName, sampleCount: timestamps.length, details: {} };
  }
  const t0 = timestamps[0];
  const t = timestamps.map((ts) => ts - t0);
  try {
    const { amp, phase, offset } = fitSinusoidal(t, temps);
    const predictedVals = t.map((ti) => sinusoidalModel(ti, amp, phase, offset));
    const r2 = rSquared(temps, predictedVals);
    const mapeVal = mape(temps, predictedVals.map((v, i) => Math.max(0.1, Math.abs(temps[i])) > 0.1 ? temps[i] : v));
    const lastT = t[t.length - 1];
    const forecastTimes = [];
    for (let h = 0; h <= forecastHours; h++) forecastTimes.push(lastT + h * 3600);
    const forecast = forecastTimes.map((ft) => sinusoidalModel(ft, amp, phase, offset));
    const ciHalf = amp * 0.15;
    return {
      predicted: Math.round(forecast[forecast.length - 1] * 10) / 10,
      confidenceLow: Math.round((forecast[forecast.length - 1] - ciHalf) * 10) / 10,
      confidenceHigh: Math.round((forecast[forecast.length - 1] + ciHalf) * 10) / 10,
      accuracyR2: Math.round(Math.max(0, r2) * 1e4) / 1e4,
      accuracyMape: Math.round(mapeVal * 100) / 100,
      modelName,
      sampleCount: timestamps.length,
      details: {
        amplitude_C: Math.round(Math.abs(amp) * 10) / 10,
        period_hours: 24,
        offset_C: Math.round(offset * 10) / 10,
        forecast_24h: forecast.filter((_, i) => i % 6 === 0).map((v) => Math.round(v * 10) / 10)
      }
    };
  } catch {
    return { predicted: null, confidenceLow: null, confidenceHigh: null, accuracyR2: null, accuracyMape: null, modelName, sampleCount: timestamps.length, details: { error: "Fit failed" } };
  }
}
function predictRpmHealth(timestamps, rpmValues, vibrationValues) {
  const modelName = "EMA Health Score (RPM)";
  if (timestamps.length < 10) {
    return { predicted: null, confidenceLow: null, confidenceHigh: null, accuracyR2: null, accuracyMape: null, modelName, sampleCount: timestamps.length, details: {} };
  }
  const alpha = 0.3;
  const ema = [rpmValues[0]];
  for (let i = 1; i < rpmValues.length; i++) {
    ema.push(alpha * rpmValues[i] + (1 - alpha) * ema[i - 1]);
  }
  const quarter = Math.max(Math.floor(ema.length / 4), 1);
  const baselineRpm = median(ema.slice(0, quarter));
  const currentDeviation = Math.abs(ema[ema.length - 1] - baselineRpm);
  const stdDev = std(rpmValues);
  const zScore = currentDeviation / Math.max(stdDev, 1e-9);
  const lastN = Math.max(Math.floor(rpmValues.length / 5), 3);
  const trendX = Array.from({ length: lastN }, (_, i) => i);
  const trendY = rpmValues.slice(-lastN);
  const [trendSlope] = polyfit(trendX, trendY, 1);
  const health = clamp(100 - zScore * 15 - Math.abs(trendSlope) * 5, 0, 100);
  const anomalyProb = clamp(zScore / 4, 0, 1);
  let vibAnomaly = null;
  if (vibrationValues && vibrationValues.length === timestamps.length) {
    const vibMean = mean(vibrationValues);
    const vibMaxRecent = Math.max(...vibrationValues.slice(-lastN));
    vibAnomaly = clamp((vibMaxRecent - vibMean) / Math.max(vibMean, 0.1), 0, 1);
  }
  return {
    predicted: Math.round(health * 10) / 10,
    confidenceLow: Math.round(Math.max(0, health - 10) * 10) / 10,
    confidenceHigh: Math.round(Math.min(100, health + 10) * 10) / 10,
    accuracyR2: null,
    accuracyMape: null,
    modelName,
    sampleCount: timestamps.length,
    details: {
      baseline_rpm: Math.round(baselineRpm * 10) / 10,
      current_rpm: Math.round(ema[ema.length - 1] * 10) / 10,
      deviation: Math.round(currentDeviation * 10) / 10,
      z_score: Math.round(zScore * 100) / 100,
      trend_slope: Math.round(trendSlope * 1e3) / 1e3,
      anomaly_probability: Math.round(anomalyProb * 1e3) / 1e3,
      vibration_anomaly: vibAnomaly !== null ? Math.round(vibAnomaly * 1e3) / 1e3 : null
    }
  };
}
function median(arr) {
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}
function detectAnomalies(timestamps, values, metricName = "") {
  const modelName = "Z-Score Ensemble (Anomaly)";
  if (values.length < 10) {
    return { anomalies: [], metric: metricName, mean: 0, std: 0, shortTermMean: 0, modelName, sampleCount: values.length, anomalyCount: 0 };
  }
  const shortN = Math.min(200, values.length);
  const shortMean = mean(values.slice(-shortN));
  const shortStd = Math.max(std(values.slice(-shortN)), 1e-9);
  const longMean = mean(values);
  const longStd = Math.max(std(values), 1e-9);
  const anomalies = [];
  for (let i = 0; i < values.length; i++) {
    const zShort = Math.abs(values[i] - shortMean) / shortStd;
    const zLong = Math.abs(values[i] - longMean) / longStd;
    if (zShort > 3 || zLong > 3.5) {
      anomalies.push({
        index: i,
        value: Math.round(values[i] * 100) / 100,
        zShort: Math.round(zShort * 100) / 100,
        zLong: Math.round(zLong * 100) / 100,
        timestamp: timestamps[i] || null
      });
    }
  }
  return {
    anomalies: anomalies.slice(-10),
    metric: metricName,
    mean: Math.round(longMean * 100) / 100,
    std: Math.round(longStd * 100) / 100,
    shortTermMean: Math.round(shortMean * 100) / 100,
    modelName,
    sampleCount: values.length,
    anomalyCount: anomalies.length
  };
}

// lib/ensemble.ts
var CUSUM_THRESHOLD = 4;
var CUSUM_DRIFT = 0.5;
var ENSEMBLE_WEIGHTS = { cusum: 0.25, zscore: 0.75 };
var ALERT_SCORE_THRESHOLD = 0.7;
var CUSUMTracker = class {
  posAcc = 0;
  negAcc = 0;
  mu = 0;
  sigma = 1;
  updateBaseline(values) {
    this.mu = mean(values);
    this.sigma = Math.max(std(values), 1e-9);
  }
  score(value) {
    const z = (value - this.mu) / this.sigma;
    this.posAcc = Math.max(0, this.posAcc + z - CUSUM_DRIFT);
    this.negAcc = Math.max(0, this.negAcc - z - CUSUM_DRIFT);
    const stat = Math.max(this.posAcc, this.negAcc);
    const alert = stat >= CUSUM_THRESHOLD;
    if (alert) {
      this.posAcc = 0;
      this.negAcc = 0;
    }
    return { stat, alert };
  }
};
var trackerCache = /* @__PURE__ */ new Map();
function getTrackers(stationId) {
  if (!trackerCache.has(stationId)) {
    trackerCache.set(stationId, FEATURES.map(() => new CUSUMTracker()));
  }
  return trackerCache.get(stationId);
}
function initEnsembleBaseline(stationId, data) {
  const trackers = getTrackers(stationId);
  for (let i = 0; i < FEATURES.length; i++) {
    const col = data.map((row) => row[i]);
    trackers[i].updateBaseline(col);
  }
}
function scoreEnsemble(stationId, sample) {
  const trackers = getTrackers(stationId);
  const zScores = sample.map((v, i) => {
    const t = trackers[i];
    return Math.abs((v - t.mu) / t.sigma);
  });
  const maxZ = Math.max(...zScores);
  const zScore = clamp2(sigmoid(maxZ - 3) * 2, 0, 1);
  const zVote = zScore >= 0.5 ? 1 : 0;
  let cusumMax = 0;
  let alertsFired = 0;
  const cusumDetails = {};
  for (let i = 0; i < FEATURES.length; i++) {
    const { stat, alert: alert2 } = trackers[i].score(sample[i]);
    cusumDetails[FEATURES[i]] = { stat: Math.round(stat * 1e3) / 1e3, alert: alert2 };
    if (stat > cusumMax) cusumMax = stat;
    if (alert2) alertsFired++;
  }
  const cusumScore = clamp2(cusumMax / CUSUM_THRESHOLD, 0, 1);
  const cusumVote = alertsFired > 0 ? 1 : 0;
  const composite = clamp2(
    ENSEMBLE_WEIGHTS.cusum * cusumScore + ENSEMBLE_WEIGHTS.zscore * zScore,
    0,
    1
  );
  const totalVotes = cusumVote + zVote;
  const alert = composite >= ALERT_SCORE_THRESHOLD || totalVotes >= 2;
  return {
    anomalyScore: Math.round(composite * 1e4) / 1e4,
    alert,
    modelBreakdown: {
      cusum: { score: Math.round(cusumScore * 1e4) / 1e4, vote: cusumVote === 1, weight: ENSEMBLE_WEIGHTS.cusum },
      zscore: { score: Math.round(zScore * 1e4) / 1e4, vote: zVote === 1, weight: ENSEMBLE_WEIGHTS.zscore }
    },
    totalVotes,
    cusumDetails
  };
}
function clamp2(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

// lib/ncpor.ts
var STATION_PAGES = {
  maitri: "https://data.ncpor.res.in/maitri/live",
  bharati: "https://data.ncpor.res.in/bharati/live"
};
var DATAPOINTS_RE = /dataPoints\s*:\s*\[(.+?)\]/gs;
var cache = {};
var CACHE_TTL_MS = 15 * 60 * 1e3;
function parseDataPointsArray(raw) {
  const points = [];
  const ptRe = /\{\s*x\s*:\s*(\d+)\s*,\s*y\s*:\s*([\-0-9.]+)\s*\}/g;
  let m = ptRe.exec(raw);
  while (m) {
    points.push({ x: parseInt(m[1]), y: parseFloat(m[2]) });
    m = ptRe.exec(raw);
  }
  return points;
}
function parseStationPage(html) {
  const matches = [...html.matchAll(DATAPOINTS_RE)];
  if (matches.length < 4) return null;
  const tempPoints = parseDataPointsArray(matches[0][1]);
  const windPoints = parseDataPointsArray(matches[1][1]);
  const pressurePoints = parseDataPointsArray(matches[2][1]);
  const humidityPoints = parseDataPointsArray(matches[3][1]);
  const len = tempPoints.length;
  if (len < 3) return null;
  const timestamps = [];
  const temp = [];
  const wind = [];
  const pressure = [];
  const humidity = [];
  for (let i = 0; i < len; i++) {
    timestamps.push(tempPoints[i].x);
    temp.push(tempPoints[i].y);
    const wPt = windPoints.find((p) => p.x === tempPoints[i].x);
    const pPt = pressurePoints.find((p) => p.x === tempPoints[i].x);
    const hPt = humidityPoints.find((p) => p.x === tempPoints[i].x);
    wind.push(wPt?.y ?? (i > 0 ? wind[i - 1] : 0));
    pressure.push(pPt?.y ?? (i > 0 ? pressure[i - 1] : 1013));
    humidity.push(hPt?.y ?? (i > 0 ? humidity[i - 1] : 50));
  }
  return { timestamps, temp, wind, pressure, humidity };
}
async function fetchStationPage(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5e3);
    const resp = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; AntarisOps/1.0)" }
    });
    clearTimeout(timeout);
    if (!resp.ok) return null;
    return await resp.text();
  } catch {
    return null;
  }
}
async function getNcporStationData(stationId) {
  const url = STATION_PAGES[stationId];
  if (!url) return null;
  const cached = cache[stationId];
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached;
  }
  const html = await fetchStationPage(url);
  if (!html) {
    return null;
  }
  const history = parseStationPage(html);
  if (!history) return null;
  const lastIdx = history.temp.length - 1;
  const current = {
    temp_C: history.temp[lastIdx],
    wind_ms: history.wind[lastIdx],
    pressure_mbar: history.pressure[lastIdx],
    humidity_pct: history.humidity[lastIdx],
    timestamp_ms: history.timestamps[lastIdx]
  };
  const result = { current, history, timestamp: Date.now() };
  cache[stationId] = result;
  return result;
}
var TEMP_LINE_RE = /Antarctica\s*-\s*(Maitri|Bharati)\s*:\s*([\-0-9.]+)\s*°\s*C/i;
var STATION_NAME_MAP = { Maitri: "maitri", Bharati: "bharati" };
async function getNcporTemp(stationId) {
  const stationData = await getNcporStationData(stationId);
  if (stationData?.current.temp_C !== null && stationData?.current.temp_C !== void 0) {
    return stationData.current.temp_C;
  }
  if (stationId !== "maitri" && stationId !== "bharati") return null;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5e3);
    const resp = await fetch("https://data.ncpor.res.in", {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; AntarisOps/1.0)" }
    });
    clearTimeout(timeout);
    if (!resp.ok) return null;
    const html = await resp.text();
    const match = TEMP_LINE_RE.exec(html);
    if (match) {
      const id = STATION_NAME_MAP[match[1]];
      if (id === stationId) return parseFloat(match[2]);
    }
    return null;
  } catch {
    return null;
  }
}

// lib/openmeteo.ts
var STATIONS = {
  maitri: { lat: -70.7668, lon: 11.7308, name: "Maitri" },
  bharati: { lat: -69.4068, lon: 76.1953, name: "Bharati" },
  maitri_ii: { lat: -70.76, lon: 11.73, name: "Maitri II" }
};
var WMO_CODES = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  56: "Light freezing drizzle",
  57: "Dense freezing drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  66: "Light freezing rain",
  67: "Heavy freezing rain",
  71: "Slight snowfall",
  73: "Moderate snowfall",
  75: "Heavy snowfall",
  77: "Snow grains",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  85: "Slight snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with slight hail",
  99: "Thunderstorm with heavy hail"
};
function weatherLabel(code) {
  return WMO_CODES[code] ?? "Unknown";
}
var cache2 = {};
var CACHE_TTL_MS2 = 10 * 60 * 1e3;
async function getOpenMeteoWeather(stationId) {
  const station = STATIONS[stationId];
  if (!station) return null;
  const cached = cache2[stationId];
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS2) {
    return { ...cached.data, cached: true };
  }
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${station.lat}&longitude=${station.lon}&current=temperature_2m,wind_speed_10m,relative_humidity_2m,weather_code,shortwave_radiation&daily=temperature_2m_max,temperature_2m_min,wind_speed_10m_max,weather_code&timezone=auto&forecast_days=7`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4e3);
    const resp = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    const data = await resp.json();
    const result = {
      station_id: stationId,
      station_name: station.name,
      source: "open-meteo",
      current: {
        ...data.current,
        weather_label: weatherLabel(data.current?.weather_code ?? 0)
      },
      daily: data.daily || {},
      temperature_unit: "\xB0C",
      wind_unit: "km/h"
    };
    cache2[stationId] = { data: result, timestamp: Date.now() };
    return result;
  } catch {
    return null;
  }
}
async function getOpenMeteoTemp(stationId) {
  const weather = await getOpenMeteoWeather(stationId);
  return weather?.current?.temperature_2m ?? null;
}

// lib/livetemp.ts
async function getLiveOutdoorTemp(stationId) {
  const ncporTemp = await getNcporTemp(stationId);
  if (ncporTemp !== null) {
    return { temp: ncporTemp, source: "ncpor" };
  }
  const omTemp = await getOpenMeteoTemp(stationId);
  if (omTemp !== null) {
    return { temp: omTemp, source: "open-meteo" };
  }
  return { temp: null, source: "climatology" };
}

// lib/aurora.ts
var OVATION_URL = "https://services.swpc.noaa.gov/json/ovation_aurora_latest.json";
var KP_URL = "https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json";
var OVATION_CACHE_MS = 30 * 60 * 1e3;
var KP_CACHE_MS = 10 * 60 * 1e3;
var auroraCache = null;
var kpCache = null;
var STATION_COORDS = {
  maitri: { lat: -70.7668, lon: 11.7308 },
  bharati: { lat: -69.4068, lon: 76.1953 },
  maitri_ii: { lat: -70.76, lon: 11.73 }
};
function findNearestAurora(coordinates, targetLat, targetLon) {
  let minDist = Infinity;
  let bestVal = 0;
  for (let i = 0; i < coordinates.length; i++) {
    const [lon, lat, aurora] = coordinates[i];
    if (lat > -10) continue;
    const dlat = lat - targetLat;
    const dlon = lon - targetLon;
    const dist = dlat * dlat + dlon * dlon;
    if (dist < minDist) {
      minDist = dist;
      bestVal = aurora;
    }
  }
  return bestVal;
}
async function getAuroraData() {
  if (auroraCache && Date.now() - auroraCache.timestamp < OVATION_CACHE_MS) {
    return auroraCache;
  }
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1e4);
    const resp = await fetch(OVATION_URL, { signal: controller.signal });
    clearTimeout(timeout);
    if (!resp.ok) return auroraCache;
    const json = await resp.json();
    const coordinates = json["coordinates"] || [];
    const obsTime = json["Observation Time"] || "";
    const fcstTime = json["Forecast Time"] || "";
    const data = {};
    for (const [id, coords] of Object.entries(STATION_COORDS)) {
      data[id] = Math.round(findNearestAurora(coordinates, coords.lat, coords.lon) * 10) / 10;
    }
    auroraCache = { data, observation_time: obsTime, forecast_time: fcstTime, timestamp: Date.now() };
    return auroraCache;
  } catch {
    return auroraCache;
  }
}
function kpLabel(kp) {
  if (kp < 4) return "Quiet";
  if (kp < 5) return "Active";
  if (kp < 6) return "Minor storm (G1)";
  if (kp < 7) return "Moderate storm (G2)";
  if (kp < 8) return "Strong storm (G3)";
  if (kp < 9) return "Severe storm (G4)";
  return "Extreme storm (G5)";
}
async function getKpIndex() {
  if (kpCache && Date.now() - kpCache.timestamp < KP_CACHE_MS) {
    return kpCache;
  }
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5e3);
    const resp = await fetch(KP_URL, { signal: controller.signal });
    clearTimeout(timeout);
    if (!resp.ok) return kpCache;
    const json = await resp.json();
    const latest = json[json.length - 1];
    const kp = parseFloat(latest?.kp_index ?? "0");
    kpCache = {
      kp_current: kp,
      kp_label: kpLabel(kp),
      timestamp: Date.now()
    };
    return kpCache;
  } catch {
    return kpCache;
  }
}

// lib/seaicedata.ts
var NSIDC_URL = "https://noaadata.apps.nsidc.org/NOAA/G02135/south/daily/data/S_seaice_extent_daily_v4.0.csv";
var CACHE_TTL_MS3 = 60 * 60 * 1e3;
var cache3 = null;
var CLIMATOLOGY_MONTHLY = {
  1: 3.9,
  2: 2.8,
  3: 4.1,
  4: 6.2,
  5: 9.3,
  6: 12.2,
  7: 14.7,
  8: 16.4,
  9: 17.6,
  10: 17,
  11: 12.6,
  12: 6.2
};
function parseCsvTail(csvText) {
  const lines = csvText.trim().split(/\r?\n/);
  const headerIdx = lines.findIndex((l) => l.includes("Year"));
  if (headerIdx < 0) return null;
  const header = lines[headerIdx];
  const cols = header.split(",").map((c) => c.trim().toLowerCase());
  const yearCol = cols.indexOf("year");
  const monthCol = cols.indexOf("month");
  const dayCol = cols.indexOf("day");
  const extentCol = cols.findIndex((c) => c.includes("extent"));
  if (yearCol < 0 || monthCol < 0 || dayCol < 0 || extentCol < 0) return null;
  for (let i = lines.length - 1; i > headerIdx; i--) {
    const line = lines[i].trim();
    if (!line || line.startsWith("#") || line.startsWith("Year")) continue;
    const parts = line.split(",").map((p) => p.trim());
    if (parts.length <= extentCol) continue;
    const year = parseInt(parts[yearCol]);
    const month = parseInt(parts[monthCol]);
    const day = parseInt(parts[dayCol]);
    const extent = parseFloat(parts[extentCol]);
    if (isNaN(year) || isNaN(extent)) continue;
    const climo = CLIMATOLOGY_MONTHLY[month] ?? null;
    const anomaly = climo ? Math.round((extent - climo) / climo * 1e3) / 10 : null;
    return {
      extent_km2: Math.round(extent * 1e3) / 1e3,
      year,
      month,
      day,
      date_str: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      anomaly_pct: anomaly,
      timestamp: Date.now()
    };
  }
  return null;
}
async function getSeaIceExtent() {
  if (cache3 && Date.now() - cache3.timestamp < CACHE_TTL_MS3) {
    return cache3;
  }
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15e3);
    const resp = await fetch(NSIDC_URL, { signal: controller.signal });
    clearTimeout(timeout);
    if (!resp.ok) {
      return cache3;
    }
    const csv = await resp.text();
    const result = parseCsvTail(csv);
    if (result) {
      cache3 = result;
    }
    return result;
  } catch {
    return cache3;
  }
}
function extentToConcentration(extentKm2) {
  return Math.max(0, Math.min(1, extentKm2 / 18));
}

// server/handler.ts
function seededRand2(seed) {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}
function solarKw(lat, hour, dayOfYear, max) {
  const declination = -23.44 * Math.cos(360 / 365 * (dayOfYear + 10) * Math.PI / 180);
  const threshold = 90 - Math.abs(lat);
  if (declination < threshold - 5) return 0;
  const hourFactor = Math.max(0, Math.cos(Math.PI * (hour - 12) / 12));
  const seasonFactor = Math.max(0, Math.min(1, (declination - (threshold - 10)) / 10));
  return max * hourFactor * seasonFactor;
}
function windKw2(speed, params) {
  const ratedSpeed = 43;
  if (speed < params.wind_cut_in || speed > params.wind_cut_out) return 0;
  const frac = Math.min(1, (speed - params.wind_cut_in) / (ratedSpeed - params.wind_cut_in));
  return params.wind_max_kw * frac ** 3;
}
function loadKw(hour, dayOfYear, latitude) {
  const declination = -23.44 * Math.cos(360 / 365 * (dayOfYear + 10) * Math.PI / 180);
  const threshold = 90 - Math.abs(latitude);
  const isPolarNight = declination < threshold - 5;
  const baseLoad = 30;
  const heatingLoad = isPolarNight ? 10 : 3;
  const researchLoad = hour >= 8 && hour <= 18 ? 5 : 1;
  const hourWiggle = 1.5 * Math.sin(2 * Math.PI * (hour - 6) / 12);
  return baseLoad + heatingLoad + researchLoad + hourWiggle;
}
function windPenalty(windSpeed) {
  if (windSpeed < 15) return 1;
  if (windSpeed < 40) return 1 + (windSpeed - 15) * 0.01;
  if (windSpeed < 70) return 1.25 + (windSpeed - 40) * 0.02;
  return Math.min(2.5, 1.85 + (windSpeed - 70) * 0.03);
}
function dijkstra(start, end, iceMult, windSpeed) {
  const adj = {};
  for (const [a, b, baseDist] of ROUTE_EDGES) {
    const isCoastal = (a === "maitri" || a === "bharati") && (b === "maitri" || b === "bharati");
    const coastalMult = 1 + (isCoastal ? iceMult * 0.4 : 0);
    const windPen = windPenalty(windSpeed);
    const weight = baseDist * coastalMult * windPen;
    if (!adj[a]) adj[a] = [];
    if (!adj[b]) adj[b] = [];
    adj[a].push([b, weight, baseDist, coastalMult]);
    adj[b].push([a, weight, baseDist, coastalMult]);
  }
  const dist = { [start]: 0 };
  const prev = {};
  const visited = /* @__PURE__ */ new Set();
  const pq = [[0, start]];
  while (pq.length > 0) {
    pq.sort((a, b) => a[0] - b[0]);
    const [d, u] = pq.shift();
    if (visited.has(u)) continue;
    visited.add(u);
    for (const [v, w, base, cm] of adj[u] || []) {
      const nd = d + w;
      if (!(v in dist) || nd < dist[v]) {
        dist[v] = nd;
        prev[v] = [u, w, base, cm];
        pq.push([nd, v]);
      }
    }
  }
  const path = [];
  let node = end;
  while (node in prev) {
    const [via, w, base, cm] = prev[node];
    path.unshift({ from: via, to: node, adjusted_km: Math.round(w), base_km: base, ice_factor: Math.round(cm * 100) / 100 });
    node = via;
  }
  const totalKm = Math.round(dist[end] || Infinity);
  const etaHours = totalKm / (14 * 1.852);
  return { start, end, path, total_adjusted_km: totalKm, eta_days: Math.round(etaHours / 24 * 10) / 10, ice_concentration: Math.round(iceMult * 100) / 100, wind_speed_kmh: Math.round(windSpeed * 10) / 10, waypoints: {} };
}
var baselineInitialized = /* @__PURE__ */ new Set();
async function handler(req, res) {
  store.init();
  const slug = req.query.slug || [];
  const path = "/" + slug.join("/");
  try {
    if (path === "/health" && req.method === "GET") {
      return res.json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
    }
    if (path === "/stations" && req.method === "GET") {
      return res.json(STATIONS_DB);
    }
    if (slug[0] === "stations" && slug[1] && req.method === "GET") {
      const station = STATIONS_DB.find((s) => s.id === slug[1]);
      if (!station) return res.status(404).json({ error: "Station not found" });
      return res.json(station);
    }
    if (path === "/telemetry/latest" && req.method === "GET") {
      const stationId = req.query.station || "maitri";
      const key = `${stationId}:outdoor_temp`;
      if (!store.telemetry.has(key) || store.telemetry.get(key).length < 100) {
        generateHistoryBuffer(stationId, 48);
      }
      const { temp: liveTemp, source } = await getLiveOutdoorTemp(stationId);
      const outdoorOverride = liveTemp ?? void 0;
      const values = generateTelemetry(stationId, { outdoorOverride });
      const ncporData = await getNcporStationData(stationId);
      let live_wind_ms = null;
      let live_pressure_mbar = null;
      let live_humidity_pct = null;
      let live_ncpor_timestamp = null;
      if (ncporData?.current) {
        live_wind_ms = ncporData.current.wind_ms;
        live_pressure_mbar = ncporData.current.pressure_mbar;
        live_humidity_pct = ncporData.current.humidity_pct;
        live_ncpor_timestamp = ncporData.current.timestamp_ms ? new Date(ncporData.current.timestamp_ms).toISOString() : null;
      }
      if (live_wind_ms !== null) values.wind_speed_kmh = Math.round(live_wind_ms * 3.6 * 10) / 10;
      const weather = await getOpenMeteoWeather(stationId);
      const shortwaveRadiation = weather?.current?.shortwave_radiation ?? 0;
      values.solar_output_kw = Math.round(shortwaveRadiation * 25 * 0.2 / 1e3 * 1e3) / 1e3;
      for (const [metric, value] of Object.entries(values)) {
        store.pushTelemetry(stationId, metric, value, UNITS[metric] || "");
      }
      return res.json({ station_id: stationId, timestamp: (/* @__PURE__ */ new Date()).toISOString(), values, temperature_source: source, live_wind_ms, live_pressure_mbar, live_humidity_pct, live_solar_radiation_wm2: shortwaveRadiation, live_ncpor_timestamp });
    }
    if (path === "/telemetry/history" && req.method === "GET") {
      const stationId = req.query.station || "maitri";
      const metric = req.query.metric || "outdoor_temp";
      const hours = parseInt(req.query.hours) || 48;
      const key = `${stationId}:${metric}`;
      if (!store.telemetry.has(key) || store.telemetry.get(key).length < 100) {
        generateHistoryBuffer(stationId, hours, metric);
      }
      const rows = store.getTelemetryHistory(stationId, metric, 5e3);
      return res.json(rows);
    }
    if (path === "/predict/fuel" && req.method === "GET") {
      const stationId = req.query.station_id || "maitri";
      const k = `${stationId}:fuel_level_liters`;
      if (!store.telemetry.has(k) || store.telemetry.get(k).length < 100) generateHistoryBuffer(stationId, 168, "fuel_level_liters");
      const values = generateTelemetry(stationId);
      for (const [metric, value] of Object.entries(values)) store.pushTelemetry(stationId, metric, value, UNITS[metric] || "");
      const [timestamps, fuelLevels] = store.getTelemetryPairs(stationId, "fuel_level_liters", 5e3);
      const result = predictFuel(timestamps, fuelLevels);
      return res.json({ station_id: stationId, days_to_depletion: result.predicted, confidence: { low: result.confidenceLow, high: result.confidenceHigh }, accuracy: { r2: result.accuracyR2, mape: result.accuracyMape }, model: result.modelName, samples: result.sampleCount, details: result.details });
    }
    if (path === "/predict/temperature" && req.method === "GET") {
      const stationId = req.query.station_id || "maitri";
      const { temp: liveTemp, source } = await getLiveOutdoorTemp(stationId);
      const anchor = liveTemp ?? monthlyOutdoor(stationId);
      const key = `${stationId}:outdoor_temp`;
      if (!store.telemetry.has(key) || store.telemetry.get(key).length < 100) generateHistoryBuffer(stationId, 72, "outdoor_temp");
      const values = generateTelemetry(stationId, { outdoorOverride: anchor });
      for (const [metric, value] of Object.entries(values)) store.pushTelemetry(stationId, metric, value, UNITS[metric] || "");
      const [timestamps, temps] = store.getTelemetryPairs(stationId, "outdoor_temp", 5e3);
      const result = predictTemperature(timestamps, temps, 24);
      return res.json({ station_id: stationId, forecast_24h: result.predicted, confidence: { low: result.confidenceLow, high: result.confidenceHigh }, accuracy: { r2: result.accuracyR2, mape: result.accuracyMape }, model: result.modelName, samples: result.sampleCount, details: result.details, current_temp: anchor, temperature_source: source });
    }
    if (path === "/predict/rpm-health" && req.method === "GET") {
      const stationId = req.query.station_id || "maitri";
      for (const m of ["generator_rpm", "vibration_level"]) {
        const k = `${stationId}:${m}`;
        if (!store.telemetry.has(k) || store.telemetry.get(k).length < 100) generateHistoryBuffer(stationId, 48, m);
      }
      const values = generateTelemetry(stationId);
      for (const [metric, value] of Object.entries(values)) store.pushTelemetry(stationId, metric, value, UNITS[metric] || "");
      const [tsRpm, valsRpm] = store.getTelemetryPairs(stationId, "generator_rpm", 5e3);
      const [, valsVib] = store.getTelemetryPairs(stationId, "vibration_level", 5e3);
      const result = predictRpmHealth(tsRpm, valsRpm, valsVib.length === tsRpm.length ? valsVib : void 0);
      return res.json({ station_id: stationId, health_score: result.predicted, confidence: { low: result.confidenceLow, high: result.confidenceHigh }, model: result.modelName, samples: result.sampleCount, details: result.details });
    }
    if (path === "/predict/anomalies" && req.method === "GET") {
      const stationId = req.query.station_id || "maitri";
      const metric = req.query.metric || "generator_rpm";
      const k = `${stationId}:${metric}`;
      if (!store.telemetry.has(k) || store.telemetry.get(k).length < 100) generateHistoryBuffer(stationId, 48, metric);
      const values = generateTelemetry(stationId);
      for (const [m, value] of Object.entries(values)) store.pushTelemetry(stationId, m, value, UNITS[m] || "");
      const [timestamps, vals] = store.getTelemetryPairs(stationId, metric, 5e3);
      const result = detectAnomalies(timestamps, vals, metric);
      return res.json({ station_id: stationId, anomalies: result.anomalies, mean: result.mean, std: result.std, model: result.modelName, samples: result.sampleCount, anomaly_count: result.anomalyCount });
    }
    if (path === "/predict/model-accuracy" && req.method === "GET") {
      const STATIONS2 = ["maitri", "bharati"];
      const results = [];
      for (const stationId of STATIONS2) {
        for (const m of ["fuel_level_liters", "outdoor_temp", "generator_rpm", "vibration_level"]) {
          const k = `${stationId}:${m}`;
          if (!store.telemetry.has(k) || store.telemetry.get(k).length < 100) generateHistoryBuffer(stationId, 168, m);
        }
        const { temp: liveTemp, source } = await getLiveOutdoorTemp(stationId);
        const anchor = liveTemp ?? monthlyOutdoor(stationId);
        const values = generateTelemetry(stationId, { outdoorOverride: anchor });
        for (const [metric, value] of Object.entries(values)) store.pushTelemetry(stationId, metric, value, UNITS[metric] || "");
        const [tsFuel, valsFuel] = store.getTelemetryPairs(stationId, "fuel_level_liters", 5e3);
        const fuelR = predictFuel(tsFuel, valsFuel);
        const [tsTemp, valsTemp] = store.getTelemetryPairs(stationId, "outdoor_temp", 5e3);
        const tempR = predictTemperature(tsTemp, valsTemp, 24);
        const [tsRpm, valsRpm] = store.getTelemetryPairs(stationId, "generator_rpm", 5e3);
        const [, valsVib] = store.getTelemetryPairs(stationId, "vibration_level", 5e3);
        const rpmR = predictRpmHealth(tsRpm, valsRpm, valsVib.length === tsRpm.length ? valsVib : void 0);
        results.push({ station_id: stationId, fuel: { model: fuelR.modelName, r2: fuelR.accuracyR2, mape: fuelR.accuracyMape, samples: fuelR.sampleCount }, temperature: { model: tempR.modelName, r2: tempR.accuracyR2, mape: tempR.accuracyMape, samples: tempR.sampleCount }, rpm_health: { model: rpmR.modelName, health_score: rpmR.predicted, samples: rpmR.sampleCount }, temperature_source: source });
      }
      return res.json(results);
    }
    if (path === "/predict/ensemble" && req.method === "GET") {
      const stationId = req.query.station_id || "maitri";
      const values = generateTelemetry(stationId);
      for (const [metric, value] of Object.entries(values)) store.pushTelemetry(stationId, metric, value, UNITS[metric] || "");
      if (!baselineInitialized.has(stationId)) {
        const baselineData = [];
        const baseTemp = monthlyOutdoor(stationId);
        for (let i = 0; i < 200; i++) {
          baselineData.push([1490 + (Math.random() - 0.5) * 20, 2.5 + Math.random() * 0.5, baseTemp + (Math.random() - 0.5) * 10, 20.5 + (Math.random() - 0.5) * 2, 12800 - i * 0.1, 1.01 + (Math.random() - 0.5) * 0.04, 68 + (Math.random() - 0.5) * 5, 22 + (Math.random() - 0.5) * 15]);
        }
        initEnsembleBaseline(stationId, baselineData);
        baselineInitialized.add(stationId);
      }
      const sample = FEATURES.map((f) => values[f] ?? 0);
      const result = scoreEnsemble(stationId, sample);
      const alertLevel = result.anomalyScore >= 0.7 ? "critical" : result.anomalyScore >= 0.4 ? "warning" : "normal";
      return res.json({ station_id: stationId, anomaly_score: result.anomalyScore, alert_level: alertLevel, model_breakdown: result.modelBreakdown, cusum_details: result.cusumDetails, total_votes: result.totalVotes, features: FEATURES });
    }
    if (path === "/alerts" && req.method === "GET") {
      const { station_id, status } = req.query;
      let alerts = [...store.alerts];
      if (station_id) alerts = alerts.filter((a) => a.stationId === station_id);
      if (status) alerts = alerts.filter((a) => a.status === status);
      return res.json(alerts);
    }
    if (path === "/alerts" && req.method === "PUT") {
      const id = req.query.id;
      const { action } = req.body || {};
      const alert = store.alerts.find((a) => a.id === id);
      if (!alert) return res.status(404).json({ error: "Not found" });
      if (action === "acknowledge") alert.status = "acknowledged";
      if (action === "resolve") {
        alert.status = "resolved";
        alert.resolvedAt = (/* @__PURE__ */ new Date()).toISOString();
      }
      return res.json(alert);
    }
    if (path === "/energy/optimize" && req.method === "GET") {
      const stationId = req.query.station_id || "maitri";
      const season = req.query.season || "current";
      const params = STATION_PARAMS[stationId];
      if (!params) return res.status(400).json({ error: `Unknown station: ${stationId}` });
      const key = `${stationId}:wind_speed_kmh`;
      if (!store.telemetry.has(key) || store.telemetry.get(key).length < 10) generateHistoryBuffer(stationId, 24, "wind_speed_kmh");
      const [, valsWind] = store.getTelemetryPairs(stationId, "wind_speed_kmh", 1e3);
      const avgWind = valsWind.length > 0 ? valsWind.reduce((a, b) => a + b, 0) / valsWind.length : 20;
      const now = /* @__PURE__ */ new Date();
      let dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 864e5);
      if (season === "summer") dayOfYear = 355;
      else if (season === "winter") dayOfYear = 172;
      const currentHour = now.getHours();
      const schedule = [];
      let dieselHours = 0, renewableHours = 0, totalFuelBaseline = 0, totalFuelOptimized = 0;
      for (let h = 0; h < 24; h++) {
        const hour = (currentHour + h) % 24;
        const load = loadKw(hour, dayOfYear, params.latitude);
        const solar = solarKw(params.latitude, hour, dayOfYear, params.solar_max_kw);
        const windBase = avgWind * (0.55 + 0.45 * Math.sin(2 * Math.PI * (hour - 4) / 24));
        const gust = 6 * Math.sin(2 * Math.PI * (hour - 2) / 12);
        const windSpeed = Math.max(5, Math.min(85, windBase + gust));
        const wind = windKw2(windSpeed, params);
        const renewableKw = solar + wind;
        const deficit = Math.max(0, load - renewableKw);
        const dieselKwNeeded = Math.min(deficit, params.diesel_kw);
        const dieselGal = dieselKwNeeded / params.fuel_efficiency_kwh_per_gal;
        const renewablePct = Math.min(100, renewableKw / Math.max(load, 1) * 100);
        schedule.push({ hour, load_kw: Math.round(load * 10) / 10, solar_kw: Math.round(solar * 100) / 100, wind_kw: Math.round(wind * 100) / 100, wind_speed_kmh: Math.round(windSpeed * 10) / 10, renewable_total_kw: Math.round(renewableKw * 100) / 100, deficit_kw: Math.round(deficit * 10) / 10, diesel_kw: Math.round(dieselKwNeeded * 10) / 10, diesel_gallons: Math.round(dieselGal * 100) / 100, renewable_share_pct: Math.round(renewablePct * 10) / 10, recommendation: renewableKw >= load ? "RENEWABLE" : dieselKwNeeded > 0 ? "DIESEL" : "STANDBY" });
        if (dieselKwNeeded > 0) dieselHours++;
        else renewableHours++;
        totalFuelBaseline += load / params.fuel_efficiency_kwh_per_gal;
        totalFuelOptimized += dieselGal;
      }
      const fuelSaved = totalFuelBaseline - totalFuelOptimized;
      return res.json({ station_id: stationId, schedule, summary: { diesel_hours: dieselHours, renewable_hours: renewableHours, fuel_baseline_gallons: Math.round(totalFuelBaseline * 10) / 10, fuel_optimized_gallons: Math.round(totalFuelOptimized * 10) / 10, fuel_saved_gallons: Math.round(fuelSaved * 10) / 10, co2_saved_kg: Math.round(fuelSaved * 2.68 * 10) / 10, money_saved_usd: Math.round(fuelSaved * params.fuel_cost_usd_per_gal * 100) / 100, renewable_share_pct: Math.round(renewableHours / 24 * 100 * 10) / 10 } });
    }
    if (path === "/energy/savings" && req.method === "GET") {
      const stationId = req.query.station_id || "maitri";
      const params = STATION_PARAMS[stationId];
      if (!params) return res.status(400).json({ error: `Unknown station: ${stationId}` });
      for (const m of ["solar_output_kw", "wind_output_kw", "fuel_level_liters"]) {
        const k = `${stationId}:${m}`;
        if (!store.telemetry.has(k) || store.telemetry.get(k).length < 10) generateHistoryBuffer(stationId, 168, m);
      }
      const values = generateTelemetry(stationId);
      for (const [metric, value] of Object.entries(values)) store.pushTelemetry(stationId, metric, value, UNITS[metric] || "");
      const [, valsSolar] = store.getTelemetryPairs(stationId, "solar_output_kw", 1e3);
      const [, valsWind] = store.getTelemetryPairs(stationId, "wind_output_kw", 1e3);
      const avgSolar = valsSolar.length > 0 ? valsSolar.reduce((a, b) => a + b, 0) / valsSolar.length : 0;
      const avgWind = valsWind.length > 0 ? valsWind.reduce((a, b) => a + b, 0) / valsWind.length : 0;
      const renewableOffsetPct = Math.min(30, (avgSolar + avgWind) / 40 * 100);
      const annualOptimized = params.annual_fuel_gallons * (1 - renewableOffsetPct / 100);
      const annualSaved = params.annual_fuel_gallons - annualOptimized;
      return res.json({ station_id: stationId, annual_baseline_gallons: Math.round(params.annual_fuel_gallons), annual_optimized_gallons: Math.round(annualOptimized), annual_saved_gallons: Math.round(annualSaved), annual_co2_saved_kg: Math.round(annualSaved * 2.68), annual_money_saved_usd: Math.round(annualSaved * params.fuel_cost_usd_per_gal), renewable_offset_pct: Math.round(renewableOffsetPct * 10) / 10, avg_solar_kw: Math.round(avgSolar * 100) / 100, avg_wind_kw: Math.round(avgWind * 100) / 100, note: "Savings from renewable offset only. Intelligent scheduling adds ~9.6%." });
    }
    if (path === "/logistics" && req.method === "GET") {
      const action = req.query.action || "inventory";
      if (action === "inventory") return res.json(store.inventory);
      if (action === "shipments") return res.json(store.shipments);
      if (action === "resupply") {
        const recommendations = store.inventory.filter((i) => i.quantity < i.reorderThreshold * 1.3).map((i) => ({ station_id: i.stationId, station_name: i.stationId.charAt(0).toUpperCase() + i.stationId.slice(1), item_name: i.itemName, category: i.category, quantity: i.quantity, unit: i.unit, reorder_threshold: i.reorderThreshold, suggest_order: Math.round((i.reorderThreshold * 2 - i.quantity) * 10) / 10, days_until_shortage: Math.round(i.quantity / Math.max(1, i.reorderThreshold / 14) * 10) / 10, urgency: i.quantity < i.reorderThreshold ? "critical" : i.quantity < i.reorderThreshold * 1.15 ? "warning" : "watch", window: "Nov-Mar (11-3)" }));
        return res.json(recommendations);
      }
      if (action === "sustainability") {
        const stations = ["maitri", "bharati"];
        for (const s of stations) generateHistoryBuffer(s, 24);
        const rows = stations.map((s) => {
          const [, valsSolar] = store.getTelemetryPairs(s, "solar_output_kw", 100);
          const [, valsWind] = store.getTelemetryPairs(s, "wind_output_kw", 100);
          const solar = valsSolar.length > 0 ? valsSolar[valsSolar.length - 1] : 0;
          const wind = valsWind.length > 0 ? valsWind[valsWind.length - 1] : 0;
          const renewableKw = solar + wind;
          const totalKw = renewableKw + 40;
          const share = renewableKw / Math.max(totalKw, 1e-9);
          const co2PerHour = 155 * 2.68 / 60;
          return { station_id: s, station_name: s.charAt(0).toUpperCase() + s.slice(1), renewable_kw: Math.round(renewableKw * 100) / 100, solar_kw: Math.round(solar * 100) / 100, wind_kw: Math.round(wind * 100) / 100, renewable_share_pct: Math.round(share * 100 * 10) / 10, co2_per_hour_kg: Math.round(co2PerHour * 100) / 100, co2_saved_per_day_kg: Math.round(co2PerHour * 24 * share * 10) / 10 };
        });
        return res.json(rows);
      }
    }
    if (path === "/logistics" && req.method === "POST") {
      const action = req.query.action || "inventory";
      if (action === "shipments") {
        const { station_id, item_name, quantity, unit, planned_date } = req.body || {};
        const shipment = { id: `SUP-${Date.now()}`, stationId: station_id, itemName: item_name, quantity: quantity || 0, unit: unit || "units", plannedDate: planned_date || "", status: "planned" };
        store.shipments.push(shipment);
        return res.json({ ok: true, id: shipment.id });
      }
    }
    if (path === "/routes" && req.method === "GET") {
      const legs = STATIONS_DB.map((s) => {
        const dist = haversineKm(HQ.lat, HQ.lon, s.latitude, s.longitude);
        return { from: HQ.name, to: s.stationName, from_lat: HQ.lat, from_lon: HQ.lon, to_lat: s.latitude, to_lon: s.longitude, distance_km: Math.round(dist), eta_days: Math.round(dist / (SHIP_SPEED_KNOTS * 1.852 * 24) * 10) / 10, speed_knots: SHIP_SPEED_KNOTS };
      });
      const inter = [];
      for (let i = 0; i < STATIONS_DB.length; i++) {
        for (let j = i + 1; j < STATIONS_DB.length; j++) {
          const a = STATIONS_DB[i], b = STATIONS_DB[j];
          const dist = haversineKm(a.latitude, a.longitude, b.latitude, b.longitude);
          inter.push({ from: a.stationName, to: b.stationName, from_lat: a.latitude, from_lon: a.longitude, to_lat: b.latitude, to_lon: b.longitude, distance_km: Math.round(dist), eta_days: Math.round(dist / (SHIP_SPEED_KNOTS * 1.852 * 24) * 10) / 10 });
        }
      }
      return res.json({ hq: HQ, ship_speed_knots: SHIP_SPEED_KNOTS, legs, inter_station: inter });
    }
    if (path === "/seaice" && req.method === "GET") {
      const action = req.query.action || "conditions";
      if (action === "conditions") {
        const stationId = req.query.station_id || "maitri";
        const now = /* @__PURE__ */ new Date();
        const seaIce = await getSeaIceExtent();
        const extentKm2 = seaIce?.extent_km2 ?? 17;
        const iceMult = seaIce ? extentToConcentration(extentKm2) : 0.5;
        const k = `${stationId}:wind_speed_kmh`;
        if (!store.telemetry.has(k) || store.telemetry.get(k).length < 10) generateHistoryBuffer(stationId, 24, "wind_speed_kmh");
        const [, valsWind] = store.getTelemetryPairs(stationId, "wind_speed_kmh", 1e3);
        const avgWind = valsWind.length > 0 ? valsWind.reduce((a, b) => a + b, 0) / valsWind.length : 20;
        let severity, desc;
        if (iceMult < 0.15) {
          severity = "minimal";
          desc = "Open water, no significant ice obstruction";
        } else if (iceMult < 0.35) {
          severity = "light";
          desc = "Scattered ice floes, navigable with caution";
        } else if (iceMult < 0.55) {
          severity = "moderate";
          desc = "Concentrated ice, icebreaker escort recommended";
        } else if (iceMult < 0.75) {
          severity = "heavy";
          desc = "Dense pack ice, significant navigation delays";
        } else {
          severity = "extreme";
          desc = "Near-maximum ice cover, navigation may be impossible";
        }
        return res.json({ station_id: stationId, ice_concentration: Math.round(iceMult * 1e3) / 1e3, ice_concentration_pct: Math.round(iceMult * 100 * 10) / 10, severity, description: desc, avg_wind_kmh: Math.round(avgWind * 10) / 10, day_of_year: now.getMonth() + 1, month: now.getMonth() + 1, real_extent_mkm2: extentKm2, real_extent_date: seaIce?.date_str ?? null, real_anomaly_pct: seaIce?.anomaly_pct ?? null, source: seaIce ? "nsidc" : "cosine_fallback" });
      }
      if (action === "route") {
        const start = req.query.start;
        const end = req.query.end;
        if (!start || !end || !(start in WAYPOINTS) || !(end in WAYPOINTS)) return res.status(400).json({ error: `Unknown waypoint. Valid: ${Object.keys(WAYPOINTS).join(", ")}` });
        if (start === end) return res.status(400).json({ error: "Start and end are the same" });
        const seaIce = await getSeaIceExtent();
        const extentKm2 = seaIce?.extent_km2 ?? 17;
        const iceMult = seaIce ? extentToConcentration(extentKm2) : 0.5;
        const [, valsWind] = store.getTelemetryPairs("maitri", "wind_speed_kmh", 1e3);
        const avgWind = valsWind.length > 0 ? valsWind.reduce((a, b) => a + b, 0) / valsWind.length : 25;
        const result = dijkstra(start, end, iceMult, avgWind);
        result.waypoints = { [start]: WAYPOINTS[start], [end]: WAYPOINTS[end] };
        return res.json(result);
      }
    }
    if (path === "/simulation/whatif" && req.method === "POST") {
      const BATTERY_CAPACITY_KWH = 200;
      const HVAC_SETPOINT_NORMAL = 20;
      const HVAC_SETPOINT_STRAINED = 15;
      const COOLING_RATE_NORMAL = 0.15;
      const COOLING_RATE_STRAINED = 0.1;
      const PASSIVE_HEAT_LOSS = 0.055;
      const GEN_FLOAT_CHARGE_PCT = 0.5;
      const GEN_DRAIN_PCT = 18.5;
      const THERMAL_DEMAND_FACTOR = 0.035;
      const body = req.body || {};
      const stationId = body.station_id || "maitri";
      const outdoorTemp = Math.max(-65, Math.min(-10, body.outdoor_temp ?? monthlyOutdoor(stationId)));
      const stormDurationHours = Math.min(120, Math.max(1, body.storm_duration_hours ?? 0)) || 1;
      const gensOfflineStart = Math.min(2, Math.max(0, body.generators_offline ?? 0));
      const supplyDelay = Math.max(0, body.supply_delay_days ?? 0);
      const inv = STATION_INVENTORY[stationId] || STATION_INVENTORY.maitri;
      const step = stormDurationHours <= 30 ? 3 : 6;
      let fuel = inv.fuel;
      let batterySoc = inv.battery_soc;
      let indoor = HVAC_SETPOINT_NORMAL;
      let gensOnline = Math.max(0, 2 - gensOfflineStart);
      const timeline = [];
      const milestones = [];
      const rationingMode = supplyDelay > 7;
      const rationingFactor = rationingMode ? 0.7 : 1;
      for (let h = 0; h <= stormDurationHours; h += step) {
        const inStorm = h > 0 && h <= stormDurationHours;
        const coldDelta = inStorm ? Math.abs(outdoorTemp) - 20 : 0;
        const thermalMult = 1 + Math.max(0, coldDelta) * THERMAL_DEMAND_FACTOR;
        let effBurn = 0;
        if (gensOnline >= 2) effBurn = inv.burn_rate * thermalMult * rationingFactor;
        else if (gensOnline === 1) effBurn = inv.burn_rate * 1.02 * thermalMult * rationingFactor;
        fuel = Math.max(0, fuel - effBurn * step);
        if (fuel <= 0 && gensOnline > 0) gensOnline = 0;
        if (gensOnline > 0 && batterySoc < 100) batterySoc = Math.min(100, batterySoc + GEN_FLOAT_CHARGE_PCT * step);
        else if (gensOnline === 0) batterySoc = Math.max(0, batterySoc - GEN_DRAIN_PCT * step);
        let hvacSetpoint = HVAC_SETPOINT_NORMAL;
        let coolingRate = COOLING_RATE_NORMAL;
        if (gensOnline >= 2) {
          hvacSetpoint = HVAC_SETPOINT_NORMAL;
          coolingRate = COOLING_RATE_NORMAL;
        } else if (gensOnline === 1) {
          hvacSetpoint = Math.max(HVAC_SETPOINT_STRAINED, HVAC_SETPOINT_NORMAL - coldDelta * 0.15);
          coolingRate = COOLING_RATE_STRAINED;
        } else {
          hvacSetpoint = -5;
          coolingRate = COOLING_RATE_STRAINED * 0.8;
        }
        const outdoorCurrent = inStorm ? outdoorTemp : outdoorTemp + 5;
        if (gensOnline > 0) indoor = indoor + coolingRate * (hvacSetpoint - indoor);
        else indoor = indoor + PASSIVE_HEAT_LOSS * (outdoorCurrent - indoor);
        indoor = Math.max(-10, Math.min(30, indoor));
        const tempScore = Math.max(0, Math.min(1, (indoor - -5) / 25));
        const powerScore = batterySoc / 100;
        const habitability = Math.max(0, Math.min(100, 0.6 * tempScore * 100 + 0.4 * powerScore * 100));
        const solar = inStorm && outdoorTemp < -40 ? 0 : 3;
        const renewablePct = Math.min(100, solar / Math.max(1, effBurn > 0 ? effBurn : 30) * 100);
        timeline.push({ hour: h, fuel_liters: Math.round(fuel), indoor_temp_c: Math.round(indoor * 10) / 10, battery_soc_pct: Math.round(batterySoc * 10) / 10, habitability_pct: Math.round(habitability * 10) / 10, outdoor_temp_c: Math.round(outdoorCurrent * 10) / 10, generators_online: gensOnline, renewable_share_pct: Math.round(renewablePct * 10) / 10 });
        if (fuel <= 0 && !milestones.some((m) => m.type === "fuel_exhausted")) milestones.push({ type: "fuel_exhausted", hour: h, severity: "critical", message: "Fuel exhausted \u2014 all generators offline" });
        if (batterySoc <= 20 && !milestones.some((m) => m.type === "battery_low")) milestones.push({ type: "battery_low", hour: h, severity: "warning", message: `Battery SOC below 20% at hour ${h}` });
        if (batterySoc <= 0 && !milestones.some((m) => m.type === "blackout")) milestones.push({ type: "blackout", hour: h, severity: "critical", message: `Total station blackout at hour ${h}` });
        if (indoor <= 0 && !milestones.some((m) => m.type === "freeze_breach")) milestones.push({ type: "freeze_breach", hour: h, severity: "critical", message: `Habitat freeze breach (0 C) at hour ${h}` });
      }
      const fuelDays = Math.round(inv.fuel / Math.max(1, inv.burn_rate) / 24 * 10) / 10;
      const blackoutAt = milestones.find((m) => m.type === "blackout")?.hour;
      const freezeAt = milestones.find((m) => m.type === "freeze_breach")?.hour;
      const fuelExhaustAt = milestones.find((m) => m.type === "fuel_exhausted")?.hour;
      let riskLevel = "LOW";
      if (fuelExhaustAt != null && fuelExhaustAt <= 24) riskLevel = "CRITICAL";
      else if (blackoutAt != null && blackoutAt <= 24) riskLevel = "CRITICAL";
      else if (blackoutAt != null && blackoutAt <= 72) riskLevel = "HIGH";
      else if (freezeAt != null && freezeAt <= 72) riskLevel = "HIGH";
      else if (fuelDays <= 3) riskLevel = "CRITICAL";
      else if (fuelDays <= 7) riskLevel = "HIGH";
      const actions = [];
      if (gensOfflineStart >= 2) actions.push("IMMEDIATE: Restore generator power \u2014 critical life-support systems at risk");
      else if (gensOfflineStart >= 1) actions.push("Load-shed non-essential systems to preserve life-support");
      if (rationingMode) actions.push(`Fuel rationing recommended \u2014 ${supplyDelay}-day resupply delay; reducing burn rate 30%`);
      if (supplyDelay > 0 && supplyDelay <= 7) actions.push(`Resupply vessel ETA ${supplyDelay} days \u2014 monitor fuel closely`);
      if (outdoorTemp < -50) actions.push("Exterior equipment lockout \u2014 preheat fuel lines and hydraulic systems before restart");
      if (batterySoc < 30) actions.push("Reduce battery load to essential comms only");
      if (actions.length === 0) actions.push("Continue monitoring \u2014 all systems within operational parameters");
      return res.json({ station_id: stationId, scenario: { outdoor_temp: outdoorTemp, storm_hours: stormDurationHours, generators_offline: gensOfflineStart, supply_delay_days: supplyDelay }, timeline, milestones, risk: { level: riskLevel, fuel_autonomy_days: fuelDays, estimated_blackout_hour: blackoutAt ?? null, estimated_freeze_hour: freezeAt ?? null }, actions });
    }
    if (path === "/fault" && req.method === "POST") {
      const { station_id, mode } = req.body || {};
      const stationId = station_id || "maitri";
      if (mode && ["storm", "gen_failure", "fuel_low", "hvac_fault"].includes(mode)) {
        store.faultModes[stationId] = mode;
        return res.json({ ok: true, station_id: stationId, fault_mode: mode });
      }
      if (mode === null || mode === "reset" || mode === void 0) {
        store.faultModes[stationId] = null;
        return res.json({ ok: true, station_id: stationId, fault_mode: null });
      }
      return res.status(400).json({ error: "Invalid mode. Valid: storm, gen_failure, fuel_low, hvac_fault, reset" });
    }
    if (path === "/weather" && req.method === "GET") {
      const stationId = req.query.station_id || "maitri";
      const validStations = ["maitri", "bharati", "maitri_ii"];
      if (!validStations.includes(stationId)) return res.status(400).json({ error: "Unknown station" });
      const [weather, ncporData] = await Promise.all([getOpenMeteoWeather(stationId), getNcporStationData(stationId)]);
      const ncporTemp = ncporData?.current.temp_C ?? null;
      const ncporWind = ncporData?.current.wind_ms !== null ? Math.round(ncporData.current.wind_ms * 3.6 * 10) / 10 : null;
      const ncporPressure = ncporData?.current.pressure_mbar ?? null;
      const ncporHumidity = ncporData?.current.humidity_pct ?? null;
      const ncporTimestamp = ncporData?.current.timestamp_ms ? new Date(ncporData.current.timestamp_ms).toISOString() : null;
      if (weather) {
        const result = { ...weather };
        result.temperature_source = ncporTemp !== null ? "ncpor" : "open-meteo";
        if (ncporTemp !== null) result.current.temperature_2m = ncporTemp;
        if (ncporWind !== null) result.current.wind_speed_10m = ncporWind;
        if (ncporPressure !== null) result.current.pressure = ncporPressure;
        if (ncporHumidity !== null) result.current.relative_humidity_2m = Math.round(ncporHumidity);
        result.ncpor = { temp_C: ncporTemp, wind_ms: ncporData?.current.wind_ms ?? null, pressure_mbar: ncporPressure, humidity_pct: ncporHumidity, timestamp: ncporTimestamp };
        return res.json(result);
      }
      const now = /* @__PURE__ */ new Date();
      const hour = now.getHours();
      const baseTemp = ncporTemp ?? monthlyOutdoor(stationId, now);
      const temp = baseTemp + Math.sin((hour - 12) / 24 * Math.PI * 2) * 3;
      const weatherCode = temp < -45 ? 71 : temp < -35 ? 3 : 1;
      res.json({ station_id: stationId, station_name: stationId.charAt(0).toUpperCase() + stationId.slice(1), source: "synthetic", temperature_source: ncporTemp !== null ? "ncpor" : "climatology", current: { temperature_2m: Math.round(temp * 10) / 10, wind_speed_10m: ncporWind ?? Math.round(22 + seededRand2(hour) * 15 * 10) / 10, relative_humidity_2m: ncporHumidity ? Math.round(ncporHumidity) : Math.round(65 + seededRand2(hour + 1) * 20), pressure: ncporPressure ?? Math.round(1e3 + seededRand2(hour + 2) * 30), weather_code: weatherCode, weather_label: weatherLabel(weatherCode) }, daily: { temperature_2m_max: [Math.round(temp + 5), Math.round(temp + 4), Math.round(temp + 6), Math.round(temp + 3), Math.round(temp + 5), Math.round(temp + 4), Math.round(temp + 6)], temperature_2m_min: [Math.round(temp - 8), Math.round(temp - 7), Math.round(temp - 9), Math.round(temp - 6), Math.round(temp - 8), Math.round(temp - 7), Math.round(temp - 9)] }, ncpor: { temp_C: ncporTemp, wind_ms: ncporData?.current.wind_ms ?? null, pressure_mbar: ncporPressure, humidity_pct: ncporHumidity, timestamp: ncporTimestamp }, note: "Synthetic data \u2014 Open-Meteo unreachable" });
      return;
    }
    if (path === "/aurora" && req.method === "GET") {
      const stationId = req.query.station_id || "maitri";
      const [aurora, kp] = await Promise.all([getAuroraData(), getKpIndex()]);
      return res.json({ station_id: stationId, aurora_probability: aurora?.data?.[stationId] ?? 0, kp_index: kp?.kp_current ?? 0, kp_label: kp?.kp_label ?? "Unknown", observation_time: aurora?.observation_time ?? null, forecast_time: aurora?.forecast_time ?? null, source: "NOAA SWPC OVATION" });
    }
    return res.status(404).json({ error: `No route: ${path}`, available: ["/health", "/stations", "/telemetry/latest", "/telemetry/history", "/predict/fuel", "/predict/temperature", "/predict/rpm-health", "/predict/anomalies", "/predict/model-accuracy", "/predict/ensemble", "/alerts", "/energy/optimize", "/energy/savings", "/logistics", "/routes", "/seaice", "/simulation/whatif", "/fault", "/weather", "/aurora"] });
  } catch (err) {
    console.error(`[api] Error in ${path}:`, err?.message || err);
    return res.status(500).json({ error: err?.message || "Internal error" });
  }
}
export {
  handler as default
};
