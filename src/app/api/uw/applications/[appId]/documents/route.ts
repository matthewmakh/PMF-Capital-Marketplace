import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUnderwriter } from "@/lib/uw/permissions";
import { registerDocSchema } from "@/lib/uw/validation";
import { logAction, getRequestContext } from "@/lib/audit";
import { runTamperChecks } from "@/lib/uw/tamper/composite";

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
  const parsed = registerDocSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const app = await prisma.uwApplication.findUnique({ where: { id: appId } });
  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const doc = await prisma.uwDocument.create({
    data: {
      applicationId: appId,
      docType: parsed.data.docType,
      s3Key: parsed.data.s3Key,
      filename: parsed.data.filename,
      contentType: parsed.data.contentType,
      sizeBytes: parsed.data.sizeBytes,
      statementMonth: parsed.data.statementMonth ?? null,
      statementYear: parsed.data.statementYear ?? null,
      uploadedById: guard.user.id,
    },
  });

  if (app.status === "INTAKE") {
    await prisma.uwApplication.update({
      where: { id: appId },
      data: { status: "DOCS_PENDING" },
    });
  }

  const ctx = getRequestContext(req);
  await logAction({
    action: "UW_DOC_UPLOADED",
    actorId: guard.user.id,
    resourceType: "UwDocument",
    resourceId: doc.id,
    metadata: { applicationId: appId, docType: parsed.data.docType },
    ipAddress: ctx.ipAddress,
    userAgent: ctx.userAgent,
  });

  // Fire-and-forget tamper detection on PDF bank statements.
  if (
    parsed.data.docType === "BANK_STATEMENT" &&
    parsed.data.contentType.includes("pdf")
  ) {
    void runTamperChecks({ documentId: doc.id }).catch(() => {
      // Failures here shouldn't block upload acknowledgment; they're stored
      // as the tamper check rows themselves when they do succeed.
    });
  }

  return NextResponse.json({ id: doc.id });
}
