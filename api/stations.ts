import type { VercelRequest, VercelResponse } from "@vercel/node"
import { STATIONS_DB } from "./lib/stations"

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.json(STATIONS_DB)
}
