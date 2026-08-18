import { afterEach, describe, expect, it, vi } from "vitest";
import { lookupRdap, normalizeRdapIp, parseRdap, selectRdapEndpoint } from "./rdap";
afterEach(() => vi.unstubAllGlobals());
const response = (body: unknown, status = 200) => ({ ok: status >= 200 && status < 300, status, text: async () => JSON.stringify(body) });
const bootstrap = { services: [[["199.0.0.0/8"], ["https://registry.example/rdap/"]]] };
describe("RDAP bootstrap and parsing", () => {
  it("selects IPv4 and IPv6 registry endpoints", () => { expect(selectRdapEndpoint("199.36.158.100", bootstrap)).toBe("https://registry.example/rdap"); expect(selectRdapEndpoint("2001:db8::1", { services: [[["2001:db8::/32"], ["https://v6.example/rdap/"]]] })).toBe("https://v6.example/rdap"); });
  it("accepts public addresses and rejects private ones", () => { expect(normalizeRdapIp("199.36.158.100")).toBe("199.36.158.100"); expect(() => normalizeRdapIp("10.0.0.1")).toThrow(); });
  it("extracts network, CIDR, organization and ASN", () => { const result = parseRdap("199.36.158.100", { startAddress: "199.36.0.0", endAddress: "199.36.255.255", cidr0_cidrs: [{ v4prefix: "199.36.0.0", length: 16 }], name: "Google LLC", asn: 15169, country: "US" }); expect(result.status).toBe("success"); expect(result.network?.cidr).toBe("199.36.0.0/16"); expect(result.organization).toBe("Google LLC"); expect(result.asns).toContain("15169"); });
  it("extracts organization from vCard entities without making it a provider", () => { const result = parseRdap("8.8.8.8", { startAddress: "8.8.8.0", entities: [{ vcardArray: ["vcard", [["fn", {}, "text", "Google LLC"]]] }] }); expect(result.organization).toBe("Google LLC"); });
});
describe("RDAP transport", () => {
  it("performs bootstrap then registry lookup", async () => { vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(response(bootstrap)).mockResolvedValueOnce(response({ startAddress: "199.36.0.0", endAddress: "199.36.255.255", name: "Example Network" }))); const result = await lookupRdap("199.36.158.100"); expect(result.status).toBe("success"); expect(vi.mocked(fetch).mock.calls[1][0]).toBe("https://registry.example/rdap/ip/199.36.158.100"); });
  it.each([400, 404, 429, 500, 503])("handles HTTP %s", async status => { vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response({}, status))); expect((await lookupRdap("8.8.8.8")).status).toBe("http_error"); });
  it("handles malformed JSON and timeout", async () => { vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, text: async () => "bad" })); expect((await lookupRdap("8.8.8.8")).status).toBe("malformed"); vi.stubGlobal("fetch", vi.fn().mockRejectedValue(Object.assign(new Error("aborted"), { name: "AbortError" }))); expect((await lookupRdap("8.8.8.8")).status).toBe("timeout"); });
});
