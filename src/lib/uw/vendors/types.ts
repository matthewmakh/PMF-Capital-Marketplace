// Common vendor adapter shape. Each adapter exposes isConfigured(); when not,
// it returns deterministic mock data so the pipeline runs end-to-end locally.

export type VendorOk<T> = { ok: true; data: T; cost?: number; mocked?: boolean };
export type VendorErr = { ok: false; error: string; mocked?: boolean };
export type VendorResult<T> = VendorOk<T> | VendorErr;

export interface OfacResult {
  hit: boolean;
  matches: { name: string; list: string; score: number }[];
}

export interface IdVerifyResult {
  match: "full" | "partial" | "none";
  score: number;
  flags: string[];
}

export interface ConsumerCreditResult {
  fico: number;
  bureau: string;
  pulledAt: string;
  derogatoryCount: number;
  openTrades: number;
  utilizationPct: number;
  bankruptciesCount: number;
}

export interface BusinessCreditResult {
  bureau: string;
  score: number; // bureau-specific (Paydex, IBR, etc.)
  scoreLabel: string;
  paymentIndex?: number;
  tradeLines: number;
  uccCount: number;
  judgmentsCount: number;
  liensCount: number;
}

export interface DataMerchResult {
  hit: boolean;
  entries: {
    reportedAt: string;
    reportedBy: string;
    category: string;
    detail: string;
  }[];
}

export interface UccLienResult {
  uccFilings: {
    filingNumber: string;
    filedDate: string;
    securedParty: string;
    state: string;
    status: "active" | "lapsed" | "terminated";
  }[];
  judgments: { filedDate: string; amount: number; plaintiff: string; state: string }[];
  bankruptcies: { filedDate: string; chapter: string; status: string }[];
}

export interface KybResult {
  legalNameMatch: boolean;
  registrationState: string | null;
  status: "active" | "inactive" | "unknown";
  formedDate: string | null;
  officers: { name: string; title: string }[];
}
