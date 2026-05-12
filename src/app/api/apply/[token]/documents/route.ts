import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { registerDocSchema } from "@/lib/uw/validation";
import { logAction, getRequestContext } from "@/lib/audit";

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
  const parsed = registerDocSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const doc = await prisma.uwDocument.create({
    data: {
      applicationId: app.id,
      docType: parsed.data.docType,
      s3Key: parsed.data.s3Key,
      filename: parsed.data.filename,
      contentType: parsed.data.contentType,
      sizeBytes: parsed.data.sizeBytes,
      statementMonth: parsed.data.statementMonth ?? null,
      statementYear: parsed.data.statementYear ?? null,
    },
  });

  if (app.status === "INTAKE") {
    await prisma.uwApplication.update({
      where: { id: app.id },
      data: { status: "DOCS_PENDING" },
    });
  }

  const ctx = getRequestContext(req);
  await logAction({
    action: "UW_DOC_UPLOADED",
    resourceType: "UwDocument",
    resourceId: doc.id,
    metadata: { applicationId: app.id, docType: parsed.data.docType, viaPortal: true },
    ipAddress: ctx.ipAddress,
    userAgent: ctx.userAgent,
  });

  return NextResponse.json({ id: doc.id });
}
