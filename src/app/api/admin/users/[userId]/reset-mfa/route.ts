import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageUsers } from "@/lib/permissions";
import { logAction } from "@/lib/audit";

export async function POST(req: Request, { params }: { params: Promise<{ userId: string }> }) {
  const session = await auth();
  if (!session?.user || !canManageUsers(session.user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { userId } = await params;
  const target = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true, mfaEnabled: true, firstName: true, lastName: true } });
  if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (!target.mfaEnabled) return NextResponse.json({ error: "User has no MFA" }, { status: 400 });
  await prisma.user.update({ where: { id: userId }, data: { mfaEnabled: false, mfaSecret: null, mfaRecoveryCodes: null, mfaVerifiedAt: null } });
  await logAction({ action: "SETTINGS_UPDATED", actorId: session.user.id, targetUserId: userId, metadata: { change: "mfa_admin_reset", targetEmail: target.email } });
  return NextResponse.json({ reset: true, message: `MFA reset for ${target.firstName} ${target.lastName}` });
}
