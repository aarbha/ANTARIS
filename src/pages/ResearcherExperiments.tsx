import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import type { ResearchExperiment } from "../context/AppContext";

const card: React.CSSProperties = {
  backgroundColor: "#FFFFFF",
  border: "1px solid #E2E8F0",
  borderRadius: 6,
  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  padding: "20px 24px",
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

function statusBadge(status: ResearchExperiment["status"]) {
  const map: Record<string, { bg: string; color: string }> = {
    Active: { bg: "#DCFCE7", color: "#16A34A" },
    "Data Collection": { bg: "#DBEAFE", color: "#1D4ED8" },
    Analysis: { bg: "#FEF3C7", color: "#D97706" },
    Completed: { bg: "#F1F5F9", color: "#64748B" },
    Paused: { bg: "#FEF3C7", color: "#F59E0B" },
  };
  const c = map[status] || map.Completed;
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
  );
}

type ShareStep = "idle" | "packaging" | "encrypting" | "transferring" | "acknowledged" | "success";

const SHARE_STEPS: { key: ShareStep; label: string }[] = [
  { key: "packaging", label: "Creating experiment package..." },
  { key: "encrypting", label: "Encrypting data..." },
  { key: "transferring", label: "Transferring to station link..." },
  { key: "acknowledged", label: "Destination station acknowledged..." },
  { key: "success", label: "Success" },
];

