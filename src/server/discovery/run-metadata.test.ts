import { describe, expect, it } from "vitest";
import { withWorkerMetadata } from "./run";

describe("worker discovery metadata", () => {
  it("preserves pipeline and worker provenance in the run summary", () => {
    expect(withWorkerMetadata({ candidates: 2 }, {
      pipelineVersion: "2.1-ct-fallback",
      workerId: "host:123:worker",
      workerStartedAt: "2026-08-18T13:00:00.000Z",
      workerSource: "src/server/discovery/run.ts",
    })).toMatchObject({
      discovery_pipeline_version: "2.1-ct-fallback",
      worker_id: "host:123:worker",
      worker_started_at: "2026-08-18T13:00:00.000Z",
      worker_source: "src/server/discovery/run.ts",
    });
  });

  it("keeps historical summaries compatible when no worker context exists", () => {
    expect(withWorkerMetadata({ candidates: 0 })).toEqual({ candidates: 0, discovery_pipeline_version: "2.1-ct-fallback" });
  });
});
