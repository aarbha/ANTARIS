import { useState } from "react";
import type { Page } from "./types";
import { AppProvider, useApp } from "./context/AppContext";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Energy from "./pages/Energy";
import Fuel from "./pages/Fuel";
import Logistics from "./pages/Logistics";
import Weather from "./pages/Weather";
import Stations from "./pages/Stations";
import Alerts from "./pages/Alerts";
import Reports from "./pages/Reports";
import ResearcherDashboard from "./pages/ResearcherDashboard";
import Researcher from "./pages/Researcher";
import Experiments from "./pages/Experiments";
import ResearcherExperiments from "./pages/ResearcherExperiments";
import ResearcherConnectivity from "./pages/ResearcherConnectivity";
import Predictions from "./pages/Predictions";
import Simulation from "./pages/Simulation";

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ animation: "fadeIn 0.2s forwards", opacity: 0 }}>
      {children}
    </div>
  );
}

function AppInner() {
  const { role } = useApp();
  const [page, setPage] = useState<Page>("login");

  if (!role || page === "login") {
    return <Login onLogin={(r, p) => { setPage(p); }} />;
  }

  function renderPage() {
    if (role === "researcher") {
      switch (page) {
        case "researcher_dashboard": return <PageWrapper><ResearcherDashboard onNavigate={setPage} /></PageWrapper>;
        case "researcher_log": return <PageWrapper><Researcher /></PageWrapper>;
        case "researcher_experiments": return <PageWrapper><ResearcherExperiments /></PageWrapper>;
        case "researcher_connectivity": return <PageWrapper><ResearcherConnectivity /></PageWrapper>;
        case "weather": return <PageWrapper><Weather /></PageWrapper>;
        case "researcher_reports": return <PageWrapper><Reports /></PageWrapper>;
        default: return <PageWrapper><ResearcherDashboard onNavigate={setPage} /></PageWrapper>;
      }
    }

    switch (page) {
      case "dashboard": return <PageWrapper><Dashboard onNavigate={setPage} /></PageWrapper>;
      case "stations": return <PageWrapper><Stations /></PageWrapper>;
      case "energy": return <PageWrapper><Energy /></PageWrapper>;
      case "fuel": return <PageWrapper><Fuel /></PageWrapper>;
      case "logistics": return <PageWrapper><Logistics /></PageWrapper>;
      case "weather": return <PageWrapper><Weather /></PageWrapper>;
      case "alerts": return <PageWrapper><Alerts /></PageWrapper>;
      case "reports": return <PageWrapper><Reports /></PageWrapper>;
      case "experiments": return <PageWrapper><Experiments /></PageWrapper>;
      case "predictions": return <PageWrapper><Predictions /></PageWrapper>;
      case "simulation": return <PageWrapper><Simulation /></PageWrapper>;
      default: return <PageWrapper><Dashboard onNavigate={setPage} /></PageWrapper>;
    }
  }

  return (
    <div style={{ display: "flex", height: "100%", fontFamily: "'Inter', sans-serif", backgroundColor: "#F0F4F8" }}>
      <Sidebar currentPage={page} onNavigate={setPage} />
      <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
        <Topbar currentPage={page} onNavigate={setPage} />
        <main style={{ flex: 1, overflowY: "auto" }}>
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}
