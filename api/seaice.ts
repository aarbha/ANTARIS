import type { VercelRequest, VercelResponse } from "@vercel/node"
import { store } from "./lib/store"
import { generateTelemetry, generateHistoryBuffer } from "./lib/simulator"
import { UNITS, WAYPOINTS, ROUTE_EDGES } from "./lib/data"
import { haversineKm } from "./lib/utils"
import { getSeaIceExtent, extentToConcentration } from "./lib/seaicedata"

function windPenalty(windSpeed: number): number {
  if (windSpeed < 15) return 1
  if (windSpeed < 40) return 1 + (windSpeed - 15) * 0.01
  if (windSpeed < 70) return 1.25 + (windSpeed - 40) * 0.02
  return Math.min(2.5, 1.85 + (windSpeed - 70) * 0.03)
}

function dijkstra(start: string, end: string, iceMult: number, windSpeed: number) {
  const adj: Record<string, [string, number, number, number][]> = {}
  for (const [a, b, baseDist] of ROUTE_EDGES) {
    const isCoastal = (a === "maitri" || a === "bharati") && (b === "maitri" || b === "bharati")
    const coastalMult = 1 + (isCoastal ? iceMult * 0.4 : 0)
    const windPen = windPenalty(windSpeed)
    const weight = baseDist * coastalMult * windPen
    if (!adj[a]) adj[a] = []
    if (!adj[b]) adj[b] = []
    adj[a].push([b, weight, baseDist, coastalMult])
    adj[b].push([a, weight, baseDist, coastalMult])
  }

  const dist: Record<string, number> = { [start]: 0 }
  const prev: Record<string, [string, number, number, number]> = {}
  const visited = new Set<string>()
  const pq: [number, string][] = [[0, start]]

  while (pq.length > 0) {
    pq.sort((a, b) => a[0] - b[0])
    const [d, u] = pq.shift()!
    if (visited.has(u)) continue
    visited.add(u)
    for (const [v, w, base, cm] of adj[u] || []) {
      const nd = d + w
      if (!(v in dist) || nd < dist[v]) {
        dist[v] = nd
        prev[v] = [u, w, base, cm]
        pq.push([nd, v])
      }
    }
  }

  const path: any[] = []
  let node = end
  while (node in prev) {
    const [via, w, base, cm] = prev[node]
    path.unshift({ from: via, to: node, adjusted_km: Math.round(w), base_km: base, ice_factor: Math.round(cm * 100) / 100 })
    node = via
  }

  const totalKm = Math.round(dist[end] || Infinity)
  const etaHours = totalKm / (14 * 1.852)

  return {
    start, end, path,
    total_adjusted_km: totalKm,
    eta_days: Math.round(etaHours / 24 * 10) / 10,
    ice_concentration: Math.round(iceMult * 100) / 100,
    wind_speed_kmh: Math.round(windSpeed * 10) / 10,
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  store.init()
  const action = (req.query.action as string) || "conditions"

  if (action === "conditions") {
    const stationId = (req.query.station_id as string) || "maitri"
    const now = new Date()

    // Get real sea ice extent from NSIDC
    const seaIce = await getSeaIceExtent()
    const extentKm2 = seaIce?.extent_km2 ?? 17.0
    const iceMult = seaIce ? extentToConcentration(extentKm2) : 0.5

    const k = `${stationId}:wind_speed_kmh`
    if (!store.telemetry.has(k) || store.telemetry.get(k)!.length < 10) {
      generateHistoryBuffer(stationId, 24, "wind_speed_kmh")
    }
    const [, valsWind] = store.getTelemetryPairs(stationId, "wind_speed_kmh", 1000)
    const avgWind = valsWind.length > 0 ? valsWind.reduce((a, b) => a + b, 0) / valsWind.length : 20

    let severity: string, desc: string
    if (iceMult < 0.15) { severity = "minimal"; desc = "Open water, no significant ice obstruction" }
    else if (iceMult < 0.35) { severity = "light"; desc = "Scattered ice floes, navigable with caution" }
    else if (iceMult < 0.55) { severity = "moderate"; desc = "Concentrated ice, icebreaker escort recommended" }
    else if (iceMult < 0.75) { severity = "heavy"; desc = "Dense pack ice, significant navigation delays" }
    else { severity = "extreme"; desc = "Near-maximum ice cover, navigation may be impossible" }

    return res.json({
      station_id: stationId,
      ice_concentration: Math.round(iceMult * 1000) / 1000,
      ice_concentration_pct: Math.round(iceMult * 100 * 10) / 10,
      severity, description: desc,
      avg_wind_kmh: Math.round(avgWind * 10) / 10,
      day_of_year: now.getMonth() + 1,
      month: now.getMonth() + 1,
      // Real NSIDC data
      real_extent_mkm2: extentKm2,
      real_extent_date: seaIce?.date_str ?? null,
      real_anomaly_pct: seaIce?.anomaly_pct ?? null,
      source: seaIce ? "nsidc" : "cosine_fallback",
    })
  }

  if (action === "route") {
    const start = req.query.start as string
    const end = req.query.end as string
    if (!start || !end || !(start in WAYPOINTS) || !(end in WAYPOINTS)) {
      return res.status(400).json({ error: `Unknown waypoint. Valid: ${Object.keys(WAYPOINTS).join(", ")}` })
    }
    if (start === end) return res.status(400).json({ error: "Start and end are the same" })

    const seaIce = await getSeaIceExtent()
    const extentKm2 = seaIce?.extent_km2 ?? 17.0
    const iceMult = seaIce ? extentToConcentration(extentKm2) : 0.5

    const [, valsWind] = store.getTelemetryPairs("maitri", "wind_speed_kmh", 1000)
    const avgWind = valsWind.length > 0 ? valsWind.reduce((a, b) => a + b, 0) / valsWind.length : 25

    const result = dijkstra(start, end, iceMult, avgWind)
    result.waypoints = { [start]: WAYPOINTS[start], [end]: WAYPOINTS[end] }
    return res.json(result)
  }

  res.status(400).json({ error: "Invalid action" })
}
