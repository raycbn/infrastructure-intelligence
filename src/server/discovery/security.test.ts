import { describe, expect, it } from "vitest";
import { isBlockedIp, isInScope, normalizeDomain } from "./security";
describe("SSRF controls", () => {
  it("blocks non-public IPv4", () => { ["127.0.0.1", "10.0.0.1", "172.16.0.1", "192.168.1.1", "169.254.169.254", "224.0.0.1", "100.64.0.1", "0.0.0.0"].forEach(ip => expect(isBlockedIp(ip)).toBe(true)); expect(isBlockedIp("8.8.8.8")).toBe(false); });
  it("blocks sensitive IPv6", () => { ["::1", "fc00::1", "fe80::1", "ff02::1"].forEach(ip => expect(isBlockedIp(ip)).toBe(true)); });
  it("does not permit scope escape or direct IP input", () => { expect(isInScope("api.example.com", "example.com")).toBe(true); expect(isInScope("evil-example.com", "example.com")).toBe(false); expect(() => normalizeDomain("127.0.0.1")).toThrow(); });
});
