import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUnderwriter } from "@/lib/uw/permissions";
import { analyzeBankStatement } from "@/lib/uw/statements/azure-doc-intel";
import { computeMetrics } from "@/lib/uw/statements/metrics";
import { presignDownload, isS3Configured } from "@/lib/uw/storage/s3";
import { logAction, getRequestContext } from "@/lib/audit";

// Runs Azure Document Intelligence over every BANK_STATEMENT document on the
// application that doesn't already have analysis, then stores the merged metrics.
export async function POST(
  req: Request,
  { params }: { params: Promise<{ appId: string }> }
) {
  const guard = await requireUnderwriter();
  if (!guard.ok) {
    return NextResponse.json({ error: "Forbidden" }, { status: guard.status });
  }
  const { appId } = await params;
  const app = await prisma.uwApplication.findUnique({
    where: { id: appId },
    include: {
      documents: { where: { docType: "BANK_STATEMENT" } },
    },
  });
  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (app.documents.length === 0) {
    return NextResponse.json(
      { error: "No bank statement documents to analyze" },
      { status: 400 }
    );
  }

  await prisma.uwApplication.update({
    where: { id: appId },
    data: { status: "ANALYZING" },
  });

  const allStatements = [];
  for (const doc of app.documents) {
    const url = isS3Configured()
      ? await presignDownload(doc.s3Key, 600)
      : undefined;
    const statements = await analyzeBankStatement({
      urlSource: url,
      filename: doc.filename,
    });
    allStatements.push(...statements);
  }

  const metrics = computeMetrics(allStatements);
  const analysis = await prisma.uwBankAnalysis.create({
    data: {
      applicationId: appId,
      source: "azure_doc_intel",
      periodStart: new Date(metrics.period.start),
      periodEnd: new Date(metrics.period.end),
      metricsJson: metrics as unknown as object,
      rawJson: { statementCount: allStatements.length },
    },
  });

  await prisma.uwApplication.update({
    where: { id: appId },
    data: { status: "UNDER_REVIEW" },
  });

  const ctx = getRequestContext(req);
  await logAction({
    action: "UW_ANALYSIS_RUN",
    actorId: guard.user.id,
    resourceType: "UwApplication",
    resourceId: appId,
    metadata: { source: "azure_doc_intel", analysisId: analysis.id, docCount: app.documents.length },
    ipAddress: ctx.ipAddress,
    userAgent: ctx.userAgent,
  });

  return NextResponse.json({ analysisId: analysis.id });
}
