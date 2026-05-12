import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  exchangePublicToken,
  fetchStatements,
} from "@/lib/uw/statements/plaid-statements";
import { computeMetrics } from "@/lib/uw/statements/metrics";
import { logAction, getRequestContext } from "@/lib/audit";

const schema = z.object({ publicToken: z.string().min(1) });

export async function POST(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const app = await prisma.uwApplication.findUnique({
    where: { publicToken: token },
  });
  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

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

  await prisma.uwBankAnalysis.create({
    data: {
      applicationId: app.id,
      source: "plaid",
      periodStart: new Date(metrics.period.start),
      periodEnd: new Date(metrics.period.end),
      metricsJson: metrics as unknown as object,
      rawJson: { statementCount: statements.length },
    },
  });

  await prisma.uwApplication.update({
    where: { id: app.id },
    data: { status: "UNDER_REVIEW" },
  });

  const ctx = getRequestContext(req);
  await logAction({
    action: "UW_BANK_LINKED",
    resourceType: "UwApplication",
    resourceId: app.id,
    metadata: { source: "plaid", viaPortal: true },
    ipAddress: ctx.ipAddress,
    userAgent: ctx.userAgent,
  });

  return NextResponse.json({ ok: true });
}
