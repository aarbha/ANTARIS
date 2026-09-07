import { useState } from "react";
import { useApp } from "../context/AppContext";
import type { ResearchExperiment, StationState } from "../context/AppContext";

const card: React.CSSProperties = {
  backgroundColor: "#FFFFFF",
  border: "1px solid #E2E8F0",
  borderRadius: 6,
  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  padding: "20px 24px",
};

type ExpTab = "overview" | "observations" | "data" | "team" | "activity";

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

function ExpModal({
  exp,
  stationData,
  onClose,
}: {
  exp: ResearchExperiment;
  stationData: StationState;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<ExpTab>("overview");

  const tabs: { key: ExpTab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "observations", label: "Observations" },
    { key: "data", label: "Data" },
    { key: "team", label: "Team" },
    { key: "activity", label: "Activity" },
  ];

  const activityLog = [
    { day: "02 Sep", entry: "Experiment initialised. Equipment deployed and calibrated." },
    { day: "03 Sep", entry: "First samples collected. Initial readings nominal." },
    { day: "04 Sep", entry: "Continued data collection. Minor sensor adjustment required." },
    { day: "05 Sep", entry: "Full day of collection. Data uploaded to server." },
    { day: "06 Sep", entry: exp.researchNotes },
  ];

  const barHeights = [30, 45, 28, 52, 38, 60, exp.samplesCollected > 10 ? 70 : 45];

  return (
    <div
      style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100 }}
      onClick={onClose}
    >
      <div
        style={{ backgroundColor: "#FFF", borderRadius: 8, width: 720, maxHeight: "88vh", overflowY: "auto", display: "flex", flexDirection: "column" }}
        onClick={(e) => e.stopPropagation()}
      >
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
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
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
  );
}

export default function Experiments() {
  const { experiments, maitri, bharati } = useApp();
  const [selectedExp, setSelectedExp] = useState<ResearchExperiment | null>(null);

  const totalSamples = experiments.reduce((sum, e) => sum + e.samplesCollected, 0);
  const maitriExps = experiments.filter((e) => e.station === "Maitri");
  const bharatiExps = experiments.filter((e) => e.station === "Bharati");

  const stats = [
    { label: "Active Experiments", value: experiments.filter((e) => e.status === "Active" || e.status === "Data Collection").length.toString() },
    { label: "Maitri", value: maitriExps.length.toString() },
    { label: "Bharati", value: bharatiExps.length.toString() },
    { label: "Samples Collected", value: totalSamples.toString() },
  ];

  return (
    <div style={{ backgroundColor: "#F0F4F8", minHeight: "100vh", padding: "28px 32px", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#0F172A" }}>Research Experiments</h1>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748B" }}>Active scientific programmes across Maitri and Bharati stations</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {stats.map((s) => (
          <div key={s.label} style={card}>
            <div style={{ fontSize: 11, color: "#94A3B8", marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#0F172A" }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Experiments grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {(["Maitri", "Bharati"] as const).map((station) => {
          const stationExps = experiments.filter((e) => e.station === station);
          return (
            <div key={station} style={card}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 11, fontWeight: 700, backgroundColor: "#0B1F33", color: "#FFF", padding: "3px 10px", borderRadius: 3 }}>{station.toUpperCase()}</span>
                <span style={{ fontSize: 12, color: "#94A3B8" }}>{stationExps.length} experiment{stationExps.length !== 1 ? "s" : ""}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {stationExps.map((exp) => (
                  <div
                    key={exp.id}
                    style={{ border: "1px solid #E2E8F0", borderRadius: 6, padding: "14px 16px", cursor: "pointer", transition: "border-color 0.15s" }}
                    onClick={() => setSelectedExp(exp)}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "#1677FF"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "#E2E8F0"; }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#0F172A", marginBottom: 2 }}>{exp.name}</div>
                        <div style={{ fontSize: 12, color: "#64748B" }}>{exp.researcher}</div>
                      </div>
                      {statusBadge(exp.status)}
                    </div>
                    <div style={{ display: "flex", gap: 16, marginBottom: 8 }}>
                      <div>
                        <div style={{ fontSize: 10, color: "#94A3B8" }}>Started</div>
                        <div style={{ fontSize: 12, fontWeight: 500, color: "#475569" }}>{exp.startDate}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: "#94A3B8" }}>Last Update</div>
                        <div style={{ fontSize: 12, fontWeight: 500, color: "#475569" }}>{exp.lastUpdate}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: "#94A3B8" }}>Equipment</div>
                        <div style={{ fontSize: 12, fontWeight: 500, color: "#475569" }}>{exp.equipment.length} items</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: "#94A3B8" }}>Samples</div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#1677FF" }}>{exp.samplesCollected}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {selectedExp && (
        <ExpModal
          exp={selectedExp}
          stationData={selectedExp.station === "Maitri" ? maitri : bharati}
          onClose={() => setSelectedExp(null)}
        />
      )}
    </div>
  );
}
