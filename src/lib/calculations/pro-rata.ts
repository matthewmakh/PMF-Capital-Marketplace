import Decimal from "decimal.js";
import { PrismaClient } from "@prisma/client";

type TransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

// Valid deal statuses for posting payments
const PAYABLE_STATUSES = ["FUNDED", "ACTIVE_REPAYING", "DELINQUENT"];

/**
 * Distributes a payment pro-rata across all syndicate investors.
 *
 * Design principles:
 * - Principal is returned first, then profit is distributed.
 * - The last investor absorbs the rounding remainder so totals always reconcile.
 * - All calculations use decimal.js — never native JS floats.
 * - Overpayments beyond paybackAmount are still distributed (they represent extra collections).
 * - Every distribution is an immutable ledger entry. Corrections are done via reversals, not edits.
 */
export async function distributePayment(
  tx: TransactionClient,
  paymentId: string,
  dealId: string,
  paymentAmount: Decimal
) {
  const syndications = await tx.syndication.findMany({
    where: { dealId, isActive: true },
    orderBy: { committedAt: "asc" },
  });

  if (syndications.length === 0) return;

  const deal = await tx.deal.findUniqueOrThrow({ where: { id: dealId } });

  // Guard: deal must be in a payable status
  if (!PAYABLE_STATUSES.includes(deal.status)) {
    throw new Error(
      `Cannot post payment to deal in status ${deal.status}. ` +
        `Allowed: ${PAYABLE_STATUSES.join(", ")}`
    );
  }

  // Calculate total syndicated for accurate ownership percentages.
  // We recompute from committed amounts rather than trusting stored ownershipPct,
  // because that field could be stale if a syndication was added/removed.
  const totalSyndicated = syndications.reduce(
    (sum, s) => sum.plus(new Decimal(s.amount.toString())),
    new Decimal(0)
  );

  if (totalSyndicated.isZero()) return;

  // Allocate pro-rata, tracking distributed total for rounding correction
  let distributedSoFar = new Decimal(0);

  for (let i = 0; i < syndications.length; i++) {
    const syndication = syndications[i];
    const investedAmount = new Decimal(syndication.amount.toString());
    const currentPrincipalReturned = new Decimal(
      syndication.principalReturned.toString()
    );
    const isLast = i === syndications.length - 1;

    // Pro-rata share: use ratio of committed / totalSyndicated (not stored %)
    let distributionAmount: Decimal;
    if (isLast) {
      // Last investor gets the remainder — eliminates rounding drift
      distributionAmount = paymentAmount.minus(distributedSoFar);
    } else {
      distributionAmount = paymentAmount
        .mul(investedAmount)
        .div(totalSyndicated)
        .toDecimalPlaces(2, Decimal.ROUND_HALF_EVEN);
    }

    distributedSoFar = distributedSoFar.plus(distributionAmount);

    // Determine principal vs profit split
    const remainingPrincipal = investedAmount.minus(currentPrincipalReturned);

    let principalPortion: Decimal;
    let profitPortion: Decimal;

    if (remainingPrincipal.gt(0)) {
      principalPortion = Decimal.min(distributionAmount, remainingPrincipal);
      profitPortion = distributionAmount.minus(principalPortion);
    } else {
      principalPortion = new Decimal(0);
      profitPortion = distributionAmount;
    }

    // Create immutable distribution record
    await tx.distribution.create({
      data: {
        paymentId,
        syndicationId: syndication.id,
        amount: distributionAmount.toDecimalPlaces(2).toNumber(),
        principalPortion: principalPortion.toDecimalPlaces(2).toNumber(),
        profitPortion: profitPortion.toDecimalPlaces(2).toNumber(),
      },
    });

    // Update syndication running totals
    await tx.syndication.update({
      where: { id: syndication.id },
      data: {
        principalReturned: currentPrincipalReturned
          .plus(principalPortion)
          .toDecimalPlaces(2)
          .toNumber(),
        profitEarned: new Decimal(syndication.profitEarned.toString())
          .plus(profitPortion)
          .toDecimalPlaces(2)
          .toNumber(),
        totalDistributed: new Decimal(syndication.totalDistributed.toString())
          .plus(distributionAmount)
          .toDecimalPlaces(2)
          .toNumber(),
      },
    });
  }
}

