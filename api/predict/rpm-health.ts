import type { VercelRequest, VercelResponse } from "@vercel/node"
import { store } from "../lib/store"
import { generateTelemetry, generateHistoryBuffer } from "../lib/simulator"
import { UNITS } from "../lib/data"
import { predictRpmHealth } from "../lib/predictor"

export default function handler(req: VercelRequest, res: VercelResponse) {
  store.init()
  const stationId = (req.query.station_id as string) || "maitri"

  for (const m of ["generator_rpm", "vibration_level"]) {
    const k = `${stationId}:${m}`
    if (!store.telemetry.has(k) || store.telemetry.get(k)!.length < 100) {
      generateHistoryBuffer(stationId, 48, m)
    }
  }

  const values = generateTelemetry(stationId)
  for (const [metric, value] of Object.entries(values)) {
    store.pushTelemetry(stationId, metric, value, UNITS[metric] || "")
  }

  const [tsRpm, valsRpm] = store.getTelemetryPairs(stationId, "generator_rpm", 5000)
  const [, valsVib] = store.getTelemetryPairs(stationId, "vibration_level", 5000)
  const vibValues = valsVib.length === tsRpm.length ? valsVib : undefined
  const result = predictRpmHealth(tsRpm, valsRpm, vibValues)

  res.json({
    station_id: stationId,
    health_score: result.predicted,
    confidence: { low: result.confidenceLow, high: result.confidenceHigh },
    model: result.modelName,
    samples: result.sampleCount,
    details: result.details,
  })
}
