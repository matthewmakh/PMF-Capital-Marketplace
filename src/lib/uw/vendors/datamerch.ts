// DataMerch adapter — the MCA industry's shared "bad actor" registry, keyed on EIN.
// Set DATAMERCH_API_KEY (Bearer token) to enable live lookups.

import type { DataMerchResult, VendorResult } from "./types";

const apiKey = process.env.DATAMERCH_API_KEY;

export function isDataMerchConfigured(): boolean {
  return Boolean(apiKey);
}

function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export async function lookup(input: {
  legalName: string;
  ein?: string;
}): Promise<VendorResult<DataMerchResult>> {
  if (!isDataMerchConfigured()) {
    // Mock: ~1 in 5 EINs hit.
    const seed = hashSeed(input.ein ?? input.legalName);
    const hit = seed % 5 === 0;
    return {
      ok: true,
      mocked: true,
      data: {
        hit,
        entries: hit
          ? [
              {
                reportedAt: "2024-08-14",
                reportedBy: "Funder #312 (mock)",
                category: "Slow Payer",
                detail: "Defaulted on funding 11/2023, balance $14,200 remaining",
              },
            ]
          : [],
      },
    };
  }
  return { ok: false, error: "DataMerch live call not yet implemented" };
}
