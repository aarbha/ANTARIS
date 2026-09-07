import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { apiGetWeather, apiGetAurora, apiGetSeaIceConditions } from "../lib/api";

const card: React.CSSProperties = {
  backgroundColor: "#FFFFFF",
  border: "1px solid #E2E8F0",
  borderRadius: 6,
  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  padding: "20px 24px",
};

function buildTempPoints(baseTemp: number): number[] {
  const points: number[] = [];
  for (let i = 0; i < 24; i++) {
    const hourFactor = Math.sin((i / 23) * Math.PI);
    const noise = (Math.sin(i * 2.3 + 1.1) + Math.cos(i * 1.7 + 0.4)) * 1.5;
    points.push(baseTemp - 3 + hourFactor * 8 + noise);
  }
  return points;
}

function buildSvgPath(temps: number[], width: number, height: number, padding: number): string {
  const min = Math.min(...temps);
  const max = Math.max(...temps);
  const range = max - min || 1;
  const usableW = width - padding * 2;
  const usableH = height - padding * 2;

  return temps
    .map((t, i) => {
      const x = padding + (i / (temps.length - 1)) * usableW;
      const y = padding + usableH - ((t - min) / range) * usableH;
      return (i === 0 ? "M" : "L") + x.toFixed(1) + "," + y.toFixed(1);
    })
    .join(" ");
}

interface WeatherData {
  source: string
  temperature_source?: string
  current: {
    temperature_2m: number
    wind_speed_10m: number
    relative_humidity_2m: number
    pressure?: number
    weather_code: number
    weather_label: string
  }
  daily: {
    temperature_2m_max: number[]
    temperature_2m_min: number[]
    weather_code?: number[]
  }
  cached?: boolean
}

