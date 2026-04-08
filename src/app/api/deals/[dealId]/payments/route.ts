import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/permissions";
import { logAction } from "@/lib/audit";
import { distributePayment } from "@/lib/calculations/pro-rata";
import { z } from "zod";
import Decimal from "decimal.js";

const paymentSchema = z.object({
  amount: z.number().positive(),
  paymentDate: z.string(),
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
      { error: "Invalid payment data" },
      { status: 400 }
    );
  }

  const { amount, paymentDate, memo } = parsed.data;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const deal = await tx.deal.findUnique({ where: { id: dealId } });
      if (!deal) throw new Error("Deal not found");

      // Get next payment number
      const lastPayment = await tx.payment.findFirst({
        where: { dealId },
        orderBy: { paymentNumber: "desc" },
      });
      const paymentNumber = (lastPayment?.paymentNumber ?? 0) + 1;

      // Create payment
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

      // Distribute pro-rata
      await distributePayment(
        tx,
        payment.id,
        dealId,
        new Decimal(amount)
      );

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

      // Check if deal is paid off
      if (
        newCollected.gte(new Decimal(deal.paybackAmount.toString())) &&
        deal.status !== "PAID_OFF"
      ) {
        updateData.status = "PAID_OFF";
        updateData.statusChangedAt = new Date();
        updateData.closedAt = new Date();
      }

      await tx.deal.update({ where: { id: dealId }, data: updateData });

      return payment;
    });

    await logAction({
      action: "PAYMENT_POSTED",
      actorId: session.user.id,
      resourceType: "deal",
      resourceId: dealId,
      metadata: { paymentId: result.id, amount, paymentNumber: result.paymentNumber },
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to post payment";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
