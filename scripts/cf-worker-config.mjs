#!/usr/bin/env node
/**
 * Nitro's cloudflare-pages preset writes pages_build_output_dir, which makes
 * `wrangler deploy` fail with "Missing entry-point". Rewrite the generated
 * config so Cloudflare Workers Git deploys with `npx wrangler deploy --no-bundle`.
 *
 * Static files are copied to dist/cf-assets without `_worker.js`, so Wrangler
 * does not treat the server bundle as a public asset.
 */
import {
  cpSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SKIP = new Set([
  "_worker.js",
  "_routes.json",
  "_headers",
  "_redirects",
  "nitro.json",
  "cf-assets",
  ".assetsignore",
  ".wrangler",
]);

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const assetsOut = join(dist, "cf-assets");
mkdirSync(assetsOut, { recursive: true });
for (const name of readdirSync(dist)) {
  if (SKIP.has(name)) continue;
  cpSync(join(dist, name), join(assetsOut, name), { recursive: true });
}
writeFileSync(join(assetsOut, ".assetsignore"), "\n");
writeFileSync(join(dist, ".assetsignore"), "_worker.js\ncf-assets\n");

const ssrPath = join(dist, "_worker.js/_ssr/ssr.mjs");
writeFileSync(
  ssrPath,
  readFileSync(ssrPath, "utf8").replace(", ssr_exports as p", ""),
);

const path = join(dist, "_worker.js/wrangler.json");
const current = JSON.parse(readFileSync(path, "utf8"));
const next = {
  name: "cenfermagemsubpeniche",
  compatibility_date: current.compatibility_date || "2026-08-26",
  compatibility_flags: current.compatibility_flags || ["nodejs_compat"],
  main: "./index.js",
  find_additional_modules: true,
  rules: [
    { type: "ESModule", globs: ["**/*.mjs", "**/*.js"] },
  ],
  assets: {
    directory: "../cf-assets",
    binding: "ASSETS",
  },
};
writeFileSync(path, `${JSON.stringify(next, null, 2)}\n`);
console.log("[cf] wrangler.json e cf-assets preparados para wrangler deploy");
