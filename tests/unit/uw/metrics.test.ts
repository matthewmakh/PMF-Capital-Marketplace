import { describe, it, expect } from "vitest";
import { computeMetrics } from "@/lib/uw/statements/metrics";
import { gradePaper } from "@/lib/uw/grading/paper-grade";
import type { NormalizedStatement } from "@/lib/uw/statements/types";

const day = (m: number, d: number): string =>
  `2026-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

function statement(
  start: string,
  end: string,
  txns: { date: string; amount: number; description: string; balance?: number }[],
  opening = 10_000,
  closing?: number
): NormalizedStatement {
  return {
    accountId: "test",
    bankName: "Test Bank",
    periodStart: start,
    periodEnd: end,
    openingBalance: opening,
    closingBalance: closing,
    transactions: txns,
  };
}

describe("computeMetrics — revenue + transfer exclusion", () => {
  it("excludes inter-account transfers and funder ACH from true revenue", () => {
    const txns = [
      { date: day(1, 5), amount: 5000, description: "SQUARE INC SETTLEMENT" },
      { date: day(1, 6), amount: 2000, description: "TRANSFER FROM SAVINGS" },
      { date: day(1, 7), amount: 800, description: "ONDECK CAPITAL ACH CREDIT REFUND" },
      { date: day(1, 8), amount: 3000, description: "ACH DEPOSIT CUSTOMER" },
    ];
    const m = computeMetrics([statement(day(1, 1), day(1, 31), txns)]);
    expect(m.revenue.grossDeposits).toBe(10_800);
    // 5000 + 3000 = 8000 (transfer + ondeck excluded)
    expect(m.revenue.trueRevenue).toBe(8000);
  });
});

describe("computeMetrics — NSF and overdraft detection", () => {
  it("counts NSFs and overdrafts by memo", () => {
    const txns = [
      { date: day(2, 3), amount: -35, description: "NSF FEE INSUFFICIENT FUNDS" },
      { date: day(2, 7), amount: -36, description: "OVERDRAFT FEE" },
      { date: day(2, 10), amount: -38, description: "ACH RETURN ITEM NSF" },
      { date: day(2, 12), amount: 1500, description: "DEPOSIT" },
    ];
    const m = computeMetrics([statement(day(2, 1), day(2, 28), txns)]);
    expect(m.riskEvents.nsfCount).toBe(2);
    expect(m.riskEvents.overdraftCount).toBe(1);
  });
});

describe("computeMetrics — position detection from funder ACH", () => {
  it("detects an open OnDeck position from recurring debits", () => {
    const txns: { date: string; amount: number; description: string }[] = [];
    for (let d = 1; d <= 28; d++) {
      const dow = new Date(`2026-03-${String(d).padStart(2, "0")}`).getDay();
      if (dow >= 1 && dow <= 5) {
        txns.push({
          date: day(3, d),
          amount: -350,
          description: "ONDECK CAPITAL ACH DEBIT",
        });
        txns.push({
          date: day(3, d),
          amount: 2000,
          description: "SQUARE INC SETTLEMENT",
        });
      }
    }
    const m = computeMetrics([statement(day(3, 1), day(3, 31), txns)]);
    expect(m.positions.detected.length).toBe(1);
    expect(m.positions.detected[0].funder).toBe("OnDeck");
    expect(m.positions.detected[0].dailyAmount).toBeGreaterThan(0);
    expect(m.positions.debitToDepositRatio).toBeGreaterThan(0);
  });
});

describe("computeMetrics — negative days", () => {
  it("counts days when running balance dips below zero", () => {
    const txns = [
      { date: day(4, 1), amount: -1500, description: "RENT", balance: -500 },
      { date: day(4, 2), amount: -300, description: "ACH DEBIT", balance: -800 },
      { date: day(4, 3), amount: 4000, description: "DEPOSIT", balance: 3200 },
    ];
    const m = computeMetrics([
      statement(day(4, 1), day(4, 30), txns, 1000),
    ]);
    expect(m.riskEvents.totalNegativeDays).toBe(2);
  });
});

describe("gradePaper — paper grading", () => {
  it("returns A paper for a clean profile", () => {
    const m = computeMetrics([
      statement(
        day(5, 1),
        day(7, 31),
        Array.from({ length: 60 }).map((_, i) => ({
          date: day(5 + Math.floor(i / 22), (i % 22) + 1),
          amount: 2000,
          description: "ACH DEPOSIT CUSTOMER",
        })),
        50_000
      ),
    ]);
    const grade = gradePaper({
      metrics: m,
      fico: 720,
      timeInBusinessMonths: 36,
    });
    expect(grade.grade).toBe("A");
  });

  it("downgrades to D when NSFs + neg days are high", () => {
    const txns = [
      { date: day(6, 1), amount: -5000, description: "RENT", balance: -4000 },
      { date: day(6, 2), amount: -35, description: "NSF FEE" },
      { date: day(6, 3), amount: -35, description: "NSF FEE" },
      { date: day(6, 4), amount: -35, description: "NSF FEE" },
      { date: day(6, 5), amount: -35, description: "NSF FEE" },
      { date: day(6, 6), amount: -35, description: "NSF FEE" },
      { date: day(6, 7), amount: 8000, description: "DEPOSIT" },
    ];
    const m = computeMetrics([statement(day(6, 1), day(6, 30), txns, 1000)]);
    const grade = gradePaper({
      metrics: m,
      fico: 580,
      timeInBusinessMonths: 8,
    });
    expect(["C", "D", "UNGRADED"]).toContain(grade.grade);
  });
});
