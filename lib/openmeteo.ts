/**
 * Open-Meteo API client — shared by weather.ts, telemetry, and predict endpoints.
 * 10-minute TTL in-memory cache, 4s AbortController timeout, WMO weather-code labels.
 */

const STATIONS: Record<string, { lat: number; lon: number; name: string }> = {
  maitri:  { lat: -70.7668, lon: 11.7308, name: "Maitri" },
  bharati: { lat: -69.4068, lon: 76.1953, name: "Bharati" },
  maitri_ii: { lat: -70.76, lon: 11.73, name: "Maitri II" },
}

const WMO_CODES: Record<number, string> = {
  0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
  45: "Fog", 48: "Rime fog",
  51: "Light drizzle", 53: "Moderate drizzle", 55: "Dense drizzle",
  56: "Light freezing drizzle", 57: "Dense freezing drizzle",
  61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain",
  66: "Light freezing rain", 67: "Heavy freezing rain",
  71: "Slight snowfall", 73: "Moderate snowfall", 75: "Heavy snowfall",
  77: "Snow grains", 80: "Slight rain showers", 81: "Moderate rain showers",
  82: "Violent rain showers", 85: "Slight snow showers", 86: "Heavy snow showers",
  95: "Thunderstorm", 96: "Thunderstorm with slight hail", 99: "Thunderstorm with heavy hail",
}

export function weatherLabel(code: number): string {
  return WMO_CODES[code] ?? "Unknown"
}

interface WeatherCache {
  data: any
  timestamp: number
}

const cache: Record<string, WeatherCache> = {}
const CACHE_TTL_MS = 10 * 60 * 1000

export async function getOpenMeteoWeather(stationId: string): Promise<any | null> {
  const station = STATIONS[stationId]
  if (!station) return null

  const cached = cache[stationId]
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return { ...cached.data, cached: true }
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${station.lat}&longitude=${station.lon}&current=temperature_2m,wind_speed_10m,relative_humidity_2m,weather_code,shortwave_radiation&daily=temperature_2m_max,temperature_2m_min,wind_speed_10m_max,weather_code&timezone=auto&forecast_days=7`

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 4000)

    const resp = await fetch(url, { signal: controller.signal })
    clearTimeout(timeout)
    const data = await resp.json()

    const result = {
      station_id: stationId,
      station_name: station.name,
      source: "open-meteo",
      current: {
        ...data.current,
        weather_label: weatherLabel(data.current?.weather_code ?? 0),
      },
      daily: data.daily || {},
      temperature_unit: "°C",
      wind_unit: "km/h",
    }

    cache[stationId] = { data: result, timestamp: Date.now() }
    return result
  } catch {
    return null
  }
}

export async function getOpenMeteoTemp(stationId: string): Promise<number | null> {
  const weather = await getOpenMeteoWeather(stationId)
  return weather?.current?.temperature_2m ?? null
}
