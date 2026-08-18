import { describe, expect, it, vi, afterEach } from "vitest";
import { certificateTransparencySources, normalizeCtNames } from "./passive";

afterEach(() => vi.unstubAllGlobals());
const response = (body: unknown, status = 200) => ({ ok: status >= 200 && status < 300, status, text: async () => JSON.stringify(body) });

describe("certificate transparency normalization", () => {
  it("removes wildcards, dots and duplicates", () => expect(normalizeCtNames([{ name_value: "*.www.example.com\nwww.example.com." }, { common_name: "api.example.com" }], "example.com")).toEqual(["api.example.com", "www.example.com"]));
  it("rejects evil suffixes and malformed hosts", () => expect(normalizeCtNames([{ name_value: "example.com.evil.com\nevil-example.com\nnot host" }], "example.com")).toEqual([]));
  it("accepts root and nested subdomains", () => expect(normalizeCtNames([{ name_value: "example.com\na.b.example.com" }], "example.com")).toEqual(["a.b.example.com", "example.com"]));
});

describe("certificate transparency sources", () => {
  it("uses primary only when crt.sh succeeds", async () => { vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response([{ name_value: "www.example.com" }]))); const result = await certificateTransparencySources("example.com"); expect(result.sources.map(s => s.source)).toEqual(["crt_sh"]); expect(result.names).toEqual(["www.example.com"]); });
  it.each([404, 502])("falls back after primary %s", async (status) => { vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(response([], status)).mockResolvedValueOnce(response([{ dns_names: ["api.example.com", "www.example.com."] }]))); const result = await certificateTransparencySources("example.com"); expect(result.sources.map(s => s.source)).toEqual(["crt_sh", "fallback_ct"]); expect(result.sources[1].status).toBe("ok"); expect(result.names).toEqual(["api.example.com", "www.example.com"]); });
  it("falls back after timeout and deduplicates names", async () => { vi.stubGlobal("fetch", vi.fn().mockRejectedValueOnce(new Error("timeout")).mockResolvedValueOnce(response([{ dns_names: ["www.example.com", "www.example.com"] }]))); const result = await certificateTransparencySources("example.com"); expect(result.sources[0].status).toBe("warning"); expect(result.names).toEqual(["www.example.com"]); });
  it("records both failures without throwing", async () => { vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("unavailable"))); const result = await certificateTransparencySources("example.com"); expect(result.sources).toHaveLength(2); expect(result.sources.every(s => s.status !== "ok")).toBe(true); expect(result.names).toEqual([]); });
  it("falls back after malformed JSON", async () => { vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce({ ok: true, status: 200, text: async () => "not-json" }).mockResolvedValueOnce(response([{ dns_names: ["api.example.com"] }]))); const result = await certificateTransparencySources("example.com"); expect(result.names).toEqual(["api.example.com"]); });
});
