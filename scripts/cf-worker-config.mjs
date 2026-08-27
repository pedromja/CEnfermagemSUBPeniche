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
let ssr = readFileSync(ssrPath, "utf8");
ssr = ssr.replace("ssr_exports as p", "server_default as p");
writeFileSync(ssrPath, ssr);

const ssr2Path = join(dist, "_worker.js/_ssr/ssr2.mjs");
let ssr2 = readFileSync(ssr2Path, "utf8");
ssr2 = ssr2.replace(
  `import { m as __exportAll$1 } from "./ssr.mjs";\n`,
  `var __exportAll$1 = (all) => {
	const target = {};
	for (const name in all) Object.defineProperty(target, name, { get: all[name], enumerable: true });
	return target;
};
`,
);
writeFileSync(ssr2Path, ssr2);

const rendererPath = join(dist, "_worker.js/_chunks/ssr-renderer.mjs");
let renderer = readFileSync(rendererPath, "utf8");
renderer = renderer.replace(
  `import("../_ssr/ssr.mjs").then((n) => n.p)`,
  `import("../_ssr/ssr.mjs")`,
);
writeFileSync(rendererPath, renderer);

const vars = {};
for (const key of [
  "DATABASE_URL",
  "BETTER_AUTH_SECRET",
  "BETTER_AUTH_URL",
  "VITE_AUTH_ENABLED",
]) {
  const value = process.env[key];
  if (value && value.trim()) vars[key] = value.trim();
}
vars.NITRO_PRESET = "cloudflare-pages";
vars.CF_PAGES = "1";
if (!vars.VITE_AUTH_ENABLED) vars.VITE_AUTH_ENABLED = "true";

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
  vars,
};
writeFileSync(path, `${JSON.stringify(next, null, 2)}\n`);

const indexPath = join(dist, "_worker.js/index.js");
let entry = readFileSync(indexPath, "utf8");
entry = entry.replace(
  "unhandled: true\n			}",
  "unhandled: true,\n				message: error && error.message ? String(error.message) : String(error),\n				stack: error && error.stack ? String(error.stack).slice(0, 2500) : \"\"\n			}",
);
entry = entry.replace(
  "return nitroApp.fetch(cfReq);",
  `if (env && typeof process !== "undefined" && process.env) {
			for (const key of Object.keys(env)) {
				const val = env[key];
				if (typeof val === "string") process.env[key] = val;
			}
		}
		return nitroApp.fetch(cfReq);`,
);
writeFileSync(indexPath, entry);

console.log(
  "[cf] wrangler.json com variáveis de execução:",
  Object.keys(vars).join(", "),
);
