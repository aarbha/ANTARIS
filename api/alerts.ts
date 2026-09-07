import type { VercelRequest, VercelResponse } from "@vercel/node"
import { store } from "./lib/store"

export default function handler(req: VercelRequest, res: VercelResponse) {
  store.init()

  if (req.method === "GET") {
    const { station_id, status } = req.query
    let alerts = [...store.alerts]
    if (station_id) alerts = alerts.filter(a => a.stationId === station_id)
    if (status) alerts = alerts.filter(a => a.status === status)
    return res.json(alerts)
  }

  if (req.method === "PUT") {
    const id = req.query.id as string
    const { action } = req.body || {}
    const alert = store.alerts.find(a => a.id === id)
    if (!alert) return res.status(404).json({ error: "Not found" })
    if (action === "acknowledge") alert.status = "acknowledged"
    if (action === "resolve") {
      alert.status = "resolved"
      alert.resolvedAt = new Date().toISOString()
    }
    return res.json(alert)
  }

  res.status(405).json({ error: "Method not allowed" })
}
