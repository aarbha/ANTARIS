import type { VercelRequest, VercelResponse } from "@vercel/node"
import { store } from "../lib/store"
import { generateTelemetry, generateHistoryBuffer } from "../lib/simulator"
import { STATION_PARAMS, UNITS } from "../lib/data"

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

export default function handler(req: VercelRequest, res: VercelResponse) {
  store.init()
  const stationId = (req.query.station_id as string) || "maitri"
  const season = (req.query.season as string) || "current"

  const params = STATION_PARAMS[stationId]
  if (!params) return res.status(400).json({ error: `Unknown station: ${stationId}` })

  const key = `${stationId}:wind_speed_kmh`
  if (!store.telemetry.has(key) || store.telemetry.get(key)!.length < 10) {
    generateHistoryBuffer(stationId, 24, "wind_speed_kmh")
  }
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

    schedule.push({
      hour, load_kw: Math.round(load * 10) / 10, solar_kw: Math.round(solar * 100) / 100,
      wind_kw: Math.round(wind * 100) / 100, wind_speed_kmh: Math.round(windSpeed * 10) / 10,
      renewable_total_kw: Math.round(renewableKw * 100) / 100,
      deficit_kw: Math.round(deficit * 10) / 10, diesel_kw: Math.round(dieselKwNeeded * 10) / 10,
      diesel_gallons: Math.round(dieselGal * 100) / 100,
      renewable_share_pct: Math.round(renewablePct * 10) / 10,
      recommendation: renewableKw >= load ? "RENEWABLE" : dieselKwNeeded > 0 ? "DIESEL" : "STANDBY",
    })

    if (dieselKwNeeded > 0) dieselHours++
    else renewableHours++
    totalFuelBaseline += load / params.fuel_efficiency_kwh_per_gal
    totalFuelOptimized += dieselGal
  }

  const fuelSaved = totalFuelBaseline - totalFuelOptimized

  res.json({
    station_id: stationId,
    schedule,
    summary: {
      diesel_hours: dieselHours, renewable_hours: renewableHours,
      fuel_baseline_gallons: Math.round(totalFuelBaseline * 10) / 10,
      fuel_optimized_gallons: Math.round(totalFuelOptimized * 10) / 10,
      fuel_saved_gallons: Math.round(fuelSaved * 10) / 10,
      co2_saved_kg: Math.round(fuelSaved * 2.68 * 10) / 10,
      money_saved_usd: Math.round(fuelSaved * params.fuel_cost_usd_per_gal * 100) / 100,
      renewable_share_pct: Math.round(renewableHours / 24 * 100 * 10) / 10,
    },
  })
}
