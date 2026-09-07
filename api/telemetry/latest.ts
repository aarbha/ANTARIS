import type { VercelRequest, VercelResponse } from "@vercel/node"
import { store } from "../lib/store"
import { generateTelemetry, generateHistoryBuffer } from "../lib/simulator"
import { UNITS, monthlyOutdoor } from "../lib/data"
import { getLiveOutdoorTemp, type TempSource } from "../lib/livetemp"
import { getNcporStationData } from "../lib/ncpor"
import { getOpenMeteoWeather } from "../lib/openmeteo"

export default async function handler(req: VercelRequest, res: VercelResponse) {
  store.init()
  const stationId = (req.query.station as string) || "maitri"

  // Ensure history buffer exists (lazy init)
  const key = `${stationId}:outdoor_temp`
  if (!store.telemetry.has(key) || store.telemetry.get(key)!.length < 100) {
    generateHistoryBuffer(stationId, 48)
  }

  // Get live outdoor temp from NCPOR → Open-Meteo chain
  const { temp: liveTemp, source } = await getLiveOutdoorTemp(stationId)
  const outdoorOverride = liveTemp ?? undefined

  // Generate current readings with optional outdoor override
  const values = generateTelemetry(stationId, { outdoorOverride })

  // Get NCPOR station data for wind/pressure/humidity
  const ncporData = await getNcporStationData(stationId)
  let live_wind_ms: number | null = null
  let live_pressure_mbar: number | null = null
  let live_humidity_pct: number | null = null
  let live_ncpor_timestamp: string | null = null

  if (ncporData?.current) {
    live_wind_ms = ncporData.current.wind_ms
    live_pressure_mbar = ncporData.current.pressure_mbar
    live_humidity_pct = ncporData.current.humidity_pct
    live_ncpor_timestamp = ncporData.current.timestamp_ms
      ? new Date(ncporData.current.timestamp_ms).toISOString()
      : null
  }

  // Override telemetry values with live data where available
  if (live_wind_ms !== null) {
    values.wind_speed_kmh = Math.round(live_wind_ms * 3.6 * 10) / 10  // m/s → km/h
  }

  // Get Open-Meteo solar radiation
  const weather = await getOpenMeteoWeather(stationId)
  const shortwaveRadiation = weather?.current?.shortwave_radiation ?? 0
  // Solar panel: ~25m² area, 20% efficiency, W/m² → kW
  const liveSolarKw = Math.round(shortwaveRadiation * 25 * 0.20 / 1000 * 1000) / 1000
  values.solar_output_kw = liveSolarKw

  // Push current readings to history
  for (const [metric, value] of Object.entries(values)) {
    store.pushTelemetry(stationId, metric, value, UNITS[metric] || "")
  }

  res.json({
    station_id: stationId,
    timestamp: new Date().toISOString(),
    values,
    temperature_source: source,
    live_wind_ms,
    live_pressure_mbar,
    live_humidity_pct,
    live_solar_radiation_wm2: shortwaveRadiation,
    live_ncpor_timestamp,
  })
}
