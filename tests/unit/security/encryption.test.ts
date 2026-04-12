import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("encryption", () => {
  const VALID_KEY_HEX = "a".repeat(64); // 64 hex chars = 32 bytes

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    delete process.env.ENCRYPTION_KEY;
  });

  it("encrypt + decrypt roundtrips correctly", async () => {
    process.env.ENCRYPTION_KEY = VALID_KEY_HEX;
    const { encrypt, decrypt } = await import("@/lib/encryption");

    const plaintext = "JBSWY3DPEHPK3PXP";
    const encrypted = encrypt(plaintext);
    expect(encrypted).not.toBe(plaintext);
    expect(encrypted.split(":")).toHaveLength(3);

    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe(plaintext);
  });

  it("isEncrypted correctly identifies encrypted strings", async () => {
    process.env.ENCRYPTION_KEY = VALID_KEY_HEX;
    const { encrypt, isEncrypted } = await import("@/lib/encryption");

    const encrypted = encrypt("test");
    expect(isEncrypted(encrypted)).toBe(true);
    expect(isEncrypted("plaintext")).toBe(false);
    expect(isEncrypted("short:bad")).toBe(false);
  });

  it("safeEncrypt throws when ENCRYPTION_KEY is missing", async () => {
    delete process.env.ENCRYPTION_KEY;
    const { safeEncrypt } = await import("@/lib/encryption");

    expect(() => safeEncrypt("secret")).toThrow("ENCRYPTION_KEY");
  });

  it("safeEncrypt throws when ENCRYPTION_KEY is invalid length", async () => {
    process.env.ENCRYPTION_KEY = "tooshort";
    const { safeEncrypt } = await import("@/lib/encryption");

    // AES-256 requires exactly 32 bytes; an 8-char UTF-8 key should fail
    expect(() => safeEncrypt("secret")).toThrow();
  });

  it("safeDecrypt handles legacy unencrypted values", async () => {
    process.env.ENCRYPTION_KEY = VALID_KEY_HEX;
    const { safeDecrypt } = await import("@/lib/encryption");

    // Unencrypted value should be returned as-is
    expect(safeDecrypt("JBSWY3DPEHPK3PXP")).toBe("JBSWY3DPEHPK3PXP");
  });

  it("safeDecrypt decrypts valid encrypted values", async () => {
    process.env.ENCRYPTION_KEY = VALID_KEY_HEX;
    const { safeEncrypt, safeDecrypt } = await import("@/lib/encryption");

    const original = "MY_TOTP_SECRET";
    const encrypted = safeEncrypt(original);
    expect(safeDecrypt(encrypted)).toBe(original);
  });

  it("different IVs produce different ciphertexts", async () => {
    process.env.ENCRYPTION_KEY = VALID_KEY_HEX;
    const { encrypt, decrypt } = await import("@/lib/encryption");

    const plaintext = "same-plaintext";
    const e1 = encrypt(plaintext);
    const e2 = encrypt(plaintext);
    expect(e1).not.toBe(e2); // Random IV
    expect(decrypt(e1)).toBe(plaintext);
    expect(decrypt(e2)).toBe(plaintext);
  });

  it("tampered ciphertext fails authentication", async () => {
    process.env.ENCRYPTION_KEY = VALID_KEY_HEX;
    const { encrypt, decrypt } = await import("@/lib/encryption");

    const encrypted = encrypt("secret");
    const [iv, authTag, ciphertext] = encrypted.split(":");
    const tampered = `${iv}:${authTag}:${"ff".repeat(ciphertext.length / 2)}`;

    expect(() => decrypt(tampered)).toThrow();
  });
});
