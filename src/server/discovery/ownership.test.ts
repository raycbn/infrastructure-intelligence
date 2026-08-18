import { describe, expect, it } from "vitest";
import { ownershipForHostname } from "./normalize";

describe("ownership classification", () => {
  it("classifies root and subdomains as in scope", () => {
    expect(ownershipForHostname("pedalmap.es", "pedalmap.es")).toBe("in_scope");
    expect(ownershipForHostname("www.pedalmap.es", "pedalmap.es")).toBe("in_scope");
    expect(ownershipForHostname("199.36.158.100", "pedalmap.es")).toBe("unknown");
  });
  it("classifies indirect DNS dependencies as external", () => {
    expect(ownershipForHostname("mx01.ionos.es", "pedalmap.es")).toBe("external");
    expect(ownershipForHostname("ns1087.ui-dns.com", "pedalmap.es")).toBe("external");
  });
  it("returns unknown for malformed input", () => {
    expect(ownershipForHostname("not a hostname", "pedalmap.es")).toBe("unknown");
  });
});
