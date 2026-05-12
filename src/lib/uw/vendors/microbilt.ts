// Microbilt adapter. Single vendor surface for consumer credit, business credit,
// OFAC/Watchlist, ID Verify, and IBV. The real Microbilt REST API lives at
// developer.microbilt.com; until credentials are present, this module returns
// deterministic mock payloads so the rest of the pipeline can run.
//
// To go live, set:
//   MICROBILT_ACCOUNT_KEY
//   MICROBILT_CUSTOMER_CODE
//   MICROBILT_BASE_URL (defaults to https://api.microbilt.com)

import type {
  BusinessCreditResult,
  ConsumerCreditResult,
  IdVerifyResult,
  OfacResult,
  VendorResult,
} from "./types";

const accountKey = process.env.MICROBILT_ACCOUNT_KEY;
const customerCode = process.env.MICROBILT_CUSTOMER_CODE;

export function isMicrobiltConfigured(): boolean {
  return Boolean(accountKey && customerCode);
}

function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function pickFico(seed: string): number {
  // Deterministic mock: spread evenly across 480–780
  return 480 + (hashSeed(seed) % 300);
}

export async function pullConsumerCredit(input: {
  firstName: string;
  lastName: string;
  ssnLast4?: string;
  dob?: string;
  pullType?: "soft" | "hard";
}): Promise<VendorResult<ConsumerCreditResult>> {
  if (!isMicrobiltConfigured()) {
    const fico = pickFico(`${input.firstName}|${input.lastName}|${input.ssnLast4 ?? ""}`);
    return {
      ok: true,
      mocked: true,
      data: {
        fico,
        bureau: "Experian (mock)",
        pulledAt: new Date().toISOString(),
        derogatoryCount: fico < 600 ? 3 : fico < 680 ? 1 : 0,
        openTrades: 4 + (hashSeed(input.lastName) % 10),
        utilizationPct: 25 + (hashSeed(input.firstName) % 60),
        bankruptciesCount: fico < 550 ? 1 : 0,
      },
    };
  }
  return { ok: false, error: "Microbilt consumer-credit live call not yet implemented" };
}

export async function pullBusinessCredit(input: {
  legalName: string;
  ein?: string;
  state?: string;
}): Promise<VendorResult<BusinessCreditResult>> {
  if (!isMicrobiltConfigured()) {
    const score = 40 + (hashSeed(input.legalName) % 60);
    return {
      ok: true,
      mocked: true,
      data: {
        bureau: "Experian Business (mock)",
        score,
        scoreLabel:
          score >= 76 ? "Low Risk" : score >= 51 ? "Moderate" : "High Risk",
        paymentIndex: score,
        tradeLines: 6 + (hashSeed(input.legalName) % 14),
        uccCount: hashSeed(input.legalName) % 5,
        judgmentsCount: 0,
        liensCount: 0,
      },
    };
  }
  return { ok: false, error: "Microbilt business-credit live call not yet implemented" };
}

export async function ofacScreen(input: {
  firstName: string;
  lastName: string;
  dob?: string;
  legalName?: string;
}): Promise<VendorResult<OfacResult>> {
  if (!isMicrobiltConfigured()) {
    const hit = hashSeed(`${input.firstName}${input.lastName}`) % 50 === 0;
    return {
      ok: true,
      mocked: true,
      data: {
        hit,
        matches: hit
          ? [
              {
                name: `${input.firstName} ${input.lastName}`,
                list: "OFAC SDN (mock)",
                score: 92,
              },
            ]
          : [],
      },
    };
  }
  return { ok: false, error: "Microbilt OFAC live call not yet implemented" };
}

export async function idVerify(input: {
  firstName: string;
  lastName: string;
  dob?: string;
  ssnLast4?: string;
  homeAddress?: string;
}): Promise<VendorResult<IdVerifyResult>> {
  if (!isMicrobiltConfigured()) {
    const score = 70 + (hashSeed(input.firstName + input.lastName) % 30);
    return {
      ok: true,
      mocked: true,
      data: {
        match: score > 85 ? "full" : score > 70 ? "partial" : "none",
        score,
        flags: score < 85 ? ["Address mismatch (mock)"] : [],
      },
    };
  }
  return { ok: false, error: "Microbilt ID Verify live call not yet implemented" };
}
