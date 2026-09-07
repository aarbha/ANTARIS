/**
 * Local dev API shim — runs the Vercel catch-all handler on http://localhost:8001
 * Usage: npx tsx scripts/dev-api.ts
 * Then: pnpm dev (separate terminal) — Vite proxy forwards /api/* to :8001
 */
import { createServer, type IncomingMessage, type ServerResponse } from "node:http"
import { join } from "node:path"
import { pathToFileURL } from "node:url"

const HANDLER_PATH = "./server/handler.ts"

let cachedHandler: any = null

async function loadHandler(): Promise<any> {
  if (cachedHandler) return cachedHandler
  const fullPath = pathToFileURL(join(process.cwd(), HANDLER_PATH)).href
  const mod = await import(fullPath)
  cachedHandler = mod.default
  return cachedHandler
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

  // Strip /api prefix → slug is the rest
  const slugPath = pathname.replace(/^\/api\//, "").replace(/^\//, "")
  const slug = slugPath ? slugPath.split("/") : []

  try {
    const handler = await loadHandler()
    const query = parseQuery(url)
    query.slug = slug
    const body = req.method === "POST" || req.method === "PUT" ? await readBody(req) : {}

    const vReq = {
      method: req.method,
      query,
      body,
      url: url,
      headers: req.headers,
    }

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
  console.log(`[api-shim] Catch-all handler: ${HANDLER_PATH}`)
})