function ShareModal({
  experiments,
  onClose,
  onShared,
}: {
  experiments: ResearchExperiment[];
  onClose: () => void;
  onShared: (expName: string, dest: "Maitri" | "Bharati") => void;
}) {
  const [selectedExpId, setSelectedExpId] = useState(experiments[0]?.id ?? "");
  const [destination, setDestination] = useState<"Maitri" | "Bharati">("Bharati");
  const [team, setTeam] = useState("");
  const [files, setFiles] = useState("EXP-M001_dataset_03Sep.zip");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState("Normal");
  const [step, setStep] = useState<ShareStep>("idle");
  const [stepIndex, setStepIndex] = useState(-1);

  const selectedExp = experiments.find((e) => e.id === selectedExpId);

  function getCurrentUTC() {
    const now = new Date();
    return `${String(now.getUTCHours()).padStart(2, "0")}:${String(now.getUTCMinutes()).padStart(2, "0")} UTC`;
  }

  function handleSend() {
    setStep("packaging");
    setStepIndex(0);
  }

  useEffect(() => {
    if (stepIndex < 0 || stepIndex >= SHARE_STEPS.length - 1) return;
    const timer = setTimeout(() => {
      const nextIndex = stepIndex + 1;
      setStepIndex(nextIndex);
      setStep(SHARE_STEPS[nextIndex].key);
      if (SHARE_STEPS[nextIndex].key === "success") {
        onShared(selectedExp?.name ?? "Experiment", destination);
      }
    }, 1200);
    return () => clearTimeout(timer);
  }, [stepIndex, destination, selectedExp, onShared]);

  const isAnimating = step !== "idle" && step !== "success";

  const successTimeline = [
    { time: "14:21 UTC", label: "Experiment package created" },
    { time: "14:22 UTC", label: "Data encrypted (AES-256)" },
    { time: "14:23 UTC", label: "Transferred to secure station link" },
    { time: "14:24 UTC", label: `${destination} acknowledged receipt` },
    { time: "14:24 UTC", label: "Experiment available to destination researchers" },
  ];

  return (
    <div
      style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100 }}
      onClick={step === "idle" ? onClose : undefined}
    >
      <div
        style={{ backgroundColor: "#FFF", borderRadius: 8, width: 560, maxHeight: "88vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #E2E8F0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#0F172A" }}>Share Research Experiment</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#94A3B8" }}>×</button>
        </div>

        <div style={{ padding: "20px 24px" }}>
          {step === "idle" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#64748B", display: "block", marginBottom: 5 }}>Experiment</label>
                <select style={inputStyle} value={selectedExpId} onChange={(e) => setSelectedExpId(e.target.value)}>
                  {experiments.map((exp) => (
                    <option key={exp.id} value={exp.id}>{exp.name} ({exp.id})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#64748B", display: "block", marginBottom: 8 }}>Destination Station</label>
                <div style={{ display: "flex", gap: 16 }}>
                  {(["Maitri", "Bharati"] as const).map((s) => (
                    <label key={s} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 13, color: "#0F172A" }}>
                      <input type="radio" name="destination" value={s} checked={destination === s} onChange={() => setDestination(s)} />
                      {s} Station
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#64748B", display: "block", marginBottom: 5 }}>Research Team</label>
                <input style={inputStyle} type="text" value={team} onChange={(e) => setTeam(e.target.value)} placeholder="e.g. Dr. Arjun Mehta, Kavitha Rajan" />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#64748B", display: "block", marginBottom: 5 }}>Data / Files</label>
                <input style={inputStyle} type="text" value={files} onChange={(e) => setFiles(e.target.value)} placeholder="e.g. EXP-M001_dataset_03Sep.zip" />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#64748B", display: "block", marginBottom: 5 }}>Message</label>
                <textarea style={{ ...inputStyle, resize: "vertical" }} rows={3} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Optional message to destination team..." />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#64748B", display: "block", marginBottom: 5 }}>Priority</label>
                <select style={inputStyle} value={priority} onChange={(e) => setPriority(e.target.value)}>
                  {["Normal", "High", "Urgent"].map((p) => <option key={p}>{p}</option>)}
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
                <button onClick={onClose} style={{ padding: "9px 18px", border: "1px solid #E2E8F0", borderRadius: 6, backgroundColor: "#FFF", color: "#0F172A", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>Cancel</button>
                <button onClick={handleSend} style={{ padding: "10px 22px", backgroundColor: "#1677FF", color: "#FFF", border: "none", borderRadius: 6, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Send Securely</button>
              </div>
            </div>
          )}

          {isAnimating && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "8px 0" }}>
              {SHARE_STEPS.filter((s) => s.key !== "success").map((s, i) => {
                const done = i < stepIndex;
                const active = i === stepIndex;
                return (
                  <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${done ? "#16A34A" : active ? "#1677FF" : "#E2E8F0"}`, backgroundColor: done ? "#DCFCE7" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {done && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>}
                      {active && <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#1677FF", animation: "pulse 1s infinite" }} />}
                    </div>
                    <span style={{ fontSize: 13, color: active ? "#1677FF" : done ? "#16A34A" : "#94A3B8", fontWeight: active ? 600 : 400 }}>{s.label}</span>
                  </div>
                );
              })}
            </div>
          )}

          {step === "success" && (
            <div style={{ textAlign: "center", paddingBottom: 8 }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", backgroundColor: "#DCFCE7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              <p style={{ fontSize: 15, fontWeight: 600, color: "#16A34A", margin: "0 0 20px" }}>
                Experiment data synchronized with {destination} Station.
              </p>
              <div style={{ textAlign: "left", backgroundColor: "#F8FAFC", borderRadius: 6, padding: "14px 16px" }}>
                {successTimeline.map((entry, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, marginBottom: i < successTimeline.length - 1 ? 10 : 0 }}>
                    <span style={{ fontSize: 11, color: "#94A3B8", whiteSpace: "nowrap", minWidth: 72 }}>{getCurrentUTC()}</span>
                    <span style={{ fontSize: 12, color: "#475569" }}>{entry.label}</span>
                  </div>
                ))}
              </div>
              <button onClick={onClose} style={{ marginTop: 20, padding: "10px 24px", backgroundColor: "#1677FF", color: "#FFF", border: "none", borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Done</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const DETAIL_TABS = ["Overview", "Observations", "Data", "Team", "Activity"];

function ExperimentDetailModal({ exp, onClose }: { exp: ResearchExperiment; onClose: () => void }) {
  const { maitri, bharati } = useApp();
  const [tab, setTab] = useState("Overview");

  const stationData = exp.station === "Bharati" ? bharati : maitri;

  const mockActivity = [
    { time: "14:18 UTC", label: "Data synchronization completed" },
    { time: "13:45 UTC", label: "Equipment calibration performed" },
    { time: "11:20 UTC", label: "Sample batch collected and logged" },
    { time: "09:00 UTC", label: "Morning observation session started" },
    { time: "Yesterday 18:30 UTC", label: "Research notes updated" },
  ];

  const mockDataEntries = [
    { timestamp: "14:00 UTC", type: "Environmental", value: `${stationData.temp}°C`, notes: "Normal reading" },
    { timestamp: "13:00 UTC", type: "Sample", value: `Sample #${exp.samplesCollected}`, notes: "Collected" },
    { timestamp: "12:00 UTC", type: "Observation", value: "Recorded", notes: "Manual entry" },
    { timestamp: "11:00 UTC", type: "Environmental", value: `${stationData.wind} km/h`, notes: "Wind log" },
  ];

  return (
    <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1200 }}>
      <div style={{ backgroundColor: "#FFF", borderRadius: 8, width: 720, maxHeight: "88vh", overflowY: "auto", boxShadow: "0 12px 48px rgba(0,0,0,0.22)" }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #E2E8F0", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, backgroundColor: "#0B1F33", color: "#FFF", padding: "2px 7px", borderRadius: 3 }}>{exp.station.toUpperCase()}</span>
              {statusBadge(exp.status)}
            </div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#0F172A" }}>{exp.name}</h2>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "#94A3B8" }}>{exp.id} · {exp.researcher}</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#94A3B8", marginLeft: 16 }}>&#x2715;</button>
        </div>

        {/* Tab bar */}
        <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #E2E8F0", paddingLeft: 24 }}>
          {DETAIL_TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: "10px 16px", background: "none", border: "none",
              borderBottom: tab === t ? "2px solid #1677FF" : "2px solid transparent",
              color: tab === t ? "#1677FF" : "#64748B",
              fontWeight: tab === t ? 600 : 400,
              cursor: "pointer", fontSize: 13, marginBottom: -1,
            }}>{t}</button>
          ))}
        </div>

        <div style={{ padding: "24px" }}>
          {tab === "Overview" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <span style={{ fontSize: 12, fontWeight: 600, backgroundColor: "#EFF6FF", color: "#1D4ED8", padding: "4px 10px", borderRadius: 4 }}>{exp.station} Station</span>
                {exp.sharedWith && <span style={{ fontSize: 12, fontWeight: 600, backgroundColor: "#F0FDF4", color: "#16A34A", padding: "4px 10px", borderRadius: 4 }}>Shared with {exp.sharedWith}</span>}
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Research Objective</div>
                <p style={{ margin: 0, fontSize: 13, color: "#0F172A", lineHeight: 1.6 }}>{exp.objective}</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
                {[
                  ["Start Date", exp.startDate],
                  ["Expected Completion", exp.expectedCompletion],
                  ["Last Update", exp.lastUpdate],
                ].map(([label, val]) => (
                  <div key={label} style={{ backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 6, padding: "10px 12px" }}>
                    <div style={{ fontSize: 11, color: "#94A3B8", marginBottom: 4 }}>{label}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>{val}</div>
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Equipment</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {exp.equipment.map((eq) => (
                    <span key={eq} style={{ fontSize: 12, backgroundColor: "#EFF6FF", color: "#1D4ED8", padding: "3px 10px", borderRadius: 4 }}>{eq}</span>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", gap: 20 }}>
                <div style={{ backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 6, padding: "14px 20px", textAlign: "center" }}>
                  <div style={{ fontSize: 28, fontWeight: 700, color: "#1677FF" }}>{exp.samplesCollected}</div>
                  <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>Samples Collected</div>
                </div>
                {exp.dataTransferred && (
                  <div style={{ backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 6, padding: "14px 20px", textAlign: "center" }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: "#16A34A" }}>{exp.dataTransferred}</div>
                    <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>Data Transferred</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === "Observations" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", marginBottom: 8 }}>Current Observations</div>
                <p style={{ margin: 0, fontSize: 13, color: "#475569", lineHeight: 1.7, backgroundColor: "#F8FAFC", padding: "12px 16px", borderRadius: 6, border: "1px solid #E2E8F0" }}>{exp.observations}</p>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", marginBottom: 8 }}>Research Notes</div>
                <p style={{ margin: 0, fontSize: 13, color: "#475569", lineHeight: 1.7, backgroundColor: "#F8FAFC", padding: "12px 16px", borderRadius: 6, border: "1px solid #E2E8F0" }}>{exp.researchNotes}</p>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", marginBottom: 10 }}>Environmental Conditions — {exp.station}</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
                  {[
                    ["Temperature", `${stationData.temp}°C`],
                    ["Wind Speed", `${stationData.wind} km/h`],
                    ["Weather", stationData.weather],
                    ["Pressure", `${stationData.pressure} hPa`],
                    ["Visibility", `${stationData.visibility} km`],
                    ["Humidity", `${stationData.humidity}%`],
                  ].map(([label, val]) => (
                    <div key={label} style={{ backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 6, padding: "10px 12px" }}>
                      <div style={{ fontSize: 11, color: "#94A3B8", marginBottom: 3 }}>{label}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>{val}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === "Data" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {exp.dataTransferred && (
                <div style={{ backgroundColor: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 6, padding: "12px 16px", fontSize: 13, color: "#16A34A", fontWeight: 600 }}>
                  Dataset: {exp.dataTransferred} transferred{exp.sharedWith ? ` to ${exp.sharedWith}` : ""}
                </div>
              )}
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", marginBottom: 8 }}>Sample Collection Progress</div>
                <div style={{ backgroundColor: "#F1F5F9", borderRadius: 4, height: 8, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${Math.min((exp.samplesCollected / 50) * 100, 100)}%`, backgroundColor: "#1677FF", borderRadius: 4 }} />
                </div>
                <div style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>{exp.samplesCollected} / 50 target samples</div>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", marginBottom: 10 }}>Recent Data Entries</div>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid #E2E8F0" }}>
                      {["Timestamp", "Type", "Value", "Notes"].map(h => (
                        <th key={h} style={{ textAlign: "left", padding: "0 0 8px", fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.04em" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {mockDataEntries.map((row, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #F1F5F9" }}>
                        <td style={{ padding: "10px 0", color: "#64748B" }}>{row.timestamp}</td>
                        <td style={{ padding: "10px 0", color: "#0F172A", fontWeight: 500 }}>{row.type}</td>
                        <td style={{ padding: "10px 0", color: "#1677FF", fontWeight: 600 }}>{row.value}</td>
                        <td style={{ padding: "10px 0", color: "#64748B" }}>{row.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === "Team" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {exp.team.map((member, i) => {
                const initials = member.split(" ").filter(w => w.startsWith("Dr.") || /^[A-Z]/.test(w)).map(w => w[0]).join("").slice(0, 2);
                return (
                  <div key={member} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 6 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", backgroundColor: i === 0 ? "#1677FF" : "#7C3AED", color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                      {initials || member.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>{member}</div>
                      <div style={{ fontSize: 11, color: "#94A3B8" }}>{i === 0 ? "Principal Researcher" : "Research Associate"}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {tab === "Activity" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {mockActivity.map((entry, i) => (
                <div key={i} style={{ display: "flex", gap: 14, paddingBottom: i < mockActivity.length - 1 ? 16 : 0, marginBottom: i < mockActivity.length - 1 ? 16 : 0, borderBottom: i < mockActivity.length - 1 ? "1px solid #F1F5F9" : "none" }}>
                  <div style={{ minWidth: 130, fontSize: 11, color: "#94A3B8", paddingTop: 2 }}>{entry.time}</div>
                  <div style={{ fontSize: 13, color: "#475569" }}>{entry.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const RESEARCH_CATEGORIES = ["Atmospheric Science", "Glaciology", "Marine Biology", "Climatology", "Geophysics", "Other"];

function CreateExperimentModal({ onClose }: { onClose: () => void }) {
  const { addExperiment, researcherStation } = useApp();
  const defaultStation: "Maitri" | "Bharati" = researcherStation ?? "Maitri";
  const defaultResearcher = researcherStation === "Bharati" ? "Dr. Arjun Mehta" : "Dr. Priya Nair";

  const [name, setName] = useState("");
  const [objective, setObjective] = useState("");
  const [description, setDescription] = useState("");
  const [station, setStation] = useState<"Maitri" | "Bharati">(defaultStation);
  const [category, setCategory] = useState("Atmospheric Science");
  const [equipment, setEquipment] = useState("");
  const [duration, setDuration] = useState("");
  const [samples, setSamples] = useState("");
  const [priority, setPriority] = useState("Normal");
  const [collaboration, setCollaboration] = useState<"None" | "Maitri" | "Bharati">("None");
  const [success, setSuccess] = useState<string | null>(null);

  function genId() {
    return "EXP-" + (station === "Maitri" ? "M" : "B") + String(Date.now()).slice(-3);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const id = genId();
    const now = new Date();
    const utcTime = `${String(now.getUTCHours()).padStart(2, "0")}:${String(now.getUTCMinutes()).padStart(2, "0")} UTC`;
    const newExp: ResearchExperiment = {
      id,
      name: name || "Unnamed Experiment",
      station,
      researcher: defaultResearcher,
      team: [defaultResearcher],
      objective: objective || "Research objective to be defined.",
      status: "Active",
      startDate: "06 Sep 2026",
      expectedCompletion: duration || "TBD",
      lastUpdate: utcTime,
      equipment: equipment ? equipment.split(",").map(e => e.trim()).filter(Boolean) : [],
      samplesCollected: 0,
      observations: "Experiment initiated. No observations yet.",
      researchNotes: description || "",
      sharedWith: collaboration !== "None" ? collaboration : undefined,
    };
    addExperiment(newExp);
    setSuccess(id);
  }

  const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: "#64748B", display: "block", marginBottom: 5 };

  return (
    <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1200 }}>
      <div style={{ backgroundColor: "#FFF", borderRadius: 8, width: 620, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 12px 48px rgba(0,0,0,0.22)" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #E2E8F0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#0F172A" }}>Create New Experiment</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#94A3B8" }}>&#x2715;</button>
        </div>
        <div style={{ padding: "24px" }}>
          {success ? (
            <div style={{ textAlign: "center", paddingBottom: 8 }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", backgroundColor: "#DCFCE7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              <p style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", margin: "0 0 8px" }}>Experiment Created Successfully</p>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#1677FF", fontFamily: "monospace", backgroundColor: "#EFF6FF", padding: "8px 14px", borderRadius: 6, display: "inline-block", marginBottom: 20 }}>
                {success}
              </div>
              <p style={{ fontSize: 13, color: "#94A3B8", margin: "0 0 24px" }}>The new experiment has been added to your research list.</p>
              <button onClick={onClose} style={{ padding: "10px 24px", backgroundColor: "#1677FF", color: "#FFF", border: "none", borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Done</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={labelStyle}>Experiment Name *</label>
                  <input style={{ ...inputStyle }} required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Polar Vortex Analysis" />
                </div>
                <div>
                  <label style={labelStyle}>Research Objective *</label>
                  <textarea style={{ ...inputStyle, resize: "vertical" }} required rows={3} value={objective} onChange={(e) => setObjective(e.target.value)} placeholder="Describe the research objective..." />
                </div>
                <div>
                  <label style={labelStyle}>Description</label>
                  <textarea style={{ ...inputStyle, resize: "vertical" }} rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Additional description or notes..." />
                </div>
                <div>
                  <label style={labelStyle}>Station</label>
                  <div style={{ display: "flex", gap: 16 }}>
                    {(["Maitri", "Bharati"] as const).map((s) => (
                      <label key={s} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 13, color: "#0F172A" }}>
                        <input type="radio" name="station" checked={station === s} onChange={() => setStation(s)} />
                        {s}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Research Category</label>
                  <select style={inputStyle} value={category} onChange={(e) => setCategory(e.target.value)}>
                    {RESEARCH_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Equipment (comma-separated)</label>
                  <input style={inputStyle} value={equipment} onChange={(e) => setEquipment(e.target.value)} placeholder="e.g. LIDAR System, GPS Receiver, Spectrophotometer" />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <label style={labelStyle}>Expected Duration</label>
                    <input style={inputStyle} value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="e.g. 6 months" />
                  </div>
                  <div>
                    <label style={labelStyle}>Samples / Data to Collect</label>
                    <input style={inputStyle} value={samples} onChange={(e) => setSamples(e.target.value)} placeholder="e.g. 50 ice cores" />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Priority</label>
                  <select style={inputStyle} value={priority} onChange={(e) => setPriority(e.target.value)}>
                    {["Normal", "High", "Urgent"].map((p) => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Collaboration Station</label>
                  <div style={{ display: "flex", gap: 16 }}>
                    {(["None", "Maitri", "Bharati"] as const).map((s) => (
                      <label key={s} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 13, color: "#0F172A" }}>
                        <input type="radio" name="collab" checked={collaboration === s} onChange={() => setCollaboration(s)} />
                        {s === "None" ? "None" : `Share with ${s}`}
                      </label>
                    ))}
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8, paddingTop: 16, borderTop: "1px solid #F1F5F9" }}>
                  <button type="button" onClick={onClose} style={{ padding: "9px 18px", border: "1px solid #E2E8F0", borderRadius: 6, backgroundColor: "#FFF", color: "#0F172A", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>Cancel</button>
                  <button type="submit" style={{ padding: "10px 22px", backgroundColor: "#1677FF", color: "#FFF", border: "none", borderRadius: 6, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Create Experiment</button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResearcherExperiments() {
  const { experiments, addTransfer } = useApp();
  const [stationFilter, setStationFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showShare, setShowShare] = useState(false);
  const [detailExp, setDetailExp] = useState<ResearchExperiment | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const filtered = experiments.filter((e) => {
    const stationMatch = stationFilter === "All" || e.station === stationFilter;
    const statusMatch = statusFilter === "All" || e.status === statusFilter;
    return stationMatch && statusMatch;
  });

  function getCurrentUTC() {
    const now = new Date();
    return `${String(now.getUTCHours()).padStart(2, "0")}:${String(now.getUTCMinutes()).padStart(2, "0")} UTC`;
  }

  function handleShared(expName: string, dest: "Maitri" | "Bharati") {
    addTransfer({
      id: "TRF-" + Date.now(),
      from: "Maitri",
      to: dest,
      description: `${expName} — dataset shared`,
      size: "11.2 MB",
      time: getCurrentUTC(),
      type: "experiment",
    });
    setShowShare(false);
  }

  return (
    <div style={{ backgroundColor: "#F0F4F8", minHeight: "100vh", padding: "28px 32px", fontFamily: "system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#0F172A" }}>My Experiments</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748B" }}>Scientific research programmes you are part of</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => setShowCreate(true)}
            style={{ padding: "10px 20px", backgroundColor: "#FFFFFF", color: "#0F172A", border: "1px solid #E2E8F0", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
          >
            ＋ Add New Experiment
          </button>
          <button
            onClick={() => setShowShare(true)}
            style={{ padding: "10px 20px", backgroundColor: "#1677FF", color: "#FFF", border: "none", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
          >
            Share Experiment
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <select style={{ ...inputStyle, width: "auto", minWidth: 140 }} value={stationFilter} onChange={(e) => setStationFilter(e.target.value)}>
          {["All", "Maitri", "Bharati"].map((s) => <option key={s}>{s}</option>)}
        </select>
        <select style={{ ...inputStyle, width: "auto", minWidth: 160 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          {["All", "Active", "Data Collection", "Analysis", "Paused", "Completed"].map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Experiments grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {filtered.map((exp) => (
          <div key={exp.id} style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, backgroundColor: "#0B1F33", color: "#FFF", padding: "2px 7px", borderRadius: 3 }}>{exp.station.toUpperCase()}</span>
                  {statusBadge(exp.status)}
                </div>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#0F172A" }}>{exp.name}</h3>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: "#64748B" }}>{exp.id} · {exp.researcher}</p>
              </div>
            </div>

            <div style={{ fontSize: 12, color: "#475569", marginBottom: 10, lineHeight: 1.4 }}>
              {exp.objective.slice(0, 110)}{exp.objective.length > 110 ? "..." : ""}
            </div>

            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#64748B", marginBottom: 6 }}>Equipment</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {exp.equipment.slice(0, 3).map((eq) => (
                  <span key={eq} style={{ fontSize: 11, backgroundColor: "#EFF6FF", color: "#1D4ED8", padding: "2px 8px", borderRadius: 3 }}>{eq}</span>
                ))}
                {exp.equipment.length > 3 && <span style={{ fontSize: 11, color: "#94A3B8" }}>+{exp.equipment.length - 3} more</span>}
              </div>
            </div>

            <div style={{ display: "flex", gap: 16, marginBottom: 14, paddingTop: 10, borderTop: "1px solid #F1F5F9" }}>
              <div>
                <div style={{ fontSize: 10, color: "#94A3B8" }}>Samples</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#1677FF" }}>{exp.samplesCollected}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: "#94A3B8" }}>Last Update</div>
                <div style={{ fontSize: 12, fontWeight: 500, color: "#475569" }}>{exp.lastUpdate}</div>
              </div>
              {exp.sharedWith && (
                <div>
                  <div style={{ fontSize: 10, color: "#94A3B8" }}>Shared With</div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: "#16A34A" }}>{exp.sharedWith}</div>
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setDetailExp(exp)}
                style={{ flex: 1, padding: "8px 0", border: "1px solid #E2E8F0", borderRadius: 5, backgroundColor: "#FFF", color: "#0F172A", fontSize: 12, fontWeight: 500, cursor: "pointer" }}
              >
                View Details
              </button>
              <button
                onClick={() => setShowShare(true)}
                style={{ flex: 1, padding: "8px 0", border: "none", borderRadius: 5, backgroundColor: "#EFF6FF", color: "#1677FF", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
              >
                Share
              </button>
            </div>
          </div>
        ))}
      </div>

      {showShare && (
        <ShareModal
          experiments={experiments}
          onClose={() => setShowShare(false)}
          onShared={handleShared}
        />
      )}

      {detailExp && (
        <ExperimentDetailModal exp={detailExp} onClose={() => setDetailExp(null)} />
      )}

      {showCreate && (
        <CreateExperimentModal onClose={() => setShowCreate(false)} />
      )}
    </div>
  );
}
