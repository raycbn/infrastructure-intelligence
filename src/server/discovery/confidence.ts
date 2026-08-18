export type EvidenceStrength = "direct" | "corroborated" | "passive" | "heuristic";
export function confidence(strength: EvidenceStrength, ageDays = 0) {
  const base = { direct: 100, corroborated: 85, passive: 60, heuristic: 40 }[strength];
  return Math.max(10, Math.round(base * Math.exp(-ageDays / 180)));
}
