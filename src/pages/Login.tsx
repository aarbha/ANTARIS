import { useState } from "react";
import { useApp } from "../context/AppContext";
import type { Page } from "../types";
import loginBg from "../imports/515295831_24356911183934579_7648818621262825963_n.jpg";

interface LoginProps {
  onLogin: (role: "admin" | "researcher", page: Page) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const { login } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loadingState, setLoadingState] = useState<"idle" | "auth" | "connect">("idle");

  function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoadingState("auth");
    setTimeout(() => {
      setLoadingState("connect");
      setTimeout(() => {
        let role: "admin" | "researcher" = "admin";
        let station: "Maitri" | "Bharati" | undefined = undefined;
        let page: Page = "dashboard";
        if (email.includes("bharati")) {
          role = "researcher";
          station = "Bharati";
          page = "researcher_dashboard";
        } else if (email.includes("researcher")) {
          role = "researcher";
          station = "Maitri";
          page = "researcher_dashboard";
        }
        login(role, station);
        onLogin(role, page);
        setLoadingState("idle");
      }, 500);
    }, 800);
  }

  const isLoading = loadingState !== "idle";

  return (
    <div className="login-layout" style={{ display: "flex", height: "100vh", fontFamily: "'Inter', sans-serif" }}>

      {/* ── LEFT PANEL ── */}
      <div className="login-left" style={{
        width: "60%",
        position: "relative",
        backgroundImage: `url(${loginBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center 30%",
        backgroundColor: "#0B1F33",
        flexShrink: 0,
      }}>
        {/* Dark overlay — restrained so the station photo reads */}
        <div style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to bottom, rgba(8,20,38,0.62) 0%, rgba(8,20,38,0.78) 60%, rgba(8,20,38,0.90) 100%)",
        }} />

        {/* Content */}
        <div style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          padding: "44px 52px",
        }}>

          {/* Top — wordmark */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 30, height: 30,
              background: "linear-gradient(135deg, #38BDF8, #0369A1)",
              borderRadius: 5,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L20 7V17L12 22L4 17V7L12 2Z" stroke="white" strokeWidth="1.5" fill="rgba(255,255,255,0.15)" />
                <path d="M12 6V18M6 9L18 15M18 9L6 15" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#FFFFFF", letterSpacing: "0.14em" }}>ANTARIS</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", letterSpacing: "0.18em", marginTop: 1 }}>ANTARCTIC OPERATIONS PLATFORM</div>
            </div>
          </div>

          {/* Middle — main headline */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", maxWidth: 480 }}>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              marginBottom: 28,
            }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: "#4ADE80" }} />
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", letterSpacing: "0.14em", fontWeight: 500 }}>
                NETWORK OPERATIONAL · MAITRI + BHARATI
              </span>
            </div>

            <h1 style={{
              margin: "0 0 6px",
              fontSize: 52,
              fontWeight: 800,
              color: "#FFFFFF",
              lineHeight: 1.0,
              letterSpacing: "-0.02em",
            }}>
              TWO STATIONS.
            </h1>
            <h1 style={{
              margin: "0 0 28px",
              fontSize: 52,
              fontWeight: 800,
              color: "rgba(255,255,255,0.7)",
              lineHeight: 1.0,
              letterSpacing: "-0.02em",
            }}>
              ONE CONTROL ROOM.
            </h1>

            <p style={{
              margin: "0 0 36px",
              fontSize: 14,
              color: "rgba(255,255,255,0.55)",
              lineHeight: 1.65,
              maxWidth: 440,
            }}>
              ANTARIS connects power, fuel, weather, logistics and daily research
              reporting from Maitri and Bharati back to the HQ operations desk — on
              links measured in hundreds of milliseconds and weather windows measured
              in hours.
            </p>

            {/* Station tags */}
            <div style={{ display: "flex", gap: 8 }}>
              {[
                { label: "MAITRI STATION", sub: "Queen Maud Land · 70°S" },
                { label: "BHARATI STATION", sub: "Prydz Bay · 69°S" },
              ].map(s => (
                <div key={s.label} style={{
                  backgroundColor: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 4,
                  padding: "8px 14px",
                }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.75)", letterSpacing: "0.1em" }}>{s.label}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.38)", marginTop: 2 }}>{s.sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom — stats + NCPOR */}
          <div>
            {/* Stats row */}
            <div style={{
              display: "flex",
              gap: 0,
              marginBottom: 20,
              borderTop: "1px solid rgba(255,255,255,0.1)",
              paddingTop: 20,
            }}>
              {[
                { num: "02", label: "STATIONS" },
                { num: "55", label: "PERSONNEL" },
                { num: "1989", label: "SINCE" },
              ].map((stat, i) => (
                <div key={stat.label} style={{
                  flex: 1,
                  paddingRight: i < 2 ? 20 : 0,
                  borderRight: i < 2 ? "1px solid rgba(255,255,255,0.1)" : "none",
                  paddingLeft: i > 0 ? 20 : 0,
                }}>
                  <div style={{ fontSize: 28, fontWeight: 700, color: "#FFFFFF", lineHeight: 1, letterSpacing: "-0.02em" }}>{stat.num}</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "0.14em", marginTop: 4 }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* NCPOR + security */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <img
                  src="https://upload.wikimedia.org/wikipedia/en/thumb/4/41/Flag_of_India.svg/23px-Flag_of_India.svg.png"
                  alt="India"
                  style={{ height: 11, borderRadius: 1 }}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", letterSpacing: "0.1em", fontWeight: 500 }}>
                  NCPOR · GOA, INDIA · Ministry of Earth Sciences
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em" }}>
                  TLS 1.3 · AES-256 ENCRYPTED
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="login-right" style={{
        width: "40%",
        backgroundColor: "#FFFFFF",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "48px 52px",
      }}>
        <div className="login-form" style={{ maxWidth: 560, width: "100%" }}>
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
              <div style={{ width: 28, height: 28, backgroundColor: "#1677FF", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: 14, height: 14, border: "2px solid white", borderRadius: 2 }} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#64748B", letterSpacing: "0.06em" }}>ANTARCTIC OPS</span>
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: "#0F172A", margin: "0 0 8px" }}>Welcome back</h2>
            <p style={{ fontSize: 14, color: "#64748B", margin: 0 }}>
              Sign in to access the Antarctic Operations Portal.
            </p>
          </div>

          {/* Demo credentials */}
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 11, color: "#94A3B8", marginBottom: 8, fontWeight: 500, letterSpacing: "0.06em" }}>DEMO CREDENTIALS</p>
            <div style={{ display: "flex", gap: 7 }}>
              <button
                type="button"
                onClick={() => setEmail("admin@antarctic-ops.in")}
                style={{
                  flex: 1, padding: "8px 8px",
                  border: "1px solid #E2E8F0", borderRadius: 4,
                  backgroundColor: email === "admin@antarctic-ops.in" ? "#EAF4FF" : "#F8FAFC",
                  cursor: "pointer", textAlign: "left",
                }}
              >
                <div style={{ fontSize: 9, color: "#1677FF", fontWeight: 700, marginBottom: 2, letterSpacing: "0.06em" }}>ADMIN / HQ</div>
                <div style={{ fontSize: 10, color: "#475569" }}>admin@antarctic-ops.in</div>
              </button>
              <button
                type="button"
                onClick={() => setEmail("researcher@antarctic-ops.in")}
                style={{
                  flex: 1, padding: "8px 8px",
                  border: "1px solid #E2E8F0", borderRadius: 4,
                  backgroundColor: email === "researcher@antarctic-ops.in" ? "#F0FDF4" : "#F8FAFC",
                  cursor: "pointer", textAlign: "left",
                }}
              >
                <div style={{ fontSize: 9, color: "#16A34A", fontWeight: 700, marginBottom: 2, letterSpacing: "0.06em" }}>MAITRI RES.</div>
                <div style={{ fontSize: 10, color: "#475569" }}>Dr. Priya Nair</div>
              </button>
              <button
                type="button"
                onClick={() => setEmail("bharati@antarctic-ops.in")}
                style={{
                  flex: 1, padding: "8px 8px",
                  border: "1px solid #E2E8F0", borderRadius: 4,
                  backgroundColor: email === "bharati@antarctic-ops.in" ? "#F0FDF4" : "#F8FAFC",
                  cursor: "pointer", textAlign: "left",
                }}
              >
                <div style={{ fontSize: 9, color: "#0891B2", fontWeight: 700, marginBottom: 2, letterSpacing: "0.06em" }}>BHARATI RES.</div>
                <div style={{ fontSize: 10, color: "#475569" }}>Dr. Arjun Mehta</div>
              </button>
            </div>
          </div>

          <form onSubmit={handleSignIn}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>
                Email / Operator ID
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email / Operator ID"
                style={{
                  width: "100%", padding: "10px 12px",
                  border: "1px solid #E2E8F0", borderRadius: 4,
                  fontSize: 14, color: "#0F172A", outline: "none",
                  boxSizing: "border-box", backgroundColor: "#FAFAFA",
                }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>Password</label>
                <a href="#" style={{ fontSize: 12, color: "#1677FF", textDecoration: "none" }}>Forgot password?</a>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: "100%", padding: "10px 12px",
                  border: "1px solid #E2E8F0", borderRadius: 4,
                  fontSize: 14, color: "#0F172A", outline: "none",
                  boxSizing: "border-box", backgroundColor: "#FAFAFA",
                }}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
              <input
                type="checkbox"
                id="remember"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                style={{ width: 14, height: 14, accentColor: "#1677FF" }}
              />
              <label htmlFor="remember" style={{ fontSize: 13, color: "#64748B" }}>Remember this device</label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: "100%", padding: "12px",
                backgroundColor: isLoading ? "#93C5FD" : "#1677FF",
                color: "#FFFFFF", border: "none", borderRadius: 4,
                fontSize: 14, fontWeight: 600,
                cursor: isLoading ? "not-allowed" : "pointer",
                transition: "background-color 0.15s",
                fontFamily: "inherit",
              }}
            >
              {loadingState === "auth" ? "Authenticating..." : loadingState === "connect" ? "Connecting to station network..." : "Sign In"}
            </button>
          </form>

          <div style={{ marginTop: 28, display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#16A34A" }} />
            <span style={{ fontSize: 11, color: "#94A3B8" }}>Secure connection · NCPOR Operations Network</span>
          </div>
        </div>
      </div>
    </div>
  );
}
