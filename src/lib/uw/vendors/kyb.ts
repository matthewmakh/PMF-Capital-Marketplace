// KYB / Secretary-of-State / business legitimacy. Real implementation will use
// Middesk or Cobalt Intelligence. Set MIDDESK_API_KEY (or COBALT_API_KEY) to enable.

import type { KybResult, VendorResult } from "./types";

const middeskKey = process.env.MIDDESK_API_KEY;
const cobaltKey = process.env.COBALT_API_KEY;

export function isKybConfigured(): boolean {
  return Boolean(middeskKey || cobaltKey);
}

export async function lookupBusiness(input: {
  legalName: string;
  state?: string;
  ein?: string;
}): Promise<VendorResult<KybResult>> {
  if (!isKybConfigured()) {
    return {
      ok: true,
      mocked: true,
      data: {
        legalNameMatch: true,
        registrationState: input.state ?? "DE",
        status: "active",
        formedDate: "2019-04-12",
        officers: [
          { name: "Mock Owner", title: "Managing Member" },
          { name: "Mock Officer", title: "Treasurer" },
        ],
      },
    };
  }
  return { ok: false, error: "KYB live call not yet implemented" };
}
