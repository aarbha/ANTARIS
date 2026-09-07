import { useState } from "react";
import { useApp } from "../context/AppContext";
import type { AppReport } from "../context/AppContext";

const card: React.CSSProperties = {
  backgroundColor: "#FFFFFF",
  border: "1px solid #E2E8F0",
  borderRadius: 6,
  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  padding: "20px 24px",
};

const inputStyle: React.CSSProperties = {
  border: "1px solid #E2E8F0",
  borderRadius: 4,
  padding: "7px 12px",
  fontSize: 13,
  color: "#0F172A",
  background: "#fff",
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  cursor: "pointer",
};

function StatusBadge({ status }: { status: AppReport["status"] }) {
  const color = status === "submitted" ? "#16A34A" : "#F59E0B";
  const bg = status === "submitted" ? "#DCFCE7" : "#FEF3C7";
  return (
    <span style={{ backgroundColor: bg, color, borderRadius: 4, padding: "2px 10px", fontSize: 11, fontWeight: 700, textTransform: "capitalize" }}>
      {status}
    </span>
  );
}

interface ReportModalProps {
  report: AppReport;
  onClose: () => void;
}

function ReportModal({ report, onClose }: ReportModalProps) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ ...card, width: 520, maxHeight: "80vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 16, color: "#0F172A" }}>Report Detail</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#94A3B8" }}>&#x2715;</button>
        </div>

        {/* Core fields */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px", marginBottom: 20 }}>
          {[
            { label: "Report ID", value: report.id },
            { label: "Type", value: report.type },
            { label: "Station", value: report.station },
            { label: "Submitted By", value: report.submittedBy },
            { label: "Date", value: report.date },
            { label: "Time", value: report.time },
          ].map(f => (
            <div key={f.label}>
              <div style={{ fontSize: 11, color: "#94A3B8", textTransform: "uppercase", fontWeight: 700, marginBottom: 2 }}>{f.label}</div>
              <div style={{ fontSize: 13, color: "#0F172A", fontWeight: 500 }}>{f.value}</div>
            </div>
          ))}
          <div>
            <div style={{ fontSize: 11, color: "#94A3B8", textTransform: "uppercase", fontWeight: 700, marginBottom: 2 }}>Status</div>
            <StatusBadge status={report.status} />
          </div>
        </div>

        {/* Data fields */}
        {Object.keys(report.data).length > 0 && (
          <div>
            <div style={{ fontSize: 12, color: "#64748B", fontWeight: 700, marginBottom: 10, borderTop: "1px solid #F1F5F9", paddingTop: 14 }}>Report Data</div>
            {Object.entries(report.data).map(([key, value]) => (
              <div key={key} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #F1F5F9" }}>
                <span style={{ color: "#64748B", fontSize: 13, textTransform: "capitalize" }}>{key.replace(/_/g, " ")}</span>
                <span style={{ color: "#0F172A", fontSize: 13, fontWeight: 500 }}>{String(value)}</span>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "7px 20px", borderRadius: 4, border: "none", background: "#1677FF", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default function Reports() {
  const { reports } = useApp();

  const [filterStation, setFilterStation] = useState("All");
  const [filterDate, setFilterDate] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedReport, setSelectedReport] = useState<AppReport | null>(null);

  const filteredReports = reports.filter(r => {
    if (filterStation !== "All" && r.station.toLowerCase() !== filterStation.toLowerCase()) return false;
    if (filterDate && !r.date.includes(filterDate)) return false;
    if (filterType && !r.type.toLowerCase().includes(filterType.toLowerCase())) return false;
    if (filterStatus !== "All" && r.status !== filterStatus) return false;
    return true;
  });

  return (
    <div style={{ padding: "24px 28px", background: "#F0F4F8", minHeight: "100vh" }}>
      <h1 style={{ margin: "0 0 20px", fontSize: 22, fontWeight: 700, color: "#0F172A" }}>Reports &amp; Station Records</h1>

      {/* Filter bar */}
      <div style={{ ...card, display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 20, padding: "16px 20px" }}>
        <div>
          <label style={{ fontSize: 12, color: "#64748B", display: "block", marginBottom: 4 }}>Station</label>
          <select style={selectStyle} value={filterStation} onChange={e => setFilterStation(e.target.value)}>
            {["All", "Maitri", "Bharati"].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 12, color: "#64748B", display: "block", marginBottom: 4 }}>Date</label>
          <input
            type="text"
            placeholder="e.g. 2025-01"
            style={inputStyle}
            value={filterDate}
            onChange={e => setFilterDate(e.target.value)}
          />
        </div>
        <div>
          <label style={{ fontSize: 12, color: "#64748B", display: "block", marginBottom: 4 }}>Report Type</label>
          <input
            type="text"
            placeholder="e.g. Weather"
            style={inputStyle}
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
          />
        </div>
        <div>
          <label style={{ fontSize: 12, color: "#64748B", display: "block", marginBottom: 4 }}>Status</label>
          <select style={selectStyle} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            {["All", "submitted", "draft"].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div style={{ ...card, padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F8FAFC" }}>
                {["ID", "Type", "Station", "Submitted By", "Date / Time", "Status"].map(col => (
                  <th key={col} style={{ textAlign: "left", padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase", borderBottom: "1px solid #E2E8F0" }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredReports.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: 32, color: "#94A3B8", fontSize: 14 }}>No reports match the current filters.</td>
                </tr>
              )}
              {filteredReports.map((report, idx) => (
                <tr
                  key={report.id}
                  onClick={() => setSelectedReport(report)}
                  style={{
                    cursor: "pointer",
                    background: idx % 2 === 0 ? "#fff" : "#FAFAFA",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#EFF6FF")}
                  onMouseLeave={e => (e.currentTarget.style.background = idx % 2 === 0 ? "#fff" : "#FAFAFA")}
                >
                  <td style={{ padding: "12px 16px", fontSize: 13, color: "#2563EB", fontWeight: 600, borderBottom: "1px solid #F1F5F9" }}>{report.id}</td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: "#0F172A", borderBottom: "1px solid #F1F5F9" }}>{report.type}</td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: "#0F172A", borderBottom: "1px solid #F1F5F9" }}>{report.station}</td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: "#64748B", borderBottom: "1px solid #F1F5F9" }}>{report.submittedBy}</td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: "#64748B", borderBottom: "1px solid #F1F5F9" }}>{report.date} {report.time}</td>
                  <td style={{ padding: "12px 16px", borderBottom: "1px solid #F1F5F9" }}><StatusBadge status={report.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding: "10px 16px", fontSize: 12, color: "#94A3B8", borderTop: "1px solid #F1F5F9" }}>
          Showing {filteredReports.length} of {reports.length} reports
        </div>
      </div>

      {selectedReport && (
        <ReportModal report={selectedReport} onClose={() => setSelectedReport(null)} />
      )}
    </div>
  );
}
