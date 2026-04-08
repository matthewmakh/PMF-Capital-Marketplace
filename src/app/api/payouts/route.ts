import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/permissions";
import { logAction } from "@/lib/audit";
import { z } from "zod";

const createPayoutSchema = z.object({
  amount: z.number().positive(),
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
    return NextResponse.json({ error: "Invalid payout data" }, { status: 400 });
  }

  const { amount, notes } = parsed.data;

  // Calculate available balance
  const syndications = await prisma.syndication.findMany({
    where: { userId: session.user.id },
  });
  const totalDistributed = syndications.reduce(
    (s, i) => s + Number(i.totalDistributed),
    0
  );

  const existingPayouts = await prisma.payoutRequest.aggregate({
    where: {
      userId: session.user.id,
      status: { in: ["PENDING", "APPROVED", "PROCESSING", "COMPLETED"] },
    },
    _sum: { amount: true },
  });

  const availableBalance =
    totalDistributed - Number(existingPayouts._sum.amount || 0);

  if (amount > availableBalance) {
    return NextResponse.json(
      { error: `Insufficient balance. Available: $${availableBalance.toFixed(2)}` },
      { status: 400 }
    );
  }

  const payout = await prisma.payoutRequest.create({
    data: {
      userId: session.user.id,
      amount,
      notes,
    },
  });

  await logAction({
    action: "PAYOUT_REQUESTED",
    actorId: session.user.id,
    resourceType: "payout",
    resourceId: payout.id,
    metadata: { amount },
  });

  return NextResponse.json(payout, { status: 201 });
}
