import { describe, expect, it } from "vitest";
import { fingerprint } from "./fingerprinting";
describe("technology fingerprinting", () => {
  it("detects deterministic header technologies", () => { const r = fingerprint({ headers: { "cf-ray": "x", "cf-cache-status": "hit", "x-vercel-id": "x", server: "Express" } }); expect(r.technologies.map(x => x.slug)).toEqual(expect.arrayContaining(["cloudflare", "vercel", "express"])); });
  it("detects HTML markers and security signals", () => { const r = fingerprint({ body: '<meta name="generator" content="WordPress"><script src="/_next/static/a.js"></script><script src="https://www.googletagmanager.com/gtag/js"></script>', headers: { "strict-transport-security": "max-age=1" } }); expect(r.technologies.map(x => x.slug)).toEqual(expect.arrayContaining(["wordpress", "nextjs", "google-tag-manager"])); expect(r.securitySignals).toContain("strict-transport-security"); });
  it("does not detect generic words and truncates large bodies", () => { const r = fingerprint({ body: `${"react cloud google ".repeat(100)}${"x".repeat(600000)}` }); expect(r.technologies).toHaveLength(0); expect(r.truncated).toBe(true); });
});
