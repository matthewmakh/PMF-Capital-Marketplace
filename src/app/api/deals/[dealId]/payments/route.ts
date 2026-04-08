import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/permissions";
import { logAction } from "@/lib/audit";
import { distributePayment } from "@/lib/calculations/pro-rata";
import { z } from "zod";
import Decimal from "decimal.js";

const paymentSchema = z.object({
  amount: z.number().positive("Payment amount must be positive"),
  paymentDate: z.string().refine((d) => !isNaN(Date.parse(d)), "Invalid date"),
  memo: z.string().optional(),
});

export async function GET(
  req: Request,
  { params }: { params: Promise<{ dealId: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { dealId } = await params;

  const payments = await prisma.payment.findMany({
    where: { dealId },
    orderBy: { paymentDate: "desc" },
    include: {
      postedBy: { select: { firstName: true, lastName: true } },
    },
  });

  return NextResponse.json(payments);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ dealId: string }> }
) {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { dealId } = await params;
  const body = await req.json();
  const parsed = paymentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((i) => i.message).join("; ") },
      { status: 400 }
    );
  }

  const { amount, paymentDate, memo } = parsed.data;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const deal = await tx.deal.findUnique({ where: { id: dealId } });
      if (!deal) throw new Error("Deal not found");

      // Status guard — distributePayment also checks, but fail early with clear message
      const payableStatuses = ["FUNDED", "ACTIVE_REPAYING", "DELINQUENT"];
      if (!payableStatuses.includes(deal.status)) {
        throw new Error(
          `Cannot post payment: deal status is "${deal.status}". ` +
            `Must be one of: ${payableStatuses.join(", ")}`
        );
      }

      // Check deal has syndications
      const syndicationCount = await tx.syndication.count({
        where: { dealId, isActive: true },
      });
      if (syndicationCount === 0) {
        throw new Error("Cannot post payment: deal has no active syndications");
      }

      // Get next payment number
      const lastPayment = await tx.payment.findFirst({
        where: { dealId },
        orderBy: { paymentNumber: "desc" },
      });
      const paymentNumber = (lastPayment?.paymentNumber ?? 0) + 1;

      // Snapshot state before
      const beforeCollected = deal.totalCollected.toString();

      // Create payment record
      const payment = await tx.payment.create({
        data: {
          dealId,
          amount,
          paymentDate: new Date(paymentDate),
          paymentNumber,
          memo,
          postedById: session.user.id,
        },
      });

      // Distribute pro-rata (handles rounding, principal/profit split)
      await distributePayment(tx, payment.id, dealId, new Decimal(amount));

      // Update deal totals
      const newCollected = new Decimal(deal.totalCollected.toString()).plus(
        new Decimal(amount)
      );

      const updateData: Record<string, unknown> = {
        totalCollected: newCollected.toDecimalPlaces(2).toNumber(),
        lastPaymentAt: new Date(paymentDate),
      };

      if (!deal.firstPaymentAt) {
        updateData.firstPaymentAt = new Date(paymentDate);
      }

      // Auto-transition: deal becomes ACTIVE_REPAYING on first payment if FUNDED
      if (deal.status === "FUNDED") {
        updateData.status = "ACTIVE_REPAYING";
        updateData.statusChangedAt = new Date();
      }

      // Check if deal is paid off
      const paybackAmount = new Decimal(deal.paybackAmount.toString());
      if (newCollected.gte(paybackAmount) && deal.status !== "PAID_OFF") {
        updateData.status = "PAID_OFF";
        updateData.statusChangedAt = new Date();
        updateData.closedAt = new Date();
      }

      await tx.deal.update({ where: { id: dealId }, data: updateData });

      return { payment, beforeCollected, afterCollected: newCollected.toString() };
    });

    // Audit with before/after state
    await logAction({
      action: "PAYMENT_POSTED",
      actorId: session.user.id,
      resourceType: "deal",
      resourceId: dealId,
      metadata: {
        paymentId: result.payment.id,
        amount,
        paymentNumber: result.payment.paymentNumber,
        beforeCollected: result.beforeCollected,
        afterCollected: result.afterCollected,
      },
    });

    return NextResponse.json(result.payment, { status: 201 });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to post payment";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
