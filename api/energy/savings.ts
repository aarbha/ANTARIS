import type { VercelRequest, VercelResponse } from "@vercel/node"
import { store } from "../lib/store"
import { generateTelemetry, generateHistoryBuffer } from "../lib/simulator"
import { STATION_PARAMS, UNITS } from "../lib/data"

export default function handler(req: VercelRequest, res: VercelResponse) {
  store.init()
  const stationId = (req.query.station_id as string) || "maitri"
  const params = STATION_PARAMS[stationId]
  if (!params) return res.status(400).json({ error: `Unknown station: ${stationId}` })

  for (const m of ["solar_output_kw", "wind_output_kw", "fuel_level_liters"]) {
    const k = `${stationId}:${m}`
    if (!store.telemetry.has(k) || store.telemetry.get(k)!.length < 10) {
      generateHistoryBuffer(stationId, 168, m)
    }
  }

  const values = generateTelemetry(stationId)
  for (const [metric, value] of Object.entries(values)) {
    store.pushTelemetry(stationId, metric, value, UNITS[metric] || "")
  }

  const [, valsSolar] = store.getTelemetryPairs(stationId, "solar_output_kw", 1000)
  const [, valsWind] = store.getTelemetryPairs(stationId, "wind_output_kw", 1000)

  const avgSolar = valsSolar.length > 0 ? valsSolar.reduce((a, b) => a + b, 0) / valsSolar.length : 0
  const avgWind = valsWind.length > 0 ? valsWind.reduce((a, b) => a + b, 0) / valsWind.length : 0

  const renewableOffsetPct = Math.min(30, (avgSolar + avgWind) / 40 * 100)
  const annualOptimized = params.annual_fuel_gallons * (1 - renewableOffsetPct / 100)
  const annualSaved = params.annual_fuel_gallons - annualOptimized

  res.json({
    station_id: stationId,
    annual_baseline_gallons: Math.round(params.annual_fuel_gallons),
    annual_optimized_gallons: Math.round(annualOptimized),
    annual_saved_gallons: Math.round(annualSaved),
    annual_co2_saved_kg: Math.round(annualSaved * 2.68),
    annual_money_saved_usd: Math.round(annualSaved * params.fuel_cost_usd_per_gal),
    renewable_offset_pct: Math.round(renewableOffsetPct * 10) / 10,
    avg_solar_kw: Math.round(avgSolar * 100) / 100,
    avg_wind_kw: Math.round(avgWind * 100) / 100,
    note: "Savings from renewable offset only. Intelligent scheduling adds ~9.6%.",
  })
}
