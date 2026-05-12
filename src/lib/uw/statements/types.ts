// Canonical bank statement shapes used by the metrics engine.
// Both Plaid and Azure Document Intelligence are normalized into these.

export interface NormalizedTransaction {
  date: string; // ISO yyyy-mm-dd
  amount: number; // positive = deposit/credit, negative = debit/withdrawal
  description: string;
  balance?: number; // running balance after this txn, when available
  category?: "deposit" | "ach_debit" | "card_settlement" | "transfer" | "nsf" | "overdraft" | "fee" | "check" | "other";
}

export interface NormalizedStatement {
  accountId: string;
  accountMask?: string;
  bankName?: string;
  periodStart: string; // ISO date
  periodEnd: string; // ISO date
  openingBalance?: number;
  closingBalance?: number;
  transactions: NormalizedTransaction[];
}

export interface BankStatementMetrics {
  revenue: {
    grossDeposits: number;
    trueRevenue: number;
    monthlyByMonth: { month: string; gross: number; trueRev: number }[];
    trendSlope: number;
    cvPct: number;
  };
  liquidity: {
    avgDailyBalance: number;
    medianDailyBalance: number;
    minBalance: number;
    endingBalance: number;
    adbToRevenueRatio: number;
  };
  riskEvents: {
    negativeDaysByMonth: Record<string, number>;
    totalNegativeDays: number;
    nsfCount: number;
    overdraftCount: number;
    returnedAchCount: number;
  };
  depositQuality: {
    depositCount: number;
    avgDepositSize: number;
    largeIrregularDeposits: { date: string; amount: number; memo: string }[];
    sourceMix: { cash: number; ach: number; card: number; other: number };
  };
  positions: {
    detected: { funder: string; dailyAmount: number; weeklyAmount: number; firstSeen: string; occurrences: number }[];
    totalDailyDebit: number;
    totalWeeklyDebit: number;
    debitToDepositRatio: number;
  };
  cardProcessing: {
    settlementsDetected: { processor: string; monthlyVolume: number }[];
    cardRevenuePct: number;
  };
  period: {
    start: string;
    end: string;
    monthCount: number;
  };
  flags: string[];
}