/**
 * Reverses a payment by creating inverse distribution entries and
 * decrementing running totals. The original payment and distributions
 * are never deleted or modified — only marked as reversed.
 *
 * Returns the reversal payment record.
 */
export async function reversePayment(
  tx: TransactionClient,
  paymentId: string,
  reversedById: string,
  reason: string
) {
  const payment = await tx.payment.findUniqueOrThrow({
    where: { id: paymentId },
    include: { distributions: true },
  });

  if (payment.isReversed) {
    throw new Error("Payment is already reversed");
  }

  // Mark original payment as reversed
  await tx.payment.update({
    where: { id: paymentId },
    data: {
      isReversed: true,
      reversedAt: new Date(),
      reversalReason: reason,
    },
  });

  // Reverse each distribution: decrement syndication running totals
  for (const dist of payment.distributions) {
    const syndication = await tx.syndication.findUniqueOrThrow({
      where: { id: dist.syndicationId },
    });

    const distAmount = new Decimal(dist.amount.toString());
    const distPrincipal = new Decimal(dist.principalPortion.toString());
    const distProfit = new Decimal(dist.profitPortion.toString());

    await tx.syndication.update({
      where: { id: dist.syndicationId },
      data: {
        principalReturned: new Decimal(syndication.principalReturned.toString())
          .minus(distPrincipal)
          .toDecimalPlaces(2)
          .toNumber(),
        profitEarned: new Decimal(syndication.profitEarned.toString())
          .minus(distProfit)
          .toDecimalPlaces(2)
          .toNumber(),
        totalDistributed: new Decimal(syndication.totalDistributed.toString())
          .minus(distAmount)
          .toDecimalPlaces(2)
          .toNumber(),
      },
    });
  }

  // Decrement deal totalCollected
  const deal = await tx.deal.findUniqueOrThrow({
    where: { id: payment.dealId },
  });
  const paymentAmount = new Decimal(payment.amount.toString());
  const newCollected = new Decimal(deal.totalCollected.toString())
    .minus(paymentAmount)
    .toDecimalPlaces(2);

  await tx.deal.update({
    where: { id: payment.dealId },
    data: {
      totalCollected: newCollected.toNumber(),
      // If deal was PAID_OFF but we reversed a payment, revert to ACTIVE_REPAYING
      ...(deal.status === "PAID_OFF" && newCollected.lt(new Decimal(deal.paybackAmount.toString()))
        ? { status: "ACTIVE_REPAYING", statusChangedAt: new Date(), closedAt: null }
        : {}),
    },
  });

  return payment;
}

/**
 * Recalculates syndication running totals from the immutable distribution records.
 * Use this to detect and fix any drift between running totals and actual distributions.
 *
 * Returns discrepancies found (empty array = clean).
 */
export async function reconcileSyndication(
  tx: TransactionClient,
  syndicationId: string
): Promise<{ field: string; stored: string; computed: string }[]> {
  const syndication = await tx.syndication.findUniqueOrThrow({
    where: { id: syndicationId },
  });

  // Sum all non-reversed distributions
  const distributions = await tx.distribution.findMany({
    where: {
      syndicationId,
      payment: { isReversed: false },
    },
  });

  const computed = distributions.reduce(
    (acc, d) => ({
      totalDistributed: acc.totalDistributed.plus(new Decimal(d.amount.toString())),
      principalReturned: acc.principalReturned.plus(new Decimal(d.principalPortion.toString())),
      profitEarned: acc.profitEarned.plus(new Decimal(d.profitPortion.toString())),
    }),
    {
      totalDistributed: new Decimal(0),
      principalReturned: new Decimal(0),
      profitEarned: new Decimal(0),
    }
  );

  const discrepancies: { field: string; stored: string; computed: string }[] = [];

  const fields = ["totalDistributed", "principalReturned", "profitEarned"] as const;
  for (const field of fields) {
    const stored = new Decimal(syndication[field].toString());
    const calc = computed[field].toDecimalPlaces(2);
    if (!stored.eq(calc)) {
      discrepancies.push({
        field,
        stored: stored.toString(),
        computed: calc.toString(),
      });
    }
  }

  return discrepancies;
}

