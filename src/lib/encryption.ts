import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;

function getKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error("ENCRYPTION_KEY environment variable is not set");
  }
  return key.length === 64 ? Buffer.from(key, "hex") : Buffer.from(key, "utf-8");
}

export function encrypt(plaintext: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}

export function decrypt(encryptedData: string): string {
  const key = getKey();
  const [ivHex, authTagHex, ciphertext] = encryptedData.split(":");
  if (!ivHex || !authTagHex || !ciphertext) throw new Error("Invalid encrypted data");
  const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(authTagHex, "hex"));
  let decrypted = decipher.update(ciphertext, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

export function isEncrypted(value: string): boolean {
  const parts = value.split(":");
  return parts.length === 3 && parts[0].length === IV_LENGTH * 2;
}

export function safeEncrypt(plaintext: string): string {
  try { return encrypt(plaintext); } catch { return plaintext; }
}

export function safeDecrypt(stored: string): string {
  try { return isEncrypted(stored) ? decrypt(stored) : stored; } catch { return stored; }
}
