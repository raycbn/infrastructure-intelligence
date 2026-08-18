import { Resolver } from "node:dns/promises";

export type DnsResult<T> = { values: T[]; source: "system" | "fallback"; error?: string; started_at: string; finished_at: string; duration_ms: number };
const timeoutMs = 5_000;

async function resolveWithFallback<T>(operation: (resolver: Resolver) => Promise<T[]>, hostname: string): Promise<DnsResult<T>> {
  const started = Date.now(); const started_at = new Date(started).toISOString();
  const finish = (result: Omit<DnsResult<T>, "started_at" | "finished_at" | "duration_ms">) => { const finished = Date.now(); return { ...result, started_at, finished_at: new Date(finished).toISOString(), duration_ms: finished - started }; };
  const run = async (resolver: Resolver): Promise<T[]> => Promise.race([operation(resolver), new Promise<never>((_, reject) => setTimeout(() => reject(new Error("DNS lookup timed out")), timeoutMs))]);
  const system = new Resolver();
  try { return finish({ values: await run(system), source: "system" }); } catch (first) {
    const fallback = new Resolver(); fallback.setServers(["8.8.8.8", "1.1.1.1"]);
    try { return finish({ values: await run(fallback), source: "fallback" }); } catch (second) { return finish({ values: [], source: "fallback", error: `${hostname}: system=${first instanceof Error ? first.message : "unknown"}; fallback=${second instanceof Error ? second.message : "unknown"}` }); }
  }
}

export function normalizeTxtRecords(records: Array<string | string[]>): string[] { return records.map(record => { const value = (Array.isArray(record) ? record.join("") : record).trim(); return value.length >= 2 && value.startsWith('"') && value.endsWith('"') ? value.slice(1, -1) : value; }); }
export async function resolveVerificationTxt(hostname: string): Promise<DnsResult<string>> { const result = await resolveWithFallback<string[]>(resolver => resolver.resolveTxt(hostname), hostname); return { ...result, values: normalizeTxtRecords(result.values) }; }
export async function dnsDiscovery(hostname: string) {
  const [a, aaaa, cname, mx, ns, txt, soa] = await Promise.all([
    resolveWithFallback(resolver => resolver.resolve4(hostname, { ttl: true }).then(values => values), hostname),
    resolveWithFallback(resolver => resolver.resolve6(hostname, { ttl: true }).then(values => values), hostname),
    resolveWithFallback(resolver => resolver.resolveCname(hostname), hostname),
    resolveWithFallback(resolver => resolver.resolveMx(hostname), hostname),
    resolveWithFallback(resolver => resolver.resolveNs(hostname), hostname),
    resolveVerificationTxt(hostname),
    resolveWithFallback(resolver => resolver.resolveSoa(hostname).then(value => [value]), hostname),
  ]);
  return { a, aaaa, cname, mx, ns, txt, soa };
}
