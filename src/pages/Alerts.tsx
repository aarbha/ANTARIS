import { useState } from "react";
import { useApp } from "../context/AppContext";
import type { AppAlert } from "../context/AppContext";

const card: React.CSSProperties = {
  backgroundColor: "#FFFFFF",
  border: "1px solid #E2E8F0",
  borderRadius: 6,
  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  padding: "20px 24px",
};

function severityStyle(severity: AppAlert["severity"]): React.CSSProperties {
  if (severity === "critical") return { background: "#FEE2E2", color: "#DC2626" };
  if (severity === "warning") return { background: "#FEF3C7", color: "#F59E0B" };
  if (severity === "advisory") return { background: "#DBEAFE", color: "#2563EB" };
  return { background: "#F1F5F9", color: "#64748B" };
}

function statusStyle(status: AppAlert["status"]): React.CSSProperties {
  if (status === "active") return { background: "#FEE2E2", color: "#DC2626" };
  if (status === "acknowledged") return { background: "#FEF3C7", color: "#F59E0B" };
  return { background: "#DCFCE7", color: "#16A34A" };
}

function Badge({ label, style }: { label: string; style: React.CSSProperties }) {
  return (
    <span style={{ borderRadius: 4, padding: "2px 10px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", ...style }}>
      {label}
    </span>
  );
}

function SummaryCard({ label, count, color, bg }: { label: string; count: number; color: string; bg: string }) {
  return (
    <div style={{ ...card, textAlign: "center", flex: 1 }}>
      <div style={{ fontSize: 28, fontWeight: 700, color }}>{count}</div>
      <div style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>{label}</div>
    </div>
  );
}

const selectStyle: React.CSSProperties = {
  border: "1px solid #E2E8F0",
  borderRadius: 4,
  padding: "7px 12px",
  fontSize: 13,
  color: "#0F172A",
  background: "#fff",
  cursor: "pointer",
};

export default function Alerts() {
  const { alerts, updateAlert, addActivity } = useApp();

  const [filterStation, setFilterStation] = useState("All");
  const [filterSeverity, setFilterSeverity] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredAlerts = alerts.filter(a => {
    if (filterStation !== "All" && a.station.toLowerCase() !== filterStation.toLowerCase()) return false;
    if (filterSeverity !== "All" && a.severity !== filterSeverity) return false;
    if (filterStatus !== "All" && a.status !== filterStatus) return false;
    return true;
  });

  function handleAcknowledge(alert: AppAlert) {
    updateAlert(alert.id, { status: "acknowledged" });
    addActivity({ time: new Date().toISOString(), action: "Alert acknowledged", detail: alert.title, user: "Admin" });
  }

  function handleResolve(alert: AppAlert) {
    updateAlert(alert.id, { status: "resolved" });
    addActivity({ time: new Date().toISOString(), action: "Alert resolved", detail: alert.title, user: "Admin" });
  }

  return (
    <div style={{ padding: "24px 28px", background: "#F0F4F8", minHeight: "100vh" }}>
      <h1 style={{ margin: "0 0 20px", fontSize: 22, fontWeight: 700, color: "#0F172A" }}>Alerts &amp; Notifications</h1>

      {/* Summary counts */}
      <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
        <SummaryCard label="Critical" count={alerts.filter(a => a.severity === "critical").length} color="#DC2626" bg="#FEE2E2" />
        <SummaryCard label="Warning" count={alerts.filter(a => a.severity === "warning").length} color="#F59E0B" bg="#FEF3C7" />
        <SummaryCard label="Advisory" count={alerts.filter(a => a.severity === "advisory").length} color="#2563EB" bg="#DBEAFE" />
        <SummaryCard label="Info" count={alerts.filter(a => a.severity === "info").length} color="#64748B" bg="#F1F5F9" />
      </div>

      {/* Filter bar */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <div>
          <label style={{ fontSize: 12, color: "#64748B", display: "block", marginBottom: 4 }}>Station</label>
          <select style={selectStyle} value={filterStation} onChange={e => setFilterStation(e.target.value)}>
            {["All", "Maitri", "Bharati"].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 12, color: "#64748B", display: "block", marginBottom: 4 }}>Severity</label>
          <select style={selectStyle} value={filterSeverity} onChange={e => setFilterSeverity(e.target.value)}>
            {["All", "critical", "warning", "advisory", "info"].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 12, color: "#64748B", display: "block", marginBottom: 4 }}>Status</label>
          <select style={selectStyle} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            {["All", "active", "acknowledged", "resolved"].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Alert list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filteredAlerts.length === 0 && (
          <div style={{ ...card, color: "#94A3B8", textAlign: "center", fontSize: 14 }}>No alerts match the current filters.</div>
        )}
        {filteredAlerts.map(alert => {
          const expanded = expandedId === alert.id;
          const resolved = alert.status === "resolved";
          return (
            <div
              key={alert.id}
              style={{ ...card, cursor: "pointer" }}
              onClick={() => setExpandedId(expanded ? null : alert.id)}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <Badge label={alert.severity} style={severityStyle(alert.severity)} />
                  <span style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#0F172A",
                    opacity: resolved ? 0.5 : 1,
                    textDecoration: resolved ? "line-through" : "none",
                  }}>
                    {alert.title}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  <Badge label={alert.status} style={statusStyle(alert.status)} />
                </div>
              </div>
              <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 6 }}>
                {alert.station} &middot; {alert.time}
              </div>

              {expanded && (
                <div style={{ marginTop: 16, borderTop: "1px solid #F1F5F9", paddingTop: 16 }} onClick={e => e.stopPropagation()}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
                    <div>
                      <div style={{ fontSize: 11, color: "#94A3B8", textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>Cause</div>
                      <div style={{ fontSize: 13, color: "#0F172A" }}>{alert.cause}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: "#94A3B8", textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>Condition</div>
                      <div style={{ fontSize: 13, color: "#0F172A" }}>{alert.condition}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: "#94A3B8", textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>Action</div>
                      <div style={{ fontSize: 13, color: "#0F172A" }}>{alert.action}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {alert.status === "active" && (
                      <button
                        onClick={() => handleAcknowledge(alert)}
                        style={{ padding: "6px 14px", borderRadius: 4, border: "none", background: "#F59E0B", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600 }}
                      >
                        Acknowledge
                      </button>
                    )}
                    {(alert.status === "active" || alert.status === "acknowledged") && (
                      <button
                        onClick={() => handleResolve(alert)}
                        style={{ padding: "6px 14px", borderRadius: 4, border: "none", background: "#16A34A", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600 }}
                      >
                        Resolve
                      </button>
                    )}
                    <button
                      onClick={() => setExpandedId(null)}
                      style={{ padding: "6px 14px", borderRadius: 4, border: "1px solid #E2E8F0", background: "#fff", color: "#64748B", cursor: "pointer", fontSize: 13 }}
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
