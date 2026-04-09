import { describe, it, expect, vi } from "vitest";
import Decimal from "decimal.js";
import {
  calculateDealMetrics,
  calculateBreakEven,
  calculateAvailableBalance,
} from "@/lib/calculations/pro-rata";

// ============================================================
// calculateDealMetrics
// ============================================================

describe("calculateDealMetrics", () => {
  it("calculates correctly when no payments collected", () => {
    const result = calculateDealMetrics({
      fundedAmount: 50000,
      paybackAmount: 67500,
      totalCollected: 0,
      missedPayments: 0,
    });

    expect(result.percentCollected).toBe(0);
    expect(result.principalRecaptured).toBe(0);
    expect(result.profitDistributed).toBe(0);
    expect(result.isInProfit).toBe(false);
    expect(result.remainingPayback).toBe(67500);
  });

  it("calculates correctly mid-repayment (before break-even)", () => {
    const result = calculateDealMetrics({
      fundedAmount: 50000,
      paybackAmount: 67500,
      totalCollected: 30000,
      missedPayments: 2,
    });

    expect(result.percentCollected).toBeCloseTo(44.44, 1);
    expect(result.principalRecaptured).toBe(30000);
    expect(result.profitDistributed).toBe(0);
    expect(result.isInProfit).toBe(false);
    expect(result.remainingPayback).toBe(37500);
  });

  it("calculates correctly at exact break-even", () => {
    const result = calculateDealMetrics({
      fundedAmount: 50000,
      paybackAmount: 67500,
      totalCollected: 50000,
      missedPayments: 0,
    });

    expect(result.principalRecaptured).toBe(50000);
    expect(result.profitDistributed).toBe(0);
    expect(result.isInProfit).toBe(false); // equal is not "in profit"
  });

  it("calculates correctly in profit zone", () => {
    const result = calculateDealMetrics({
      fundedAmount: 50000,
      paybackAmount: 67500,
      totalCollected: 60000,
      missedPayments: 0,
    });

    expect(result.principalRecaptured).toBe(50000);
    expect(result.profitDistributed).toBe(10000);
    expect(result.isInProfit).toBe(true);
    expect(result.remainingPayback).toBe(7500);
  });

  it("handles fully paid off deal", () => {
    const result = calculateDealMetrics({
      fundedAmount: 50000,
      paybackAmount: 67500,
      totalCollected: 67500,
      missedPayments: 0,
    });

    expect(result.percentCollected).toBe(100);
    expect(result.principalRecaptured).toBe(50000);
    expect(result.profitDistributed).toBe(17500);
    expect(result.isInProfit).toBe(true);
    expect(result.remainingPayback).toBe(0);
  });

  it("handles overpayment (collected > payback)", () => {
    const result = calculateDealMetrics({
      fundedAmount: 50000,
      paybackAmount: 67500,
      totalCollected: 70000,
      missedPayments: 0,
    });

    expect(result.percentCollected).toBeGreaterThan(100);
    expect(result.principalRecaptured).toBe(50000);
    expect(result.profitDistributed).toBe(20000);
    expect(result.remainingPayback).toBe(0); // Never negative
  });

  it("handles string inputs correctly (Prisma Decimal)", () => {
    const result = calculateDealMetrics({
      fundedAmount: "50000.00",
      paybackAmount: "67500.00",
      totalCollected: "42000.50",
      missedPayments: 0,
    });

    expect(result.principalRecaptured).toBe(42000.5);
    expect(result.profitDistributed).toBe(0);
  });

  it("handles zero payback amount without dividing by zero", () => {
    const result = calculateDealMetrics({
      fundedAmount: 0,
      paybackAmount: 0,
      totalCollected: 0,
      missedPayments: 0,
    });

    expect(result.percentCollected).toBe(0);
  });
});

// ============================================================
// calculateBreakEven
// ============================================================

