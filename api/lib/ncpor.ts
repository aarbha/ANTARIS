/**
 * NCPOR deep scraper — parses station live pages for 4 real sensor readings.
 * data.ncpor.res.in/maitri/live and /bharati/live contain CanvasJS dataPoints arrays:
 *   Array 1: Temperature °C (hourly, ~25 points)
 *   Array 2: Wind Speed m/s (hourly)
 *   Array 3: Air Pressure mBar (hourly)
 *   Array 4: Relative Humidity % (hourly)
 * 15-minute TTL cache, 5s timeout per page.
 */

const STATION_PAGES: Record<string, string> = {
  maitri: "https://data.ncpor.res.in/maitri/live",
  bharati: "https://data.ncpor.res.in/bharati/live",
}

const DATAPOINTS_RE = /dataPoints\s*:\s*\[(.+?)\]/gs

interface NcporReading {
  temp_C: number | null
  wind_ms: number | null
  pressure_mbar: number | null
  humidity_pct: number | null
  timestamp_ms: number | null
}

interface NcporHistory {
  timestamps: number[]
  temp: number[]
  wind: number[]
  pressure: number[]
  humidity: number[]
}

interface NcporCache {
  current: NcporReading
  history: NcporHistory
  timestamp: number
}

const cache: Record<string, NcporCache> = {}
const CACHE_TTL_MS = 15 * 60 * 1000

function parseDataPointsArray(raw: string): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = []
  const ptRe = /\{\s*x\s*:\s*(\d+)\s*,\s*y\s*:\s*([\-0-9.]+)\s*\}/g
  let m = ptRe.exec(raw)
  while (m) {
    points.push({ x: parseInt(m[1]), y: parseFloat(m[2]) })
    m = ptRe.exec(raw)
  }
  return points
}

function parseStationPage(html: string): NcporHistory | null {
  const matches = [...html.matchAll(DATAPOINTS_RE)]
  if (matches.length < 4) return null

  const tempPoints = parseDataPointsArray(matches[0][1])
  const windPoints = parseDataPointsArray(matches[1][1])
  const pressurePoints = parseDataPointsArray(matches[2][1])
  const humidityPoints = parseDataPointsArray(matches[3][1])

  // All arrays should have same length (hourly); use temp length as baseline
  const len = tempPoints.length
  if (len < 3) return null

  // Align by timestamp (wind/pressure may have slightly different start)
  const timestamps: number[] = []
  const temp: number[] = []
  const wind: number[] = []
  const pressure: number[] = []
  const humidity: number[] = []

  for (let i = 0; i < len; i++) {
    timestamps.push(tempPoints[i].x)
    temp.push(tempPoints[i].y)
    // Find matching wind/pressure/humidity by timestamp
    const wPt = windPoints.find(p => p.x === tempPoints[i].x)
    const pPt = pressurePoints.find(p => p.x === tempPoints[i].x)
    const hPt = humidityPoints.find(p => p.x === tempPoints[i].x)
    wind.push(wPt?.y ?? (i > 0 ? wind[i - 1] : 0))
    pressure.push(pPt?.y ?? (i > 0 ? pressure[i - 1] : 1013))
    humidity.push(hPt?.y ?? (i > 0 ? humidity[i - 1] : 50))
  }

  return { timestamps, temp, wind, pressure, humidity }
}

async function fetchStationPage(url: string): Promise<string | null> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)
    const resp = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; AntarisOps/1.0)" },
    })
    clearTimeout(timeout)
    if (!resp.ok) return null
    return await resp.text()
  } catch {
    return null
  }
}

export async function getNcporStationData(stationId: string): Promise<NcporCache | null> {
  const url = STATION_PAGES[stationId]
  if (!url) return null

  const cached = cache[stationId]
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached
  }

  const html = await fetchStationPage(url)
  if (!html) {
    // Try homepage fallback for temp only (existing logic)
    return null
  }

  const history = parseStationPage(html)
  if (!history) return null

  const lastIdx = history.temp.length - 1
  const current: NcporReading = {
    temp_C: history.temp[lastIdx],
    wind_ms: history.wind[lastIdx],
    pressure_mbar: history.pressure[lastIdx],
    humidity_pct: history.humidity[lastIdx],
    timestamp_ms: history.timestamps[lastIdx],
  }

  const result: NcporCache = { current, history, timestamp: Date.now() }
  cache[stationId] = result
  return result
}

export async function getNcporAllReadings(stationId: string): Promise<NcporReading | null> {
  const data = await getNcporStationData(stationId)
  return data?.current ?? null
}

// Simple homepage parser fallback (used by livetemp.ts chain)
const TEMP_LINE_RE = /Antarctica\s*-\s*(Maitri|Bharati)\s*:\s*([\-0-9.]+)\s*°\s*C/i
const STATION_NAME_MAP: Record<string, string> = { Maitri: "maitri", Bharati: "bharati" }

export async function getNcporTemp(stationId: string): Promise<number | null> {
  // Try station page first (already cached by getNcporStationData)
  const stationData = await getNcporStationData(stationId)
  if (stationData?.current.temp_C !== null && stationData?.current.temp_C !== undefined) {
    return stationData.current.temp_C
  }

  // Fallback: homepage
  if (stationId !== "maitri" && stationId !== "bharati") return null
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)
    const resp = await fetch("https://data.ncpor.res.in", {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; AntarisOps/1.0)" },
    })
    clearTimeout(timeout)
    if (!resp.ok) return null
    const html = await resp.text()
    const match = TEMP_LINE_RE.exec(html)
    if (match) {
      const id = STATION_NAME_MAP[match[1]]
      if (id === stationId) return parseFloat(match[2])
    }
    return null
  } catch {
    return null
  }
}
