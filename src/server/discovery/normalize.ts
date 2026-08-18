import { createHash } from "node:crypto";
import { normalizeDomain } from "./security";
export const assetKey = (type: string, value: string) => `${type}:${value.trim().toLowerCase()}`;
export const certificateFingerprint = (pem: string) => createHash("sha256").update(pem).digest("hex");
export const normalizeHostname = normalizeDomain;
export type Ownership = "in_scope" | "external" | "unknown";
export function ownershipForHostname(hostname: string, scopeDomain: string): Ownership {
  try { return normalizeHostname(hostname) === normalizeHostname(scopeDomain) || normalizeHostname(hostname).endsWith(`.${normalizeHostname(scopeDomain)}`) ? "in_scope" : "external"; } catch { return "unknown"; }
}
export function providerFor(host: string, cname?: string, asnOrg?: string) {
  const signal = `${host} ${cname ?? ""} ${asnOrg ?? ""}`.toLowerCase();
  if (/cloudflare/.test(signal)) return "cloudflare";
  if (/amazonaws|aws/.test(signal)) return "aws";
  if (/azure|trafficmanager/.test(signal)) return "azure";
  if (/google|googleusercontent|firebase/.test(signal)) return "gcp";
  if (/github\.io|githubusercontent/.test(signal)) return "github";
  return undefined;
}
