/**
 * ML prediction models — TS port of keyboard/server/ml/predictor.py
 *
 * Four models:
 * 1. FuelPredictor — linear regression → days to fuel depletion
 * 2. TempPredictor — sinusoidal fit → 24h temperature forecast
 * 3. RPMHealthPredictor — EMA + trend → generator health score 0–100
 * 4. AnomalyDetector — z-score ensemble across time windows
 */

import { polyfit, mean, std, rSquared, mape, clamp } from "./utils"

interface PredictionResult {
  predicted: number | null
  confidenceLow: number | null
  confidenceHigh: number | null
  accuracyR2: number | null
  accuracyMape: number | null
  modelName: string
  sampleCount: number
  details: Record<string, any>
}

// ── 1. FuelPredictor — linear regression ──

export function predictFuel(timestamps: number[], fuelLevels: number[]): PredictionResult {
  const modelName = "Linear Regression (Fuel)"
  if (timestamps.length < 3) {
    return { predicted: null, confidenceLow: null, confidenceHigh: null, accuracyR2: null, accuracyMape: null, modelName, sampleCount: timestamps.length, details: {} }
  }

  const timeSpanHours = (timestamps[timestamps.length - 1] - timestamps[0]) / 3600
  if (timeSpanHours < 2 / 60) {
    return { predicted: null, confidenceLow: null, confidenceHigh: null, accuracyR2: null, accuracyMape: null, modelName, sampleCount: timestamps.length, details: { reason: "Insufficient time spread" } }
  }

  const hours = timestamps.map(t => (t - timestamps[0]) / 3600)
  const [slope, intercept] = polyfit(hours, fuelLevels, 1)

  const predictedVals = hours.map(h => slope * h + intercept)
  const r2 = rSquared(fuelLevels, predictedVals)
  const mapeVal = mape(fuelLevels, predictedVals)

  const currentFuel = fuelLevels[fuelLevels.length - 1]
  const daysToDepletion = slope >= 0 ? null : Math.round((-currentFuel / slope / 24) * 10) / 10

  const residualStd = Math.sqrt(
    fuelLevels.reduce((sum, v, i) => sum + (v - predictedVals[i]) ** 2, 0) / Math.max(fuelLevels.length - 2, 1)
  )
  const ciHalf = 1.96 * residualStd

  return {
    predicted: daysToDepletion,
    confidenceLow: daysToDepletion && slope !== 0 ? Math.round((daysToDepletion - ciHalf / Math.abs(slope) / 24) * 10) / 10 : null,
    confidenceHigh: daysToDepletion && slope !== 0 ? Math.round((daysToDepletion + ciHalf / Math.abs(slope) / 24) * 10) / 10 : null,
    accuracyR2: Math.round(Math.max(0, r2) * 10000) / 10000,
    accuracyMape: Math.round(mapeVal * 100) / 100,
    modelName,
    sampleCount: timestamps.length,
    details: {
      burn_rate_L_per_hour: Math.round(-slope * 100) / 100,
      current_fuel_L: Math.round(currentFuel * 10) / 10,
      time_span_hours: Math.round(timeSpanHours * 100) / 100,
      residual_std: Math.round(residualStd * 1000) / 1000,
    },
  }
}

// ── 2. TempPredictor — sinusoidal fit ──

function sinusoidalModel(t: number, amplitude: number, phase: number, offset: number): number {
  return amplitude * Math.sin((2 * Math.PI * t) / 86400 + phase) + offset
}

function fitSinusoidal(times: number[], temps: number[]): { amp: number; phase: number; offset: number } {
  // Simple grid search + gradient refinement for 3 params
  const meanT = mean(temps)
  let bestAmp = 10, bestPhase = 0, bestOffset = meanT
  let bestErr = Infinity

  for (let amp = 2; amp <= 20; amp += 2) {
    for (let phase = 0; phase < 2 * Math.PI; phase += Math.PI / 6) {
      for (let offset = meanT - 10; offset <= meanT + 10; offset += 2) {
        let err = 0
        for (let i = 0; i < times.length; i++) {
          const pred = sinusoidalModel(times[i], amp, phase, offset)
          err += (temps[i] - pred) ** 2
        }
        if (err < bestErr) {
          bestErr = err
          bestAmp = amp
          bestPhase = phase
          bestOffset = offset
        }
      }
    }
  }

  return { amp: bestAmp, phase: bestPhase, offset: bestOffset }
}

export function predictTemperature(timestamps: number[], temps: number[], forecastHours = 24): PredictionResult {
  const modelName = "Sinusoidal Fit (Temperature)"
  if (timestamps.length < 48) {
    return { predicted: null, confidenceLow: null, confidenceHigh: null, accuracyR2: null, accuracyMape: null, modelName, sampleCount: timestamps.length, details: {} }
  }

  const t0 = timestamps[0]
  const t = timestamps.map(ts => ts - t0)

  try {
    const { amp, phase, offset } = fitSinusoidal(t, temps)

    const predictedVals = t.map(ti => sinusoidalModel(ti, amp, phase, offset))
    const r2 = rSquared(temps, predictedVals)
    const mapeVal = mape(temps, predictedVals.map((v, i) => Math.max(0.1, Math.abs(temps[i])) > 0.1 ? temps[i] : v))

    // Forecast next N hours
    const lastT = t[t.length - 1]
    const forecastTimes: number[] = []
    for (let h = 0; h <= forecastHours; h++) forecastTimes.push(lastT + h * 3600)
    const forecast = forecastTimes.map(ft => sinusoidalModel(ft, amp, phase, offset))

    // Confidence from amplitude uncertainty estimate
    const ciHalf = amp * 0.15

    return {
      predicted: Math.round(forecast[forecast.length - 1] * 10) / 10,
      confidenceLow: Math.round((forecast[forecast.length - 1] - ciHalf) * 10) / 10,
      confidenceHigh: Math.round((forecast[forecast.length - 1] + ciHalf) * 10) / 10,
      accuracyR2: Math.round(Math.max(0, r2) * 10000) / 10000,
      accuracyMape: Math.round(mapeVal * 100) / 100,
      modelName,
      sampleCount: timestamps.length,
      details: {
        amplitude_C: Math.round(Math.abs(amp) * 10) / 10,
        period_hours: 24,
        offset_C: Math.round(offset * 10) / 10,
        forecast_24h: forecast.filter((_, i) => i % 6 === 0).map(v => Math.round(v * 10) / 10),
      },
    }
  } catch {
    return { predicted: null, confidenceLow: null, confidenceHigh: null, accuracyR2: null, accuracyMape: null, modelName, sampleCount: timestamps.length, details: { error: "Fit failed" } }
  }
}

