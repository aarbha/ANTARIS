import type { VercelRequest, VercelResponse } from "@vercel/node"
import { store } from "../lib/store"
import { generateTelemetry, generateHistoryBuffer } from "../lib/simulator"
import { UNITS, monthlyOutdoor } from "../lib/data"
import { predictTemperature } from "../lib/predictor"
import { getLiveOutdoorTemp } from "../lib/livetemp"

export default async function handler(req: VercelRequest, res: VercelResponse) {
  store.init()
  const stationId = (req.query.station_id as string) || "maitri"

  // Get live outdoor temp to anchor history
  const { temp: liveTemp, source } = await getLiveOutdoorTemp(stationId)
  const anchor = liveTemp ?? monthlyOutdoor(stationId)

  const key = `${stationId}:outdoor_temp`
  if (!store.telemetry.has(key) || store.telemetry.get(key)!.length < 100) {
    generateHistoryBuffer(stationId, 72, "outdoor_temp")
  }

  const values = generateTelemetry(stationId, { outdoorOverride: anchor })
  for (const [metric, value] of Object.entries(values)) {
    store.pushTelemetry(stationId, metric, value, UNITS[metric] || "")
  }

  const [timestamps, temps] = store.getTelemetryPairs(stationId, "outdoor_temp", 5000)
  const result = predictTemperature(timestamps, temps, 24)

  res.json({
    station_id: stationId,
    forecast_24h: result.predicted,
    confidence: { low: result.confidenceLow, high: result.confidenceHigh },
    accuracy: { r2: result.accuracyR2, mape: result.accuracyMape },
    model: result.modelName,
    samples: result.sampleCount,
    details: result.details,
    current_temp: anchor,
    temperature_source: source,
  })
}
