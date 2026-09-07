import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { apiEnergyOptimize, apiEnergySavings } from "../lib/api";

const card: React.CSSProperties = {
  backgroundColor: "#FFFFFF",
  border: "1px solid #E2E8F0",
  borderRadius: 6,
  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  padding: "20px 24px",
};

const COLORS = {
  deepNavy: "#0B1F33",
  primaryBlue: "#1677FF",
  background: "#F0F4F8",
  cardBg: "#FFFFFF",
  border: "#E2E8F0",
  textPrimary: "#0F172A",
  textSecondary: "#64748B",
  textMuted: "#94A3B8",
  success: "#16A34A",
  warning: "#F59E0B",
  critical: "#DC2626",
};

interface ScheduleEntry {
  hour: number
  load_kw: number
  solar_kw: number
  wind_kw: number
  renewable_total_kw: number
  diesel_kw: number
  renewable_share_pct: number
  recommendation: string
}

interface EnergySavings {
  annual_baseline_gallons: number
  annual_saved_gallons: number
  annual_co2_saved_kg: number
  annual_money_saved_usd: number
  renewable_offset_pct: number
}

function mapToSvg(value: number, minVal: number, maxVal: number, svgMin: number, svgMax: number): number {
  return svgMax - ((value - minVal) / (maxVal - minVal)) * (svgMax - svgMin);
}

