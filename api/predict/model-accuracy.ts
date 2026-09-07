import type { VercelRequest, VercelResponse } from "@vercel/node"
import { store } from "../lib/store"
import { generateTelemetry, generateHistoryBuffer } from "../lib/simulator"
import { UNITS, monthlyOutdoor } from "../lib/data"
import { predictFuel, predictTemperature, predictRpmHealth } from "../lib/predictor"
import { getLiveOutdoorTemp } from "../lib/livetemp"

const STATIONS = ["maitri", "bharati"]

export default async function handler(req: VercelRequest, res: VercelResponse) {
  store.init()
  const results = []

  for (const stationId of STATIONS) {
    for (const m of ["fuel_level_liters", "outdoor_temp", "generator_rpm", "vibration_level"]) {
      const k = `${stationId}:${m}`
      if (!store.telemetry.has(k) || store.telemetry.get(k)!.length < 100) {
        generateHistoryBuffer(stationId, 168, m)
      }
    }

    const { temp: liveTemp, source } = await getLiveOutdoorTemp(stationId)
    const anchor = liveTemp ?? monthlyOutdoor(stationId)
    const values = generateTelemetry(stationId, { outdoorOverride: anchor })
    for (const [metric, value] of Object.entries(values)) {
      store.pushTelemetry(stationId, metric, value, UNITS[metric] || "")
    }

    const [tsFuel, valsFuel] = store.getTelemetryPairs(stationId, "fuel_level_liters", 5000)
    const fuelR = predictFuel(tsFuel, valsFuel)

    const [tsTemp, valsTemp] = store.getTelemetryPairs(stationId, "outdoor_temp", 5000)
    const tempR = predictTemperature(tsTemp, valsTemp, 24)

    const [tsRpm, valsRpm] = store.getTelemetryPairs(stationId, "generator_rpm", 5000)
    const [, valsVib] = store.getTelemetryPairs(stationId, "vibration_level", 5000)
    const rpmR = predictRpmHealth(tsRpm, valsRpm, valsVib.length === tsRpm.length ? valsVib : undefined)

    results.push({
      station_id: stationId,
      fuel: { model: fuelR.modelName, r2: fuelR.accuracyR2, mape: fuelR.accuracyMape, samples: fuelR.sampleCount },
      temperature: { model: tempR.modelName, r2: tempR.accuracyR2, mape: tempR.accuracyMape, samples: tempR.sampleCount },
      rpm_health: { model: rpmR.modelName, health_score: rpmR.predicted, samples: rpmR.sampleCount },
      temperature_source: source,
    })
  }

  res.json(results)
}
