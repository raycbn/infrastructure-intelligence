import { describe, expect, it, vi } from "vitest";
import { runTechnologyStage } from "./technology-stage";
import { persistTechnologySignals } from "../technology-store";

vi.mock("../technology-store", () => ({ persistTechnologySignals: vi.fn().mockResolvedValue(undefined) }));

describe("productive HTTP → technology integration", () => {
  it("passes a mocked HTTP response through technology-stage and technology-store", async () => {
    const result = await runTechnologyStage({
      headers: { server: "Vercel", "x-vercel-id": "test-vercel-id", "content-type": "text/html", "strict-transport-security": "max-age=31536000", "content-security-policy": "default-src 'self'", "x-frame-options": "DENY" },
      body: '<html><script src="/_next/static/chunks/app.js"></script><script src="/_next/static/chunks/app.js"></script><script src="https://www.googletagmanager.com/gtag/js?id=TEST"></script></html>',
      hostname: "example.com",
    }, { tenantId: "tenant", scopeId: "scope", runId: "run", serviceId: "service" });
    expect(result.status).toBe("OK");
    expect(result.technologies.map(t => t.slug)).toEqual(expect.arrayContaining(["vercel", "nextjs", "google-tag-manager"]));
    expect(result.security_signals).toEqual(expect.arrayContaining(["strict-transport-security", "content-security-policy", "x-frame-options"]));
    expect(result.technologies.some(t => t.slug === "strict-transport-security")).toBe(false);
    expect(vi.mocked(persistTechnologySignals)).toHaveBeenCalledTimes(1);
    const call = vi.mocked(persistTechnologySignals).mock.calls[0][0];
    expect(call.serviceId).toBe("service");
    expect(call.signals).toHaveLength(3);
    expect(call.signals.every(signal => signal.confidence > 0)).toBe(true);
    expect(call.signals.every(signal => signal.evidence)).toBe(true);
  });
});