export default function Energy() {
  const { maitri, bharati, updateStation } = useApp();
  const [selectedStation, setSelectedStation] = useState<"maitri" | "bharati">("maitri");
  const station = selectedStation;
  const data = selectedStation === "maitri" ? maitri : bharati;

  const [modalOpen, setModalOpen] = useState(false);
  const [editPowerGen, setEditPowerGen] = useState(String(data.powerGen));
  const [editPowerCon, setEditPowerCon] = useState(String(data.powerCon));
  const [savedTime, setSavedTime] = useState<string | null>(null);

  // Live data from API
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [savings, setSavings] = useState<EnergySavings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      apiEnergyOptimize(selectedStation),
      apiEnergySavings(selectedStation),
    ]).then(([opt, sav]) => {
      setSchedule(opt.schedule || []);
      setSavings(sav);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [selectedStation]);

  const availableCapacity = 2.40;
  const efficiency = Math.round((data.powerGen / availableCapacity) * 100);

  // Use live schedule for chart data
  const genPoints = schedule.length > 0
    ? schedule.map(s => s.renewable_total_kw / 1000) // Convert kW → MW for chart
    : Array(24).fill(0).map((_, i) => Math.max(0, data.powerGen - 0.3 + Math.sin(i / 6) * 0.15));
  const conPoints = schedule.length > 0
    ? schedule.map(s => s.load_kw / 1000) // Convert kW → MW
    : Array(24).fill(0).map((_, i) => data.powerCon + Math.sin(i / 8) * 0.1);

  const allVals = [...genPoints, ...conPoints];
  const minVal = Math.min(...allVals) - 0.1;
  const maxVal = Math.max(...allVals) + 0.1;

  const chartW = 520;
  const chartH = 160;
  const padL = 48;
  const padB = 28;
  const padT = 10;
  const plotW = chartW - padL - 8;
  const plotH = chartH - padB - padT;

  function toX(i: number) {
    return padL + (i / 23) * plotW;
  }
  function toY(v: number) {
    return padT + mapToSvg(v, minVal, maxVal, 0, plotH);
  }

  const genPath = genPoints.map((v, i) => `${i === 0 ? "M" : "L"}${toX(i).toFixed(1)},${toY(v).toFixed(1)}`).join(" ");
  const conPath = conPoints.map((v, i) => `${i === 0 ? "M" : "L"}${toX(i).toFixed(1)},${toY(v).toFixed(1)}`).join(" ");

  const xLabels = [0, 6, 12, 18, 23];

  // Use schedule data for daily summary
  const totalGenerated = schedule.reduce((sum, s) => sum + s.renewable_total_kw, 0) / 1000;
  const totalConsumed = schedule.reduce((sum, s) => sum + s.load_kw, 0) / 1000;
  const renewableHours = schedule.filter(s => s.recommendation === "RENEWABLE").length;

  function openModal() {
    setEditPowerGen(String(data.powerGen));
    setEditPowerCon(String(data.powerCon));
    setSavedTime(null);
    setModalOpen(true);
  }

  function handleSave() {
    const newGen = parseFloat(editPowerGen);
    const newCon = parseFloat(editPowerCon);
    if (!isNaN(newGen) && !isNaN(newCon)) {
      updateStation(station, { powerGen: newGen, powerCon: newCon });
      const now = new Date();
      const hh = now.getUTCHours().toString().padStart(2, "0");
      const mm = now.getUTCMinutes().toString().padStart(2, "0");
      setSavedTime(`${hh}:${mm}`);
    }
  }

  const tabBtn = (s: "maitri" | "bharati"): React.CSSProperties => ({
    padding: "6px 18px",
    border: "1px solid #E2E8F0",
    borderRadius: 4,
    cursor: "pointer",
    fontWeight: 500,
    fontSize: 14,
    backgroundColor: selectedStation === s ? COLORS.primaryBlue : "#FFFFFF",
    color: selectedStation === s ? "#FFFFFF" : COLORS.textPrimary,
    outline: "none",
  });

  const batteryPct = data.battery ?? 78;

  return (
    <div style={{ padding: "28px 32px", backgroundColor: COLORS.background, minHeight: "100vh", fontFamily: "system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: COLORS.textPrimary, margin: 0 }}>Energy Management</h1>
          <p style={{ fontSize: 13, color: COLORS.textSecondary, margin: "4px 0 0" }}>Power generation, consumption and optimization overview</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {schedule.length > 0 && (
            <span style={{ fontSize: 11, color: COLORS.success, fontWeight: 600, backgroundColor: "#F0FDF4", padding: "3px 10px", borderRadius: 4 }}>
              LIVE — backend schedule
            </span>
          )}
          <div style={{ display: "flex", gap: 8 }}>
            <button style={tabBtn("maitri")} onClick={() => setSelectedStation("maitri")}>Maitri</button>
            <button style={tabBtn("bharati")} onClick={() => setSelectedStation("bharati")}>Bharati</button>
          </div>
        </div>
      </div>

      {/* Key Metrics Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 20 }}>
        {[
          { label: "Power Generated", value: data.powerGen.toFixed(2) + " MW", color: COLORS.success },
          { label: "Power Consumed", value: data.powerCon.toFixed(2) + " MW", color: COLORS.primaryBlue },
          { label: "Available Capacity", value: "2.40 MW", color: COLORS.textSecondary },
          { label: "Efficiency", value: efficiency + "%", color: efficiency > 80 ? COLORS.success : COLORS.warning },
        ].map((m) => (
          <div key={m.label} style={card}>
            <p style={{ margin: 0, fontSize: 12, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>{m.label}</p>
            <p style={{ margin: "8px 0 0", fontSize: 26, fontWeight: 700, color: m.color }}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Status Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 20 }}>
        <div style={card}>
          <p style={{ margin: 0, fontSize: 12, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>Generator Status</p>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
            <span style={{ backgroundColor: "#DCFCE7", color: COLORS.success, padding: "3px 10px", borderRadius: 12, fontSize: 13, fontWeight: 600 }}>
              2 / 3 Operational
            </span>
            <span style={{ fontSize: 12, color: COLORS.textMuted }}>Generator 3 offline</span>
          </div>
        </div>
        <div style={card}>
          <p style={{ margin: 0, fontSize: 12, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>Battery Reserve</p>
          <div style={{ marginTop: 10 }}>
            <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: COLORS.textPrimary }}>{batteryPct}%</p>
            <div style={{ height: 6, backgroundColor: "#E2E8F0", borderRadius: 3, marginTop: 6 }}>
              <div style={{ width: `${batteryPct}%`, height: "100%", backgroundColor: batteryPct > 50 ? COLORS.success : batteryPct > 20 ? COLORS.warning : COLORS.critical, borderRadius: 3 }} />
            </div>
          </div>
        </div>
        <div style={card}>
          <p style={{ margin: 0, fontSize: 12, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>Daily Summary</p>
          <div style={{ marginTop: 10, display: "flex", gap: 20 }}>
            <div>
              <p style={{ margin: 0, fontSize: 11, color: COLORS.textMuted }}>Generated</p>
              <p style={{ margin: "2px 0 0", fontSize: 18, fontWeight: 700, color: COLORS.success }}>{totalGenerated.toFixed(1)} MWh</p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 11, color: COLORS.textMuted }}>Consumed</p>
              <p style={{ margin: "2px 0 0", fontSize: 18, fontWeight: 700, color: COLORS.primaryBlue }}>{totalConsumed.toFixed(1)} MWh</p>
            </div>
          </div>
        </div>
      </div>

      {/* 24h Line Chart */}
      <div style={{ ...card, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: COLORS.textPrimary }}>24-Hour Optimal Schedule</p>
            {schedule.length > 0 && (
              <p style={{ margin: "2px 0 0", fontSize: 11, color: COLORS.textMuted }}>
                Renewable hours: {renewableHours}/24 · Diesel hours: {24 - renewableHours}/24
              </p>
            )}
          </div>
          <div style={{ display: "flex", gap: 16, fontSize: 12 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 24, height: 2, backgroundColor: COLORS.success, display: "inline-block" }} />
              <span style={{ color: COLORS.textSecondary }}>Renewable</span>
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 24, height: 2, backgroundColor: COLORS.primaryBlue, display: "inline-block" }} />
              <span style={{ color: COLORS.textSecondary }}>Load</span>
            </span>
          </div>
        </div>
        <svg width={chartW} height={chartH} style={{ display: "block" }}>
          {[0, 0.33, 0.66, 1].map((frac, i) => {
            const yPos = padT + frac * plotH;
            return (
              <g key={i}>
                <line x1={padL} y1={yPos} x2={chartW - 8} y2={yPos} stroke="#E2E8F0" strokeWidth={1} />
              </g>
            );
          })}
          {xLabels.map((xi) => (
            <text key={xi} x={toX(xi)} y={chartH - 6} fontSize={10} fill={COLORS.textMuted} textAnchor="middle">{xi}h</text>
          ))}
          <path d={conPath} fill="none" stroke={COLORS.primaryBlue} strokeWidth={1.5} />
          <path d={genPath} fill="none" stroke={COLORS.success} strokeWidth={2} />
        </svg>
      </div>

      {/* Savings Summary */}
      {savings && (
        <div style={{ ...card, marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.textPrimary, marginBottom: 16 }}>Annual Savings Projection</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
            {[
              { label: "Fuel Saved", value: `${savings.annual_saved_gallons.toLocaleString()} gal`, color: COLORS.success },
              { label: "CO₂ Reduced", value: `${(savings.annual_co2_saved_kg / 1000).toFixed(1)} t`, color: COLORS.success },
              { label: "Money Saved", value: `$${savings.annual_money_saved_usd.toLocaleString()}`, color: COLORS.success },
              { label: "Renewable Offset", value: `${savings.renewable_offset_pct}%`, color: COLORS.primaryBlue },
            ].map((m) => (
              <div key={m.label} style={{ padding: "12px 14px", backgroundColor: "#F8FAFC", borderRadius: 6 }}>
                <p style={{ margin: 0, fontSize: 11, color: COLORS.textMuted }}>{m.label}</p>
                <p style={{ margin: "4px 0 0", fontSize: 18, fontWeight: 700, color: m.color }}>{m.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Button */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={openModal}
          style={{
            padding: "8px 20px",
            backgroundColor: COLORS.primaryBlue,
            color: "#FFFFFF",
            border: "none",
            borderRadius: 6,
            fontSize: 14,
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Edit Station Data
        </button>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: 8, padding: 32, width: 380, boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}>
            <h2 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 700, color: COLORS.textPrimary }}>
              Edit Energy Data — {selectedStation === "maitri" ? "Maitri" : "Bharati"}
            </h2>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, color: COLORS.textSecondary, display: "block", marginBottom: 6 }}>Power Generated (MW)</label>
              <input
                type="number"
                step="0.01"
                value={editPowerGen}
                onChange={(e) => setEditPowerGen(e.target.value)}
                style={{ width: "100%", padding: "8px 10px", border: "1px solid #E2E8F0", borderRadius: 4, fontSize: 14, boxSizing: "border-box" }}
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 13, color: COLORS.textSecondary, display: "block", marginBottom: 6 }}>Power Consumed (MW)</label>
              <input
                type="number"
                step="0.01"
                value={editPowerCon}
                onChange={(e) => setEditPowerCon(e.target.value)}
                style={{ width: "100%", padding: "8px 10px", border: "1px solid #E2E8F0", borderRadius: 4, fontSize: 14, boxSizing: "border-box" }}
              />
            </div>
            {savedTime && (
              <p style={{ margin: "0 0 16px", fontSize: 13, color: COLORS.success, fontWeight: 500 }}>
                {"Changes saved · Updated "}{savedTime}{" UTC"}
              </p>
            )}
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                onClick={() => setModalOpen(false)}
                style={{ padding: "8px 16px", border: "1px solid #E2E8F0", borderRadius: 4, backgroundColor: "#FFFFFF", fontSize: 14, cursor: "pointer", color: COLORS.textPrimary }}
              >
                Close
              </button>
              <button
                onClick={handleSave}
                style={{ padding: "8px 16px", border: "none", borderRadius: 4, backgroundColor: COLORS.primaryBlue, color: "#FFFFFF", fontSize: 14, fontWeight: 500, cursor: "pointer" }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
