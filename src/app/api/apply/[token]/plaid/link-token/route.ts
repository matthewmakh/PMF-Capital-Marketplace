import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createLinkToken } from "@/lib/uw/statements/plaid-statements";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const app = await prisma.uwApplication.findUnique({
    where: { publicToken: token },
  });
  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const result = await createLinkToken({ userId: `apply-${app.id}` });
  return NextResponse.json(result);
}
