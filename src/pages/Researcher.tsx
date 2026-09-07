import { useState } from "react";
import { useApp } from "../context/AppContext";

const card: React.CSSProperties = {
  backgroundColor: "#FFFFFF",
  border: "1px solid #E2E8F0",
  borderRadius: 6,
  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  padding: "20px 24px",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 600,
  color: "#64748B",
  marginBottom: 5,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  border: "1px solid #E2E8F0",
  borderRadius: 5,
  fontSize: 13,
  color: "#0F172A",
  backgroundColor: "#FFFFFF",
  boxSizing: "border-box",
};

const sectionTitle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 700,
  color: "#0F172A",
  margin: "0 0 16px",
  paddingBottom: 10,
  borderBottom: "1px solid #E2E8F0",
};

type SubmitState = "idle" | "saving" | "submitted";

export default function Researcher() {
  const { maitri, bharati, submitResearcherLog, researcherStation } = useApp();

  const isBharati = researcherStation === "Bharati";
  const stationLabel = isBharati ? "Bharati" : "Maitri";
  const researcherName = isBharati ? "Dr. Arjun Mehta" : "Dr. Priya Nair";
  const stationData = isBharati ? bharati : maitri;

  const [formData, setFormData] = useState({
    // Environmental
    temperature: String(stationData.temp),
    windSpeed: String(stationData.wind),
    windDirection: stationData.windDir,
    visibility: String(stationData.visibility),
    pressure: String(stationData.pressure),
    weatherConditions: stationData.weather,
    snowfall: "0",
    stormProbability: String(stationData.stormProb),
    // Personnel
    totalPersonnel: String(stationData.personnel),
    outdoorTeams: "6",
    researchTeam: "8",
    operationsStaff: "10",
    // Power
    fuelLevel: String(stationData.fuelPct),
    fuelVolume: String(stationData.fuelL),
    powerGenerated: String(stationData.powerGen),
    powerConsumed: String(stationData.powerCon),
    generatorStatus: "1 Offline",
    // Research Activity
    activityName: isBharati ? "Glaciology Survey - Ice Flow Mapping" : "Ice Core Sampling - Layer Analysis",
    activityDescription: "",
    duration: "6 hours",
    location: isBharati ? "Survey Site B-4, East Antarctica" : "Eastern Ice Field, Grid C-7",
    equipmentUsed: isBharati ? "GPS Survey Array, Seismic Sensors, Drone" : "Ice Core Drill, GPS Unit, Sample Kit",
    // Observations
    observations: "",
  });

  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [submittedId, setSubmittedId] = useState("");
  const [isDraft, setIsDraft] = useState(false);
  const [draftMessage, setDraftMessage] = useState("");
  const isOnline = true;

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const getCurrentTime = () => {
    const now = new Date();
    return `${String(now.getUTCHours()).padStart(2, "0")}:${String(now.getUTCMinutes()).padStart(2, "0")} UTC`;
  };

  const handleDraft = () => {
    setIsDraft(true);
    const draftId = "DRAFT-" + String(Date.now()).slice(-4);
    submitResearcherLog({
      id: draftId,
      type: "Daily Log",
      station: stationLabel,
      submittedBy: researcherName,
      date: "06 Sep 2026",
      time: getCurrentTime(),
      status: "draft",
      data: { ...formData },
    });
    setDraftMessage("Draft saved successfully.");
    setTimeout(() => setDraftMessage(""), 3000);
  };

  const handleSubmit = () => {
    setSubmitState("saving");
    setTimeout(() => {
      const id = "LOG-2026-0906-" + String(Date.now()).slice(-3);
      submitResearcherLog({
        id,
        type: "Daily Log",
        station: stationLabel,
        submittedBy: researcherName,
        date: "06 Sep 2026",
        time: getCurrentTime(),
        status: "submitted",
        data: { ...formData },
      });
      setSubmittedId(id);
      setSubmitState("submitted");
    }, 600);
  };

  const handleReset = () => {
    setSubmitState("idle");
    setSubmittedId("");
    setIsDraft(false);
    setDraftMessage("");
  };

  // Success screen
  if (submitState === "submitted") {
    return (
      <div
        style={{
          backgroundColor: "#F0F4F8",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            ...card,
            textAlign: "center",
            maxWidth: 440,
            width: "100%",
            padding: "48px 40px",
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              backgroundColor: "#DCFCE7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 style={{ margin: "0 0 10px", fontSize: 20, fontWeight: 700, color: "#0F172A" }}>Daily Log Submitted</h2>
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "#1677FF",
              fontFamily: "monospace",
              marginBottom: 10,
              backgroundColor: "#EFF6FF",
              padding: "8px 14px",
              borderRadius: 6,
              display: "inline-block",
            }}
          >
            LOG ID: {submittedId}
          </div>
          <p style={{ fontSize: 13, color: "#94A3B8", margin: "10px 0 28px" }}>
            Report automatically added to station records.
          </p>
          <button
            onClick={handleReset}
            style={{
              padding: "10px 24px",
              backgroundColor: "#1677FF",
              color: "#FFFFFF",
              border: "none",
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Submit Another Log
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#F0F4F8", minHeight: "100vh", padding: "28px 32px", fontFamily: "system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#0F172A" }}>Daily Log Submission</h1>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748B" }}>Station: {stationLabel.toUpperCase()} - {researcherName} - 06 Sep 2026</p>
      </div>

      {draftMessage && (
        <div
          style={{
            backgroundColor: "#DCFCE7",
            border: "1px solid #86EFAC",
            borderRadius: 6,
            padding: "10px 16px",
            marginBottom: 16,
            fontSize: 13,
            fontWeight: 600,
            color: "#16A34A",
          }}
        >
          {draftMessage}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Section 1: Environmental Conditions */}
        <div style={card}>
          <h2 style={sectionTitle}>Environmental Conditions</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px 20px" }}>
            <div>
              <label style={labelStyle}>Temperature (C)</label>
              <input style={inputStyle} type="number" value={formData.temperature} onChange={(e) => handleChange("temperature", e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Wind Speed (km/h)</label>
              <input style={inputStyle} type="number" value={formData.windSpeed} onChange={(e) => handleChange("windSpeed", e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Wind Direction</label>
              <select style={inputStyle} value={formData.windDirection} onChange={(e) => handleChange("windDirection", e.target.value)}>
                {["N", "NE", "E", "SE", "S", "SW", "W", "NW"].map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Visibility (km)</label>
              <input style={inputStyle} type="number" value={formData.visibility} onChange={(e) => handleChange("visibility", e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Pressure (hPa)</label>
              <input style={inputStyle} type="number" value={formData.pressure} onChange={(e) => handleChange("pressure", e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Weather Conditions</label>
              <select style={inputStyle} value={formData.weatherConditions} onChange={(e) => handleChange("weatherConditions", e.target.value)}>
                {["Clear", "Light snow", "Heavy snow", "Blizzard", "Overcast", "Cloudy", "Partly cloudy"].map((w) => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Snowfall (cm)</label>
              <input style={inputStyle} type="number" value={formData.snowfall} onChange={(e) => handleChange("snowfall", e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Storm Probability (%)</label>
              <input style={inputStyle} type="number" min="0" max="100" value={formData.stormProbability} onChange={(e) => handleChange("stormProbability", e.target.value)} />
            </div>
          </div>
        </div>

        {/* Section 2: Personnel */}
        <div style={card}>
          <h2 style={sectionTitle}>Personnel</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px 20px" }}>
            <div>
              <label style={labelStyle}>Total Personnel</label>
              <input
                style={{ ...inputStyle, backgroundColor: "#F8FAFC", color: "#64748B" }}
                type="number"
                value={formData.totalPersonnel}
                readOnly
              />
            </div>
            <div>
              <label style={labelStyle}>Outdoor Teams</label>
              <input style={inputStyle} type="number" value={formData.outdoorTeams} onChange={(e) => handleChange("outdoorTeams", e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Research Team</label>
              <input style={inputStyle} type="number" value={formData.researchTeam} onChange={(e) => handleChange("researchTeam", e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Operations Staff</label>
              <input style={inputStyle} type="number" value={formData.operationsStaff} onChange={(e) => handleChange("operationsStaff", e.target.value)} />
            </div>
          </div>
        </div>

        {/* Section 3: Power and Resources */}
        <div style={card}>
          <h2 style={sectionTitle}>Power and Resources</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px 20px" }}>
            <div>
              <label style={labelStyle}>Fuel Level (%)</label>
              <input style={inputStyle} type="number" value={formData.fuelLevel} onChange={(e) => handleChange("fuelLevel", e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Fuel Volume (L)</label>
              <input style={inputStyle} type="number" value={formData.fuelVolume} onChange={(e) => handleChange("fuelVolume", e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Power Generated (MW)</label>
              <input style={inputStyle} type="number" value={formData.powerGenerated} onChange={(e) => handleChange("powerGenerated", e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Power Consumed (MW)</label>
              <input style={inputStyle} type="number" value={formData.powerConsumed} onChange={(e) => handleChange("powerConsumed", e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Generator Status</label>
              <select style={inputStyle} value={formData.generatorStatus} onChange={(e) => handleChange("generatorStatus", e.target.value)}>
                {["All Operational", "1 Offline", "2 Offline", "Maintenance"].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 4: Research Activity */}
        <div style={card}>
          <h2 style={sectionTitle}>Research Activity</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 20px" }}>
            <div>
              <label style={labelStyle}>Project / Activity Name</label>
              <input style={inputStyle} type="text" value={formData.activityName} onChange={(e) => handleChange("activityName", e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Duration</label>
              <input style={inputStyle} type="text" value={formData.duration} onChange={(e) => handleChange("duration", e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Location</label>
              <input style={inputStyle} type="text" value={formData.location} onChange={(e) => handleChange("location", e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Equipment Used</label>
              <input style={inputStyle} type="text" value={formData.equipmentUsed} onChange={(e) => handleChange("equipmentUsed", e.target.value)} />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Description</label>
              <textarea
                style={{ ...inputStyle, resize: "vertical" }}
                rows={3}
                value={formData.activityDescription}
                onChange={(e) => handleChange("activityDescription", e.target.value)}
                placeholder="Describe the research activity..."
              />
            </div>
          </div>
        </div>

        {/* Section 5: Observations and Notes */}
        <div style={card}>
          <h2 style={sectionTitle}>Observations and Notes</h2>
          <textarea
            style={{ ...inputStyle, resize: "vertical" }}
            rows={6}
            value={formData.observations}
            onChange={(e) => handleChange("observations", e.target.value)}
            placeholder="Record significant observations, anomalies, safety incidents, or other notable events..."
          />
        </div>

        {/* Section 6: Attachments */}
        <div style={card}>
          <h2 style={sectionTitle}>Attachments</h2>
          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={() => alert("File upload available in full version")}
              style={{
                padding: "9px 18px",
                border: "1px solid #E2E8F0",
                borderRadius: 6,
                backgroundColor: "#FFFFFF",
                color: "#0F172A",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Upload Photo
            </button>
            <button
              onClick={() => alert("File upload available in full version")}
              style={{
                padding: "9px 18px",
                border: "1px solid #E2E8F0",
                borderRadius: 6,
                backgroundColor: "#FFFFFF",
                color: "#0F172A",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Upload Document
            </button>
          </div>
          <p style={{ margin: "10px 0 0", fontSize: 12, color: "#94A3B8" }}>
            Supported: JPG, PNG, PDF, DOCX (max 20MB each)
          </p>
        </div>

      </div>

      {/* Action Bar */}
      <div
        style={{
          marginTop: 24,
          padding: "16px 24px",
          backgroundColor: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: 6,
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: isOnline ? "#16A34A" : "#DC2626",
            }}
          />
          <span style={{ fontSize: 12, color: "#64748B", fontWeight: 500 }}>
            {isOnline ? "Online - Connected to Station Network" : "Offline"}
          </span>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {isDraft && (
            <span style={{ fontSize: 12, color: "#94A3B8" }}>Draft saved</span>
          )}
          <button
            onClick={handleDraft}
            disabled={submitState === "saving"}
            style={{
              padding: "9px 18px",
              border: "1px solid #E2E8F0",
              borderRadius: 6,
              backgroundColor: "#FFFFFF",
              color: "#0F172A",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              opacity: submitState === "saving" ? 0.6 : 1,
            }}
          >
            Save Draft
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitState === "saving"}
            style={{
              padding: "10px 24px",
              backgroundColor: "#1677FF",
              color: "#FFFFFF",
              border: "none",
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 700,
              cursor: submitState === "saving" ? "not-allowed" : "pointer",
              opacity: submitState === "saving" ? 0.75 : 1,
              minWidth: 160,
            }}
          >
            {submitState === "saving" ? "Submitting..." : "Submit Daily Log"}
          </button>
        </div>
      </div>
    </div>
  );
}
