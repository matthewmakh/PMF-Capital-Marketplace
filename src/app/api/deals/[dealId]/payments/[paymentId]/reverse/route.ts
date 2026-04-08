import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/permissions";
import { logAction } from "@/lib/audit";
import { reversePayment } from "@/lib/calculations/pro-rata";
import { z } from "zod";

const reverseSchema = z.object({
  reason: z.string().min(1, "Reversal reason is required"),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ dealId: string; paymentId: string }> }
) {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { dealId, paymentId } = await params;
  const body = await req.json();
  const parsed = reverseSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((i) => i.message).join("; ") },
      { status: 400 }
    );
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Verify payment belongs to this deal
      const payment = await tx.payment.findUnique({ where: { id: paymentId } });
      if (!payment || payment.dealId !== dealId) {
        throw new Error("Payment not found for this deal");
      }

      // Snapshot before state
      const deal = await tx.deal.findUniqueOrThrow({ where: { id: dealId } });
      const beforeCollected = deal.totalCollected.toString();

      // Execute reversal (marks payment, decrements all running totals)
      const reversed = await reversePayment(
        tx,
        paymentId,
        session.user.id,
        parsed.data.reason
      );

      // Get after state
      const dealAfter = await tx.deal.findUniqueOrThrow({ where: { id: dealId } });

      return {
        payment: reversed,
        beforeCollected,
        afterCollected: dealAfter.totalCollected.toString(),
      };
    });

    await logAction({
      action: "PAYMENT_REVERSED",
      actorId: session.user.id,
      resourceType: "deal",
      resourceId: dealId,
      metadata: {
        paymentId,
        amount: Number(result.payment.amount),
        paymentNumber: result.payment.paymentNumber,
        reason: parsed.data.reason,
        beforeCollected: result.beforeCollected,
        afterCollected: result.afterCollected,
      },
    });

    return NextResponse.json({ reversed: true, paymentId });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to reverse payment";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
