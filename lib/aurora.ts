/**
 * NOAA SWPC aurora data — OVATION model + Kp index.
 * Ovation: https://services.swpc.noaa.gov/json/ovation_aurora_latest.json
 *   Format: { "coordinates": [[lon, lat, aurora_intensity], ...], "Observation Time": ... }
 *   Grid: 0.5° lon × 1° lat, global. Values: aurora intensity 0-100.
 * Kp: https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json
 * 30-minute cache for ovation, 10-minute for Kp.
 */

const OVATION_URL = "https://services.swpc.noaa.gov/json/ovation_aurora_latest.json"
const KP_URL = "https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json"
const OVATION_CACHE_MS = 30 * 60 * 1000
const KP_CACHE_MS = 10 * 60 * 1000

interface AuroraCache {
  data: Record<string, number>  // stationId → probability 0-100
  observation_time: string
  forecast_time: string
  timestamp: number
}

interface KpCache {
  kp_current: number
  kp_label: string
  timestamp: number
}

let auroraCache: AuroraCache | null = null
let kpCache: KpCache | null = null

const STATION_COORDS: Record<string, { lat: number; lon: number }> = {
  maitri:    { lat: -70.7668, lon: 11.7308 },
  bharati:   { lat: -69.4068, lon: 76.1953 },
  maitri_ii: { lat: -70.76, lon: 11.73 },
}

function findNearestAurora(
  coordinates: [number, number, number][],
  targetLat: number,
  targetLon: number,
): number {
  let minDist = Infinity
  let bestVal = 0

  // Ovation grid is large (65k points); brute-force nearest is fine (fast)
  for (let i = 0; i < coordinates.length; i++) {
    const [lon, lat, aurora] = coordinates[i]
    // Only search southern hemisphere
    if (lat > -10) continue
    const dlat = lat - targetLat
    const dlon = lon - targetLon
    const dist = dlat * dlat + dlon * dlon
    if (dist < minDist) {
      minDist = dist
      bestVal = aurora
    }
  }
  return bestVal
}

export async function getAuroraData(): Promise<AuroraCache | null> {
  if (auroraCache && Date.now() - auroraCache.timestamp < OVATION_CACHE_MS) {
    return auroraCache
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)
    const resp = await fetch(OVATION_URL, { signal: controller.signal })
    clearTimeout(timeout)

    if (!resp.ok) return auroraCache

    const json = await resp.json()
    const coordinates = json["coordinates"] || []
    const obsTime = json["Observation Time"] || ""
    const fcstTime = json["Forecast Time"] || ""

    const data: Record<string, number> = {}
    for (const [id, coords] of Object.entries(STATION_COORDS)) {
      data[id] = Math.round(findNearestAurora(coordinates, coords.lat, coords.lon) * 10) / 10
    }

    auroraCache = { data, observation_time: obsTime, forecast_time: fcstTime, timestamp: Date.now() }
    return auroraCache
  } catch {
    return auroraCache
  }
}

function kpLabel(kp: number): string {
  if (kp < 4) return "Quiet"
  if (kp < 5) return "Active"
  if (kp < 6) return "Minor storm (G1)"
  if (kp < 7) return "Moderate storm (G2)"
  if (kp < 8) return "Strong storm (G3)"
  if (kp < 9) return "Severe storm (G4)"
  return "Extreme storm (G5)"
}

export async function getKpIndex(): Promise<KpCache | null> {
  if (kpCache && Date.now() - kpCache.timestamp < KP_CACHE_MS) {
    return kpCache
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)
    const resp = await fetch(KP_URL, { signal: controller.signal })
    clearTimeout(timeout)

    if (!resp.ok) return kpCache

    const json = await resp.json()
    // Format: [{time_tag: ..., kp_index: "3", ...}, ...] — last entry is most recent
    const latest = json[json.length - 1]
    const kp = parseFloat(latest?.kp_index ?? "0")

    kpCache = {
      kp_current: kp,
      kp_label: kpLabel(kp),
      timestamp: Date.now(),
    }
    return kpCache
  } catch {
    return kpCache
  }
}

export async function getAuroraForStation(stationId: string): Promise<{ probability: number; kp: number; kp_label: string } | null> {
  const [aurora, kp] = await Promise.all([getAuroraData(), getKpIndex()])
  if (!aurora) return null
  return {
    probability: aurora.data[stationId] ?? 0,
    kp: kp?.kp_current ?? 0,
    kp_label: kp?.kp_label ?? "Unknown",
  }
}