describe("calculateBreakEven", () => {
  it("returns 0 when already past break-even", () => {
    const result = calculateBreakEven(50000, 55000, [
      { amount: 375 },
      { amount: 375 },
    ]);
    expect(result).toBe(0);
  });

  it("returns 0 when exactly at break-even", () => {
    const result = calculateBreakEven(50000, 50000, [{ amount: 375 }]);
    expect(result).toBe(0);
  });

  it("returns null when no payments exist", () => {
    const result = calculateBreakEven(50000, 0, []);
    expect(result).toBeNull();
  });

  it("calculates correctly with consistent payments", () => {
    // $50,000 funded, $30,000 collected, avg payment $375
    // Remaining: $20,000 / $375 = 53.33 → 54 payments
    const payments = Array.from({ length: 80 }, () => ({ amount: 375 }));
    const result = calculateBreakEven(50000, 30000, payments);
    expect(result).toBe(54);
  });

  it("calculates correctly with variable payment amounts", () => {
    const payments = [
      { amount: 500 },
      { amount: 300 },
      { amount: 400 },
    ];
    // avg = 400, remaining = 50000 - 1200 = 48800
    // 48800 / 400 = 122
    const result = calculateBreakEven(50000, 1200, payments);
    expect(result).toBe(122);
  });

  it("handles string inputs from Prisma Decimal", () => {
    const result = calculateBreakEven("50000.00", "49625.00", [
      { amount: "375.00" },
    ]);
    expect(result).toBe(1);
  });

  it("handles tiny remainder correctly", () => {
    // $0.01 remaining, avg payment $375
    const result = calculateBreakEven(50000, 49999.99, [{ amount: 375 }]);
    expect(result).toBe(1);
  });
});

// ============================================================
// calculateAvailableBalance
// ============================================================

describe("calculateAvailableBalance", () => {
  it("returns full amount when no holds", () => {
    const result = calculateAvailableBalance(10000, 0);
    expect(result.toNumber()).toBe(10000);
  });

  it("subtracts holds correctly", () => {
    const result = calculateAvailableBalance(10000, 3500);
    expect(result.toNumber()).toBe(6500);
  });

  it("never returns negative", () => {
    const result = calculateAvailableBalance(1000, 5000);
    expect(result.toNumber()).toBe(0);
  });

  it("handles string inputs", () => {
    const result = calculateAvailableBalance("15234.56", "7890.12");
    expect(result.toNumber()).toBe(7344.44);
  });

  it("handles zero distributed", () => {
    const result = calculateAvailableBalance(0, 0);
    expect(result.toNumber()).toBe(0);
  });

  it("handles exact equality", () => {
    const result = calculateAvailableBalance(5000, 5000);
    expect(result.toNumber()).toBe(0);
  });
});

// ============================================================
// Pro-rata rounding remainder tests (unit math only — no DB)
// These verify the mathematical property that:
// sum of individually-rounded shares == total, when last gets remainder
// ============================================================

describe("pro-rata rounding remainder (pure math)", () => {
  function simulateProRata(
    paymentAmount: number,
    investorAmounts: number[]
  ): number[] {
    const payment = new Decimal(paymentAmount);
    const total = investorAmounts.reduce(
      (s, a) => s.plus(new Decimal(a)),
      new Decimal(0)
    );
    let distributedSoFar = new Decimal(0);

    return investorAmounts.map((amt, i) => {
      const isLast = i === investorAmounts.length - 1;
      let share: Decimal;
      if (isLast) {
        share = payment.minus(distributedSoFar);
      } else {
        share = payment
          .mul(new Decimal(amt))
          .div(total)
          .toDecimalPlaces(2, Decimal.ROUND_HALF_EVEN);
      }
      distributedSoFar = distributedSoFar.plus(share);
      return share.toNumber();
    });
  }

  it("2 investors: sum == payment", () => {
    const shares = simulateProRata(375, [30000, 20000]);
    expect(shares.reduce((a, b) => a + b, 0)).toBe(375);
  });

  it("3 investors: sum == payment (⅓ each causes rounding)", () => {
    const shares = simulateProRata(100, [10000, 10000, 10000]);
    // 100/3 = 33.33... each. Two get 33.33, last gets 33.34
    expect(shares[0]).toBe(33.33);
    expect(shares[1]).toBe(33.33);
    expect(shares[2]).toBe(33.34);
    expect(shares.reduce((a, b) => a + b, 0)).toBeCloseTo(100, 10);
  });

  it("7 investors: sum == payment", () => {
    const amounts = [5000, 8000, 12000, 3000, 7500, 6000, 8500];
    const shares = simulateProRata(500, amounts);
    const sum = shares.reduce((a, b) => new Decimal(a).plus(b).toNumber(), 0);
    expect(new Decimal(sum).toDecimalPlaces(2).toNumber()).toBe(500);
  });

  it("many investors (20): sum == payment", () => {
    const amounts = Array.from({ length: 20 }, (_, i) => 1000 + i * 500);
    const shares = simulateProRata(1000, amounts);
    const sum = shares.reduce(
      (s, v) => s.plus(new Decimal(v)),
      new Decimal(0)
    );
    expect(sum.toNumber()).toBe(1000);
  });

  it("tiny payment across many investors", () => {
    const amounts = [100, 200, 300, 400, 500];
    const shares = simulateProRata(0.01, amounts);
    const sum = shares.reduce(
      (s, v) => s.plus(new Decimal(v)),
      new Decimal(0)
    );
    expect(sum.toNumber()).toBe(0.01);
  });

  it("uneven ownership with $0.01 payment", () => {
    const shares = simulateProRata(0.01, [60000, 40000]);
    expect(shares[0] + shares[1]).toBe(0.01);
  });

  it("single investor gets 100%", () => {
    const shares = simulateProRata(375.50, [50000]);
    expect(shares[0]).toBe(375.50);
  });
});

