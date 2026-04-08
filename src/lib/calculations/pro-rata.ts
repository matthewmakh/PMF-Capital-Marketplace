import Decimal from "decimal.js";
import { PrismaClient, Prisma } from "@prisma/client";

type TransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

/**
 * Distributes a payment pro-rata across all syndicate investors.
 * Principal is returned first, then profit is distributed.
 * All calculations use decimal.js for precision.
 */
export async function distributePayment(
  tx: TransactionClient,
  paymentId: string,
  dealId: string,
  paymentAmount: Decimal
) {
  const syndications = await tx.syndication.findMany({
    where: { dealId, isActive: true },
  });

  if (syndications.length === 0) return;

  const deal = await tx.deal.findUniqueOrThrow({ where: { id: dealId } });
  const fundedAmount = new Decimal(deal.fundedAmount.toString());

  for (const syndication of syndications) {
    const ownershipPct = new Decimal(syndication.ownershipPct.toString()).div(
      100
    );
    const investedAmount = new Decimal(syndication.amount.toString());
    const currentPrincipalReturned = new Decimal(
      syndication.principalReturned.toString()
    );

    // Pro-rata share of this payment
    const distributionAmount = paymentAmount.mul(ownershipPct);

    // Determine principal vs profit split
    const remainingPrincipal = investedAmount.minus(currentPrincipalReturned);

    let principalPortion: Decimal;
    let profitPortion: Decimal;

    if (remainingPrincipal.gt(0)) {
      // Still recovering principal
      principalPortion = Decimal.min(distributionAmount, remainingPrincipal);
      profitPortion = distributionAmount.minus(principalPortion);
    } else {
      // All principal recovered, everything is profit
      principalPortion = new Decimal(0);
      profitPortion = distributionAmount;
    }

    // Create distribution record
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
 * Calculate deal-level metrics.
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
    remainingPayback: payback.minus(collected).toDecimalPlaces(2).toNumber(),
  };
}
