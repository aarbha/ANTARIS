import { useState } from "react";
import { useApp } from "../context/AppContext";
import type { EmergencyIncident } from "../context/AppContext";

const card: React.CSSProperties = {
  backgroundColor: "#FFFFFF",
  border: "1px solid #E2E8F0",
  borderRadius: 6,
  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  padding: "20px 24px",
};

const EMERGENCY_TYPES = [
  "Equipment Damage",
  "Generator Failure",
  "Fuel Shortage",
  "Severe Weather",
  "Medical Emergency",
  "Communication Loss",
  "Other",
];

function typeBadge(type: string) {
  const map: Record<string, { bg: string; color: string }> = {
    dataset: { bg: "#DBEAFE", color: "#1D4ED8" },
    experiment: { bg: "#F3E8FF", color: "#7C3AED" },
    message: { bg: "#F0FDF4", color: "#16A34A" },
    report: { bg: "#FEF3C7", color: "#D97706" },
  };
  const c = map[type] || map.dataset;
  return (
    <span style={{ fontSize: 10, fontWeight: 700, color: c.color, backgroundColor: c.bg, padding: "2px 8px", borderRadius: 3, letterSpacing: "0.04em", whiteSpace: "nowrap" }}>
      {type.toUpperCase()}
    </span>
  );
}

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
      id, affectedStation, supportStation, emergencyType, severity, description, requiredAssistance,
      createdBy: researcherName, timestamp: utcTime, connectionStatus: "active", acknowledged: false,
    };
    onSubmit(incident);
    setSubmitted(true);
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "8px 10px", border: "1px solid #E2E8F0", borderRadius: 4,
    fontSize: 13, color: "#0F172A", outline: "none", boxSizing: "border-box",
    backgroundColor: "#FAFAFA", fontFamily: "inherit",
  };

  const severityColor = severity === "Critical" ? "#DC2626" : severity === "High" ? "#EA580C" : "#D97706";

  return (
    <div
      style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.55)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ backgroundColor: "#FFFFFF", borderRadius: 8, width: 540, maxWidth: "95vw", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #F1F5F9", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#DC2626" }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: "#DC2626", letterSpacing: "0.1em" }}>EMERGENCY PROTOCOL</span>
            </div>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0F172A" }}>Emergency Inter-Station Connection</h2>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "#64748B" }}>Establish emergency channel between stations</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#94A3B8" }}>✕</button>
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
              All relevant dashboards and alerts updated immediately.
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

