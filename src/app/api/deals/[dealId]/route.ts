import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/permissions";
import { logAction, getRequestContext } from "@/lib/audit";
import { DealStatus } from "@prisma/client";

// Legal deal status transitions — anything not listed here is rejected
const VALID_STATUS_TRANSITIONS: Record<DealStatus, DealStatus[]> = {
  PENDING_REVIEW: ["OPEN_FOR_SYNDICATION", "CLOSED"],
  OPEN_FOR_SYNDICATION: ["FULLY_ALLOCATED", "PENDING_REVIEW", "CLOSED"],
  FULLY_ALLOCATED: ["FUNDED", "OPEN_FOR_SYNDICATION", "CLOSED"],
  FUNDED: ["ACTIVE_REPAYING", "CLOSED"],
  ACTIVE_REPAYING: ["DELINQUENT", "PAID_OFF", "CLOSED"],
  DELINQUENT: ["ACTIVE_REPAYING", "DEFAULTED", "CLOSED"],
  DEFAULTED: ["CLOSED"],
  PAID_OFF: ["CLOSED"],
  CLOSED: [],
};

// Financial fields that cannot be edited once the deal has syndications or payments
const LOCKED_AFTER_SYNDICATION = [
  "fundedAmount",
  "paybackAmount",
  "factorRate",
  "holdbackPercentage",
];

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

  // Non-admins can only view deals they're invested in or that are open
  if (!isAdmin(session.user.role)) {
    const openStatuses = ["OPEN_FOR_SYNDICATION", "FULLY_ALLOCATED"];
    const isInvested = deal.syndications.some(
      (s) => s.userId === session.user.id
    );
    if (!openStatuses.includes(deal.status) && !isInvested) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    // Strip internal notes for non-admins
    return NextResponse.json({ ...deal, internalNotes: undefined });
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

  const deal = await prisma.deal.findUnique({
    where: { id: dealId },
    include: { _count: { select: { syndications: true, payments: true } } },
  });
  if (!deal) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Handle status change
  if (body.status) {
    const targetStatus = body.status as DealStatus;

    // Validate the transition is legal
    const allowed = VALID_STATUS_TRANSITIONS[deal.status];
    if (!allowed || !allowed.includes(targetStatus)) {
      return NextResponse.json(
        {
          error: `Cannot transition from ${deal.status} to ${targetStatus}. ` +
            `Allowed transitions: ${allowed?.length ? allowed.join(", ") : "none (terminal state)"}`,
        },
        { status: 400 }
      );
    }

    const updated = await prisma.deal.update({
      where: { id: dealId },
      data: {
        status: targetStatus,
        statusChangedAt: new Date(),
        reviewedById: session.user.id,
        ...(targetStatus === "FUNDED" ? { fundedAt: new Date() } : {}),
        ...(targetStatus === "CLOSED" ? { closedAt: new Date() } : {}),
      },
    });

    await logAction({
      action: "DEAL_STATUS_CHANGED",
      actorId: session.user.id,
      resourceType: "deal",
      resourceId: dealId,
      metadata: { from: deal.status, to: targetStatus },
      ...getRequestContext(req),
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

  // Block financial field edits once deal has syndications or payments
  const hasSyndicationsOrPayments =
    deal._count.syndications > 0 || deal._count.payments > 0;
  if (hasSyndicationsOrPayments) {
    const lockedAttempts = Object.keys(data).filter((f) =>
      LOCKED_AFTER_SYNDICATION.includes(f)
    );
    if (lockedAttempts.length > 0) {
      return NextResponse.json(
        {
          error: `Cannot modify ${lockedAttempts.join(", ")} after deal has syndications or payments. ` +
            `These fields are locked to protect investor accounting.`,
        },
        { status: 400 }
      );
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
    ...getRequestContext(req),
  });

  return NextResponse.json(updated);
}
