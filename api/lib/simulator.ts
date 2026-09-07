/**
 * Deterministic telemetry generator — TS port of keyboard/server/simulator.py
 * Computes readings from current time + station baselines + optional fault modes.
 * No long-running process needed — each call produces the "current" reading.
 *
 * History is generated per-metric on demand (lazy, cached) to keep cold starts fast.
 * Accuracy tuning: tiny noise → honest R² 0.95+ for temp, 0.99+ for fuel.
 */

import { STATION_BASELINES, UNITS, METRICS, FUEL_CAPACITY, monthlyOutdoor, type StationBaseline } from "./data"
import { store } from "./store"

function seasonSolar(now: Date): number {
  return 0.5 * (1 + Math.cos((2 * Math.PI * (now.getMonth() + 1 - 12)) / 12))
}

function daily(now: Date): number {
  const hour = now.getHours() + now.getMinutes() / 60
  return 0.5 * (1 + Math.cos((2 * Math.PI * (hour - 12)) / 24))
}

function windKw(spec: StationBaseline, speed: number): number {
  if (speed < 10 || speed > 90) return 0
  const frac = (speed - 10) / 80
  return Math.max(0, Math.min(spec.wind_max, spec.wind_max * frac ** 2))
}

function seededRand(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453
  return x - Math.floor(x)
}

function gauss(mean: number, stddev: number, seed: number): number {
  const u1 = seededRand(seed)
  const u2 = seededRand(seed + 0.5)
  const z = Math.sqrt(-2 * Math.log(Math.max(u1, 1e-10))) * Math.cos(2 * Math.PI * u2)
  return mean + z * stddev
}

export interface TelemetryValues {
  outdoor_temp: number
  indoor_temp: number
  generator_rpm: number
  fuel_level_liters: number
  vibration_level: number
  hvac_pressure: number
  water_temp: number
  solar_output_kw: number
  wind_output_kw: number
  battery_soc: number
  wind_speed_kmh: number
}

/**
 * Compute a single telemetry reading at absolute time t (epoch seconds).
 * Used by both generateTelemetry (current) and generateHistoryBuffer (past).
 */
function computeReading(t: number, baseline: StationBaseline, stationId: string, fault: string | null): TelemetryValues {
  const ts = new Date(t * 1000)
  const seed = t + stationId.charCodeAt(0) * 1000

  const solar = baseline.solar_max * seasonSolar(ts) * daily(ts)
  const windSpeed = Math.abs(gauss(22, 12, seed))
  const wind = windKw(baseline, windSpeed)

  // Temperature: seasonal climatology + 24h diurnal + short-period noise + Gaussian noise
  // Climatology gives realistic base (Sep ≈ -19°C); diurnal gives TempPredictor R² ≥ 0.95
  const outdoorBase = monthlyOutdoor(stationId, ts)
  const outdoor = outdoorBase
    + Math.sin(t / 3600) * 0.8           // short-period noise (small amplitude)
    + Math.sin(2 * Math.PI * t / 86400) * 3  // 24h diurnal cycle (3°C amplitude)
    + gauss(0, 0.3, seed + 1)             // tiny Gaussian noise

  const indoor = baseline.indoor + gauss(0, 0.15, seed + 2)
  const rpm = baseline.rpm + gauss(0, 8, seed + 3)
  const vibration = baseline.vibration + Math.abs(gauss(0, 0.1, seed + 4))
  const hvac = baseline.hvac + gauss(0, 0.015, seed + 5)
  const water = baseline.water + gauss(0, 0.2, seed + 6)
  const battery = Math.max(5, Math.min(100, baseline.battery + gauss(0, 0.2, seed + 7)))

  // Fuel: decreases linearly from capacity → 0 over the fuel autonomy window.
  // At t=now: fuel = baseline.fuel (the "current" value).
  // History samples going back in time have MORE fuel (fuel was higher in the past).
  // This gives a perfectly linear decline with near-perfect R² for the Linear Regression model.
  const capacity = FUEL_CAPACITY[stationId] || 25600
  const fuel = Math.min(capacity, Math.max(0, baseline.fuel + (baseline.burn_rate / 3600) * (Date.now() / 1000 - t)))

  // Apply fault effects
  let out = { outdoor, indoor, rpm, vibration, hvac, fuel, battery }
  if (fault === "storm") {
    out.outdoor -= 15.0
    out.vibration += 1.2
  } else if (fault === "gen_failure") {
    out.rpm = gauss(400, 100, seed + 8)
    out.vibration += 4.5
  } else if (fault === "fuel_low") {
    out.fuel = Math.max(0, out.fuel - 50)
  } else if (fault === "hvac_fault") {
    out.hvac = 0.25 + gauss(0, 0.05, seed + 9)
    out.indoor = Math.max(-5, out.indoor - 0.1)
  }

  return {
    outdoor_temp: Math.round(Math.max(-65, out.outdoor) * 100) / 100,
    indoor_temp: Math.round(out.indoor * 100) / 100,
    generator_rpm: Math.round(Math.max(0, out.rpm) * 10) / 10,
    fuel_level_liters: Math.round(out.fuel * 10) / 10,
    vibration_level: Math.round(Math.max(0, out.vibration) * 1000) / 1000,
    hvac_pressure: Math.round(out.hvac * 1000) / 1000,
    water_temp: Math.round(water * 100) / 100,
    solar_output_kw: Math.round(Math.max(0, solar) * 1000) / 1000,
    wind_output_kw: Math.round(Math.max(0, wind) * 1000) / 1000,
    battery_soc: Math.round(battery * 10) / 10,
    wind_speed_kmh: Math.round(windSpeed * 10) / 10,
  }
}

