import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canInvest } from "@/lib/permissions";
import { logAction } from "@/lib/audit";
import { z } from "zod";
import Decimal from "decimal.js";

const syndicateSchema = z.object({
  amount: z.number().positive(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ dealId: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!canInvest(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { dealId } = await params;
  const body = await req.json();
  const parsed = syndicateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  const { amount } = parsed.data;

  // Use a transaction to ensure atomicity
  try {
    const result = await prisma.$transaction(async (tx) => {
      const deal = await tx.deal.findUnique({ where: { id: dealId } });
      if (!deal) throw new Error("Deal not found");
      if (deal.status !== "OPEN_FOR_SYNDICATION") {
        throw new Error("Deal is not open for syndication");
      }

      const syndicationOpen = new Decimal(deal.syndicationOpen.toString());
      const investAmount = new Decimal(amount);
      const minAmount = new Decimal(deal.syndicationMin.toString());
      const maxAmount = deal.syndicationMax
        ? Decimal.min(
            new Decimal(deal.syndicationMax.toString()),
            syndicationOpen
          )
        : syndicationOpen;

      if (investAmount.lt(minAmount)) {
        throw new Error(`Minimum investment is $${minAmount.toFixed(2)}`);
      }
      if (investAmount.gt(maxAmount)) {
        throw new Error(`Maximum investment is $${maxAmount.toFixed(2)}`);
      }
      if (investAmount.gt(syndicationOpen)) {
        throw new Error("Amount exceeds remaining capacity");
      }

      // Check for existing syndication
      const existing = await tx.syndication.findUnique({
        where: { dealId_userId: { dealId, userId: session.user.id } },
      });
      if (existing) throw new Error("You have already invested in this deal");

      // Calculate ownership percentage
      const totalFunded = new Decimal(deal.fundedAmount.toString());
      const ownershipPct = investAmount.div(totalFunded).mul(100);

      // Create syndication
      const syndication = await tx.syndication.create({
        data: {
          dealId,
          userId: session.user.id,
          amount: investAmount.toNumber(),
          ownershipPct: ownershipPct.toDecimalPlaces(4).toNumber(),
        },
      });

      // Update remaining capacity
      const newOpen = syndicationOpen.minus(investAmount);
      const updateData: Record<string, unknown> = {
        syndicationOpen: newOpen.toNumber(),
      };

      // Auto-transition to FULLY_ALLOCATED if filled
      if (newOpen.lte(0)) {
        updateData.status = "FULLY_ALLOCATED";
        updateData.statusChangedAt = new Date();
      }

      await tx.deal.update({ where: { id: dealId }, data: updateData });

      // Recalculate all ownership percentages
      const allSyndications = await tx.syndication.findMany({
        where: { dealId },
      });
      const totalSyndicated = allSyndications.reduce(
        (sum, s) => sum.plus(new Decimal(s.amount.toString())),
        new Decimal(0)
      );
      for (const s of allSyndications) {
        const pct = new Decimal(s.amount.toString())
          .div(totalSyndicated)
          .mul(100);
        await tx.syndication.update({
          where: { id: s.id },
          data: { ownershipPct: pct.toDecimalPlaces(4).toNumber() },
        });
      }

      return syndication;
    });

    await logAction({
      action: "SYNDICATION_COMMITTED",
      actorId: session.user.id,
      resourceType: "deal",
      resourceId: dealId,
      metadata: { amount, syndicationId: result.id },
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to syndicate";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
