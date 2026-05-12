import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from "plaid";
import type { NormalizedStatement, NormalizedTransaction } from "./types";

const clientId = process.env.PLAID_CLIENT_ID;
const secret = process.env.PLAID_SECRET;
const env = (process.env.PLAID_ENV || "sandbox") as keyof typeof PlaidEnvironments;

export function isPlaidConfigured(): boolean {
  return Boolean(clientId && secret);
}

let _client: PlaidApi | null = null;
function client(): PlaidApi {
  if (!_client) {
    const cfg = new Configuration({
      basePath: PlaidEnvironments[env],
      baseOptions: {
        headers: {
          "PLAID-CLIENT-ID": clientId,
          "PLAID-SECRET": secret,
        },
      },
    });
    _client = new PlaidApi(cfg);
  }
  return _client;
}

export async function createLinkToken(params: {
  userId: string;
  webhook?: string;
}): Promise<{ link_token: string; expiration: string }> {
  if (!isPlaidConfigured()) {
    return {
      link_token: `mock-link-token-${params.userId}`,
      expiration: new Date(Date.now() + 3600 * 1000).toISOString(),
    };
  }
  const resp = await client().linkTokenCreate({
    client_name: "PMF Underwriting",
    user: { client_user_id: params.userId },
    language: "en",
    country_codes: [CountryCode.Us],
    products: [Products.Transactions, Products.Auth],
    webhook: params.webhook,
  });
  return resp.data;
}

export async function exchangePublicToken(publicToken: string): Promise<{
  access_token: string;
  item_id: string;
}> {
  if (!isPlaidConfigured()) {
    return { access_token: `mock-access-${Date.now()}`, item_id: `mock-item-${Date.now()}` };
  }
  const resp = await client().itemPublicTokenExchange({ public_token: publicToken });
  return { access_token: resp.data.access_token, item_id: resp.data.item_id };
}

export async function fetchStatements(params: {
  accessToken: string;
  startDate: string;
  endDate: string;
}): Promise<NormalizedStatement[]> {
  if (!isPlaidConfigured() || params.accessToken.startsWith("mock-")) {
    return [buildMockStatement(params.startDate, params.endDate)];
  }
  const resp = await client().transactionsGet({
    access_token: params.accessToken,
    start_date: params.startDate,
    end_date: params.endDate,
    options: { count: 500 },
  });

  const byAccount = new Map<string, NormalizedTransaction[]>();
  for (const t of resp.data.transactions) {
    const arr = byAccount.get(t.account_id) ?? [];
    arr.push({
      date: t.date,
      // Plaid: positive = debit (money out), negative = credit (money in). Invert.
      amount: -t.amount,
      description: t.name || t.merchant_name || "",
      category: undefined,
    });
    byAccount.set(t.account_id, arr);
  }

  return resp.data.accounts.map((a) => ({
    accountId: a.account_id,
    accountMask: a.mask ?? undefined,
    bankName: a.official_name ?? a.name,
    periodStart: params.startDate,
    periodEnd: params.endDate,
    openingBalance: a.balances?.current ?? undefined,
    closingBalance: a.balances?.current ?? undefined,
    transactions: (byAccount.get(a.account_id) ?? []).sort((x, y) =>
      x.date.localeCompare(y.date)
    ),
  }));
}

// Synthetic but realistic statement for mock mode + tests.
export function buildMockStatement(
  startDate: string,
  endDate: string
): NormalizedStatement {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const txns: NormalizedTransaction[] = [];
  let bal = 18_500;

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dow = d.getDay();
    const iso = d.toISOString().slice(0, 10);

    // Weekday card settlements
    if (dow >= 1 && dow <= 5) {
      const amt = 1200 + Math.round(Math.random() * 1800);
      bal += amt;
      txns.push({
        date: iso,
        amount: amt,
        description: "SQUARE INC SETTLEMENT",
        balance: bal,
        category: "card_settlement",
      });
      // Daily MCA debit (one position)
      const mca = 320;
      bal -= mca;
      txns.push({
        date: iso,
        amount: -mca,
        description: "ONDECK CAPITAL ACH DEBIT",
        balance: bal,
        category: "ach_debit",
      });
    }
    // Occasional NSF
    if (d.getDate() === 14) {
      bal -= 35;
      txns.push({
        date: iso,
        amount: -35,
        description: "NSF FEE INSUFFICIENT FUNDS",
        balance: bal,
        category: "nsf",
      });
    }
    // Rent end of month
    if (d.getDate() === 1) {
      bal -= 4200;
      txns.push({
        date: iso,
        amount: -4200,
        description: "ACH DEBIT - COMMERCIAL LEASE",
        balance: bal,
        category: "ach_debit",
      });
    }
  }

  return {
    accountId: "mock-acct-1",
    accountMask: "4242",
    bankName: "Chase Business",
    periodStart: startDate,
    periodEnd: endDate,
    openingBalance: 18_500,
    closingBalance: bal,
    transactions: txns,
  };
}
