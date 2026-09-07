/**
 * NSIDC Sea Ice Index — real Antarctic sea ice extent data.
 * Fetches daily CSV: https://noaadata.apps.nsidc.org/NOAA/G02135/south/daily/data/S_seaice_extent_daily_v4.0.csv
 * 60-minute in-memory cache, 15s timeout. Parses latest row → extent in million km².
 */

const NSIDC_URL = "https://noaadata.apps.nsidc.org/NOAA/G02135/south/daily/data/S_seaice_extent_daily_v4.0.csv"
const CACHE_TTL_MS = 60 * 60 * 1000

interface SeaIceCache {
  extent_km2: number
  year: number
  month: number
  day: number
  date_str: string
  anomaly_pct: number | null  // vs climatological mean (if available)
  timestamp: number
}

let cache: SeaIceCache | null = null

// Simple Antarctic sea ice climatology (monthly mean extent in million km², 1981-2010)
// Source: NSIDC Sea Ice Index climatology
const CLIMATOLOGY_MONTHLY: Record<number, number> = {
  1: 3.9, 2: 2.8, 3: 4.1, 4: 6.2, 5: 9.3, 6: 12.2,
  7: 14.7, 8: 16.4, 9: 17.6, 10: 17.0, 11: 12.6, 12: 6.2,
}

function parseCsvTail(csvText: string): SeaIceCache | null {
  const lines = csvText.trim().split(/\r?\n/)
  // Find header to determine column positions
  const headerIdx = lines.findIndex(l => l.includes("Year"))
  if (headerIdx < 0) return null

  const header = lines[headerIdx]
  const cols = header.split(",").map(c => c.trim().toLowerCase())
  const yearCol = cols.indexOf("year")
  const monthCol = cols.indexOf("month")
  const dayCol = cols.indexOf("day")
  const extentCol = cols.findIndex(c => c.includes("extent"))
  if (yearCol < 0 || monthCol < 0 || dayCol < 0 || extentCol < 0) return null

  // Get the last non-empty data line (most recent observation)
  for (let i = lines.length - 1; i > headerIdx; i--) {
    const line = lines[i].trim()
    if (!line || line.startsWith("#") || line.startsWith("Year")) continue
    const parts = line.split(",").map(p => p.trim())
    if (parts.length <= extentCol) continue
    const year = parseInt(parts[yearCol])
    const month = parseInt(parts[monthCol])
    const day = parseInt(parts[dayCol])
    const extent = parseFloat(parts[extentCol])
    if (isNaN(year) || isNaN(extent)) continue

    const climo = CLIMATOLOGY_MONTHLY[month] ?? null
    const anomaly = climo ? Math.round(((extent - climo) / climo) * 1000) / 10 : null

    return {
      extent_km2: Math.round(extent * 1000) / 1000,
      year, month, day,
      date_str: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      anomaly_pct: anomaly,
      timestamp: Date.now(),
    }
  }
  return null
}

export async function getSeaIceExtent(): Promise<SeaIceCache | null> {
  if (cache && Date.now() - cache.timestamp < CACHE_TTL_MS) {
    return cache
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)
    const resp = await fetch(NSIDC_URL, { signal: controller.signal })
    clearTimeout(timeout)

    if (!resp.ok) {
      return cache  // Return stale cache on error
    }

    const csv = await resp.text()
    const result = parseCsvTail(csv)
    if (result) {
      cache = result
    }
    return result
  } catch {
    return cache  // Return stale cache on network error
  }
}

/**
 * Derive a sea-ice concentration multiplier (0-1) from the real extent.
 * September maximum ≈ 17.6M km² → concentration ~1.0
 * February minimum ≈ 2.8M km² → concentration ~0.05
 */
export function extentToConcentration(extentKm2: number): number {
  // Normalize: 0M km² → 0, 18M km² → 1.0
  return Math.max(0, Math.min(1, extentKm2 / 18))
}
