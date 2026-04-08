import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/permissions";
import { logAction } from "@/lib/audit";
import { z } from "zod";

const createDealSchema = z.object({
  merchantName: z.string().min(1),
  merchantDba: z.string().optional(),
  merchantIndustry: z.string().optional(),
  merchantState: z.string().optional(),
  fundedAmount: z.number().positive(),
  paybackAmount: z.number().positive(),
  factorRate: z.number().positive(),
  holdbackPercentage: z.number().optional(),
  termDays: z.number().int().positive().optional(),
  paymentFrequency: z.string().optional(),
  expectedPayments: z.number().int().positive().optional(),
  syndicationMin: z.number().positive().default(100),
  syndicationMax: z.number().positive().optional(),
  notes: z.string().optional(),
  internalNotes: z.string().optional(),
});

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const where: Record<string, unknown> = {};
  if (status) {
    where.status = status;
  }

  const deals = await prisma.deal.findMany({
    where,
    include: {
      _count: { select: { syndications: true, payments: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(deals);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = createDealSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid deal data", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;

  const deal = await prisma.deal.create({
    data: {
      merchantName: data.merchantName,
      merchantDba: data.merchantDba,
      merchantIndustry: data.merchantIndustry,
      merchantState: data.merchantState,
      fundedAmount: data.fundedAmount,
      paybackAmount: data.paybackAmount,
      factorRate: data.factorRate,
      holdbackPercentage: data.holdbackPercentage,
      termDays: data.termDays,
      paymentFrequency: data.paymentFrequency,
      expectedPayments: data.expectedPayments,
      syndicationMin: data.syndicationMin,
      syndicationMax: data.syndicationMax,
      syndicationOpen: data.fundedAmount,
      notes: data.notes,
      internalNotes: data.internalNotes,
      createdById: session.user.id,
    },
  });

  await logAction({
    action: "DEAL_CREATED",
    actorId: session.user.id,
    resourceType: "deal",
    resourceId: deal.id,
    metadata: { merchantName: data.merchantName, fundedAmount: data.fundedAmount },
  });

  return NextResponse.json(deal, { status: 201 });
}
