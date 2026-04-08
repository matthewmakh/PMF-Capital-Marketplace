import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/permissions";
import { logAction } from "@/lib/audit";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ payoutId: string }> }
) {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { payoutId } = await params;
  const body = await req.json();
  const { action, denialReason } = body;

  const payout = await prisma.payoutRequest.findUnique({
    where: { id: payoutId },
  });

  if (!payout) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (payout.status !== "PENDING") {
    return NextResponse.json(
      { error: "Payout is not pending" },
      { status: 400 }
    );
  }

  if (action === "approve") {
    const updated = await prisma.payoutRequest.update({
      where: { id: payoutId },
      data: {
        status: "APPROVED",
        approvedById: session.user.id,
        approvedAt: new Date(),
      },
    });

    await logAction({
      action: "PAYOUT_APPROVED",
      actorId: session.user.id,
      resourceType: "payout",
      resourceId: payoutId,
      metadata: { amount: Number(payout.amount) },
    });

    return NextResponse.json(updated);
  }

  if (action === "deny") {
    const updated = await prisma.payoutRequest.update({
      where: { id: payoutId },
      data: {
        status: "DENIED",
        approvedById: session.user.id,
        deniedAt: new Date(),
        denialReason,
      },
    });

    await logAction({
      action: "PAYOUT_DENIED",
      actorId: session.user.id,
      resourceType: "payout",
      resourceId: payoutId,
      metadata: { amount: Number(payout.amount), reason: denialReason },
    });

    return NextResponse.json(updated);
  }

  if (action === "complete") {
    const updated = await prisma.payoutRequest.update({
      where: { id: payoutId },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
      },
    });

    await logAction({
      action: "PAYOUT_COMPLETED",
      actorId: session.user.id,
      resourceType: "payout",
      resourceId: payoutId,
      metadata: { amount: Number(payout.amount) },
    });

    return NextResponse.json(updated);
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
