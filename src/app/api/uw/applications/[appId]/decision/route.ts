import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUnderwriter } from "@/lib/uw/permissions";
import { decisionSchema } from "@/lib/uw/validation";
import { gradePaper } from "@/lib/uw/grading/paper-grade";
import { logAction, getRequestContext } from "@/lib/audit";
import type { BankStatementMetrics } from "@/lib/uw/statements/types";
import type { UwAppStatus } from "@prisma/client";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ appId: string }> }
) {
  const guard = await requireUnderwriter();
  if (!guard.ok) {
    return NextResponse.json({ error: "Forbidden" }, { status: guard.status });
  }
  const { appId } = await params;

  const body = await req.json();
  const parsed = decisionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const app = await prisma.uwApplication.findUnique({
    where: { id: appId },
    include: {
      owners: { orderBy: { ownershipPct: "desc" } },
      bankAnalyses: { orderBy: { createdAt: "desc" }, take: 1 },
      vendorPulls: true,
    },
  });
  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const latestAnalysis = app.bankAnalyses[0];
  if (!latestAnalysis && parsed.data.decision === "approve") {
    return NextResponse.json(
      { error: "Cannot approve without a bank analysis" },
      { status: 400 }
    );
  }

  const consumerPull = app.vendorPulls.find(
    (p) => p.vendor === "microbilt_consumer_credit" && p.status === "ok"
  );
  const fico =
    consumerPull && consumerPull.resultJson
      ? ((consumerPull.resultJson as { fico?: number }).fico ?? null)
      : (app.owners[0]?.ficoClaim ?? null);

  const grade = latestAnalysis
    ? gradePaper({
        metrics: latestAnalysis.metricsJson as unknown as BankStatementMetrics,
        fico,
        timeInBusinessMonths: app.timeInBusinessMonths,
      })
    : { grade: "UNGRADED" as const, rationale: ["No bank analysis"] };

  const nextStatus: UwAppStatus =
    parsed.data.decision === "approve"
      ? "APPROVED"
      : parsed.data.decision === "decline"
        ? "DECLINED"
        : "DOCS_PENDING";

  const decision = await prisma.$transaction(async (tx) => {
    const d = await tx.uwDecision.create({
      data: {
        applicationId: appId,
        decidedById: guard.user.id,
        decision: parsed.data.decision,
        paperGrade: grade.grade,
        notes: parsed.data.notes || null,
        riskFlagsJson: latestAnalysis
          ? {
              flags:
                (latestAnalysis.metricsJson as unknown as BankStatementMetrics)
                  .flags ?? [],
              rationale: grade.rationale,
            }
          : undefined,
      },
    });
    await tx.uwApplication.update({
      where: { id: appId },
      data: { status: nextStatus, paperGrade: grade.grade },
    });
    return d;
  });

  const ctx = getRequestContext(req);
  await logAction({
    action: "UW_DECISION_MADE",
    actorId: guard.user.id,
    resourceType: "UwApplication",
    resourceId: appId,
    metadata: {
      decision: parsed.data.decision,
      grade: grade.grade,
      decisionId: decision.id,
    },
    ipAddress: ctx.ipAddress,
    userAgent: ctx.userAgent,
  });

  return NextResponse.json({ decisionId: decision.id, grade: grade.grade });
}
