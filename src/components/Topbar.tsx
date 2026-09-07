import { useState, useEffect, useRef } from "react";
import type { Page } from "../types";
import { useApp } from "../context/AppContext";

interface TopbarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

function getPageTitle(page: Page): string {
  switch (page) {
    case "dashboard":
      return "Dashboard";
    case "stations":
      return "Station Management";
    case "energy":
      return "Energy Management";
    case "fuel":
      return "Fuel Management";
    case "logistics":
      return "Logistics & Fleet";
    case "weather":
      return "Weather Intelligence";
    case "alerts":
      return "Alerts & Notifications";
    case "reports":
      return "Reports & Records";
    case "researcher":
    case "researcher_log":
      return "Researcher Daily Log";
    case "researcher_dashboard":
      return "Research Operations";
    case "researcher_reports":
      return "Reports";
    default:
      return "Dashboard";
  }
}

const BellSvg = () => (
  <svg
    width="17"
    height="17"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

export default function Topbar({ currentPage, onNavigate }: TopbarProps) {
  const { role, alerts, maitri, bharati, logout } = useApp();

  const [showConnStatus, setShowConnStatus] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowProfileMenu(false);
        setShowConnStatus(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const activeAlertCount = alerts.filter(
    (a) => a.status === "active" || a.status === "acknowledged"
  ).length;

  const initials = role === "admin" ? "AD" : "RS";
  const title = getPageTitle(currentPage);

  return (
    <div
      style={{
        height: "52px",
        backgroundColor: "#FFFFFF",
        borderBottom: "1px solid #E2E8F0",
        display: "flex",
        alignItems: "center",
        padding: "0 24px",
        justifyContent: "space-between",
        flexShrink: 0,
        position: "relative",
      }}
    >
      {/* Left: page title */}
      <div>
        <div
          style={{
            fontSize: "15px",
            fontWeight: 600,
            color: "#0F172A",
            lineHeight: 1.2,
          }}
        >
          {title}
        </div>
        <div style={{ fontSize: "11px", color: "#94A3B8", marginTop: "1px" }}>
          NCPOR &middot; Antarctic Operations Portal
        </div>
      </div>

      {/* Right: controls */}
      <div
        ref={dropdownRef}
        style={{ display: "flex", alignItems: "center", gap: "16px", position: "relative" }}
      >
        {/* Connection status button */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => {
              setShowConnStatus((v) => !v);
              setShowProfileMenu(false);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "5px 10px",
              border: "1px solid #E2E8F0",
              borderRadius: "5px",
              backgroundColor: "transparent",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: 500,
              color: "#64748B",
              fontFamily: "inherit",
            }}
          >
            <div
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                backgroundColor: "#22C55E",
                flexShrink: 0,
              }}
            />
            Connected
          </button>

          {showConnStatus && (
            <div
              style={{
                position: "absolute",
                top: "36px",
                right: 0,
                backgroundColor: "#FFFFFF",
                border: "1px solid #E2E8F0",
                borderRadius: "6px",
                boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                minWidth: "240px",
                zIndex: 100,
                padding: "8px 0",
              }}
            >
              <div
                style={{
                  padding: "6px 14px",
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#94A3B8",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Station Sync Status
              </div>
              <div
                style={{
                  padding: "7px 14px",
                  fontSize: "13px",
                  color: "#0F172A",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <div
                  style={{
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    backgroundColor: "#22C55E",
                    flexShrink: 0,
                  }}
                />
                <span>
                  <strong>Maitri:</strong> Connected &mdash;{" "}
                  {maitri?.lastSync ?? "N/A"}
                </span>
              </div>
              <div
                style={{
                  padding: "7px 14px",
                  fontSize: "13px",
                  color: "#0F172A",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <div
                  style={{
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    backgroundColor: "#22C55E",
                    flexShrink: 0,
                  }}
                />
                <span>
                  <strong>Bharati:</strong> Connected &mdash;{" "}
                  {bharati?.lastSync ?? "N/A"}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Bell icon with alert badge */}
        <div style={{ position: "relative" }}>
          <button
            style={{
              width: "34px",
              height: "34px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid #E2E8F0",
              borderRadius: "6px",
              backgroundColor: "transparent",
              cursor: "pointer",
              color: "#64748B",
              position: "relative",
            }}
            onClick={() => onNavigate("alerts")}
          >
            <BellSvg />
            {activeAlertCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "-4px",
                  right: "-4px",
                  backgroundColor: "#EF4444",
                  color: "#FFFFFF",
                  borderRadius: "50%",
                  minWidth: "16px",
                  height: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "9px",
                  fontWeight: 700,
                  padding: "0 3px",
                  border: "1.5px solid #FFFFFF",
                }}
              >
                {activeAlertCount}
              </span>
            )}
          </button>
        </div>

        {/* Profile avatar */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => {
              setShowProfileMenu((v) => !v);
              setShowConnStatus(false);
            }}
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "50%",
              backgroundColor: role === "admin" ? "#1677FF" : "#7C3AED",
              color: "#FFFFFF",
              fontSize: "12px",
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "inherit",
            }}
          >
            {initials}
          </button>

          {showProfileMenu && (
            <div
              style={{
                position: "absolute",
                top: "44px",
                right: 0,
                backgroundColor: "#FFFFFF",
                border: "1px solid #E2E8F0",
                borderRadius: "6px",
                boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                minWidth: "200px",
                zIndex: 100,
                padding: "6px 0",
              }}
            >
              {["My Profile", "Preferences", "System Status"].map((item) => (
                <div
                  key={item}
                  style={{
                    padding: "9px 16px",
                    fontSize: "13px",
                    color: "#0F172A",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.backgroundColor =
                      "#F8FAFC";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.backgroundColor =
                      "transparent";
                  }}
                >
                  {item}
                </div>
              ))}
              <div
                style={{
                  borderTop: "1px solid #E2E8F0",
                  margin: "4px 0",
                }}
              />
              <div
                style={{
                  padding: "9px 16px",
                  fontSize: "13px",
                  color: "#EF4444",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.backgroundColor =
                    "#FFF5F5";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.backgroundColor =
                    "transparent";
                }}
                onClick={() => {
                  logout();
                  onNavigate("login");
                }}
              >
                Sign Out
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
