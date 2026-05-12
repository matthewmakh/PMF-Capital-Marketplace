import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUnderwriter } from "@/lib/uw/permissions";
import { runTamperChecks } from "@/lib/uw/tamper/composite";
import { logAction, getRequestContext } from "@/lib/audit";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ appId: string; docId: string }> }
) {
  const guard = await requireUnderwriter();
  if (!guard.ok) {
    return NextResponse.json({ error: "Forbidden" }, { status: guard.status });
  }
  const { appId, docId } = await params;
  const doc = await prisma.uwDocument.findUnique({ where: { id: docId } });
  if (!doc || doc.applicationId !== appId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const result = await runTamperChecks({ documentId: docId });

  const ctx = getRequestContext(req);
  await logAction({
    action: "UW_TAMPER_CHECK",
    actorId: guard.user.id,
    resourceType: "UwDocument",
    resourceId: docId,
    metadata: { applicationId: appId, ...result },
    ipAddress: ctx.ipAddress,
    userAgent: ctx.userAgent,
  });

  return NextResponse.json(result);
}
