import type { Page } from "../types";
import { useApp } from "../context/AppContext";

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

interface NavItem {
  label: string;
  page: Page;
}

interface NavGroup {
  groupLabel?: string;
  items: NavItem[];
}

export default function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const { role, alerts, logout, researcherStation } = useApp();

  const activeAlertCount = alerts.filter(
    (a) => a.status === "active" || a.status === "acknowledged"
  ).length;

  const adminGroups: NavGroup[] = [
    {
      items: [
        { label: "Dashboard", page: "dashboard" },
        { label: "Stations", page: "stations" },
        { label: "Alerts", page: "alerts" },
      ],
    },
    {
      groupLabel: "OPERATIONS",
      items: [
        { label: "Energy", page: "energy" },
        { label: "Fuel", page: "fuel" },
        { label: "Logistics", page: "logistics" },
        { label: "Weather", page: "weather" },
      ],
    },
    {
      groupLabel: "INTELLIGENCE",
      items: [
        { label: "Predictions", page: "predictions" },
        { label: "Simulation", page: "simulation" },
      ],
    },
    {
      groupLabel: "RESEARCH",
      items: [
        { label: "Experiments", page: "experiments" },
      ],
    },
    {
      groupLabel: "REPORTING",
      items: [
        { label: "Reports", page: "reports" },
      ],
    },
  ];

  const researcherGroups: NavGroup[] = [
    {
      items: [
        { label: "Dashboard", page: "researcher_dashboard" },
        { label: "Daily Log", page: "researcher_log" },
        { label: "Experiments", page: "researcher_experiments" },
        { label: "Station Link", page: "researcher_connectivity" },
        { label: "Weather", page: "weather" },
        { label: "Reports", page: "researcher_reports" },
      ],
    },
  ];

  const groups = role === "admin" ? adminGroups : researcherGroups;
  const emailAbbrev =
    role === "admin" ? "admin@ncpor.res.in" : "researcher@ncpor.res.in";

  function getNavItemStyle(isActive: boolean): React.CSSProperties {
    return {
      padding: "9px 16px",
      fontSize: "13px",
      fontWeight: 500,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      borderLeft: isActive ? "2px solid #1677FF" : "2px solid transparent",
      backgroundColor: isActive ? "rgba(22,119,255,0.15)" : "transparent",
      color: isActive ? "#FFFFFF" : "rgba(255,255,255,0.55)",
      transition: "color 0.15s, background-color 0.15s",
      userSelect: "none",
    };
  }

  return (
    <div
      style={{
        width: "220px",
        height: "100%",
        backgroundColor: "#0B1F33",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
      }}
    >
      {/* Logo area */}
      <div style={{ padding: "20px 16px" }}>
        <div
          style={{
            color: "#FFFFFF",
            fontWeight: 700,
            fontSize: "13px",
            letterSpacing: "0.1em",
          }}
        >
          ANTARIS
        </div>
        <div
          style={{
            color: "rgba(255,255,255,0.4)",
            fontSize: "11px",
            marginTop: "3px",
          }}
        >
          NCPOR Operations
        </div>
      </div>

      {/* Divider */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }} />

      {/* Navigation */}
      <div style={{ flex: 1, overflowY: "auto", paddingTop: "8px" }}>
        {groups.map((group, gi) => (
          <div key={gi}>
            {group.groupLabel && (
              <div
                style={{
                  padding: "16px 16px 6px",
                  fontSize: "10px",
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.3)",
                  letterSpacing: "0.1em",
                }}
              >
                {group.groupLabel}
              </div>
            )}
            {group.items.map((item) => {
              const isActive = currentPage === item.page;
              return (
                <div
                  key={item.page}
                  style={getNavItemStyle(isActive)}
                  onClick={() => onNavigate(item.page)}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLDivElement).style.color =
                        "rgba(255,255,255,0.85)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLDivElement).style.color =
                        "rgba(255,255,255,0.55)";
                    }
                  }}
                >
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.page === "alerts" && activeAlertCount > 0 && (
                    <span
                      style={{
                        backgroundColor: "#EF4444",
                        color: "#FFFFFF",
                        borderRadius: "50%",
                        minWidth: "18px",
                        height: "18px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "10px",
                        fontWeight: 700,
                        padding: "0 4px",
                      }}
                    >
                      {activeAlertCount}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Bottom section */}
      <div
        style={{
          padding: "12px 16px",
          borderTop: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {/* System status */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            marginBottom: "10px",
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
          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "11px" }}>
            System Operational
          </span>
        </div>

        {/* User info */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "6px",
          }}
        >
          <span
            style={{
              backgroundColor: role === "admin" ? "#1677FF" : "#7C3AED",
              color: "#FFFFFF",
              fontSize: "10px",
              fontWeight: 600,
              padding: "2px 6px",
              borderRadius: "3px",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              flexShrink: 0,
            }}
          >
            {role}
          </span>
          <span
            style={{
              color: "rgba(255,255,255,0.4)",
              fontSize: "11px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {emailAbbrev}
          </span>
        </div>

        {/* Station badge for researcher */}
        {role === "researcher" && researcherStation && (
          <div style={{ marginBottom: "10px" }}>
            <span
              style={{
                display: "inline-block",
                fontSize: "10px",
                fontWeight: 700,
                color: "rgba(255,255,255,0.6)",
                backgroundColor: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 3,
                padding: "2px 8px",
                letterSpacing: "0.06em",
              }}
            >
              STATION: {researcherStation.toUpperCase()}
            </span>
          </div>
        )}

        {/* Sign Out */}
        <div
          style={{
            padding: "7px 12px",
            fontSize: "12px",
            fontWeight: 500,
            color: "rgba(255,255,255,0.55)",
            cursor: "pointer",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "4px",
            textAlign: "center",
            transition: "color 0.15s, background-color 0.15s",
          }}
          onClick={() => {
            logout();
            onNavigate("login");
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLDivElement).style.color =
              "rgba(255,255,255,0.85)";
            (e.currentTarget as HTMLDivElement).style.backgroundColor =
              "rgba(255,255,255,0.06)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLDivElement).style.color =
              "rgba(255,255,255,0.55)";
            (e.currentTarget as HTMLDivElement).style.backgroundColor =
              "transparent";
          }}
        >
          Sign Out
        </div>
      </div>
    </div>
  );
}
