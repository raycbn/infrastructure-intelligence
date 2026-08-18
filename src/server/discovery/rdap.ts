import { isIP } from "node:net";
import { isBlockedIp } from "./security";

export type RdapStatus = "success" | "no_data" | "timeout" | "http_error" | "malformed";
export type RdapResult = { status: RdapStatus; ip: string; source: "rdap"; network?: { cidr?: string; startAddress?: string; endAddress?: string; handle?: string; name?: string; country?: string; registry?: string }; asns: string[]; organization?: string; raw?: unknown; error?: string; duration_ms: number };
const MAX_RESPONSE = 2_000_000;
export function normalizeRdapIp(ip: string) { if (!isIP(ip) || isBlockedIp(ip)) throw new Error("RDAP requires a public IP"); return ip.toLowerCase(); }
export function parseRdap(ip: string, body: any): Omit<RdapResult, "duration_ms" | "ip"> {
  const cidrEntry = body.cidr0_cidrs?.[0]; const cidr = cidrEntry ? `${cidrEntry.v4prefix ?? cidrEntry.v6prefix}/${cidrEntry.length}` : undefined;
  const network = body?.startAddress || body?.endAddress || body?.handle || body?.name ? { cidr, startAddress: body.startAddress, endAddress: body.endAddress, handle: body.handle, name: body.name, country: body.country, registry: body.port43 } : undefined;
  const entities = Array.isArray(body?.entities) ? body.entities : [];
  const organization = entities.flatMap((entity: any) => entity.vcardArray?.[1] ?? []).find((item: any) => item?.[0] === "fn")?.[3] ?? body?.name;
  const asns = [...new Set([...(body?.asn ? [String(body.asn)] : []), ...(body?.remarks ?? []).flatMap((r: any) => String(r?.description ?? "").match(/AS\d+/gi) ?? [])])];
  if (!network && !organization && !asns.length) return { status: "no_data", source: "rdap", asns: [] };
  return { status: "success", source: "rdap", network, organization, asns, raw: body };
}
export async function lookupRdap(ipValue: string, timeoutMs = 8_000): Promise<RdapResult> {
  const ip = normalizeRdapIp(ipValue); const started = Date.now(); const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), timeoutMs);
  try { const response = await fetch(`https://rdap.org/ip/${encodeURIComponent(ip)}`, { signal: controller.signal, redirect: "error", headers: { accept: "application/rdap+json", "user-agent": "Infrastructure-Intelligence/0.1" } }); if (!response.ok) return { status: "http_error", ip, source: "rdap", asns: [], error: `HTTP ${response.status}`, duration_ms: Date.now() - started }; const text = await response.text(); if (text.length > MAX_RESPONSE) return { status: "malformed", ip, source: "rdap", asns: [], error: "Response exceeds limit", duration_ms: Date.now() - started }; let body: unknown; try { body = JSON.parse(text); } catch { return { status: "malformed", ip, source: "rdap", asns: [], error: "Malformed JSON", duration_ms: Date.now() - started }; } return { ip, duration_ms: Date.now() - started, ...parseRdap(ip, body) };
  } catch (error) { return { status: (error instanceof Error && error.name === "AbortError") ? "timeout" : "http_error", ip, source: "rdap", asns: [], error: error instanceof Error ? error.message : "RDAP request failed", duration_ms: Date.now() - started }; } finally { clearTimeout(timer); }
}
