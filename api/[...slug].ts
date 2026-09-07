import type { VercelRequest, VercelResponse } from "@vercel/node"
import { store } from "./lib/store"
import { STATIONS_DB } from "./lib/stations"
import { HQ, SHIP_SPEED_KNOTS, STATION_PARAMS, UNITS, STATION_INVENTORY, WAYPOINTS, ROUTE_EDGES, FEATURES, monthlyOutdoor } from "./lib/data"
import { haversineKm } from "./lib/utils"
import { generateTelemetry, generateHistoryBuffer } from "./lib/simulator"
import { predictFuel, predictTemperature, predictRpmHealth, detectAnomalies } from "./lib/predictor"
import { scoreEnsemble, initEnsembleBaseline } from "./lib/ensemble"
import { getLiveOutdoorTemp } from "./lib/livetemp"
import { getNcporStationData } from "./lib/ncpor"
import { getOpenMeteoWeather, weatherLabel } from "./lib/openmeteo"
import { getAuroraData, getKpIndex } from "./lib/aurora"
import { getSeaIceExtent, extentToConcentration } from "./lib/seaicedata"

function seededRand(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453
  return x - Math.floor(x)
}

function solarKw(lat: number, hour: number, dayOfYear: number, max: number): number {
  const declination = -23.44 * Math.cos((360 / 365 * (dayOfYear + 10)) * Math.PI / 180)
  const threshold = 90 - Math.abs(lat)
  if (declination < threshold - 5) return 0
  const hourFactor = Math.max(0, Math.cos(Math.PI * (hour - 12) / 12))
  const seasonFactor = Math.max(0, Math.min(1, (declination - (threshold - 10)) / 10))
  return max * hourFactor * seasonFactor
}

function windKw(speed: number, params: any): number {
  const ratedSpeed = 43
  if (speed < params.wind_cut_in || speed > params.wind_cut_out) return 0
  const frac = Math.min(1, (speed - params.wind_cut_in) / (ratedSpeed - params.wind_cut_in))
  return params.wind_max_kw * frac ** 3
}

function loadKw(hour: number, dayOfYear: number, latitude: number): number {
  const declination = -23.44 * Math.cos((360 / 365 * (dayOfYear + 10)) * Math.PI / 180)
  const threshold = 90 - Math.abs(latitude)
  const isPolarNight = declination < threshold - 5
  const baseLoad = 30
  const heatingLoad = isPolarNight ? 10 : 3
  const researchLoad = hour >= 8 && hour <= 18 ? 5 : 1
  const hourWiggle = 1.5 * Math.sin(2 * Math.PI * (hour - 6) / 12)
  return baseLoad + heatingLoad + researchLoad + hourWiggle
}

function windPenalty(windSpeed: number): number {
  if (windSpeed < 15) return 1
  if (windSpeed < 40) return 1 + (windSpeed - 15) * 0.01
  if (windSpeed < 70) return 1.25 + (windSpeed - 40) * 0.02
  return Math.min(2.5, 1.85 + (windSpeed - 70) * 0.03)
}

function dijkstra(start: string, end: string, iceMult: number, windSpeed: number) {
  const adj: Record<string, [string, number, number, number][]> = {}
  for (const [a, b, baseDist] of ROUTE_EDGES) {
    const isCoastal = (a === "maitri" || a === "bharati") && (b === "maitri" || b === "bharati")
    const coastalMult = 1 + (isCoastal ? iceMult * 0.4 : 0)
    const windPen = windPenalty(windSpeed)
    const weight = baseDist * coastalMult * windPen
    if (!adj[a]) adj[a] = []
    if (!adj[b]) adj[b] = []
    adj[a].push([b, weight, baseDist, coastalMult])
    adj[b].push([a, weight, baseDist, coastalMult])
  }
  const dist: Record<string, number> = { [start]: 0 }
  const prev: Record<string, [string, number, number, number]> = {}
  const visited = new Set<string>()
  const pq: [number, string][] = [[0, start]]
  while (pq.length > 0) {
    pq.sort((a, b) => a[0] - b[0])
    const [d, u] = pq.shift()!
    if (visited.has(u)) continue
    visited.add(u)
    for (const [v, w, base, cm] of adj[u] || []) {
      const nd = d + w
      if (!(v in dist) || nd < dist[v]) {
        dist[v] = nd
        prev[v] = [u, w, base, cm]
        pq.push([nd, v])
      }
    }
  }
  const path: any[] = []
  let node = end
  while (node in prev) {
    const [via, w, base, cm] = prev[node]
    path.unshift({ from: via, to: node, adjusted_km: Math.round(w), base_km: base, ice_factor: Math.round(cm * 100) / 100 })
    node = via
  }
  const totalKm = Math.round(dist[end] || Infinity)
  const etaHours = totalKm / (14 * 1.852)
  return { start, end, path, total_adjusted_km: totalKm, eta_days: Math.round(etaHours / 24 * 10) / 10, ice_concentration: Math.round(iceMult * 100) / 100, wind_speed_kmh: Math.round(windSpeed * 10) / 10, waypoints: {} as Record<string, any> }
}

const baselineInitialized = new Set<string>()

