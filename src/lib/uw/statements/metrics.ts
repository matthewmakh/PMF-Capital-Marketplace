import type {
  BankStatementMetrics,
  NormalizedStatement,
  NormalizedTransaction,
} from "./types";
import {
  CARD_PROCESSOR_SIGNATURES,
  FUNDER_SIGNATURES,
  NSF_PATTERNS,
  OVERDRAFT_PATTERNS,
  TRANSFER_PATTERNS,
} from "./funder-signatures";

const matchAny = (text: string, patterns: string[]): boolean => {
  const lower = text.toLowerCase();
  return patterns.some((p) => lower.includes(p));
};

const monthKey = (iso: string): string => iso.slice(0, 7); // yyyy-mm
const dayKey = (iso: string): string => iso.slice(0, 10); // yyyy-mm-dd

const round2 = (n: number): number => Math.round(n * 100) / 100;

interface TxnContext extends NormalizedTransaction {
  monthKey: string;
  isTransfer: boolean;
  isNsf: boolean;
  isOverdraft: boolean;
  funderMatch: string | null;
  processorMatch: string | null;
}

function classify(txn: NormalizedTransaction): TxnContext {
  const desc = txn.description || "";
  const isTransfer = matchAny(desc, TRANSFER_PATTERNS);
  const isNsf = matchAny(desc, NSF_PATTERNS);
  const isOverdraft = matchAny(desc, OVERDRAFT_PATTERNS);

  let funderMatch: string | null = null;
  for (const sig of FUNDER_SIGNATURES) {
    if (matchAny(desc, sig.patterns)) {
      funderMatch = sig.funder;
      break;
    }
  }

  let processorMatch: string | null = null;
  for (const sig of CARD_PROCESSOR_SIGNATURES) {
    if (matchAny(desc, sig.patterns)) {
      processorMatch = sig.processor;
      break;
    }
  }

  return {
    ...txn,
    monthKey: monthKey(txn.date),
    isTransfer,
    isNsf,
    isOverdraft,
    funderMatch,
    processorMatch,
  };
}

function linearTrendSlope(points: number[]): number {
  // Simple OLS slope; x = index 0..n-1, y = points.
  const n = points.length;
  if (n < 2) return 0;
  const meanX = (n - 1) / 2;
  const meanY = points.reduce((s, p) => s + p, 0) / n;
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (i - meanX) * (points[i] - meanY);
    den += (i - meanX) ** 2;
  }
  return den === 0 ? 0 : num / den;
}

function coefficientOfVariation(points: number[]): number {
  if (points.length === 0) return 0;
  const mean = points.reduce((s, p) => s + p, 0) / points.length;
  if (mean === 0) return 0;
  const variance =
    points.reduce((s, p) => s + (p - mean) ** 2, 0) / points.length;
  const stddev = Math.sqrt(variance);
  return (stddev / Math.abs(mean)) * 100;
}

