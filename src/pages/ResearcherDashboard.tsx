import { useState } from "react";
import type { Page } from "../types";
import { useApp } from "../context/AppContext";
import type { EmergencyIncident } from "../context/AppContext";

const card: React.CSSProperties = {
  backgroundColor: "#FFFFFF",
  border: "1px solid #E2E8F0",
  borderRadius: 6,
  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  padding: "20px 24px",
};

interface ResearcherDashboardProps {
  onNavigate: (p: Page) => void;
}

const EMERGENCY_TYPES = [
  "Equipment Damage",
  "Generator Failure",
  "Fuel Shortage",
  "Severe Weather",
  "Medical Emergency",
  "Communication Loss",
  "Other",
];

function EmergencyModal({
  onClose,
  researcherStation,
  researcherName,
  onSubmit,
}: {
  onClose: () => void;
  researcherStation: "Maitri" | "Bharati";
  researcherName: string;
  onSubmit: (incident: EmergencyIncident) => void;
}) {
  const otherStation: "Maitri" | "Bharati" = researcherStation === "Maitri" ? "Bharati" : "Maitri";
  const [affectedStation, setAffectedStation] = useState<"Maitri" | "Bharati">(researcherStation);
  const [supportStation, setSupportStation] = useState<"Maitri" | "Bharati">(otherStation);
  const [emergencyType, setEmergencyType] = useState("Equipment Damage");
  const [severity, setSeverity] = useState<"Critical" | "High" | "Moderate">("Critical");
  const [description, setDescription] = useState("");
  const [requiredAssistance, setRequiredAssistance] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [incidentId, setIncidentId] = useState("");

  function handleAffectedChange(s: "Maitri" | "Bharati") {
    setAffectedStation(s);
    setSupportStation(s === "Maitri" ? "Bharati" : "Maitri");
  }

  function handleSubmit() {
    const now = new Date();
    const utcTime = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) + " UTC";
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
    const seq = String(Math.floor(Math.random() * 900) + 100);
    const id = `EMG-${dateStr.slice(0, 4)}-${dateStr.slice(4, 8)}-${seq}`;
    setIncidentId(id);
    const incident: EmergencyIncident = {
      id,
      affectedStation,
      supportStation,
      emergencyType,
      severity,
      description,
      requiredAssistance,
      createdBy: researcherName,
      timestamp: utcTime,
      connectionStatus: "active",
      acknowledged: false,
    };
    onSubmit(incident);
    setSubmitted(true);
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "8px 10px",
    border: "1px solid #E2E8F0",
    borderRadius: 4,
    fontSize: 13,
    color: "#0F172A",
    outline: "none",
    boxSizing: "border-box",
    backgroundColor: "#FAFAFA",
    fontFamily: "inherit",
  };

  const severityColor = severity === "Critical" ? "#DC2626" : severity === "High" ? "#EA580C" : "#D97706";

  return (
    <div
      style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.55)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeIn 0.15s ease" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ backgroundColor: "#FFFFFF", borderRadius: 8, width: 540, maxWidth: "95vw", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", animation: "fadeIn 0.18s ease" }}>
        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #F1F5F9", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#DC2626", boxShadow: "0 0 0 3px rgba(220,38,38,0.2)" }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: "#DC2626", letterSpacing: "0.1em" }}>EMERGENCY PROTOCOL</span>
            </div>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0F172A" }}>Emergency Inter-Station Connection</h2>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "#64748B" }}>Establish emergency channel between stations</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#94A3B8", lineHeight: 1 }}>✕</button>
        </div>

        {submitted ? (
          <div style={{ padding: "32px 24px", textAlign: "center" }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", backgroundColor: "#FEE2E2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#DC2626", marginBottom: 6 }}>EMERGENCY CHANNEL ACTIVATED</div>
            <div style={{ fontSize: 13, color: "#0F172A", fontWeight: 600, marginBottom: 4 }}>{incidentId}</div>
            <div style={{ fontSize: 12, color: "#64748B", marginBottom: 20, lineHeight: 1.6 }}>
              {affectedStation} → {supportStation} emergency channel is now active.<br />
              All relevant dashboards and alerts updated immediately.<br />
              Physical resupply may be restricted by weather, terrain and station distance.
            </div>
            <div style={{ backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 6, padding: "12px 16px", textAlign: "left", marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: "#94A3B8", marginBottom: 8, fontWeight: 600, letterSpacing: "0.06em" }}>INTER-STATION CHANNEL PROVIDES</div>
              {["Emergency communication", "Data sharing", "Situation reporting", "Response coordination"].map(s => (
                <div key={s} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: "#16A34A", flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: "#475569" }}>{s}</span>
                </div>
              ))}
            </div>
            <button onClick={onClose} style={{ padding: "9px 24px", backgroundColor: "#0F172A", color: "#fff", border: "none", borderRadius: 4, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              Close
            </button>
          </div>
        ) : (
          <div style={{ padding: "20px 24px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#374151", marginBottom: 5 }}>Affected Station</label>
                <select value={affectedStation} onChange={(e) => handleAffectedChange(e.target.value as "Maitri" | "Bharati")} style={inputStyle}>
                  <option value="Maitri">Maitri</option>
                  <option value="Bharati">Bharati</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#374151", marginBottom: 5 }}>Support Station</label>
                <select value={supportStation} disabled style={{ ...inputStyle, backgroundColor: "#F1F5F9", color: "#64748B" }}>
                  <option value="Maitri">Maitri</option>
                  <option value="Bharati">Bharati</option>
                </select>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#374151", marginBottom: 5 }}>Emergency Type</label>
                <select value={emergencyType} onChange={(e) => setEmergencyType(e.target.value)} style={inputStyle}>
                  {EMERGENCY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#374151", marginBottom: 5 }}>Severity</label>
                <select value={severity} onChange={(e) => setSeverity(e.target.value as "Critical" | "High" | "Moderate")} style={{ ...inputStyle, color: severityColor, fontWeight: 600 }}>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Moderate">Moderate</option>
                </select>
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#374151", marginBottom: 5 }}>Description</label>
              <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the emergency situation..." style={{ ...inputStyle, resize: "vertical" }} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#374151", marginBottom: 5 }}>Required Assistance</label>
              <textarea rows={2} value={requiredAssistance} onChange={(e) => setRequiredAssistance(e.target.value)} placeholder="Specify required assistance..." style={{ ...inputStyle, resize: "vertical" }} />
            </div>
            <div style={{ backgroundColor: "#FFFBEB", border: "1px solid #FCD34D", borderRadius: 4, padding: "10px 12px", marginBottom: 20, fontSize: 11, color: "#92400E", lineHeight: 1.5 }}>
              ⚠ Physical resupply and transportation may be restricted by weather, terrain and station distance. This channel provides communication, data sharing and coordination — not guaranteed physical transport.
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={handleSubmit} style={{ flex: 1, padding: "10px", backgroundColor: "#DC2626", color: "#fff", border: "none", borderRadius: 4, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                ⚡ Activate Emergency Channel
              </button>
              <button onClick={onClose} style={{ padding: "10px 20px", backgroundColor: "#F8FAFC", color: "#64748B", border: "1px solid #E2E8F0", borderRadius: 4, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ResearcherDashboard({ onNavigate }: ResearcherDashboardProps) {
  const { maitri, bharati, reports, researcherStation, emergencies, addEmergency, acknowledgeEmergency } = useApp();
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

  const stationData = researcherStation === "Bharati" ? bharati : maitri;
  const stationLabel = researcherStation ?? "Maitri";
  const researcherName = researcherStation === "Bharati" ? "Dr. Arjun Mehta" : "Dr. Priya Nair";
  const otherStation = researcherStation === "Bharati" ? "Maitri" : "Bharati";

  const stationReports = reports.filter((r) => r.station === (researcherStation ?? "Maitri")).slice(0, 3);

  const myEmergency = emergencies.find((e) => e.affectedStation === stationLabel && e.connectionStatus === "active");
  const incomingEmergency = emergencies.find((e) => e.supportStation === stationLabel && e.connectionStatus === "active");
  const activeEmergency = myEmergency ?? incomingEmergency;
  const isAffected = !!myEmergency;

  function statusBadge(status: string) {
    const isSubmitted = status === "submitted";
    return (
      <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: 12, fontSize: 11, fontWeight: 600, backgroundColor: isSubmitted ? "#DCFCE7" : "#FEF3C7", color: isSubmitted ? "#16A34A" : "#B45309" }}>
        {isSubmitted ? "Submitted" : status === "draft" ? "Draft" : status}
      </span>
    );
  }

  const severityColor = (s: string) => s === "Critical" ? "#DC2626" : s === "High" ? "#EA580C" : "#D97706";
  const severityBg = (s: string) => s === "Critical" ? "#FEE2E2" : s === "High" ? "#FFF0E6" : "#FFFBEB";

  return (
    <div style={{ backgroundColor: "#F0F4F8", minHeight: "100vh", padding: "28px 32px", fontFamily: "system-ui, sans-serif" }}>

      {/* Emergency banner */}
      {activeEmergency && (
        <div style={{
          backgroundColor: isAffected ? "#FEE2E2" : "#FFF0E6",
          border: `1px solid ${isAffected ? "#FCA5A5" : "#FDBA74"}`,
          borderRadius: 6,
          padding: "12px 16px",
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: isAffected ? "#DC2626" : "#EA580C" }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: isAffected ? "#DC2626" : "#EA580C" }}>
              {isAffected ? "ACTIVE EMERGENCY" : "INCOMING EMERGENCY"}
            </span>
            <span style={{ fontSize: 12, color: "#374151" }}>
              {activeEmergency.emergencyType} — {activeEmergency.affectedStation} Station · Severity: {activeEmergency.severity} · {activeEmergency.timestamp}
            </span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {!activeEmergency.acknowledged && !isAffected && (
              <button
                onClick={() => acknowledgeEmergency(activeEmergency.id, researcherName)}
                style={{ padding: "5px 12px", backgroundColor: "#EA580C", color: "#fff", border: "none", borderRadius: 4, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
              >
                Acknowledge
              </button>
            )}
            {activeEmergency.acknowledged && (
              <span style={{ fontSize: 11, color: "#16A34A", fontWeight: 600 }}>✓ Acknowledged by {activeEmergency.acknowledgedBy}</span>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#0F172A" }}>Research Operations</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748B" }}>Station: {stationLabel.toUpperCase()}</p>
        </div>
        <div style={{ fontSize: 13, color: "#0F172A", fontWeight: 500 }}>{researcherName}</div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {/* Today's Log */}
        <div style={card}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>{"Today's Log"}</div>
          {(() => {
            const submitted = stationReports.find(r => r.status === "submitted");
            if (submitted) {
              return (
                <>
                  <div style={{ marginBottom: 6 }}>
                    <span style={{ display: "inline-block", padding: "3px 12px", borderRadius: 12, fontSize: 13, fontWeight: 600, backgroundColor: "#DCFCE7", color: "#16A34A" }}>Submitted</span>
                  </div>
                  <div style={{ fontSize: 11, color: "#64748B", lineHeight: 1.6 }}>
                    <div style={{ fontFamily: "monospace", color: "#1677FF", fontWeight: 600, fontSize: 12 }}>{submitted.id}</div>
                    <div>Submitted at {submitted.time}</div>
                    <div>{submitted.submittedBy}</div>
                  </div>
                </>
              );
            }
            return (
              <>
                <div style={{ marginBottom: 6 }}>
                  <span style={{ display: "inline-block", padding: "3px 12px", borderRadius: 12, fontSize: 13, fontWeight: 600, backgroundColor: "#FEF3C7", color: "#B45309" }}>Pending</span>
                </div>
                <div style={{ fontSize: 12, color: "#94A3B8" }}>Not yet submitted</div>
              </>
            );
          })()}
        </div>

        {/* Environmental Observations */}
        <div style={card}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Environmental Obs.</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#0F172A", marginBottom: 6 }}>12</div>
          <div style={{ fontSize: 12, color: "#94A3B8" }}>recorded today</div>
        </div>

        {/* Research Activities */}
        <div style={card}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Research Activities</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#0F172A", marginBottom: 6 }}>4</div>
          <div style={{ fontSize: 12, color: "#94A3B8" }}>active projects</div>
        </div>

        {/* Inter-Station Link */}
        <div style={{ ...card, borderLeft: activeEmergency ? `3px solid ${isAffected ? "#DC2626" : "#EA580C"}` : "3px solid #16A34A" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Inter-Station Link</div>
          {activeEmergency ? (
            <>
              <div style={{ marginBottom: 5 }}>
                <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 3, fontSize: 10, fontWeight: 700, backgroundColor: severityBg(activeEmergency.severity), color: severityColor(activeEmergency.severity), letterSpacing: "0.06em" }}>
                  {isAffected ? "EMERGENCY ACTIVE" : "INCOMING EMERGENCY"}
                </span>
              </div>
              <div style={{ fontSize: 11, color: "#475569", lineHeight: 1.6 }}>
                <div style={{ fontWeight: 600, color: "#0F172A" }}>{activeEmergency.emergencyType}</div>
                <div>{activeEmergency.affectedStation} ↔ {activeEmergency.supportStation}</div>
                <div style={{ color: severityColor(activeEmergency.severity), fontWeight: 600 }}>{activeEmergency.severity}</div>
              </div>
            </>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: "#16A34A" }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: "#16A34A" }}>Connected</span>
              </div>
              <div style={{ fontSize: 11, color: "#64748B" }}>{stationLabel} ↔ {otherStation}<br />Emergency channel available</div>
            </>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
        <button onClick={() => onNavigate("researcher_log")} style={{ padding: "10px 20px", backgroundColor: "#1677FF", color: "#FFFFFF", border: "none", borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
          Submit Daily Log
        </button>
        <button onClick={() => onNavigate("researcher_experiments")} style={{ padding: "10px 20px", backgroundColor: "#FFFFFF", color: "#0F172A", border: "1px solid #E2E8F0", borderRadius: 6, fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
          My Experiments
        </button>
        <button onClick={() => onNavigate("weather")} style={{ padding: "10px 20px", backgroundColor: "#FFFFFF", color: "#0F172A", border: "1px solid #E2E8F0", borderRadius: 6, fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
          View Weather
        </button>
        <button onClick={() => onNavigate("researcher_reports")} style={{ padding: "10px 20px", backgroundColor: "#FFFFFF", color: "#0F172A", border: "1px solid #E2E8F0", borderRadius: 6, fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
          View Reports
        </button>
        <button
          onClick={() => setShowEmergencyModal(true)}
          style={{ padding: "10px 20px", backgroundColor: "#FFF5F5", color: "#DC2626", border: "1px solid #FCA5A5", borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: "pointer" }}
        >
          ⚡ Emergency Connect
        </button>
      </div>

      {/* Expanded Emergency Channel Panel */}
      {activeEmergency && (
        <div style={{ backgroundColor: "#FFFFFF", border: `1px solid ${isAffected ? "#FCA5A5" : "#FDBA74"}`, borderRadius: 6, padding: "20px 24px", marginBottom: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: severityColor(activeEmergency.severity), letterSpacing: "0.1em", marginBottom: 4 }}>
                {isAffected ? "CRITICAL EMERGENCY — CHANNEL ACTIVE" : "INCOMING EMERGENCY — CHANNEL AVAILABLE"}
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#0F172A" }}>
                {activeEmergency.affectedStation} Station — {activeEmergency.emergencyType}
              </div>
            </div>
            <span style={{ padding: "4px 12px", borderRadius: 4, fontSize: 11, fontWeight: 700, backgroundColor: severityBg(activeEmergency.severity), color: severityColor(activeEmergency.severity), letterSpacing: "0.06em" }}>
              {activeEmergency.severity.toUpperCase()}
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginBottom: 14 }}>
            {[
              { label: "Incident ID", value: activeEmergency.id },
              { label: "Emergency", value: activeEmergency.emergencyType },
              { label: "Channel", value: `${activeEmergency.affectedStation} ↔ ${activeEmergency.supportStation}` },
              { label: "Created", value: activeEmergency.timestamp },
            ].map((item) => (
              <div key={item.label} style={{ backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 4, padding: "10px 12px" }}>
                <div style={{ fontSize: 10, color: "#94A3B8", fontWeight: 600, marginBottom: 3, letterSpacing: "0.06em" }}>{item.label}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#0F172A" }}>{item.value}</div>
              </div>
            ))}
          </div>

          {activeEmergency.description && (
            <div style={{ fontSize: 12, color: "#475569", marginBottom: 12, lineHeight: 1.6, backgroundColor: "#F8FAFC", borderRadius: 4, padding: "10px 12px" }}>
              <span style={{ fontWeight: 600 }}>Situation: </span>{activeEmergency.description}
            </div>
          )}

          <div style={{ fontSize: 11, color: "#64748B", marginBottom: 14, fontStyle: "italic" }}>
            Physical resupply and transportation may be restricted by weather, terrain and station distance. This channel provides communication, data sharing and coordination.
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {!activeEmergency.acknowledged && !isAffected && (
              <button onClick={() => acknowledgeEmergency(activeEmergency.id, researcherName)} style={{ padding: "8px 16px", backgroundColor: "#DC2626", color: "#fff", border: "none", borderRadius: 4, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                Acknowledge Emergency
              </button>
            )}
            <button onClick={() => onNavigate("researcher_connectivity")} style={{ padding: "8px 16px", backgroundColor: "#FFFFFF", color: "#0F172A", border: "1px solid #E2E8F0", borderRadius: 4, fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>
              Open Station Channel
            </button>
            {activeEmergency.acknowledged && (
              <span style={{ fontSize: 12, color: "#16A34A", fontWeight: 600 }}>
                ✓ Acknowledged by {activeEmergency.acknowledgedBy} at {activeEmergency.acknowledgedAt}
              </span>
            )}
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Station Conditions */}
        <div style={card}>
          <h2 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: "#0F172A" }}>
            {`Current Station Conditions — ${stationLabel}`}
          </h2>
          {stationData.stormProb > 60 && (
            <div style={{ backgroundColor: "#FEF3C7", border: "1px solid #FCD34D", borderRadius: 6, padding: "10px 14px", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B45309" strokeWidth="2.5">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#92400E" }}>Storm Alert: {stationData.stormProb}% probability - Exercise caution</span>
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
            {[
              { label: "Temperature", value: `${stationData.temp}°C` },
              { label: "Wind Speed", value: `${stationData.wind} km/h` },
              { label: "Pressure", value: `${stationData.pressure} hPa` },
              { label: "Visibility", value: `${stationData.visibility} km` },
              { label: "Humidity", value: `${stationData.humidity}%` },
              { label: "Weather", value: stationData.weather },
              { label: "Storm Probability", value: `${stationData.stormProb}%` },
              { label: "Personnel", value: String(stationData.personnel) },
              { label: "Last Sync", value: stationData.lastSync },
            ].map((item) => (
              <div key={item.label} style={{ backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 6, padding: "10px 12px" }}>
                <div style={{ fontSize: 11, color: "#94A3B8", fontWeight: 500, marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Log Submissions */}
        <div style={card}>
          <h2 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: "#0F172A" }}>Recent Log Submissions</h2>
          {stationReports.length === 0 ? (
            <div style={{ padding: "20px 0", textAlign: "center", color: "#94A3B8", fontSize: 13 }}>
              No submissions yet for {stationLabel} station.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {stationReports.map((r) => (
                <div key={r.id} style={{ padding: "12px 14px", backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#0F172A", marginBottom: 2 }}>{r.id}</div>
                    <div style={{ fontSize: 12, color: "#94A3B8" }}>{r.date} {r.time && `· ${r.time}`} · {r.submittedBy}</div>
                  </div>
                  {statusBadge(r.status)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showEmergencyModal && (
        <EmergencyModal
          onClose={() => setShowEmergencyModal(false)}
          researcherStation={researcherStation ?? "Maitri"}
          researcherName={researcherName}
          onSubmit={(incident) => { addEmergency(incident); setShowEmergencyModal(false); }}
        />
      )}
    </div>
  );
}
