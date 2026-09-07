import type { VercelRequest, VercelResponse } from "@vercel/node"
import { monthlyOutdoor } from "./lib/data"
import { getOpenMeteoWeather, weatherLabel } from "./lib/openmeteo"
import { getNcporStationData, getNcporTemp } from "./lib/ncpor"

function seededRand(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453
  return x - Math.floor(x)
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const stationId = (req.query.station_id as string) || "maitri"
  const validStations = ["maitri", "bharati", "maitri_ii"]
  if (!validStations.includes(stationId)) {
    return res.status(400).json({ error: "Unknown station" })
  }

  // Fetch live data in parallel
  const [weather, ncporData] = await Promise.all([
    getOpenMeteoWeather(stationId),
    getNcporStationData(stationId),
  ])

  const ncporTemp = ncporData?.current.temp_C ?? null
  const ncporWind = ncporData?.current.wind_ms !== null ? Math.round(ncporData!.current.wind_ms * 3.6 * 10) / 10 : null
  const ncporPressure = ncporData?.current.pressure_mbar ?? null
  const ncporHumidity = ncporData?.current.humidity_pct ?? null
  const ncporTimestamp = ncporData?.current.timestamp_ms
    ? new Date(ncporData.current.timestamp_ms).toISOString()
    : null

  if (weather) {
    const result: any = { ...weather }

    // Source tracking: NCPOR is authoritative for temp if available
    result.temperature_source = ncporTemp !== null ? "ncpor" : "open-meteo"

    // Prefer NCPOR readings over Open-Meteo where available
    if (ncporTemp !== null) {
      result.current.temperature_2m = ncporTemp
    }
    if (ncporWind !== null) {
      result.current.wind_speed_10m = ncporWind
    }
    if (ncporPressure !== null) {
      result.current.pressure = ncporPressure
    }
    if (ncporHumidity !== null) {
      result.current.relative_humidity_2m = Math.round(ncporHumidity)
    }

    // Attach NCPOR metadata
    result.ncpor = {
      temp_C: ncporTemp,
      wind_ms: ncporData?.current.wind_ms ?? null,
      pressure_mbar: ncporPressure,
      humidity_pct: ncporHumidity,
      timestamp: ncporTimestamp,
    }

    return res.json(result)
  }

  // Fallback: synthetic weather data based on climatology
  const now = new Date()
  const hour = now.getHours()
  const baseTemp = ncporTemp ?? monthlyOutdoor(stationId, now)
  const temp = baseTemp + Math.sin((hour - 12) / 24 * Math.PI * 2) * 3
  const weatherCode = temp < -45 ? 71 : temp < -35 ? 3 : 1

  res.json({
    station_id: stationId,
    station_name: stationId.charAt(0).toUpperCase() + stationId.slice(1),
    source: "synthetic",
    temperature_source: ncporTemp !== null ? "ncpor" : "climatology",
    current: {
      temperature_2m: Math.round(temp * 10) / 10,
      wind_speed_10m: ncporWind ?? Math.round(22 + seededRand(hour) * 15 * 10) / 10,
      relative_humidity_2m: ncporHumidity ? Math.round(ncporHumidity) : Math.round(65 + seededRand(hour + 1) * 20),
      pressure: ncporPressure ?? Math.round(1000 + seededRand(hour + 2) * 30),
      weather_code: weatherCode,
      weather_label: weatherLabel(weatherCode),
    },
    daily: {
      temperature_2m_max: [Math.round(temp + 5), Math.round(temp + 4), Math.round(temp + 6), Math.round(temp + 3), Math.round(temp + 5), Math.round(temp + 4), Math.round(temp + 6)],
      temperature_2m_min: [Math.round(temp - 8), Math.round(temp - 7), Math.round(temp - 9), Math.round(temp - 6), Math.round(temp - 8), Math.round(temp - 7), Math.round(temp - 9)],
    },
    ncpor: {
      temp_C: ncporTemp,
      wind_ms: ncporData?.current.wind_ms ?? null,
      pressure_mbar: ncporPressure,
      humidity_pct: ncporHumidity,
      timestamp: ncporTimestamp,
    },
    note: "Synthetic data — Open-Meteo unreachable",
  })
}
