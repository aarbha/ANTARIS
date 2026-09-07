import { useState } from 'react'
import { apiRunWhatIf } from '../lib/api'

type Scenario = 'storm' | 'generator' | 'fuel' | 'comms'

const scenarios: { id: Scenario; label: string; icon: string }[] = [
  { id: 'storm', label: 'Severe Storm', icon: '🌪' },
  { id: 'generator', label: 'Generator Failure', icon: '⚡' },
  { id: 'fuel', label: 'Fuel Shortage', icon: '⛽' },
  { id: 'comms', label: 'Communication Loss', icon: '📡' },
]

interface SimResult {
  risk: { level: string; fuel_autonomy_days: number; estimated_blackout_hour: number | null; estimated_freeze_hour: number | null }
  actions: string[]
  timeline: { hour: number; fuel_liters: number; indoor_temp_c: number; battery_soc_pct: number; habitability_pct: number }[]
  milestones: { type: string; hour: number; severity: string; message: string }[]
}

const fallbackResults: Record<Scenario, {
  risk: string; riskColor: string; riskBg: string;
  impacts: { label: string; value: string; up?: boolean }[];
  actions: string[];
  summary: string;
}> = {
  storm: {
    risk: 'HIGH RISK', riskColor: '#DC2626', riskBg: '#FEF2F2',
    summary: 'Severe storm conditions will significantly increase energy demand and suspend outdoor operations.',
    impacts: [
      { label: 'Energy demand', value: '+18%', up: true },
      { label: 'Fuel consumption', value: '+26%', up: true },
      { label: 'Outdoor activity', value: 'Suspended' },
      { label: 'Supply operations', value: 'Halted' },
    ],
    actions: ['Activate backup generator', 'Reduce non-essential loads', 'Suspend outdoor operations', 'Prioritize communication systems', 'Secure all equipment'],
  },
  generator: {
    risk: 'CRITICAL', riskColor: '#DC2626', riskBg: '#FEF2F2',
    summary: 'Generator failure critically reduces station power. Immediate survival-mode protocols required.',
    impacts: [
      { label: 'Power availability', value: '-60%' },
      { label: 'Heating capacity', value: '-40%' },
      { label: 'Lab operations', value: 'Suspended' },
      { label: 'Communication', value: 'Emergency only' },
    ],
    actions: ['Switch to emergency power', 'Activate station survival mode', 'Contact HQ immediately', 'Prepare evacuation protocol', 'Deploy solar backup panels'],
  },
  fuel: {
    risk: 'MODERATE RISK', riskColor: '#F59E0B', riskBg: '#FFFBEB',
    summary: 'Fuel shortage limits generator runtime. Strict rationing needed to extend operational duration.',
    impacts: [
      { label: 'Fuel remaining', value: '12 days' },
      { label: 'Heating operations', value: 'Priority mode' },
      { label: 'Generator runtime', value: '-30%' },
      { label: 'Resupply urgency', value: 'Immediate' },
    ],
    actions: ['Reduce heating to minimum safe levels', 'Halt non-critical generator use', 'Request emergency resupply', 'Implement fuel rationing protocol'],
  },
  comms: {
    risk: 'MODERATE RISK', riskColor: '#F59E0B', riskBg: '#FFFBEB',
    summary: 'Communication loss isolates the station. Revert to autonomous operations and satellite backup.',
    impacts: [
      { label: 'HQ connectivity', value: 'Lost' },
      { label: 'Data sync', value: 'Offline' },
      { label: 'Weather updates', value: 'Manual only' },
      { label: 'Emergency contact', value: 'Satellite backup' },
    ],
    actions: ['Activate satellite phone backup', 'Switch to radio protocol', 'Record all actions locally', 'Attempt HQ contact every 2 hours'],
  },
}

