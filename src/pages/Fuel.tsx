import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { apiPredictFuel } from "../lib/api";

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

const MAX_FUEL: Record<"maitri" | "bharati", number> = {
  maitri: 25600,
  bharati: 25000,
};

function gaugeColor(pct: number): string {
  if (pct < 30) return COLORS.critical;
  if (pct < 50) return COLORS.warning;
  return COLORS.primaryBlue;
}

interface FuelPrediction {
  days_to_depletion: number | null
  confidence: { low: number | null; high: number | null }
  accuracy: { r2: number | null; mape: number | null }
  details: { burn_rate_L_per_hour: number; current_fuel_L: number }
  samples: number
}

export default function Fuel() {
  const { maitri, bharati, updateStation } = useApp();
  const [selectedStation, setSelectedStation] = useState<"maitri" | "bharati">("maitri");
  const station = selectedStation;
  const data = selectedStation === "maitri" ? maitri : bharati;

  const [modalOpen, setModalOpen] = useState(false);
  const [editFuelL, setEditFuelL] = useState(String(data.fuelL));
  const [editFuelCon, setEditFuelCon] = useState(String(data.fuelConsumption));
  const [saved, setSaved] = useState(false);

  // Live prediction from backend
  const [prediction, setPrediction] = useState<FuelPrediction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiPredictFuel(selectedStation)
      .then((data: FuelPrediction) => setPrediction(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedStation]);

  // Use model's burn rate if available, fallback to context
  const burnRatePerHour = prediction?.details?.burn_rate_L_per_hour ?? data.fuelConsumption / 24;
  const burnRatePerDay = Math.round(burnRatePerHour * 24);
  const daysRemaining = prediction?.days_to_depletion ?? Math.floor(data.fuelL / burnRatePerDay);
  const fuelColor = gaugeColor(data.fuelPct);

  // Circular gauge math
  const gaugeR = 58;
  const gaugeC = 2 * Math.PI * gaugeR;
  const gaugeFill = (data.fuelPct / 100) * gaugeC;

  // Trend chart: 14-day projected decline using real burn rate
  const trendDays = 14;
  const trendW = 520;
  const trendH = 140;
  const trendPadL = 56;
  const trendPadB = 28;
  const trendPadT = 10;
  const trendPlotW = trendW - trendPadL - 8;
  const trendPlotH = trendH - trendPadB - trendPadT;

  const trendPoints: { x: number; y: number }[] = [];
  for (let d = 0; d <= trendDays; d++) {
    const val = data.fuelL - d * burnRatePerDay;
    if (val < 0) break;
    const px = trendPadL + (d / trendDays) * trendPlotW;
    const py = trendPadT + trendPlotH - (val / data.fuelL) * trendPlotH;
    trendPoints.push({ x: px, y: py });
  }
  const trendPath = trendPoints.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

  const trendYLabels = [0, 25, 50, 75, 100];

  function openModal() {
    setEditFuelL(String(data.fuelL));
    setEditFuelCon(String(data.fuelConsumption));
    setSaved(false);
    setModalOpen(true);
  }

  function handleSave() {
    const newFuelL = Number(editFuelL);
    const newCon = Number(editFuelCon);
    if (!isNaN(newFuelL) && !isNaN(newCon)) {
      const maxFuel = MAX_FUEL[station];
      const newPct = Math.round((newFuelL / maxFuel) * 100);
      updateStation(station, { fuelL: newFuelL, fuelPct: newPct, fuelConsumption: newCon });
      setSaved(true);
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

  return (
    <div style={{ padding: "28px 32px", backgroundColor: COLORS.background, minHeight: "100vh", fontFamily: "system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: COLORS.textPrimary, margin: 0 }}>Fuel Management</h1>
          <p style={{ fontSize: 13, color: COLORS.textSecondary, margin: "4px 0 0" }}>Fuel levels, consumption tracking, and ML-powered depletion forecast</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {prediction && !loading && (
            <span style={{ fontSize: 11, color: COLORS.success, fontWeight: 600, backgroundColor: "#F0FDF4", padding: "3px 10px", borderRadius: 4 }}>
              LIVE — ML forecast
            </span>
          )}
          <div style={{ display: "flex", gap: 8 }}>
            <button style={tabBtn("maitri")} onClick={() => setSelectedStation("maitri")}>Maitri</button>
            <button style={tabBtn("bharati")} onClick={() => setSelectedStation("bharati")}>Bharati</button>
          </div>
        </div>
      </div>

      {/* Warning Banner */}
      {data.fuelPct < 40 && (
        <div style={{
          backgroundColor: "#FEF3C7",
          border: "1px solid #F59E0B",
          borderRadius: 6,
          padding: "12px 18px",
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}>
          <span style={{ fontSize: 16 }}>&#9888;</span>
          <p style={{ margin: 0, fontSize: 14, color: "#92400E", fontWeight: 500 }}>
            Resupply recommended. Fuel level below 40% threshold.
          </p>
        </div>
      )}

      {/* Key Metrics Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 20 }}>
        {[
          { label: "Fuel Remaining", value: data.fuelL.toLocaleString() + " L", color: fuelColor },
          { label: "Fuel Level", value: data.fuelPct + "%", color: fuelColor },
          { label: "Burn Rate", value: `${burnRatePerDay} L/day`, color: COLORS.textPrimary },
          { label: "Days Remaining", value: daysRemaining > 0 ? `${daysRemaining} days` : "—", color: daysRemaining < 15 ? COLORS.critical : COLORS.textPrimary },
        ].map((m) => (
          <div key={m.label} style={card}>
            <p style={{ margin: 0, fontSize: 12, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>{m.label}</p>
            <p style={{ margin: "8px 0 0", fontSize: 26, fontWeight: 700, color: m.color }}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Gauge + Info Row */}
      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 16, marginBottom: 20 }}>
        {/* Circular Gauge */}
        <div style={{ ...card, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <p style={{ margin: "0 0 12px", fontSize: 12, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>Fuel Level</p>
          <svg width={140} height={140}>
            <circle cx={70} cy={70} r={gaugeR} fill="none" stroke="#E2E8F0" strokeWidth={12} />
            <circle
              cx={70}
              cy={70}
              r={gaugeR}
              fill="none"
              stroke={fuelColor}
              strokeWidth={12}
              strokeDasharray={`${gaugeFill} ${gaugeC}`}
              strokeLinecap="round"
              transform="rotate(-90 70 70)"
            />
            <text x={70} y={65} textAnchor="middle" fontSize={24} fontWeight="700" fill={fuelColor}>{data.fuelPct}%</text>
            <text x={70} y={84} textAnchor="middle" fontSize={11} fill={COLORS.textMuted}>Fuel Level</text>
          </svg>
        </div>

        {/* Additional Info */}
        <div style={card}>
          <p style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 600, color: COLORS.textPrimary }}>ML Forecast Details</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            {[
              { label: "Days to Depletion", value: prediction?.days_to_depletion != null ? `${prediction.days_to_depletion} days` : "—" },
              { label: "R² Accuracy", value: prediction?.accuracy?.r2 != null ? `${(prediction.accuracy.r2 * 100).toFixed(1)}%` : "—" },
              { label: "Confidence Interval", value: prediction?.confidence?.low != null ? `${prediction.confidence.low}–${prediction.confidence.high} days` : "—" },
            ].map((info) => (
              <div key={info.label} style={{ padding: "12px 14px", backgroundColor: COLORS.background, borderRadius: 6 }}>
                <p style={{ margin: 0, fontSize: 11, color: COLORS.textMuted }}>{info.label}</p>
                <p style={{ margin: "4px 0 0", fontSize: 15, fontWeight: 600, color: COLORS.textPrimary }}>{info.value}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, padding: "8px 12px", backgroundColor: "#F8FAFC", borderRadius: 6, border: "1px solid #E2E8F0" }}>
            <span style={{ fontSize: 11, color: COLORS.textMuted }}>Model: Linear Regression · Samples: {prediction?.samples ?? "—"} · Burn rate: {burnRatePerHour.toFixed(1)} L/h</span>
          </div>
        </div>
      </div>

      {/* Trend Chart */}
      <div style={{ ...card, marginBottom: 20 }}>
        <p style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 600, color: COLORS.textPrimary }}>14-Day Projected Fuel Decline</p>
        <svg width={trendW} height={trendH} style={{ display: "block" }}>
          {trendYLabels.map((pct) => {
            const yPos = trendPadT + trendPlotH - (pct / 100) * trendPlotH;
            return (
              <g key={pct}>
                <line x1={trendPadL} y1={yPos} x2={trendW - 8} y2={yPos} stroke="#E2E8F0" strokeWidth={1} />
                <text x={trendPadL - 6} y={yPos + 4} fontSize={10} fill={COLORS.textMuted} textAnchor="end">{pct}%</text>
              </g>
            );
          })}
          {[0, 7, 14].map((d) => {
            const px = trendPadL + (d / trendDays) * trendPlotW;
            return (
              <text key={d} x={px} y={trendH - 6} fontSize={10} fill={COLORS.textMuted} textAnchor="middle">Day {d}</text>
            );
          })}
          <path d={trendPath} fill="none" stroke={fuelColor} strokeWidth={2} />
          {trendPoints.length > 0 && (
            <circle cx={trendPoints[0].x} cy={trendPoints[0].y} r={4} fill={fuelColor} />
          )}
        </svg>
      </div>

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
          Edit Fuel Data
        </button>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: 8, padding: 32, width: 380, boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}>
            <h2 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 700, color: COLORS.textPrimary }}>
              Edit Fuel Data — {selectedStation === "maitri" ? "Maitri" : "Bharati"}
            </h2>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, color: COLORS.textSecondary, display: "block", marginBottom: 6 }}>Current Fuel (L)</label>
              <input
                type="number"
                value={editFuelL}
                onChange={(e) => setEditFuelL(e.target.value)}
                style={{ width: "100%", padding: "8px 10px", border: "1px solid #E2E8F0", borderRadius: 4, fontSize: 14, boxSizing: "border-box" }}
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 13, color: COLORS.textSecondary, display: "block", marginBottom: 6 }}>Daily Consumption (L/day)</label>
              <input
                type="number"
                value={editFuelCon}
                onChange={(e) => setEditFuelCon(e.target.value)}
                style={{ width: "100%", padding: "8px 10px", border: "1px solid #E2E8F0", borderRadius: 4, fontSize: 14, boxSizing: "border-box" }}
              />
            </div>
            {saved && (
              <p style={{ margin: "0 0 16px", fontSize: 13, color: COLORS.success, fontWeight: 500 }}>Changes saved successfully.</p>
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
