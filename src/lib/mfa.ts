import * as OTPAuth from "otpauth";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { safeEncrypt, safeDecrypt } from "./encryption";

const ISSUER = "PMF Capital";

export function generateTOTPSecret(email: string) {
  const totp = new OTPAuth.TOTP({
    issuer: ISSUER,
    label: email,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
  });
  return { secret: totp.secret.base32, uri: totp.toString() };
}

export function encryptSecret(secret: string): string {
  return safeEncrypt(secret);
}

export function decryptSecret(stored: string): string {
  return safeDecrypt(stored);
}

export function verifyTOTP(secret: string, token: string): boolean {
  const totp = new OTPAuth.TOTP({
    issuer: ISSUER,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(secret),
  });
  return totp.validate({ token, window: 1 }) !== null;
}

export async function generateRecoveryCodes(): Promise<{ plaintext: string[]; hashed: string[] }> {
  const codes: string[] = [];
  for (let i = 0; i < 8; i++) {
    // 16 bytes = 128-bit entropy, formatted as two 8-char hex groups for readability
    const raw = crypto.randomBytes(16).toString("hex").toUpperCase();
    codes.push(`${raw.slice(0, 8)}-${raw.slice(8, 16)}-${raw.slice(16, 24)}-${raw.slice(24, 32)}`);
  }
  const hashed = await Promise.all(codes.map((c) => bcrypt.hash(c.replace(/-/g, ""), 12)));
  return { plaintext: codes, hashed };
}

export async function verifyRecoveryCode(code: string, hashedCodes: string[]): Promise<number> {
  // Strip dashes and normalize to uppercase for comparison
  const normalized = code.replace(/-/g, "").toUpperCase();
  let matchIndex = -1;
  for (let i = 0; i < hashedCodes.length; i++) {
    const match = await bcrypt.compare(normalized, hashedCodes[i]);
    if (match && matchIndex === -1) matchIndex = i;
  }
  return matchIndex;
}

export async function isMFARequired(
  db: { systemSetting: { findUnique: (args: { where: { key: string } }) => Promise<{ value: string } | null> } }
): Promise<boolean> {
  const setting = await db.systemSetting.findUnique({ where: { key: "mfa_required" } });
  return setting?.value === "true";
}
