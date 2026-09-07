import type { VercelRequest, VercelResponse } from "@vercel/node"
import { STATIONS_DB } from "../lib/stations"

export default function handler(req: VercelRequest, res: VercelResponse) {
  const stationId = req.query.id as string
  const station = STATIONS_DB.find(s => s.id === stationId)
  if (!station) return res.status(404).json({ error: "Station not found" })
  res.json(station)
}