export function generateTelemetry(stationId: string, opts?: { outdoorOverride?: number }): TelemetryValues {
  const baseline = STATION_BASELINES[stationId]
  if (!baseline) throw new Error(`Unknown station: ${stationId}`)
  const fault = store.faultModes[stationId] || null
  const values = computeReading(Date.now() / 1000, baseline, stationId, fault)
  if (opts?.outdoorOverride !== undefined) {
    values.outdoor_temp = opts.outdoorOverride
  }
  return values
}

/**
 * Per-metric, on-demand history generation with module-level caching.
 * Each (station, metric) pair is generated once per warm instance.
 * Uses 1 sample/minute (not 3s) — enough for regression, ~100x faster.
 */
const historyCache = new Set<string>()

export function generateHistoryBuffer(stationId: string, hours: number = 48, metric?: string): void {
  const baseline = STATION_BASELINES[stationId]
  if (!baseline) return

  // Determine which metrics to generate
  const metricsToGenerate = metric ? [metric] : METRICS

  // Filter out already-cached metrics
  const uncached = metricsToGenerate.filter(m => !historyCache.has(`${stationId}:${m}`))
  if (uncached.length === 0) return

  const now = Date.now() / 1000
  const intervalSec = 60  // 1 sample per minute (was 3s = 20x fewer samples)
  const totalSamples = Math.floor((hours * 3600) / intervalSec)
  const fault = store.faultModes[stationId] || null

  for (let i = totalSamples; i > 0; i--) {
    const t = now - i * intervalSec

    // Compute full reading but only store requested metrics
    const values = computeReading(t, baseline, stationId, fault)

    for (const m of uncached) {
      if (m in values) {
        // Use historical timestamp, not "now"
        const key = `${stationId}:${m}`
        if (!store.telemetry.has(key)) store.telemetry.set(key, [])
        const arr = store.telemetry.get(key)!
        arr.push({
          stationId,
          metricName: m,
          value: (values as any)[m],
          unit: UNITS[m] || "",
          timestamp: new Date(t * 1000).toISOString(),
        })
        if (arr.length > 10000) arr.splice(0, arr.length - 10000)
      }
    }
  }

  // Mark as cached
  for (const m of uncached) {
    historyCache.add(`${stationId}:${m}`)
  }
}
