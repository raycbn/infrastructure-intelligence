import { describe, expect, it } from "vitest";
import { fingerprint } from "../fingerprinting";
describe("technology stage contract", () => {
  it("maps HTTP evidence to technologies and security signals", () => { const result = fingerprint({ headers: { "x-vercel-id": "abc", "strict-transport-security": "max-age=1" }, body: '<script src="/_next/static/chunk.js"></script>' }); expect(result.technologies.map(x => x.slug)).toEqual(expect.arrayContaining(["vercel", "nextjs"])); expect(result.securitySignals).toEqual(["strict-transport-security"]); });
  it("keeps technology and provider categories separate", () => { const result = fingerprint({ headers: { "cf-ray": "abc", "cf-cache-status": "hit" } }); expect(result.technologies[0].slug).toBe("cloudflare"); expect(result.technologies[0].category).toBe("infrastructure"); });
});