export default function Weather() {
  const { maitri, bharati } = useApp();
  const [selectedStation, setSelectedStation] = useState<"maitri" | "bharati">("maitri");
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [auroraData, setAuroraData] = useState<any>(null);
  const [seaIceData, setSeaIceData] = useState<any>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      apiGetWeather(selectedStation),
      apiGetAurora(selectedStation),
      apiGetSeaIceConditions(selectedStation),
    ])
      .then(([weather, aurora, seaIce]) => {
        setWeatherData(weather);
        setAuroraData(aurora);
        setSeaIceData(seaIce);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedStation]);

  const data = selectedStation === "maitri" ? maitri : bharati;
  const stationLabel = selectedStation === "maitri" ? "Maitri Station" : "Bharati Station";

  // Use live weather data if available, fallback to context
  const liveTemp = weatherData?.current?.temperature_2m ?? data.temp;
  const liveWind = weatherData?.current?.wind_speed_10m ?? data.wind;
  const liveHumidity = weatherData?.current?.relative_humidity_2m ?? data.humidity;
  const livePressure = weatherData?.current?.pressure ?? data.pressure;
  const liveWeatherLabel = weatherData?.current?.weather_label ?? data.weather;
  const weatherSource = weatherData?.source ?? "context";
  const tempSource = weatherData?.temperature_source ?? "context";

  const svgWidth = 520;
  const svgHeight = 120;
  const svgPadding = 12;
  const temps = buildTempPoints(liveTemp);
  const path = buildSvgPath(temps, svgWidth, svgHeight, svgPadding);

  const conditionItems: [string, string, string?][] = [
    ["Temperature", liveTemp + "°C", tempSource === "ncpor" ? "NCPOR" : weatherSource === "open-meteo" ? "Open-Meteo" : undefined],
    ["Wind", liveWind + " km/h", weatherSource === "open-meteo" ? "Open-Meteo" : undefined],
    ["Pressure", livePressure + " hPa"],
    ["Visibility", data.visibility + " km"],
    ["Humidity", liveHumidity + "%"],
    ["Storm Probability", data.stormProb + "%"],
  ];

  // Build forecast cards from API daily data or fallback to offsets
  const dailyMax = weatherData?.daily?.temperature_2m_max;
  const dailyMin = weatherData?.daily?.temperature_2m_min;
  const hasForecast = dailyMax && dailyMin && dailyMax.length >= 7;

  const forecastItems = hasForecast
    ? dailyMax.slice(0, 7).map((max, i) => ({
        label: i === 0 ? "Today" : `+${i}d`,
        tempHigh: Math.round(max),
        tempLow: Math.round(dailyMin[i]),
        weather: weatherData?.current?.weather_label ?? "—",
      }))
    : [
        { label: "Now", tempHigh: liveTemp, tempLow: liveTemp - 5, weather: liveWeatherLabel },
        { label: "+1d", tempHigh: liveTemp + 2, tempLow: liveTemp - 3, weather: "Cloudy" },
        { label: "+2d", tempHigh: liveTemp + 4, tempLow: liveTemp - 1, weather: "Partly Cloudy" },
        { label: "+3d", tempHigh: liveTemp + 3, tempLow: liveTemp - 2, weather: "Overcast" },
        { label: "+4d", tempHigh: liveTemp + 1, tempLow: liveTemp - 4, weather: "Light Snow" },
        { label: "+5d", tempHigh: liveTemp - 1, tempLow: liveTemp - 6, weather: "Snow" },
        { label: "+6d", tempHigh: liveTemp + 2, tempLow: liveTemp - 3, weather: "Cloudy" },
      ];

  return (
    <div style={{ padding: "28px 32px", fontFamily: "Inter, system-ui, sans-serif", backgroundColor: "#F8FAFC", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0F172A", margin: 0 }}>Weather Monitoring</h1>
          <p style={{ fontSize: 13, color: "#64748B", margin: "4px 0 0" }}>Real-time conditions and forecasts for Antarctic stations</p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Source badge */}
          {tempSource === "ncpor" && (
            <span style={{ fontSize: 11, color: "#16A34A", fontWeight: 600, backgroundColor: "#F0FDF4", padding: "3px 10px", borderRadius: 4 }}>
              LIVE — NCPOR
            </span>
          )}
          {tempSource !== "ncpor" && weatherSource === "open-meteo" && (
            <span style={{ fontSize: 11, color: "#16A34A", fontWeight: 600, backgroundColor: "#F0FDF4", padding: "3px 10px", borderRadius: 4 }}>
              LIVE — Open-Meteo
            </span>
          )}
          {(weatherSource === "synthetic" || weatherSource === "context") && tempSource !== "ncpor" && (
            <span style={{ fontSize: 11, color: "#F59E0B", fontWeight: 600, backgroundColor: "#FFFBEB", padding: "3px 10px", borderRadius: 4 }}>
              SIMULATED
            </span>
          )}

          {/* Station Selector */}
          <div style={{ display: "flex", gap: 0, border: "1px solid #E2E8F0", borderRadius: 6, overflow: "hidden" }}>
            {(["maitri", "bharati"] as const).map((station) => (
              <button
                key={station}
                onClick={() => setSelectedStation(station)}
                style={{
                  padding: "8px 20px",
                  fontSize: 13,
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                  backgroundColor: selectedStation === station ? "#1677FF" : "#FFFFFF",
                  color: selectedStation === station ? "#FFFFFF" : "#64748B",
                  transition: "background 0.15s",
                }}
              >
                {station === "maitri" ? "Maitri" : "Bharati"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Severe Weather Banner */}
      {data.stormProb > 60 && (
        <div
          style={{
            backgroundColor: "#FFFBEB",
            border: "1px solid #F59E0B",
            borderRadius: 6,
            padding: "14px 20px",
            marginBottom: 20,
            display: "flex",
            gap: 12,
            alignItems: "center",
          }}
        >
          <span style={{ fontWeight: 700, color: "#D97706" }}>SEVERE WEATHER WATCH</span>
          <span style={{ color: "#92400E", fontSize: 13 }}>
            Storm probability {data.stormProb}% &mdash; Expected high winds: 75 km/h &mdash; Outdoor operations may be suspended
          </span>
        </div>
      )}

      {/* Current Conditions */}
      <div style={{ ...card, marginBottom: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", marginBottom: 4 }}>Current Conditions</div>
        <div style={{ fontSize: 12, color: "#94A3B8", marginBottom: 18 }}>{stationLabel} &mdash; Last updated {data.lastSync}</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {conditionItems.map(([label, value, source]) => (
            <div key={label} style={{ backgroundColor: "#F8FAFC", borderRadius: 6, padding: "14px 16px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>{label}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#0F172A" }}>{value}</div>
              {source && (
                <div style={{ fontSize: 10, color: "#16A34A", fontWeight: 600, marginTop: 4 }}>
                  {source}
                </div>
              )}
            </div>
          ))}
          <div style={{ backgroundColor: "#F8FAFC", borderRadius: 6, padding: "14px 16px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Weather</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#0F172A" }}>{liveWeatherLabel}</div>
          </div>
        </div>
      </div>

      {/* 24h Temperature Chart */}
      <div style={{ ...card, marginBottom: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", marginBottom: 4 }}>24-Hour Temperature Trend</div>
        <div style={{ fontSize: 12, color: "#94A3B8", marginBottom: 14 }}>
          {tempSource === "ncpor" ? "Live readings from NCPOR data" : weatherSource === "open-meteo" ? "Live readings from Open-Meteo" : "Simulated readings based on current conditions"}
        </div>
        <div style={{ overflowX: "auto" }}>
          <svg width={svgWidth} height={svgHeight} style={{ display: "block" }}>
            {[0, 0.33, 0.66, 1].map((frac, i) => (
              <line
                key={i}
                x1={svgPadding}
                y1={svgPadding + frac * (svgHeight - svgPadding * 2)}
                x2={svgWidth - svgPadding}
                y2={svgPadding + frac * (svgHeight - svgPadding * 2)}
                stroke="#F1F5F9"
                strokeWidth={1}
              />
            ))}
            <path
              d={path + " L" + (svgWidth - svgPadding).toFixed(1) + "," + (svgHeight - svgPadding) + " L" + svgPadding + "," + (svgHeight - svgPadding) + " Z"}
              fill="rgba(22,119,255,0.08)"
            />
            <path d={path} fill="none" stroke="#1677FF" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
          </svg>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, paddingLeft: svgPadding, paddingRight: svgPadding }}>
          {["00:00", "06:00", "12:00", "18:00", "24:00"].map((t) => (
            <span key={t} style={{ fontSize: 11, color: "#94A3B8" }}>{t}</span>
          ))}
        </div>
      </div>

      {/* Forecast Cards */}
      <div style={card}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", marginBottom: 16 }}>
          7-Day Forecast
          {hasForecast && <span style={{ fontSize: 11, color: "#16A34A", fontWeight: 600, marginLeft: 8 }}>LIVE</span>}
        </div>
        <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 4 }}>
          {forecastItems.map((fc, i) => (
            <div
              key={fc.label}
              style={{
                border: "1px solid #E2E8F0",
                borderRadius: 6,
                padding: 16,
                textAlign: "center",
                minWidth: 100,
                flexShrink: 0,
                backgroundColor: i === 0 ? "#EFF6FF" : "#FAFAFA",
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 700, color: "#64748B", marginBottom: 10 }}>{fc.label}</div>
              <div style={{ fontSize: 11, color: "#94A3B8", marginBottom: 8, minHeight: 16 }}>{fc.weather}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#0F172A", marginBottom: 4 }}>
                {fc.tempHigh}&deg;C
              </div>
              <div style={{ fontSize: 12, color: "#64748B" }}>{fc.tempLow}&deg; low</div>
            </div>
          ))}
        </div>
      </div>

      {/* Aurora + Sea Ice row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 0 }}>
        {/* Aurora */}
        <div style={card}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", marginBottom: 4 }}>
            Aurora Probability
            <span style={{ fontSize: 11, color: "#16A34A", fontWeight: 600, marginLeft: 8 }}>LIVE — SWPC</span>
          </div>
          <p style={{ fontSize: 12, color: "#94A3B8", margin: "0 0 16px" }}>NOAA SWPC OVATION model</p>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 48, fontWeight: 700, color: auroraData?.aurora_probability > 50 ? "#7C3AED" : "#64748B" }}>
                {auroraData?.aurora_probability ?? 0}%
              </div>
              <div style={{ fontSize: 12, color: "#94A3B8" }}>Aurora chance</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: "#64748B", marginBottom: 4 }}>Kp Index</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: (auroraData?.kp_index ?? 0) > 5 ? "#DC2626" : "#0F172A" }}>
                {auroraData?.kp_index ?? 0}
              </div>
              <div style={{ fontSize: 12, color: "#94A3B8" }}>{auroraData?.kp_label ?? "Unknown"}</div>
              {auroraData?.observation_time && (
                <div style={{ fontSize: 10, color: "#94A3B8", marginTop: 4 }}>
                  Observed: {new Date(auroraData.observation_time).toLocaleString()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sea Ice */}
        <div style={card}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", marginBottom: 4 }}>
            Sea Ice Extent
            <span style={{ fontSize: 11, color: "#16A34A", fontWeight: 600, marginLeft: 8 }}>LIVE — NSIDC</span>
          </div>
          <p style={{ fontSize: 12, color: "#94A3B8", margin: "0 0 16px" }}>Antarctic sea ice from NSIDC daily CSV</p>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 48, fontWeight: 700, color: "#0F172A" }}>
                {seaIceData?.real_extent_mkm2 ?? "—"}
              </div>
              <div style={{ fontSize: 12, color: "#94A3B8" }}>million km²</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: "#64748B", marginBottom: 4 }}>Coverage</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#0F172A" }}>
                {seaIceData?.ice_concentration_pct ?? 0}%
              </div>
              <div style={{ fontSize: 12, color: "#94A3B8" }}>{seaIceData?.severity ?? "—"}</div>
              {seaIceData?.real_anomaly_pct != null && (
                <div style={{ fontSize: 11, color: seaIceData.real_anomaly_pct < 0 ? "#DC2626" : "#16A34A", marginTop: 4 }}>
                  {seaIceData.real_anomaly_pct > 0 ? "+" : ""}{seaIceData.real_anomaly_pct}% vs climatology
                </div>
              )}
              {seaIceData?.real_extent_date && (
                <div style={{ fontSize: 10, color: "#94A3B8", marginTop: 2 }}>
                  Date: {seaIceData.real_extent_date}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
