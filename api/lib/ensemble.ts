/**
 * CUSUM ensemble anomaly detector — TS port of keyboard/server/ml/ensemble.py
 * Deterministic (no sklearn needed): z-score + per-feature CUSUM.
 */

import { FEATURES } from "./data"
import { mean, std, sigmoid } from "./utils"

const CUSUM_THRESHOLD = 4.0
const CUSUM_DRIFT = 0.5
const ENSEMBLE_WEIGHTS = { cusum: 0.25, zscore: 0.75 }
const ALERT_SCORE_THRESHOLD = 0.70

class CUSUMTracker {
  posAcc = 0
  negAcc = 0
  mu = 0
  sigma = 1

  updateBaseline(values: number[]) {
    this.mu = mean(values)
    this.sigma = Math.max(std(values), 1e-9)
  }

  score(value: number): { stat: number; alert: boolean } {
    const z = (value - this.mu) / this.sigma
    this.posAcc = Math.max(0, this.posAcc + z - CUSUM_DRIFT)
    this.negAcc = Math.max(0, this.negAcc - z - CUSUM_DRIFT)
    const stat = Math.max(this.posAcc, this.negAcc)
    const alert = stat >= CUSUM_THRESHOLD
    if (alert) {
      this.posAcc = 0
      this.negAcc = 0
    }
    return { stat, alert }
  }
}

interface EnsembleResult {
  anomalyScore: number
  alert: boolean
  modelBreakdown: {
    cusum: { score: number; vote: boolean; weight: number }
    zscore: { score: number; vote: boolean; weight: number }
  }
  totalVotes: number
  cusumDetails: Record<string, { stat: number; alert: boolean }>
}

const trackerCache = new Map<string, CUSUMTracker[]>()

function getTrackers(stationId: string): CUSUMTracker[] {
  if (!trackerCache.has(stationId)) {
    trackerCache.set(stationId, FEATURES.map(() => new CUSUMTracker()))
  }
  return trackerCache.get(stationId)!
}

export function initEnsembleBaseline(stationId: string, data: number[][]): void {
  const trackers = getTrackers(stationId)
  for (let i = 0; i < FEATURES.length; i++) {
    const col = data.map(row => row[i])
    trackers[i].updateBaseline(col)
  }
}

export function scoreEnsemble(
  stationId: string,
  sample: number[]
): EnsembleResult {
  const trackers = getTrackers(stationId)

  // Z-score anomaly detection
  const zScores = sample.map((v, i) => {
    const t = trackers[i]
    return Math.abs((v - t.mu) / t.sigma)
  })
  const maxZ = Math.max(...zScores)
  const zScore = clamp(sigmoid(maxZ - 3) * 2, 0, 1)
  const zVote = zScore >= 0.5 ? 1 : 0

  // CUSUM
  let cusumMax = 0
  let alertsFired = 0
  const cusumDetails: Record<string, { stat: number; alert: boolean }> = {}

  for (let i = 0; i < FEATURES.length; i++) {
    const { stat, alert } = trackers[i].score(sample[i])
    cusumDetails[FEATURES[i]] = { stat: Math.round(stat * 1000) / 1000, alert }
    if (stat > cusumMax) cusumMax = stat
    if (alert) alertsFired++
  }
  const cusumScore = clamp(cusumMax / CUSUM_THRESHOLD, 0, 1)
  const cusumVote = alertsFired > 0 ? 1 : 0

  const composite = clamp(
    ENSEMBLE_WEIGHTS.cusum * cusumScore + ENSEMBLE_WEIGHTS.zscore * zScore,
    0, 1
  )
  const totalVotes = cusumVote + zVote
  const alert = composite >= ALERT_SCORE_THRESHOLD || totalVotes >= 2

  return {
    anomalyScore: Math.round(composite * 10000) / 10000,
    alert,
    modelBreakdown: {
      cusum: { score: Math.round(cusumScore * 10000) / 10000, vote: cusumVote === 1, weight: ENSEMBLE_WEIGHTS.cusum },
      zscore: { score: Math.round(zScore * 10000) / 10000, vote: zVote === 1, weight: ENSEMBLE_WEIGHTS.zscore },
    },
    totalVotes,
    cusumDetails,
  }
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
}
