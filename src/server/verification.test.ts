import { describe, expect, it } from "vitest";
import { normalizeTxtRecords } from "./discovery/dns";
describe("DNS TXT verification normalization", () => {
  it("joins chunks from one TXT record", () => { expect(normalizeTxtRecords([["v9JpiAd9p1Uq", "NiZzY5e-CTwQOBAyNqNZ"]])).toEqual(["v9JpiAd9p1UqNiZzY5e-CTwQOBAyNqNZ"]); });
  it("normalizes serialized quotes and preserves multiple records", () => { expect(normalizeTxtRecords(['"first"', ["\"second", "\""]])).toEqual(["first", "second"]); });
});
