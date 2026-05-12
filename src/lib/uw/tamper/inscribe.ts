// Inscribe adapter for document fraud detection.
// Docs: https://docs.inscribe.ai/
//
// Live wiring requires:
//   INSCRIBE_API_KEY   — Bearer token from the Inscribe dashboard
//   INSCRIBE_BASE_URL  — defaults to https://api.inscribe.ai
//
// Until those are set, this adapter returns a deterministic mock that's
// internally consistent with the built-in PDF inspector's verdict.

import type { TamperReport, TamperSignal } from "./types";
import { scoreFromSignals, verdictFromScore } from "./types";

const apiKey = process.env.INSCRIBE_API_KEY;
const baseUrl = process.env.INSCRIBE_BASE_URL || "https://api.inscribe.ai";

export function isInscribeConfigured(): boolean {
  return Boolean(apiKey);
}

interface InscribeAnalysisResponse {
  id: string;
  fraud_score: number;
  authentic_score?: number;
  flags?: {
    code: string;
    severity: string;
    description: string;
  }[];
}

export async function analyzeDocument(input: {
  bytes: Uint8Array;
  filename: string;
  contentType: string;
}): Promise<TamperReport> {
  if (!isInscribeConfigured()) {
    return mockReport(input);
  }

  try {
    const form = new FormData();
    form.append(
      "file",
      new Blob([new Uint8Array(input.bytes)], { type: input.contentType }),
      input.filename
    );
    form.append("document_type", "bank_statement");

    const resp = await fetch(`${baseUrl}/documents/analyze`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
    });
    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      return {
        source: "inscribe",
        verdict: "UNKNOWN",
        riskScore: 0,
        signals: [
          {
            code: "inscribe_error",
            severity: "info",
            message: `Inscribe returned ${resp.status}`,
            detail: text.slice(0, 300),
          },
        ],
      };
    }
    const data = (await resp.json()) as InscribeAnalysisResponse;
    const score = Math.min(100, Math.max(0, Math.round(data.fraud_score)));
    const signals: TamperSignal[] = (data.flags ?? []).map((f) => ({
      code: `inscribe_${f.code}`,
      severity:
        f.severity === "high"
          ? "high"
          : f.severity === "critical"
            ? "critical"
            : f.severity === "low"
              ? "low"
              : "med",
      message: f.description,
    }));
    return {
      source: "inscribe",
      verdict: verdictFromScore(score),
      riskScore: score,
      signals,
      rawJson: data as unknown,
    };
  } catch (e) {
    return {
      source: "inscribe",
      verdict: "UNKNOWN",
      riskScore: 0,
      signals: [
        {
          code: "inscribe_exception",
          severity: "info",
          message: "Inscribe request failed",
          detail: (e as Error).message,
        },
      ],
    };
  }
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function mockReport(input: {
  bytes: Uint8Array;
  filename: string;
}): TamperReport {
  // Mock: small files and obvious "tampered_*" filenames get higher scores.
  const seed = hash(input.filename);
  const tinyBoost = input.bytes.byteLength < 50 * 1024 ? 25 : 0;
  const filenameBoost =
    /tamper|edit|fake|forg|altered/i.test(input.filename) ? 55 : 0;
  const variance = seed % 12; // 0..11

  const signals: TamperSignal[] = [];
  if (filenameBoost > 0) {
    signals.push({
      code: "mock_filename_hint",
      severity: "critical",
      message: "Filename suggests user-edited document (mock)",
    });
  }
  if (tinyBoost > 0) {
    signals.push({
      code: "mock_size",
      severity: "med",
      message: "Document is unusually small for a real statement (mock)",
    });
  }
  if (variance >= 9) {
    signals.push({
      code: "mock_minor_variance",
      severity: "low",
      message: "Minor stylistic inconsistency detected (mock)",
    });
  }
  const riskScore = scoreFromSignals(signals);
  return {
    source: "inscribe",
    verdict: verdictFromScore(riskScore),
    riskScore,
    signals,
    rawJson: { mocked: true, seed, filename: input.filename },
  };
}
