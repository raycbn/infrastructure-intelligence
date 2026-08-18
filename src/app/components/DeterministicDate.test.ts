import { describe, expect, it } from "vitest";
import { formatUtcDate } from "./DeterministicDate";
describe("formatUtcDate", () => { it("is locale independent", () => { expect(formatUtcDate("2026-08-18T10:18:20.000Z")).toBe("2026-08-18 10:18:20 UTC"); }); });
