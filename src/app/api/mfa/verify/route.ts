import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyTOTP, verifyRecoveryCode, decryptSecret } from "@/lib/mfa";
import { logAction } from "@/lib/audit";
import { checkRateLimit, resetRateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const schema = z.object({ code: z.string().min(1), isRecoveryCode: z.boolean().optional() });

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { code, isRecoveryCode } = parsed.data;
  const rlKey = `mfa:${session.user.id}`;
  const rl = checkRateLimit(rlKey);
  if (!rl.allowed) {
    await logAction({ action: "USER_LOGIN", actorId: session.user.id, metadata: { event: "mfa_rate_limited" } });
    return NextResponse.json({ error: `Too many attempts. Try again in ${rl.retryAfterSeconds}s.` }, { status: 429 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { mfaSecret: true, mfaEnabled: true, mfaRecoveryCodes: true } });
  if (!user?.mfaEnabled || !user.mfaSecret) return NextResponse.json({ error: "MFA not enabled" }, { status: 400 });

  if (isRecoveryCode) {
    const result = await prisma.$transaction(async (tx) => {
      const u = await tx.user.findUniqueOrThrow({ where: { id: session.user.id }, select: { mfaRecoveryCodes: true } });
      const hashes: string[] = JSON.parse(u.mfaRecoveryCodes || "[]");
      const idx = await verifyRecoveryCode(code, hashes);
      if (idx === -1) throw new Error("INVALID");
      hashes.splice(idx, 1);
      await tx.user.update({ where: { id: session.user.id }, data: { mfaRecoveryCodes: JSON.stringify(hashes), mfaVerifiedAt: new Date() } });
      return hashes.length;
    }).catch((e) => { if (e.message === "INVALID") return null; throw e; });

    if (result === null) {
      await logAction({ action: "USER_LOGIN", actorId: session.user.id, metadata: { event: "mfa_recovery_failed" } });
      return NextResponse.json({ error: "Invalid recovery code" }, { status: 400 });
    }
    resetRateLimit(rlKey);
    await logAction({ action: "USER_LOGIN", actorId: session.user.id, metadata: { event: "mfa_recovery_used", remaining: result } });
    return NextResponse.json({ verified: true, remainingRecoveryCodes: result });
  }

  const rawSecret = decryptSecret(user.mfaSecret);
  if (!verifyTOTP(rawSecret, code)) {
    await logAction({ action: "USER_LOGIN", actorId: session.user.id, metadata: { event: "mfa_failed", attempt: rl.attempts } });
    return NextResponse.json({ error: "Invalid code" }, { status: 400 });
  }

  resetRateLimit(rlKey);
  await prisma.user.update({ where: { id: session.user.id }, data: { mfaVerifiedAt: new Date() } });
  await logAction({ action: "USER_LOGIN", actorId: session.user.id, metadata: { event: "mfa_verified" } });
  return NextResponse.json({ verified: true });
}
