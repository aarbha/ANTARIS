import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import type { AppShipment } from "../context/AppContext";
import { apiGetResupplyRecommendations, apiGetSustainability } from "../lib/api";

const card: React.CSSProperties = {
  backgroundColor: "#FFFFFF",
  border: "1px solid #E2E8F0",
  borderRadius: 6,
  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  padding: "20px 24px",
};

function statusBadge(status: AppShipment["status"]): React.CSSProperties {
  if (status === "in_transit") {
    return { backgroundColor: "#EAF4FF", color: "#1677FF", border: "1px solid #BAD7FF", borderRadius: 4, padding: "2px 8px", fontSize: 12, fontWeight: 600, display: "inline-block" };
  }
  if (status === "delivered") {
    return { backgroundColor: "#F0FDF4", color: "#16A34A", border: "1px solid #BBF7D0", borderRadius: 4, padding: "2px 8px", fontSize: 12, fontWeight: 600, display: "inline-block" };
  }
  return { backgroundColor: "#FFFBEB", color: "#F59E0B", border: "1px solid #FDE68A", borderRadius: 4, padding: "2px 8px", fontSize: 12, fontWeight: 600, display: "inline-block" };
}

function statusLabel(status: AppShipment["status"]): string {
  if (status === "in_transit") return "In Transit";
  if (status === "delivered") return "Delivered";
  return "Preparing";
}

function autoId(): string {
  return "SUP-" + Date.now();
}

interface NewForm {
  id: string;
  destination: string;
  cargo: string;
  vessel: string;
  origin: string;
  departure: string;
  eta: string;
  weight: string;
  quantity: string;
  priority: string;
}

function emptyForm(): NewForm {
  return { id: autoId(), destination: "", cargo: "", vessel: "", origin: "", departure: "", eta: "", weight: "", quantity: "", priority: "Normal" };
}

