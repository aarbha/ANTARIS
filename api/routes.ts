import type { VercelRequest, VercelResponse } from "@vercel/node"
import { store } from "./lib/store"
import { STATIONS_DB } from "./lib/stations"
import { HQ, SHIP_SPEED_KNOTS } from "./lib/data"
import { haversineKm } from "./lib/utils"

export default function handler(req: VercelRequest, res: VercelResponse) {
  store.init()

  const legs = STATIONS_DB.map(s => {
    const dist = haversineKm(HQ.lat, HQ.lon, s.latitude, s.longitude)
    return {
      from: HQ.name, to: s.stationName,
      from_lat: HQ.lat, from_lon: HQ.lon,
      to_lat: s.latitude, to_lon: s.longitude,
      distance_km: Math.round(dist),
      eta_days: Math.round(dist / (SHIP_SPEED_KNOTS * 1.852 * 24) * 10) / 10,
      speed_knots: SHIP_SPEED_KNOTS,
    }
  })

  const inter: any[] = []
  for (let i = 0; i < STATIONS_DB.length; i++) {
    for (let j = i + 1; j < STATIONS_DB.length; j++) {
      const a = STATIONS_DB[i], b = STATIONS_DB[j]
      const dist = haversineKm(a.latitude, a.longitude, b.latitude, b.longitude)
      inter.push({
        from: a.stationName, to: b.stationName,
        from_lat: a.latitude, from_lon: a.longitude,
        to_lat: b.latitude, to_lon: b.longitude,
        distance_km: Math.round(dist),
        eta_days: Math.round(dist / (SHIP_SPEED_KNOTS * 1.852 * 24) * 10) / 10,
      })
    }
  }

  res.json({ hq: HQ, ship_speed_knots: SHIP_SPEED_KNOTS, legs, inter_station: inter })
}