export default function ResearcherConnectivity() {
  const { transfers, experiments, researcherStation, emergencies, addEmergency, acknowledgeEmergency } = useApp();
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

  const stationLabel = researcherStation ?? "Maitri";
  const researcherName = researcherStation === "Bharati" ? "Dr. Arjun Mehta" : "Dr. Priya Nair";

  const sharedExperiments = experiments.filter((e) => e.sharedWith);
  const totalToday = transfers.reduce((sum, t) => sum + (parseFloat(t.size.replace(" MB", "")) || 0), 0);
  const maitriToBharati = transfers.filter((t) => t.from === "Maitri").reduce((sum, t) => sum + (parseFloat(t.size.replace(" MB", "")) || 0), 0);
  const bharatiToMaitri = transfers.filter((t) => t.from === "Bharati").reduce((sum, t) => sum + (parseFloat(t.size.replace(" MB", "")) || 0), 0);

  const myEmergency = emergencies.find((e) => e.affectedStation === stationLabel && e.connectionStatus === "active");
  const incomingEmergency = emergencies.find((e) => e.supportStation === stationLabel && e.connectionStatus === "active");
  const activeEmergency = myEmergency ?? incomingEmergency;
  const isAffected = !!myEmergency;

  const severityColor = (s: string) => s === "Critical" ? "#DC2626" : s === "High" ? "#EA580C" : "#D97706";
  const severityBg = (s: string) => s === "Critical" ? "#FEE2E2" : s === "High" ? "#FFF0E6" : "#FFFBEB";

  return (
    <div style={{ backgroundColor: "#F0F4F8", minHeight: "100vh", padding: "28px 32px", fontFamily: "system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#0F172A" }}>Station Research Link</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748B" }}>Secure inter-station scientific data communication — {stationLabel} Station</p>
        </div>
        <button
          onClick={() => setShowEmergencyModal(true)}
          style={{ padding: "9px 18px", backgroundColor: "#FFF5F5", color: "#DC2626", border: "1px solid #FCA5A5", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
        >
          ⚡ Emergency Connect
        </button>
      </div>

      {/* HQ vs Inter-Station Status — key feature */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        {/* HQ / NCPOR Connection */}
        <div style={{ ...card, borderLeft: "3px solid #DC2626" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#94A3B8", letterSpacing: "0.06em", marginBottom: 14 }}>HQ / NCPOR INDIA CONNECTION</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <div style={{ width: 9, height: 9, borderRadius: "50%", backgroundColor: "#DC2626" }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: "#DC2626" }}>OFFLINE</span>
          </div>
          <div style={{ fontSize: 12, color: "#64748B", lineHeight: 1.6, marginBottom: 10 }}>
            Direct SATCOM link to NCPOR Goa is currently unavailable.<br />
            HQ operations dashboard disconnected.
          </div>
          <div style={{ backgroundColor: "#FEE2E2", border: "1px solid #FCA5A5", borderRadius: 4, padding: "8px 12px" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#DC2626", marginBottom: 2, letterSpacing: "0.06em" }}>FAILOVER ACTIVE</div>
            <div style={{ fontSize: 11, color: "#7F1D1D" }}>Station-to-station emergency link operational. Coordinate via Maitri ↔ Bharati channel.</div>
          </div>
        </div>

        {/* Inter-Station Link */}
        <div style={{ ...card, borderLeft: `3px solid ${activeEmergency ? severityColor(activeEmergency.severity) : "#16A34A"}` }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#94A3B8", letterSpacing: "0.06em", marginBottom: 14 }}>INTER-STATION LINK — MAITRI ↔ BHARATI</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <div style={{ width: 9, height: 9, borderRadius: "50%", backgroundColor: "#16A34A", boxShadow: "0 0 0 3px rgba(22,163,74,0.15)" }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: "#16A34A" }}>CONNECTED</span>
            {activeEmergency && (
              <span style={{ padding: "2px 8px", borderRadius: 3, fontSize: 10, fontWeight: 700, backgroundColor: severityBg(activeEmergency.severity), color: severityColor(activeEmergency.severity), letterSpacing: "0.06em" }}>
                EMERGENCY CHANNEL ACTIVE
              </span>
            )}
          </div>
          <div style={{ fontSize: 12, color: "#64748B", lineHeight: 1.6, marginBottom: 10 }}>
            Dedicated operational communication link between stations.<br />
            Protocol: SATCOM / VSAT · AES-256 encrypted
          </div>
          {activeEmergency ? (
            <div style={{ backgroundColor: severityBg(activeEmergency.severity), border: `1px solid ${severityColor(activeEmergency.severity)}30`, borderRadius: 4, padding: "8px 12px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: severityColor(activeEmergency.severity), marginBottom: 2, letterSpacing: "0.06em" }}>{activeEmergency.severity.toUpperCase()} EMERGENCY</div>
              <div style={{ fontSize: 11, color: "#374151" }}>{activeEmergency.emergencyType} — {activeEmergency.affectedStation} Station · {activeEmergency.timestamp}</div>
            </div>
          ) : (
            <div style={{ backgroundColor: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 4, padding: "8px 12px" }}>
              <div style={{ fontSize: 11, color: "#166534" }}>Emergency channel available. Link quality: Excellent · 94 Mbps · 118ms latency</div>
            </div>
          )}
        </div>
      </div>

      {/* Active Emergency Panel */}
      {activeEmergency && (
        <div style={{ backgroundColor: "#FFFFFF", border: `1px solid ${isAffected ? "#FCA5A5" : "#FDBA74"}`, borderRadius: 6, padding: "20px 24px", marginBottom: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: severityColor(activeEmergency.severity), letterSpacing: "0.1em", marginBottom: 3 }}>
                {isAffected ? "OUTGOING EMERGENCY — ASSISTANCE REQUESTED" : "INCOMING EMERGENCY FROM " + activeEmergency.affectedStation.toUpperCase()}
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#0F172A" }}>
                {activeEmergency.affectedStation} Station — {activeEmergency.emergencyType}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, color: "#94A3B8", marginBottom: 2 }}>Incident ID</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#0F172A", fontFamily: "monospace" }}>{activeEmergency.id}</div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 14 }}>
            {[
              { label: "Channel", value: `${activeEmergency.affectedStation} ↔ ${activeEmergency.supportStation}`, color: "#16A34A" },
              { label: "Severity", value: activeEmergency.severity, color: severityColor(activeEmergency.severity) },
              { label: "Status", value: "Channel Active", color: "#1677FF" },
              { label: "Created", value: activeEmergency.timestamp },
            ].map((item) => (
              <div key={item.label} style={{ backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 4, padding: "10px 12px" }}>
                <div style={{ fontSize: 10, color: "#94A3B8", fontWeight: 600, marginBottom: 3, letterSpacing: "0.06em" }}>{item.label}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: item.color ?? "#0F172A" }}>{item.value}</div>
              </div>
            ))}
          </div>

          {activeEmergency.description && (
            <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.6, backgroundColor: "#F8FAFC", borderRadius: 4, padding: "10px 12px", marginBottom: 12 }}>
              <span style={{ fontWeight: 600 }}>Situation: </span>{activeEmergency.description}
            </div>
          )}
          {activeEmergency.requiredAssistance && (
            <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.6, backgroundColor: "#F8FAFC", borderRadius: 4, padding: "10px 12px", marginBottom: 12 }}>
              <span style={{ fontWeight: 600 }}>Required Assistance: </span>{activeEmergency.requiredAssistance}
            </div>
          )}

          <div style={{ fontSize: 11, color: "#64748B", fontStyle: "italic", marginBottom: 14 }}>
            Physical resupply and transportation may be restricted by weather, terrain and station distance.
            This channel provides: COMMUNICATION · DATA SHARING · COORDINATION · EMERGENCY SUPPORT
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {!activeEmergency.acknowledged && !isAffected && (
              <button onClick={() => acknowledgeEmergency(activeEmergency.id, researcherName)} style={{ padding: "8px 16px", backgroundColor: "#DC2626", color: "#fff", border: "none", borderRadius: 4, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                Acknowledge Emergency
              </button>
            )}
            <button style={{ padding: "8px 16px", backgroundColor: "#FFFFFF", color: "#0F172A", border: "1px solid #E2E8F0", borderRadius: 4, fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>
              Share Emergency Data
            </button>
            {activeEmergency.acknowledged && (
              <span style={{ fontSize: 12, color: "#16A34A", fontWeight: 600 }}>
                ✓ Acknowledged by {activeEmergency.acknowledgedBy} at {activeEmergency.acknowledgedAt}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Connectivity Diagram */}
      <div style={{ ...card, marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#64748B", letterSpacing: "0.06em", marginBottom: 20 }}>INTER-STATION CONNECTIVITY</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, padding: "16px 0" }}>
          <div style={{ textAlign: "center", minWidth: 160, backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 8, padding: "16px 20px" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#64748B", letterSpacing: "0.08em", marginBottom: 10 }}>MAITRI STATION</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#16A34A", boxShadow: "0 0 0 3px rgba(22,163,74,0.2)" }} />
              <span style={{ fontSize: 12, color: "#16A34A", fontWeight: 600 }}>Connected</span>
            </div>
            <div style={{ fontSize: 11, color: "#94A3B8" }}>Last sync: 14:32 UTC</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, maxWidth: 280, position: "relative", padding: "0 8px" }}>
            <div style={{ width: "100%", height: 2, backgroundColor: activeEmergency ? "#DC2626" : "#1677FF", position: "relative" }}>
              <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)", backgroundColor: activeEmergency ? "#FEE2E2" : "#EFF6FF", border: `1px solid ${activeEmergency ? "#FCA5A5" : "#BFDBFE"}`, borderRadius: 6, padding: "6px 12px", whiteSpace: "nowrap" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: activeEmergency ? "#DC2626" : "#1D4ED8", textAlign: "center", letterSpacing: "0.05em" }}>
                  {activeEmergency ? "EMERGENCY CHANNEL" : "SECURE RESEARCH LINK"}
                </div>
              </div>
            </div>
            <div style={{ marginTop: 24, fontSize: 11, color: "#64748B", textAlign: "center" }}>
              {activeEmergency
                ? `Emergency: ${activeEmergency.emergencyType} · ${activeEmergency.severity}`
                : "Link Quality: Excellent · 94 Mbps · Latency: 118ms · Encrypted: AES-256"}
            </div>
          </div>

          <div style={{ textAlign: "center", minWidth: 160, backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 8, padding: "16px 20px" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#64748B", letterSpacing: "0.08em", marginBottom: 10 }}>BHARATI STATION</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#16A34A", boxShadow: "0 0 0 3px rgba(22,163,74,0.2)" }} />
              <span style={{ fontSize: 12, color: "#16A34A", fontWeight: 600 }}>Connected</span>
            </div>
            <div style={{ fontSize: 11, color: "#94A3B8" }}>Last sync: 14:29 UTC</div>
          </div>
        </div>
      </div>

      {/* 3-column grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 20 }}>
        <div style={card}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#64748B", letterSpacing: "0.06em", marginBottom: 14 }}>CONNECTION DETAILS</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { label: "Status", value: "Connected", color: "#16A34A" },
              { label: "Emergency Channel", value: activeEmergency ? "Active" : "Available", color: activeEmergency ? "#DC2626" : "#64748B" },
              { label: "Protocol", value: "SATCOM / VSAT" },
              { label: "Bandwidth", value: "94 Mbps" },
              { label: "Latency", value: "118ms" },
              { label: "Uptime", value: "99.2%" },
              { label: "Encryption", value: "AES-256" },
            ].map((item) => (
              <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, color: "#64748B" }}>{item.label}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: item.color ?? "#0F172A" }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={card}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#64748B", letterSpacing: "0.06em", marginBottom: 14 }}>DATA EXCHANGE SUMMARY</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ backgroundColor: "#F8FAFC", borderRadius: 6, padding: "10px 14px" }}>
              <div style={{ fontSize: 11, color: "#94A3B8", marginBottom: 2 }}>Total Transferred Today</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#1677FF" }}>{totalToday.toFixed(1)} MB</div>
            </div>
            {[
              { label: "Maitri → Bharati", value: `${maitriToBharati.toFixed(1)} MB` },
              { label: "Bharati → Maitri", value: `${bharatiToMaitri.toFixed(1)} MB` },
              { label: "Pending Uploads", value: "0" },
              { label: "Shared Experiments", value: String(sharedExperiments.length) },
            ].map((item) => (
              <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, color: "#64748B" }}>{item.label}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#0F172A" }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={card}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#64748B", letterSpacing: "0.06em", marginBottom: 14 }}>SHARED EXPERIMENTS</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {sharedExperiments.length === 0 && (
              <p style={{ fontSize: 13, color: "#94A3B8", margin: 0 }}>No experiments currently shared.</p>
            )}
            {sharedExperiments.map((exp) => (
              <div key={exp.id} style={{ backgroundColor: "#F8FAFC", borderRadius: 6, padding: "10px 12px" }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#0F172A", marginBottom: 2 }}>{exp.name}</div>
                <div style={{ fontSize: 11, color: "#64748B", marginBottom: 4 }}>{exp.station} → {exp.sharedWith}</div>
                <div style={{ fontSize: 11, color: "#94A3B8" }}>{exp.dataTransferred ?? "—"} transferred</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transfers */}
      <div style={card}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#64748B", letterSpacing: "0.06em", marginBottom: 16 }}>RECENT TRANSFERS</div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Time", "From", "To", "Description", "Size", "Type"].map((col) => (
                <th key={col} style={{ textAlign: "left", fontSize: 11, fontWeight: 600, color: "#94A3B8", paddingBottom: 10, borderBottom: "1px solid #F1F5F9" }}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {transfers.map((t, i) => (
              <tr key={t.id} style={{ borderBottom: i < transfers.length - 1 ? "1px solid #F8FAFC" : "none" }}>
                <td style={{ fontSize: 12, color: "#94A3B8", padding: "10px 0" }}>{t.time}</td>
                <td style={{ fontSize: 12, fontWeight: 500, color: "#0F172A", padding: "10px 8px 10px 0" }}>{t.from}</td>
                <td style={{ fontSize: 12, fontWeight: 500, color: "#0F172A", padding: "10px 8px 10px 0" }}>{t.to}</td>
                <td style={{ fontSize: 12, color: "#475569", padding: "10px 8px 10px 0" }}>{t.description}</td>
                <td style={{ fontSize: 12, color: "#64748B", padding: "10px 8px 10px 0", whiteSpace: "nowrap" }}>{t.size}</td>
                <td style={{ padding: "10px 0" }}>{typeBadge(t.type)}</td>
              </tr>
            ))}
          </tbody>
        </table>
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
