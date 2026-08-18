import os from "node:os";
import crypto from "node:crypto";
import { pool } from "@/server/db";

export const WORKER_LOCK_NAME = "infrastructure-intelligence-single-worker";
export const WORKER_ID = `${os.hostname()}:${process.pid}:${crypto.randomUUID()}`;

export async function acquireWorkerLock() {
  const client = await pool.connect();
  const result = await client.query("SELECT pg_try_advisory_lock(hashtext($1)) AS acquired", [WORKER_LOCK_NAME]);
  if (!result.rows[0]?.acquired) { client.release(); return null; }
  return { client, workerId: WORKER_ID, startedAt: new Date().toISOString() };
}

export async function releaseWorkerLock(lock: { client: { query: (sql: string, values?: unknown[]) => Promise<unknown>; release: () => void } }) {
  try { await lock.client.query("SELECT pg_advisory_unlock(hashtext($1))", [WORKER_LOCK_NAME]); } finally { lock.client.release(); }
}
