import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUnderwriter } from "@/lib/uw/permissions";
import {
  exchangePublicToken,
  fetchStatements,
} from "@/lib/uw/statements/plaid-statements";
import { computeMetrics } from "@/lib/uw/statements/metrics";
import { logAction, getRequestContext } from "@/lib/audit";

const schema = z.object({ publicToken: z.string().min(1) });

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
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const app = await prisma.uwApplication.findUnique({ where: { id: appId } });
  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { access_token } = await exchangePublicToken(parsed.data.publicToken);

  const end = new Date();
  const start = new Date();
  start.setMonth(start.getMonth() - 4);
  const statements = await fetchStatements({
    accessToken: access_token,
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  });

  const metrics = computeMetrics(statements);
  const analysis = await prisma.uwBankAnalysis.create({
    data: {
      applicationId: appId,
      source: "plaid",
      periodStart: new Date(metrics.period.start),
      periodEnd: new Date(metrics.period.end),
      metricsJson: metrics as unknown as object,
      rawJson: { statementCount: statements.length, accessToken: "<redacted>" },
    },
  });

  await prisma.uwApplication.update({
    where: { id: appId },
    data: { status: "UNDER_REVIEW" },
  });

  const ctx = getRequestContext(req);
  await logAction({
    action: "UW_BANK_LINKED",
    actorId: guard.user.id,
    resourceType: "UwApplication",
    resourceId: appId,
    metadata: { source: "plaid", analysisId: analysis.id },
    ipAddress: ctx.ipAddress,
    userAgent: ctx.userAgent,
  });

  return NextResponse.json({ analysisId: analysis.id });
}
