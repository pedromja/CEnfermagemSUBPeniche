import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const FILES = ["pglite.wasm", "initdb.wasm", "pglite.data"] as const;

type SidecarOpts = {
  pgliteWasmModule: WebAssembly.Module;
  initdbWasmModule: WebAssembly.Module;
  fsBundle: Blob;
};

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

async function fetchSidecars(): Promise<{
  wasm: Buffer;
  initdb: Buffer;
  data: Buffer;
} | null> {
  const base = (
    process.env.DEPLOY_PRIME_URL ||
    process.env.URL ||
    ""
  ).replace(/\/$/, "");
  if (!base.startsWith("http")) return null;
  try {
    const [wasmRes, initdbRes, dataRes] = await Promise.all(
      FILES.map((name) => fetch(`${base}/_pglite/${name}`)),
    );
    if (![wasmRes, initdbRes, dataRes].every((r) => r.ok)) return null;
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
    return null;
  }
}

export async function pgliteWasmOptions(): Promise<SidecarOpts | undefined> {
  let raw: { wasm: Buffer; initdb: Buffer; data: Buffer } | null = null;
  for (const dir of candidateDirs()) {
    raw = await readSidecarsFromDir(dir);
    if (raw) break;
  }
  raw ??= await fetchSidecars();
  if (!raw) return undefined;

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
