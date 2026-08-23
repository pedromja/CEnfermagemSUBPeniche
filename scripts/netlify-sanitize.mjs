/**
 * After a Netlify production build:
 * - drop platform preview static paths
 * - copy PGLite wasm/data next to the serverless function (and to /_pglite
 *   on the CDN) so the embedded database can start.
 */
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync } from "node:fs";
import { join } from "node:path";

if (!process.env.NETLIFY) process.exit(0);

rmSync("dist/__grok", { recursive: true, force: true });

const SRC = join("node_modules", "@electric-sql", "pglite", "dist");
const FILES = ["pglite.wasm", "initdb.wasm", "pglite.data"];

function copySidecars(dest) {
  mkdirSync(dest, { recursive: true });
  for (const name of FILES) {
    cpSync(join(SRC, name), join(dest, name));
  }
}

function walkDirs(root, acc = []) {
  if (!existsSync(root)) return acc;
  acc.push(root);
  for (const name of readdirSync(root)) {
    const p = join(root, name);
    try {
      if (statSync(p).isDirectory()) walkDirs(p, acc);
    } catch {
      /* ignore */
    }
  }
  return acc;
}

copySidecars(join("dist", "_pglite"));

const dests = new Set();
for (const root of [".netlify", "dist", ".output"]) {
  for (const dir of walkDirs(root)) {
    const base = dir.replace(/\\/g, "/");
    if (
      base.endsWith("/_libs") ||
      base.endsWith("/functions-internal") ||
      /\/functions-internal\/[^/]+$/.test(base)
    ) {
      dests.add(dir);
    }
  }
}

for (const dest of dests) copySidecars(dest);
