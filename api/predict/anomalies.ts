import type { VercelRequest, VercelResponse } from "@vercel/node"
import { store } from "../lib/store"
import { generateTelemetry, generateHistoryBuffer } from "../lib/simulator"
import { UNITS } from "../lib/data"
import { detectAnomalies } from "../lib/predictor"

export default function handler(req: VercelRequest, res: VercelResponse) {
  store.init()
  const stationId = (req.query.station_id as string) || "maitri"
  const metric = (req.query.metric as string) || "generator_rpm"

  const k = `${stationId}:${metric}`
  if (!store.telemetry.has(k) || store.telemetry.get(k)!.length < 100) {
    generateHistoryBuffer(stationId, 48, metric)
  }

  const values = generateTelemetry(stationId)
  for (const [m, value] of Object.entries(values)) {
    store.pushTelemetry(stationId, m, value, UNITS[m] || "")
  }

  const [timestamps, vals] = store.getTelemetryPairs(stationId, metric, 5000)
  const result = detectAnomalies(timestamps, vals, metric)

  res.json({
    station_id: stationId,
    anomalies: result.anomalies,
    mean: result.mean,
    std: result.std,
    model: result.modelName,
    samples: result.sampleCount,
    anomaly_count: result.anomalyCount,
  })
}
