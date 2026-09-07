#!/usr/bin/env node
/**
 * Smoke test — hits every endpoint and reports PASS/FAIL.
 * Usage: node scripts/smoke-test.mjs [BASE_URL]
 * Default: http://localhost:8001
 */
const BASE = process.argv[2] || "http://localhost:8001"

const endpoints = [
  { name: "health", path: "/api/health", method: "GET" },
  { name: "stations", path: "/api/stations", method: "GET" },
  { name: "station:maitri", path: "/api/stations/maitri", method: "GET" },
  { name: "telemetry:latest", path: "/api/telemetry/latest?station=maitri", method: "GET" },
  { name: "telemetry:history", path: "/api/telemetry/history?station=maitri&metric=outdoor_temp&hours=48", method: "GET" },
  { name: "predict:fuel", path: "/api/predict/fuel?station_id=maitri", method: "GET" },
  { name: "predict:temperature", path: "/api/predict/temperature?station_id=maitri", method: "GET" },
  { name: "predict:rpm-health", path: "/api/predict/rpm-health?station_id=maitri", method: "GET" },
  { name: "predict:anomalies", path: "/api/predict/anomalies?station_id=maitri", method: "GET" },
  { name: "predict:model-accuracy", path: "/api/predict/model-accuracy", method: "GET" },
  { name: "predict:ensemble", path: "/api/predict/ensemble?station_id=maitri", method: "GET" },
  { name: "energy:optimize", path: "/api/energy/optimize?station_id=maitri", method: "GET" },
  { name: "energy:savings", path: "/api/energy/savings?station_id=maitri", method: "GET" },
  { name: "logistics:inventory", path: "/api/logistics?action=inventory", method: "GET" },
  { name: "logistics:resupply", path: "/api/logistics?action=resupply", method: "GET" },
  { name: "logistics:sustainability", path: "/api/logistics?action=sustainability", method: "GET" },
  { name: "routes", path: "/api/routes", method: "GET" },
  { name: "seaice:conditions", path: "/api/seaice?action=conditions&station_id=maitri", method: "GET" },
  { name: "weather", path: "/api/weather?station_id=maitri", method: "GET" },
  { name: "aurora", path: "/api/aurora?station_id=maitri", method: "GET" },
  { name: "simulation:whatif", path: "/api/simulation/whatif", method: "POST", body: { station_id: "maitri", outdoor_temp: -45, storm_duration_hours: 48 } },
  { name: "fault:set", path: "/api/fault", method: "POST", body: { station_id: "maitri", mode: null } },
]

let pass = 0, fail = 0, total = endpoints.length

async function test(ep) {
  try {
    const opts = { method: ep.method, headers: { "Content-Type": "application/json" } }
    if (ep.body) opts.body = JSON.stringify(ep.body)
    const res = await fetch(`${BASE}${ep.path}`, opts)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    if (data.error) throw new Error(data.error)
    console.log(`  ✓ ${ep.name}`)
    pass++
    return data
  } catch (err) {
    console.log(`  ✗ ${ep.name}: ${err.message}`)
    fail++
    return null
  }
}

console.log(`\nSmoke test — ${BASE}\n`)

for (const ep of endpoints) {
  await test(ep)
}

console.log(`\nResults: ${pass}/${total} passed, ${fail} failed\n`)

if (fail > 0) process.exit(1)
