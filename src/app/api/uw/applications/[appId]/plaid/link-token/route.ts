import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUnderwriter } from "@/lib/uw/permissions";
import { createLinkToken } from "@/lib/uw/statements/plaid-statements";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ appId: string }> }
) {
  const guard = await requireUnderwriter();
  if (!guard.ok) {
    return NextResponse.json({ error: "Forbidden" }, { status: guard.status });
  }
  const { appId } = await params;
  const app = await prisma.uwApplication.findUnique({ where: { id: appId } });
  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const token = await createLinkToken({ userId: `uw-${appId}` });
  return NextResponse.json(token);
}