function median(points: number[]): number {
  if (points.length === 0) return 0;
  const sorted = [...points].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

function computeDailyBalances(
  statements: NormalizedStatement[]
): Map<string, number> {
  // Build a day-by-day balance map by chronological transactions.
  // Prefer per-transaction running balance when available; otherwise reconstruct.
  const byDay = new Map<string, number>();
  // Gather all transactions across statements, sort, walk forward.
  const all = statements
    .flatMap((s) =>
      s.transactions.map((t) => ({
        ...t,
        statementOpening: s.openingBalance,
      }))
    )
    .sort((a, b) => a.date.localeCompare(b.date));

  let running = statements[0]?.openingBalance ?? 0;
  for (const txn of all) {
    if (typeof txn.balance === "number") {
      running = txn.balance;
    } else {
      running = running + txn.amount;
    }
    byDay.set(dayKey(txn.date), running);
  }
  return byDay;
}

export function computeMetrics(
  statements: NormalizedStatement[]
): BankStatementMetrics {
  const allClassified: TxnContext[] = statements.flatMap((s) =>
    s.transactions.map(classify)
  );

  // === Period ===
  const periodStart =
    statements.map((s) => s.periodStart).sort()[0] ?? new Date().toISOString();
  const periodEnd =
    statements.map((s) => s.periodEnd).sort().slice(-1)[0] ??
    new Date().toISOString();
  const months = Array.from(new Set(allClassified.map((t) => t.monthKey))).sort();

  // === Revenue ===
  const deposits = allClassified.filter((t) => t.amount > 0);
  const grossDeposits = deposits.reduce((s, t) => s + t.amount, 0);
  // True revenue: exclude transfers and existing-funder ACH refunds. Card settlements stay in.
  const trueRevenueTxns = deposits.filter((t) => !t.isTransfer && !t.funderMatch);
  const trueRevenue = trueRevenueTxns.reduce((s, t) => s + t.amount, 0);

  const monthlyByMonth = months.map((m) => {
    const gross = deposits
      .filter((t) => t.monthKey === m)
      .reduce((s, t) => s + t.amount, 0);
    const trueRev = trueRevenueTxns
      .filter((t) => t.monthKey === m)
      .reduce((s, t) => s + t.amount, 0);
    return { month: m, gross: round2(gross), trueRev: round2(trueRev) };
  });

  const monthlyTrueRev = monthlyByMonth.map((m) => m.trueRev);
  const trendSlope = linearTrendSlope(monthlyTrueRev);
  const cvPct = coefficientOfVariation(monthlyTrueRev);

  // === Liquidity ===
  const dailyBalances = computeDailyBalances(statements);
  const balancePoints = Array.from(dailyBalances.values());
  const avgDailyBalance =
    balancePoints.length > 0
      ? balancePoints.reduce((s, p) => s + p, 0) / balancePoints.length
      : 0;
  const medianDailyBalance = median(balancePoints);
  const minBalance = balancePoints.length > 0 ? Math.min(...balancePoints) : 0;
  const endingBalance =
    statements[statements.length - 1]?.closingBalance ??
    balancePoints[balancePoints.length - 1] ??
    0;
  const monthlyAvgTrueRev =
    monthlyTrueRev.length > 0
      ? monthlyTrueRev.reduce((s, p) => s + p, 0) / monthlyTrueRev.length
      : 0;
  const adbToRevenueRatio =
    monthlyAvgTrueRev > 0 ? avgDailyBalance / monthlyAvgTrueRev : 0;

  // === Risk events ===
  const negativeDaysByMonth: Record<string, number> = {};
  for (const m of months) negativeDaysByMonth[m] = 0;
  for (const [day, bal] of dailyBalances.entries()) {
    if (bal < 0) {
      const m = monthKey(day);
      negativeDaysByMonth[m] = (negativeDaysByMonth[m] || 0) + 1;
    }
  }
  const totalNegativeDays = Object.values(negativeDaysByMonth).reduce(
    (s, p) => s + p,
    0
  );
  const nsfCount = allClassified.filter((t) => t.isNsf).length;
  const overdraftCount = allClassified.filter((t) => t.isOverdraft).length;
  const returnedAchCount = allClassified.filter(
    (t) =>
      t.isNsf &&
      (t.description.toLowerCase().includes("ach") ||
        t.description.toLowerCase().includes("return"))
  ).length;

  // === Deposit quality ===
  const depositCount = deposits.length;
  const avgDepositSize = depositCount > 0 ? grossDeposits / depositCount : 0;
  // "Large/irregular" = deposit > 2 stddev above mean
  const depositAmounts = deposits.map((d) => d.amount);
  const meanDep =
    depositAmounts.length > 0
      ? depositAmounts.reduce((s, p) => s + p, 0) / depositAmounts.length
      : 0;
  const depVariance =
    depositAmounts.length > 0
      ? depositAmounts.reduce((s, p) => s + (p - meanDep) ** 2, 0) /
        depositAmounts.length
      : 0;
  const depStddev = Math.sqrt(depVariance);
  const largeIrregularDeposits = deposits
    .filter((d) => d.amount > meanDep + 2 * depStddev)
    .map((d) => ({
      date: d.date,
      amount: round2(d.amount),
      memo: d.description,
    }))
    .slice(0, 20);

  const cashSum = deposits
    .filter(
      (d) =>
        d.description.toLowerCase().includes("cash deposit") ||
        d.description.toLowerCase().startsWith("cash")
    )
    .reduce((s, d) => s + d.amount, 0);
  const cardSum = deposits
    .filter((d) => d.processorMatch !== null)
    .reduce((s, d) => s + d.amount, 0);
  const achSum = deposits
    .filter(
      (d) =>
        d.processorMatch === null &&
        (d.description.toLowerCase().includes("ach") ||
          d.description.toLowerCase().includes("deposit"))
    )
    .reduce((s, d) => s + d.amount, 0);
  const otherSum = Math.max(0, grossDeposits - cashSum - cardSum - achSum);

  // === Positions (existing MCA debits) ===
  const debits = allClassified.filter((t) => t.amount < 0);
  const funderDebits = debits.filter((t) => t.funderMatch);
  const byFunder = new Map<
    string,
    { funder: string; total: number; occurrences: number; firstSeen: string }
  >();
  for (const d of funderDebits) {
    const key = d.funderMatch!;
    const e = byFunder.get(key) ?? {
      funder: key,
      total: 0,
      occurrences: 0,
      firstSeen: d.date,
    };
    e.total += Math.abs(d.amount);
    e.occurrences += 1;
    if (d.date < e.firstSeen) e.firstSeen = d.date;
    byFunder.set(key, e);
  }

  // Estimate cadence: occurrences / number of business days in period.
  const periodDays =
    (new Date(periodEnd).getTime() - new Date(periodStart).getTime()) /
      (1000 * 60 * 60 * 24) || 1;
  const businessDays = Math.max(1, periodDays * (5 / 7));

  const detected = Array.from(byFunder.values()).map((p) => {
    const dailyAmount =
      p.occurrences >= businessDays * 0.5 ? p.total / Math.max(1, p.occurrences) : 0;
    const weeklyAmount =
      p.occurrences >= businessDays * 0.1 && p.occurrences < businessDays * 0.5
        ? p.total / Math.max(1, Math.ceil(p.occurrences / 1))
        : 0;
    return {
      funder: p.funder,
      dailyAmount: round2(dailyAmount),
      weeklyAmount: round2(weeklyAmount),
      firstSeen: p.firstSeen,
      occurrences: p.occurrences,
    };
  });

  const totalDailyDebit = round2(detected.reduce((s, p) => s + p.dailyAmount, 0));
  const totalWeeklyDebit = round2(
    detected.reduce((s, p) => s + p.weeklyAmount, 0)
  );
  const debitToDepositRatio =
    grossDeposits > 0
      ? funderDebits.reduce((s, t) => s + Math.abs(t.amount), 0) / grossDeposits
      : 0;

  // === Card processing ===
  const cardSettlements = deposits.filter((d) => d.processorMatch);
  const byProcessor = new Map<string, number>();
  for (const c of cardSettlements) {
    byProcessor.set(
      c.processorMatch!,
      (byProcessor.get(c.processorMatch!) || 0) + c.amount
    );
  }
  const settlementsDetected = Array.from(byProcessor.entries()).map(
    ([processor, total]) => ({
      processor,
      monthlyVolume: round2(total / Math.max(1, months.length)),
    })
  );
  const cardRevenuePct =
    grossDeposits > 0 ? (cardSum / grossDeposits) * 100 : 0;

  // === Flags ===
  const flags: string[] = [];
  if (totalNegativeDays > 10 && months.length <= 3)
    flags.push(`${totalNegativeDays} negative days across ${months.length} months`);
  if (nsfCount >= 5)
    flags.push(`${nsfCount} NSF events detected`);
  if (trendSlope < 0 && monthlyTrueRev.length >= 3) {
    const dropPct =
      monthlyTrueRev[0] > 0
        ? ((monthlyTrueRev[monthlyTrueRev.length - 1] - monthlyTrueRev[0]) /
            monthlyTrueRev[0]) *
          100
        : 0;
    if (dropPct < -20)
      flags.push(`Revenue declined ${Math.abs(round2(dropPct))}% over period`);
  }
  if (grossDeposits > 0 && trueRevenue / grossDeposits < 0.75)
    flags.push("True revenue < 75% of gross deposits (transfer inflation)");
  if (detected.length >= 3)
    flags.push(`${detected.length} open MCA positions detected`);
  if (debitToDepositRatio > 0.25)
    flags.push(`MCA debit load ${round2(debitToDepositRatio * 100)}% of deposits`);
  if (minBalance < 0)
    flags.push(`Minimum daily balance reached ${round2(minBalance)}`);

  return {
    revenue: {
      grossDeposits: round2(grossDeposits),
      trueRevenue: round2(trueRevenue),
      monthlyByMonth,
      trendSlope: round2(trendSlope),
      cvPct: round2(cvPct),
    },
    liquidity: {
      avgDailyBalance: round2(avgDailyBalance),
      medianDailyBalance: round2(medianDailyBalance),
      minBalance: round2(minBalance),
      endingBalance: round2(endingBalance),
      adbToRevenueRatio: round2(adbToRevenueRatio),
    },
    riskEvents: {
      negativeDaysByMonth,
      totalNegativeDays,
      nsfCount,
      overdraftCount,
      returnedAchCount,
    },
    depositQuality: {
      depositCount,
      avgDepositSize: round2(avgDepositSize),
      largeIrregularDeposits,
      sourceMix: {
        cash: round2(cashSum),
        ach: round2(achSum),
        card: round2(cardSum),
        other: round2(otherSum),
      },
    },
    positions: {
      detected,
      totalDailyDebit,
      totalWeeklyDebit,
      debitToDepositRatio: round2(debitToDepositRatio),
    },
    cardProcessing: {
      settlementsDetected,
      cardRevenuePct: round2(cardRevenuePct),
    },
    period: {
      start: periodStart,
      end: periodEnd,
      monthCount: months.length,
    },
    flags,
  };
}
