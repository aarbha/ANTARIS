import { useState, useEffect, useRef } from 'react'
import { apiPredictFuel, apiPredictTemperature, apiPredictRpmHealth, apiPredictModelAccuracy, apiPredictAnomalies, apiPredictEnsemble } from '../lib/api'

function FuelForecastChart({ points }: { points: { day: number; label: string; pct: number }[] }) {
  const w = 660, h = 220
  const pad = { top: 14, right: 20, bottom: 30, left: 44 }
  const cw = w - pad.left - pad.right
  const ch = h - pad.top - pad.bottom
  const maxDay = points[points.length - 1]?.day || 1

  const toX = (d: number) => pad.left + (d / maxDay) * cw
  const toY = (v: number) => pad.top + (1 - v / 100) * ch

  const pts = points.map(p => ({ ...p, x: toX(p.day), y: toY(p.pct) }))
  const polyline = pts.map(p => `${p.x},${p.y}`).join(' ')
  const area = `M ${pts[0].x} ${pts[0].y} ` + pts.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ') +
    ` L ${pts[pts.length - 1].x} ${pad.top + ch} L ${pts[0].x} ${pad.top + ch} Z`

  const critY = toY(30)
  const yTicks = [0, 20, 30, 40, 60, 80, 100]

  return (
    <div style={{ height: h }}>
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: '100%', display: 'block' }}>
        <defs>
          <linearGradient id="fGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1677FF" stopOpacity={0.22} />
            <stop offset="100%" stopColor="#1677FF" stopOpacity={0} />
          </linearGradient>
        </defs>
        {yTicks.map(v => {
          const y = toY(v)
          const isCrit = v === 30
          return (
            <g key={v}>
              <line x1={pad.left} y1={y} x2={pad.left + cw} y2={y} stroke={isCrit ? '#DC2626' : '#E2E8F0'} strokeWidth={isCrit ? 1.5 : 1} strokeDasharray={isCrit ? '5,3' : '3,3'} />
              <text x={pad.left - 5} y={y + 4} textAnchor="end" fill={isCrit ? '#DC2626' : '#94A3B8'} fontSize="10" fontWeight={isCrit ? '700' : '400'}>{v}%</text>
            </g>
          )
        })}
        <text x={pad.left + cw - 4} y={critY - 5} textAnchor="end" fill="#DC2626" fontSize="9" fontWeight="700">CRITICAL THRESHOLD</text>
        <path d={area} fill="url(#fGrad)" />
        <polyline points={polyline} fill="none" stroke="#1677FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="5" fill={p.pct <= 30 ? '#DC2626' : '#1677FF'} stroke="white" strokeWidth="2" />
            <text x={p.x} y={h - 5} textAnchor="middle" fill="#94A3B8" fontSize="10">{p.label}</text>
          </g>
        ))}
        <text x={12} y={h / 2} textAnchor="middle" fill="#94A3B8" fontSize="9" transform={`rotate(-90, 12, ${h / 2})`}>Fuel %</text>
      </svg>
    </div>
  )
}

function MetricCard({ icon, label, value, valueColor, sub, rows, basis, showBar, barPct }: {
  icon: string; label: string; value: string; valueColor?: string; sub: string;
  rows: { label: string; value: string }[]; basis: string; showBar?: boolean; barPct?: number
}) {
  const barWidth = showBar ? Math.min(100, barPct ?? 0) : 0
  return (
    <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, padding: '18px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 16 }}>{icon}</span>
        <span style={{ fontSize: 10.5, fontWeight: 700, color: '#64748B', letterSpacing: '0.07em' }}>{label}</span>
      </div>
      <div style={{ marginBottom: showBar ? 10 : 12 }}>
        <div style={{ fontSize: 28, fontWeight: 700, color: valueColor || '#0F172A', lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 3 }}>{sub}</div>
      </div>
      {showBar && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ height: 5, backgroundColor: '#E2E8F0', borderRadius: 3, overflow: 'hidden', marginBottom: 4 }}>
            <div style={{ height: '100%', width: `${barWidth}%`, background: 'linear-gradient(to right, #16A34A, #F59E0B)', borderRadius: 3 }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 9, color: '#94A3B8' }}>0%</span>
            <span style={{ fontSize: 9, color: '#DC2626', fontWeight: 700 }}>30% critical</span>
            <span style={{ fontSize: 9, color: '#94A3B8' }}>100%</span>
          </div>
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
        {rows.map(({ label, value }) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, color: '#94A3B8' }}>{label}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#0F172A' }}>{value}</span>
          </div>
        ))}
      </div>
      <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: 8 }}>
        <span style={{ fontSize: 10, color: '#94A3B8' }}>Based on: {basis}</span>
      </div>
    </div>
  )
}

