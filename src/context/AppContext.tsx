import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { apiGetLatestTelemetry, apiHealth } from "../lib/api";

export interface StationState {
  temp: number;
  wind: number;
  windDir: string;
  fuelPct: number;
  fuelL: number;
  fuelConsumption: number;
  powerGen: number;
  powerCon: number;
  personnel: number;
  weather: string;
  stormProb: number;
  pressure: number;
  visibility: number;
  humidity: number;
  battery?: number;
  lastSync: string;
  status: "operational" | "offline" | "degraded";
}

export interface AppAlert {
  id: string;
  severity: "critical" | "warning" | "advisory" | "info";
  title: string;
  station: string;
  time: string;
  status: "active" | "acknowledged" | "resolved";
  cause: string;
  condition: string;
  action: string;
}

export interface AppReport {
  id: string;
  type: string;
  station: string;
  submittedBy: string;
  date: string;
  time: string;
  status: "submitted" | "draft";
  data: Record<string, unknown>;
}

export interface AppShipment {
  id: string;
  destination: string;
  cargo: string;
  vessel: string;
  origin: string;
  departure: string;
  eta: string;
  weight: string;
  status: "preparing" | "in_transit" | "delivered";
}

export interface ActivityEntry {
  time: string;
  action: string;
  detail: string;
  user: string;
}

export interface ResearchExperiment {
  id: string;
  name: string;
  station: "Maitri" | "Bharati";
  researcher: string;
  team: string[];
  objective: string;
  status: "Active" | "Data Collection" | "Analysis" | "Completed" | "Paused";
  startDate: string;
  expectedCompletion: string;
  lastUpdate: string;
  equipment: string[];
  samplesCollected: number;
  observations: string;
  researchNotes: string;
  sharedWith?: "Maitri" | "Bharati";
  dataTransferred?: string;
}

export interface ConnectivityTransfer {
  id: string;
  from: "Maitri" | "Bharati";
  to: "Maitri" | "Bharati";
  description: string;
  size: string;
  time: string;
  type: "dataset" | "experiment" | "message" | "report";
}

export interface EmergencyIncident {
  id: string;
  affectedStation: "Maitri" | "Bharati";
  supportStation: "Maitri" | "Bharati";
  emergencyType: string;
  severity: "Critical" | "High" | "Moderate";
  description: string;
  requiredAssistance: string;
  createdBy: string;
  timestamp: string;
  connectionStatus: "active" | "pending" | "closed";
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  sharedData?: Record<string, unknown>;
}

