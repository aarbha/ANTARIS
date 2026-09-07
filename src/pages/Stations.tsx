import { useState } from "react"
import { useApp } from "../context/AppContext"
import type { StationState, AppAlert } from "../context/AppContext"
import maitriImg from "../imports/maitri.jpg"
import bharatiImg from "../imports/bharati_image2.jpg"

const card: React.CSSProperties = {
  backgroundColor: "#FFFFFF",
  border: "1px solid #E2E8F0",
  borderRadius: 6,
  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  padding: "20px 24px",
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
        fontSize={14}
        fontWeight={700}
        fill="#0F172A"
      >
        {pct}%
      </text>
    </svg>
  )
}

const TABS = [
  "Overview",
  "Infrastructure",
  "Energy",
  "Fuel",
  "Weather",
  "Personnel",
  "Live",
]

function StatusBadge({ status }: { status: string }) {
  const color =
    status === "operational"
      ? "#16A34A"
      : status === "degraded"
        ? "#F59E0B"
        : "#DC2626"
  const bg =
    status === "operational"
      ? "#DCFCE7"
      : status === "degraded"
        ? "#FEF3C7"
        : "#FEE2E2"
  return (
    <span
      style={{
        backgroundColor: bg,
        color,
        borderRadius: 4,
        padding: "2px 10px",
        fontSize: 12,
        fontWeight: 600,
        textTransform: "capitalize",
      }}
    >
      {status}
    </span>
  )
}

function DataRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "8px 0",
        borderBottom: "1px solid #F1F5F9",
      }}
    >
      <span style={{ color: "#64748B", fontSize: 13 }}>{label}</span>
      <span style={{ color: "#0F172A", fontSize: 13, fontWeight: 500 }}>
        {value}
      </span>
    </div>
  )
}

interface EditModalProps {
  station: "maitri" | "bharati"
  data: StationState
  onClose: () => void
}