interface FuelData {
  days_to_depletion: number | null
  confidence: { low: number | null; high: number | null }
  accuracy: { r2: number | null; mape: number | null }
  details: { burn_rate_L_per_hour: number; current_fuel_L: number }
  samples: number
}

interface TempData {
  forecast_24h: number | null
  confidence: { low: number | null; high: number | null }
  accuracy: { r2: number | null }
  details: { amplitude_C: number; forecast_24h: number[] }
  samples: number
}

interface RpmData {
  health_score: number | null
  confidence: { low: number | null; high: number | null }
  details: { baseline_rpm: number; current_rpm: number; anomaly_probability: number }
  samples: number
}

interface LeaderboardEntry {
  station_id: string
  fuel: { model: string; r2: number | null; mape: number | null; samples: number }
  temperature: { model: string; r2: number | null; mape: number | null; samples: number }
  rpm_health: { model: string; health_score: number | null; samples: number }
}

const MAX_FUEL: Record<string, number> = { maitri: 25600, bharati: 25000 }

export default function Predictions() {
  const [fuel, setFuel] = useState<FuelData | null>(null)
  const [temp, setTemp] = useState<TempData | null>(null)
  const [rpm, setRpm] = useState<RpmData | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [anomalies, setAnomalies] = useState<any>(null)
  const [ensemble, setEnsemble] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [offline, setOffline] = useState(false)
  const [station, setStation] = useState("maitri")
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchPredictions = () => {
    return Promise.all([
      apiPredictFuel(station),
      apiPredictTemperature(station),
      apiPredictRpmHealth(station),
      apiPredictAnomalies(station),
      apiPredictEnsemble(station),
    ]).then(([f, t, r, a, e]) => {
      setFuel(f)
      setTemp(t)
      setRpm(r)
      setAnomalies(a)
      setEnsemble(e)
      setOffline(false)
    }).catch(() => {
      setOffline(true)
    }).finally(() => setLoading(false))
  }

  useEffect(() => {
    setLoading(true)
    fetchPredictions()
    apiPredictModelAccuracy().then(setLeaderboard).catch(() => {})

    // 10s auto-refresh
    intervalRef.current = setInterval(() => {
      fetchPredictions()
    }, 10000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [station])

  const daysRemaining = fuel?.days_to_depletion ?? 0
  const currentFuel = fuel?.details?.current_fuel_L ?? 12800
  const burnRate = fuel?.details?.burn_rate_L_per_hour ?? 155

  // Fuel percentage for the bar
  const fuelPct = Math.round((currentFuel / (MAX_FUEL[station] || 25600)) * 100)

  // Build dynamic fuel chart points from API forecast
  const dynamicPoints = daysRemaining > 0
    ? Array.from({ length: 7 }, (_, i) => ({
        day: Math.round(daysRemaining * (i / 6)),
        label: i === 0 ? 'Today' : `+${Math.round(daysRemaining * (i / 6))}d`,
        pct: Math.round(Math.max(0, fuelPct * (1 - i / 6))),
      }))
    : [
        { day: 0, label: 'Today', pct: fuelPct },
        { day: 7, label: '+7d', pct: Math.round(fuelPct * 0.75) },
        { day: 14, label: '+14d', pct: Math.round(fuelPct * 0.50) },
        { day: 21, label: '+21d', pct: 32 },
        { day: 28, label: '+28d', pct: 15 },
      ]

  const healthScore = rpm?.health_score ?? 85
  const healthColor = healthScore >= 80 ? '#16A34A' : healthScore >= 60 ? '#F59E0B' : '#DC2626'
  const riskLevel = healthScore >= 80 ? 'LOW' : healthScore >= 60 ? 'MODERATE' : 'HIGH'

  return (
    <div style={{ padding: 32 }}>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#0F172A', margin: 0 }}>Predictive Analytics</h1>
        <p style={{ fontSize: 13, color: '#64748B', margin: '5px 0 0' }}>ML-powered forecasting for station resources and operational risk</p>
      </div>

      {/* Station selector + status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {['maitri', 'bharati'].map(s => (
            <button key={s} onClick={() => setStation(s)}
              style={{ padding: '6px 16px', borderRadius: 6, border: station === s ? '2px solid #1677FF' : '1px solid #E2E8F0',
                backgroundColor: station === s ? '#EFF6FF' : '#FFFFFF', color: station === s ? '#1677FF' : '#64748B',
                cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'inherit', textTransform: 'capitalize' }}>
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
        {offline && (
          <span style={{ fontSize: 11, color: '#DC2626', fontWeight: 600, backgroundColor: '#FEF2F2', padding: '3px 10px', borderRadius: 4 }}>
            OFFLINE — showing last known data
          </span>
        )}
        {!loading && !offline && (
          <span style={{ fontSize: 11, color: '#16A34A', fontWeight: 600, backgroundColor: '#F0FDF4', padding: '3px 10px', borderRadius: 4 }}>
            LIVE — auto-refreshing every 10s
          </span>
        )}
      </div>

      {/* Top metric cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 16 }}>
        <MetricCard
          icon="⛽" label="FUEL FORECAST" value={daysRemaining > 0 ? `${daysRemaining} days` : '—'} sub="until depletion"
          showBar barPct={fuelPct}
          rows={[
            { label: 'Current', value: `${currentFuel.toLocaleString()} L` },
            { label: 'Burn rate', value: `${burnRate} L/h` },
            { label: 'R² accuracy', value: fuel?.accuracy?.r2 ? `${(fuel.accuracy.r2 * 100).toFixed(1)}%` : '—' },
          ]}
          basis="Linear Regression (Fuel)"
        />
        <MetricCard
          icon="🌡" label="TEMPERATURE FORECAST" value={temp?.forecast_24h != null ? `${temp.forecast_24h}°C` : '—'} sub="24h prediction"
          rows={[
            { label: 'Confidence', value: temp?.confidence ? `${temp.confidence.low}° — ${temp.confidence.high}°` : '—' },
            { label: 'Amplitude', value: temp?.details?.amplitude_C ? `${temp.details.amplitude_C}°C` : '—' },
            { label: 'R² accuracy', value: temp?.accuracy?.r2 ? `${(temp.accuracy.r2 * 100).toFixed(1)}%` : '—' },
          ]}
          basis="Sinusoidal Fit (Temperature)"
        />
        <MetricCard
          icon="⚡" label="GENERATOR HEALTH" value={healthScore >= 0 ? `${healthScore}` : '—'} valueColor={healthColor} sub={`Risk: ${riskLevel}`}
          rows={[
            { label: 'Baseline RPM', value: rpm?.details?.baseline_rpm ? `${rpm.details.baseline_rpm}` : '—' },
            { label: 'Current RPM', value: rpm?.details?.current_rpm ? `${rpm.details.current_rpm}` : '—' },
            { label: 'Anomaly prob', value: rpm?.details?.anomaly_probability != null ? `${(rpm.details.anomaly_probability * 100).toFixed(1)}%` : '—' },
          ]}
          basis="EMA Health Score (RPM)"
        />
      </div>

      {/* Chart + Model Details */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 310px', gap: 14 }}>
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, padding: '20px' }}>
          <div style={{ marginBottom: 14 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: '#0F172A', margin: 0 }}>Fuel Consumption Forecast</h2>
            <p style={{ fontSize: 12, color: '#64748B', margin: '4px 0 0' }}>
              Projected levels · {loading ? 'Loading...' : `${daysRemaining} days remaining`}
            </p>
          </div>
          <FuelForecastChart points={dynamicPoints} />
        </div>

        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, padding: '20px' }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: '#0F172A', margin: '0 0 16px' }}>Model Details</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ padding: '10px 12px', backgroundColor: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#0F172A', marginBottom: 4 }}>Fuel Prediction</div>
              <div style={{ fontSize: 10, color: '#64748B' }}>Linear regression on fuel level vs time</div>
              <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 2 }}>Samples: {fuel?.samples ?? '—'} · R²: {fuel?.accuracy?.r2 ? (fuel.accuracy.r2 * 100).toFixed(1) : '—'}%</div>
            </div>
            <div style={{ padding: '10px 12px', backgroundColor: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#0F172A', marginBottom: 4 }}>Temperature Forecast</div>
              <div style={{ fontSize: 10, color: '#64748B' }}>Sinusoidal fit (24h polar diurnal cycle)</div>
              <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 2 }}>Samples: {temp?.samples ?? '—'} · R²: {temp?.accuracy?.r2 ? (temp.accuracy.r2 * 100).toFixed(1) : '—'}%</div>
            </div>
            <div style={{ padding: '10px 12px', backgroundColor: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#0F172A', marginBottom: 4 }}>Ensemble Risk</div>
              <div style={{ fontSize: 10, color: '#64748B' }}>CUSUM + Z-score vote</div>
              <div style={{ fontSize: 10, marginTop: 2, color: ensemble?.alert_level === 'critical' ? '#DC2626' : ensemble?.alert_level === 'warning' ? '#D97706' : '#16A34A', fontWeight: 600 }}>
                {ensemble?.alert_level ? ensemble.alert_level.toUpperCase() : '—'}
                {ensemble?.anomaly_score != null && <span style={{ color: '#94A3B8', fontWeight: 400 }}> · score {ensemble.anomaly_score}</span>}
              </div>
            </div>
            <div style={{ padding: '10px 12px', backgroundColor: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#0F172A', marginBottom: 4 }}>Anomaly Detection</div>
              <div style={{ fontSize: 10, color: '#64748B' }}>Z-score ensemble (1h + 48h windows)</div>
              <div style={{ fontSize: 10, marginTop: 2, color: '#94A3B8' }}>
                {anomalies?.anomalies ? `${anomalies.anomalies.length} anomalies detected` : 'No anomalies'}
              </div>
            </div>
          </div>
          <button
            onClick={() => { setLoading(true); fetchPredictions() }}
            style={{ marginTop: 18, width: '100%', padding: '10px', backgroundColor: '#1677FF', color: '#FFFFFF', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'inherit' }}>
            Refresh Predictions
          </button>
        </div>
      </div>

      {/* Model Accuracy Leaderboard */}
      {leaderboard.length > 0 && (
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, padding: '20px', marginTop: 14 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: '#0F172A', margin: '0 0 16px' }}>Model Accuracy Leaderboard</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {leaderboard.map(entry => (
              <div key={entry.station_id} style={{ padding: '14px 16px', backgroundColor: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 10, textTransform: 'capitalize' }}>
                  {entry.station_id.replace('_', ' ')}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: '#64748B' }}>Fuel R²</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: entry.fuel.r2 && entry.fuel.r2 >= 0.9 ? '#16A34A' : entry.fuel.r2 && entry.fuel.r2 >= 0.7 ? '#F59E0B' : '#DC2626' }}>
                      {entry.fuel.r2 != null ? `${(entry.fuel.r2 * 100).toFixed(1)}%` : '—'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: '#64748B' }}>Temp R²</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: entry.temperature.r2 && entry.temperature.r2 >= 0.9 ? '#16A34A' : entry.temperature.r2 && entry.temperature.r2 >= 0.7 ? '#F59E0B' : '#DC2626' }}>
                      {entry.temperature.r2 != null ? `${(entry.temperature.r2 * 100).toFixed(1)}%` : '—'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: '#64748B' }}>Health</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#0F172A' }}>
                      {entry.rpm_health.health_score != null ? `${entry.rpm_health.health_score}` : '—'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
