import type { VercelRequest, VercelResponse } from "@vercel/node"
import { store } from "../lib/store"
import { STATION_INVENTORY, monthlyOutdoor } from "../lib/data"

const BATTERY_CAPACITY_KWH = 200.0
const HVAC_SETPOINT_NORMAL = 20.0
const HVAC_SETPOINT_STRAINED = 15.0
const COOLING_RATE_NORMAL = 0.15
const COOLING_RATE_STRAINED = 0.10
const PASSIVE_HEAT_LOSS = 0.055
const GEN_FLOAT_CHARGE_PCT = 0.5
const GEN_DRAIN_PCT = 18.5
const THERMAL_DEMAND_FACTOR = 0.035

export default function handler(req: VercelRequest, res: VercelResponse) {
  store.init()

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const body = req.body || {}
  const stationId = body.station_id || "maitri"
  const outdoorTemp = Math.max(-65, Math.min(-10, body.outdoor_temp ?? monthlyOutdoor(stationId)))
  const stormDurationHours = Math.min(120, Math.max(1, body.storm_duration_hours ?? 0)) || 1
  const gensOfflineStart = Math.min(2, Math.max(0, body.generators_offline ?? 0))
  const supplyDelay = Math.max(0, body.supply_delay_days ?? 0)

  const inv = STATION_INVENTORY[stationId] || STATION_INVENTORY.maitri
  const step = stormDurationHours <= 30 ? 3 : 6

  let fuel = inv.fuel
  let batterySoc = inv.battery_soc
  let indoor = HVAC_SETPOINT_NORMAL
  let gensOnline = Math.max(0, 2 - gensOfflineStart)

  const timeline: any[] = []
  const milestones: any[] = []
  const rationingMode = supplyDelay > 7
  const rationingFactor = rationingMode ? 0.7 : 1.0

  for (let h = 0; h <= stormDurationHours; h += step) {
    const inStorm = h > 0 && h <= stormDurationHours
    const coldDelta = inStorm ? Math.abs(outdoorTemp) - 20 : 0
    const thermalMult = 1 + Math.max(0, coldDelta) * THERMAL_DEMAND_FACTOR

    let effBurn = 0
    if (gensOnline >= 2) effBurn = inv.burn_rate * thermalMult * rationingFactor
    else if (gensOnline === 1) effBurn = inv.burn_rate * 1.02 * thermalMult * rationingFactor

    fuel = Math.max(0, fuel - effBurn * step)

    if (fuel <= 0 && gensOnline > 0) {
      gensOnline = 0
    }

    if (gensOnline > 0 && batterySoc < 100) {
      batterySoc = Math.min(100, batterySoc + GEN_FLOAT_CHARGE_PCT * step)
    } else if (gensOnline === 0) {
      batterySoc = Math.max(0, batterySoc - GEN_DRAIN_PCT * step)
    }

    let hvacSetpoint = HVAC_SETPOINT_NORMAL
    let coolingRate = COOLING_RATE_NORMAL
    if (gensOnline >= 2) {
      hvacSetpoint = HVAC_SETPOINT_NORMAL
      coolingRate = COOLING_RATE_NORMAL
    } else if (gensOnline === 1) {
      hvacSetpoint = Math.max(HVAC_SETPOINT_STRAINED, HVAC_SETPOINT_NORMAL - coldDelta * 0.15)
      coolingRate = COOLING_RATE_STRAINED
    } else {
      hvacSetpoint = -5
      coolingRate = COOLING_RATE_STRAINED * 0.8
    }

    const outdoorCurrent = inStorm ? outdoorTemp : outdoorTemp + 5
    if (gensOnline > 0) {
      indoor = indoor + coolingRate * (hvacSetpoint - indoor)
    } else {
      indoor = indoor + PASSIVE_HEAT_LOSS * (outdoorCurrent - indoor)
    }
    indoor = Math.max(-10, Math.min(30, indoor))

    const tempScore = Math.max(0, Math.min(1, (indoor - (-5)) / 25))
    const powerScore = batterySoc / 100
    const habitability = Math.max(0, Math.min(100, 0.6 * tempScore * 100 + 0.4 * powerScore * 100))

    const solar = inStorm && outdoorTemp < -40 ? 0 : 3
    const renewablePct = Math.min(100, solar / Math.max(1, effBurn > 0 ? effBurn : 30) * 100)

    timeline.push({
      hour: h, fuel_liters: Math.round(fuel), indoor_temp_c: Math.round(indoor * 10) / 10,
      battery_soc_pct: Math.round(batterySoc * 10) / 10, habitability_pct: Math.round(habitability * 10) / 10,
      outdoor_temp_c: Math.round(outdoorCurrent * 10) / 10, generators_online: gensOnline,
      renewable_share_pct: Math.round(renewablePct * 10) / 10,
    })

    if (fuel <= 0 && !milestones.some(m => m.type === "fuel_exhausted")) {
      milestones.push({ type: "fuel_exhausted", hour: h, severity: "critical", message: "Fuel exhausted — all generators offline" })
    }
    if (batterySoc <= 20 && !milestones.some(m => m.type === "battery_low")) {
      milestones.push({ type: "battery_low", hour: h, severity: "warning", message: `Battery SOC below 20% at hour ${h}` })
    }
    if (batterySoc <= 0 && !milestones.some(m => m.type === "blackout")) {
      milestones.push({ type: "blackout", hour: h, severity: "critical", message: `Total station blackout at hour ${h}` })
    }
    if (indoor <= 0 && !milestones.some(m => m.type === "freeze_breach")) {
      milestones.push({ type: "freeze_breach", hour: h, severity: "critical", message: `Habitat freeze breach (0 C) at hour ${h}` })
    }
  }

  const fuelDays = Math.round((inv.fuel / Math.max(1, inv.burn_rate) / 24) * 10) / 10
  const blackoutAt = milestones.find(m => m.type === "blackout")?.hour
  const freezeAt = milestones.find(m => m.type === "freeze_breach")?.hour
  const fuelExhaustAt = milestones.find(m => m.type === "fuel_exhausted")?.hour

  let riskLevel = "LOW"
  if (fuelExhaustAt != null && fuelExhaustAt <= 24) riskLevel = "CRITICAL"
  else if (blackoutAt != null && blackoutAt <= 24) riskLevel = "CRITICAL"
  else if (blackoutAt != null && blackoutAt <= 72) riskLevel = "HIGH"
  else if (freezeAt != null && freezeAt <= 72) riskLevel = "HIGH"
  else if (fuelDays <= 3) riskLevel = "CRITICAL"
  else if (fuelDays <= 7) riskLevel = "HIGH"

  const actions: string[] = []
  if (gensOfflineStart >= 2) actions.push("IMMEDIATE: Restore generator power — critical life-support systems at risk")
  else if (gensOfflineStart >= 1) actions.push("Load-shed non-essential systems to preserve life-support")
  if (rationingMode) actions.push(`Fuel rationing recommended — ${supplyDelay}-day resupply delay; reducing burn rate 30%`)
  if (supplyDelay > 0 && supplyDelay <= 7) actions.push(`Resupply vessel ETA ${supplyDelay} days — monitor fuel closely`)
  if (outdoorTemp < -50) actions.push("Exterior equipment lockout — preheat fuel lines and hydraulic systems before restart")
  if (batterySoc < 30) actions.push("Reduce battery load to essential comms only")
  if (actions.length === 0) actions.push("Continue monitoring — all systems within operational parameters")

  res.json({
    station_id: stationId,
    scenario: { outdoor_temp: outdoorTemp, storm_hours: stormDurationHours, generators_offline: gensOfflineStart, supply_delay_days: supplyDelay },
    timeline, milestones,
    risk: { level: riskLevel, fuel_autonomy_days: fuelDays, estimated_blackout_hour: blackoutAt ?? null, estimated_freeze_hour: freezeAt ?? null },
    actions,
  })
}