/**
 * Recalculates deal.totalCollected from the sum of non-reversed payments.
 * Returns the discrepancy if any.
 */
export async function reconcileDealTotal(
  tx: TransactionClient,
  dealId: string
): Promise<{ stored: string; computed: string } | null> {
  const deal = await tx.deal.findUniqueOrThrow({ where: { id: dealId } });

  const result = await tx.payment.aggregate({
    where: { dealId, isReversed: false },
    _sum: { amount: true },
  });

  const stored = new Decimal(deal.totalCollected.toString());
  const computed = new Decimal((result._sum.amount || 0).toString());

  if (!stored.eq(computed)) {
    return { stored: stored.toString(), computed: computed.toString() };
  }

  return null;
}

/**
 * Calculate deal-level metrics. All math in Decimal.
 */
export function calculateDealMetrics(deal: {
  fundedAmount: Decimal | number | string;
  paybackAmount: Decimal | number | string;
  totalCollected: Decimal | number | string;
  missedPayments: number;
}) {
  const funded = new Decimal(deal.fundedAmount.toString());
  const payback = new Decimal(deal.paybackAmount.toString());
  const collected = new Decimal(deal.totalCollected.toString());

  const percentCollected = payback.gt(0)
    ? collected.div(payback).mul(100)
    : new Decimal(0);

  const principalRecaptured = Decimal.min(collected, funded);
  const profitDistributed = Decimal.max(collected.minus(funded), new Decimal(0));
  const isInProfit = collected.gt(funded);

  return {
    percentCollected: percentCollected.toDecimalPlaces(2).toNumber(),
    principalRecaptured: principalRecaptured.toDecimalPlaces(2).toNumber(),
    profitDistributed: profitDistributed.toDecimalPlaces(2).toNumber(),
    isInProfit,
    remainingPayback: Decimal.max(payback.minus(collected), new Decimal(0))
      .toDecimalPlaces(2)
      .toNumber(),
  };
}

/**
 * Calculate break-even payments remaining using Decimal.
 * Only considers non-reversed payments for the average.
 */
export function calculateBreakEven(
  fundedAmount: string | number,
  totalCollected: string | number,
  nonReversedPayments: { amount: string | number }[]
): number | null {
  const funded = new Decimal(fundedAmount.toString());
  const collected = new Decimal(totalCollected.toString());

  if (collected.gte(funded)) return 0; // Already at or past break-even

  if (nonReversedPayments.length === 0) return null;

  const totalPaymentAmount = nonReversedPayments.reduce(
    (sum, p) => sum.plus(new Decimal(p.amount.toString())),
    new Decimal(0)
  );
  const avgPayment = totalPaymentAmount.div(nonReversedPayments.length);

  if (avgPayment.isZero()) return null;

  const remaining = funded.minus(collected);
  return remaining.div(avgPayment).ceil().toNumber();
}

/**
 * Calculate available balance for payout using Decimal.
 * Available = totalDistributed - completedPayouts - pendingPayouts - approvedPayouts - processingPayouts
 */
export function calculateAvailableBalance(
  totalDistributed: string | number,
  payoutHolds: string | number
): Decimal {
  const distributed = new Decimal(totalDistributed.toString());
  const holds = new Decimal(payoutHolds.toString());
  return Decimal.max(distributed.minus(holds), new Decimal(0));
}
