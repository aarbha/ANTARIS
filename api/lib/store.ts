import { INVENTORY_SEED, FEATURES, type StationBaseline } from "./data"

// ── In-memory store (per-function cold start, shared within instance) ──
// On Vercel free tier, each function instance gets its own store.
// For multi-user persistence, swap with Turso/Neon DB via env vars.

interface Alert {
  id: string
  stationId: string
  metric: string
  severity: string
  message: string
  value: number
  threshold: number
  status: "open" | "acknowledged" | "resolved"
  triggeredAt: string
  resolvedAt?: string
}

interface Shipment {
  id: string
  stationId: string
  itemName: string
  quantity: number
  unit: string
  plannedDate: string
  status: "planned" | "in_transit" | "delivered"
}

interface InventoryItem {
  id: string
  stationId: string
  itemName: string
  category: string
  quantity: number
  unit: string
  reorderThreshold: number
}

interface TelemetryRow {
  stationId: string
  metricName: string
  value: number
  unit: string
  timestamp: string
}

let alertId = 100
let shipmentId = 200

export const store = {
  faultModes: {} as Record<string, string | null>,

  alerts: [] as Alert[],
  shipments: [] as Shipment[],
  inventory: [] as InventoryItem[],

  // Telemetry history buffer (ring buffer per station per metric)
  telemetry: new Map<string, TelemetryRow[]>(),

  initialized: false,

  init() {
    if (this.initialized) return
    this.initialized = true

    // Seed inventory
    this.inventory = INVENTORY_SEED.map((item, i) => ({
      id: `INV-${i + 1}`,
      stationId: item.stationId,
      itemName: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      reorderThreshold: item.reorderThreshold,
    }))

    // Seed initial alerts
    this.alerts = [
      { id: "ALT-001", stationId: "bharati", metric: "fuel_level_liters", severity: "critical", message: "Fuel below critical threshold — immediate resupply required", value: 2100, threshold: 2500, status: "open", triggeredAt: new Date(Date.now() - 3600000).toISOString() },
      { id: "ALT-002", stationId: "maitri", metric: "outdoor_temp", severity: "advisory", message: "Temperature dropping below seasonal average — monitor heating systems", value: -24, threshold: -55, status: "acknowledged", triggeredAt: new Date(Date.now() - 7200000).toISOString() },
      { id: "ALT-003", stationId: "maitri", metric: "generator_rpm", severity: "warning", message: "Generator RPM fluctuation detected — vibration check recommended", value: 1350, threshold: 800, status: "open", triggeredAt: new Date(Date.now() - 1800000).toISOString() },
      { id: "ALT-004", stationId: "bharati", metric: "general", severity: "info", message: "Resupply vessel MV Sagar Nidhi departed Goa — ETA 15 days", value: 0, threshold: 0, status: "open", triggeredAt: new Date(Date.now() - 86400000).toISOString() },
    ]

    // Seed shipments
    this.shipments = [
      { id: "SUP-204", stationId: "maitri", itemName: "Diesel fuel & food rations", quantity: 45000, unit: "kg", plannedDate: "2026-11-15", status: "planned" },
      { id: "SUP-203", stationId: "bharati", itemName: "Medical supplies & spare parts", quantity: 12000, unit: "kg", plannedDate: "2026-11-20", status: "planned" },
      { id: "SUP-205", stationId: "maitri_ii", itemName: "Construction materials", quantity: 80000, unit: "kg", plannedDate: "2026-12-01", status: "planned" },
    ]
  },

  pushTelemetry(stationId: string, metricName: string, value: number, unit: string) {
    const key = `${stationId}:${metricName}`
    if (!this.telemetry.has(key)) this.telemetry.set(key, [])
    const arr = this.telemetry.get(key)!
    arr.push({ stationId, metricName, value, unit, timestamp: new Date().toISOString() })
    // Keep last 10000 entries per metric
    if (arr.length > 10000) arr.splice(0, arr.length - 10000)
  },

  getTelemetryHistory(stationId: string, metricName: string, maxEntries = 5000): TelemetryRow[] {
    const key = `${stationId}:${metricName}`
    return (this.telemetry.get(key) || []).slice(-maxEntries)
  },

  getTelemetryPairs(stationId: string, metricName: string, maxEntries = 5000): [number[], number[]] {
    const rows = this.getTelemetryHistory(stationId, metricName, maxEntries)
    const timestamps = rows.map(r => new Date(r.timestamp).getTime() / 1000)
    const values = rows.map(r => r.value)
    return [timestamps, values]
  },

  addAlert(alert: Omit<Alert, "id" | "triggeredAt">): Alert {
    const a: Alert = {
      ...alert,
      id: `ALT-${++alertId}`,
      triggeredAt: new Date().toISOString(),
    }
    this.alerts.push(a)
    return a
  },
}