// ============================================================
// Principal vs profit split logic (pure math)
// ============================================================

describe("principal vs profit split (pure math)", () => {
  function simulateSplit(
    distributionAmount: number,
    investedAmount: number,
    previousPrincipalReturned: number
  ): { principal: number; profit: number } {
    const dist = new Decimal(distributionAmount);
    const invested = new Decimal(investedAmount);
    const prevPrincipal = new Decimal(previousPrincipalReturned);
    const remaining = invested.minus(prevPrincipal);

    if (remaining.gt(0)) {
      const principal = Decimal.min(dist, remaining);
      const profit = dist.minus(principal);
      return {
        principal: principal.toDecimalPlaces(2).toNumber(),
        profit: profit.toDecimalPlaces(2).toNumber(),
      };
    }
    return { principal: 0, profit: dist.toDecimalPlaces(2).toNumber() };
  }

  it("all goes to principal when nothing returned yet", () => {
    const result = simulateSplit(225, 30000, 0);
    expect(result.principal).toBe(225);
    expect(result.profit).toBe(0);
  });

  it("all goes to profit when principal fully returned", () => {
    const result = simulateSplit(225, 30000, 30000);
    expect(result.principal).toBe(0);
    expect(result.profit).toBe(225);
  });

  it("splits correctly at the crossover point", () => {
    // $100 remaining principal, $225 distribution
    const result = simulateSplit(225, 30000, 29900);
    expect(result.principal).toBe(100);
    expect(result.profit).toBe(125);
  });

  it("handles exact break-even distribution", () => {
    const result = simulateSplit(100, 30000, 29900);
    expect(result.principal).toBe(100);
    expect(result.profit).toBe(0);
  });

  it("handles over-returned principal (edge case from reversals)", () => {
    // After a reversal, principalReturned could theoretically exceed invested
    // This shouldn't happen, but the split should still be safe
    const result = simulateSplit(225, 30000, 30100);
    expect(result.principal).toBe(0);
    expect(result.profit).toBe(225);
  });
});

// ============================================================
// Break-even around crossover scenarios
// ============================================================

describe("break-even crossover scenarios", () => {
  it("one payment away from break-even", () => {
    const result = calculateBreakEven(50000, 49625, [
      { amount: 375 },
      { amount: 375 },
      { amount: 375 },
    ]);
    expect(result).toBe(1);
  });

  it("exactly one penny away", () => {
    const result = calculateBreakEven("50000.00", "49999.99", [
      { amount: "0.01" },
    ]);
    expect(result).toBe(1);
  });

  it("large remaining with small payments", () => {
    const result = calculateBreakEven(100000, 10000, [
      { amount: 100 },
    ]);
    expect(result).toBe(900);
  });
});

// ============================================================
// Available balance with multiple payout statuses
// ============================================================

describe("available balance edge cases", () => {
  it("multiple holds in different statuses", () => {
    // Simulating: $20,000 distributed
    // $5,000 completed + $3,000 approved + $2,000 pending = $10,000 holds
    // Available = $10,000
    const result = calculateAvailableBalance(20000, 10000);
    expect(result.toNumber()).toBe(10000);
  });

  it("all distributed is held", () => {
    const result = calculateAvailableBalance(15000, 15000);
    expect(result.toNumber()).toBe(0);
  });

  it("holds exceed distributed (shouldn't happen, but safe)", () => {
    const result = calculateAvailableBalance(10000, 12000);
    expect(result.toNumber()).toBe(0);
  });

  it("precision test with cents", () => {
    const result = calculateAvailableBalance("10000.33", "5000.17");
    expect(result.toNumber()).toBe(5000.16);
  });
});
