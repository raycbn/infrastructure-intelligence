export type ProviderCategory = "hosting" | "dns" | "email" | "cloud" | "cdn" | "saas" | "certificate_authority" | "other";
export type ProviderDetection = { id: string; displayName: string; category: ProviderCategory; source: string; evidence: Record<string, unknown>; confidence: number; matchedRule: string };
type Rule = { id: string; provider: string; displayName: string; category: ProviderCategory; pattern: RegExp; source: string; confidence: number };
const rules: Rule[] = [
  { id: "ionos-mx", provider: "ionos", displayName: "IONOS", category: "email", pattern: /(?:^|\.)ionos\.(?:es|com|de)$/i, source: "DNS_MX", confidence: 90 },
  { id: "ionos-ns", provider: "ionos", displayName: "IONOS", category: "dns", pattern: /ui-dns\.(?:de|com|org|biz)$/i, source: "DNS_NS", confidence: 90 },
  { id: "firebase-web-app", provider: "firebase", displayName: "Firebase", category: "cloud", pattern: /\.web\.app$/i, source: "DNS_CNAME", confidence: 95 },
  { id: "google-cloud", provider: "google-cloud", displayName: "Google Cloud", category: "cloud", pattern: /(?:googleusercontent|appspot\.com)$/i, source: "DNS_CNAME", confidence: 90 },
  { id: "cloudflare", provider: "cloudflare", displayName: "Cloudflare", category: "cdn", pattern: /cloudflare/i, source: "DNS_CNAME", confidence: 90 },
  { id: "aws", provider: "aws", displayName: "AWS", category: "cloud", pattern: /(?:amazonaws\.com|\.aws\.)/i, source: "hostname", confidence: 85 },
  { id: "azure", provider: "azure", displayName: "Azure", category: "cloud", pattern: /(?:azurewebsites\.net|trafficmanager\.net)/i, source: "hostname", confidence: 85 },
  { id: "vercel", provider: "vercel", displayName: "Vercel", category: "hosting", pattern: /vercel\.app$/i, source: "DNS_CNAME", confidence: 95 },
  { id: "netlify", provider: "netlify", displayName: "Netlify", category: "hosting", pattern: /netlify\.app$/i, source: "DNS_CNAME", confidence: 95 },
  { id: "github-pages", provider: "github-pages", displayName: "GitHub Pages", category: "hosting", pattern: /github\.io$/i, source: "DNS_CNAME", confidence: 95 }
];
export function detectProviders(value: string, sourceHint?: string): ProviderDetection[] {
  const normalized = value.trim().replace(/\.$/, "");
  return rules.filter(rule => (!sourceHint || rule.source === sourceHint || rule.source === "hostname") && rule.pattern.test(normalized)).map(rule => ({ id: rule.provider, displayName: rule.displayName, category: rule.category, source: sourceHint ?? rule.source, evidence: { value, normalizedValue: normalized, pattern: rule.pattern.source }, confidence: rule.confidence, matchedRule: rule.id }));
}
