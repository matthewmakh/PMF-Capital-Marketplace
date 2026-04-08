import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/permissions";
import { logAction } from "@/lib/audit";
import { DealStatus } from "@prisma/client";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ dealId: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { dealId } = await params;

  const deal = await prisma.deal.findUnique({
    where: { id: dealId },
    include: {
      syndications: {
        include: { user: { select: { firstName: true, lastName: true } } },
      },
      payments: { orderBy: { paymentDate: "desc" }, take: 20 },
      createdBy: { select: { firstName: true, lastName: true } },
      reviewedBy: { select: { firstName: true, lastName: true } },
    },
  });

  if (!deal) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(deal);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ dealId: string }> }
) {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { dealId } = await params;
  const body = await req.json();

  // Handle status change
  if (body.status) {
    const deal = await prisma.deal.findUnique({ where: { id: dealId } });
    if (!deal) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updated = await prisma.deal.update({
      where: { id: dealId },
      data: {
        status: body.status as DealStatus,
        statusChangedAt: new Date(),
        reviewedById: session.user.id,
        ...(body.status === "FUNDED" ? { fundedAt: new Date() } : {}),
        ...(body.status === "CLOSED" ? { closedAt: new Date() } : {}),
      },
    });

    await logAction({
      action: "DEAL_STATUS_CHANGED",
      actorId: session.user.id,
      resourceType: "deal",
      resourceId: dealId,
      metadata: { from: deal.status, to: body.status },
    });

    return NextResponse.json(updated);
  }

  // Handle general update
  const allowedFields = [
    "merchantName",
    "merchantDba",
    "merchantIndustry",
    "merchantState",
    "fundedAmount",
    "paybackAmount",
    "factorRate",
    "holdbackPercentage",
    "termDays",
    "paymentFrequency",
    "expectedPayments",
    "syndicationMin",
    "syndicationMax",
    "notes",
    "internalNotes",
  ];

  const data: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      data[field] = body[field];
    }
  }

  const updated = await prisma.deal.update({
    where: { id: dealId },
    data,
  });

  await logAction({
    action: "DEAL_UPDATED",
    actorId: session.user.id,
    resourceType: "deal",
    resourceId: dealId,
    metadata: { updatedFields: Object.keys(data).join(",") },
  });

  return NextResponse.json(updated);
}
