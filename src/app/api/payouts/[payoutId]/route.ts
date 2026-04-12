import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/permissions";
import { logAction, getRequestContext } from "@/lib/audit";
import { PayoutStatus } from "@prisma/client";

// Valid status transitions — enforced in code, not just UI
const VALID_TRANSITIONS: Record<PayoutStatus, PayoutStatus[]> = {
  PENDING: ["APPROVED", "DENIED"],
  APPROVED: ["PROCESSING", "COMPLETED", "DENIED"],
  PROCESSING: ["COMPLETED"],
  COMPLETED: [],
  DENIED: [],
};

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

  const statusMap: Record<string, PayoutStatus> = {
    approve: "APPROVED",
    deny: "DENIED",
    complete: "COMPLETED",
    process: "PROCESSING",
  };

  const targetStatus = statusMap[action];
  if (!targetStatus) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Read inside transaction for atomicity — prevents TOCTOU races
      const payout = await tx.payoutRequest.findUnique({
        where: { id: payoutId },
      });

      if (!payout) throw new Error("Payout not found");

      // Validate status transition
      const allowed = VALID_TRANSITIONS[payout.status];
      if (!allowed.includes(targetStatus)) {
        throw new Error(
          `Cannot transition from ${payout.status} to ${targetStatus}. ` +
            `Allowed: ${allowed.length > 0 ? allowed.join(", ") : "none (terminal state)"}`
        );
      }

      // For denial, require a reason
      if (targetStatus === "DENIED" && !denialReason?.trim()) {
        throw new Error("Denial reason is required");
      }

      // Build update data
      const updateData: Record<string, unknown> = {
        status: targetStatus,
      };

      if (targetStatus === "APPROVED") {
        updateData.approvedById = session.user.id;
        updateData.approvedAt = new Date();
      } else if (targetStatus === "DENIED") {
        updateData.approvedById = session.user.id;
        updateData.deniedAt = new Date();
        updateData.denialReason = denialReason;
      } else if (targetStatus === "PROCESSING") {
        updateData.processedAt = new Date();
      } else if (targetStatus === "COMPLETED") {
        updateData.completedAt = new Date();
        if (!payout.processedAt) {
          updateData.processedAt = new Date();
        }
      }

      const updated = await tx.payoutRequest.update({
        where: { id: payoutId },
        data: updateData,
      });

      return { updated, previousStatus: payout.status };
    });

    await logAction({
      action:
        targetStatus === "APPROVED"
          ? "PAYOUT_APPROVED"
          : targetStatus === "DENIED"
            ? "PAYOUT_DENIED"
            : "PAYOUT_COMPLETED",
      actorId: session.user.id,
      resourceType: "payout",
      resourceId: payoutId,
      metadata: {
        amount: Number(result.updated.amount),
        previousStatus: result.previousStatus,
        newStatus: targetStatus,
        ...(denialReason ? { reason: denialReason } : {}),
      },
      ...getRequestContext(req),
    });

    return NextResponse.json(result.updated);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to update payout";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
