import { fingerprint, type FingerprintInput } from "../fingerprinting";
import { persistTechnologySignals } from "../technology-store";

export type TechnologyStageContext = { tenantId: string; scopeId: string; runId: string; serviceId: string };
export async function runTechnologyStage(input: FingerprintInput, context: TechnologyStageContext) {
  const started = Date.now();
  try {
    const result = fingerprint(input);
    await persistTechnologySignals({ ...context, signals: result.technologies });
    return { status: "OK" as const, technologies_detected: result.technologies.length, technologies: result.technologies, security_signals: result.securitySignals, warnings: result.truncated ? ["Fingerprint body truncated at 512 KB"] : [], duration_ms: Date.now() - started };
  } catch (error) {
    return { status: "WARNING" as const, technologies_detected: 0, technologies: [], security_signals: [], warnings: [error instanceof Error ? error.message : "Technology fingerprinting failed"], duration_ms: Date.now() - started };
  }
}
