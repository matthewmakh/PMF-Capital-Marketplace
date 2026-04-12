import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyTOTP, verifyRecoveryCode, decryptSecret } from "@/lib/mfa";
import { logAction, getRequestContext } from "@/lib/audit";
import { checkRateLimit, resetRateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const schema = z.object({ code: z.string().min(1), useRecoveryCode: z.boolean().optional() });

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Code required" }, { status: 400 });

  const rlKey = `mfa_disable:${session.user.id}`;
  const rl = checkRateLimit(rlKey);
  if (!rl.allowed) return NextResponse.json({ error: `Too many attempts. Try again in ${rl.retryAfterSeconds}s.` }, { status: 429 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { mfaSecret: true, mfaEnabled: true, mfaRecoveryCodes: true } });
  if (!user?.mfaEnabled || !user.mfaSecret) return NextResponse.json({ error: "MFA not enabled" }, { status: 400 });

  let verified = false;
  if (parsed.data.useRecoveryCode) {
    const hashes: string[] = JSON.parse(user.mfaRecoveryCodes || "[]");
    verified = (await verifyRecoveryCode(parsed.data.code, hashes)) !== -1;
  } else {
    verified = verifyTOTP(decryptSecret(user.mfaSecret), parsed.data.code);
  }

  if (!verified) return NextResponse.json({ error: "Invalid code" }, { status: 400 });

  resetRateLimit(rlKey);
  await prisma.user.update({ where: { id: session.user.id }, data: { mfaEnabled: false, mfaSecret: null, mfaRecoveryCodes: null, mfaVerifiedAt: null } });
  await logAction({ action: "SETTINGS_UPDATED", actorId: session.user.id, metadata: { change: "mfa_disabled", method: parsed.data.useRecoveryCode ? "recovery" : "totp" }, ...getRequestContext(req) });
  return NextResponse.json({ disabled: true });
}
