import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/permissions";
import { logAction, getRequestContext } from "@/lib/audit";
import { calculateAvailableBalance } from "@/lib/calculations/pro-rata";
import { z } from "zod";
import Decimal from "decimal.js";

const createPayoutSchema = z.object({
  amount: z.number().positive("Payout amount must be positive"),
  notes: z.string().optional(),
});

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const where = isAdmin(session.user.role) ? {} : { userId: session.user.id };

  const payouts = await prisma.payoutRequest.findMany({
    where,
    include: {
      user: { select: { firstName: true, lastName: true, email: true } },
      approvedBy: { select: { firstName: true, lastName: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(payouts);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createPayoutSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((i) => i.message).join("; ") },
      { status: 400 }
    );
  }

  const { amount, notes } = parsed.data;

  // Use a transaction to prevent race conditions on balance check
  try {
    const payout = await prisma.$transaction(async (tx) => {
      // Calculate total distributed from non-reversed distributions
      const syndications = await tx.syndication.findMany({
        where: { userId: session.user.id },
      });
      const totalDistributed = syndications.reduce(
        (sum, s) => sum.plus(new Decimal(s.totalDistributed.toString())),
        new Decimal(0)
      );

      // Calculate total holds: PENDING + APPROVED + PROCESSING + COMPLETED payouts
      const payoutHolds = await tx.payoutRequest.aggregate({
        where: {
          userId: session.user.id,
          status: { in: ["PENDING", "APPROVED", "PROCESSING", "COMPLETED"] },
        },
        _sum: { amount: true },
      });
      const totalHolds = new Decimal(
        (payoutHolds._sum.amount || 0).toString()
      );

      const available = calculateAvailableBalance(
        totalDistributed.toString(),
        totalHolds.toString()
      );
      const requestAmount = new Decimal(amount);

      if (requestAmount.gt(available)) {
        throw new Error(
          `Insufficient balance. Available: $${available.toDecimalPlaces(2).toString()}, ` +
            `Requested: $${requestAmount.toDecimalPlaces(2).toString()}`
        );
      }

      return tx.payoutRequest.create({
        data: {
          userId: session.user.id,
          amount,
          notes,
        },
      });
    });

    await logAction({
      action: "PAYOUT_REQUESTED",
      actorId: session.user.id,
      resourceType: "payout",
      resourceId: payout.id,
      metadata: { amount },
      ...getRequestContext(req),
    });

    return NextResponse.json(payout, { status: 201 });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to request payout";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
