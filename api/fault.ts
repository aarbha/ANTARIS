import type { VercelRequest, VercelResponse } from "@vercel/node"
import { store } from "./lib/store"

export default function handler(req: VercelRequest, res: VercelResponse) {
  store.init()

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const { station_id, mode } = req.body || {}
  const stationId = station_id || "maitri"

  if (mode && ["storm", "gen_failure", "fuel_low", "hvac_fault"].includes(mode)) {
    store.faultModes[stationId] = mode
    return res.json({ ok: true, station_id: stationId, fault_mode: mode })
  }

  if (mode === null || mode === "reset" || mode === undefined) {
    store.faultModes[stationId] = null
    return res.json({ ok: true, station_id: stationId, fault_mode: null })
  }

  res.status(400).json({ error: `Invalid mode. Valid: storm, gen_failure, fuel_low, hvac_fault, reset` })
}
