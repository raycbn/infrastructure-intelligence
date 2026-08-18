export type FingerprintInput = { headers?: Record<string, string | null | undefined>; body?: string; hostname?: string };
export type TechnologySignal = { slug: string; displayName: string; vendor: string; category: string; confidence: number; evidence: Record<string, unknown>; version?: string };
const MAX_FINGERPRINT_BODY_BYTES = 512 * 1024;
export function fingerprint(input: FingerprintInput): { technologies: TechnologySignal[]; securitySignals: string[]; truncated: boolean } {
  const headers = Object.fromEntries(Object.entries(input.headers ?? {}).map(([k, v]) => [k.toLowerCase(), String(v ?? "").toLowerCase()])); const body = input.body ?? ""; const truncated = Buffer.byteLength(body, "utf8") > MAX_FINGERPRINT_BODY_BYTES; const html = body.slice(0, MAX_FINGERPRINT_BODY_BYTES).toLowerCase(); const found = new Map<string, TechnologySignal>(); const add = (signal: TechnologySignal) => { const prior = found.get(signal.slug); found.set(signal.slug, prior ? { ...prior, confidence: Math.min(98, Math.max(prior.confidence, signal.confidence) + 3), evidence: { ...prior.evidence, ...signal.evidence } } : signal); };
  if (headers["cf-ray"] && headers["cf-cache-status"]) add({ slug: "cloudflare", displayName: "Cloudflare", vendor: "Cloudflare", category: "infrastructure", confidence: 95, evidence: { headers: ["cf-ray", "cf-cache-status"] } });
  if (headers["x-vercel-id"] || headers["x-vercel-cache"]) add({ slug: "vercel", displayName: "Vercel", vendor: "Vercel", category: "infrastructure", confidence: 95, evidence: { headers: [headers["x-vercel-id"] ? "x-vercel-id" : "x-vercel-cache"] } });
  if (headers.server?.includes("express")) add({ slug: "express", displayName: "Express", vendor: "OpenJS", category: "backend", confidence: 90, evidence: { header: "server" } });
  if (headers["x-powered-by"]?.includes("asp.net")) add({ slug: "aspnet", displayName: "ASP.NET", vendor: "Microsoft", category: "backend", confidence: 95, evidence: { header: "x-powered-by" } });
  if (/\/_next\//.test(html)) add({ slug: "nextjs", displayName: "Next.js", vendor: "Vercel", category: "frontend", confidence: 95, evidence: { html: "/_next/" } });
  if (/<meta[^>]+name=["']generator["'][^>]+content=["'][^"']*wordpress/i.test(body) || /\/wp-content\//.test(html)) add({ slug: "wordpress", displayName: "WordPress", vendor: "WordPress", category: "cms", confidence: 95, evidence: { html: "wordpress marker" } });
  if (/<meta[^>]+name=["']generator["'][^>]+content=["'][^"']*drupal/i.test(body)) add({ slug: "drupal", displayName: "Drupal", vendor: "Drupal", category: "cms", confidence: 95, evidence: { html: "generator" } });
  if (/(gtag\s*\(|google_tag_manager)/.test(html) && !/googletagmanager\.com\/gtm\.js/.test(html)) add({ slug: "google-analytics", displayName: "Google Analytics", vendor: "Google", category: "analytics", confidence: 92, evidence: { html: "specific analytics marker" } });
  if (/googletagmanager\.com|gtm-[a-z0-9]+/.test(html)) add({ slug: "google-tag-manager", displayName: "Google Tag Manager", vendor: "Google", category: "analytics", confidence: 92, evidence: { html: "gtm marker" } });
  const securitySignals = ["strict-transport-security", "content-security-policy", "x-frame-options", "referrer-policy", "permissions-policy"].filter(name => Boolean(headers[name]));
  return { technologies: [...found.values()], securitySignals, truncated };
}