// ── 3. RPMHealthPredictor — EMA + trend ──

export function predictRpmHealth(
  timestamps: number[],
  rpmValues: number[],
  vibrationValues?: number[]
): PredictionResult {
  const modelName = "EMA Health Score (RPM)"
  if (timestamps.length < 10) {
    return { predicted: null, confidenceLow: null, confidenceHigh: null, accuracyR2: null, accuracyMape: null, modelName, sampleCount: timestamps.length, details: {} }
  }

  const alpha = 0.3
  const ema = [rpmValues[0]]
  for (let i = 1; i < rpmValues.length; i++) {
    ema.push(alpha * rpmValues[i] + (1 - alpha) * ema[i - 1])
  }

  const quarter = Math.max(Math.floor(ema.length / 4), 1)
  const baselineRpm = median(ema.slice(0, quarter))
  const currentDeviation = Math.abs(ema[ema.length - 1] - baselineRpm)
  const stdDev = std(rpmValues)
  const zScore = currentDeviation / Math.max(stdDev, 1e-9)

  const lastN = Math.max(Math.floor(rpmValues.length / 5), 3)
  const trendX = Array.from({ length: lastN }, (_, i) => i)
  const trendY = rpmValues.slice(-lastN)
  const [trendSlope] = polyfit(trendX, trendY, 1)

  const health = clamp(100 - zScore * 15 - Math.abs(trendSlope) * 5, 0, 100)
  const anomalyProb = clamp(zScore / 4, 0, 1)

  let vibAnomaly: number | null = null
  if (vibrationValues && vibrationValues.length === timestamps.length) {
    const vibMean = mean(vibrationValues)
    const vibMaxRecent = Math.max(...vibrationValues.slice(-lastN))
    vibAnomaly = clamp((vibMaxRecent - vibMean) / Math.max(vibMean, 0.1), 0, 1)
  }

  return {
    predicted: Math.round(health * 10) / 10,
    confidenceLow: Math.round(Math.max(0, health - 10) * 10) / 10,
    confidenceHigh: Math.round(Math.min(100, health + 10) * 10) / 10,
    accuracyR2: null,
    accuracyMape: null,
    modelName,
    sampleCount: timestamps.length,
    details: {
      baseline_rpm: Math.round(baselineRpm * 10) / 10,
      current_rpm: Math.round(ema[ema.length - 1] * 10) / 10,
      deviation: Math.round(currentDeviation * 10) / 10,
      z_score: Math.round(zScore * 100) / 100,
      trend_slope: Math.round(trendSlope * 1000) / 1000,
      anomaly_probability: Math.round(anomalyProb * 1000) / 1000,
      vibration_anomaly: vibAnomaly !== null ? Math.round(vibAnomaly * 1000) / 1000 : null,
    },
  }
}

function median(arr: number[]): number {
  const sorted = [...arr].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

// ── 4. AnomalyDetector — z-score ensemble ──

export function detectAnomalies(
  timestamps: number[],
  values: number[],
  metricName = ""
): {
  anomalies: { index: number; value: number; zShort: number; zLong: number; timestamp: number | null }[]
  metric: string
  mean: number
  std: number
  shortTermMean: number
  modelName: string
  sampleCount: number
  anomalyCount: number
} {
  const modelName = "Z-Score Ensemble (Anomaly)"
  if (values.length < 10) {
    return { anomalies: [], metric: metricName, mean: 0, std: 0, shortTermMean: 0, modelName, sampleCount: values.length, anomalyCount: 0 }
  }

  const shortN = Math.min(200, values.length)
  const shortMean = mean(values.slice(-shortN))
  const shortStd = Math.max(std(values.slice(-shortN)), 1e-9)
  const longMean = mean(values)
  const longStd = Math.max(std(values), 1e-9)

  const anomalies: { index: number; value: number; zShort: number; zLong: number; timestamp: number | null }[] = []

  for (let i = 0; i < values.length; i++) {
    const zShort = Math.abs(values[i] - shortMean) / shortStd
    const zLong = Math.abs(values[i] - longMean) / longStd
    if (zShort > 3.0 || zLong > 3.5) {
      anomalies.push({
        index: i,
        value: Math.round(values[i] * 100) / 100,
        zShort: Math.round(zShort * 100) / 100,
        zLong: Math.round(zLong * 100) / 100,
        timestamp: timestamps[i] || null,
      })
    }
  }

  return {
    anomalies: anomalies.slice(-10),
    metric: metricName,
    mean: Math.round(longMean * 100) / 100,
    std: Math.round(longStd * 100) / 100,
    shortTermMean: Math.round(shortMean * 100) / 100,
    modelName,
    sampleCount: values.length,
    anomalyCount: anomalies.length,
  }
}