function EditModal({ station, data, onClose }: EditModalProps) {
  const { updateStation } = useApp()
  const [form, setForm] = useState<Partial<StationState>>({
    temp: data.temp,
    wind: data.wind,
    fuelPct: data.fuelPct,
    fuelL: data.fuelL,
    fuelConsumption: data.fuelConsumption,
    powerGen: data.powerGen,
    powerCon: data.powerCon,
    personnel: data.personnel,
    stormProb: data.stormProb,
    pressure: data.pressure,
    visibility: data.visibility,
    humidity: data.humidity,
    status: data.status,
  })

  function handleSave() {
    updateStation(station, form)
    onClose()
  }

  const field = (label: string, key: keyof StationState, type = "number") => (
    <div style={{ marginBottom: 12 }}>
      <label
        style={{
          display: "block",
          fontSize: 12,
          color: "#64748B",
          marginBottom: 4,
        }}
      >
        {label}
      </label>
      <input
        type={type}
        value={form[key] as string | number}
        onChange={(e) =>
          setForm((prev) => ({
            ...prev,
            [key]: type === "number" ? Number(e.target.value) : e.target.value,
          }))
        }
        style={{
          width: "100%",
          border: "1px solid #E2E8F0",
          borderRadius: 4,
          padding: "6px 10px",
          fontSize: 13,
          boxSizing: "border-box",
        }}
      />
    </div>
  )

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{ ...card, width: 440, maxHeight: "80vh", overflowY: "auto" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <h3 style={{ margin: 0, fontSize: 16, color: "#0F172A" }}>
            Edit Station Data
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
            &#x2715;
          </button>
        </div>
        {field("Temperature (°C)", "temp")}
        {field("Wind Speed (km/h)", "wind")}
        {field("Fuel %", "fuelPct")}
        {field("Fuel (L)", "fuelL")}
        {field("Daily Consumption (L)", "fuelConsumption")}
        {field("Power Generated (MW)", "powerGen")}
        {field("Power Consumed (MW)", "powerCon")}
        {field("Personnel", "personnel")}
        {field("Storm Probability (%)", "stormProb")}
        {field("Pressure (hPa)", "pressure")}
        {field("Visibility (km)", "visibility")}
        {field("Humidity (%)", "humidity")}
        <div
          style={{
            display: "flex",
            gap: 8,
            justifyContent: "flex-end",
            marginTop: 16,
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "7px 16px",
              borderRadius: 4,
              border: "1px solid #E2E8F0",
              background: "#fff",
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: "7px 16px",
              borderRadius: 4,
              border: "none",
              background: "#1677FF",
              color: "#fff",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

const EMERGENCY_TYPES = [
  "Generator Failure",
  "Severe Weather",
  "Medical Emergency",
  "Fuel Shortage",
  "Equipment Damage",
  "Communication Loss",
  "Structural Damage",
  "Other",
]

interface EmergencyModalProps {
  onClose: () => void
  defaultAffected: "maitri" | "bharati"
}

function EmergencyModal({ onClose, defaultAffected }: EmergencyModalProps) {
  const { addAlert, addActivity } = useApp()
  const [affectedStation, setAffectedStation] = useState<"Maitri" | "Bharati">(
    defaultAffected === "maitri" ? "Maitri" : "Bharati",
  )
  const [supportStation, setSupportStation] = useState<"Maitri" | "Bharati">(
    defaultAffected === "maitri" ? "Bharati" : "Maitri",
  )
  const [emergencyType, setEmergencyType] = useState("Generator Failure")
  const [severity, setSeverity] = useState("Critical")
  const [description, setDescription] = useState("")
  const [requiredAssistance, setRequiredAssistance] = useState("")
  const [channelStatus, setChannelStatus] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  function getCurrentUTC() {
    const now = new Date()
    return `${String(now.getUTCHours()).padStart(2, "0")}:${String(now.getUTCMinutes()).padStart(2, "0")} UTC`
  }

  function handleAffectedChange(s: "Maitri" | "Bharati") {
    setAffectedStation(s)
    setSupportStation(s === "Maitri" ? "Bharati" : "Maitri")
  }

  function handleRequestAssistance() {
    const utcTime = getCurrentUTC()
    const alertSeverity: AppAlert["severity"] =
      severity === "Critical"
        ? "critical"
        : severity === "Severe"
          ? "warning"
          : "advisory"
    const newAlert: AppAlert = {
      id: "EMG-" + Date.now(),
      severity: alertSeverity,
      title: `EMERGENCY: ${emergencyType} — ${affectedStation} Station`,
      station: affectedStation,
      time: utcTime,
      status: "active",
      cause: description || "Emergency reported via inter-station channel.",
      condition: `Emergency reported. ${supportStation} station requested to provide support.`,
      action:
        requiredAssistance ||
        "Coordinate with support station immediately. Follow emergency protocols.",
    }
    addAlert(newAlert)
    addActivity({
      time: utcTime,
      action: "Emergency alert dispatched",
      detail: `${emergencyType} at ${affectedStation} — ${supportStation} notified`,
      user: "System",
    })
    setSubmitted(true)
  }

  function handleOpenChannel() {
    setChannelStatus("Opening secure channel...")
    setTimeout(
      () => setChannelStatus("Channel Active: Maitri ↔ Bharati | Encrypted"),
      1200,
    )
  }

  function handleShareData() {
    setChannelStatus("Transmitting telemetry...")
    setTimeout(
      () => setChannelStatus("Telemetry transmitted successfully"),
      1200,
    )
  }

  function handleAcknowledge() {
    setChannelStatus("Emergency acknowledged by support station")
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "8px 10px",
    border: "1px solid #E2E8F0",
    borderRadius: 5,
    fontSize: 13,
    color: "#0F172A",
    backgroundColor: "#FFFFFF",
    boxSizing: "border-box",
  }

  const labelStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 600,
    color: "#64748B",
    display: "block",
    marginBottom: 5,
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        zIndex: 2000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          backgroundColor: "#FFF",
          borderRadius: 8,
          width: 600,
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 8px 40px rgba(0,0,0,0.2)",
        }}
      >
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #E2E8F0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "#FFF7ED",
            borderRadius: "8px 8px 0 0",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: 17,
                fontWeight: 700,
                color: "#92400E",
              }}
            >
              ⚡ Emergency Inter-Station Connection
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "#B45309" }}>
              Establish emergency channel between stations
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 20,
              color: "#94A3B8",
            }}
          >
            &#x2715;
          </button>
        </div>

        <div style={{ padding: "24px" }}>
          {submitted ? (
            <div>
              <div
                style={{
                  backgroundColor: "#FFF7ED",
                  border: "1px solid #FCD34D",
                  borderRadius: 8,
                  padding: "20px 24px",
                  marginBottom: 20,
                }}
              >
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#92400E",
                    marginBottom: 8,
                  }}
                >
                  Emergency Alert Dispatched
                </div>
                <p
                  style={{ margin: "0 0 12px", fontSize: 13, color: "#78350F" }}
                >
                  Alert has been transmitted to {supportStation}. Emergency
                  channel is active.
                </p>
                <div
                  style={{
                    backgroundColor: "#0B1F33",
                    color: "#F59E0B",
                    padding: "10px 16px",
                    borderRadius: 6,
                    fontSize: 13,
                    fontWeight: 700,
                    textAlign: "center",
                    letterSpacing: "0.05em",
                  }}
                >
                  {affectedStation.toUpperCase()} ↔{" "}
                  {supportStation.toUpperCase()} | EMERGENCY CHANNEL ACTIVE
                </div>
              </div>
              <p style={{ fontSize: 13, color: "#64748B", marginBottom: 20 }}>
                The emergency alert will appear in the Operations Admin Alerts
                dashboard.
              </p>
              <button
                onClick={onClose}
                style={{
                  padding: "10px 24px",
                  backgroundColor: "#1677FF",
                  color: "#FFF",
                  border: "none",
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {channelStatus && (
                <div
                  style={{
                    backgroundColor: "#F0FDF4",
                    border: "1px solid #86EFAC",
                    borderRadius: 6,
                    padding: "10px 14px",
                    fontSize: 13,
                    color: "#16A34A",
                    fontWeight: 600,
                  }}
                >
                  ● {channelStatus}
                </div>
              )}

              <div>
                <label style={labelStyle}>Affected Station</label>
                <div style={{ display: "flex", gap: 16 }}>
                  {(["Maitri", "Bharati"] as const).map((s) => (
                    <label
                      key={s}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        cursor: "pointer",
                        fontSize: 13,
                        color: "#0F172A",
                      }}
                    >
                      <input
                        type="radio"
                        name="affected"
                        checked={affectedStation === s}
                        onChange={() => handleAffectedChange(s)}
                      />
                      {s}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label style={labelStyle}>Support Station</label>
                <div style={{ display: "flex", gap: 16 }}>
                  {(["Maitri", "Bharati"] as const).map((s) => (
                    <label
                      key={s}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        cursor: "pointer",
                        fontSize: 13,
                        color: "#0F172A",
                      }}
                    >
                      <input
                        type="radio"
                        name="support"
                        checked={supportStation === s}
                        onChange={() => setSupportStation(s)}
                      />
                      {s}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label style={labelStyle}>Emergency Type</label>
                <select
                  style={inputStyle}
                  value={emergencyType}
                  onChange={(e) => setEmergencyType(e.target.value)}
                >
                  {EMERGENCY_TYPES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Severity</label>
                <select
                  style={inputStyle}
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                >
                  {["Critical", "Severe", "Moderate"].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Description</label>
                <textarea
                  style={{ ...inputStyle, resize: "vertical" }}
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the emergency situation..."
                />
              </div>

              <div>
                <label style={labelStyle}>Required Assistance</label>
                <textarea
                  style={{ ...inputStyle, resize: "vertical" }}
                  rows={3}
                  value={requiredAssistance}
                  onChange={(e) => setRequiredAssistance(e.target.value)}
                  placeholder="What assistance is needed from the support station?"
                />
              </div>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 10,
                  paddingTop: 8,
                  borderTop: "1px solid #F1F5F9",
                }}
              >
                <button
                  onClick={handleRequestAssistance}
                  style={{
                    padding: "10px 18px",
                    backgroundColor: "#1677FF",
                    color: "#FFF",
                    border: "none",
                    borderRadius: 6,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Request Assistance
                </button>
                <button
                  onClick={handleOpenChannel}
                  style={{
                    padding: "10px 18px",
                    backgroundColor: "#FFF",
                    color: "#0F172A",
                    border: "1px solid #E2E8F0",
                    borderRadius: 6,
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  Open Station Channel
                </button>
                <button
                  onClick={handleShareData}
                  style={{
                    padding: "10px 18px",
                    backgroundColor: "#FFF",
                    color: "#0F172A",
                    border: "1px solid #E2E8F0",
                    borderRadius: 6,
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  Share Emergency Data
                </button>
                <button
                  onClick={handleAcknowledge}
                  style={{
                    padding: "10px 18px",
                    backgroundColor: "#FFF",
                    color: "#16A34A",
                    border: "1px solid #BBF7D0",
                    borderRadius: 6,
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  Acknowledge Emergency
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Stations() {
  const { maitri, bharati } = useApp()
  const [selected, setSelected] = useState<"maitri" | "bharati">("maitri")
  const [tab, setTab] = useState("Overview")
  const [editOpen, setEditOpen] = useState(false)
  const [showEmergency, setShowEmergency] = useState(false)

  const data = selected === "maitri" ? maitri : bharati
  const stationLabel =
    selected === "maitri" ? "Maitri Station" : "Bharati Station"
  const fuelColor =
    data.fuelPct < 40 ? "#DC2626" : data.fuelPct < 60 ? "#F59E0B" : "#16A34A"
  const daysRemaining = Math.floor(data.fuelL / data.fuelConsumption)

  return (
    <div
      style={{
        padding: "24px 28px",
        background: "#F0F4F8",
        minHeight: "100vh",
      }}
    >
      {/* Station selector + Emergency button */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 20,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", gap: 8 }}>
          {(["maitri", "bharati"] as const).map((s) => (
            <button
              key={s}
              onClick={() => {
                setSelected(s)
                setTab("Overview")
              }}
              style={{
                padding: "8px 20px",
                borderRadius: 4,
                border:
                  selected === s ? "2px solid #1677FF" : "1px solid #E2E8F0",
                background: selected === s ? "#EFF6FF" : "#fff",
                color: selected === s ? "#1677FF" : "#0F172A",
                fontWeight: selected === s ? 700 : 500,
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              {s === "maitri" ? "Maitri" : "Bharati"}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowEmergency(true)}
          style={{
            padding: "8px 16px",
            borderRadius: 4,
            border: "1px solid #F59E0B",
            backgroundColor: "#FFFBEB",
            color: "#D97706",
            fontWeight: 600,
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          ⚡ Emergency Connect
        </button>
      </div>

      {/* Hero */}
      <div
        style={{
          position: "relative",
          height: 220,
          borderRadius: 8,
          overflow: "hidden",
          marginBottom: 20,
          backgroundImage: `url(${
            selected === "maitri" ? maitriImg : bharatiImg
          })`,
          backgroundSize: "cover",
          backgroundPosition:
            selected === "maitri" ? "center 50%" : "center 85%",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(11,31,51,0.70)",
            display: "flex",
            alignItems: "flex-end",
            padding: "24px 28px",
            gap: 16,
          }}
        >
          <h1
            style={{ margin: 0, color: "#fff", fontSize: 28, fontWeight: 700 }}
          >
            {stationLabel}
          </h1>
          <StatusBadge status={data.status} />
        </div>
      </div>

      {/* Tab bar */}
      <div
        style={{
          display: "flex",
          gap: 0,
          borderBottom: "1px solid #E2E8F0",
          marginBottom: 24,
        }}
      >
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "10px 18px",
              background: "none",
              border: "none",
              borderBottom:
                tab === t ? "2px solid #1677FF" : "2px solid transparent",
              color: tab === t ? "#1677FF" : "#64748B",
              fontWeight: tab === t ? 600 : 400,
              cursor: "pointer",
              fontSize: 13,
              marginBottom: -1,
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === "Overview" && (
        <div style={card}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <h2 style={{ margin: 0, fontSize: 15, color: "#0F172A" }}>
              Station Overview
            </h2>
            <button
              onClick={() => setEditOpen(true)}
              style={{
                padding: "6px 16px",
                borderRadius: 4,
                border: "none",
                background: "#1677FF",
                color: "#fff",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              Edit
            </button>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0 40px",
            }}
          >
            <div>
              <DataRow label="Temperature" value={`${data.temp} °C`} />
              <DataRow label="Wind Speed" value={`${data.wind} km/h`} />
              <DataRow label="Wind Direction" value={data.windDir} />
              <DataRow label="Fuel Level" value={`${data.fuelPct}%`} />
              <DataRow label="Fuel (L)" value={data.fuelL.toLocaleString()} />
              <DataRow
                label="Daily Consumption"
                value={`${data.fuelConsumption} L`}
              />
              <DataRow label="Power Generated" value={`${data.powerGen} MW`} />
              <DataRow label="Power Consumed" value={`${data.powerCon} MW`} />
            </div>
            <div>
              <DataRow label="Personnel" value={data.personnel} />
              <DataRow label="Weather" value={data.weather} />
              <DataRow label="Storm Probability" value={`${data.stormProb}%`} />
              <DataRow label="Pressure" value={`${data.pressure} hPa`} />
              <DataRow label="Visibility" value={`${data.visibility} km`} />
              <DataRow label="Humidity" value={`${data.humidity}%`} />
              <DataRow label="Last Sync" value={data.lastSync} />
              <DataRow
                label="Status"
                value={<StatusBadge status={data.status} />}
              />
            </div>
          </div>
        </div>
      )}

      {/* Infrastructure */}
      {tab === "Infrastructure" && (
        <div style={card}>
          <h2 style={{ margin: "0 0 16px", fontSize: 15, color: "#0F172A" }}>
            Infrastructure Status
          </h2>
          {[
            {
              label: "Generators",
              value: "2 / 3 Operational",
              color: "#16A34A",
              bg: "#DCFCE7",
            },
            {
              label: "Communications",
              value: "Connected",
              color: "#16A34A",
              bg: "#DCFCE7",
            },
            {
              label: "Backup Power",
              value: "Standby",
              color: "#F59E0B",
              bg: "#FEF3C7",
            },
          ].map((row) => (
            <div
              key={row.label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 0",
                borderBottom: "1px solid #F1F5F9",
              }}
            >
              <span style={{ color: "#64748B", fontSize: 13 }}>
                {row.label}
              </span>
              <span
                style={{
                  backgroundColor: row.bg,
                  color: row.color,
                  borderRadius: 4,
                  padding: "2px 10px",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {row.value}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Energy */}
      {tab === "Energy" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: 16,
          }}
        >
          {[
            {
              label: "Power Generated",
              value: `${data.powerGen} MW`,
              color: "#16A34A",
            },
            {
              label: "Power Consumed",
              value: `${data.powerCon} MW`,
              color: "#DC2626",
            },
            { label: "Available Capacity", value: "2.40 MW", color: "#2563EB" },
            {
              label: "Efficiency",
              value: `${((data.powerGen / 2.4) * 100).toFixed(1)}%`,
              color: "#F59E0B",
            },
          ].map((m) => (
            <div key={m.label} style={card}>
              <div style={{ fontSize: 12, color: "#64748B", marginBottom: 8 }}>
                {m.label}
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, color: m.color }}>
                {m.value}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Fuel */}
      {tab === "Fuel" && (
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          <div
            style={{
              ...card,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minWidth: 180,
            }}
          >
            <div
              style={{
                marginBottom: 12,
                fontSize: 13,
                color: "#64748B",
                fontWeight: 600,
              }}
            >
              Fuel Level
            </div>
            <CircularGauge pct={data.fuelPct} size={120} color={fuelColor} />
            {data.fuelPct < 40 && (
              <div
                style={{
                  marginTop: 12,
                  background: "#FEE2E2",
                  color: "#DC2626",
                  borderRadius: 4,
                  padding: "4px 12px",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                Low Fuel Warning
              </div>
            )}
          </div>
          <div style={{ ...card, flex: 1 }}>
            <h2 style={{ margin: "0 0 16px", fontSize: 15, color: "#0F172A" }}>
              Fuel Details
            </h2>
            <DataRow
              label="Current Fuel"
              value={`${data.fuelL.toLocaleString()} L`}
            />
            <DataRow
              label="Daily Consumption"
              value={`${data.fuelConsumption} L/day`}
            />
            <DataRow label="Days Remaining" value={`${daysRemaining} days`} />
            <DataRow label="Fuel Level" value={`${data.fuelPct}%`} />
          </div>
        </div>
      )}

      {/* Weather */}
      {tab === "Weather" && (
        <div style={card}>
          <h2 style={{ margin: "0 0 16px", fontSize: 15, color: "#0F172A" }}>
            Current Conditions
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0 40px",
            }}
          >
            <div>
              <DataRow label="Temperature" value={`${data.temp} °C`} />
              <DataRow label="Wind Speed" value={`${data.wind} km/h`} />
              <DataRow label="Wind Direction" value={data.windDir} />
              <DataRow label="Weather" value={data.weather} />
            </div>
            <div>
              <DataRow label="Pressure" value={`${data.pressure} hPa`} />
              <DataRow label="Visibility" value={`${data.visibility} km`} />
              <DataRow label="Humidity" value={`${data.humidity}%`} />
              <DataRow label="Storm Probability" value={`${data.stormProb}%`} />
            </div>
          </div>
        </div>
      )}

      {/* Personnel */}
      {tab === "Personnel" && (
        <div style={card}>
          <h2 style={{ margin: "0 0 16px", fontSize: 15, color: "#0F172A" }}>
            Personnel
          </h2>
          <DataRow label="Total Personnel" value={data.personnel} />
          <DataRow label="Outdoor Teams" value={6} />
          <DataRow label="Research Team" value={8} />
          <DataRow label="Operations Staff" value={10} />
        </div>
      )}

      {/* Live */}
      {tab === "Live" && selected === "maitri" && (
        <div style={card}>
          <h2 style={{ margin: "0 0 4px", fontSize: 15, color: "#0F172A" }}>
            Live Station Footage
          </h2>
          <p style={{ margin: "0 0 16px", fontSize: 13, color: "#64748B" }}>
            Recent footage from Maitri station
          </p>
          <div style={{ position: "relative", borderRadius: 8, overflow: "hidden", backgroundColor: "#0B1F33" }}>
            <video
              src="/videos/maitri-live.mp4"
              controls
              autoPlay
              muted
              loop
              playsInline
              style={{ width: "100%", display: "block", maxHeight: 480, objectFit: "contain" }}
            />
          </div>
          <div style={{ marginTop: 12, display: "flex", gap: 12, fontSize: 12, color: "#64748B" }}>
            <span>Maitri Station — Queen Maud Land, Antarctica</span>
            <span>70°46'S, 11°43'E</span>
          </div>
        </div>
      )}

      {tab === "Live" && selected === "bharati" && (
        <div style={card}>
          <h2 style={{ margin: "0 0 4px", fontSize: 15, color: "#0F172A" }}>
            Live Station Footage
          </h2>
          <p style={{ margin: "0 0 16px", fontSize: 13, color: "#64748B" }}>
            Recent footage from Bharati station
          </p>
          <div style={{ position: "relative", borderRadius: 8, overflow: "hidden", backgroundColor: "#0B1F33" }}>
            <video
              src="/videos/bharati-live.mp4"
              controls
              autoPlay
              muted
              loop
              playsInline
              style={{ width: "100%", display: "block", maxHeight: 480, objectFit: "contain" }}
            />
          </div>
          <div style={{ marginTop: 12, display: "flex", gap: 12, fontSize: 12, color: "#64748B" }}>
            <span>Bharati Station — Larsemann Hills, Antarctica</span>
            <span>69°24'S, 76°11'E</span>
          </div>
        </div>
      )}

      {editOpen && (
        <EditModal
          station={selected}
          data={data}
          onClose={() => setEditOpen(false)}
        />
      )}

      {showEmergency && (
        <EmergencyModal
          onClose={() => setShowEmergency(false)}
          defaultAffected={selected}
        />
      )}
    </div>
  )
}
