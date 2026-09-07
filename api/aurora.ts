import type { VercelRequest, VercelResponse } from "@vercel/node"
import { getAuroraData, getKpIndex } from "./lib/aurora"

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const stationId = (req.query.station_id as string) || "maitri"

  const [aurora, kp] = await Promise.all([getAuroraData(), getKpIndex()])

  res.json({
    station_id: stationId,
    aurora_probability: aurora?.data?.[stationId] ?? 0,
    kp_index: kp?.kp_current ?? 0,
    kp_label: kp?.kp_label ?? "Unknown",
    observation_time: aurora?.observation_time ?? null,
    forecast_time: aurora?.forecast_time ?? null,
    source: "NOAA SWPC OVATION",
  })
}
