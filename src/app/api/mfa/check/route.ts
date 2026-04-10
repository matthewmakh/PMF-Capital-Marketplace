import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({
    mfaRequired: session.user.mfaRequired,
    mfaEnabled: session.user.mfaEnabled,
    mfaVerified: session.user.mfaVerified,
  });
}
