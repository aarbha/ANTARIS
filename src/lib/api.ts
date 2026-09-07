const API_BASE = "" // same-origin in production; empty string for relative URLs

async function apiFetch<T = any>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  })
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`)
  }
  return res.json()
}

// ── Health ──
export async function apiHealth() {
  return apiFetch<{ status: string; timestamp: string }>("/api/health")
}

// ── Stations ──
export async function apiGetStations() {
  return apiFetch<any[]>("/api/stations")
}

export async function apiGetStation(id: string) {
  return apiFetch<any>(`/api/stations/${id}`)
}

// ── Telemetry ──
export interface TelemetryValues {
  outdoor_temp: number
  indoor_temp: number
  generator_rpm: number
  fuel_level_liters: number
  vibration_level: number
  hvac_pressure: number
  water_temp: number
  solar_output_kw: number
  wind_output_kw: number
  battery_soc: number
  wind_speed_kmh: number
}

export async function apiGetLatestTelemetry(stationId: string) {
  return apiFetch<{ station_id: string; timestamp: string; values: TelemetryValues }>(
    `/api/telemetry/latest?station=${stationId}`
  )
}

export async function apiGetTelemetryHistory(stationId: string, metric: string, hours = 48) {
  return apiFetch<{ stationId: string; metricName: string; value: number; unit: string; timestamp: string }[]>(
    `/api/telemetry/history?station=${stationId}&metric=${metric}&hours=${hours}`
  )
}

// ── Predictions ──
export async function apiPredictFuel(stationId: string) {
  return apiFetch<any>(`/api/predict/fuel?station_id=${stationId}`)
}

export async function apiPredictTemperature(stationId: string) {
  return apiFetch<any>(`/api/predict/temperature?station_id=${stationId}`)
}

export async function apiPredictRpmHealth(stationId: string) {
  return apiFetch<any>(`/api/predict/rpm-health?station_id=${stationId}`)
}

export async function apiPredictAnomalies(stationId: string, metric = "generator_rpm") {
  return apiFetch<any>(`/api/predict/anomalies?station_id=${stationId}&metric=${metric}`)
}

export async function apiPredictModelAccuracy() {
  return apiFetch<any>("/api/predict/model-accuracy")
}

export async function apiPredictEnsemble(stationId: string) {
  return apiFetch<any>(`/api/predict/ensemble?station_id=${stationId}`)
}

// ── Alerts ──
export async function apiGetAlerts(stationId?: string) {
  const params = stationId ? `?station_id=${stationId}` : ""
  return apiFetch<any[]>(`/api/alerts${params}`)
}

export async function apiUpdateAlert(id: string, action: "acknowledge" | "resolve") {
  return apiFetch<any>(`/api/alerts?id=${id}`, {
    method: "PUT",
    body: JSON.stringify({ action }),
  })
}

// ── Energy ──
export async function apiEnergyOptimize(stationId: string, season = "current") {
  return apiFetch<any>(`/api/energy/optimize?station_id=${stationId}&season=${season}`)
}

export async function apiEnergySavings(stationId: string) {
  return apiFetch<any>(`/api/energy/savings?station_id=${stationId}`)
}

// ── Sea Ice ──
export async function apiSeaIceConditions(stationId: string) {
  return apiFetch<any>(`/api/seaice?action=conditions&station_id=${stationId}`)
}

export async function apiSeaIceRoute(start: string, end: string) {
  return apiFetch<any>(`/api/seaice?action=route&start=${start}&end=${end}`)
}

// ── Routes ──
export async function apiGetRoutes() {
  return apiFetch<any>("/api/routes")
}

// ── Logistics ──
export async function apiGetInventory() {
  return apiFetch<any[]>("/api/logistics?action=inventory")
}

export async function apiGetShipments() {
  return apiFetch<any[]>("/api/logistics?action=shipments")
}

export async function apiGetResupplyRecommendations() {
  return apiFetch<any[]>("/api/logistics?action=resupply")
}

export async function apiGetSustainability() {
  return apiFetch<any[]>("/api/logistics?action=sustainability")
}

export async function apiCreateShipment(shipment: {
  station_id: string; item_name: string; quantity: number; unit?: string; planned_date?: string
}) {
  return apiFetch<any>("/api/logistics?action=shipments", {
    method: "POST",
    body: JSON.stringify(shipment),
  })
}

// ── Simulation ──
export async function apiRunWhatIf(params: {
  station_id?: string; outdoor_temp?: number; storm_duration_hours?: number;
  generators_offline?: number; supply_delay_days?: number
}) {
  return apiFetch<any>("/api/simulation/whatif", {
    method: "POST",
    body: JSON.stringify(params),
  })
}

// ── Fault injection ──
export async function apiSetFault(stationId: string, mode: string | null) {
  return apiFetch<any>("/api/fault", {
    method: "POST",
    body: JSON.stringify({ station_id: stationId, mode }),
  })
}

// ── Weather ──
export async function apiGetWeather(stationId: string) {
  return apiFetch<any>(`/api/weather?station_id=${stationId}`)
}

// ── Aurora ──
export async function apiGetAurora(stationId: string) {
  return apiFetch<any>(`/api/aurora?station_id=${stationId}`)
}

// ── Sea Ice ──
export async function apiGetSeaIceConditions(stationId: string) {
  return apiFetch<any>(`/api/seaice?action=conditions&station_id=${stationId}`)
}
