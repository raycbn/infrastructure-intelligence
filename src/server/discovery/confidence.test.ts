import { describe, expect, it } from "vitest";
import { confidence } from "./confidence";
describe("confidence", () => { it("prioritizes direct evidence and decays passive evidence", () => { expect(confidence("direct")).toBeGreaterThan(confidence("heuristic")); expect(confidence("passive", 200)).toBeLessThan(confidence("passive")); }); });
