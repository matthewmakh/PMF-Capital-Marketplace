import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUnderwriter } from "@/lib/uw/permissions";
import { presignSchema } from "@/lib/uw/validation";
import { buildDocumentKey, presignUpload } from "@/lib/uw/storage/s3";
import {
  UW_ACCEPTED_MIME_TYPES,
  UW_MAX_UPLOAD_BYTES,
} from "@/lib/constants";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ appId: string }> }
) {
  const guard = await requireUnderwriter();
  if (!guard.ok) {
    return NextResponse.json({ error: "Forbidden" }, { status: guard.status });
  }
  const { appId } = await params;

  const app = await prisma.uwApplication.findUnique({ where: { id: appId } });
  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const parsed = presignSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  if (parsed.data.sizeBytes > UW_MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "File too large" }, { status: 413 });
  }
  if (!UW_ACCEPTED_MIME_TYPES.includes(parsed.data.contentType)) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 415 });
  }

  const key = buildDocumentKey(appId, parsed.data.filename);
  const signed = await presignUpload({
    key,
    contentType: parsed.data.contentType,
  });

  return NextResponse.json({ ...signed, key });
}
