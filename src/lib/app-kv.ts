import { getDbSource, getSql } from "@/lib/db";

export async function loadJsonKv<T>(key: string): Promise<T | null> {
  if (getDbSource() === "neon") {
    const sql = await getSql();
    const rows = await sql<{ value: T }>`
      select value from app_kv where key = ${key}
    `;
    return rows[0]?.value ?? null;
  }
  const { loadJsonBlob } = await import("@/lib/pglite-persist");
  return loadJsonBlob<T>(key);
}

export async function saveJsonKv(key: string, value: unknown): Promise<void> {
  if (getDbSource() === "neon") {
    const sql = await getSql();
    const encoded = JSON.stringify(value);
    await sql`
      insert into app_kv (key, value, updated_at)
      values (${key}, ${encoded}::jsonb, now())
      on conflict (key) do update set
        value = excluded.value,
        updated_at = now()
    `;
    return;
  }
  const { saveJsonBlob } = await import("@/lib/pglite-persist");
  await saveJsonBlob(key, value);
}

export async function deleteJsonKv(key: string): Promise<void> {
  if (getDbSource() === "neon") {
    const sql = await getSql();
    await sql`delete from app_kv where key = ${key}`;
    return;
  }
  try {
    const { getBlobStore } = await import("@/lib/pglite-persist");
    const store = await getBlobStore();
    await store?.delete(key);
  } catch {
    /* ignore */
  }
}
