import type { VercelRequest, VercelResponse } from "@vercel/node"
import { store } from "../lib/store"
import { generateTelemetry, generateHistoryBuffer } from "../lib/simulator"
import { UNITS } from "../lib/data"
import { predictFuel } from "../lib/predictor"

export default function handler(req: VercelRequest, res: VercelResponse) {
  store.init()
  const stationId = (req.query.station_id as string) || "maitri"

  const key = `${stationId}:fuel_level_liters`
  if (!store.telemetry.has(key) || store.telemetry.get(key)!.length < 100) {
    generateHistoryBuffer(stationId, 168, "fuel_level_liters")
  }

  const values = generateTelemetry(stationId)
  for (const [metric, value] of Object.entries(values)) {
    store.pushTelemetry(stationId, metric, value, UNITS[metric] || "")
  }

  const [timestamps, fuelLevels] = store.getTelemetryPairs(stationId, "fuel_level_liters", 5000)
  const result = predictFuel(timestamps, fuelLevels)

  res.json({
    station_id: stationId,
    days_to_depletion: result.predicted,
    confidence: { low: result.confidenceLow, high: result.confidenceHigh },
    accuracy: { r2: result.accuracyR2, mape: result.accuracyMape },
    model: result.modelName,
    samples: result.sampleCount,
    details: result.details,
  })
}
