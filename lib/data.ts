export interface StationBaseline {
  outdoor: number
  indoor: number
  rpm: number
  fuel: number
  vibration: number
  hvac: number
  water: number
  battery: number
  burn_rate: number
  solar_max: number
  wind_max: number
}

export const STATION_BASELINES: Record<string, StationBaseline> = {
  maitri: {
    outdoor: -38.0, indoor: 20.5, rpm: 1490.0, fuel: 12800.0,
    vibration: 2.5, hvac: 1.01, water: 17.0, battery: 68.0,
    burn_rate: 155.0, solar_max: 5.0, wind_max: 10.0,
  },
  bharati: {
    outdoor: -34.0, indoor: 21.0, rpm: 1500.0, fuel: 14200.0,
    vibration: 2.2, hvac: 1.02, water: 18.5, battery: 75.0,
    burn_rate: 145.0, solar_max: 5.0, wind_max: 10.0,
  },
  maitri_ii: {
    outdoor: -38.0, indoor: 21.0, rpm: 1500.0, fuel: 9000.0,
    vibration: 2.0, hvac: 1.03, water: 17.5, battery: 80.0,
    burn_rate: 90.0, solar_max: 8.0, wind_max: 15.0,
  },
}

export const STATION_PARAMS: Record<string, {
  latitude: number
  diesel_kw: number
  fuel_efficiency_kwh_per_gal: number
  baseline_burn_rate_lph: number
  solar_max_kw: number
  wind_max_kw: number
  wind_cut_in: number
  wind_cut_out: number
  annual_fuel_gallons: number
  fuel_cost_usd_per_gal: number
}> = {
  maitri: {
    latitude: -70.7668, diesel_kw: 40.0, fuel_efficiency_kwh_per_gal: 12.0,
    baseline_burn_rate_lph: 155.0, solar_max_kw: 5.0, wind_max_kw: 10.0,
    wind_cut_in: 10.0, wind_cut_out: 90.0, annual_fuel_gallons: 120000,
    fuel_cost_usd_per_gal: 42.0,
  },
  bharati: {
    latitude: -69.4068, diesel_kw: 40.0, fuel_efficiency_kwh_per_gal: 12.0,
    baseline_burn_rate_lph: 145.0, solar_max_kw: 5.0, wind_max_kw: 10.0,
    wind_cut_in: 10.0, wind_cut_out: 90.0, annual_fuel_gallons: 115000,
    fuel_cost_usd_per_gal: 42.0,
  },
  maitri_ii: {
    latitude: -70.76, diesel_kw: 40.0, fuel_efficiency_kwh_per_gal: 12.0,
    baseline_burn_rate_lph: 90.0, solar_max_kw: 8.0, wind_max_kw: 15.0,
    wind_cut_in: 10.0, wind_cut_out: 90.0, annual_fuel_gallons: 80000,
    fuel_cost_usd_per_gal: 42.0,
  },
}

export const STATION_INVENTORY: Record<string, {
  fuel: number; food_days: number; medical_days: number;
  spare_parts: number; battery_soc: number; burn_rate: number
}> = {
  maitri: { fuel: 12800, food_days: 45, medical_days: 60, spare_parts: 24, battery_soc: 68, burn_rate: 155 },
  bharati: { fuel: 14200, food_days: 52, medical_days: 65, spare_parts: 18, battery_soc: 75, burn_rate: 145 },
  maitri_ii: { fuel: 9000, food_days: 38, medical_days: 50, spare_parts: 12, battery_soc: 80, burn_rate: 90 },
}

export const WAYPOINTS: Record<string, { lat: number; lon: number; label: string }> = {
  goa: { lat: 15.4909, lon: 73.8278, label: "NCPOR Goa HQ" },
  cape_town: { lat: -33.9249, lon: 18.4241, label: "Cape Town (resupply port)" },
  maitri: { lat: -70.7668, lon: 11.7308, label: "Maitri" },
  bharati: { lat: -69.4068, lon: 76.19525, label: "Bharati" },
}

export const ROUTE_EDGES: [string, string, number][] = [
  ["goa", "cape_town", 7800],
  ["cape_town", "maitri", 4200],
  ["cape_town", "bharati", 4800],
  ["maitri", "bharati", 3000],
  ["goa", "bharati", 11500],
  ["goa", "maitri", 10600],
]

export const HQ = { name: "NCPOR Goa HQ", lat: 15.4909, lon: 73.8278 }
export const SHIP_SPEED_KNOTS = 14.0

export const DEMO_USERS = [
  { email: "admin@antarctic-ops.in", password: "password", name: "HQ System Administrator", role: "admin", stationId: null },
  { email: "researcher@antarctic-ops.in", password: "password", name: "Dr. Priya Nair", role: "researcher", stationId: "maitri" },
  { email: "bharati@antarctic-ops.in", password: "password", name: "Dr. Arjun Mehta", role: "researcher", stationId: "bharati" },
]

