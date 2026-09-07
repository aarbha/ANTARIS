import type { VercelRequest, VercelResponse } from "@vercel/node"
import { store } from "../lib/store"
import { generateHistoryBuffer } from "../lib/simulator"

export default function handler(req: VercelRequest, res: VercelResponse) {
  store.init()
  const stationId = (req.query.station as string) || "maitri"
  const metric = (req.query.metric as string) || "outdoor_temp"
  const hours = parseInt(req.query.hours as string) || 48

  // Ensure history buffer exists
  const key = `${stationId}:${metric}`
  if (!store.telemetry.has(key) || store.telemetry.get(key)!.length < 100) {
    generateHistoryBuffer(stationId, hours, metric)
  }

  const rows = store.getTelemetryHistory(stationId, metric, 5000)
  res.json(rows)
}