interface AppContextType {
  role: "admin" | "researcher" | null;
  researcherStation: "Maitri" | "Bharati" | null;
  maitri: StationState;
  bharati: StationState;
  alerts: AppAlert[];
  reports: AppReport[];
  shipments: AppShipment[];
  activity: ActivityEntry[];
  experiments: ResearchExperiment[];
  transfers: ConnectivityTransfer[];
  login: (role: "admin" | "researcher", station?: "Maitri" | "Bharati") => void;
  logout: () => void;
  updateStation: (station: "maitri" | "bharati", updates: Partial<StationState>) => void;
  addReport: (report: AppReport) => void;
  submitResearcherLog: (report: AppReport) => void;
  updateAlert: (id: string, updates: Partial<AppAlert>) => void;
  updateShipment: (id: string, updates: Partial<AppShipment>) => void;
  addActivity: (entry: ActivityEntry) => void;
  addTransfer: (transfer: ConnectivityTransfer) => void;
  addShipment: (shipment: AppShipment) => void;
  addExperiment: (experiment: ResearchExperiment) => void;
  addAlert: (alert: AppAlert) => void;
  emergencies: EmergencyIncident[];
  addEmergency: (incident: EmergencyIncident) => void;
  acknowledgeEmergency: (id: string, acknowledgedBy: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

const initialMaitri: StationState = {
  temp: -18,
  wind: 42,
  windDir: "NW",
  fuelPct: 72,
  fuelL: 18400,
  fuelConsumption: 1020,
  powerGen: 1.82,
  powerCon: 1.67,
  personnel: 24,
  weather: "Light snow",
  stormProb: 68,
  pressure: 982,
  visibility: 4.8,
  humidity: 74,
  battery: 68,
  lastSync: "14:32 UTC",
  status: "operational",
};

const initialBharati: StationState = {
  temp: -12,
  wind: 36,
  windDir: "SE",
  fuelPct: 38,
  fuelL: 9500,
  fuelConsumption: 880,
  powerGen: 1.64,
  powerCon: 1.51,
  personnel: 18,
  weather: "Cloudy",
  stormProb: 32,
  pressure: 990,
  visibility: 8.2,
  humidity: 61,
  battery: 75,
  lastSync: "14:29 UTC",
  status: "operational",
};

const initialAlerts: AppAlert[] = [
  {
    id: "ALT-001",
    severity: "critical",
    title: "Fuel Level Critical — Bharati Station",
    station: "Bharati",
    time: "12:14 UTC",
    status: "active",
    cause: "Fuel consumption higher than projected due to extended generator runtime.",
    condition: "Fuel reserve at 38% — below 40% threshold. At current rate, reserves will last approximately 10 days.",
    action: "Initiate emergency resupply request. Reduce non-essential power consumption. Contact logistics coordinator.",
  },
  {
    id: "ALT-002",
    severity: "warning",
    title: "Severe Weather Advisory — Maitri Station",
    station: "Maitri",
    time: "11:30 UTC",
    status: "active",
    cause: "Low pressure system approaching from the west.",
    condition: "Storm probability 68%. Expected wind speeds 70-80 km/h within 24 hours.",
    action: "Secure outdoor equipment. Suspend non-essential outdoor operations. Brief all personnel.",
  },
  {
    id: "ALT-003",
    severity: "warning",
    title: "Generator 3 Offline — Maitri Station",
    station: "Maitri",
    time: "09:45 UTC",
    status: "acknowledged",
    cause: "Scheduled maintenance overrun. Mechanical inspection in progress.",
    condition: "Station running on 2 of 3 generators. Capacity reduced by 33%. Current load within acceptable range.",
    action: "Continue maintenance. Estimate return to service: 18:00 UTC. Monitor load closely.",
  },
  {
    id: "ALT-004",
    severity: "info",
    title: "Resupply Vessel MV Sagar Nidhi Departed",
    station: "All",
    time: "06:00 UTC",
    status: "active",
    cause: "Scheduled resupply mission.",
    condition: "Vessel departed Port Louis, Mauritius. ETA Maitri: 12 Sep 2026.",
    action: "Prepare offloading crew and equipment. Confirm berthing arrangements.",
  },
];

const initialShipments: AppShipment[] = [
  {
    id: "SUP-204",
    destination: "Maitri Station",
    cargo: "Fuel, Food Supplies, Medical Equipment",
    vessel: "MV Sagar Nidhi",
    origin: "Port Louis, Mauritius",
    departure: "03 Sep 2026",
    eta: "12 Sep 2026",
    weight: "42 MT",
    status: "in_transit",
  },
  {
    id: "SUP-203",
    destination: "Bharati Station",
    cargo: "Scientific Equipment, Spare Parts",
    vessel: "MV Sagar Manjusha",
    origin: "Goa, India",
    departure: "28 Aug 2026",
    eta: "18 Sep 2026",
    weight: "18 MT",
    status: "in_transit",
  },
  {
    id: "SUP-205",
    destination: "Maitri Station",
    cargo: "Winterisation Supplies",
    vessel: "MV Sagar Nidhi",
    origin: "Goa, India",
    departure: "20 Sep 2026",
    eta: "05 Oct 2026",
    weight: "28 MT",
    status: "preparing",
  },
];

const initialActivity: ActivityEntry[] = [
  { time: "14:32 UTC", action: "Station sync", detail: "Maitri telemetry updated", user: "System" },
  { time: "14:29 UTC", action: "Station sync", detail: "Bharati telemetry updated", user: "System" },
  { time: "12:14 UTC", action: "Alert raised", detail: "Critical fuel level at Bharati Station", user: "System" },
  { time: "10:15 UTC", action: "Report submitted", detail: "Daily Log — Maitri — 02 Sep 2026", user: "Dr. Priya Nair" },
  { time: "09:45 UTC", action: "Alert raised", detail: "Generator 3 offline at Maitri Station", user: "System" },
];

const initialReports: AppReport[] = [
  {
    id: "LOG-2026-0902-013",
    type: "Daily Log",
    station: "Maitri",
    submittedBy: "Dr. Priya Nair",
    date: "02 Sep 2026",
    time: "10:15 UTC",
    status: "submitted",
    data: {
      temp: -17,
      wind: 38,
      weather: "Overcast",
      fuelPct: 74,
      powerGen: 1.82,
      notes: "All systems operational. Research activity continued as planned.",
    },
  },
  {
    id: "LOG-2026-0901-012",
    type: "Daily Log",
    station: "Maitri",
    submittedBy: "Dr. Priya Nair",
    date: "01 Sep 2026",
    time: "14:05 UTC",
    status: "submitted",
    data: {
      temp: -15,
      wind: 28,
      weather: "Clear",
      fuelPct: 76,
      powerGen: 1.84,
      notes: "Clear conditions. Outdoor sampling conducted successfully.",
    },
  },
  {
    id: "WR-2026-0902-001",
    type: "Weather Report",
    station: "Bharati",
    submittedBy: "Suresh Kumar",
    date: "02 Sep 2026",
    time: "08:00 UTC",
    status: "submitted",
    data: {
      temp: -11,
      wind: 32,
      weather: "Partly cloudy",
      pressure: 992,
      notes: "Conditions stable. No significant weather events observed.",
    },
  },
];

const initialExperiments: ResearchExperiment[] = [
  {
    id: "EXP-M001",
    name: "Polar Atmospheric Observation",
    station: "Maitri",
    researcher: "Dr. Priya Nair",
    team: ["Dr. Priya Nair", "Suresh Kumar", "Anjali Singh"],
    objective: "Long-term monitoring of polar atmospheric composition and aerosol distribution to understand climate feedback mechanisms.",
    status: "Active",
    startDate: "02 Sep 2026",
    expectedCompletion: "28 Feb 2027",
    lastUpdate: "14:18 UTC",
    equipment: ["Atmospheric Sensor Array", "LIDAR System", "Spectrophotometer", "GPS Receiver"],
    samplesCollected: 12,
    observations: "Elevated aerosol concentration detected at 3km altitude. Consistent with Southern Ocean transport.",
    researchNotes: "Day 5 of continuous monitoring. Sensor array performing nominally. Battery backup engaged during Generator 3 maintenance.",
    sharedWith: "Bharati",
    dataTransferred: "12.4 MB",
  },
  {
    id: "EXP-M002",
    name: "Sea-Ice Monitoring",
    station: "Maitri",
    researcher: "Suresh Kumar",
    team: ["Suresh Kumar", "Dr. Priya Nair"],
    objective: "Monitor seasonal sea-ice extent, thickness and dynamics in the Weddell Sea.",
    status: "Active",
    startDate: "01 Sep 2026",
    expectedCompletion: "31 Jan 2027",
    lastUpdate: "13:42 UTC",
    equipment: ["Ice Core Drill", "Ground Penetrating Radar", "Satellite Uplink Terminal"],
    samplesCollected: 8,
    observations: "Ice thickness at Grid C-7: 1.84m. Slight thinning observed compared to previous week.",
    researchNotes: "Outdoor sampling limited due to weather. Remote sensing data being processed.",
  },
  {
    id: "EXP-B001",
    name: "Glaciology Survey",
    station: "Bharati",
    researcher: "Dr. Arjun Mehta",
    team: ["Dr. Arjun Mehta", "Kavitha Rajan", "Mohan Pillai"],
    objective: "Map glacial flow velocities and ice-bed interface properties of the East Antarctic Ice Sheet.",
    status: "Active",
    startDate: "28 Aug 2026",
    expectedCompletion: "15 Mar 2027",
    lastUpdate: "13:55 UTC",
    equipment: ["GPS Survey Array", "Seismic Sensors", "Ice-penetrating Radar", "Drone with LiDAR"],
    samplesCollected: 21,
    observations: "Flow velocity at Site B-4: 0.82 m/day. Subglacial lake signal detected — requires follow-up survey.",
    researchNotes: "Drone survey completed on 01 Sep. LiDAR data uploaded to central server. Subglacial lake investigation planned for next week.",
    sharedWith: "Maitri",
    dataTransferred: "8.7 MB",
  },
  {
    id: "EXP-B002",
    name: "Marine Ecosystem Observation",
    station: "Bharati",
    researcher: "Kavitha Rajan",
    team: ["Kavitha Rajan", "Dr. Arjun Mehta"],
    objective: "Study phytoplankton bloom dynamics and krill population distribution in the Southern Ocean.",
    status: "Data Collection",
    startDate: "30 Aug 2026",
    expectedCompletion: "20 Feb 2027",
    lastUpdate: "12:31 UTC",
    equipment: ["Water Sampling Equipment", "Flow Cytometer", "Acoustic Doppler Current Profiler", "CTD Sensor"],
    samplesCollected: 34,
    observations: "Chlorophyll-a concentration: 2.3 mg/m³. Krill aggregation observed at 80–120m depth.",
    researchNotes: "Samples from Transect Line 3 collected. Lab analysis ongoing. CTD cast completed at stations 7 and 8.",
  },
];

const initialTransfers: ConnectivityTransfer[] = [
  { id: "TRF-001", from: "Maitri", to: "Bharati", description: "Polar Atmospheric Observation — dataset shared", size: "12.4 MB", time: "14:21 UTC", type: "dataset" },
  { id: "TRF-002", from: "Bharati", to: "Maitri", description: "Glaciology Survey — LiDAR data batch", size: "8.7 MB", time: "13:58 UTC", type: "dataset" },
  { id: "TRF-003", from: "Maitri", to: "Bharati", description: "Weather report — Maitri 03 Sep 2026", size: "0.2 MB", time: "10:15 UTC", type: "report" },
  { id: "TRF-004", from: "Bharati", to: "Maitri", description: "Research coordination message", size: "0.01 MB", time: "09:30 UTC", type: "message" },
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<"admin" | "researcher" | null>(null);
  const [researcherStation, setResearcherStation] = useState<"Maitri" | "Bharati" | null>(null);
  const [maitri, setMaitri] = useState<StationState>(initialMaitri);
  const [bharati, setBharati] = useState<StationState>(initialBharati);
  const [alerts, setAlerts] = useState<AppAlert[]>(initialAlerts);
  const [reports, setReports] = useState<AppReport[]>(initialReports);
  const [shipments, setShipments] = useState<AppShipment[]>(initialShipments);
  const [activity, setActivity] = useState<ActivityEntry[]>(initialActivity);
  const [experiments, setExperiments] = useState<ResearchExperiment[]>(initialExperiments);
  const [transfers, setTransfers] = useState<ConnectivityTransfer[]>(initialTransfers);
  const [emergencies, setEmergencies] = useState<EmergencyIncident[]>([]);

  // ── Backend polling (live telemetry) ──
  const backendAvailable = useRef<boolean | null>(null)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!role) {
      if (pollingRef.current) clearInterval(pollingRef.current)
      return
    }

    // Check if backend is available (one-time, does NOT permanently disable on failure)
    apiHealth()
      .then(() => { backendAvailable.current = true })
      .catch(() => { backendAvailable.current = false })

    const FUEL_CAPACITIES: Record<string, number> = { maitri: 25600, bharati: 25000 }

    pollingRef.current = setInterval(async () => {
      // Never permanently skip — just skip this tick if backend was unreachable
      // The next tick will try again anyway
      try {
        const [mData, bData] = await Promise.all([
          apiGetLatestTelemetry("maitri"),
          apiGetLatestTelemetry("bharati"),
        ])
        backendAvailable.current = true
        const v = mData.values
        const b = bData.values
        const mCap = FUEL_CAPACITIES["maitri"]
        const bCap = FUEL_CAPACITIES["bharati"]
        setMaitri(prev => ({
          ...prev,
          temp: Math.round(v.outdoor_temp),
          wind: Math.round(v.wind_speed_kmh),
          fuelL: Math.round(v.fuel_level_liters),
          fuelPct: Math.round((v.fuel_level_liters / mCap) * 100),
          battery: Math.round(v.battery_soc),
          powerGen: Math.round((1750 + v.solar_output_kw + v.wind_output_kw) / 1000 * 10) / 10,
          powerCon: Math.round((1750 + v.solar_output_kw + v.wind_output_kw) * 0.85 / 1000 * 10) / 10,
          lastSync: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) + " UTC",
        }))
        setBharati(prev => ({
          ...prev,
          temp: Math.round(b.outdoor_temp),
          wind: Math.round(b.wind_speed_kmh),
          fuelL: Math.round(b.fuel_level_liters),
          fuelPct: Math.round((b.fuel_level_liters / bCap) * 100),
          battery: Math.round(b.battery_soc),
          powerGen: Math.round((1750 + b.solar_output_kw + b.wind_output_kw) / 1000 * 10) / 10,
          powerCon: Math.round((1750 + b.solar_output_kw + b.wind_output_kw) * 0.85 / 1000 * 10) / 10,
          lastSync: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) + " UTC",
        }))
      } catch {
        // Don't permanently disable — just skip this tick
        backendAvailable.current = false
      }
    }, 5000)

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [role])

  const login = useCallback((r: "admin" | "researcher", station?: "Maitri" | "Bharati") => {
    setRole(r);
    setResearcherStation(station ?? null);
  }, []);

  const logout = useCallback(() => {
    setRole(null);
    setResearcherStation(null);
  }, []);

  const addActivity = useCallback((entry: ActivityEntry) => {
    setActivity((prev) => [entry, ...prev]);
  }, []);

  const updateStation = useCallback(
    (station: "maitri" | "bharati", updates: Partial<StationState>) => {
      if (station === "maitri") {
        setMaitri((prev) => ({ ...prev, ...updates }));
      } else {
        setBharati((prev) => ({ ...prev, ...updates }));
      }
      addActivity({
        time: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) + " UTC",
        action: "Station updated",
        detail: `${station.charAt(0).toUpperCase() + station.slice(1)} station data modified`,
        user: role === "researcher" ? "Researcher" : "Admin",
      });
    },
    [addActivity, role]
  );

  const addReport = useCallback(
    (report: AppReport) => {
      setReports((prev) => [report, ...prev]);
      addActivity({
        time: report.time,
        action: "Report submitted",
        detail: `${report.type} — ${report.station} — ${report.date}`,
        user: report.submittedBy,
      });
    },
    [addActivity]
  );

  const submitResearcherLog = useCallback(
    (report: AppReport) => {
      setReports((prev) => [report, ...prev]);
      const utcTime = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) + " UTC";
      const stationKey = report.station.toLowerCase() as "maitri" | "bharati";
      const d = report.data as Record<string, unknown>;

      const updates: Partial<StationState> = { lastSync: utcTime };
      if (d.temperature !== undefined) updates.temp = Number(d.temperature);
      if (d.windSpeed !== undefined) updates.wind = Number(d.windSpeed);
      if (d.windDirection !== undefined) updates.windDir = String(d.windDirection);
      if (d.fuelLevel !== undefined) updates.fuelPct = Number(d.fuelLevel);
      if (d.fuelVolume !== undefined) updates.fuelL = Number(d.fuelVolume);
      if (d.powerGenerated !== undefined) updates.powerGen = Number(d.powerGenerated);
      if (d.powerConsumed !== undefined) updates.powerCon = Number(d.powerConsumed);
      if (d.totalPersonnel !== undefined) updates.personnel = Number(d.totalPersonnel);
      if (d.weatherConditions !== undefined) updates.weather = String(d.weatherConditions);
      if (d.pressure !== undefined) updates.pressure = Number(d.pressure);
      if (d.visibility !== undefined) updates.visibility = Number(d.visibility);
      if (d.stormProbability !== undefined) updates.stormProb = Number(d.stormProbability);

      if (stationKey === "maitri") {
        setMaitri((prev) => ({ ...prev, ...updates }));
      } else {
        setBharati((prev) => ({ ...prev, ...updates }));
      }

      const newAlerts: AppAlert[] = [];
      const fuelPct = updates.fuelPct;
      const stormProb = updates.stormProb;
      const temp = updates.temp;
      const wind = updates.wind;

      if (fuelPct !== undefined && fuelPct < 40) {
        newAlerts.push({
          id: "ALT-AUTO-" + Date.now(),
          severity: "critical",
          title: `Fuel Level Critical — ${report.station} Station`,
          station: report.station,
          time: utcTime,
          status: "active",
          cause: `Researcher field report indicates fuel at ${fuelPct}% — below 40% threshold.`,
          condition: `Current fuel level: ${fuelPct}%. Immediate resupply coordination required.`,
          action: "Initiate emergency resupply request. Reduce non-essential power consumption.",
        });
      }
      if (stormProb !== undefined && stormProb > 65) {
        newAlerts.push({
          id: "ALT-AUTO-" + (Date.now() + 1),
          severity: "warning",
          title: `Severe Weather Advisory — ${report.station} Station`,
          station: report.station,
          time: utcTime,
          status: "active",
          cause: `Researcher report indicates storm probability at ${stormProb}%.`,
          condition: `Storm probability: ${stormProb}%. Deteriorating conditions expected.`,
          action: "Secure outdoor equipment. Suspend non-essential outdoor operations. Brief all personnel.",
        });
      }
      if (temp !== undefined && temp < -30) {
        newAlerts.push({
          id: "ALT-AUTO-" + (Date.now() + 2),
          severity: "advisory",
          title: `Extreme Cold Conditions — ${report.station} Station`,
          station: report.station,
          time: utcTime,
          status: "active",
          cause: `Researcher field report: temperature at ${temp}°C.`,
          condition: `Temperature below −30°C. Risk of equipment failure and frostbite.`,
          action: "Restrict outdoor activity. Check all heating systems. Ensure personnel have appropriate gear.",
        });
      }
      if (wind !== undefined && wind > 80) {
        newAlerts.push({
          id: "ALT-AUTO-" + (Date.now() + 3),
          severity: "warning",
          title: `High Wind Warning — ${report.station} Station`,
          station: report.station,
          time: utcTime,
          status: "active",
          cause: `Researcher field report: wind speed at ${wind} km/h.`,
          condition: `Wind speed: ${wind} km/h. Conditions unsafe for outdoor operations.`,
          action: "Suspend all outdoor activities. Secure equipment and structures.",
        });
      }
      if (newAlerts.length > 0) {
        setAlerts((prev) => [...newAlerts, ...prev]);
      }

      addActivity({
        time: utcTime,
        action: "Report submitted",
        detail: `${report.type} — ${report.station} — ${report.date} | Station data updated`,
        user: report.submittedBy,
      });
    },
    [addActivity]
  );

  const updateAlert = useCallback(
    (id: string, updates: Partial<AppAlert>) => {
      setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)));
    },
    []
  );

  const updateShipment = useCallback(
    (id: string, updates: Partial<AppShipment>) => {
      setShipments((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    },
    []
  );

  const addTransfer = useCallback((transfer: ConnectivityTransfer) => {
    setTransfers((prev) => [transfer, ...prev]);
  }, []);

  const addShipment = useCallback(
    (shipment: AppShipment) => {
      setShipments((prev) => [shipment, ...prev]);
      const utcTime = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) + " UTC";
      addActivity({
        time: utcTime,
        action: "Shipment created",
        detail: `${shipment.id} → ${shipment.destination}`,
        user: "Operations",
      });
    },
    [addActivity]
  );

  const addExperiment = useCallback(
    (experiment: ResearchExperiment) => {
      setExperiments((prev) => [experiment, ...prev]);
      const utcTime = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) + " UTC";
      addActivity({
        time: utcTime,
        action: "Experiment created",
        detail: `${experiment.name} — ${experiment.station}`,
        user: experiment.researcher,
      });
    },
    [addActivity]
  );

  const addAlert = useCallback((alert: AppAlert) => {
    setAlerts((prev) => [alert, ...prev]);
  }, []);

  const addEmergency = useCallback((incident: EmergencyIncident) => {
    setEmergencies((prev) => [incident, ...prev]);
    const severityMap: Record<string, "critical" | "warning" | "advisory"> = {
      Critical: "critical",
      High: "warning",
      Moderate: "advisory",
    };
    setAlerts((prev) => [
      {
        id: "ALT-EMG-" + Date.now(),
        severity: severityMap[incident.severity] ?? "warning",
        title: `Emergency: ${incident.emergencyType} — ${incident.affectedStation} Station`,
        station: incident.affectedStation,
        time: incident.timestamp,
        status: "active",
        cause: incident.description || "Emergency declared by field researcher.",
        condition: `${incident.affectedStation} ↔ ${incident.supportStation} emergency channel active. Severity: ${incident.severity}.`,
        action: incident.requiredAssistance || "Follow emergency protocol. Acknowledge and coordinate response.",
      },
      ...prev,
    ]);
    addActivity({
      time: incident.timestamp,
      action: "Emergency declared",
      detail: `${incident.emergencyType} — ${incident.affectedStation} → ${incident.supportStation} | ${incident.severity}`,
      user: incident.createdBy,
    });
  }, [addActivity]);

  const acknowledgeEmergency = useCallback((id: string, acknowledgedBy: string) => {
    const utcTime = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) + " UTC";
    setEmergencies((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, acknowledged: true, acknowledgedBy, acknowledgedAt: utcTime } : e
      )
    );
    addActivity({
      time: utcTime,
      action: "Emergency acknowledged",
      detail: `Emergency ${id} acknowledged by ${acknowledgedBy}`,
      user: acknowledgedBy,
    });
  }, [addActivity]);

  return (
    <AppContext.Provider
      value={{
        role,
        researcherStation,
        maitri,
        bharati,
        alerts,
        reports,
        shipments,
        activity,
        experiments,
        transfers,
        login,
        logout,
        updateStation,
        addReport,
        submitResearcherLog,
        updateAlert,
        updateShipment,
        addActivity,
        addTransfer,
        addShipment,
        addExperiment,
        addAlert,
        emergencies,
        addEmergency,
        acknowledgeEmergency,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

export default AppProvider;
