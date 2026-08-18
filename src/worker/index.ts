import dotenv from "dotenv";
import { resolve } from "node:path";

// Load local files before dynamically importing jobs/discovery, which import the
// database singleton. Existing process environment variables always win.
dotenv.config({ path: resolve(process.cwd(), ".env.local") });
dotenv.config({ path: resolve(process.cwd(), ".env") });

async function tick() {
  const [{ claimJob, finishJob }, { executeDiscovery }] = await Promise.all([
    import("@/server/jobs"),
    import("@/server/discovery/run"),
  ]);
  const job = await claimJob();
  if (!job) return false;
  try {
    if (job.type === "discovery") await executeDiscovery(String(job.payload.runId));
    else throw new Error("Unsupported job type");
    await finishJob(job.id);
  } catch (error) {
    await finishJob(job.id, error);
  }
  return true;
}

async function main() {
  if (process.argv.includes("--once")) { await tick(); process.exit(0); }
  while (true) { if (!await tick()) await new Promise(resolve => setTimeout(resolve, 2_000)); }
}

main();
