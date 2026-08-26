import type { PGlite } from "@electric-sql/pglite";

export const BLOB_STORE = "relatorio-ce";
export const DUMP_KEY = "pglite-dump";

function blobsEnabled(): boolean {
  return Boolean(
    process.env.NETLIFY ||
      process.env.SITE_ID ||
      process.env.NETLIFY_BLOBS_CONTEXT,
  );
}

export async function getBlobStore() {
  if (!blobsEnabled()) return null;
  try {
    const { getStore } = await import("@netlify/blobs");
    return getStore(BLOB_STORE);
  } catch (err) {
    console.error("[persist] Netlify Blobs indisponível:", err);
    return null;
  }
}

export async function loadPgliteDump(): Promise<Blob | undefined> {
  const store = await getBlobStore();
  if (!store) return undefined;
  try {
    const blob = await store.get(DUMP_KEY, { type: "blob" });
    return blob ?? undefined;
  } catch (err) {
    console.error("[persist] leitura da base falhou:", err);
    return undefined;
  }
}

export async function savePgliteDump(pg: PGlite): Promise<void> {
  const store = await getBlobStore();
  if (!store) return;
  const dump = await pg.dumpDataDir("gzip");
  await store.set(DUMP_KEY, dump);
}

let persistTimer: ReturnType<typeof setTimeout> | undefined;
let persistChain: Promise<void> = Promise.resolve();

export function schedulePgliteDump(pg: PGlite): void {
  if (!blobsEnabled()) return;
  if (persistTimer) clearTimeout(persistTimer);
  persistTimer = setTimeout(() => {
    persistChain = persistChain
      .catch(() => undefined)
      .then(() => savePgliteDump(pg))
      .catch((err) => {
        console.error("[persist] gravação da base falhou:", err);
      });
  }, 400);
}

export async function flushPgliteDump(pg: PGlite): Promise<void> {
  if (persistTimer) {
    clearTimeout(persistTimer);
    persistTimer = undefined;
  }
  if (!blobsEnabled()) return;
  persistChain = persistChain
    .catch(() => undefined)
    .then(() => savePgliteDump(pg));
  await persistChain;
}

export async function loadJsonBlob<T>(key: string): Promise<T | null> {
  const store = await getBlobStore();
  if (!store) return null;
  try {
    const value = await store.get(key, { type: "json" });
    return (value as T) ?? null;
  } catch (err) {
    console.error("[persist] leitura JSON falhou:", err);
    return null;
  }
}

export async function saveJsonBlob(key: string, value: unknown): Promise<void> {
  const store = await getBlobStore();
  if (!store) return;
  await store.setJSON(key, value);
}
