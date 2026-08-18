import { isInScope, normalizeDomain } from "./security";
export async function certificateTransparency(scope: string): Promise<string[]> {
  const response = await fetch(`https://crt.sh/?q=%25.${encodeURIComponent(scope)}&output=json`, { signal: AbortSignal.timeout(15_000), headers: { "user-agent": "Infrastructure-Intelligence/0.1" } });
  if (!response.ok) return [];
  const rows = await response.json() as Array<{ name_value?: string }>;
  return [...new Set(rows.flatMap(r => (r.name_value ?? "").split("\n")).map(x => x.replace(/^\*\./, "")).filter(x => { try { return isInScope(normalizeDomain(x), scope); } catch { return false; } }))];
}
