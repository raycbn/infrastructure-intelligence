import { describe, expect, it, vi, afterEach } from "vitest";
import { lookupRdap, normalizeRdapIp, parseRdap } from "./rdap";
afterEach(() => vi.unstubAllGlobals());
describe("RDAP", () => {
  it("accepts public IPv4 and IPv6 only", () => { expect(normalizeRdapIp("199.36.158.100")).toBe("199.36.158.100"); expect(normalizeRdapIp("2001:4860:4860::8888")).toBe("2001:4860:4860::8888"); expect(() => normalizeRdapIp("10.0.0.1")).toThrow(); });
  it("extracts network, organization and ASN", () => { const result = parseRdap("199.36.158.100", { startAddress: "199.36.0.0", endAddress: "199.36.255.255", cidr0_cidrs: [{ v4prefix: "199.36.0.0", length: 16 }], name: "Google LLC", asn: 15169, country: "US" }); expect(result.status).toBe("success"); expect(result.organization).toBe("Google LLC"); expect(result.asns).toContain("15169"); expect(result.network?.startAddress).toBe("199.36.0.0"); });
  it.each([404, 429, 503])("handles HTTP %s", async (status) => { vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status })); expect((await lookupRdap("8.8.8.8")).status).toBe("http_error"); });
  it("handles malformed JSON and timeout", async () => { vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, text: async () => "bad" })); expect((await lookupRdap("8.8.8.8")).status).toBe("malformed"); vi.stubGlobal("fetch", vi.fn().mockRejectedValue(Object.assign(new Error("aborted"), { name: "AbortError" }))); expect((await lookupRdap("8.8.8.8")).status).toBe("timeout"); });
});
