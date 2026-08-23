import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PUBLISHED_ORIGIN } from "@/lib/report/paper";

const FILES = ["pglite.wasm", "initdb.wasm", "pglite.data"] as const;

type SidecarOpts = {
  pgliteWasmModule: WebAssembly.Module;
  initdbWasmModule: WebAssembly.Module;
  fsBundle: Blob;
};

function isNetlifyHost(): boolean {
  const url = `${process.env.URL ?? ""} ${process.env.DEPLOY_PRIME_URL ?? ""} ${process.env.SITE_NAME ?? ""}`;
  return Boolean(process.env.NETLIFY || process.env.SITE_ID || /netlify/i.test(url));
}

function candidateDirs(): string[] {
  const dirs: string[] = [];
  try {
    dirs.push(dirname(fileURLToPath(import.meta.url)));
  } catch {
    /* bundled without file URL */
  }
  const cwd = process.cwd();
  dirs.push(
    join(cwd, "_libs"),
    join(cwd, "_pglite"),
    cwd,
    "/var/task/_libs",
    "/var/task/_pglite",
    "/var/task",
  );
  return dirs;
}

async function readSidecarsFromDir(
  dir: string,
): Promise<{ wasm: Buffer; initdb: Buffer; data: Buffer } | null> {
  const paths = FILES.map((name) => join(dir, name));
  if (!paths.every((p) => existsSync(p))) return null;
  const [wasm, initdb, data] = await Promise.all(paths.map((p) => readFile(p)));
  return { wasm, initdb, data };
}

function publicOrigins(): string[] {
  const origins = [
    process.env.DEPLOY_PRIME_URL,
    process.env.URL,
    process.env.SITE_NAME ? `https://${process.env.SITE_NAME}.netlify.app` : "",
    PUBLISHED_ORIGIN,
  ]
    .map((v) => (v ?? "").trim().replace(/\/$/, ""))
    .filter((v) => v.startsWith("http"));
  return [...new Set(origins)];
}

async function fetchSidecars(): Promise<{
  wasm: Buffer;
  initdb: Buffer;
  data: Buffer;
} | null> {
  for (const base of publicOrigins()) {
    try {
      const [wasmRes, initdbRes, dataRes] = await Promise.all(
        FILES.map((name) => fetch(`${base}/_pglite/${name}`)),
      );
      if (![wasmRes, initdbRes, dataRes].every((r) => r.ok)) continue;
      const [wasm, initdb, data] = await Promise.all([
        wasmRes.arrayBuffer(),
        initdbRes.arrayBuffer(),
        dataRes.arrayBuffer(),
      ]);
      return {
        wasm: Buffer.from(wasm),
        initdb: Buffer.from(initdb),
        data: Buffer.from(data),
      };
    } catch {
      /* try next origin */
    }
  }
  return null;
}

export async function pgliteWasmOptions(): Promise<SidecarOpts | undefined> {
  let raw: { wasm: Buffer; initdb: Buffer; data: Buffer } | null = null;
  for (const dir of candidateDirs()) {
    raw = await readSidecarsFromDir(dir);
    if (raw) break;
  }
  raw ??= await fetchSidecars();
  if (!raw) {
    if (isNetlifyHost()) {
      throw new Error(
        "PGLite WASM em falta na Netlify. Confirme que o deploy inclui /_pglite/.",
      );
    }
    return undefined;
  }

  const [pgliteWasmModule, initdbWasmModule] = await Promise.all([
    WebAssembly.compile(Uint8Array.from(raw.wasm)),
    WebAssembly.compile(Uint8Array.from(raw.initdb)),
  ]);
  return {
    pgliteWasmModule,
    initdbWasmModule,
    fsBundle: new Blob([Uint8Array.from(raw.data)]),
  };
}
