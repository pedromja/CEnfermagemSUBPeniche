#!/usr/bin/env node
/**
 * Nitro's cloudflare-pages preset writes pages_build_output_dir, which makes
 * `wrangler deploy` fail with "Missing entry-point". Rewrite the generated
 * config so Cloudflare Workers Git deploys with `npx wrangler deploy`.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const path = join(root, "dist/_worker.js/wrangler.json");

const current = JSON.parse(readFileSync(path, "utf8"));
const next = {
  name: process.env.CF_WORKER_NAME || current.name || "cenfermagemsubpeniche",
  compatibility_date: current.compatibility_date || "2026-08-26",
  compatibility_flags: current.compatibility_flags || ["nodejs_compat"],
  main: "./index.js",
  assets: {
    directory: "..",
    binding: "ASSETS",
  },
};
writeFileSync(path, `${JSON.stringify(next, null, 2)}\n`);
console.log("[cf] wrangler.json preparado para wrangler deploy");
