# ANTARIS

**Antarctic Research Station Intelligence & Situational Awareness Platform**

> Smart India Hackathon 2026 — Problem Statement PS-26060

Real-time monitoring, ML-based predictions, and disaster simulation for India's Antarctic research stations **Maitri** and **Bharati** — powered by live data from NCPOR, Open-Meteo, NOAA, and NSIDC.

---

## What Is This?

Antaris is a full-stack operations dashboard that connects to real Antarctic data sources and provides station commanders and HQ with:

- **Live sensor readings** — temperature, wind, fuel, power, battery — updating every 2 seconds
- **Machine learning predictions** — fuel depletion forecast, temperature outlook, generator health scoring
- **Disaster simulation** — run what-if scenarios (storm, generator failure, fuel shortage) and see a physics-based timeline of what happens next
- **Real weather intelligence** — 7-day forecasts, aurora probability, sea ice conditions — all from live Antarctic data APIs

No static mockups. No fake numbers. Every data point traces back to either a real sensor or a deterministic physics model.

---

## Live Demo

A working prototype was demonstrated live during the hackathon. The dashboard showed:

- Real-time telemetry from NCPOR (India's National Centre for Polar and Ocean Research) flowing into the system
- ML predictions updating dynamically as new sensor data arrived
- A disaster simulation running a "Severe Storm" scenario with timeline, milestones, and risk assessment
- Role-based access between Admin (HQ) and Researcher (field station) views

**[Screenshots will be added here]**

---

## Features

### Live Telemetry
Every 2 seconds, the dashboard pulls the latest sensor readings for both stations. Temperature, wind speed, fuel level, power generation, battery charge — all updating in real time.

### Real Data Sources
| Source | What We Get | Refresh |
|--------|------------|---------|
| NCPOR | Live temperature, wind, pressure, humidity from station sensors | 15 min |
| Open-Meteo | Weather forecast, solar radiation for energy calculations | 10 min |
| NOAA SWPC | Aurora probability and geomagnetic Kp index | 30 min |
| NSIDC | Antarctic sea ice extent with anomaly detection | 60 min |

When live data is unavailable, the system falls back to monthly climatology averages — no broken displays.

### Machine Learning Predictions
Four models running entirely in JavaScript (no Python required):

- **Fuel Depletion** — linear regression predicting days until fuel runs out, with confidence intervals
- **Temperature Forecast** — sinusoidal fit capturing polar day/night temperature cycles
- **Generator Health** — exponential moving average scoring RPM stability (0-100)
- **Anomaly Detection** — CUSUM + z-score ensemble flagging unusual patterns across all sensors

### Disaster Simulation
Choose a scenario — severe storm, generator failure, fuel shortage, or communication loss. The simulator models:

- Realistic fuel consumption (litres per hour based on generator load)
- Battery drain under reduced power
- Indoor temperature decay when heating fails
- Milestone tracking (blackout risk, freeze risk, crew safety thresholds)
- Risk scoring with recommended actions

### Operations Management
- **Energy Optimization** — 24-hour schedule balancing solar, wind, and diesel generation
- **Logistics** — inventory tracking with automatic resupply recommendations when stock drops below threshold
- **Weather** — 7-day forecast with aurora probability and sea ice conditions
- **Research** — experiment management, inter-station data transfers, emergency incident reporting

### Role-Based Access
- **Admin (HQ)** — full dashboard, station management, predictions, simulation, logistics
- **Researcher (Field)** — daily logs, experiments, station connectivity, emergency declaration

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 8, Tailwind CSS v4, TypeScript 5.7 |
| API | TypeScript serverless functions (Vercel) |
| ML Models | Pure JavaScript (linear regression, EMA, CUSUM, z-score) |
| Bundling | esbuild — compiles entire backend into a single 77KB function |
| Data | NCPOR, Open-Meteo, NOAA SWPC, NSIDC (all free, public APIs) |
| Database | In-memory ring-buffer store (swappable for PostgreSQL) |

---

## Getting Started

### Prerequisites
- **Node.js 22+**
- **pnpm** (package manager)

### Clone & Run

```bash
git clone https://github.com/aarbha/ANTARIS.git
cd antaris
pnpm install
pnpm dev:full
```

Open **http://localhost:8443** in your browser.

### Demo Credentials

| Role | Email | Station |
|------|-------|---------|
| Admin | `admin@antarctic-ops.in` | All |
| Researcher | `researcher@antarctic-ops.in` | Maitri |
| Researcher | `bharati@antarctic-ops.in` | Bharati |

Any password works — this is a demo.

---

## Project Structure

```
antaris/
├── src/                  # Frontend (React)
│   ├── pages/            # 15 page components
│   ├── context/          # Global state + live polling
│   └── lib/              # API client
├── lib/                  # Shared server logic
│   ├── simulator.ts      # Physics-based telemetry generator
│   ├── predictor.ts      # ML models (4 algorithms)
│   ├── ncpor.ts          # NCPOR live data scraper
│   ├── openmeteo.ts      # Open-Meteo weather client
│   ├── aurora.ts         # NOAA aurora data
│   └── seaicedata.ts     # NSIDC sea ice
├── server/
│   └── handler.ts        # All API routes (577 lines)
├── api/
│   └── [...slug].js      # Bundled serverless function
└── scripts/
    ├── build-api.mjs     # esbuild bundler
    ├── dev-api.ts        # Local API server
    └── smoke-test.mjs    # 22-endpoint validator
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/stations` | All station metadata |
| GET | `/api/telemetry/latest?station=` | Live sensor readings |
| GET | `/api/telemetry/history?station=&metric=&hours=` | Historical data |
| GET | `/api/predict/fuel?station_id=` | Fuel depletion forecast |
| GET | `/api/predict/temperature?station_id=` | Temperature forecast |
| GET | `/api/predict/rpm-health?station_id=` | Generator health score |
| GET | `/api/predict/anomalies?station_id=` | Anomaly detection |
| GET | `/api/predict/ensemble?station_id=` | Ensemble anomaly score |
| GET | `/api/predict/model-accuracy` | ML model accuracy |
| GET | `/api/energy/optimize?station_id=` | Energy schedule optimization |
| GET | `/api/energy/savings?station_id=` | Annual savings projection |
| GET | `/api/logistics?action=inventory` | Station inventory |
| GET | `/api/logistics?action=resupply` | Resupply recommendations |
| GET | `/api/logistics?action=sustainability` | Renewable energy metrics |
| GET | `/api/routes` | Shipping routes |
| GET | `/api/seaice?action=conditions&station_id=` | Sea ice conditions |
| GET | `/api/weather?station_id=` | Weather forecast |
| GET | `/api/aurora?station_id=` | Aurora probability |
| POST | `/api/simulation/whatif` | Run disaster simulation |
| POST | `/api/fault` | Inject station fault |

---

## How It Works

```
Browser (React)  ──2s poll──>  API Server  ──>  NCPOR / Open-Meteo / NOAA / NSIDC
     │                              │
     │◄──── live telemetry ─────────┤
     │◄──── ML predictions ─────────┤  (computed from in-memory store)
     │◄──── simulation results ─────┤
     │                              │
     ▼                              ▼
  Dashboard               lib/ (shared logic)
  (live updates)          simulator, predictor, store
```

1. Frontend polls the API every 2 seconds for both stations
2. API handler runs in a Vercel serverless function (or local dev server)
3. External data (NCPOR, Open-Meteo) is fetched with intelligent caching
4. ML predictions are computed from the in-memory telemetry history
5. Simulation engine runs physics-based models for disaster scenarios

---

## Acknowledgements

- **NCPOR** — National Centre for Polar and Ocean Research, Ministry of Earth Sciences, Government of India — for live Antarctic station data
- **Open-Meteo** — Free weather forecast API
- **NOAA SWPC** — Space Weather Prediction Center for aurora and geomagnetic data
- **NSIDC** — National Snow and Ice Data Center for sea ice extent
- **COMNAP** — Council of Managers of Antarctic Programs for station metadata
