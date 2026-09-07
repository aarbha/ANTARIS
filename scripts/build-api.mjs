import { build } from "esbuild"

await build({
  entryPoints: ["server/handler.ts"],
  bundle: true,
  platform: "node",
  target: "node22",
  format: "esm",
  outfile: "api/[...slug].mjs",
  packages: "external",
})

console.log("API handler bundled -> api/[...slug].mjs")
