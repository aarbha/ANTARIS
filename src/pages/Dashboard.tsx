import { useState } from "react"
import { useApp } from "../context/AppContext"
import type { StationState, ResearchExperiment } from "../context/AppContext"
import type { Page } from "../types"
import antarcticImage from "../imports/Sentinel_Range__Ellsworth_Mountains__Antarctica.jpg"
const card: React.CSSProperties = {
  backgroundColor: "#FFFFFF",
  border: "1px solid #E2E8F0",
  borderRadius: 6,
  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  padding: "20px 24px",
}

function EditStationModal({
  station,
  data,
  onSave,
  onClose,
}: {
  station: string
  data: StationState
  onSave: (updates: Partial<StationState>) => void
  onClose: () => void
}) {
  const [temp, setTemp] = useState(String(data.temp))
  const [wind, setWind] = useState(String(data.wind))
  const [fuelPct, setFuelPct] = useState(String(data.fuelPct))
  const [fuelL, setFuelL] = useState(String(data.fuelL))
  const [fuelConsumption, setFuelConsumption] = useState(
    String(data.fuelConsumption),
  )
  const [powerGen, setPowerGen] = useState(String(data.powerGen))
  const [powerCon, setPowerCon] = useState(String(data.powerCon))
  const [personnel, setPersonnel] = useState(String(data.personnel))

  function handleSave() {
    onSave({
      temp: Number(temp),
      wind: Number(wind),
      fuelPct: Number(fuelPct),
      fuelL: Number(fuelL),
      fuelConsumption: Number(fuelConsumption),
      powerGen: Number(powerGen),
      powerCon: Number(powerCon),
      personnel: Number(personnel),
    })
    onClose()
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "8px 10px",
    border: "1px solid #E2E8F0",
    borderRadius: 4,
    fontSize: 13,
    boxSizing: "border-box",
    outline: "none",
  }

  const labelStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 500,
    color: "#64748B",
    marginBottom: 4,
    display: "block",
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "#FFF",
          borderRadius: 6,
          padding: 28,
          width: 480,
          maxHeight: "85vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: 16,
              fontWeight: 600,
              color: "#0F172A",
            }}
          >
            Edit {station} Station
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 18,
              color: "#94A3B8",
            }}
          >
            x
          </button>
        </div>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
        >
          {[
            { label: "Temperature (C)", val: temp, set: setTemp },
            { label: "Wind Speed (km/h)", val: wind, set: setWind },
            { label: "Fuel (%)", val: fuelPct, set: setFuelPct },
            { label: "Fuel (L)", val: fuelL, set: setFuelL },
            {
              label: "Fuel Consumption (L/day)",
              val: fuelConsumption,
              set: setFuelConsumption,
            },
            { label: "Power Generated (MW)", val: powerGen, set: setPowerGen },
            { label: "Power Consumed (MW)", val: powerCon, set: setPowerCon },
            { label: "Personnel", val: personnel, set: setPersonnel },
          ].map(({ label, val, set }) => (
            <div key={label}>
              <label style={labelStyle}>{label}</label>
              <input
                type="number"
                value={val}
                onChange={(e) => set(e.target.value)}
                style={inputStyle}
              />
            </div>
          ))}
        </div>
        <div
          style={{
            display: "flex",
            gap: 10,
            marginTop: 24,
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "8px 16px",
              border: "1px solid #E2E8F0",
              borderRadius: 4,
              background: "#FFF",
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: "8px 16px",
              backgroundColor: "#1677FF",
              color: "#FFF",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}

function CircularGauge({
  pct,
  size = 80,
  color,
}: {
  pct: number
  size?: number
  color: string
}) {
  const r = (size - 10) / 2
  const circ = 2 * Math.PI * r
  const filled = (pct / 100) * circ
  return (
    <svg width={size} height={size}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#E2E8F0"
        strokeWidth={8}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={8}
        strokeDasharray={`${filled} ${circ - filled}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x={size / 2}
        y={size / 2 + 5}
        textAnchor="middle"
        fontSize={13}
        fontWeight={700}
        fill="#0F172A"
      >
        {pct}%
      </text>
    </svg>
  )
}

function StationCard({
  name,
  data,
  onEdit,
}: {
  name: string
  data: StationState
  onEdit: () => void
}) {
  const statusColor =
    data.status === "operational"
      ? "#16A34A"
      : data.status === "degraded"
        ? "#F59E0B"
        : "#DC2626"
  return (
    <div style={{ ...card, position: "relative" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 16,
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 4,
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: 14,
                fontWeight: 600,
                color: "#0F172A",
              }}
            >
              {name} Station
            </h3>
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: statusColor,
                backgroundColor: statusColor + "18",
                padding: "2px 8px",
                borderRadius: 3,
                letterSpacing: "0.06em",
              }}
            >
              {data.status.toUpperCase()}
            </span>
          </div>
          <p style={{ margin: 0, fontSize: 12, color: "#94A3B8" }}>
            Last sync: {data.lastSync}
          </p>
        </div>
        <button
          onClick={onEdit}
          style={{
            background: "none",
            border: "1px solid #E2E8F0",
            borderRadius: 4,
            padding: "4px 8px",
            cursor: "pointer",
            fontSize: 11,
            color: "#64748B",
          }}
        >
          Edit
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div>
          <div style={{ fontSize: 11, color: "#94A3B8", marginBottom: 2 }}>
            Temperature
          </div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: "#0F172A",
              lineHeight: 1,
            }}
          >
            {data.temp}C
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: "#94A3B8", marginBottom: 2 }}>
            Conditions
          </div>
          <div style={{ fontSize: 13, fontWeight: 500, color: "#475569" }}>
            {data.weather}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: "#94A3B8", marginBottom: 2 }}>
            Wind
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#0F172A" }}>
            {data.wind} km/h {data.windDir}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: "#94A3B8", marginBottom: 2 }}>
            Personnel
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#0F172A" }}>
            {data.personnel}
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 24,
          paddingTop: 14,
          borderTop: "1px solid #F1F5F9",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span style={{ fontSize: 11, color: "#94A3B8" }}>Power Gen</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>
            {data.powerGen} MW
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span style={{ fontSize: 11, color: "#94A3B8" }}>Power Con</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>
            {data.powerCon} MW
          </span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginLeft: "auto",
          }}
        >
          <CircularGauge
            pct={data.fuelPct}
            size={56}
            color={
              data.fuelPct < 40
                ? "#DC2626"
                : data.fuelPct < 60
                  ? "#F59E0B"
                  : "#1677FF"
            }
          />
          <div>
            <div style={{ fontSize: 11, color: "#94A3B8" }}>Fuel</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#0F172A" }}>
              {(data.fuelL / 1000).toFixed(1)}k L
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function AlertItem({
  severity,
  title,
  station,
  time,
}: {
  severity: string
  title: string
  station: string
  time: string
}) {
  const colors: Record<string, { bg: string; text: string }> = {
    critical: { bg: "#FEF2F2", text: "#DC2626" },
    warning: { bg: "#FFFBEB", text: "#F59E0B" },
    advisory: { bg: "#EFF6FF", text: "#2563EB" },
    info: { bg: "#F0FDF4", text: "#16A34A" },
  }
  const c = colors[severity] || colors.info
  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        padding: "12px 0",
        borderBottom: "1px solid #F1F5F9",
      }}
    >
      <span
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: c.text,
          backgroundColor: c.bg,
          padding: "3px 8px",
          borderRadius: 3,
          alignSelf: "flex-start",
          letterSpacing: "0.06em",
          whiteSpace: "nowrap",
        }}
      >
        {severity.toUpperCase()}
      </span>
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: "#0F172A",
            marginBottom: 2,
          }}
        >
          {title}
        </div>
        <div style={{ fontSize: 11, color: "#94A3B8" }}>
          {station} · {time}
        </div>
      </div>
    </div>
  )
}

type ExpTab = "overview" | "observations" | "data" | "team" | "activity"

function statusBadge(status: ResearchExperiment["status"]) {
  const map: Record<string, { bg: string; color: string }> = {
    Active: { bg: "#DCFCE7", color: "#16A34A" },
    "Data Collection": { bg: "#DBEAFE", color: "#1D4ED8" },
    Analysis: { bg: "#FEF3C7", color: "#D97706" },
    Completed: { bg: "#F1F5F9", color: "#64748B" },
    Paused: { bg: "#FEF3C7", color: "#F59E0B" },
  }
  const c = map[status] || map.Completed
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 700,
        color: c.color,
        backgroundColor: c.bg,
        padding: "2px 7px",
        borderRadius: 3,
        letterSpacing: "0.05em",
        whiteSpace: "nowrap",
      }}
    >
      {status.toUpperCase()}
    </span>
  )
}

function ExpModal({
  exp,
  stationData,
  onClose,
}: {
  exp: ResearchExperiment
  stationData: StationState
  onClose: () => void
}) {
  const [tab, setTab] = useState<ExpTab>("overview")

  const tabs: { key: ExpTab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "observations", label: "Observations" },
    { key: "data", label: "Data" },
    { key: "team", label: "Team" },
    { key: "activity", label: "Activity" },
  ]

  const activityLog = [
    { day: "02 Sep", entry: "Experiment initialised. Equipment deployed and calibrated." },
    { day: "03 Sep", entry: "First samples collected. Initial readings nominal." },
    { day: "04 Sep", entry: "Continued data collection. Minor sensor adjustment required." },
    { day: "05 Sep", entry: "Full day of collection. Data uploaded to server." },
    { day: "06 Sep", entry: exp.researchNotes },
  ]

  const barHeights = [30, 45, 28, 52, 38, 60, exp.samplesCollected > 10 ? 70 : 45]

  return (
    <div
      style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100 }}
      onClick={onClose}
    >
      <div
        style={{ backgroundColor: "#FFF", borderRadius: 8, width: 720, maxHeight: "88vh", overflowY: "auto", display: "flex", flexDirection: "column" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: "20px 24px 0", borderBottom: "1px solid #E2E8F0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 10, fontWeight: 700, backgroundColor: "#0B1F33", color: "#FFF", padding: "2px 8px", borderRadius: 3 }}>{exp.station.toUpperCase()}</span>
                {statusBadge(exp.status)}
              </div>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#0F172A" }}>{exp.name}</h2>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: "#64748B" }}>{exp.id} · {exp.researcher}</p>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#94A3B8", padding: 4 }}>×</button>
          </div>
          <div style={{ display: "flex", gap: 0 }}>
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                style={{
                  padding: "10px 16px",
                  fontSize: 13,
                  fontWeight: 500,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: tab === t.key ? "#1677FF" : "#64748B",
                  borderBottom: tab === t.key ? "2px solid #1677FF" : "2px solid transparent",
                  marginBottom: -1,
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "20px 24px", flex: 1 }}>
          {tab === "overview" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#64748B", marginBottom: 6 }}>OBJECTIVE</div>
                <p style={{ margin: 0, fontSize: 13, color: "#0F172A", lineHeight: 1.6 }}>{exp.objective}</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                {[
                  { label: "Start Date", value: exp.startDate },
                  { label: "Expected Completion", value: exp.expectedCompletion },
                  { label: "Last Update", value: exp.lastUpdate },
                ].map((item) => (
                  <div key={item.label} style={{ backgroundColor: "#F8FAFC", borderRadius: 6, padding: "10px 14px" }}>
                    <div style={{ fontSize: 11, color: "#94A3B8", marginBottom: 3 }}>{item.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>{item.value}</div>
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#64748B", marginBottom: 8 }}>EQUIPMENT ({exp.equipment.length})</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {exp.equipment.map((eq) => (
                    <span key={eq} style={{ fontSize: 12, backgroundColor: "#EFF6FF", color: "#1D4ED8", padding: "4px 10px", borderRadius: 4, fontWeight: 500 }}>{eq}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === "observations" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#64748B", marginBottom: 6 }}>FIELD OBSERVATIONS</div>
                <p style={{ margin: 0, fontSize: 13, color: "#0F172A", lineHeight: 1.6, backgroundColor: "#F8FAFC", padding: "12px 16px", borderRadius: 6 }}>{exp.observations}</p>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#64748B", marginBottom: 8 }}>STATION CONDITIONS ({exp.station})</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
                  {[
                    { label: "Temperature", value: `${stationData.temp}°C` },
                    { label: "Wind", value: `${stationData.wind} km/h ${stationData.windDir}` },
                    { label: "Pressure", value: `${stationData.pressure} hPa` },
                    { label: "Visibility", value: `${stationData.visibility} km` },
                  ].map((item) => (
                    <div key={item.label} style={{ backgroundColor: "#F8FAFC", borderRadius: 6, padding: "10px 14px" }}>
                      <div style={{ fontSize: 11, color: "#94A3B8", marginBottom: 3 }}>{item.label}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ backgroundColor: "#F8FAFC", borderRadius: 6, padding: "10px 16px", display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ fontSize: 11, color: "#64748B" }}>Samples Collected</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: "#1677FF" }}>{exp.samplesCollected}</div>
              </div>
            </div>
          )}

          {tab === "data" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {exp.sharedWith ? (
                <div style={{ backgroundColor: "#F0FDF4", border: "1px solid #86EFAC", borderRadius: 6, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                  <span style={{ fontSize: 13, color: "#16A34A", fontWeight: 500 }}>Data shared with <strong>{exp.sharedWith}</strong> station · {exp.dataTransferred} transferred</span>
                </div>
              ) : (
                <div style={{ backgroundColor: "#F8FAFC", borderRadius: 6, padding: "12px 16px" }}>
                  <span style={{ fontSize: 13, color: "#64748B" }}>No data currently shared with other stations.</span>
                </div>
              )}
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#64748B", marginBottom: 10 }}>7-DAY SAMPLE COLLECTION</div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 80 }}>
                  {barHeights.map((h, i) => (
                    <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                      <div style={{ width: "100%", backgroundColor: "#DBEAFE", borderRadius: "3px 3px 0 0", height: h }} />
                      <div style={{ fontSize: 10, color: "#94A3B8", marginTop: 4 }}>D{i + 1}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === "team" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {exp.team.map((member, i) => (
                <div key={member} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", backgroundColor: "#F8FAFC", borderRadius: 6 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", backgroundColor: "#1677FF", color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                    {member.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>{member}</div>
                    <div style={{ fontSize: 11, color: "#64748B" }}>{i === 0 ? "Principal Researcher" : "Research Associate"}</div>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 600, color: i === 0 ? "#1D4ED8" : "#64748B", backgroundColor: i === 0 ? "#DBEAFE" : "#F1F5F9", padding: "2px 8px", borderRadius: 3 }}>
                    {i === 0 ? "PI" : "RA"}
                  </span>
                </div>
              ))}
            </div>
          )}

          {tab === "activity" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {activityLog.map((entry, i) => (
                <div key={i} style={{ display: "flex", gap: 12, paddingBottom: 16 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#1677FF", flexShrink: 0 }} />
                    {i < activityLog.length - 1 && <div style={{ width: 1, flex: 1, backgroundColor: "#E2E8F0", marginTop: 4 }} />}
                  </div>
                  <div style={{ paddingBottom: 8 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "#64748B", marginBottom: 2 }}>{entry.day}</div>
                    <div style={{ fontSize: 13, color: "#0F172A", lineHeight: 1.5 }}>{entry.entry}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Dashboard({
  onNavigate,
}: {
  onNavigate: (p: Page) => void
}) {
  const { maitri, bharati, alerts, activity, updateStation, experiments } = useApp()
  const [editTarget, setEditTarget] = useState<"maitri" | "bharati" | null>(
    null,
  )
  const [selectedExp, setSelectedExp] = useState<ResearchExperiment | null>(null)

  const activeAlerts = alerts.filter((a) => a.status !== "resolved").slice(0, 3)

  return (
    <div>
      {/* Hero band */}
      <div
        style={{
          height: 200,
          position: "relative",
          backgroundImage: `url(${antarcticImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center 20%",
          backgroundColor: "#0B1F33",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(11,31,51,0.50)",
            display: "flex",
            alignItems: "flex-end",
            padding: "24px 32px",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  backgroundColor: "#4ADE80",
                }}
              />
              <span
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.65)",
                  letterSpacing: "0.08em",
                }}
              >
                LIVE STATION NETWORK
              </span>
            </div>
            <h1
              style={{
                margin: "0 0 4px",
                fontSize: 26,
                fontWeight: 700,
                color: "#FFFFFF",
                letterSpacing: "-0.01em",
              }}
            >
              ANTARIS
            </h1>
            <p
              style={{
                margin: 0,
                fontSize: 13,
                color: "rgba(255,255,255,0.55)",
              }}
            >
              <strong>Antarctic Intelligence &amp; Remote Information System · MAITRI · BHARATI · Indian Antarctic Research Programme</strong>
            </p>
          </div>
        </div>
      </div>

      <div style={{ padding: "24px 32px", maxWidth: 1400, margin: "0 auto" }}>
        {/* Station cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <StationCard
            name="Maitri"
            data={maitri}
            onEdit={() => setEditTarget("maitri")}
          />
          <StationCard
            name="Bharati"
            data={bharati}
            onEdit={() => setEditTarget("bharati")}
          />
        </div>

        {/* Middle row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 16,
            marginBottom: 24,
          }}
        >
          {/* Energy */}
          <div style={card}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#64748B",
                marginBottom: 16,
                letterSpacing: "0.06em",
              }}
            >
              ENERGY STATUS
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              {[
                {
                  label: "Maitri Gen",
                  val: `${maitri.powerGen} MW`,
                  color: "#1677FF",
                },
                {
                  label: "Maitri Con",
                  val: `${maitri.powerCon} MW`,
                  color: "#64748B",
                },
                {
                  label: "Bharati Gen",
                  val: `${bharati.powerGen} MW`,
                  color: "#1677FF",
                },
                {
                  label: "Bharati Con",
                  val: `${bharati.powerCon} MW`,
                  color: "#64748B",
                },
              ].map((item) => (
                <div key={item.label}>
                  <div
                    style={{ fontSize: 11, color: "#94A3B8", marginBottom: 3 }}
                  >
                    {item.label}
                  </div>
                  <div
                    style={{ fontSize: 18, fontWeight: 700, color: item.color }}
                  >
                    {item.val}
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => onNavigate("energy")}
              style={{
                marginTop: 16,
                fontSize: 12,
                color: "#1677FF",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                fontWeight: 500,
              }}
            >
              View Energy Details
            </button>
          </div>

          {/* Fuel */}
          <div style={card}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#64748B",
                marginBottom: 16,
                letterSpacing: "0.06em",
              }}
            >
              FUEL RESERVES
            </div>
            <div
              style={{
                display: "flex",
                gap: 24,
                justifyContent: "space-around",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <CircularGauge
                  pct={maitri.fuelPct}
                  size={72}
                  color={maitri.fuelPct < 40 ? "#DC2626" : "#1677FF"}
                />
                <div
                  style={{
                    fontSize: 11,
                    color: "#64748B",
                    marginTop: 6,
                    fontWeight: 500,
                  }}
                >
                  Maitri
                </div>
                <div style={{ fontSize: 11, color: "#94A3B8" }}>
                  {(maitri.fuelL / 1000).toFixed(1)}k L
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <CircularGauge
                  pct={bharati.fuelPct}
                  size={72}
                  color={bharati.fuelPct < 40 ? "#DC2626" : "#1677FF"}
                />
                <div
                  style={{
                    fontSize: 11,
                    color: "#64748B",
                    marginTop: 6,
                    fontWeight: 500,
                  }}
                >
                  Bharati
                </div>
                <div style={{ fontSize: 11, color: "#94A3B8" }}>
                  {(bharati.fuelL / 1000).toFixed(1)}k L
                </div>
              </div>
            </div>
            <button
              onClick={() => onNavigate("fuel")}
              style={{
                marginTop: 16,
                fontSize: 12,
                color: "#1677FF",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                fontWeight: 500,
              }}
            >
              View Fuel Details
            </button>
          </div>

          {/* Alerts */}
          <div style={card}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#64748B",
                  letterSpacing: "0.06em",
                }}
              >
                ACTIVE ALERTS
              </div>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#DC2626",
                  backgroundColor: "#FEF2F2",
                  padding: "2px 8px",
                  borderRadius: 3,
                }}
              >
                {alerts.filter((a) => a.status === "active").length}
              </span>
            </div>
            {activeAlerts.map((alert) => (
              <AlertItem
                key={alert.id}
                severity={alert.severity}
                title={alert.title}
                station={alert.station}
                time={alert.time}
              />
            ))}
            <button
              onClick={() => onNavigate("alerts")}
              style={{
                marginTop: 12,
                fontSize: 12,
                color: "#1677FF",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                fontWeight: 500,
              }}
            >
              View All Alerts
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div style={card}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "#64748B",
              marginBottom: 16,
              letterSpacing: "0.06em",
            }}
          >
            RECENT ACTIVITY
          </div>
          <div>
            {activity.slice(0, 5).map((entry, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 16,
                  padding: "10px 0",
                  borderBottom: i < 4 ? "1px solid #F1F5F9" : "none",
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    color: "#94A3B8",
                    whiteSpace: "nowrap",
                    minWidth: 80,
                  }}
                >
                  {entry.time}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: "#475569",
                    minWidth: 120,
                  }}
                >
                  {entry.action}
                </span>
                <span style={{ fontSize: 12, color: "#64748B", flex: 1 }}>
                  {entry.detail}
                </span>
                <span style={{ fontSize: 12, color: "#94A3B8" }}>
                  {entry.user}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Research Experiments */}
        <div style={{ ...card, marginTop: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#64748B", letterSpacing: "0.06em" }}>ACTIVE RESEARCH EXPERIMENTS</div>
              <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>Read-only · Submitted by researchers</div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {(["Maitri", "Bharati"] as const).map((station) => (
              <div key={station}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#FFFFFF", backgroundColor: "#0B1F33", padding: "3px 10px", borderRadius: 3, display: "inline-block", marginBottom: 10 }}>{station.toUpperCase()}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {experiments.filter((e) => e.station === station).map((exp) => (
                    <div
                      key={exp.id}
                      style={{ padding: "10px 14px", backgroundColor: "#F8FAFC", borderRadius: 6, border: "1px solid #E2E8F0", cursor: "pointer" }}
                      onClick={() => setSelectedExp(exp)}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>{exp.name}</span>
                        {statusBadge(exp.status)}
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 11, color: "#64748B" }}>{exp.researcher}</span>
                        <span style={{ fontSize: 11, color: "#94A3B8" }}>{exp.lastUpdate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {editTarget && (
        <EditStationModal
          station={editTarget.charAt(0).toUpperCase() + editTarget.slice(1)}
          data={editTarget === "maitri" ? maitri : bharati}
          onSave={(updates) => updateStation(editTarget, updates)}
          onClose={() => setEditTarget(null)}
        />
      )}
      {selectedExp && (
        <ExpModal
          exp={selectedExp}
          stationData={selectedExp.station === "Maitri" ? maitri : bharati}
          onClose={() => setSelectedExp(null)}
        />
      )}
    </div>
  )
}
