import type { VercelRequest, VercelResponse } from "@vercel/node"
import { store } from "./lib/store"

export default function handler(req: VercelRequest, res: VercelResponse) {
  store.init()
  res.json({ status: "ok", timestamp: new Date().toISOString() })
}