export default function Logistics() {
  const { shipments, updateShipment, addActivity, addShipment, maitri, bharati } = useApp();
  const [selectedShipment, setSelectedShipment] = useState<AppShipment | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newForm, setNewForm] = useState<NewForm>(emptyForm());
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);
  const [createdShipment, setCreatedShipment] = useState<AppShipment | null>(null);
  const [showCloseOnly, setShowCloseOnly] = useState(false);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [resupply, setResupply] = useState<any[]>([]);
  const [sustainability, setSustainability] = useState<any[]>([]);

  const activeCount = shipments.filter((s) => s.status !== "delivered").length;

  useEffect(() => {
    apiGetResupplyRecommendations().then(setResupply).catch(() => {});
    apiGetSustainability().then(setSustainability).catch(() => {});
  }, []);

  useEffect(() => {
    if (createSuccess && !showCloseOnly) {
      const timer = setTimeout(() => setShowCloseOnly(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [createSuccess, showCloseOnly]);

  function handleMarkDelivered(s: AppShipment) {
    const currentTime = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) + " UTC";
    updateShipment(s.id, { status: "delivered" });
    addActivity({ time: currentTime, action: "Shipment delivered", detail: s.id + " arrived at " + s.destination, user: "Operations" });
    setSelectedShipment({ ...s, status: "delivered" });
  }

  function handleOpenNew() {
    setNewForm(emptyForm());
    setCreateSuccess(null);
    setCreatedShipment(null);
    setShowCloseOnly(false);
    setShowNewModal(true);
  }

  function handleNewFormChange(field: keyof NewForm, value: string) {
    setNewForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleNewSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cargoWithQty = newForm.cargo + (newForm.quantity ? ` (${newForm.quantity})` : "");
    const newShipment: AppShipment = {
      id: newForm.id,
      destination: newForm.destination || "TBD",
      cargo: cargoWithQty || "—",
      vessel: newForm.vessel || "TBD",
      origin: newForm.origin || "TBD",
      departure: newForm.departure || "TBD",
      eta: newForm.eta || "TBD",
      weight: newForm.weight || "—",
      status: "preparing",
    };
    addShipment(newShipment);
    setCreatedShipment(newShipment);
    setCreateSuccess("Shipment " + newForm.id + " created successfully and added to the register.");
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    border: "1px solid #E2E8F0",
    borderRadius: 4,
    padding: "7px 10px",
    fontSize: 13,
    color: "#0F172A",
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: "#64748B", marginBottom: 4, display: "block" };

  return (
    <div style={{ padding: "28px 32px", fontFamily: "Inter, system-ui, sans-serif", backgroundColor: "#F8FAFC", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0F172A", margin: 0 }}>Logistics &amp; Fleet Management</h1>
          <p style={{ fontSize: 13, color: "#64748B", margin: "4px 0 0" }}>Track shipments, vessels, and supply chain operations</p>
        </div>
        <button
          onClick={handleOpenNew}
          style={{ backgroundColor: "#1677FF", color: "#FFFFFF", border: "none", borderRadius: 6, padding: "9px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
        >
          + New Shipment
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        <div style={card}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#64748B", marginBottom: 6 }}>Active Shipments</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#0F172A" }}>{activeCount}</div>
        </div>
        <div style={card}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#64748B", marginBottom: 6 }}>Next Arrival</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#0F172A" }}>12 Sep 2026</div>
        </div>
        <div style={card}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#64748B", marginBottom: 6 }}>Last Delivered</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#0F172A" }}>18 Aug 2026</div>
        </div>
        <div style={card}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#64748B", marginBottom: 6 }}>Cargo Capacity</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#0F172A" }}>78%</div>
        </div>
      </div>

      {/* Shipment Table */}
      <div style={card}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", marginBottom: 16 }}>Shipment Register</div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #E2E8F0" }}>
              {["ID", "Destination", "Cargo", "Vessel", "Departure", "ETA", "Status"].map((col) => (
                <th key={col} style={{ textAlign: "left", fontSize: 11, fontWeight: 700, color: "#94A3B8", padding: "0 0 10px", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shipments.map((s) => (
              <tr
                key={s.id}
                onClick={() => setSelectedShipment(s)}
                onMouseEnter={() => setHoveredRow(s.id)}
                onMouseLeave={() => setHoveredRow(null)}
                style={{
                  backgroundColor: hoveredRow === s.id ? "#F8FAFF" : "transparent",
                  cursor: "pointer",
                  borderBottom: "1px solid #F1F5F9",
                  fontSize: 13,
                }}
              >
                <td style={{ padding: "12px 0", color: "#1677FF", fontWeight: 600 }}>{s.id}</td>
                <td style={{ padding: "12px 0", color: "#0F172A" }}>{s.destination}</td>
                <td style={{ padding: "12px 0", color: "#64748B" }}>{s.cargo}</td>
                <td style={{ padding: "12px 0", color: "#0F172A" }}>{s.vessel}</td>
                <td style={{ padding: "12px 0", color: "#64748B" }}>{s.departure}</td>
                <td style={{ padding: "12px 0", color: "#64748B" }}>{s.eta}</td>
                <td style={{ padding: "12px 0" }}>
                  <span style={statusBadge(s.status)}>{statusLabel(s.status)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Resupply Recommendations */}
      <div style={{ ...card, marginTop: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", marginBottom: 4 }}>Resupply Recommendations</div>
        <div style={{ fontSize: 12, color: "#94A3B8", marginBottom: 16 }}>Items near or below reorder threshold — Nov–Mar shipping window</div>
        {resupply.length === 0 ? (
          <div style={{ padding: "24px 16px", backgroundColor: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 8, textAlign: "center", color: "#166534", fontSize: 13 }}>
            All stocks above reorder thresholds — no action required
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
            {resupply.map((item: any, i: number) => {
              const urgencyBg = item.urgency === "critical" ? "#FEF2F2" : item.urgency === "warning" ? "#FFFBEB" : "#FFFBEB"
              const urgencyBorder = item.urgency === "critical" ? "#FECACA" : item.urgency === "warning" ? "#FDE68A" : "#FDE68A"
              const urgencyText = item.urgency === "critical" ? "#DC2626" : item.urgency === "warning" ? "#D97706" : "#D97706"
              const urgencyLabel = item.urgency === "critical" ? "CRITICAL" : item.urgency === "warning" ? "WARNING" : "WATCH"
              return (
                <div key={i} style={{ padding: "14px 16px", backgroundColor: urgencyBg, border: `1px solid ${urgencyBorder}`, borderRadius: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: urgencyText }}>{item.item_name}</span>
                    <span style={{ fontSize: 10, color: urgencyText, fontWeight: 700, backgroundColor: "white", padding: "2px 8px", borderRadius: 4 }}>
                      {urgencyLabel}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: urgencyText, marginBottom: 4 }}>
                    Station: <strong style={{ textTransform: "capitalize" }}>{item.station_name || item.station_id}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: urgencyText }}>
                    <span>Current: {item.quantity} {item.unit}</span>
                    <span>Reorder: {item.reorder_threshold} {item.unit}</span>
                  </div>
                  <div style={{ marginTop: 6, fontSize: 12, color: "#B45309" }}>
                    Suggested order: <strong>{item.suggest_order} {item.unit}</strong>
                  </div>
                  {item.days_until_shortage != null && (
                    <div style={{ marginTop: 4, fontSize: 11, color: urgencyText }}>
                      ~{item.days_until_shortage} days until shortage
                    </div>
                  )}
                  <div style={{ marginTop: 4, fontSize: 11, color: "#D97706" }}>Window: {item.window}</div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Sustainability */}
      <div style={{ ...card, marginTop: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#0F172A" }}>Sustainability Overview</div>
          {sustainability.length === 0 && (
            <span style={{ fontSize: 11, color: "#F59E0B", fontWeight: 600, backgroundColor: "#FFFBEB", padding: "3px 10px", borderRadius: 4 }}>
              SIMULATED — API unavailable
            </span>
          )}
          {sustainability.length > 0 && (
            <span style={{ fontSize: 11, color: "#16A34A", fontWeight: 600, backgroundColor: "#F0FDF4", padding: "3px 10px", borderRadius: 4 }}>
              LIVE
            </span>
          )}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
          {(sustainability.length > 0 ? sustainability : [
            (() => {
              const totalGenKw = Math.round(maitri.powerGen * 1000)
              const renewableKw = Math.max(0, totalGenKw - 40)
              return {
                station_id: "maitri", station_name: "Maitri",
                solar_kw: Math.round(renewableKw * 0.7 * 100) / 100,
                wind_kw: Math.round(renewableKw * 0.3 * 100) / 100,
                renewable_share_pct: Math.round(renewableKw / Math.max(totalGenKw, 1) * 100 * 10) / 10,
                co2_per_hour_kg: Math.round(155 * 2.68 / 60 * 100) / 100,
                co2_saved_per_day_kg: Math.round(155 * 2.68 / 60 * 24 * (renewableKw / Math.max(totalGenKw, 1)) * 10) / 10,
              }
            })(),
            (() => {
              const totalGenKw = Math.round(bharati.powerGen * 1000)
              const renewableKw = Math.max(0, totalGenKw - 40)
              return {
                station_id: "bharati", station_name: "Bharati",
                solar_kw: Math.round(renewableKw * 0.65 * 100) / 100,
                wind_kw: Math.round(renewableKw * 0.35 * 100) / 100,
                renewable_share_pct: Math.round(renewableKw / Math.max(totalGenKw, 1) * 100 * 10) / 10,
                co2_per_hour_kg: Math.round(155 * 2.68 / 60 * 100) / 100,
                co2_saved_per_day_kg: Math.round(155 * 2.68 / 60 * 24 * (renewableKw / Math.max(totalGenKw, 1)) * 10) / 10,
              }
            })(),
          ]).map((s) => (
              <div key={s.station_id} style={{ padding: "16px", backgroundColor: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 8 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#166534", marginBottom: 12, textTransform: "capitalize" }}>
                  {s.station_name}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 12, color: "#15803D" }}>Renewable share</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#166534" }}>{s.renewable_share_pct}%</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 12, color: "#15803D" }}>Solar</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#166534" }}>{s.solar_kw} kW</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 12, color: "#15803D" }}>Wind</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#166534" }}>{s.wind_kw} kW</span>
                  </div>
                  <div style={{ borderTop: "1px solid #BBF7D0", paddingTop: 8, marginTop: 4 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 11, color: "#15803D" }}>CO₂/hour</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#166534" }}>{s.co2_per_hour_kg} kg</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 11, color: "#15803D" }}>CO₂ saved/day</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#16A34A" }}>{s.co2_saved_per_day_kg} kg</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      {/* Side Panel */}
      {selectedShipment !== null && (
        <div
          style={{ position: "fixed", top: 0, right: 0, bottom: 0, left: 0, backgroundColor: "rgba(0,0,0,0.35)", zIndex: 100, display: "flex", justifyContent: "flex-end" }}
          onClick={() => setSelectedShipment(null)}
        >
          <div
            style={{ width: 380, backgroundColor: "#FFFFFF", height: "100%", overflowY: "auto", boxShadow: "-4px 0 24px rgba(0,0,0,0.12)", padding: "28px 28px 40px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div style={{ fontSize: 17, fontWeight: 700, color: "#0F172A" }}>Shipment Details</div>
              <button onClick={() => setSelectedShipment(null)} style={{ background: "none", border: "none", fontSize: 20, color: "#94A3B8", cursor: "pointer", lineHeight: 1 }}>
                &#x2715;
              </button>
            </div>

            <div style={{ marginBottom: 8 }}>
              <span style={statusBadge(selectedShipment.status)}>{statusLabel(selectedShipment.status)}</span>
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#0F172A", marginBottom: 20 }}>{selectedShipment.id}</div>

            {(
              [
                ["Destination", selectedShipment.destination],
                ["Cargo", selectedShipment.cargo],
                ["Vessel", selectedShipment.vessel],
                ["Origin", selectedShipment.origin],
                ["Departure", selectedShipment.departure],
                ["ETA", selectedShipment.eta],
                ["Weight", selectedShipment.weight],
              ] as [string, string][]
            ).map(([label, val]) => (
              <div key={label} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 14, color: "#0F172A" }}>{val}</div>
              </div>
            ))}

            <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                onClick={() => {
                  const next: AppShipment["status"] = selectedShipment.status === "preparing" ? "in_transit" : selectedShipment.status === "in_transit" ? "delivered" : "preparing";
                  updateShipment(selectedShipment.id, { status: next });
                  setSelectedShipment({ ...selectedShipment, status: next });
                }}
                style={{ backgroundColor: "#1677FF", color: "#FFFFFF", border: "none", borderRadius: 6, padding: "10px 0", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
              >
                Update Status
              </button>
              {selectedShipment.status !== "delivered" && (
                <button
                  onClick={() => handleMarkDelivered(selectedShipment)}
                  style={{ backgroundColor: "#F0FDF4", color: "#16A34A", border: "1px solid #BBF7D0", borderRadius: 6, padding: "10px 0", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                >
                  Mark Delivered
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* New Shipment Modal */}
      {showNewModal && (
        <div
          style={{ position: "fixed", top: 0, right: 0, bottom: 0, left: 0, backgroundColor: "rgba(0,0,0,0.35)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={() => { setShowNewModal(false); setCreateSuccess(null); setCreatedShipment(null); setShowCloseOnly(false); }}
        >
          <div
            style={{ backgroundColor: "#FFFFFF", borderRadius: 8, width: 520, maxHeight: "90vh", overflowY: "auto", padding: 32, boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div style={{ fontSize: 17, fontWeight: 700, color: "#0F172A" }}>New Shipment</div>
              <button onClick={() => { setShowNewModal(false); setCreateSuccess(null); setCreatedShipment(null); setShowCloseOnly(false); }} style={{ background: "none", border: "none", fontSize: 20, color: "#94A3B8", cursor: "pointer" }}>
                &#x2715;
              </button>
            </div>

            {createSuccess ? (
              <div>
                <div style={{ backgroundColor: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 6, padding: "16px 20px", color: "#16A34A", fontWeight: 600, fontSize: 14, textAlign: "center", marginBottom: 16 }}>
                  {createSuccess}
                </div>
                <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                  {!showCloseOnly && createdShipment && (
                    <button
                      onClick={() => { setShowNewModal(false); setCreateSuccess(null); setShowCloseOnly(false); setSelectedShipment(createdShipment); setCreatedShipment(null); }}
                      style={{ padding: "9px 18px", backgroundColor: "#1677FF", color: "#FFF", border: "none", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                    >
                      View Shipment
                    </button>
                  )}
                  <button
                    onClick={() => { setShowNewModal(false); setCreateSuccess(null); setCreatedShipment(null); setShowCloseOnly(false); }}
                    style={{ padding: "9px 18px", border: "1px solid #E2E8F0", borderRadius: 6, backgroundColor: "#FFF", color: "#0F172A", fontSize: 13, fontWeight: 500, cursor: "pointer" }}
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleNewSubmit}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 16px" }}>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={labelStyle}>Shipment ID</label>
                    <input style={{ ...inputStyle, backgroundColor: "#F8FAFC", color: "#94A3B8" }} value={newForm.id} readOnly />
                  </div>
                  {(
                    [
                      ["destination", "Destination"],
                      ["cargo", "Cargo Description"],
                      ["vessel", "Vessel Name"],
                      ["origin", "Origin Port"],
                      ["departure", "Departure Date"],
                      ["eta", "ETA"],
                      ["weight", "Weight (tonnes)"],
                    ] as [keyof NewForm, string][]
                  ).map(([field, label]) => (
                    <div key={field}>
                      <label style={labelStyle}>{label}</label>
                      <input
                        style={inputStyle}
                        value={newForm[field]}
                        onChange={(e) => handleNewFormChange(field, e.target.value)}
                        placeholder={label}
                      />
                    </div>
                  ))}
                  <div>
                    <label style={labelStyle}>Quantity / Units</label>
                    <input
                      style={inputStyle}
                      value={newForm.quantity}
                      onChange={(e) => handleNewFormChange("quantity", e.target.value)}
                      placeholder="e.g. 120 drums"
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Priority</label>
                    <select style={inputStyle} value={newForm.priority} onChange={(e) => handleNewFormChange("priority", e.target.value)}>
                      {["Normal", "High", "Urgent"].map((p) => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  style={{ marginTop: 24, width: "100%", backgroundColor: "#1677FF", color: "#FFFFFF", border: "none", borderRadius: 6, padding: "11px 0", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
                >
                  Create Shipment
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
