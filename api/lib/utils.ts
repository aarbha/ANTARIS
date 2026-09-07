export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371.0
  const p1 = (lat1 * Math.PI) / 180
  const p2 = (lat2 * Math.PI) / 180
  const dp = ((lat2 - lat1) * Math.PI) / 180
  const dl = ((lon2 - lon1) * Math.PI) / 180
  const a = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}

export function sigmoid(x: number): number {
  return x >= 0 ? 1 / (1 + Math.exp(-x)) : Math.exp(x) / (1 + Math.exp(x))
}

export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val))
}

export function mean(arr: number[]): number {
  if (arr.length === 0) return 0
  return arr.reduce((a, b) => a + b, 0) / arr.length
}

export function std(arr: number[]): number {
  if (arr.length === 0) return 0
  const m = mean(arr)
  const variance = arr.reduce((sum, v) => sum + (v - m) ** 2, 0) / arr.length
  return Math.sqrt(variance)
}

export function median(arr: number[]): number {
  const sorted = [...arr].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

export function polyfit(xs: number[], ys: number[], degree: number): number[] {
  // Simple least-squares for degree 1 (linear)
  if (degree !== 1 || xs.length < 2) return [0, mean(ys)]
  const n = xs.length
  const sumX = xs.reduce((a, b) => a + b, 0)
  const sumY = ys.reduce((a, b) => a + b, 0)
  const sumXY = xs.reduce((a, x, i) => a + x * ys[i], 0)
  const sumX2 = xs.reduce((a, x) => a + x * x, 0)
  const denom = n * sumX2 - sumX * sumX
  if (Math.abs(denom) < 1e-12) return [0, mean(ys)]
  const slope = (n * sumXY - sumX * sumY) / denom
  const intercept = (sumY - slope * sumX) / n
  return [slope, intercept]
}

export function rSquared(actual: number[], predicted: number[]): number {
  const m = mean(actual)
  const ssRes = actual.reduce((sum, v, i) => sum + (v - predicted[i]) ** 2, 0)
  const ssTot = actual.reduce((sum, v) => sum + (v - m) ** 2, 0)
  return ssTot > 0 ? Math.max(0, 1 - ssRes / ssTot) : 0
}

export function mape(actual: number[], predicted: number[]): number {
  let sum = 0
  let count = 0
  for (let i = 0; i < actual.length; i++) {
    if (Math.abs(actual[i]) > 0.1) {
      sum += Math.abs((actual[i] - predicted[i]) / actual[i])
      count++
    }
  }
  return count > 0 ? (sum / count) * 100 : 0
}
