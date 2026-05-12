import DocumentIntelligence, {
  getLongRunningPoller,
  isUnexpected,
} from "@azure-rest/ai-document-intelligence";
import type { NormalizedStatement, NormalizedTransaction } from "./types";
import { buildMockStatement } from "./plaid-statements";

const endpoint = process.env.AZURE_DOC_INTEL_ENDPOINT;
const key = process.env.AZURE_DOC_INTEL_KEY;

export function isAzureDocIntelConfigured(): boolean {
  return Boolean(endpoint && key);
}

function client() {
  return DocumentIntelligence(endpoint!, { key: key! });
}

/**
 * Run the prebuilt bank-statement model against a PDF.
 * Accepts an S3 URL (preferred) or a Buffer.
 * In mock mode, returns synthetic statement(s).
 */
export async function analyzeBankStatement(input: {
  urlSource?: string;
  base64Source?: string;
  filename: string;
}): Promise<NormalizedStatement[]> {
  if (!isAzureDocIntelConfigured()) {
    // Mock: 3-month synthetic statement
    const now = new Date();
    const end = now.toISOString().slice(0, 10);
    const start = new Date(now);
    start.setMonth(start.getMonth() - 3);
    return [buildMockStatement(start.toISOString().slice(0, 10), end)];
  }

  const c = client();
  const initial = await c
    .path("/documentModels/{modelId}:analyze", "prebuilt-bankStatement.us")
    .post({
      contentType: "application/json",
      body: input.urlSource
        ? { urlSource: input.urlSource }
        : { base64Source: input.base64Source! },
    });
  if (isUnexpected(initial)) {
    throw new Error(
      `Azure DocIntel failed: ${initial.status} ${JSON.stringify(initial.body)}`
    );
  }
  const poller = getLongRunningPoller(c, initial);
  const result = (await poller.pollUntilDone()).body as {
    analyzeResult?: {
      documents?: Array<{
        fields?: Record<
          string,
          {
            content?: string;
            valueString?: string;
            valueDate?: string;
            valueNumber?: number;
            valueCurrency?: { amount: number; currencyCode?: string };
            valueArray?: Array<{
              valueObject?: Record<
                string,
                {
                  content?: string;
                  valueString?: string;
                  valueDate?: string;
                  valueNumber?: number;
                  valueCurrency?: { amount: number };
                }
              >;
            }>;
          }
        >;
      }>;
    };
  };

  const docs = result.analyzeResult?.documents ?? [];
  return docs.map((doc) => parseDocumentFields(doc.fields ?? {}));
}

type AzureField = {
  content?: string;
  valueString?: string;
  valueDate?: string;
  valueNumber?: number;
  valueCurrency?: { amount: number; currencyCode?: string };
  valueArray?: Array<{
    valueObject?: Record<string, AzureField>;
  }>;
};

function fieldNumber(f: AzureField | undefined): number | undefined {
  if (!f) return undefined;
  if (typeof f.valueCurrency?.amount === "number") return f.valueCurrency.amount;
  if (typeof f.valueNumber === "number") return f.valueNumber;
  return undefined;
}

function fieldString(f: AzureField | undefined): string {
  return f?.valueString ?? f?.content ?? "";
}

function fieldDate(f: AzureField | undefined): string {
  return f?.valueDate ?? f?.content?.slice(0, 10) ?? "";
}

function parseDocumentFields(
  fields: Record<string, AzureField>
): NormalizedStatement {
  const accountNumber = fieldString(fields.AccountNumber);
  const bankName = fieldString(fields.BankName);
  const periodStart = fieldDate(fields.StatementStartDate);
  const periodEnd = fieldDate(fields.StatementEndDate);
  const openingBalance = fieldNumber(fields.BeginningBalance);
  const closingBalance = fieldNumber(fields.EndingBalance);

  const transactions: NormalizedTransaction[] = [];
  const transactionItems =
    fields.Transactions?.valueArray ?? fields.TransactionList?.valueArray ?? [];

  for (const item of transactionItems) {
    const obj = item.valueObject ?? {};
    const date = fieldDate(obj.Date);
    if (!date) continue;
    const description = fieldString(obj.Description);
    const deposit = fieldNumber(obj.DepositAmount);
    const withdrawal = fieldNumber(obj.WithdrawalAmount);
    const amount =
      typeof deposit === "number" && deposit !== 0
        ? deposit
        : typeof withdrawal === "number" && withdrawal !== 0
          ? -Math.abs(withdrawal)
          : (fieldNumber(obj.Amount) ?? 0);
    const balance = fieldNumber(obj.Balance);
    transactions.push({ date, amount, description, balance });
  }

  return {
    accountId: accountNumber || `azure-${Date.now()}`,
    accountMask: accountNumber ? accountNumber.slice(-4) : undefined,
    bankName,
    periodStart: periodStart || new Date().toISOString().slice(0, 10),
    periodEnd: periodEnd || new Date().toISOString().slice(0, 10),
    openingBalance,
    closingBalance,
    transactions: transactions.sort((a, b) => a.date.localeCompare(b.date)),
  };
}