export const ALERT_RULES = [
  { stationId: "maitri", metric: "fuel_level_liters", condition: "lt" as const, threshold: 2500.0, severity: "critical", message: "Critical fuel depletion" },
  { stationId: "maitri", metric: "outdoor_temp", condition: "lt" as const, threshold: -55.0, severity: "critical", message: "Extreme low outdoor temperature" },
  { stationId: "maitri", metric: "generator_rpm", condition: "lt" as const, threshold: 800.0, severity: "critical", message: "Generator failure suspected" },
  { stationId: "maitri", metric: "vibration_level", condition: "gt" as const, threshold: 6.0, severity: "warning", message: "High vibration - possible wear" },
  { stationId: "bharati", metric: "fuel_level_liters", condition: "lt" as const, threshold: 2500.0, severity: "critical", message: "Critical fuel depletion" },
  { stationId: "bharati", metric: "outdoor_temp", condition: "lt" as const, threshold: -55.0, severity: "critical", message: "Extreme low outdoor temperature" },
  { stationId: "bharati", metric: "generator_rpm", condition: "lt" as const, threshold: 800.0, severity: "critical", message: "Generator failure suspected" },
  { stationId: "bharati", metric: "vibration_level", condition: "gt" as const, threshold: 6.0, severity: "warning", message: "High vibration - possible wear" },
  { stationId: "maitri_ii", metric: "fuel_level_liters", condition: "lt" as const, threshold: 2500.0, severity: "critical", message: "Critical fuel depletion" },
]

export const INVENTORY_SEED = [
  { stationId: "maitri", name: "Diesel", category: "fuel", quantity: 12800.0, unit: "L", reorderThreshold: 2500.0 },
  { stationId: "maitri", name: "Food rations", category: "food", quantity: 4600.0, unit: "kg", reorderThreshold: 2000.0 },
  { stationId: "maitri", name: "Medical kits", category: "medical", quantity: 22.0, unit: "units", reorderThreshold: 10.0 },
  { stationId: "maitri", name: "Spare parts", category: "spare_part", quantity: 85.0, unit: "units", reorderThreshold: 40.0 },
  { stationId: "bharati", name: "Diesel", category: "fuel", quantity: 14200.0, unit: "L", reorderThreshold: 2500.0 },
  { stationId: "bharati", name: "Food rations", category: "food", quantity: 5200.0, unit: "kg", reorderThreshold: 2200.0 },
  { stationId: "bharati", name: "Medical kits", category: "medical", quantity: 26.0, unit: "units", reorderThreshold: 10.0 },
  { stationId: "bharati", name: "Spare parts", category: "spare_part", quantity: 95.0, unit: "units", reorderThreshold: 45.0 },
  { stationId: "maitri_ii", name: "Diesel", category: "fuel", quantity: 9000.0, unit: "L", reorderThreshold: 2000.0 },
  { stationId: "maitri_ii", name: "Food rations", category: "food", quantity: 1800.0, unit: "kg", reorderThreshold: 900.0 },
  { stationId: "maitri_ii", name: "Medical kits", category: "medical", quantity: 12.0, unit: "units", reorderThreshold: 6.0 },
  { stationId: "maitri_ii", name: "Spare parts", category: "spare_part", quantity: 40.0, unit: "units", reorderThreshold: 20.0 },
]

export const METRICS = [
  "outdoor_temp", "indoor_temp", "generator_rpm", "fuel_level_liters",
  "vibration_level", "hvac_pressure", "water_temp", "solar_output_kw",
  "wind_output_kw", "battery_soc", "wind_speed_kmh",
]

export const FUEL_CAPACITY: Record<string, number> = {
  maitri: 25600, bharati: 25000, maitri_ii: 20000,
}

export const MONTHLY_CLIMATOLOGY: Record<string, number[]> = {
  // [Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec] — monthly mean outdoor °C
  maitri:    [-3, -8, -12, -16, -19, -22, -24, -23, -19, -13, -7, -2],
  bharati:   [-2, -6, -10, -14, -17, -20, -22, -21, -17, -11, -5, -1],
  maitri_ii: [-3, -8, -12, -16, -19, -22, -24, -23, -19, -13, -7, -2],
}

export function monthlyOutdoor(stationId: string, date = new Date()): number {
  const month = date.getMonth() // 0-indexed
  const climo = MONTHLY_CLIMATOLOGY[stationId] || MONTHLY_CLIMATOLOGY.maitri
  return climo[month]
}

export const UNITS: Record<string, string> = {
  outdoor_temp: "°C", indoor_temp: "°C", generator_rpm: "RPM",
  fuel_level_liters: "L", vibration_level: "mm/s", hvac_pressure: "bar",
  water_temp: "°C", solar_output_kw: "kW", wind_output_kw: "kW",
  battery_soc: "%", wind_speed_kmh: "km/h",
}

export const FEATURES = [
  "generator_rpm", "vibration_level", "outdoor_temp", "indoor_temp",
  "fuel_level_liters", "hvac_pressure", "battery_soc", "wind_speed_kmh",
]
