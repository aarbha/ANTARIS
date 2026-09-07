import type { VercelRequest, VercelResponse } from "@vercel/node"
import { store } from "../lib/store"
import { generateTelemetry } from "../lib/simulator"
import { UNITS, monthlyOutdoor } from "../lib/data"
import { scoreEnsemble, initEnsembleBaseline } from "../lib/ensemble"
import { FEATURES } from "../lib/data"

const baselineInitialized = new Set<string>()

export default function handler(req: VercelRequest, res: VercelResponse) {
  store.init()
  const stationId = (req.query.station_id as string) || "maitri"

  const values = generateTelemetry(stationId)
  for (const [metric, value] of Object.entries(values)) {
    store.pushTelemetry(stationId, metric, value, UNITS[metric] || "")
  }

  // Initialize ensemble baseline if not done
  if (!baselineInitialized.has(stationId)) {
    // Generate synthetic baseline data
    const baselineData: number[][] = []
    const baseTemp = monthlyOutdoor(stationId)
    for (let i = 0; i < 200; i++) {
      baselineData.push([
        1490 + (Math.random() - 0.5) * 20,  // rpm
        2.5 + Math.random() * 0.5,           // vibration
        baseTemp + (Math.random() - 0.5) * 10,  // outdoor (climatology-based)
        20.5 + (Math.random() - 0.5) * 2,   // indoor
        12800 - i * 0.1,                     // fuel
        1.01 + (Math.random() - 0.5) * 0.04, // hvac
        68 + (Math.random() - 0.5) * 5,     // battery
        22 + (Math.random() - 0.5) * 15,    // wind
      ])
    }
    initEnsembleBaseline(stationId, baselineData)
    baselineInitialized.add(stationId)
  }

  const sample = FEATURES.map(f => values[f as keyof typeof values] ?? 0)
  const result = scoreEnsemble(stationId, sample)

  const alertLevel = result.anomalyScore >= 0.7 ? "critical" : result.anomalyScore >= 0.4 ? "warning" : "normal"

  res.json({
    station_id: stationId,
    anomaly_score: result.anomalyScore,
    alert_level: alertLevel,
    model_breakdown: result.modelBreakdown,
    cusum_details: result.cusumDetails,
    total_votes: result.totalVotes,
    features: FEATURES,
  })
}
