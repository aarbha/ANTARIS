/**
 * Live outdoor temperature orchestrator — NCPOR → Open-Meteo → null.
 * Callers fall back to monthly climatology when null is returned.
 */

import { getNcporTemp } from "./ncpor"
import { getOpenMeteoTemp } from "./openmeteo"

export type TempSource = "ncpor" | "open-meteo" | "climatology"

export async function getLiveOutdoorTemp(
  stationId: string,
): Promise<{ temp: number | null; source: TempSource }> {
  // 1. NCPOR (maitri/bharati only)
  const ncporTemp = await getNcporTemp(stationId)
  if (ncporTemp !== null) {
    return { temp: ncporTemp, source: "ncpor" }
  }

  // 2. Open-Meteo (all stations)
  const omTemp = await getOpenMeteoTemp(stationId)
  if (omTemp !== null) {
    return { temp: omTemp, source: "open-meteo" }
  }

  // 3. Caller falls back to climatology
  return { temp: null, source: "climatology" }
}
