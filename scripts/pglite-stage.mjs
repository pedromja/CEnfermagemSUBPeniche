/**
 * Copy PGLite WASM/data into public/_pglite before the Vite build so they
 * ship with the static site on Netlify.
 */
import { cpSync, mkdirSync } from "node:fs";
import { join } from "node:path";

if (!process.env.NETLIFY) process.exit(0);

const src = join("node_modules", "@electric-sql", "pglite", "dist");
const dest = join("public", "_pglite");
mkdirSync(dest, { recursive: true });
for (const name of ["pglite.wasm", "initdb.wasm", "pglite.data"]) {
  cpSync(join(src, name), join(dest, name));
}
