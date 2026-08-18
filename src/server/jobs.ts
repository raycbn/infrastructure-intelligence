import { sql } from "drizzle-orm";
import { db, pool } from "@/server/db";
import { jobs } from "@/server/db/schema";
export async function enqueue(tenantId: string, type: string, payload: Record<string, unknown>) { const [job] = await db.insert(jobs).values({ tenantId, type, payload }).returning(); return job; }
export async function claimJob() { const result = await pool.query(`UPDATE jobs SET status='running', locked_at=now(), attempts=attempts+1, updated_at=now() WHERE id=(SELECT id FROM jobs WHERE status='queued' AND run_at<=now() ORDER BY run_at FOR UPDATE SKIP LOCKED LIMIT 1) RETURNING *`); const job = result.rows[0] as { id: string; type: string; payload: Record<string, unknown> } | undefined; if (job) console.log(`[worker] job_claimed job_id=${job.id} type=${job.type}`); return job; }
export async function finishJob(id: string, error?: unknown) { await pool.query("UPDATE jobs SET status=$2, last_error=$3, updated_at=now() WHERE id=$1", [id, error ? "failed" : "completed", error ? String(error).slice(0, 1000) : null]); console.log(`[worker] job_${error ? "failed" : "completed"} job_id=${id}`); }
