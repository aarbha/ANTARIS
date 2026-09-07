/**
 * Local dev API shim — runs Vercel handler modules on http://localhost:8001
 * Usage: npx tsx scripts/dev-api.ts
 * Then: pnpm dev (separate terminal) — Vite proxy forwards /api/* to :8001
 */
import { createServer, type IncomingMessage, type ServerResponse } from "node:http"
import { join } from "node:path"
import { pathToFileURL } from "node:url"

// Route map: path pattern → handler module path (relative to project root)
const ROUTES: [RegExp, string][] = [
  [/^\/api\/health$/, "./api/health"],
  [/^\/api\/stations\/(\w+)$/, "./api/stations/[id]"],
  [/^\/api\/stations$/, "./api/stations"],
  [/^\/api\/telemetry\/latest$/, "./api/telemetry/latest"],
  [/^\/api\/telemetry\/history$/, "./api/telemetry/history"],
  [/^\/api\/predict\/fuel$/, "./api/predict/fuel"],
  [/^\/api\/predict\/temperature$/, "./api/predict/temperature"],
  [/^\/api\/predict\/rpm-health$/, "./api/predict/rpm-health"],
  [/^\/api\/predict\/anomalies$/, "./api/predict/anomalies"],
  [/^\/api\/predict\/model-accuracy$/, "./api/predict/model-accuracy"],
  [/^\/api\/predict\/ensemble$/, "./api/predict/ensemble"],
  [/^\/api\/alerts$/, "./api/alerts"],
  [/^\/api\/energy\/optimize$/, "./api/energy/optimize"],
  [/^\/api\/energy\/savings$/, "./api/energy/savings"],
  [/^\/api\/logistics$/, "./api/logistics"],
  [/^\/api\/routes$/, "./api/routes"],
  [/^\/api\/seaice$/, "./api/seaice"],
  [/^\/api\/simulation\/whatif$/, "./api/simulation/whatif"],
  [/^\/api\/fault$/, "./api/fault"],
  [/^\/api\/weather$/, "./api/weather"],
  [/^\/api\/aurora$/, "./api/aurora"],
]

// Cache loaded handlers
const handlerCache = new Map<string, any>()

async function loadHandler(modulePath: string): Promise<any> {
  if (handlerCache.has(modulePath)) return handlerCache.get(modulePath)
  const fullPath = pathToFileURL(join(process.cwd(), modulePath)).href
  const mod = await import(fullPath)
  const handler = mod.default
  handlerCache.set(modulePath, handler)
  return handler
}

function parseQuery(url: string): Record<string, string> {
  const q: Record<string, string> = {}
  const idx = url.indexOf("?")
  if (idx === -1) return q
  const search = url.slice(idx + 1)
  for (const pair of search.split("&")) {
    const [k, v] = pair.split("=")
    if (k) q[decodeURIComponent(k)] = v ? decodeURIComponent(v) : ""
  }
  return q
}

function readBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve) => {
    const chunks: Buffer[] = []
    req.on("data", (c) => chunks.push(c))
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString()
      if (!raw) return resolve({})
      try { resolve(JSON.parse(raw)) } catch { resolve({}) }
    })
  })
}

const PORT = parseInt(process.env.API_PORT || "8001")

const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
  const url = req.url || "/"
  const pathname = url.split("?")[0] || "/"

  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")
  if (req.method === "OPTIONS") { res.writeHead(204); res.end(); return }

  // Find matching route
  let matchedHandler: string | null = null
  let matchParams: Record<string, string> = {}

  for (const [pattern, modulePath] of ROUTES) {
    const m = pathname.match(pattern)
    if (m) {
      matchedHandler = modulePath
      if (m[1]) matchParams.id = m[1]
      break
    }
  }

  if (!matchedHandler) {
    res.writeHead(404, { "Content-Type": "application/json" })
    res.end(JSON.stringify({ error: `No route: ${pathname}` }))
    return
  }

  try {
    const handler = await loadHandler(matchedHandler)
    const query = parseQuery(url)
    Object.assign(query, matchParams)
    const body = req.method === "POST" || req.method === "PUT" ? await readBody(req) : {}

    // Build VercelRequest-like object
    const vReq = {
      method: req.method,
      query,
      body,
      url: url,
      headers: req.headers,
    }

    // Build VercelResponse-like object
    const vRes: any = {
      _status: 200,
      _headers: new Map<string, string>(),
      _body: null,
      status(code: number) { vRes._status = code; return vRes },
      json(data: any) { vRes._body = data; vRes._end() },
      setHeader(k: string, v: string) { vRes._headers.set(k, v) },
      _end() {
        const headers: Record<string, string> = { "Content-Type": "application/json" }
        vRes._headers.forEach((v: string, k: string) => { headers[k] = v })
        res.writeHead(vRes._status, headers)
        res.end(JSON.stringify(vRes._body))
      },
    }

    await handler(vReq, vRes)
  } catch (err: any) {
    console.error(`[api-shim] Error in ${pathname}:`, err?.message || err)
    res.writeHead(500, { "Content-Type": "application/json" })
    res.end(JSON.stringify({ error: err?.message || "Internal error" }))
  }
})

server.listen(PORT, () => {
  console.log(`[api-shim] API server running at http://localhost:${PORT}`)
  console.log(`[api-shim] Routes: ${ROUTES.length} endpoints mapped`)
})
