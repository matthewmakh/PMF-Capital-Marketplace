// Tamper detection result shapes. Each signal has a severity weight that
// feeds into a 0-100 risk score; the composite check decides the verdict.

export type SignalSeverity = "info" | "low" | "med" | "high" | "critical";

export interface TamperSignal {
  code: string;            // stable identifier, e.g. "producer_unknown"
  severity: SignalSeverity;
  message: string;         // human-readable
  detail?: string;         // optional supporting text (value seen, etc.)
}

export interface TamperReport {
  source: "pdf_inspector" | "inscribe";
  verdict: "CLEAN" | "SUSPICIOUS" | "TAMPERED" | "UNKNOWN";
  riskScore: number;       // 0-100
  signals: TamperSignal[];
  rawJson?: unknown;
}

export const SEVERITY_WEIGHTS: Record<SignalSeverity, number> = {
  info: 0,
  low: 8,
  med: 18,
  high: 35,
  critical: 60,
};

export function scoreFromSignals(signals: TamperSignal[]): number {
  if (signals.length === 0) return 0;
  const total = signals.reduce(
    (s, sig) => s + SEVERITY_WEIGHTS[sig.severity],
    0
  );
  return Math.min(100, total);
}

export function verdictFromScore(
  score: number
): "CLEAN" | "SUSPICIOUS" | "TAMPERED" {
  if (score >= 60) return "TAMPERED";
  if (score >= 25) return "SUSPICIOUS";
  return "CLEAN";
}
