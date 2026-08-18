import dotenv from "dotenv";
import { resolve } from "node:path";

// Load local files before dynamically importing jobs/discovery, which import the
// database singleton. Existing process environment variables always win.
dotenv.config({ path: resolve(process.cwd(), ".env.local") });
dotenv.config({ path: resolve(process.cwd(), ".env") });

async function tick(workerContext: { workerId: string; workerStartedAt: string; workerSource: string; pipelineVersion: string }) {
  console.log("[worker] polling");
  const [{ claimJob, finishJob }, { executeDiscovery, DISCOVERY_PIPELINE_VERSION }] = await Promise.all([
    import("@/server/jobs"),
    import("@/server/discovery/run"),
  ]);
  const job = await claimJob();
  if (process.argv.includes("--once")) console.log(`[worker] pipeline=${DISCOVERY_PIPELINE_VERSION} cwd=${process.cwd()} source=src/server/discovery/run.ts`);
  if (!job) return false;
  try {
    if (job.type === "discovery") await executeDiscovery(String(job.payload.runId), workerContext);
    else throw new Error("Unsupported job type");
    await finishJob(job.id);
  } catch (error) {
    await finishJob(job.id, error);
  }
  return true;
}

async function main() {
  const { DISCOVERY_PIPELINE_VERSION } = await import("@/server/discovery/run");
  const { acquireWorkerLock, releaseWorkerLock } = await import("@/server/worker-lock");
  const lock = await acquireWorkerLock();
  if (!lock) { console.error("Another Infrastructure Intelligence worker is already running."); process.exitCode = 1; return; }
  const workerContext = { workerId: lock.workerId, workerStartedAt: lock.startedAt, workerSource: "src/server/discovery/run.ts", pipelineVersion: DISCOVERY_PIPELINE_VERSION };
  console.log(`[worker] startup worker_id=${lock.workerId} pipeline=${DISCOVERY_PIPELINE_VERSION} started_at=${lock.startedAt} cwd=${process.cwd()}`);
  console.log(`[worker] lock_acquired worker_id=${lock.workerId}`);
  const shutdown = () => { void releaseWorkerLock(lock); };
  process.once("SIGINT", shutdown); process.once("SIGTERM", shutdown);
  try {
    if (process.argv.includes("--once")) { await tick(workerContext); return; }
    while (true) { if (!await tick(workerContext)) await new Promise(resolve => setTimeout(resolve, 2_000)); }
  } finally { await releaseWorkerLock(lock); console.log("[worker] worker_stopped"); }
}

main();