export default function Simulation() {
  const [station, setStation] = useState<'maitri' | 'bharati'>('maitri')
  const [scenario, setScenario] = useState<Scenario>('storm')
  const [windSpeed, setWindSpeed] = useState(75)
  const [temperature, setTemperature] = useState(-24)
  const [state, setState] = useState<'idle' | 'running' | 'done'>('idle')
  const [apiResult, setApiResult] = useState<SimResult | null>(null)
  const [offline, setOffline] = useState(false)

  function scenarioToParams(s: Scenario) {
    switch (s) {
      case 'storm': return { outdoor_temp: temperature, storm_duration_hours: Math.round(windSpeed / 5), generators_offline: 0, supply_delay_days: 0 }
      case 'generator': return { outdoor_temp: temperature, storm_duration_hours: 0, generators_offline: 2, supply_delay_days: 0 }
      case 'fuel': return { outdoor_temp: temperature, storm_duration_hours: 0, generators_offline: 0, supply_delay_days: 14 }
      case 'comms': return { outdoor_temp: temperature, storm_duration_hours: 12, generators_offline: 0, supply_delay_days: 7 }
    }
  }

  async function run() {
    setState('running')
    setOffline(false)
    try {
      const params = scenarioToParams(scenario)
      const result = await apiRunWhatIf({ station_id: station, ...params })
      setApiResult(result)
    } catch {
      setApiResult(null)
      setOffline(true)
    }
    setState('done')
  }

  function reset() {
    setState('idle')
    setApiResult(null)
  }

  // Build display result from API or fallback
  const fb = fallbackResults[scenario]
  const riskLevel = apiResult?.risk?.level || fb.risk
  const riskColor = riskLevel.includes('CRITICAL') ? '#DC2626' : riskLevel.includes('HIGH') ? '#F97316' : riskLevel.includes('MODERATE') ? '#F59E0B' : '#16A34A'
  const riskBg = riskLevel.includes('CRITICAL') ? '#FEF2F2' : riskLevel.includes('HIGH') ? '#FFF7ED' : riskLevel.includes('MODERATE') ? '#FFFBEB' : '#F0FDF4'

  const impacts = apiResult ? [
    { label: 'Fuel autonomy', value: `${apiResult.risk.fuel_autonomy_days} days` },
    { label: 'Risk level', value: apiResult.risk.level, up: apiResult.risk.level !== 'LOW' },
    { label: 'Blackout at', value: apiResult.risk.estimated_blackout_hour != null ? `Hour ${apiResult.risk.estimated_blackout_hour}` : 'None' },
    { label: 'Freeze at', value: apiResult.risk.estimated_freeze_hour != null ? `Hour ${apiResult.risk.estimated_freeze_hour}` : 'None' },
  ] : fb.impacts

  const actions = apiResult?.actions || fb.actions
  const summary = apiResult ? `Simulation complete for ${station === 'maitri' ? 'Maitri' : 'Bharati'} station under ${scenario} scenario.` : fb.summary

  return (
    <div style={{ padding: 32 }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#0F172A', margin: 0 }}>Scenario Simulator</h1>
        <p style={{ fontSize: 13, color: '#64748B', margin: '5px 0 0' }}>Multi-physics what-if simulation engine — powered by backend models</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '348px 1fr', gap: 14 }}>
        {/* Control panel */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, padding: '24px' }}>
          {/* Station */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 10.5, fontWeight: 700, color: '#64748B', letterSpacing: '0.07em', display: 'block', marginBottom: 8 }}>SELECT STATION</label>
            <select
              value={station} onChange={e => { setStation(e.target.value as typeof station); reset() }}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 13, color: '#0F172A', background: 'white', cursor: 'pointer', fontFamily: 'inherit' }}>
              <option value="maitri">Maitri Station</option>
              <option value="bharati">Bharati Station</option>
            </select>
          </div>

          {/* Scenario */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 10.5, fontWeight: 700, color: '#64748B', letterSpacing: '0.07em', display: 'block', marginBottom: 8 }}>SELECT SCENARIO</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {scenarios.map(({ id, label, icon }) => (
                <label key={id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', border: `1px solid ${scenario === id ? '#1677FF' : '#E2E8F0'}`, borderRadius: 8, backgroundColor: scenario === id ? '#EAF4FF' : 'transparent', cursor: 'pointer' }}>
                  <input type="radio" name="scenario" value={id} checked={scenario === id} onChange={() => { setScenario(id); reset() }} style={{ accentColor: '#1677FF' }} />
                  <span style={{ fontSize: 15 }}>{icon}</span>
                  <span style={{ fontSize: 13, color: '#0F172A', fontWeight: scenario === id ? 600 : 400 }}>{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Parameters */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 10.5, fontWeight: 700, color: '#64748B', letterSpacing: '0.07em', display: 'block', marginBottom: 12 }}>SIMULATION PARAMETERS</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 12, color: '#64748B' }}>Wind speed</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#0F172A' }}>{windSpeed} km/h</span>
                </div>
                <input type="range" min={0} max={250} value={windSpeed} onChange={e => { setWindSpeed(Number(e.target.value)); reset() }} style={{ width: '100%', accentColor: '#1677FF' }} />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 12, color: '#64748B' }}>Temperature</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#0F172A' }}>{temperature}°C</span>
                </div>
                <input type="range" min={-70} max={0} value={temperature} onChange={e => { setTemperature(Number(e.target.value)); reset() }} style={{ width: '100%', accentColor: '#1677FF' }} />
              </div>
            </div>
          </div>

          <button
            onClick={run}
            disabled={state === 'running'}
            style={{ width: '100%', padding: '12px', backgroundColor: state === 'running' ? '#94A3B8' : '#1677FF', color: '#FFFFFF', border: 'none', borderRadius: 8, cursor: state === 'running' ? 'default' : 'pointer', fontSize: 14, fontWeight: 700, fontFamily: 'inherit', transition: 'background-color 0.15s' }}>
            {state === 'running' ? 'Running Simulation...' : state === 'done' ? 'Re-run Simulation' : 'Run Simulation'}
          </button>
        </div>

        {/* Result panel */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, padding: '24px', display: 'flex', flexDirection: 'column' }}>
          {state === 'idle' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', gap: 14 }}>
              <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
                <circle cx="26" cy="26" r="24" stroke="#E2E8F0" strokeWidth="2" />
                <path d="M22 26l3 3 6-6" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="26" cy="26" r="10" stroke="#E2E8F0" strokeWidth="1.5" strokeDasharray="3,3" />
              </svg>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#64748B', marginBottom: 4 }}>Ready to simulate</div>
                <div style={{ fontSize: 12 }}>Configure a scenario and parameters, then run the simulation</div>
              </div>
            </div>
          )}

          {state === 'running' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid #E2E8F0', borderTopColor: '#1677FF', animation: 'spin 0.9s linear infinite' }} />
              <div style={{ fontSize: 13, color: '#64748B' }}>Running multi-physics simulation...</div>
            </div>
          )}

          {state === 'done' && (
            <div>
              {offline && (
                <div style={{ backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 6, padding: '10px 14px', marginBottom: 16, fontSize: 12, color: '#92400E' }}>
                  API unreachable — showing sample scenario results
                </div>
              )}
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 10.5, color: '#94A3B8', fontWeight: 700, letterSpacing: '0.07em', marginBottom: 8 }}>SIMULATION RESULT</div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, backgroundColor: riskBg, border: `1px solid ${riskColor}30`, borderRadius: 9, padding: '10px 18px', marginBottom: 10 }}>
                  <div style={{ width: 10, height: 10, backgroundColor: riskColor, borderRadius: '50%' }} />
                  <span style={{ fontSize: 18, fontWeight: 800, color: riskColor, letterSpacing: '0.02em' }}>{riskLevel}</span>
                </div>
                <p style={{ fontSize: 13, color: '#64748B', margin: 0, lineHeight: 1.5 }}>{summary}</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 18 }}>
                <div>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: '#64748B', letterSpacing: '0.07em', marginBottom: 12 }}>EXPECTED IMPACT</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {impacts.map(({ label, value, up }) => (
                      <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 13, color: '#64748B' }}>{label}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: up ? '#DC2626' : '#0F172A' }}>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: '#64748B', letterSpacing: '0.07em', marginBottom: 12 }}>RECOMMENDED ACTIONS</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                    {actions.map((action: string, i: number) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
                        <div style={{ width: 18, height: 18, borderRadius: '50%', backgroundColor: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <path d="M2 5L4 7L8 3" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        <span style={{ fontSize: 12.5, color: '#0F172A', lineHeight: 1.4 }}>{action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Timeline mini chart */}
              {apiResult?.timeline && apiResult.timeline.length > 0 && (
                <div style={{ marginBottom: 18 }}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: '#64748B', letterSpacing: '0.07em', marginBottom: 10 }}>TIMELINE (fuel + habitability)</div>
                  <div style={{ height: 100, position: 'relative', backgroundColor: '#F8FAFC', borderRadius: 8, padding: '10px 12px', border: '1px solid #E2E8F0' }}>
                    <svg viewBox="0 0 400 80" style={{ width: '100%', height: '100%' }}>
                      {apiResult.timeline.map((point, i) => {
                        const x = (point.hour / Math.max(apiResult.timeline[apiResult.timeline.length - 1].hour, 1)) * 380 + 10
                        const yFuel = 75 - (point.fuel_liters / 15000) * 65
                        const yHab = 75 - (point.habitability_pct / 100) * 65
                        return (
                          <g key={i}>
                            <circle cx={x} cy={yFuel} r="2.5" fill="#1677FF" />
                            <circle cx={x} cy={yHab} r="2.5" fill="#16A34A" />
                          </g>
                        )
                      })}
                      <polyline
                        points={apiResult.timeline.map((p, i) => {
                          const x = (p.hour / Math.max(apiResult.timeline[apiResult.timeline.length - 1].hour, 1)) * 380 + 10
                          const y = 75 - (p.fuel_liters / 15000) * 65
                          return `${x},${y}`
                        }).join(' ')}
                        fill="none" stroke="#1677FF" strokeWidth="1.5"
                      />
                      <polyline
                        points={apiResult.timeline.map((p, i) => {
                          const x = (p.hour / Math.max(apiResult.timeline[apiResult.timeline.length - 1].hour, 1)) * 380 + 10
                          const y = 75 - (p.habitability_pct / 100) * 65
                          return `${x},${y}`
                        }).join(' ')}
                        fill="none" stroke="#16A34A" strokeWidth="1.5" strokeDasharray="4,2"
                      />
                    </svg>
                    <div style={{ display: 'flex', gap: 16, marginTop: 4 }}>
                      <span style={{ fontSize: 9, color: '#1677FF' }}>● Fuel</span>
                      <span style={{ fontSize: 9, color: '#16A34A' }}>● Habitability</span>
                    </div>
                  </div>
                </div>
              )}

              <div style={{ backgroundColor: '#F5F8FC', borderRadius: 8, padding: '14px 16px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, borderTop: '2px solid #E2E8F0' }}>
                {[
                  { label: 'Station', value: station === 'maitri' ? 'Maitri' : 'Bharati' },
                  { label: 'Scenario', value: scenario },
                  { label: 'Temperature', value: `${temperature}°C` },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <div style={{ fontSize: 10, color: '#94A3B8', marginBottom: 2 }}>{label}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
