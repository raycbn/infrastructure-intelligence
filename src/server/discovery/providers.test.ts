import { describe, expect, it } from "vitest";
import { detectProviders } from "./providers";
describe("provider rules", () => {
  it.each([["mx00.ionos.es", "DNS_MX", "ionos"], ["ns1087.ui-dns.com", "DNS_NS", "ionos"], ["pedalmap-79b3a.web.app", "DNS_CNAME", "firebase"], ["x.cloudflare.com", "DNS_CNAME", "cloudflare"], ["x.amazonaws.com", "hostname", "aws"], ["x.azurewebsites.net", "hostname", "azure"], ["x.vercel.app", "DNS_CNAME", "vercel"], ["x.netlify.app", "DNS_CNAME", "netlify"], ["user.github.io", "DNS_CNAME", "github-pages"]] as const)("detects %s", (value, source, id) => expect(detectProviders(value, source)[0]?.id).toBe(id));
  it("does not treat verification TXT as hosting", () => expect(detectProviders("google-site-verification=abc", "DNS_TXT")).toHaveLength(0));
});
