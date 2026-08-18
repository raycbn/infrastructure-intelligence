import { assetKey } from "./normalize";
import { observeAsset, observeRelationship } from "./store";
import type { TechnologySignal } from "./fingerprinting";
export async function persistTechnologySignals(input: { tenantId: string; scopeId: string; runId: string; serviceId: string; signals: TechnologySignal[] }) {
  for (const signal of input.signals) {
    const technology = await observeAsset({ tenantId: input.tenantId, scopeId: input.scopeId, type: "technology", ownership: "unknown", canonicalKey: assetKey("technology", signal.slug), displayName: signal.displayName, metadata: { slug: signal.slug, vendor: signal.vendor, category: signal.category, version: signal.version ?? null, evidenceSummary: signal.evidence }, source: "fingerprinting", rawValue: JSON.stringify(signal), normalizedValue: signal.slug, evidence: { technology: signal.displayName, slug: signal.slug, signals: signal.evidence }, confidence: signal.confidence, runId: input.runId });
    await observeRelationship({ tenantId: input.tenantId, scopeId: input.scopeId, sourceAssetId: input.serviceId, targetAssetId: technology.id, type: "USES_TECHNOLOGY", qualifiers: { slug: signal.slug, category: signal.category, vendor: signal.vendor }, source: "fingerprinting", rawValue: signal.displayName, normalizedValue: signal.slug, evidence: { technology: signal.displayName, slug: signal.slug, signals: signal.evidence }, confidence: signal.confidence, runId: input.runId });
  }
}
