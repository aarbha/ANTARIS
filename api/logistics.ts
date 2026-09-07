import type { VercelRequest, VercelResponse } from "@vercel/node"
import { store } from "./lib/store"
import { generateHistoryBuffer } from "./lib/simulator"

const WINDOW = { opens: 11, closes: 3 }

export default function handler(req: VercelRequest, res: VercelResponse) {
  store.init()
  const action = (req.query.action as string) || "inventory"

  if (action === "inventory") {
    return res.json(store.inventory)
  }

  if (action === "shipments" && req.method === "GET") {
    return res.json(store.shipments)
  }

  if (action === "shipments" && req.method === "POST") {
    const { station_id, item_name, quantity, unit, planned_date } = req.body || {}
    const shipment = {
      id: `SUP-${Date.now()}`,
      stationId: station_id,
      itemName: item_name,
      quantity: quantity || 0,
      unit: unit || "units",
      plannedDate: planned_date || "",
      status: "planned" as const,
    }
    store.shipments.push(shipment)
    return res.json({ ok: true, id: shipment.id })
  }

  if (action === "resupply") {
    const recommendations = store.inventory
      .filter(i => i.quantity < i.reorderThreshold * 1.3)
      .map(i => ({
        station_id: i.stationId,
        station_name: i.stationId.charAt(0).toUpperCase() + i.stationId.slice(1),
        item_name: i.itemName,
        category: i.category,
        quantity: i.quantity,
        unit: i.unit,
        reorder_threshold: i.reorderThreshold,
        suggest_order: Math.round((i.reorderThreshold * 2 - i.quantity) * 10) / 10,
        days_until_shortage: Math.round(i.quantity / Math.max(1, i.reorderThreshold / 14) * 10) / 10,
        urgency: i.quantity < i.reorderThreshold ? "critical" : i.quantity < i.reorderThreshold * 1.15 ? "warning" : "watch",
        window: "Nov-Mar (11-3)",
      }))
    return res.json(recommendations)
  }

  if (action === "sustainability") {
    const stations = ["maitri", "bharati"]

    // Seed telemetry history so solar/wind values are always realistic
    for (const s of stations) {
      generateHistoryBuffer(s, 24)
    }

    const rows = stations.map(s => {
      const [, valsSolar] = store.getTelemetryPairs(s, "solar_output_kw", 100)
      const [, valsWind] = store.getTelemetryPairs(s, "wind_output_kw", 100)
      const solar = valsSolar.length > 0 ? valsSolar[valsSolar.length - 1] : 0
      const wind = valsWind.length > 0 ? valsWind[valsWind.length - 1] : 0
      const renewableKw = solar + wind
      const totalKw = renewableKw + 40
      const share = renewableKw / Math.max(totalKw, 1e-9)
      const co2PerHour = 155 * 2.68 / 60
      return {
        station_id: s, station_name: s.charAt(0).toUpperCase() + s.slice(1),
        renewable_kw: Math.round(renewableKw * 100) / 100,
        solar_kw: Math.round(solar * 100) / 100,
        wind_kw: Math.round(wind * 100) / 100,
        renewable_share_pct: Math.round(share * 100 * 10) / 10,
        co2_per_hour_kg: Math.round(co2PerHour * 100) / 100,
        co2_saved_per_day_kg: Math.round(co2PerHour * 24 * share * 10) / 10,
      }
    })
    return res.json(rows)
  }

  res.status(400).json({ error: "Invalid action" })
}