export default async function handler(req: VercelRequest, res: VercelResponse) {
  store.init()

  const slug = (req.query.slug as string[]) || []
  const path = "/" + slug.join("/")

  try {
    // ── Health ──
    if (path === "/health" && req.method === "GET") {
      return res.json({ status: "ok", timestamp: new Date().toISOString() })
    }

    // ── Stations ──
    if (path === "/stations" && req.method === "GET") {
      return res.json(STATIONS_DB)
    }
    if (slug[0] === "stations" && slug[1] && req.method === "GET") {
      const station = STATIONS_DB.find(s => s.id === slug[1])
      if (!station) return res.status(404).json({ error: "Station not found" })
      return res.json(station)
    }

    // ── Telemetry ──
    if (path === "/telemetry/latest" && req.method === "GET") {
      const stationId = (req.query.station as string) || "maitri"
      const key = `${stationId}:outdoor_temp`
      if (!store.telemetry.has(key) || store.telemetry.get(key)!.length < 100) {
        generateHistoryBuffer(stationId, 48)
      }
      const { temp: liveTemp, source } = await getLiveOutdoorTemp(stationId)
      const outdoorOverride = liveTemp ?? undefined
      const values = generateTelemetry(stationId, { outdoorOverride })
      const ncporData = await getNcporStationData(stationId)
      let live_wind_ms: number | null = null
      let live_pressure_mbar: number | null = null
      let live_humidity_pct: number | null = null
      let live_ncpor_timestamp: string | null = null
      if (ncporData?.current) {
        live_wind_ms = ncporData.current.wind_ms
        live_pressure_mbar = ncporData.current.pressure_mbar
        live_humidity_pct = ncporData.current.humidity_pct
        live_ncpor_timestamp = ncporData.current.timestamp_ms ? new Date(ncporData.current.timestamp_ms).toISOString() : null
      }
      if (live_wind_ms !== null) values.wind_speed_kmh = Math.round(live_wind_ms * 3.6 * 10) / 10
      const weather = await getOpenMeteoWeather(stationId)
      const shortwaveRadiation = weather?.current?.shortwave_radiation ?? 0
      values.solar_output_kw = Math.round(shortwaveRadiation * 25 * 0.20 / 1000 * 1000) / 1000
      for (const [metric, value] of Object.entries(values)) {
        store.pushTelemetry(stationId, metric, value, UNITS[metric] || "")
      }
      return res.json({ station_id: stationId, timestamp: new Date().toISOString(), values, temperature_source: source, live_wind_ms, live_pressure_mbar, live_humidity_pct, live_solar_radiation_wm2: shortwaveRadiation, live_ncpor_timestamp })
    }

    if (path === "/telemetry/history" && req.method === "GET") {
      const stationId = (req.query.station as string) || "maitri"
      const metric = (req.query.metric as string) || "outdoor_temp"
      const hours = parseInt(req.query.hours as string) || 48
      const key = `${stationId}:${metric}`
      if (!store.telemetry.has(key) || store.telemetry.get(key)!.length < 100) {
        generateHistoryBuffer(stationId, hours, metric)
      }
      const rows = store.getTelemetryHistory(stationId, metric, 5000)
      return res.json(rows)
    }

    // ── Predict ──
    if (path === "/predict/fuel" && req.method === "GET") {
      const stationId = (req.query.station_id as string) || "maitri"
      const k = `${stationId}:fuel_level_liters`
      if (!store.telemetry.has(k) || store.telemetry.get(k)!.length < 100) generateHistoryBuffer(stationId, 168, "fuel_level_liters")
      const values = generateTelemetry(stationId)
      for (const [metric, value] of Object.entries(values)) store.pushTelemetry(stationId, metric, value, UNITS[metric] || "")
      const [timestamps, fuelLevels] = store.getTelemetryPairs(stationId, "fuel_level_liters", 5000)
      const result = predictFuel(timestamps, fuelLevels)
      return res.json({ station_id: stationId, days_to_depletion: result.predicted, confidence: { low: result.confidenceLow, high: result.confidenceHigh }, accuracy: { r2: result.accuracyR2, mape: result.accuracyMape }, model: result.modelName, samples: result.sampleCount, details: result.details })
    }

    if (path === "/predict/temperature" && req.method === "GET") {
      const stationId = (req.query.station_id as string) || "maitri"
      const { temp: liveTemp, source } = await getLiveOutdoorTemp(stationId)
      const anchor = liveTemp ?? monthlyOutdoor(stationId)
      const key = `${stationId}:outdoor_temp`
      if (!store.telemetry.has(key) || store.telemetry.get(key)!.length < 100) generateHistoryBuffer(stationId, 72, "outdoor_temp")
      const values = generateTelemetry(stationId, { outdoorOverride: anchor })
      for (const [metric, value] of Object.entries(values)) store.pushTelemetry(stationId, metric, value, UNITS[metric] || "")
      const [timestamps, temps] = store.getTelemetryPairs(stationId, "outdoor_temp", 5000)
      const result = predictTemperature(timestamps, temps, 24)
      return res.json({ station_id: stationId, forecast_24h: result.predicted, confidence: { low: result.confidenceLow, high: result.confidenceHigh }, accuracy: { r2: result.accuracyR2, mape: result.accuracyMape }, model: result.modelName, samples: result.sampleCount, details: result.details, current_temp: anchor, temperature_source: source })
    }

    if (path === "/predict/rpm-health" && req.method === "GET") {
      const stationId = (req.query.station_id as string) || "maitri"
      for (const m of ["generator_rpm", "vibration_level"]) {
        const k = `${stationId}:${m}`
        if (!store.telemetry.has(k) || store.telemetry.get(k)!.length < 100) generateHistoryBuffer(stationId, 48, m)
      }
      const values = generateTelemetry(stationId)
      for (const [metric, value] of Object.entries(values)) store.pushTelemetry(stationId, metric, value, UNITS[metric] || "")
      const [tsRpm, valsRpm] = store.getTelemetryPairs(stationId, "generator_rpm", 5000)
      const [, valsVib] = store.getTelemetryPairs(stationId, "vibration_level", 5000)
      const result = predictRpmHealth(tsRpm, valsRpm, valsVib.length === tsRpm.length ? valsVib : undefined)
      return res.json({ station_id: stationId, health_score: result.predicted, confidence: { low: result.confidenceLow, high: result.confidenceHigh }, model: result.modelName, samples: result.sampleCount, details: result.details })
    }

    if (path === "/predict/anomalies" && req.method === "GET") {
      const stationId = (req.query.station_id as string) || "maitri"
      const metric = (req.query.metric as string) || "generator_rpm"
      const k = `${stationId}:${metric}`
      if (!store.telemetry.has(k) || store.telemetry.get(k)!.length < 100) generateHistoryBuffer(stationId, 48, metric)
      const values = generateTelemetry(stationId)
      for (const [m, value] of Object.entries(values)) store.pushTelemetry(stationId, m, value, UNITS[m] || "")
      const [timestamps, vals] = store.getTelemetryPairs(stationId, metric, 5000)
      const result = detectAnomalies(timestamps, vals, metric)
      return res.json({ station_id: stationId, anomalies: result.anomalies, mean: result.mean, std: result.std, model: result.modelName, samples: result.sampleCount, anomaly_count: result.anomalyCount })
    }

    if (path === "/predict/model-accuracy" && req.method === "GET") {
      const STATIONS = ["maitri", "bharati"]
      const results = []
      for (const stationId of STATIONS) {
        for (const m of ["fuel_level_liters", "outdoor_temp", "generator_rpm", "vibration_level"]) {
          const k = `${stationId}:${m}`
          if (!store.telemetry.has(k) || store.telemetry.get(k)!.length < 100) generateHistoryBuffer(stationId, 168, m)
        }
        const { temp: liveTemp, source } = await getLiveOutdoorTemp(stationId)
        const anchor = liveTemp ?? monthlyOutdoor(stationId)
        const values = generateTelemetry(stationId, { outdoorOverride: anchor })
        for (const [metric, value] of Object.entries(values)) store.pushTelemetry(stationId, metric, value, UNITS[metric] || "")
        const [tsFuel, valsFuel] = store.getTelemetryPairs(stationId, "fuel_level_liters", 5000)
        const fuelR = predictFuel(tsFuel, valsFuel)
        const [tsTemp, valsTemp] = store.getTelemetryPairs(stationId, "outdoor_temp", 5000)
        const tempR = predictTemperature(tsTemp, valsTemp, 24)
        const [tsRpm, valsRpm] = store.getTelemetryPairs(stationId, "generator_rpm", 5000)
        const [, valsVib] = store.getTelemetryPairs(stationId, "vibration_level", 5000)
        const rpmR = predictRpmHealth(tsRpm, valsRpm, valsVib.length === tsRpm.length ? valsVib : undefined)
        results.push({ station_id: stationId, fuel: { model: fuelR.modelName, r2: fuelR.accuracyR2, mape: fuelR.accuracyMape, samples: fuelR.sampleCount }, temperature: { model: tempR.modelName, r2: tempR.accuracyR2, mape: tempR.accuracyMape, samples: tempR.sampleCount }, rpm_health: { model: rpmR.modelName, health_score: rpmR.predicted, samples: rpmR.sampleCount }, temperature_source: source })
      }
      return res.json(results)
    }

    if (path === "/predict/ensemble" && req.method === "GET") {
      const stationId = (req.query.station_id as string) || "maitri"
      const values = generateTelemetry(stationId)
      for (const [metric, value] of Object.entries(values)) store.pushTelemetry(stationId, metric, value, UNITS[metric] || "")
      if (!baselineInitialized.has(stationId)) {
        const baselineData: number[][] = []
        const baseTemp = monthlyOutdoor(stationId)
        for (let i = 0; i < 200; i++) {
          baselineData.push([1490 + (Math.random() - 0.5) * 20, 2.5 + Math.random() * 0.5, baseTemp + (Math.random() - 0.5) * 10, 20.5 + (Math.random() - 0.5) * 2, 12800 - i * 0.1, 1.01 + (Math.random() - 0.5) * 0.04, 68 + (Math.random() - 0.5) * 5, 22 + (Math.random() - 0.5) * 15])
        }
        initEnsembleBaseline(stationId, baselineData)
        baselineInitialized.add(stationId)
      }
      const sample = FEATURES.map(f => values[f as keyof typeof values] ?? 0)
      const result = scoreEnsemble(stationId, sample)
      const alertLevel = result.anomalyScore >= 0.7 ? "critical" : result.anomalyScore >= 0.4 ? "warning" : "normal"
      return res.json({ station_id: stationId, anomaly_score: result.anomalyScore, alert_level: alertLevel, model_breakdown: result.modelBreakdown, cusum_details: result.cusumDetails, total_votes: result.totalVotes, features: FEATURES })
    }

    // ── Alerts ──
    if (path === "/alerts" && req.method === "GET") {
      const { station_id, status } = req.query
      let alerts = [...store.alerts]
      if (station_id) alerts = alerts.filter(a => a.stationId === station_id)
      if (status) alerts = alerts.filter(a => a.status === status)
      return res.json(alerts)
    }
    if (path === "/alerts" && req.method === "PUT") {
      const id = req.query.id as string
      const { action } = req.body || {}
      const alert = store.alerts.find(a => a.id === id)
      if (!alert) return res.status(404).json({ error: "Not found" })
      if (action === "acknowledge") alert.status = "acknowledged"
      if (action === "resolve") { alert.status = "resolved"; alert.resolvedAt = new Date().toISOString() }
      return res.json(alert)
    }

    // ── Energy ──
    if (path === "/energy/optimize" && req.method === "GET") {
      const stationId = (req.query.station_id as string) || "maitri"
      const season = (req.query.season as string) || "current"
      const params = STATION_PARAMS[stationId]
      if (!params) return res.status(400).json({ error: `Unknown station: ${stationId}` })
      const key = `${stationId}:wind_speed_kmh`
      if (!store.telemetry.has(key) || store.telemetry.get(key)!.length < 10) generateHistoryBuffer(stationId, 24, "wind_speed_kmh")
      const [, valsWind] = store.getTelemetryPairs(stationId, "wind_speed_kmh", 1000)
      const avgWind = valsWind.length > 0 ? valsWind.reduce((a, b) => a + b, 0) / valsWind.length : 20
      const now = new Date()
      let dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000)
      if (season === "summer") dayOfYear = 355
      else if (season === "winter") dayOfYear = 172
      const currentHour = now.getHours()
      const schedule = []
      let dieselHours = 0, renewableHours = 0, totalFuelBaseline = 0, totalFuelOptimized = 0
      for (let h = 0; h < 24; h++) {
        const hour = (currentHour + h) % 24
        const load = loadKw(hour, dayOfYear, params.latitude)
        const solar = solarKw(params.latitude, hour, dayOfYear, params.solar_max_kw)
        const windBase = avgWind * (0.55 + 0.45 * Math.sin(2 * Math.PI * (hour - 4) / 24))
        const gust = 6 * Math.sin(2 * Math.PI * (hour - 2) / 12)
        const windSpeed = Math.max(5, Math.min(85, windBase + gust))
        const wind = windKw(windSpeed, params)
        const renewableKw = solar + wind
        const deficit = Math.max(0, load - renewableKw)
        const dieselKwNeeded = Math.min(deficit, params.diesel_kw)
        const dieselGal = dieselKwNeeded / params.fuel_efficiency_kwh_per_gal
        const renewablePct = Math.min(100, renewableKw / Math.max(load, 1) * 100)
        schedule.push({ hour, load_kw: Math.round(load * 10) / 10, solar_kw: Math.round(solar * 100) / 100, wind_kw: Math.round(wind * 100) / 100, wind_speed_kmh: Math.round(windSpeed * 10) / 10, renewable_total_kw: Math.round(renewableKw * 100) / 100, deficit_kw: Math.round(deficit * 10) / 10, diesel_kw: Math.round(dieselKwNeeded * 10) / 10, diesel_gallons: Math.round(dieselGal * 100) / 100, renewable_share_pct: Math.round(renewablePct * 10) / 10, recommendation: renewableKw >= load ? "RENEWABLE" : dieselKwNeeded > 0 ? "DIESEL" : "STANDBY" })
        if (dieselKwNeeded > 0) dieselHours++; else renewableHours++
        totalFuelBaseline += load / params.fuel_efficiency_kwh_per_gal
        totalFuelOptimized += dieselGal
      }
      const fuelSaved = totalFuelBaseline - totalFuelOptimized
      return res.json({ station_id: stationId, schedule, summary: { diesel_hours: dieselHours, renewable_hours: renewableHours, fuel_baseline_gallons: Math.round(totalFuelBaseline * 10) / 10, fuel_optimized_gallons: Math.round(totalFuelOptimized * 10) / 10, fuel_saved_gallons: Math.round(fuelSaved * 10) / 10, co2_saved_kg: Math.round(fuelSaved * 2.68 * 10) / 10, money_saved_usd: Math.round(fuelSaved * params.fuel_cost_usd_per_gal * 100) / 100, renewable_share_pct: Math.round(renewableHours / 24 * 100 * 10) / 10 } })
    }

    if (path === "/energy/savings" && req.method === "GET") {
      const stationId = (req.query.station_id as string) || "maitri"
      const params = STATION_PARAMS[stationId]
      if (!params) return res.status(400).json({ error: `Unknown station: ${stationId}` })
      for (const m of ["solar_output_kw", "wind_output_kw", "fuel_level_liters"]) {
        const k = `${stationId}:${m}`
        if (!store.telemetry.has(k) || store.telemetry.get(k)!.length < 10) generateHistoryBuffer(stationId, 168, m)
      }
      const values = generateTelemetry(stationId)
      for (const [metric, value] of Object.entries(values)) store.pushTelemetry(stationId, metric, value, UNITS[metric] || "")
      const [, valsSolar] = store.getTelemetryPairs(stationId, "solar_output_kw", 1000)
      const [, valsWind] = store.getTelemetryPairs(stationId, "wind_output_kw", 1000)
      const avgSolar = valsSolar.length > 0 ? valsSolar.reduce((a, b) => a + b, 0) / valsSolar.length : 0
      const avgWind = valsWind.length > 0 ? valsWind.reduce((a, b) => a + b, 0) / valsWind.length : 0
      const renewableOffsetPct = Math.min(30, (avgSolar + avgWind) / 40 * 100)
      const annualOptimized = params.annual_fuel_gallons * (1 - renewableOffsetPct / 100)
      const annualSaved = params.annual_fuel_gallons - annualOptimized
      return res.json({ station_id: stationId, annual_baseline_gallons: Math.round(params.annual_fuel_gallons), annual_optimized_gallons: Math.round(annualOptimized), annual_saved_gallons: Math.round(annualSaved), annual_co2_saved_kg: Math.round(annualSaved * 2.68), annual_money_saved_usd: Math.round(annualSaved * params.fuel_cost_usd_per_gal), renewable_offset_pct: Math.round(renewableOffsetPct * 10) / 10, avg_solar_kw: Math.round(avgSolar * 100) / 100, avg_wind_kw: Math.round(avgWind * 100) / 100, note: "Savings from renewable offset only. Intelligent scheduling adds ~9.6%." })
    }

    // ── Logistics ──
    if (path === "/logistics" && req.method === "GET") {
      const action = (req.query.action as string) || "inventory"
      if (action === "inventory") return res.json(store.inventory)
      if (action === "shipments") return res.json(store.shipments)
      if (action === "resupply") {
        const recommendations = store.inventory
          .filter(i => i.quantity < i.reorderThreshold * 1.3)
          .map(i => ({ station_id: i.stationId, station_name: i.stationId.charAt(0).toUpperCase() + i.stationId.slice(1), item_name: i.itemName, category: i.category, quantity: i.quantity, unit: i.unit, reorder_threshold: i.reorderThreshold, suggest_order: Math.round((i.reorderThreshold * 2 - i.quantity) * 10) / 10, days_until_shortage: Math.round(i.quantity / Math.max(1, i.reorderThreshold / 14) * 10) / 10, urgency: i.quantity < i.reorderThreshold ? "critical" : i.quantity < i.reorderThreshold * 1.15 ? "warning" : "watch", window: "Nov-Mar (11-3)" }))
        return res.json(recommendations)
      }
      if (action === "sustainability") {
        const stations = ["maitri", "bharati"]
        for (const s of stations) generateHistoryBuffer(s, 24)
        const rows = stations.map(s => {
          const [, valsSolar] = store.getTelemetryPairs(s, "solar_output_kw", 100)
          const [, valsWind] = store.getTelemetryPairs(s, "wind_output_kw", 100)
          const solar = valsSolar.length > 0 ? valsSolar[valsSolar.length - 1] : 0
          const wind = valsWind.length > 0 ? valsWind[valsWind.length - 1] : 0
          const renewableKw = solar + wind
          const totalKw = renewableKw + 40
          const share = renewableKw / Math.max(totalKw, 1e-9)
          const co2PerHour = 155 * 2.68 / 60
          return { station_id: s, station_name: s.charAt(0).toUpperCase() + s.slice(1), renewable_kw: Math.round(renewableKw * 100) / 100, solar_kw: Math.round(solar * 100) / 100, wind_kw: Math.round(wind * 100) / 100, renewable_share_pct: Math.round(share * 100 * 10) / 10, co2_per_hour_kg: Math.round(co2PerHour * 100) / 100, co2_saved_per_day_kg: Math.round(co2PerHour * 24 * share * 10) / 10 }
        })
        return res.json(rows)
      }
    }
    if (path === "/logistics" && req.method === "POST") {
      const action = (req.query.action as string) || "inventory"
      if (action === "shipments") {
        const { station_id, item_name, quantity, unit, planned_date } = req.body || {}
        const shipment = { id: `SUP-${Date.now()}`, stationId: station_id, itemName: item_name, quantity: quantity || 0, unit: unit || "units", plannedDate: planned_date || "", status: "planned" as const }
        store.shipments.push(shipment)
        return res.json({ ok: true, id: shipment.id })
      }
    }

    // ── Routes ──
    if (path === "/routes" && req.method === "GET") {
      const legs = STATIONS_DB.map(s => {
        const dist = haversineKm(HQ.lat, HQ.lon, s.latitude, s.longitude)
        return { from: HQ.name, to: s.stationName, from_lat: HQ.lat, from_lon: HQ.lon, to_lat: s.latitude, to_lon: s.longitude, distance_km: Math.round(dist), eta_days: Math.round(dist / (SHIP_SPEED_KNOTS * 1.852 * 24) * 10) / 10, speed_knots: SHIP_SPEED_KNOTS }
      })
      const inter: any[] = []
      for (let i = 0; i < STATIONS_DB.length; i++) {
        for (let j = i + 1; j < STATIONS_DB.length; j++) {
          const a = STATIONS_DB[i], b = STATIONS_DB[j]
          const dist = haversineKm(a.latitude, a.longitude, b.latitude, b.longitude)
          inter.push({ from: a.stationName, to: b.stationName, from_lat: a.latitude, from_lon: a.longitude, to_lat: b.latitude, to_lon: b.longitude, distance_km: Math.round(dist), eta_days: Math.round(dist / (SHIP_SPEED_KNOTS * 1.852 * 24) * 10) / 10 })
        }
      }
      return res.json({ hq: HQ, ship_speed_knots: SHIP_SPEED_KNOTS, legs, inter_station: inter })
    }

    // ── Sea Ice ──
    if (path === "/seaice" && req.method === "GET") {
      const action = (req.query.action as string) || "conditions"
      if (action === "conditions") {
        const stationId = (req.query.station_id as string) || "maitri"
        const now = new Date()
        const seaIce = await getSeaIceExtent()
        const extentKm2 = seaIce?.extent_km2 ?? 17.0
        const iceMult = seaIce ? extentToConcentration(extentKm2) : 0.5
        const k = `${stationId}:wind_speed_kmh`
        if (!store.telemetry.has(k) || store.telemetry.get(k)!.length < 10) generateHistoryBuffer(stationId, 24, "wind_speed_kmh")
        const [, valsWind] = store.getTelemetryPairs(stationId, "wind_speed_kmh", 1000)
        const avgWind = valsWind.length > 0 ? valsWind.reduce((a, b) => a + b, 0) / valsWind.length : 20
        let severity: string, desc: string
        if (iceMult < 0.15) { severity = "minimal"; desc = "Open water, no significant ice obstruction" }
        else if (iceMult < 0.35) { severity = "light"; desc = "Scattered ice floes, navigable with caution" }
        else if (iceMult < 0.55) { severity = "moderate"; desc = "Concentrated ice, icebreaker escort recommended" }
        else if (iceMult < 0.75) { severity = "heavy"; desc = "Dense pack ice, significant navigation delays" }
        else { severity = "extreme"; desc = "Near-maximum ice cover, navigation may be impossible" }
        return res.json({ station_id: stationId, ice_concentration: Math.round(iceMult * 1000) / 1000, ice_concentration_pct: Math.round(iceMult * 100 * 10) / 10, severity, description: desc, avg_wind_kmh: Math.round(avgWind * 10) / 10, day_of_year: now.getMonth() + 1, month: now.getMonth() + 1, real_extent_mkm2: extentKm2, real_extent_date: seaIce?.date_str ?? null, real_anomaly_pct: seaIce?.anomaly_pct ?? null, source: seaIce ? "nsidc" : "cosine_fallback" })
      }
      if (action === "route") {
        const start = req.query.start as string
        const end = req.query.end as string
        if (!start || !end || !(start in WAYPOINTS) || !(end in WAYPOINTS)) return res.status(400).json({ error: `Unknown waypoint. Valid: ${Object.keys(WAYPOINTS).join(", ")}` })
        if (start === end) return res.status(400).json({ error: "Start and end are the same" })
        const seaIce = await getSeaIceExtent()
        const extentKm2 = seaIce?.extent_km2 ?? 17.0
        const iceMult = seaIce ? extentToConcentration(extentKm2) : 0.5
        const [, valsWind] = store.getTelemetryPairs("maitri", "wind_speed_kmh", 1000)
        const avgWind = valsWind.length > 0 ? valsWind.reduce((a, b) => a + b, 0) / valsWind.length : 25
        const result = dijkstra(start, end, iceMult, avgWind)
        result.waypoints = { [start]: WAYPOINTS[start], [end]: WAYPOINTS[end] }
        return res.json(result)
      }
    }

    // ── Simulation ──
    if (path === "/simulation/whatif" && req.method === "POST") {
      const BATTERY_CAPACITY_KWH = 200.0
      const HVAC_SETPOINT_NORMAL = 20.0
      const HVAC_SETPOINT_STRAINED = 15.0
      const COOLING_RATE_NORMAL = 0.15
      const COOLING_RATE_STRAINED = 0.10
      const PASSIVE_HEAT_LOSS = 0.055
      const GEN_FLOAT_CHARGE_PCT = 0.5
      const GEN_DRAIN_PCT = 18.5
      const THERMAL_DEMAND_FACTOR = 0.035
      const body = req.body || {}
      const stationId = body.station_id || "maitri"
      const outdoorTemp = Math.max(-65, Math.min(-10, body.outdoor_temp ?? monthlyOutdoor(stationId)))
      const stormDurationHours = Math.min(120, Math.max(1, body.storm_duration_hours ?? 0)) || 1
      const gensOfflineStart = Math.min(2, Math.max(0, body.generators_offline ?? 0))
      const supplyDelay = Math.max(0, body.supply_delay_days ?? 0)
      const inv = STATION_INVENTORY[stationId] || STATION_INVENTORY.maitri
      const step = stormDurationHours <= 30 ? 3 : 6
      let fuel = inv.fuel
      let batterySoc = inv.battery_soc
      let indoor = HVAC_SETPOINT_NORMAL
      let gensOnline = Math.max(0, 2 - gensOfflineStart)
      const timeline: any[] = []
      const milestones: any[] = []
      const rationingMode = supplyDelay > 7
      const rationingFactor = rationingMode ? 0.7 : 1.0
      for (let h = 0; h <= stormDurationHours; h += step) {
        const inStorm = h > 0 && h <= stormDurationHours
        const coldDelta = inStorm ? Math.abs(outdoorTemp) - 20 : 0
        const thermalMult = 1 + Math.max(0, coldDelta) * THERMAL_DEMAND_FACTOR
        let effBurn = 0
        if (gensOnline >= 2) effBurn = inv.burn_rate * thermalMult * rationingFactor
        else if (gensOnline === 1) effBurn = inv.burn_rate * 1.02 * thermalMult * rationingFactor
        fuel = Math.max(0, fuel - effBurn * step)
        if (fuel <= 0 && gensOnline > 0) gensOnline = 0
        if (gensOnline > 0 && batterySoc < 100) batterySoc = Math.min(100, batterySoc + GEN_FLOAT_CHARGE_PCT * step)
        else if (gensOnline === 0) batterySoc = Math.max(0, batterySoc - GEN_DRAIN_PCT * step)
        let hvacSetpoint = HVAC_SETPOINT_NORMAL
        let coolingRate = COOLING_RATE_NORMAL
        if (gensOnline >= 2) { hvacSetpoint = HVAC_SETPOINT_NORMAL; coolingRate = COOLING_RATE_NORMAL }
        else if (gensOnline === 1) { hvacSetpoint = Math.max(HVAC_SETPOINT_STRAINED, HVAC_SETPOINT_NORMAL - coldDelta * 0.15); coolingRate = COOLING_RATE_STRAINED }
        else { hvacSetpoint = -5; coolingRate = COOLING_RATE_STRAINED * 0.8 }
        const outdoorCurrent = inStorm ? outdoorTemp : outdoorTemp + 5
        if (gensOnline > 0) indoor = indoor + coolingRate * (hvacSetpoint - indoor)
        else indoor = indoor + PASSIVE_HEAT_LOSS * (outdoorCurrent - indoor)
        indoor = Math.max(-10, Math.min(30, indoor))
        const tempScore = Math.max(0, Math.min(1, (indoor - (-5)) / 25))
        const powerScore = batterySoc / 100
        const habitability = Math.max(0, Math.min(100, 0.6 * tempScore * 100 + 0.4 * powerScore * 100))
        const solar = inStorm && outdoorTemp < -40 ? 0 : 3
        const renewablePct = Math.min(100, solar / Math.max(1, effBurn > 0 ? effBurn : 30) * 100)
        timeline.push({ hour: h, fuel_liters: Math.round(fuel), indoor_temp_c: Math.round(indoor * 10) / 10, battery_soc_pct: Math.round(batterySoc * 10) / 10, habitability_pct: Math.round(habitability * 10) / 10, outdoor_temp_c: Math.round(outdoorCurrent * 10) / 10, generators_online: gensOnline, renewable_share_pct: Math.round(renewablePct * 10) / 10 })
        if (fuel <= 0 && !milestones.some(m => m.type === "fuel_exhausted")) milestones.push({ type: "fuel_exhausted", hour: h, severity: "critical", message: "Fuel exhausted — all generators offline" })
        if (batterySoc <= 20 && !milestones.some(m => m.type === "battery_low")) milestones.push({ type: "battery_low", hour: h, severity: "warning", message: `Battery SOC below 20% at hour ${h}` })
        if (batterySoc <= 0 && !milestones.some(m => m.type === "blackout")) milestones.push({ type: "blackout", hour: h, severity: "critical", message: `Total station blackout at hour ${h}` })
        if (indoor <= 0 && !milestones.some(m => m.type === "freeze_breach")) milestones.push({ type: "freeze_breach", hour: h, severity: "critical", message: `Habitat freeze breach (0 C) at hour ${h}` })
      }
      const fuelDays = Math.round((inv.fuel / Math.max(1, inv.burn_rate) / 24) * 10) / 10
      const blackoutAt = milestones.find(m => m.type === "blackout")?.hour
      const freezeAt = milestones.find(m => m.type === "freeze_breach")?.hour
      const fuelExhaustAt = milestones.find(m => m.type === "fuel_exhausted")?.hour
      let riskLevel = "LOW"
      if (fuelExhaustAt != null && fuelExhaustAt <= 24) riskLevel = "CRITICAL"
      else if (blackoutAt != null && blackoutAt <= 24) riskLevel = "CRITICAL"
      else if (blackoutAt != null && blackoutAt <= 72) riskLevel = "HIGH"
      else if (freezeAt != null && freezeAt <= 72) riskLevel = "HIGH"
      else if (fuelDays <= 3) riskLevel = "CRITICAL"
      else if (fuelDays <= 7) riskLevel = "HIGH"
      const actions: string[] = []
      if (gensOfflineStart >= 2) actions.push("IMMEDIATE: Restore generator power — critical life-support systems at risk")
      else if (gensOfflineStart >= 1) actions.push("Load-shed non-essential systems to preserve life-support")
      if (rationingMode) actions.push(`Fuel rationing recommended — ${supplyDelay}-day resupply delay; reducing burn rate 30%`)
      if (supplyDelay > 0 && supplyDelay <= 7) actions.push(`Resupply vessel ETA ${supplyDelay} days — monitor fuel closely`)
      if (outdoorTemp < -50) actions.push("Exterior equipment lockout — preheat fuel lines and hydraulic systems before restart")
      if (batterySoc < 30) actions.push("Reduce battery load to essential comms only")
      if (actions.length === 0) actions.push("Continue monitoring — all systems within operational parameters")
      return res.json({ station_id: stationId, scenario: { outdoor_temp: outdoorTemp, storm_hours: stormDurationHours, generators_offline: gensOfflineStart, supply_delay_days: supplyDelay }, timeline, milestones, risk: { level: riskLevel, fuel_autonomy_days: fuelDays, estimated_blackout_hour: blackoutAt ?? null, estimated_freeze_hour: freezeAt ?? null }, actions })
    }

    // ── Fault ──
    if (path === "/fault" && req.method === "POST") {
      const { station_id, mode } = req.body || {}
      const stationId = station_id || "maitri"
      if (mode && ["storm", "gen_failure", "fuel_low", "hvac_fault"].includes(mode)) {
        store.faultModes[stationId] = mode
        return res.json({ ok: true, station_id: stationId, fault_mode: mode })
      }
      if (mode === null || mode === "reset" || mode === undefined) {
        store.faultModes[stationId] = null
        return res.json({ ok: true, station_id: stationId, fault_mode: null })
      }
      return res.status(400).json({ error: "Invalid mode. Valid: storm, gen_failure, fuel_low, hvac_fault, reset" })
    }

    // ── Weather ──
    if (path === "/weather" && req.method === "GET") {
      const stationId = (req.query.station_id as string) || "maitri"
      const validStations = ["maitri", "bharati", "maitri_ii"]
      if (!validStations.includes(stationId)) return res.status(400).json({ error: "Unknown station" })
      const [weather, ncporData] = await Promise.all([getOpenMeteoWeather(stationId), getNcporStationData(stationId)])
      const ncporTemp = ncporData?.current.temp_C ?? null
      const ncporWind = ncporData?.current.wind_ms !== null ? Math.round(ncporData!.current.wind_ms * 3.6 * 10) / 10 : null
      const ncporPressure = ncporData?.current.pressure_mbar ?? null
      const ncporHumidity = ncporData?.current.humidity_pct ?? null
      const ncporTimestamp = ncporData?.current.timestamp_ms ? new Date(ncporData.current.timestamp_ms).toISOString() : null
      if (weather) {
        const result: any = { ...weather }
        result.temperature_source = ncporTemp !== null ? "ncpor" : "open-meteo"
        if (ncporTemp !== null) result.current.temperature_2m = ncporTemp
        if (ncporWind !== null) result.current.wind_speed_10m = ncporWind
        if (ncporPressure !== null) result.current.pressure = ncporPressure
        if (ncporHumidity !== null) result.current.relative_humidity_2m = Math.round(ncporHumidity)
        result.ncpor = { temp_C: ncporTemp, wind_ms: ncporData?.current.wind_ms ?? null, pressure_mbar: ncporPressure, humidity_pct: ncporHumidity, timestamp: ncporTimestamp }
        return res.json(result)
      }
      const now = new Date()
      const hour = now.getHours()
      const baseTemp = ncporTemp ?? monthlyOutdoor(stationId, now)
      const temp = baseTemp + Math.sin((hour - 12) / 24 * Math.PI * 2) * 3
      const weatherCode = temp < -45 ? 71 : temp < -35 ? 3 : 1
      res.json({ station_id: stationId, station_name: stationId.charAt(0).toUpperCase() + stationId.slice(1), source: "synthetic", temperature_source: ncporTemp !== null ? "ncpor" : "climatology", current: { temperature_2m: Math.round(temp * 10) / 10, wind_speed_10m: ncporWind ?? Math.round(22 + seededRand(hour) * 15 * 10) / 10, relative_humidity_2m: ncporHumidity ? Math.round(ncporHumidity) : Math.round(65 + seededRand(hour + 1) * 20), pressure: ncporPressure ?? Math.round(1000 + seededRand(hour + 2) * 30), weather_code: weatherCode, weather_label: weatherLabel(weatherCode) }, daily: { temperature_2m_max: [Math.round(temp + 5), Math.round(temp + 4), Math.round(temp + 6), Math.round(temp + 3), Math.round(temp + 5), Math.round(temp + 4), Math.round(temp + 6)], temperature_2m_min: [Math.round(temp - 8), Math.round(temp - 7), Math.round(temp - 9), Math.round(temp - 6), Math.round(temp - 8), Math.round(temp - 7), Math.round(temp - 9)] }, ncpor: { temp_C: ncporTemp, wind_ms: ncporData?.current.wind_ms ?? null, pressure_mbar: ncporPressure, humidity_pct: ncporHumidity, timestamp: ncporTimestamp }, note: "Synthetic data — Open-Meteo unreachable" })
      return
    }

    // ── Aurora ──
    if (path === "/aurora" && req.method === "GET") {
      const stationId = (req.query.station_id as string) || "maitri"
      const [aurora, kp] = await Promise.all([getAuroraData(), getKpIndex()])
      return res.json({ station_id: stationId, aurora_probability: aurora?.data?.[stationId] ?? 0, kp_index: kp?.kp_current ?? 0, kp_label: kp?.kp_label ?? "Unknown", observation_time: aurora?.observation_time ?? null, forecast_time: aurora?.forecast_time ?? null, source: "NOAA SWPC OVATION" })
    }

    // ── Catch-all: 404 ──
    return res.status(404).json({ error: `No route: ${path}`, available: ["/health", "/stations", "/telemetry/latest", "/telemetry/history", "/predict/fuel", "/predict/temperature", "/predict/rpm-health", "/predict/anomalies", "/predict/model-accuracy", "/predict/ensemble", "/alerts", "/energy/optimize", "/energy/savings", "/logistics", "/routes", "/seaice", "/simulation/whatif", "/fault", "/weather", "/aurora"] })
  } catch (err: any) {
    console.error(`[api] Error in ${path}:`, err?.message || err)
    return res.status(500).json({ error: err?.message || "Internal error" })
  }
}
