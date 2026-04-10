import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateTOTPSecret, generateRecoveryCodes, verifyTOTP, encryptSecret, decryptSecret } from "@/lib/mfa";
import { logAction } from "@/lib/audit";
import QRCode from "qrcode";
import { z } from "zod";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { mfaEnabled: true, email: true },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (user.mfaEnabled) return NextResponse.json({ error: "MFA already enabled", mfaEnabled: true }, { status: 400 });

  const { secret, uri } = generateTOTPSecret(user.email);
  const qrCodeDataUrl = await QRCode.toDataURL(uri);

  await prisma.user.update({
    where: { id: session.user.id },
    data: { mfaSecret: encryptSecret(secret) },
  });

  return NextResponse.json({ qrCode: qrCodeDataUrl, secret, uri });
}

const confirmSchema = z.object({ code: z.string().regex(/^\d{6}$/, "Must be 6 digits") });

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = confirmSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Code must be 6 digits" }, { status: 400 });

  try {
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUniqueOrThrow({ where: { id: session.user.id }, select: { mfaSecret: true, mfaEnabled: true } });
      if (user.mfaEnabled) return { alreadyEnabled: true };
      if (!user.mfaSecret) throw new Error("No MFA setup in progress");

      const rawSecret = decryptSecret(user.mfaSecret);
      if (!verifyTOTP(rawSecret, parsed.data.code)) throw new Error("Invalid code. Check your authenticator and try again.");

      const { plaintext, hashed } = await generateRecoveryCodes();
      await tx.user.update({
        where: { id: session.user.id },
        data: { mfaEnabled: true, mfaRecoveryCodes: JSON.stringify(hashed), mfaVerifiedAt: new Date() },
      });
      return { alreadyEnabled: false, recoveryCodes: plaintext };
    });

    if (result.alreadyEnabled) return NextResponse.json({ enabled: true });

    await logAction({ action: "SETTINGS_UPDATED", actorId: session.user.id, metadata: { change: "mfa_enabled" } });
    return NextResponse.json({ enabled: true, recoveryCodes: result.recoveryCodes });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Setup failed" }, { status: 400 });
  }
}
