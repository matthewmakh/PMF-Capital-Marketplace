// UCC / liens / judgments / bankruptcies. Real implementation will use
// Wolters Kluwer iLien or Cogency Global. Set WK_ILIEN_API_KEY to enable.

import type { UccLienResult, VendorResult } from "./types";

const apiKey = process.env.WK_ILIEN_API_KEY;

export function isUccConfigured(): boolean {
  return Boolean(apiKey);
}

function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export async function searchLiens(input: {
  legalName: string;
  state?: string;
  ein?: string;
}): Promise<VendorResult<UccLienResult>> {
  if (!isUccConfigured()) {
    const seed = hashSeed(input.legalName);
    const filings = seed % 3;
    const sample = [
      "OnDeck Capital Inc.",
      "Kapitus LLC",
      "Forward Financing LLC",
      "Corporation Service Company (representative)",
    ];
    return {
      ok: true,
      mocked: true,
      data: {
        uccFilings: Array.from({ length: filings }).map((_, i) => ({
          filingNumber: `UCC-${String(seed + i).padStart(7, "0")}`,
          filedDate: `2024-${String(((seed + i) % 11) + 1).padStart(2, "0")}-15`,
          securedParty: sample[(seed + i) % sample.length],
          state: input.state ?? "DE",
          status: (i === 0 ? "active" : "lapsed") as "active" | "lapsed",
        })),
        judgments: [],
        bankruptcies: [],
      },
    };
  }
  return { ok: false, error: "Wolters Kluwer iLien live call not yet implemented" };
}
